from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base
from dotenv import load_dotenv
import os
import json

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestión Reporte API",
    description="API para el sistema de gestión de reportes",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}
