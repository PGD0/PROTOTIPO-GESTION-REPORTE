from fastapi import FastAPI
from database.database import engine, Base
from models.models import Usuario, Rol, Sede, Salon, Equipo, Reporte
from routers import usuarios, roles, sedes, salones, equipos, reportes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestión Reporte API",
    description="API para el sistema de gestión de reportes",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}

app.include_router(usuarios.router)
app.include_router(roles.router)
app.include_router(sedes.router)
app.include_router(salones.router)
app.include_router(equipos.router)
app.include_router(reportes.router)