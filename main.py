from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base, get_db
from models.models import Usuario, Rol, Sede, Salon, Equipo, Reporte
from routers import usuarios, roles, sedes, salones, equipos, reportes, auth, bloques, dashboard
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestión Reporte API",
    description="API para el sistema de gestión de reportes",
    version="1.0.0"
)

origins = [
    "https://pgd0.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}

def init_db():
    db = next(get_db())
    try:
        if db.query(Rol).count() == 0:
            admin_rol = Rol(tipo_rol="Administrador")
            user_rol = Rol(tipo_rol="Usuario")
            profesor_rol = Rol(tipo_rol="Profesor")
            db.add(admin_rol)
            db.add(user_rol)
            db.add(profesor_rol)
            db.commit()
            print("Roles inicializados")
    except Exception as e:
        print(f"Error inicializando roles: {e}")
    finally:
        db.close()

init_db()

app.include_router(dashboard.router)
app.include_router(usuarios.router)
app.include_router(roles.router)
app.include_router(sedes.router)
app.include_router(bloques.router)
app.include_router(salones.router)
app.include_router(equipos.router)
app.include_router(reportes.router)
app.include_router(auth.router)
