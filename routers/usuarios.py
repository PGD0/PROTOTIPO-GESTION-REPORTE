from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from schemas.UsuarioBase import UsuarioCreado,UsuarioSalida, UsuarioActualizar
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Rol, Usuario
from services.hash import hash_password, verify_password
from services.cloudinary import subir_imagen 
from pydantic import EmailStr
import shutil
import os
import uuid

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

@router.post("/", response_model=UsuarioCreado)
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
            os.makedirs("temp", exist_ok=True)
            temp_filename = f"temp/{uuid.uuid4().hex}_{imagen.filename}"

            with open(temp_filename, "wb") as buffer:
                shutil.copyfileobj(imagen.file, buffer)

            with open(temp_filename, "rb") as file_data:
                url_imagen = subir_imagen(file_data)

            os.remove(temp_filename)

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

@router.put("/{id}", response_model=UsuarioSalida)
async def actualizar_usuario(
    id: int,
    nombre: Optional[str] = Form(None),
    apellido: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    contraseña: Optional[str] = Form(None),
    rol: Optional[int] = Form(None),
    descripcion: Optional[str] = Form(None),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.ID_usuarios == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if nombre is not None and nombre != "":
        usuario.nombre = nombre
    if apellido is not None and apellido != "":
        usuario.apellido = apellido
    if email is not None and email != "":
        usuario.email = email
    if contraseña is not None and contraseña != "":
        usuario.contraseña = hash_password(contraseña)
    print(f"ROL del usuario antes de retornar: {usuario.rol}")
    if rol is not None and str(rol).strip() != "":
        try:
            rol = int(rol)
            rol_existente = db.query(Rol).filter(Rol.ID_rol == rol).first()
            if not rol_existente:
                raise HTTPException(status_code=400, detail="El rol especificado no existe")
            usuario.rol = rol 
        except ValueError:
            raise HTTPException(status_code=400, detail="El rol debe ser un número válido")
    if descripcion is not None and descripcion != "":
        usuario.descripcion = descripcion
    usuario.img_usuario = usuario.img_usuario
    if imagen:
        try:
            os.makedirs("temp", exist_ok=True)
            temp_filename = f"temp/{uuid.uuid4().hex}_{imagen.filename}"

            with open(temp_filename, "wb") as buffer:
                shutil.copyfileobj(imagen.file, buffer)

            with open(temp_filename, "rb") as file_data:
                url_imagen = subir_imagen(file_data)

            os.remove(temp_filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")
        usuario.img_usuario = url_imagen
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

@router.post("/verificar-password")
async def verificar_password(datos: dict, db: Session = Depends(get_db)):
    
    usuario_id = datos.get("usuario_id")
    password = datos.get("password")
    
    if not usuario_id or not password:
        raise HTTPException(status_code=400, detail="Se requiere ID de usuario y contraseña")
    
    usuario = db.query(Usuario).filter(Usuario.ID_usuarios == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not verify_password(password, usuario.contraseña):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    
    return {"message": "Contraseña verificada correctamente"}