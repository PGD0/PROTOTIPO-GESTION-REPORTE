from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Usuario Schemas
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    rol: int

class UsuarioCreate(UsuarioBase):
    contraseña: str

class Usuario(UsuarioBase):
    ID_usuarios: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True

# Rol Schemas
class RolBase(BaseModel):
    tipo_rol: str

class Rol(RolBase):
    ID_rol: int

    class Config:
        from_attributes = True

# Sede Schemas
class SedeBase(BaseModel):
    nombre_sede: str

class Sede(SedeBase):
    ID_sede: int

    class Config:
        from_attributes = True

# Salon Schemas
class SalonBase(BaseModel):
    codigo_salon: str
    sede: int

class Salon(SalonBase):
    ID_salon: int

    class Config:
        from_attributes = True

# Equipo Schemas
class EquipoBase(BaseModel):
    codigo_barras: str
    marca: str
    sede: int
    salon: int
    funcional: bool = True

class EquipoCreate(EquipoBase):
    pass

class Equipo(EquipoBase):
    ID_equipo: int
    fecha_registro: datetime

    class Config:
        from_attributes = True

# Reporte Schemas
class ReporteBase(BaseModel):
    ID_equipo: int
    descripcion: str
    img_equipo: str
    estado_equipo: str
    resuelto: bool = False

class ReporteCreate(ReporteBase):
    pass

class Reporte(ReporteBase):
    ID_reporte: int
    fecha_registro: datetime
    fecha_solucion: Optional[datetime] = None
    ID_usuario: int

    class Config:
        from_attributes = True 