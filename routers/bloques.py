from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Bloque
from schemas.BloqueBase import BloqueCreado, BloqueSalida
from typing import List

router = APIRouter(prefix="/bloques", tags=["Bloques"])

@router.get("/", response_model=List[BloqueSalida])
async def get_bloques(db: Session = Depends(get_db)):
    bloques = db.query(Bloque).all()
    return bloques

@router.get("/{id}", response_model=BloqueSalida)
async def obtener_bloque(id: int, db: Session = Depends(get_db)):
    bloque = db.query(Bloque).filter(Bloque.ID_bloque == id).first()
    if not bloque:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")
    return bloque

@router.post("/", response_model=BloqueSalida)
async def crear_bloque(bloque: BloqueCreado, db: Session = Depends(get_db)):
    bloque_existente = db.query(Bloque).filter(Bloque.nombre_bloque == bloque.nombre_bloque, Bloque.sede_id == bloque.sede_id).first()
    if bloque_existente:
        raise HTTPException(status_code=400, detail="El bloque ya existe en esta sede")
    nuevo_bloque = Bloque(nombre_bloque=bloque.nombre_bloque, sede_id=bloque.sede_id)
    db.add(nuevo_bloque)
    db.commit()
    db.refresh(nuevo_bloque)
    return nuevo_bloque

@router.put("/{id}", response_model=BloqueSalida)
async def actualizar_bloque(id: int, bloque: BloqueCreado, db: Session = Depends(get_db)):
    bloque_existente = db.query(Bloque).filter(Bloque.ID_bloque == id).first()
    if not bloque_existente:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")
    # Verificar duplicado si cambia nombre o sede
    duplicado = db.query(Bloque).filter(Bloque.nombre_bloque == bloque.nombre_bloque, Bloque.sede_id == bloque.sede_id, Bloque.ID_bloque != id).first()
    if duplicado:
        raise HTTPException(status_code=400, detail="Ya existe un bloque con ese nombre en la sede")
    bloque_existente.nombre_bloque = bloque.nombre_bloque
    bloque_existente.sede_id = bloque.sede_id
    db.commit()
    db.refresh(bloque_existente)
    return bloque_existente

@router.delete("/{id}")
async def eliminar_bloque(id: int, db: Session = Depends(get_db)):
    bloque = db.query(Bloque).filter(Bloque.ID_bloque == id).first()
    if not bloque:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")
    db.delete(bloque)
    db.commit()
    return {"message": f"Bloque con ID {id} eliminado exitosamente"} 

@router.get("/por_sede/{sede_id}", response_model=List[BloqueSalida])
async def obtener_bloques_por_sede(sede_id: int, db: Session = Depends(get_db)):
    bloques = db.query(Bloque).filter(Bloque.sede_id == sede_id).all()
    return bloques