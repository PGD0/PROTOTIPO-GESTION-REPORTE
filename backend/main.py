from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, equipos
from database.database import engine, Base
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestión Reporte API",
    description="API para el sistema de gestión de reportes",
    version="1.0.0"
)

# Configure CORS
origins = json.loads(os.getenv("CORS_ORIGINS", '["http://localhost:4200"]'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(equipos.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}
