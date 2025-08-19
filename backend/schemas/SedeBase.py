from pydantic import BaseModel

class SedeBase(BaseModel):
    nombre_sede: str

class SedeCreada(SedeBase):
    pass

class SedeSalida(BaseModel):
    ID_sede: int
    nombre_sede: str
    model_config = {
    "from_attributes": True
    }