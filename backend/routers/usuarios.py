from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from schemas.UsuarioBase import UsuarioCreado,UsuarioSalida,UsuarioActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Usuario
from services.hash import hash_password
from services.cloudinary import subir_imagen 

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

async def crear_usuario(
    nombre: str = Form(...),
    apellido: str = Form(...),
    email: str = Form(...),
    contraseña: str = Form(...),
    rol: int = Form(...),
    descripcion: str = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está en uso")
    url_imagen = None
    if imagen:
        try:
            url_imagen = await subir_imagen(imagen)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")
    nuevo_usuario = Usuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        contraseña=hash_password(contraseña),
        rol=rol,
        descripcion=descripcion,
        img_usuario=url_imagen
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario

async def actualizar_usuario(
    id: int,
    nombre: str = Form(None),
    apellido: str = Form(None),
    email: str = Form(None),
    contraseña: str = Form(None),
    rol: int = Form(None),
    descripcion: str = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.ID_usuarios == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if imagen:
        try:
            url_imagen = await subir_imagen(imagen)
            usuario.img_usuario = url_imagen
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")
    if nombre is not None:
        usuario.nombre = nombre
    if apellido is not None:
        usuario.apellido = apellido
    if email is not None:
        usuario.email = email
    if contraseña is not None:
        usuario.contraseña = hash_password(contraseña)
    if rol is not None:
        usuario.rol = rol
    if descripcion is not None:
        usuario.descripcion = descripcion

    db.commit()
    db.refresh(usuario)
    return usuario

@router.delete("/{id}", status_code=204)
async def eliminar_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.ID_usuarios == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(usuario)
    db.commit()