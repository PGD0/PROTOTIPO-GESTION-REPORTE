from fastapi import APIRouter, Depends, HTTPException
from schemas.ReporteBase import ReporteCreado, ReporteSalida, ReporteActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Reporte

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
async def crear_reporte(reporte: ReporteCreado, db: Session = Depends(get_db)):
    reporte_existente = db.query(Reporte).filter(Reporte.ID_equipo == reporte.ID_equipo).first()
    if reporte_existente:
        raise HTTPException(status_code=400, detail="El equipo ya tiene un reporte activo")

    nuevo_reporte = Reporte(
        ID_equipo=reporte.ID_equipo,
        descripcion=reporte.descripcion,
        img_equipo=reporte.img_equipo,
        fecha_solucion=reporte.fecha_solucion,
        estado_equipo=reporte.estado_equipo,
        resuelto=reporte.resuelto,
        ID_usuario=reporte.ID_usuario,
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