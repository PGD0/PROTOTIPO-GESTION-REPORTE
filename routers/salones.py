from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Salon
from schemas.SalonBase import SalonCreado, SalonSalida

router = APIRouter(prefix="/salones", tags=["Salones"])

@router.get("/")
async def get_salones(db: Session = Depends(get_db)):
    salones = db.query(Salon).all()
    return salones

@router.get("/{id}")
async def obtener_salon(id: int, db: Session = Depends(get_db)):
    salon = db.query(Salon).filter(Salon.ID_salon == id).first()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    return {"message": f"Salon con ID {id}", "salon": salon}

@router.post("/", response_model=SalonSalida)
async def crear_salon(salon: SalonCreado, db: Session = Depends(get_db)):
    salon_existente = db.query(Salon).filter(
        Salon.codigo_salon == salon.codigo_salon,
        Salon.sede == salon.sede,
        Salon.bloque == salon.bloque
    ).first()
    if salon_existente:
        raise HTTPException(status_code=400, detail="El salon ya existe")

    nuevo_salon = Salon(codigo_salon=salon.codigo_salon, sede=salon.sede, bloque=salon.bloque)
    db.add(nuevo_salon)
    db.commit()
    db.refresh(nuevo_salon)
    return nuevo_salon

@router.put("/{id}", response_model=SalonSalida)
async def actualizar_salon(id: int, salon: SalonCreado, db: Session = Depends(get_db)):
    salon_existente = db.query(Salon).filter(Salon.ID_salon == id).first()
    if not salon_existente:
        raise HTTPException(status_code=404, detail="Salon no encontrado")

    salon_existente.codigo_salon = salon.codigo_salon
    salon_existente.sede = salon.sede
    salon_existente.bloque = salon.bloque
    db.commit()
    db.refresh(salon_existente)
    return salon_existente

@router.delete("/{id}")
async def eliminar_salon(id: int, db: Session = Depends(get_db)):
    salon_existente = db.query(Salon).filter(Salon.ID_salon == id).first()
    if not salon_existente:
        raise HTTPException(status_code=404, detail="Salon no encontrado")

    db.delete(salon_existente)
    db.commit()
    return {"message": f"Salon con ID {id} eliminado exitosamente"}

@router.get("/por_sede/{sede_id}")
async def salones_por_sede(sede_id: int, db: Session = Depends(get_db)):
    from models.models import Bloque

    if sede_id == 2:
        salones = db.query(Salon).filter(Salon.bloque_id != None, Salon.sede == sede_id).all()
    else:
        salones = db.query(Salon).filter(Salon.sede == sede_id).all()

    return salones

@router.get("/por_bloque/{bloque_id}")
async def get_salones_por_bloque(bloque_id: int, db: Session = Depends(get_db)):
    salones = db.query(Salon).filter(Salon.bloque == bloque_id).all()
    return salones