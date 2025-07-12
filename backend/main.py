from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base, get_db
from models.models import Usuario, Rol, Sede, Salon, Equipo, Reporte
from routers import usuarios, roles, sedes, salones, equipos, reportes, auth, bloques
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestión Reporte API",
    description="API para el sistema de gestión de reportes",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}

# Función para inicializar datos básicos
def init_db():
    db = next(get_db())
    try:
        # Verificar si ya existen roles
        if db.query(Rol).count() == 0:
            # Crear roles básicos
            admin_rol = Rol(tipo_rol="Administrador")
            user_rol = Rol(tipo_rol="Usuario")
            db.add(admin_rol)
            db.add(user_rol)
            db.commit()
            print("Roles inicializados")
    except Exception as e:
        print(f"Error inicializando roles: {e}")
    finally:
        db.close()

# Inicializar datos al arrancar
init_db()

app.include_router(usuarios.router)
app.include_router(roles.router)
app.include_router(sedes.router)
app.include_router(bloques.router)
app.include_router(salones.router)
app.include_router(equipos.router)
app.include_router(reportes.router)
app.include_router(auth.router)