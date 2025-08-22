from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReporteBase(BaseModel):
    ID_equipo: int
    descripcion: str
    img_equipo: Optional[str] = None
    fecha_solucion: Optional[datetime] = None
    estado_equipo: str
    resuelto: bool = False
    ID_usuario: int

class ReporteCreado(ReporteBase):
    pass

class ReporteSalida(BaseModel):
    ID_reporte: int
    ID_equipo: int
    descripcion: str
    img_equipo: Optional[str] = None
    fecha_registro: datetime
    fecha_solucion: Optional[datetime] = None
    estado_equipo: str
    resuelto: bool = False
    ID_usuario: int

    model_config = {
        "from_attributes": True
    }

class ReporteActualizar(BaseModel):
    descripcion: Optional[str] = None
    img_equipo: Optional[str] = None
    fecha_solucion: Optional[datetime] = None
    estado_equipo: Optional[str] = None
    resuelto: Optional[bool] = None

    model_config = {
        "from_attributes": True
    }
