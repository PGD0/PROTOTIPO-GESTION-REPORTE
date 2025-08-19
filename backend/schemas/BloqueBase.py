from pydantic import BaseModel


class BloqueBase(BaseModel):
    nombre_bloque: str
    sede_id: int

class BloqueCreado(BloqueBase):
    pass

class BloqueSalida(BaseModel):
    ID_bloque: int
    nombre_bloque: str
    sede_id: int

    model_config = {
        "from_attributes": True
    }
