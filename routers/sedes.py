from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Sede
from schemas.SedeBase import SedeCreada, SedeSalida

router = APIRouter(prefix="/sedes", tags=["Sedes"])

@router.get("/")
async def get_sedes(db: Session = Depends(get_db)):
    sedes = db.query(Sede).all()
    return sedes

@router.get("/{id}")
async def obtener_sede(id: int, db: Session = Depends(get_db)):
    sede = db.query(Sede).filter(Sede.ID_sede == id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    return {"message": f"Sede con ID {id}", "sede": sede}

@router.post("/", response_model=SedeSalida)
async def crear_sede(sede: SedeCreada, db: Session = Depends(get_db)):
    sede_existente = db.query(Sede).filter(Sede.nombre_sede == sede.nombre_sede).first()
    if sede_existente:
        raise HTTPException(status_code=400, detail="La sede ya existe")

    nueva_sede = Sede(nombre_sede=sede.nombre_sede)
    db.add(nueva_sede)
    db.commit()
    db.refresh(nueva_sede)
    return nueva_sede

@router.put("/{id}", response_model=SedeSalida)
async def actualizar_sede(id: int, sede: SedeCreada, db: Session = Depends(get_db)):
    sede_existente = db.query(Sede).filter(Sede.ID_sede == id).first()
    if not sede_existente:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    sede_existente.nombre_sede = sede.nombre_sede
    db.commit()
    db.refresh(sede_existente)
    return sede_existente

@router.delete("/{id}")
async def eliminar_sede(id: int, db: Session = Depends(get_db)):
    sede_existente = db.query(Sede).filter(Sede.ID_sede == id).first()
    if not sede_existente:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    db.delete(sede_existente)
    db.commit()
    return {"message": f"Sede con ID {id} eliminada exitosamente"}