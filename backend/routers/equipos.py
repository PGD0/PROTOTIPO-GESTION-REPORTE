from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.models import Equipo
from schemas.schemas import EquipoCreate, Equipo as EquipoSchema
from services.auth import get_current_user

router = APIRouter(
    prefix="/equipos",
    tags=["equipos"]
)

@router.post("/", response_model=EquipoSchema)
def create_equipo(
    equipo: EquipoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_equipo = Equipo(**equipo.dict())
    db.add(db_equipo)
    db.commit()
    db.refresh(db_equipo)
    return db_equipo

@router.get("/", response_model=List[EquipoSchema])
def read_equipos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    equipos = db.query(Equipo).offset(skip).limit(limit).all()
    return equipos

@router.get("/{equipo_id}", response_model=EquipoSchema)
def read_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_equipo = db.query(Equipo).filter(Equipo.ID_equipo == equipo_id).first()
    if db_equipo is None:
        raise HTTPException(status_code=404, detail="Equipo not found")
    return db_equipo

@router.put("/{equipo_id}", response_model=EquipoSchema)
def update_equipo(
    equipo_id: int,
    equipo: EquipoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_equipo = db.query(Equipo).filter(Equipo.ID_equipo == equipo_id).first()
    if db_equipo is None:
        raise HTTPException(status_code=404, detail="Equipo not found")
    
    for key, value in equipo.dict().items():
        setattr(db_equipo, key, value)
    
    db.commit()
    db.refresh(db_equipo)
    return db_equipo

@router.delete("/{equipo_id}")
def delete_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_equipo = db.query(Equipo).filter(Equipo.ID_equipo == equipo_id).first()
    if db_equipo is None:
        raise HTTPException(status_code=404, detail="Equipo not found")
    
    db.delete(db_equipo)
    db.commit()
    return {"message": "Equipo deleted successfully"} 