from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ID_equipo = Column(Integer, primary_key=True, index=True)
# codigo_barras = Column(String(50))
# marca = Column(String(50))
# sede = Column(Integer, ForeignKey("sedes.ID_sede"))
# salon = Column(Integer, ForeignKey("salones.ID_salon"))
# funcional = Column(Boolean, default=True)
# fecha_registro = Column(DateTime, default=func.now())
# url_imagen = Column(String(500))

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