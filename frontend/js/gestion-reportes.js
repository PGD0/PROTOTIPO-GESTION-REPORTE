import api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  const token = api.getToken();
  if (!token) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('reportesAdminContainer');
  const equipos = await api.getEquipos();
  const usuarios = await api.getUsuarios();
  const estadosPosibles = ['Pendiente', 'En Proceso', 'Resuelto'];

  async function render() {
    const reportes = await api.getReportes();
    container.innerHTML = `<div class="table-responsive">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Equipo</th>
            <th>Usuario</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Resuelto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${reportes.map(r => {
            const equipo = equipos.find(e => e.ID_equipo === r.ID_equipo) || {};
            const usuario = usuarios.find(u => u.ID_usuarios === r.ID_usuario) || {};
            return `
              <tr>
                <td>${r.ID_reporte}</td>
                <td>${equipo.codigo_barras || 'Equipo no especificado'}</td>
                <td>${usuario.nombre ? usuario.nombre + ' ' + usuario.apellido : 'Usuario no especificado'}</td>
                <td>${r.descripcion}</td>
                <td>${r.fecha_registro ? new Date(r.fecha_registro).toLocaleDateString('es-ES') : ''}</td>
                <td>
                  <select class="form-select form-select-sm estado-select" data-id="${r.ID_reporte}">
                    ${estadosPosibles.map(est => `<option value="${est}" ${r.estado_equipo===est?'selected':''}>${est}</option>`).join('')}
                  </select>
                </td>
                <td><span class="badge ${r.resuelto ? 'bg-success' : 'bg-warning text-dark'}">${r.resuelto ? 'Sí' : 'No'}</span></td>
                <td>
                  ${r.resuelto ? '' : `<button class="btn btn-success btn-sm marcar-resuelto" data-id="${r.ID_reporte}" title="Marcar como resuelto"><i class="bi bi-check2"></i></button>`}
                  <button class="btn btn-danger btn-sm eliminar-reporte" data-id="${r.ID_reporte}" title="Eliminar"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>`;

    // Cambiar estado
    container.querySelectorAll('.estado-select').forEach(sel => {
      sel.addEventListener('change', async function() {
        const id = parseInt(this.dataset.id);
        const nuevoEstado = this.value;
        const esResuelto = nuevoEstado === 'Resuelto';
        await api.updateReporte(id, {
          estado_equipo: nuevoEstado,
          resuelto: esResuelto ? 1 : 0,
          fecha_solucion: esResuelto ? new Date().toISOString() : null
        });
        render();
      });
    });
    // Marcar como resuelto
    container.querySelectorAll('.marcar-resuelto').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        await api.updateReporte(id, { resuelto: 1, estado_equipo: 'Resuelto', fecha_solucion: new Date().toISOString() });
        render();
      });
    });
    // Eliminar reporte
    container.querySelectorAll('.eliminar-reporte').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        if (confirm('¿Seguro que deseas eliminar este reporte?')) {
          await api.deleteReporte(id);
          render();
        }
      });
    });
  }
  await render();
}); 