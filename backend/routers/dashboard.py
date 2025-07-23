from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from database.database import get_db
from models import models
from services.jwt import obtener_usuario_actual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def obtener_dashboard(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):
    rol = usuario["rol"]
    id_usuario = usuario["id"]
    current_year = datetime.now().year

    dashboard_data = {
        "rol": rol,
    }

    if rol == 1:
        dashboard_data["resueltos"] = db.query(func.count()).select_from(models.Reporte).filter(models.Reporte.resuelto == True).scalar()
        dashboard_data["pendientes"] = db.query(func.count()).select_from(models.Reporte).filter(models.Reporte.resuelto == False).scalar()
    else:
        dashboard_data["resueltos"] = db.query(func.count()).select_from(models.Reporte)\
            .filter(models.Reporte.resuelto == True, models.Reporte.ID_usuario == id_usuario).scalar()
        dashboard_data["pendientes"] = db.query(func.count()).select_from(models.Reporte)\
            .filter(models.Reporte.resuelto == False, models.Reporte.ID_usuario == id_usuario).scalar()

    if rol == 1:
        # Usuarios por rol
        usuarios_por_rol = (
            db.query(models.Rol.tipo_rol, func.count(models.Usuario.ID_usuarios))
            .join(models.Usuario, models.Usuario.rol == models.Rol.ID_rol)
            .group_by(models.Rol.tipo_rol)
            .all()
        )
        dashboard_data["usuarios_por_rol"] = [{"rol": r, "cantidad": c} for r, c in usuarios_por_rol]

        # Equipos por estado
        dashboard_data["equipos_funcionales"] = db.query(func.count()).select_from(models.Equipo).filter(models.Equipo.funcional == True).scalar()
        dashboard_data["equipos_no_funcionales"] = db.query(func.count()).select_from(models.Equipo).filter(models.Equipo.funcional == False).scalar()

        # Reportes por sede
        data_sede = (
            db.query(models.Sede.nombre_sede, func.count(models.Reporte.ID_reporte))
            .join(models.Equipo, models.Equipo.sede == models.Sede.ID_sede)
            .join(models.Reporte, models.Reporte.ID_equipo == models.Equipo.ID_equipo)
            .group_by(models.Sede.nombre_sede)
            .all()
        )
        dashboard_data["reportes_por_sede"] = [{"sede": sede, "cantidad": cantidad} for sede, cantidad in data_sede]

        # Equipos por salón
        data_salon = (
            db.query(models.Salon.codigo_salon, func.count(models.Equipo.ID_equipo))
            .join(models.Equipo, models.Equipo.salon == models.Salon.ID_salon)
            .group_by(models.Salon.codigo_salon)
            .all()
        )
        dashboard_data["equipos_por_salon"] = [{"salon": salon, "cantidad": cantidad} for salon, cantidad in data_salon]

        # Reportes por mes
        data_mes = (
            db.query(extract("month", models.Reporte.fecha_registro), func.count(models.Reporte.ID_reporte))
            .filter(extract("year", models.Reporte.fecha_registro) == current_year)
            .group_by(extract("month", models.Reporte.fecha_registro))
            .order_by(extract("month", models.Reporte.fecha_registro))
            .all()
        )
        dashboard_data["reportes_por_mes"] = [{"mes": int(m), "cantidad": c} for m, c in data_mes]

    else:
        # Reportes mensuales del usuario
        data_user_mes = (
            db.query(extract("month", models.Reporte.fecha_registro), func.count(models.Reporte.ID_reporte))
            .filter(models.Reporte.ID_usuario == id_usuario)
            .filter(extract("year", models.Reporte.fecha_registro) == current_year)
            .group_by(extract("month", models.Reporte.fecha_registro))
            .order_by(extract("month", models.Reporte.fecha_registro))
            .all()
        )
        meses_map = {
            1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
            7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
        }
        dashboard_data["reportes_mensuales"] = {meses_map.get(m, f"Mes {m}"): c for m, c in data_user_mes}

        # Total de equipos reportados por el usuario
        dashboard_data["equipos_reportados"] = db.query(models.Equipo.ID_equipo)\
            .join(models.Reporte)\
            .filter(models.Reporte.ID_usuario == id_usuario)\
            .distinct().count()

        # Últimos reportes del usuario
        ultimos_reportes = (
            db.query(models.Reporte)
            .filter(models.Reporte.ID_usuario == id_usuario)
            .order_by(models.Reporte.fecha_registro.desc())
            .limit(5)
            .all()
        )

        dashboard_data["ultimos_reportes"] = [
            {
                "id": r.ID_reporte,
                "descripcion": r.descripcion,
                "estado": "Resuelto" if r.resuelto else "Pendiente",
                "fecha": r.fecha_registro,
                "sede": r.equipo.sede_rel.nombre_sede if r.equipo and r.equipo.sede_rel else "Sin sede",
                "salon": r.equipo.salon_rel.codigo_salon if r.equipo and r.equipo.salon_rel else "Sin salón"
            }
            for r in ultimos_reportes
        ]

    return dashboard_data
