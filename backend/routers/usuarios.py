from fastapi import APIRouter, Depends, HTTPException
from schemas.UsuarioBase import UsuarioCreado,UsuarioSalida,UsuarioActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.get("/")
async def get_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    if not usuarios:
        raise HTTPException(status_code=404, detail="No se encontraron usuarios")
    return usuarios

@router.get("/{id}")
async def obtener_usuario(id: int, db: Session = Depends(get_db)):
    id_usuario = db.query(Usuario).filter(Usuario.ID_usuarios == id).first()
    if not id_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": f"Usuario con ID {id}", "usuario": id_usuario}

@router.post("/", response_model=UsuarioSalida)
async def crear_usuario(usuario: UsuarioCreado, db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está en uso")
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        email=usuario.email,
        contraseña=usuario.contraseña,
        rol=usuario.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.put("/{id}", response_model=UsuarioSalida)
async def actualizar_usuario(id: int, usuario: UsuarioActualizar, db: Session = Depends(get_db)):
    id_usuario = db.query(Usuario).filter(Usuario.ID_usuarios == id).first()
    if not id_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    for key, value in usuario.dict(exclude_unset=True).items():
        setattr(id_usuario, key, value)
    
    db.commit()
    db.refresh(id_usuario)
    return id_usuario

@router.delete("/{id}", status_code=204)
async def eliminar_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.ID_usuarios == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(usuario)
    db.commit()