from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(contraseña: str) -> str:
    return pwd_context.hash(contraseña)

def verify_password(contraseña_plana: str, contraseña_hashed: str) -> bool:
    return pwd_context.verify(contraseña_plana, contraseña_hashed)