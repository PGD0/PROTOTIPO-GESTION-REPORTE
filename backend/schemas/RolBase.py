from pydantic import BaseModel

# ID_rol = Column(Integer, primary_key=True, index=True)
# tipo_rol = Column(String(50))

class RolBase(BaseModel):
    tipo_rol: str

class RolCreado(RolBase):
    pass

class RolSalida(BaseModel):
    ID_rol: int
    tipo_rol: str
    model_config = {
    "from_attributes": True
    }