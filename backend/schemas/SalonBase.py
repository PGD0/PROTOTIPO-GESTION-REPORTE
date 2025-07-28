from pydantic import BaseModel
from typing import Optional

# ID_salon = Column(Integer, primary_key=True, index=True)
# codigo_salon = Column(String(50))
# sede = Column(Integer, ForeignKey("sedes.ID_sede"))

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