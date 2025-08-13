import api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación
    const token = api.getToken();
    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    // Obtener el ID del usuario actual
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        console.error('No se encontró información del usuario');
        return;
    }

    try {
        const currentUser = JSON.parse(currentUserStr);
        const userId = currentUser.ID_usuarios;

        // Cargar reportes del usuario
        await cargarReportesUsuario(userId);

        // Configurar event listeners para los filtros
        document.getElementById('filtro-estado').addEventListener('change', () => cargarReportesUsuario(userId));
        document.getElementById('filtro-sede').addEventListener('change', () => cargarReportesUsuario(userId));
        document.getElementById('filtro-fecha-desde').addEventListener('change', () => cargarReportesUsuario(userId));
        document.getElementById('filtro-fecha-hasta').addEventListener('change', () => cargarReportesUsuario(userId));

    } catch (error) {
        console.error('Error al cargar reportes:', error);
    }
});

async function cargarReportesUsuario(userId) {
    try {
        // Mostrar carga
        document.getElementById('reportesContainer').innerHTML = `
            <div class="col-12 text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando tus reportes...</p>
            </div>
        `;

        // Obtener valores de los filtros
        const estado = document.getElementById('filtro-estado').value;
        const sede = document.getElementById('filtro-sede').value;
        const fechaDesde = document.getElementById('filtro-fecha-desde').value;
        const fechaHasta = document.getElementById('filtro-fecha-hasta').value;

        // Obtener reportes del usuario y sedes por separado
        const [reportesUsuario, sedes] = await Promise.all([
            api.getReportesPorUsuario(userId),
            api.getSedes()
        ]);

        // Obtener equipos para información adicional
        const equipos = await api.getEquipos();

        // Aplicar filtros
        let reportesFiltrados = reportesUsuario.filter(reporte => {
            // Filtrar por estado
            if (estado === 'pendiente') return !reporte.resuelto;
            if (estado === 'en-proceso') return !reporte.resuelto && reporte.estado_equipo === 'En Proceso';
            if (estado === 'resuelto') return reporte.resuelto;
            return true;
        });

        // Filtrar por sede si existe
        if (sede) {
            reportesFiltrados = reportesFiltrados.filter(reporte => {
                const sedeReporte = sedes.find(s => s.ID_sede === reporte.sede);
                if (!sedeReporte) return false;
                return sedeReporte.nombre_sede.toLowerCase().includes(sede.toLowerCase());
            });
        }

        // Filtrar por fecha desde
        if (fechaDesde) {
            const fechaDesdeDate = new Date(fechaDesde);
            reportesFiltrados = reportesFiltrados.filter(reporte => {
                return new Date(reporte.fecha_registro) >= fechaDesdeDate;
            });
        }

        // Filtrar por fecha hasta
        if (fechaHasta) {
            const fechaHastaDate = new Date(fechaHasta);
            fechaHastaDate.setDate(fechaHastaDate.getDate() + 1); // Incluir todo el día
            reportesFiltrados = reportesFiltrados.filter(reporte => {
                return new Date(reporte.fecha_registro) <= fechaHastaDate;
            });
        }

        // Renderizar reportes filtrados
        renderReportes(reportesFiltrados, equipos, sedes);

    } catch (error) {
        console.error('Error al cargar reportes del usuario:', error);
        document.getElementById('reportesContainer').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar tus reportes: ${error.message}
                </div>
            </div>
        `;
    }
}

function renderReportes(reportes = [], equipos = [], sedes = []) {
    const container = document.getElementById('reportesContainer');
    if (!container) return;
    
    if (reportes.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    No tienes reportes registrados.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    reportes.forEach(reporte => {
        const equipo = equipos.find(e => e.ID_equipo === reporte.ID_equipo) || {};
        const sedeReporte = sedes.find(s => s.ID_sede === reporte.sede) || {};
        
        // Determinar estado y estilos
        let estado, badgeClass, icon;
        if (reporte.resuelto) {
            estado = 'Resuelto';
            badgeClass = 'bg-success';
            icon = 'bi-check-circle';
        } else if (reporte.estado_equipo === 'En Proceso') {
            estado = 'En Proceso';
            badgeClass = 'bg-info';
            icon = 'bi-clock';
        } else {
            estado = 'Pendiente';
            badgeClass = 'bg-warning text-dark';
            icon = 'bi-exclamation-circle';
        }
        
        const card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-lg-4 col-xl-3 mb-4';
        card.innerHTML = `
            <div class="reporte-pin">
                <div class="pin-image-container">
                    <img src="${reporte.img_equipo || '../assets/img/computer.png'}" 
                         class="pin-image" 
                         alt="Equipo reportado">
                    <div class="pin-overlay">
                        <div class="pin-actions">
                            <button class="btn btn-light btn-sm pin-action-btn" onclick="verDetalleReporte(${reporte.ID_reporte})">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="pin-status-badge ${badgeClass}">
                        <i class="bi ${icon}"></i>
                    </div>
                </div>
                <div class="pin-content">
                    <div class="pin-header">
                        <h6 class="pin-title">${reporte.titulo || 'Reporte sin título'}</h6>
                        <div class="pin-meta">
                            <span class="pin-date">
                                <i class="bi bi-calendar3"></i>
                                ${new Date(reporte.fecha_registro).toLocaleDateString('es-ES')}
                            </span>
                            <span class="pin-priority ${reporte.prioridad === 'urgente' ? 'text-danger' : ''}">
                                <i class="bi bi-exclamation-triangle"></i>
                                ${reporte.prioridad === 'urgente' ? 'Urgente' : (reporte.prioridad || 'Media')}
                            </span>
                        </div>
                    </div>
                    <div class="pin-details">
                        <div class="pin-detail-item">
                            <i class="bi bi-pc-display"></i>
                            <span>${equipo.codigo_barras || 'Equipo no especificado'}</span>
                        </div>
                        <div class="pin-detail-item">
                            <i class="bi bi-geo-alt"></i>
                            <span>${sedeReporte.nombre_sede || 'Sede no especificada'}</span>
                        </div>
                    </div>
                    <div class="pin-description">
                        <p>${reporte.descripcion || 'Sin descripción adicional'}</p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}