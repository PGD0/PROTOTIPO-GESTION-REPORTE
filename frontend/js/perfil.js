import { cargarUltimosReportes } from './main.js';

// Función para validar que un campo solo contenga letras y espacios
function validarSoloLetras(valor) {
  return /^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/.test(valor);
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../html/index.html";
    return;
  }

  let payload;
  try {
    payload = JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Token inválido:", e);
    window.location.href = "../html/index.html";
    return;
  }

  const userId = payload.id;
  const nombre = payload.nombre;
  const email = payload.sub;
  const rol = payload.rol;

  // Mostrar datos en el perfil
  document.getElementById("nombreUsuario").textContent = nombre;
  document.getElementById("correoUsuario").textContent = email;
  document.getElementById("rolUsuario").textContent = rol;
  document.getElementById("nombrePerfil").value = nombre;
  document.getElementById("emailPerfil").value = email;
  
  // Validación en tiempo real para el campo de nombre
  const nombrePerfilInput = document.getElementById("nombrePerfil");
  nombrePerfilInput.addEventListener('input', function() {
    if (!validarSoloLetras(this.value)) {
      this.classList.add('is-invalid');
      if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('invalid-feedback')) {
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.innerHTML = '<strong>Nombre inválido:</strong> El nombre solo debe contener letras y espacios. No se permiten números ni caracteres especiales.';
        this.parentNode.insertBefore(feedback, this.nextSibling);
      }
    } else {
      this.classList.remove('is-invalid');
      if (this.nextElementSibling && this.nextElementSibling.classList.contains('invalid-feedback')) {
        this.nextElementSibling.remove();
      }
    }
  });
  
  // No agregamos el event listener al botón de guardar aquí, ya que se maneja en main.js

  // Crear contenedor para los reportes si no existe
  if (!document.getElementById("ultimosReportesUsuario")) {
    const contenedor = document.createElement("div");
    contenedor.className = "perfil-container mt-4";
    contenedor.innerHTML = `
      <h5>Reportes recientes</h5>
      <div id="ultimosReportesUsuario" class="mt-3"></div>
    `;
    // Insertar después de la descripción del perfil, dentro de la misma columna
    const descripcionContainer = document.querySelector(".descripcion-perfil");
    if (descripcionContainer) {
      descripcionContainer.parentNode.insertBefore(contenedor, descripcionContainer.nextSibling);
    } else {
      // Fallback: insertar en la primera columna si no se encuentra la descripción
      const primeraColumna = document.querySelector(".col-md-8");
      if (primeraColumna) {
        primeraColumna.appendChild(contenedor);
      }
    }
  }

  // Cargar reportes recientes
  await cargarUltimosReportes(userId, token);
});
