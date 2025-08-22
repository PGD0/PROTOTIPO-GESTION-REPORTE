from pydantic import BaseModel
from typing import Optional


class SalonBase(BaseModel):
    codigo_salon: str
    sede: int
    bloque: Optional[int] = None

class SalonCreado(SalonBase):
    pass

class SalonSalida(BaseModel):
    ID_salon: int
    codigo_salon: str
    sede: int
    bloque: Optional[int] = None

    model_config = {
        "from_attributes": True
    }