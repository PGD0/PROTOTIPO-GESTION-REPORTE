from pydantic import BaseModel

# ID_bloque = Column(Integer, primary_key=True, index=True)
# nombre_bloque = Column(String(50))
# sede_id = Column(Integer, ForeignKey("sedes.ID_sede"))

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
