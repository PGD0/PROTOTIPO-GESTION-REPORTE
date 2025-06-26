from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ID_usuarios = Column(Integer, primary_key=True, index=True)
# nombre = Column(String(100))
# apellido = Column(String(100))
# email = Column(String(250), unique=True, index=True)
# contraseña = Column(String(250))
# rol = Column(Integer, ForeignKey("roles.ID_rol"))
# fecha_creacion = Column(DateTime, default=func.now())

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    contraseña: str
    rol: int

class UsuarioCreado(UsuarioBase):
    pass

class UsuarioSalida(BaseModel):
    ID_usuarios: int
    nombre: str
    apellido: str
    email: EmailStr
    rol: int
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

class Token(BaseModel):
    access_token: str
    token_type: str