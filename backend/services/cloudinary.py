import cloudinary
from cloudinary.utils import cloudinary_url
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()

CLOUD_NAME = os.getenv("CLOUD_NAME")
API_KEY = os.getenv("CLOUDINARY_API_KEY")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Configuration       
cloudinary.config( 
    cloud_name = CLOUD_NAME, 
    api_key = API_KEY, 
    api_secret = API_SECRET,
    secure=True
)

def subir_imagen(imagen_file, carpeta="equipos"):
    result = cloudinary.uploader.upload(
        imagen_file,
        folder=carpeta,
        unique_filename=True,
        overwrite=True,
        resource_type="image"
    )
    return result["secure_url"]