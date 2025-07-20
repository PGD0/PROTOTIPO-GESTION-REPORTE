from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from database.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    ID_usuarios = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    apellido = Column(String(100))
    email = Column(String(250), unique=True, index=True)
    contraseña = Column(String(250))
    rol = Column(Integer, ForeignKey("roles.ID_rol"))
    fecha_creacion = Column(DateTime, default=func.now())
    descripcion = Column(String(500), nullable=True)     
    img_usuario = Column(String(500), nullable=True)       

    reportes = relationship("Reporte", back_populates="usuario")
    rol_rel = relationship("Rol", back_populates="usuarios")

class Rol(Base):
    __tablename__ = "roles"

    ID_rol = Column(Integer, primary_key=True, index=True)
    tipo_rol = Column(String(50))

    usuarios = relationship("Usuario", back_populates="rol_rel")

class Sede(Base):
    __tablename__ = "sedes"

    ID_sede = Column(Integer, primary_key=True, index=True)
    nombre_sede = Column(String(50))

    salones = relationship("Salon", back_populates="sede_rel")
    equipos = relationship("Equipo", back_populates="sede_rel")
    bloques = relationship("Bloque", back_populates="sede_rel")

class Bloque(Base):
    __tablename__ = "bloques"

    ID_bloque = Column(Integer, primary_key=True, index=True)
    nombre_bloque = Column(String(50))
    sede_id = Column(Integer, ForeignKey("sedes.ID_sede"))

    sede_rel = relationship("Sede", back_populates="bloques")
    salones = relationship("Salon", back_populates="bloque_rel")

class Salon(Base):
    __tablename__ = "salones"

    ID_salon = Column(Integer, primary_key=True, index=True)
    codigo_salon = Column(String(50))
    sede = Column(Integer, ForeignKey("sedes.ID_sede"))
    bloque = Column(Integer, ForeignKey("bloques.ID_bloque"), nullable=True)

    sede_rel = relationship("Sede", back_populates="salones")
    bloque_rel = relationship("Bloque", back_populates="salones")
    equipos = relationship("Equipo", back_populates="salon_rel")

class Equipo(Base):
    __tablename__ = "equipos"

    ID_equipo = Column(Integer, primary_key=True, index=True)
    codigo_barras = Column(String(50))
    marca = Column(String(50))
    sede = Column(Integer, ForeignKey("sedes.ID_sede"))
    salon = Column(Integer, ForeignKey("salones.ID_salon"))
    funcional = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, default=func.now())

    sede_rel = relationship("Sede", back_populates="equipos")
    salon_rel = relationship("Salon", back_populates="equipos")
    reportes = relationship("Reporte", back_populates="equipo")

class Reporte(Base):
    __tablename__ = "reportes"

    ID_reporte = Column(Integer, primary_key=True, index=True)
    ID_equipo = Column(Integer, ForeignKey("equipos.ID_equipo"))
    descripcion = Column(String(250))
    img_equipo = Column(String(250))
    fecha_registro = Column(DateTime, default=func.now())
    fecha_solucion = Column(DateTime)
    estado_equipo = Column(String(50))
    resuelto = Column(Boolean, default=False)
    ID_usuario = Column(Integer, ForeignKey("usuarios.ID_usuarios"))

    equipo = relationship("Equipo", back_populates="reportes")
    usuario = relationship("Usuario", back_populates="reportes") 