from fastapi import APIRouter, Depends, HTTPException
from schemas.EquipoBase import EquipoCreado, EquipoSalida, EquipoActualizar
from sqlalchemy.orm import Session, joinedload
from database.database import get_db
from models.models import Equipo, Salon, Sede, Bloque

router = APIRouter(prefix="/equipos", tags=["Equipos"])

@router.get("/")
async def get_equipos(db: Session = Depends(get_db)):
    equipos = db.query(Equipo).options(
        joinedload(Equipo.sede_rel),
        joinedload(Equipo.salon_rel).joinedload(Salon.bloque_rel)
    ).all()

    resultado = []
    for e in equipos:
        resultado.append({
            "ID_equipo": e.ID_equipo,
            "codigo_barras": e.codigo_barras,
            "marca": e.marca,
            "funcional": e.funcional,
            "fecha_registro": e.fecha_registro,
            "sede": e.sede_rel.nombre_sede if e.sede_rel else None,
            "salon": e.salon_rel.codigo_salon if e.salon_rel else None,
            "bloque": e.salon_rel.bloque_rel.nombre_bloque if e.salon_rel and e.salon_rel.bloque_rel else None
        })

    return resultado

@router.get("/{id}")
async def obtener_equipo(id: int, db: Session = Depends(get_db)):
    equipo = db.query(Equipo).filter(Equipo.ID_equipo == id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return {
        "ID_equipo": equipo.ID_equipo,
        "codigo_barras": equipo.codigo_barras,
        "marca": equipo.marca,
        "funcional": equipo.funcional,
        "fecha_registro": equipo.fecha_registro,
        "sede": equipo.sede_rel.nombre_sede if equipo.sede_rel else None,
        "sede_id": equipo.sede_rel.ID_sede if equipo.sede_rel else None,
        "salon": equipo.salon_rel.codigo_salon if equipo.salon_rel else None,
        "salon_id": equipo.salon_rel.ID_salon if equipo.salon_rel else None,
        "bloque": equipo.salon_rel.bloque_rel.nombre_bloque if equipo.salon_rel and equipo.salon_rel.bloque_rel else None,
        "bloque_id": equipo.salon_rel.bloque_rel.ID_bloque if equipo.salon_rel and equipo.salon_rel.bloque_rel else None,
    }


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