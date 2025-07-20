from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database.database import get_db
from models import models
from datetime import datetime
from services.jwt import obtener_usuario_actual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/reportes-estado")
def reportes_estado(db: Session = Depends(get_db)):
    resueltos = db.query(func.count()).select_from(models.Reporte).filter(models.Reporte.resuelto == True).scalar()
    pendientes = db.query(func.count()).select_from(models.Reporte).filter(models.Reporte.resuelto == False).scalar()
    return {"resueltos": resueltos, "pendientes": pendientes}


@router.get("/reportes-por-sede")
def reportes_por_sede(db: Session = Depends(get_db)):
    data = (
        db.query(models.Sede.nombre_sede, func.count(models.Reporte.ID_reporte))
        .join(models.Equipo, models.Equipo.sede == models.Sede.ID_sede)
        .join(models.Reporte, models.Reporte.ID_equipo == models.Equipo.ID_equipo)
        .group_by(models.Sede.nombre_sede)
        .all()
    )
    return [{"sede": sede, "cantidad": cantidad} for sede, cantidad in data]


@router.get("/equipos-estado")
def equipos_estado(db: Session = Depends(get_db)):
    funcionales = db.query(func.count()).select_from(models.Equipo).filter(models.Equipo.funcional == True).scalar()
    no_funcionales = db.query(func.count()).select_from(models.Equipo).filter(models.Equipo.funcional == False).scalar()
    return {"funcionales": funcionales, "no_funcionales": no_funcionales}


@router.get("/usuarios-por-rol")
def usuarios_por_rol(db: Session = Depends(get_db)):
    data = (
        db.query(models.Rol.tipo_rol, func.count(models.Usuario.ID_usuarios))
        .join(models.Usuario, models.Usuario.rol == models.Rol.ID_rol)
        .group_by(models.Rol.tipo_rol)
        .all()
    )
    return [{"rol": rol, "cantidad": cantidad} for rol, cantidad in data]


@router.get("/equipos-por-salon")
def equipos_por_salon(db: Session = Depends(get_db)):
    data = (
        db.query(models.Salon.codigo_salon, func.count(models.Equipo.ID_equipo))
        .join(models.Equipo, models.Equipo.salon == models.Salon.ID_salon)
        .group_by(models.Salon.codigo_salon)
        .all()
    )
    return [{"salon": salon, "cantidad": cantidad} for salon, cantidad in data]


@router.get("/reportes-por-mes")
def reportes_por_mes(db: Session = Depends(get_db)):
    current_year = datetime.now().year
    data = (
        db.query(extract("month", models.Reporte.fecha_registro), func.count(models.Reporte.ID_reporte))
        .filter(extract("year", models.Reporte.fecha_registro) == current_year)
        .group_by(extract("month", models.Reporte.fecha_registro))
        .order_by(extract("month", models.Reporte.fecha_registro))
        .all()
    )
    return [{"mes": int(mes), "cantidad": cantidad} for mes, cantidad in data]

@router.get("/usuario/reportes-estado")
def reportes_estado_usuario(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):
    resueltos = db.query(func.count()).select_from(models.Reporte)\
        .filter(models.Reporte.resuelto == True, models.Reporte.ID_usuario == usuario["id"])\
        .scalar()

    pendientes = db.query(func.count()).select_from(models.Reporte)\
        .filter(models.Reporte.resuelto == False, models.Reporte.ID_usuario == usuario["id"])\
        .scalar()

    return {"resueltos": resueltos, "pendientes": pendientes}


@router.get("/usuario/reportes-mensuales")
def reportes_mensuales_usuario(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):
    current_year = datetime.now().year
    data = (
        db.query(extract("month", models.Reporte.fecha_registro), func.count(models.Reporte.ID_reporte))
        .filter(models.Reporte.ID_usuario == usuario["id"])
        .filter(extract("year", models.Reporte.fecha_registro) == current_year)
        .group_by(extract("month", models.Reporte.fecha_registro))
        .order_by(extract("month", models.Reporte.fecha_registro))
        .all()
    )

    meses_map = {
        1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
        7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    }

    return {meses_map.get(mes, f"Mes {mes}"): cantidad for mes, cantidad in data}


@router.get("/usuario/equipos-total")
def equipos_usuario_total(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):
    total = db.query(models.Equipo.ID_equipo)\
        .join(models.Reporte)\
        .filter(models.Reporte.ID_usuario == usuario["id"])\
        .distinct().count()

    return {"total": total}


@router.get("/usuario/ultimos-reportes")
def ultimos_reportes_usuario(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):
    reportes = (
        db.query(models.Reporte)
        .filter(models.Reporte.ID_usuario == usuario["id"])
        .order_by(models.Reporte.fecha_registro.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": r.ID_reporte,
            "descripcion": r.descripcion,
            "estado": "Resuelto" if r.resuelto else "Pendiente",
            "fecha": r.fecha_registro,
            "sede": r.equipo.sede_rel.nombre_sede if r.equipo and r.equipo.sede_rel else "Sin sede",
            "salon": r.equipo.salon_rel.codigo_salon if r.equipo and r.equipo.salon_rel else "Sin salón"
        }
        for r in reportes
    ]