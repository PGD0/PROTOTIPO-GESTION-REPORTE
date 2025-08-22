from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database.database import get_db
from services.hash import verify_password
from schemas.UsuarioBase import Token
from models import models
from services.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.contraseña):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    token_data = {
        "sub": user.email,
        "id": user.ID_usuarios,
        "rol": user.rol,
        "nombre": user.nombre
    }
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}