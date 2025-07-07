// reportes.js - Lógica de cambio de vista de reportes
// (Este archivo queda vacío, la lógica de renderizado se moverá a main.js)

// Eliminar la función setupVistaReportes y su exportación global

document.addEventListener('DOMContentLoaded', async function() {
  if (!window.apiMock) return;
  await window.apiMock.initMockDB();
  const reportes = window.apiMock.getReportes();
  const container = document.getElementById('reportesContainer');
  if (!container) return;
  container.innerHTML = '';
  if (reportes.length === 0) {
    container.innerHTML = '<div class="alert alert-info">No hay reportes registrados.</div>';
    return;
  }
  reportes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'reporte-card card mb-3';
    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-4 text-center">
          <img src="../assets/img/${r.img_equipo || 'computer.png'}" alt="Equipo" class="img-fluid rounded" style="max-height: 80px;">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title mb-2">${r.descripcion}</h5>
            <p class="card-text mb-0"><strong>Estado:</strong> ${r.estado_equipo}</p>
            <p class="card-text mb-0"><strong>Fecha:</strong> ${r.fecha_registro ? r.fecha_registro.split('T')[0] : ''}</p>
            <span class="badge ${r.resuelto ? 'bg-success' : 'bg-warning text-dark'}">
              ${r.resuelto ? 'Resuelto' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}); 