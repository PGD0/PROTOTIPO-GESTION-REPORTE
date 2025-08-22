from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Rol
from schemas.RolBase import RolCreado, RolSalida

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("/")
async def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Rol).all()
    if not roles:
        raise HTTPException(status_code=404, detail="No se encontraron roles")
    return roles

@router.get("/{id}")
async def obtener_rol(id: int, db: Session = Depends(get_db)):
    rol = db.query(Rol).filter(Rol.ID_rol == id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return {"message": f"Rol con ID {id}", "rol": rol}

@router.post("/", response_model=RolSalida)
async def crear_rol(rol: RolCreado, db: Session = Depends(get_db)):
    rol_existente = db.query(Rol).filter(Rol.tipo_rol == rol.tipo_rol).first()
    if rol_existente:
        raise HTTPException(status_code=400, detail="El rol ya existe")
    
    nuevo_rol = Rol(tipo_rol=rol.tipo_rol)
    db.add(nuevo_rol)
    db.commit()
    db.refresh(nuevo_rol)
    return nuevo_rol