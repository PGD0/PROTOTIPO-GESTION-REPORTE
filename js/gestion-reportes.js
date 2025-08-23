import api from './api.js';

let equipos = [];
let usuarios = [];
const estadosPosibles = ['Pendiente', 'En Proceso', 'Resuelto'];

const getPrioridadBadge = (prioridad) => {
    console.log('Generando badge para prioridad:', prioridad);
    let prioridadClass = '';
    const prioridadLower = prioridad.toString().trim().toLowerCase();
    switch(prioridadLower) {
        case 'urgente':
            prioridadClass = 'bg-danger';
            break;
        case 'alta':
            prioridadClass = 'bg-orange';
            break;
        case 'media':
            prioridadClass = 'bg-warning text-dark';
            break;
        case 'baja':
            prioridadClass = 'bg-success';
            break;
        default:
            prioridadClass = 'bg-secondary';
            console.log('Prioridad no reconocida:', prioridad);
    }
    return `<span class="badge ${prioridadClass} ms-2">Prioridad ${prioridad}</span>`;
}

document.addEventListener('DOMContentLoaded', async function() {
  const token = api.getToken();
  if (!token) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('reportesAdminContainer');
  
  equipos = await api.getEquipos();
  usuarios = await api.getUsuarios();
  
  const recargarDatos = async () => {
    equipos = await api.getEquipos();
    usuarios = await api.getUsuarios();
  }

  const agregarEventListeners = () => {
    console.log('Agregando event listeners...');
    const botones = container.querySelectorAll('.ver-detalle');
    console.log('Botones encontrados:', botones.length);
    
    botones.forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        console.log('Botón clickeado, ID del reporte:', id);
        window.location.href = `informacion-reporte.html?id=${id}`;
      });
    });
  }

  window.render = async function() {
    const reportes = await api.getReportes();
    
    if ($.fn.DataTable.isDataTable('#tablaReportes')) {
      $('#tablaReportes').DataTable().destroy();
    }
    
    container.innerHTML = `<div class="table-responsive">
      <style>
        #tablaReportes th:last-child,
        #tablaReportes td:last-child {
          min-width: 80px !important;
          width: 80px !important;
          max-width: 80px !important;
        }
        #tablaReportes .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
      </style>
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
                <td class="text-center">
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

    console.log('Tabla generada, reportes:', reportes.length);
    console.log('HTML generado:', container.innerHTML.substring(0, 500) + '...');
    
    const botonesEnHTML = container.querySelectorAll('.ver-detalle');
    console.log('Botones encontrados en HTML:', botonesEnHTML.length);
    if (botonesEnHTML.length > 0) {
        console.log('Primer botón HTML:', botonesEnHTML[0].outerHTML);
    }
    
    const columnasAcciones = container.querySelectorAll('th:last-child, td:last-child');
    console.log('Columnas de Acciones encontradas:', columnasAcciones.length);
    if (columnasAcciones.length > 0) {
        console.log('Primera columna de Acciones:', columnasAcciones[0].outerHTML);
    }

    const dataTable = $('#tablaReportes').DataTable({
      responsive: false, 
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
      ],
      columnDefs: [
        {
          targets: 8,
          orderable: false, 
          searchable: false, 
          width: '80px', 
          className: 'text-center'
        }
      ],
      drawCallback: function() {
        console.log('DataTables drawCallback ejecutado');
        agregarEventListeners();
      },
      initComplete: function() {
        console.log('DataTables initComplete ejecutado');
        agregarEventListeners();
      }
    });
    
    setTimeout(() => {
      console.log('Agregando event listeners con delay...');
      agregarEventListeners();
    }, 100);
  }
  await window.render();
});

