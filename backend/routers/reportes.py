from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from schemas.ReporteBase import ReporteSalida, ReporteActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Reporte, Usuario, Equipo
from services.cloudinary import subir_imagen
from services.email_service import enviar_notificacion_equipo_arreglado
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

@router.get("/usuario/{id}/ultimos", response_model=list[ReporteSalida])
async def obtener_ultimos_reportes_usuario(id: int, db: Session = Depends(get_db)):
    reportes = (
        db.query(Reporte)
        .filter(Reporte.ID_usuario == id)
        .order_by(Reporte.fecha_registro.desc())
        .limit(10)
        .all()
    )
    return reportes

@router.post("/{id}/notificar-usuario")
async def notificar_usuario_equipo_arreglado(id: int, db: Session = Depends(get_db)):
    """
    Notifica al usuario que su equipo ha sido reparado
    """
    # Obtener el reporte
    reporte = db.query(Reporte).filter(Reporte.ID_reporte == id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    # Verificar que el reporte esté resuelto
    if not reporte.resuelto:
        raise HTTPException(status_code=400, detail="El reporte debe estar resuelto para notificar al usuario")
    
    # Obtener información del usuario
    usuario = db.query(Usuario).filter(Usuario.ID_usuarios == reporte.ID_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Obtener información del equipo
    equipo = db.query(Equipo).filter(Equipo.ID_equipo == reporte.ID_equipo).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    # Construir ubicación
    ubicacion = f"Sede {equipo.sede}, Salón {equipo.salon}" if equipo.sede and equipo.salon else "Ubicación no especificada"
    
    # Enviar notificación por correo
    try:
        resultado = await enviar_notificacion_equipo_arreglado(
            email_usuario=usuario.email,
            nombre_usuario=f"{usuario.nombre} {usuario.apellido or ''}".strip(),
            codigo_equipo=equipo.codigo_barras or "Sin código",
            ubicacion=ubicacion,
            descripcion_problema=reporte.descripcion
        )
        
        if resultado["success"]:
            return {
                "success": True,
                "message": "Notificación enviada correctamente al usuario",
                "email": usuario.email,
                "usuario": f"{usuario.nombre} {usuario.apellido or ''}".strip()
            }
        else:
            raise HTTPException(status_code=500, detail=f"Error al enviar notificación: {resultado['message']}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar notificación: {str(e)}")

@router.put("/{id}/marcar-resuelto")
async def marcar_reporte_resuelto(id: int, db: Session = Depends(get_db)):
    """
    Marca un reporte como resuelto
    """
    reporte = db.query(Reporte).filter(Reporte.ID_reporte == id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    # Marcar como resuelto
    reporte.resuelto = True
    reporte.estado_equipo = "Solucionado"
    reporte.fecha_solucion = datetime.now()
    
    db.commit()
    db.refresh(reporte)
    
    return {
        "success": True,
        "message": "Reporte marcado como resuelto",
        "reporte": reporte
    }