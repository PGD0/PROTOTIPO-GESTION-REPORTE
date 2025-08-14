import api from './api.js';
import { getPrioridadBadge } from './main.js';

// Variables globales para equipos y usuarios
let equipos = [];
let usuarios = [];
const estadosPosibles = ['Pendiente', 'En Proceso', 'Resuelto'];

document.addEventListener('DOMContentLoaded', async function() {
  const token = api.getToken();
  if (!token) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('reportesAdminContainer');
  
  // Cargar datos iniciales
  equipos = await api.getEquipos();
  usuarios = await api.getUsuarios();
  
  // Función para recargar datos
  async function recargarDatos() {
    equipos = await api.getEquipos();
    usuarios = await api.getUsuarios();
  }

  // Función render global
  window.render = async function() {
    const reportes = await api.getReportes();
    
    // Destruir la tabla DataTable existente si ya existe
    if ($.fn.DataTable.isDataTable('#tablaReportes')) {
      $('#tablaReportes').DataTable().destroy();
    }
    
    container.innerHTML = `<div class="table-responsive">
      <table id="tablaReportes" class="table table-bordered table-hover table-striped align-middle w-100">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Equipo</th>
            <th>Usuario</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Resuelto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${reportes.map(r => {
            const equipo = equipos.find(e => Number(e.ID_equipo) === Number(r.ID_equipo)) || {};
            const usuario = usuarios.find(u => Number(u.ID_usuarios) === Number(r.ID_usuario)) || {};
            return `
              <tr>
                <td>${r.ID_reporte}</td>
                <td>${equipo.codigo_barras || 'Equipo no especificado'}</td>
                <td>${usuario.nombre ? usuario.nombre + ' ' + usuario.apellido : 'Usuario no especificado'}</td>
                <td>${r.descripcion.length > 50 ? r.descripcion.substring(0, 50) + '...' : r.descripcion}</td>
                <td>${r.fecha_registro ? new Date(r.fecha_registro).toLocaleDateString('es-ES') : ''}</td>
                <td>
                  <span class="badge ${(r.estado_equipo === 'Resuelto' || r.estado_equipo === 'Solucionado') ? 'bg-success' : r.estado_equipo === 'En Proceso' ? 'bg-info' : 'bg-warning text-dark'}">
                    ${r.estado_equipo || 'Pendiente'}
                  </span>
                </td>
                <td>
                  ${r.prioridad ? getPrioridadBadge(r.prioridad) : '<span class="badge bg-secondary">No especificada</span>'}
                </td>
                <td><span class="badge ${r.resuelto ? 'bg-success' : 'bg-warning text-dark'}">${r.resuelto ? 'Sí' : 'No'}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm ver-detalle" data-id="${r.ID_reporte}" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>`;

    // Inicializar DataTables
    const dataTable = $('#tablaReportes').DataTable({
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
      },
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel me-2"></i>Excel',
          className: 'btn btn-outline-success btn-sm',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF',
          className: 'btn btn-outline-danger btn-sm',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6, 7]
          }
        }
      ]
    });
    
    // Ver detalles del reporte
    container.querySelectorAll('.ver-detalle').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        // Redirigir a la página de información del reporte
        window.location.href = `informacion-reporte.html?id=${id}`;
      });
    });
  }
  await window.render();
});

