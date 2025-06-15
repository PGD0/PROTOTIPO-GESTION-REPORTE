from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from schemas.ReporteBase import ReporteSalida, ReporteActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Reporte
from services.cloudinary import subir_imagen
import shutil
import os
import uuid

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.get("/")
async def get_reportes(db: Session = Depends(get_db)):
    reportes = db.query(Reporte).all()
    if not reportes:
        raise HTTPException(status_code=404, detail="No se encontraron reportes")
    return reportes

@router.get("/{id}")
async def obtener_reporte(id: int, db: Session = Depends(get_db)):
    reporte = db.query(Reporte).filter(Reporte.ID_reporte == id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return {"message": f"Reporte con ID {id}", "reporte": reporte}

@router.post("/", response_model=ReporteSalida)
async def crear_reporte(
    ID_equipo: int = Form(...),
    descripcion: str = Form(...),
    estado_equipo: str = Form(...),
    ID_usuario: int = Form(...),
    resuelto: bool = Form(False),
    fecha_solucion: Optional[datetime] = Form(None),
    imagen: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    existe = db.query(Reporte).filter(Reporte.ID_equipo == ID_equipo, Reporte.resuelto == False).first()
    if existe:
        raise HTTPException(status_code=400, detail="El equipo ya tiene un reporte activo")
    
    os.makedirs("temp", exist_ok=True)
    temp_filename = f"temp/{uuid.uuid4().hex}_{imagen.filename}"

    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(imagen.file, buffer)

    with open(temp_filename, "rb") as file_data:
        url_imagen = subir_imagen(file_data)

    os.remove(temp_filename)

    nuevo_reporte = Reporte(
        ID_equipo=ID_equipo,
        descripcion=descripcion,
        img_equipo=url_imagen,
        estado_equipo=estado_equipo,
        fecha_solucion=fecha_solucion,
        resuelto=resuelto,
        ID_usuario=ID_usuario,
    )

    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)

    return nuevo_reporte


@router.put("/{id}", response_model=ReporteSalida)
async def actualizar_reporte(id: int, reporte: ReporteActualizar, db: Session = Depends(get_db)):
    reporte_existente = db.query(Reporte).filter(Reporte.ID_reporte == id).first()
    if not reporte_existente:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")

    for key, value in reporte.dict(exclude_unset=True).items():
        setattr(reporte_existente, key, value)

    db.commit()
    db.refresh(reporte_existente)
    return reporte_existente

@router.delete("/{id}")
async def eliminar_reporte(id: int, db: Session = Depends(get_db)):
    reporte_existente = db.query(Reporte).filter(Reporte.ID_reporte == id).first()
    if not reporte_existente:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")

    db.delete(reporte_existente)
    db.commit()
    return {"message": f"Reporte con ID {id} eliminado exitosamente"}