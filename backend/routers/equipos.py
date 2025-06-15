from fastapi import APIRouter, Depends, HTTPException
from schemas.EquipoBase import EquipoCreado, EquipoSalida, EquipoActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Equipo

router = APIRouter(prefix="/equipos", tags=["Equipos"])

@router.get("/")
async def get_equipos(db: Session = Depends(get_db)):
    equipos = db.query(Equipo).all()
    if not equipos:
        raise HTTPException(status_code=404, detail="No se encontraron equipos")
    return equipos

@router.get("/{id}")
async def obtener_equipo(id: int, db: Session = Depends(get_db)):
    equipo = db.query(Equipo).filter(Equipo.ID_equipo == id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return {"message": f"Equipo con ID {id}", "equipo": equipo}

@router.post("/", response_model=EquipoSalida)
async def crear_equipo(equipo: EquipoCreado, db: Session = Depends(get_db)):
    equipo_existente = db.query(Equipo).filter(Equipo.codigo_barras == equipo.codigo_barras).first()
    if equipo_existente:
        raise HTTPException(status_code=400, detail="El equipo ya existe")

    nuevo_equipo = Equipo(
        codigo_barras=equipo.codigo_barras,
        marca=equipo.marca,
        sede=equipo.sede,
        salon=equipo.salon,
        funcional=equipo.funcional,
    )
    db.add(nuevo_equipo)
    db.commit()
    db.refresh(nuevo_equipo)
    return nuevo_equipo

@router.put("/{id}", response_model=EquipoSalida)
async def actualizar_equipo(id: int, equipo: EquipoActualizar, db: Session = Depends(get_db)):
    equipo_existente = db.query(Equipo).filter(Equipo.ID_equipo == id).first()
    if not equipo_existente:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    for key, value in equipo.dict(exclude_unset=True).items():
        setattr(equipo_existente, key, value)

    db.commit()
    db.refresh(equipo_existente)
    return equipo_existente

@router.delete("/{id}")
async def eliminar_equipo(id: int, db: Session = Depends(get_db)):
    equipo_existente = db.query(Equipo).filter(Equipo.ID_equipo == id).first()
    if not equipo_existente:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    db.delete(equipo_existente)
    db.commit()
    return {"message": f"Equipo con ID {id} eliminado exitosamente"}