from pydantic import BaseModel

# ID_sede = Column(Integer, primary_key=True, index=True)
# nombre_sede = Column(String(50))

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