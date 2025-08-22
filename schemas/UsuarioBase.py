from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    contraseña: str
    rol: int
    descripcion: Optional[str] = None

class UsuarioCreado(UsuarioBase):
    pass

class UsuarioSalida(BaseModel):
    ID_usuarios: int
    nombre: str
    apellido: str
    email: EmailStr
    rol: int
    descripcion: Optional[str] = None
    img_usuario: Optional[str] = None
    fecha_creacion: datetime
    model_config = {
    "from_attributes": True
    }

class UsuarioActualizar(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    contraseña: Optional[str] = None
    rol: Optional[int] = None
    descripcion: Optional[str] = None
    img_usuario: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str