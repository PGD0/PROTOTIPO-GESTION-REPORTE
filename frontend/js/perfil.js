import { cargarUltimosReportes } from './main.js';

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

  // Crear contenedor para los reportes si no existe
  if (!document.getElementById("ultimosReportesUsuario")) {
    const contenedor = document.createElement("div");
    contenedor.className = "perfil-container mt-4";
    contenedor.innerHTML = `
      <h5>Reportes recientes</h5>
      <div id="ultimosReportesUsuario" class="mt-3"></div>
    `;
    document.querySelector(".main-content-wrapper .contenedor .row").appendChild(contenedor);
  }

  // Cargar reportes recientes
  await cargarUltimosReportes(userId, token);
});
