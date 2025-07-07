document.addEventListener('DOMContentLoaded', async function() {
  await window.apiMock.initMockDB();
  const session = window.apiMock.getSession();
  if (!session || !window.apiMock.isAdmin(session)) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('reportesAdminContainer');
  function render() {
    const reportes = window.apiMock.getReportes();
    container.innerHTML = `<table class="table table-bordered table-hover">
      <thead><tr><th>ID</th><th>Equipo</th><th>Descripción</th><th>Estado</th><th>Resuelto</th><th>Acciones</th></tr></thead>
      <tbody>
        ${reportes.map(r => `
          <tr>
            <td>${r.ID_reporte}</td>
            <td>${r.ID_equipo}</td>
            <td>${r.descripcion}</td>
            <td>${r.estado_equipo}</td>
            <td>${r.resuelto ? 'Sí' : 'No'}</td>
            <td>
              <button class="btn btn-success btn-sm marcar-resuelto" data-id="${r.ID_reporte}"><i class="bi bi-check2"></i></button>
              <button class="btn btn-danger btn-sm eliminar-reporte" data-id="${r.ID_reporte}"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
    // Marcar como resuelto
    container.querySelectorAll('.marcar-resuelto').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        window.apiMock.updateReporte(id, { resuelto: 1, estado_equipo: 'Resuelto', fecha_solucion: new Date().toISOString() });
        render();
      });
    });
    // Eliminar reporte
    container.querySelectorAll('.eliminar-reporte').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        if (confirm('¿Seguro que deseas eliminar este reporte?')) {
          window.apiMock.deleteReporte(id);
          render();
        }
      });
    });
  }
  render();
}); 