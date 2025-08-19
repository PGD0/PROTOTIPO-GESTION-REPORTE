from pydantic import BaseModel


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