from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EquipoBase(BaseModel):
    codigo_barras: str
    marca: str
    sede: int
    salon: int
    funcional: bool = True

class EquipoCreado(EquipoBase):
    pass

class EquipoSalida(BaseModel):
    ID_equipo: int
    codigo_barras: str
    marca: str
    sede: int
    salon: int
    funcional: bool
    fecha_registro: datetime

    model_config = {
        "from_attributes": True
    }

class EquipoActualizar(BaseModel):
    codigo_barras: Optional[str] = None
    marca: Optional[str] = None
    sede: Optional[int] = None
    salon: Optional[int] = None
    funcional: Optional[bool] = None

    model_config = {
        "from_attributes": True
    }