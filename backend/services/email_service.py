from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración del servicio de correo
mail_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Sistema de Gestión de Reportes IUB"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fastmail = FastMail(mail_config)

async def enviar_notificacion_equipo_arreglado(
    email_usuario: str,
    nombre_usuario: str,
    codigo_equipo: str,
    ubicacion: str,
    descripcion_problema: str
):
    """
    Envía una notificación por correo al usuario cuando su equipo ha sido arreglado
    """
    
    subject = "Notificación: Su equipo ha sido reparado - Sistema IUB"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Equipo Reparado</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 650px;
                margin: 0 auto;
                padding: 0;
                background-color: #f7f7f7;
            }}
            .container {{
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }}
            .header {{
                display: flex;
                align-items: center;
                border-bottom: 1px solid #e5e5e5;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }}
            .logo {{
                height: 50px;
                margin-right: 15px;
            }}
            .title {{
                font-size: 20px;
                font-weight: bold;
                color: #444;
            }}
            .section {{
                background-color: #fafafa;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e0e0e0;
                margin-bottom: 20px;
            }}
            .label {{
                font-weight: bold;
                color: #555;
            }}
            .value {{
                color: #666;
            }}
            .button {{
                display: inline-block;
                background-color: #4a90e2;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
            }}
            .button:hover {{
                background-color: #3d7ec1;
            }}
            .footer {{
                text-align: center;
                font-size: 12px;
                color: #999;
                margin-top: 30px;
                border-top: 1px solid #e5e5e5;
                padding-top: 15px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="title">Sistema de Gestión de Reportes IUB</div>
            </div>

            <p>Estimado/a {nombre_usuario},</p>
            <p>Le informamos que el equipo que reportó como defectuoso ha sido reparado y está listo para su uso.</p>

            <div class="section">
                <p class="label">Detalles del equipo:</p>
                <p class="value"><strong>Código:</strong> {codigo_equipo}</p>
                <p class="value"><strong>Ubicación:</strong> {ubicacion}</p>
                <p class="value"><strong>Problema reportado:</strong> {descripcion_problema}</p>
            </div>

            <p>Puede acercarse a la ubicación indicada para verificar el funcionamiento del equipo. 
            Si el inconveniente persiste o tiene alguna consulta, por favor póngase en contacto con el administrador del sistema.</p>


            <div class="footer">
                Este es un mensaje automático del Sistema de Gestión de Reportes IUB.<br>
                No responda a este correo. 
            </div>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email_usuario],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
        return {"success": True, "message": "Notificación enviada correctamente"}
    except Exception as e:
        return {"success": False, "message": f"Error al enviar notificación: {str(e)}"}

async def enviar_notificacion_general(
    email_usuario: str,
    nombre_usuario: str,
    subject: str,
    message_content: str
):
    """
    Envía una notificación general por correo
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación IUB</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }}
            .container {{
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }}
            .title {{
                color: #0d6efd;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .content {{
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #0d6efd;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="title">{subject}</div>
            </div>
            
            <div class="content">
                <p>Hola {nombre_usuario},</p>
                {message_content}
            </div>
            
            <div class="footer">
                <p>Este es un mensaje automático del Sistema de Gestión de Reportes IUB</p>
                <p>No respondas a este correo. Para consultas, contacta al administrador del sistema.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email_usuario],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
        return {"success": True, "message": "Notificación enviada correctamente"}
    except Exception as e:
        return {"success": False, "message": f"Error al enviar notificación: {str(e)}"}



