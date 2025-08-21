import { cargarUltimosReportes } from './main.js';

const validarSoloLetras = (valor) => {
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

  document.getElementById("nombreUsuario").textContent = nombre;
  document.getElementById("correoUsuario").textContent = email;
  document.getElementById("rolUsuario").textContent = rol;
  document.getElementById("nombrePerfil").value = nombre;
  document.getElementById("emailPerfil").value = email;
  
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
  
  if (!document.getElementById("ultimosReportesUsuario")) {
    const contenedor = document.createElement("div");
    contenedor.className = "perfil-container mt-4";
    contenedor.innerHTML = `
      <h5>Reportes recientes</h5>
      <div id="ultimosReportesUsuario" class="mt-3"></div>
    `;
    const descripcionContainer = document.querySelector(".descripcion-perfil");
    if (descripcionContainer) {
      descripcionContainer.parentNode.insertBefore(contenedor, descripcionContainer.nextSibling);
    } else {
      const primeraColumna = document.querySelector(".col-md-8");
      if (primeraColumna) {
        primeraColumna.appendChild(contenedor);
      }
    }
  }

  await cargarUltimosReportes(userId, token);
});
