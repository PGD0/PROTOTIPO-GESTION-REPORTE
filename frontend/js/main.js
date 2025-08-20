import api from './api.js';
export function getPrioridadBadge(prioridad) {
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

document.addEventListener('DOMContentLoaded', function() {
    setupVistaReportes();
    if (window.location.pathname.endsWith('reportes.html')) {
        const reportesContainer = document.getElementById('reportesContainer');
        if (reportesContainer) {
            renderReportes();
        }
    }
    if(window.location.pathname.endsWith('dashboard.html')) {
        api.getDashboardData()
            .then(data => {
                if (data) {
                    if (data.isAdmin) {
                        pintarGraficasAdmin(data);
                    } else {
                        pintarGraficasUsuario(data);
                    }
                } else {
                    console.error('No se recibieron datos del dashboard');
                }
            })
            .catch(error => {
                console.error('Error al cargar datos del dashboard:', error);
            });
    }
});

function ocultarGraficaSiVacia(idCanvas, mostrar = true) {
  const canvas = document.getElementById(idCanvas);
  if (canvas) {
    const card = canvas.closest('.col-lg-6, .col-lg-8, .col-lg-4');
    if (card) {
      card.style.display = mostrar ? 'block' : 'none';
    }
  }
}

let todosLosReportes = [];
let todosLosEquipos = [];
let todosLosUsuarios = [];
let todasLasSedes = [];

function renderReportes(filtros = {}) {
    const container = document.getElementById('reportesContainer');
    if (!container) return;
    
    if (todosLosReportes.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">Cargando reportes...</div></div>';
        
        Promise.all([
            api.getReportes(),
            api.getEquipos(),
            api.getUsuarios(),
            api.getSedes()
        ])
        .then(([reportes, equipos, usuarios, sedes]) => {
            todosLosReportes = reportes || [];
            todosLosEquipos = equipos || [];
            todosLosUsuarios = usuarios || [];
            todasLasSedes = sedes || [];
            
            console.log('Reportes cargados:', todosLosReportes);
            console.log('Reportes con prioridad:', todosLosReportes.filter(r => r.prioridad));
            
            actualizarFiltroSedes();
            
            renderReportesFiltrados(filtros);
        })
        .catch(error => {
            console.error('Error al cargar reportes:', error);
            container.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error al cargar reportes: ${error.message}</div></div>`;
        });
    } else {
        renderReportesFiltrados(filtros);
    }
}

function renderReportesFiltrados(filtros = {}) {
    const container = document.getElementById('reportesContainer');
    if (!container) return;
    
    let reportesFiltrados = todosLosReportes;
    
    reportesFiltrados = reportesFiltrados.filter(r => !r.resuelto);
    
    if (filtros.estado) {
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (filtros.estado === 'pendiente') {
                return r.estado_equipo === 'Pendiente' || !r.estado_equipo;
            } else if (filtros.estado === 'en-proceso') {
                return !r.resuelto && r.estado_equipo && 
                       r.estado_equipo !== 'Pendiente' && 
                       r.estado_equipo !== 'Solucionado';
            } else if (filtros.estado === 'resuelto') {
                return false; 
            }
            return true;
        });
    }
    
    if (filtros.sede) {
        reportesFiltrados = reportesFiltrados.filter(r => {
            const equipo = todosLosEquipos.find(e => e.ID_equipo === r.ID_equipo) || {};
            if (equipo.sede) {
                return equipo.sede.toLowerCase().includes(filtros.sede.toLowerCase());
            }
            const ubicacion = equipo.salon || r.salon || '';
            return ubicacion.toLowerCase().includes(filtros.sede.toLowerCase());
        });
    }
    
    if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde);
        fechaDesde.setHours(0, 0, 0, 0);
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (!r.fecha_registro) return false;
            const fechaReporte = new Date(r.fecha_registro);
            return fechaReporte >= fechaDesde;
        });
    }
    
    if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (!r.fecha_registro) return false;
            const fechaReporte = new Date(r.fecha_registro);
            return fechaReporte <= fechaHasta;
        });
    }
    
    if (filtros.prioridad) {
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (!r.prioridad) return false;
            const prioridadReporte = r.prioridad.toString().trim().toLowerCase();
            const prioridadFiltro = filtros.prioridad.toString().trim().toLowerCase();
            
            return prioridadReporte === prioridadFiltro;
        });
    }
    
    if (reportesFiltrados.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No hay reportes que coincidan con los filtros seleccionados.</div></div>';
        return;
    }
    
    container.innerHTML = '';
    reportesFiltrados.forEach(r => {
        const equipo = todosLosEquipos.find(e => e.ID_equipo === r.ID_equipo) || {};
        const usuario = todosLosUsuarios.find(u => u.ID_usuarios === r.ID_usuario) || {};
        
        let estado = 'Pendiente', badge = 'bg-warning text-dark', icon = 'bi-exclamation-circle';
        if (r.estado_equipo && r.estado_equipo.toLowerCase().includes('proceso')) {
            estado = 'En Proceso'; 
            badge = 'bg-info text-white'; 
            icon = 'bi-clock';
        } else if (r.resuelto) {
            estado = 'Resuelto'; 
            badge = 'bg-success'; 
            icon = 'bi-check-circle';
        }
        
        const card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-lg-4 col-xl-3 mb-4';
        card.innerHTML = `
            <div class="reporte-pin">
                <div class="pin-image-container">
                    <img src="${r.img_equipo && r.img_equipo.startsWith('http') ? r.img_equipo : `../assets/img/${r.img_equipo || equipo.img || 'computer.png'}`}" 
                         class="pin-image" 
                         alt="Equipo">
                    <div class="pin-overlay">
                        <div class="pin-actions">
                            <button class="btn btn-light btn-sm pin-action-btn" onclick="verDetalleReporte(${r.ID_reporte})">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="pin-status-badge ${badge}">
                        <i class="bi ${icon}"></i>
                    </div>
                </div>
                <div class="pin-content">
                    <div class="pin-header">
                        <h6 class="pin-title" title="${r.descripcion}">
                            ${r.descripcion}
                        </h6>
                        <div class="pin-meta">
                            <span class="pin-date">
                                <i class="bi bi-calendar3"></i>
                                ${r.fecha_registro ? new Date(r.fecha_registro).toLocaleDateString('es-ES') : ''}
                            </span>
                            ${r.prioridad ? getPrioridadBadge(r.prioridad) : ''}
                        </div>
                    </div>
                    <div class="pin-details">
                        <div class="pin-detail-item">
                            <i class="bi bi-pc-display"></i>
                            <span>${equipo.codigo_barras || 'Equipo no especificado'}</span>
                        </div>
                        <div class="pin-detail-item">
                            <i class="bi bi-person"></i>
                            <span>${usuario.nombre ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario no especificado'}</span>
                        </div>
                        <div class="pin-detail-item">
                            <i class="bi bi-geo-alt"></i>
                            <span>
                                ${(() => {
                                    if (equipo.sede && equipo.salon) {
                                        return `${equipo.sede} - ${equipo.salon}`;
                                    } else if (equipo.sede) {
                                        return equipo.sede;
                                    } else if (equipo.salon) {
                                        return equipo.salon;
                                    } else {
                                        return 'Ubicación no especificada';
                                    }
                                })()}
                            </span>
                        </div>
                        <div class="pin-detail-item">
                            <i class="bi bi-exclamation-triangle"></i>
                            <span>Prioridad: ${r.prioridad || 'No especificada'}</span>
                        </div>
                    </div>
                    <div class="pin-description">
                        <p>${r.detalle || r.descripcion || 'Sin descripción adicional'}</p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function actualizarFiltroSedes() {
    const filtroSede = document.getElementById('filtro-sede');
    if (!filtroSede) return;
    
    const valorSeleccionado = filtroSede.value;
    
    filtroSede.innerHTML = '<option value="">Todas las sedes</option>';
    
    if (todasLasSedes && todasLasSedes.length > 0) {
        todasLasSedes.forEach(sede => {
            const option = document.createElement('option');
            option.value = sede.nombre_sede.toLowerCase();
            option.textContent = sede.nombre_sede;
            filtroSede.appendChild(option);
        });
    }
    
    if (valorSeleccionado) {
        filtroSede.value = valorSeleccionado;
    }
}

function setupVistaReportes() {
    const reportesContainer = document.getElementById('reportesContainer');
    if (!reportesContainer) return;
    
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroSede = document.getElementById('filtro-sede');
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde');
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta');
    
    function aplicarFiltros() {
        const filtroPrioridad = document.getElementById('filtro-prioridad');
        
        const filtros = {
            estado: filtroEstado ? filtroEstado.value : '',
            sede: filtroSede ? filtroSede.value : '',
            fechaDesde: filtroFechaDesde ? filtroFechaDesde.value : '',
            fechaHasta: filtroFechaHasta ? filtroFechaHasta.value : '',
            prioridad: filtroPrioridad ? filtroPrioridad.value : ''
        };
        
        renderReportes(filtros);
    }
    
    if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
    if (filtroSede) filtroSede.addEventListener('change', aplicarFiltros);
    if (filtroFechaDesde) filtroFechaDesde.addEventListener('change', aplicarFiltros);
    if (filtroFechaHasta) filtroFechaHasta.addEventListener('change', aplicarFiltros);
    
    const filtroPrioridad = document.getElementById('filtro-prioridad');
    if (filtroPrioridad) filtroPrioridad.addEventListener('change', aplicarFiltros);
    
    renderReportes();
}

async function verDetalleReporte(idReporte) {
    window.location.href = `informacion-reporte.html?id=${idReporte}`;
}

window.marcarComoResuelto = async function(idReporte) {
    if (confirm('¿Deseas marcar este reporte como resuelto?')) {
        try {
            await api.updateReporte(idReporte, { 
                resuelto: 1, 
                estado_equipo: 'Resuelto', 
                fecha_solucion: new Date().toISOString() 
            });
            bootstrap.Modal.getInstance(document.getElementById('detalleReporteModal')).hide();
            if (window.location.pathname.endsWith('gestion-reportes.html')) {
                window.location.reload();
            }
            alert('✅ Reporte marcado como resuelto correctamente');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }
};

window.notificarUsuario = async function(idReporte) {
    if (confirm('¿Deseas notificar al usuario que su equipo ha sido reparado?')) {
        try {
            const resultado = await api.notificarUsuario(idReporte);
            if (resultado.success) {
                alert(`✅ Notificación enviada correctamente a: ${resultado.usuario} (${resultado.email})`);
            } else {
                alert(`❌ Error al enviar notificación: ${resultado.message}`);
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }
};

window.eliminarReporte = async function(idReporte) {
    if (confirm('¿Seguro que deseas eliminar este reporte?')) {
        try {
            await api.deleteReporte(idReporte);
            bootstrap.Modal.getInstance(document.getElementById('detalleReporteModal')).hide();
            if (window.location.pathname.endsWith('gestion-reportes.html')) {
                window.location.reload();
            }
            alert('✅ Reporte eliminado correctamente');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }
};

function pintarGraficasUsuario(data) {
  Chart.defaults.font.family = "'Inter', 'Poppins', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#495057';
  const colorPalette = {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    purple: '#6f42c1',
    pink: '#d63384',
    orange: '#fd7e14',
    teal: '#20c997'
  };
  new Chart(document.getElementById('reportesPorEstadoChart'), {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Resueltos'],
      datasets: [{
        data: [data.pendientes, data.resueltos],
        backgroundColor: [colorPalette.warning, colorPalette.success],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              weight: 500
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#000',
          bodyColor: '#000',
          bodyFont: {
            weight: 'bold'
          },
          borderWidth: 1,
          borderColor: '#e9ecef',
          cornerRadius: 8,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      }
    }
  });
  if (data.reportes_mensuales && Object.keys(data.reportes_mensuales).length > 0) {
    ocultarGraficaSiVacia('reportesPorMesChart', true);
    new Chart(document.getElementById('reportesPorMesChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(data.reportes_mensuales),
        datasets: [{
          label: 'Tus Reportes por Mes',
          data: Object.values(data.reportes_mensuales),
          backgroundColor: colorPalette.info,
          borderRadius: 6,
          maxBarThickness: 40,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              precision: 0
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Tus Reportes por Mes'
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000',
            bodyColor: '#000',
            bodyFont: {
              weight: 'bold'
            },
            borderWidth: 1,
            borderColor: '#e9ecef',
            cornerRadius: 8,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true
          }
        }
      }
    });
  } else {
    ocultarGraficaSiVacia('reportesPorMesChart', false);
  }

  if (data.ultimos_reportes && data.ultimos_reportes.length > 0) {
    let ultimosReportesContainer = document.querySelector('.col-lg-6.mb-4:last-child');
    if (ultimosReportesContainer) {
      const newChartDiv = document.createElement('div');
      newChartDiv.className = 'col-lg-6 mb-4';
      newChartDiv.innerHTML = `
        <div class="dashboard-box card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="card-title"><i class="bi bi-pie-chart-fill text-primary"></i> Estado de Últimos Reportes</h5>
          </div>
          <div class="card-body">
            <canvas id="ultimosReportesChart"></canvas>
          </div>
        </div>
      `;
      ultimosReportesContainer.parentNode.appendChild(newChartDiv);
    }
    
    ocultarGraficaSiVacia('ultimosReportesChart', true);
    new Chart(document.getElementById('ultimosReportesChart'), {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Resueltos'],
        datasets: [{
          data: [data.ultimos_reportes?.filter(r => r.estado !== 'Resuelto').length || 0, 
                data.ultimos_reportes?.filter(r => r.estado === 'Resuelto').length || 0],
          backgroundColor: [colorPalette.warning, colorPalette.success],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                weight: 500
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000',
            bodyColor: '#000',
            bodyFont: {
              weight: 'bold'
            },
            borderWidth: 1,
            borderColor: '#e9ecef',
            cornerRadius: 8,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true
          }
        }
      }
    });
  } else {
    ocultarGraficaSiVacia('ultimosReportesChart', false);
  }

  if (data.ultimos_reportes && data.ultimos_reportes.length > 0) {
  let reportesPorEstadoUsuarioContainer = document.querySelector('.col-lg-8.mb-4');
  if (reportesPorEstadoUsuarioContainer) {
    const newChartDiv = document.createElement('div');
    newChartDiv.className = 'col-lg-8 mb-4';
    newChartDiv.innerHTML = `
      <div class="dashboard-box card border-0 shadow-sm">
        <div class="card-header bg-white">
          <h5 class="card-title"><i class="bi bi-graph-up text-primary"></i> Últimos Reportes por Estado</h5>
        </div>
        <div class="card-body">
          <canvas id="reportesPorEstadoUsuarioChart"></canvas>
        </div>
      </div>
    `;
    reportesPorEstadoUsuarioContainer.parentNode.appendChild(newChartDiv);
  }

  ocultarGraficaSiVacia('reportesPorEstadoUsuarioChart', true);

  // ✅ Verificación antes de crear el gráfico
  const ctxEstadoUsuario = document.getElementById('reportesPorEstadoUsuarioChart');
  if (ctxEstadoUsuario) {
    const fechas = data.ultimos_reportes.map(r => new Date(r.fecha).toLocaleDateString('es-ES'));
    const estados = data.ultimos_reportes.map(r => r.estado === 'Resuelto' ? 1 : 0);

    new Chart(ctxEstadoUsuario, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Estado de reportes',
          data: estados,
          backgroundColor: 'rgba(13,110,253,0.1)',
          borderColor: '#0d6efd',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#0d6efd',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Estado de tus Últimos Reportes'
          },
          tooltip: {
            callbacks: {
              label: ctx => ctx.raw === 1 ? 'Resuelto' : 'Pendiente'
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: v => v === 1 ? 'Resuelto' : 'Pendiente'
            },
            stepSize: 1,
            min: 0,
            max: 1
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  } else {
    console.warn("⚠️ No se encontró el canvas 'reportesPorEstadoUsuarioChart'.");
  }
} else {
  ocultarGraficaSiVacia('reportesPorMesChart', false);
}


  ocultarGraficaSiVacia('grafica5', false);
  ocultarGraficaSiVacia('grafica6', false);
}

function pintarGraficasAdmin(data) {
  document.getElementById('totalReportes').textContent = data.pendientes + data.resueltos;
  document.getElementById('reportesPendientes').textContent = data.pendientes;
  document.getElementById('reportesResueltos').textContent = data.resueltos;
  
  Chart.defaults.font.family = "'Inter', 'Poppins', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#495057';
  
  const colorPalette = {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    purple: '#6f42c1',
    pink: '#d63384',
    orange: '#fd7e14',
    teal: '#20c997'
  };
  
  new Chart(document.getElementById('reportesPorEstadoChart'), {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Resueltos'],
      datasets: [{
        data: [data.pendientes, data.resueltos],
        backgroundColor: [colorPalette.warning, colorPalette.success],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              weight: 500
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#000',
          bodyColor: '#000',
          bodyFont: {
            weight: 'bold'
          },
          borderWidth: 1,
          borderColor: '#e9ecef',
          cornerRadius: 8,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      }
    }
  });

  new Chart(document.getElementById('equiposPorEstadoChart'), {
    type: 'pie',
    data: {
      labels: ['Funcionales', 'No Funcionales'],
      datasets: [{
        data: [data.equipos_funcionales, data.equipos_no_funcionales],
        backgroundColor: [colorPalette.primary, colorPalette.danger],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              weight: 500
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#000',
          bodyColor: '#000',
          bodyFont: {
            weight: 'bold'
          },
          borderWidth: 1,
          borderColor: '#e9ecef',
          cornerRadius: 8,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      }
    }
  });
  const sedes = data.reportes_por_sede.map(d => d.sede);
  const cantidadesSedes = data.reportes_por_sede.map(d => d.cantidad);
  new Chart(document.getElementById('reportesPorSedeChart'), {
    type: 'bar',
    data: {
      labels: sedes,
      datasets: [{
        label: 'Reportes por Sede',
        data: cantidadesSedes,
        backgroundColor: colorPalette.purple,
        borderRadius: 4,
        maxBarThickness: 40,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#000',
          bodyColor: '#000',
          borderWidth: 1,
          cornerRadius: 4
        }
      }
    }
  });

  const meses = data.reportes_por_mes.map(d => {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombresMeses[d.mes - 1] || `Mes ${d.mes}`;
  });
  const cantidadesMes = data.reportes_por_mes.map(d => d.cantidad);
  new Chart(document.getElementById('reportesPorMesChart'), {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Reportes por Mes',
        data: cantidadesMes,
        borderColor: colorPalette.primary,
        backgroundColor: 'rgba(13,110,253,0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: colorPalette.primary,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            precision: 0
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              weight: 500
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#000',
          bodyColor: '#000',
          bodyFont: {
            weight: 'bold'
          },
          borderWidth: 1,
          borderColor: '#e9ecef',
          cornerRadius: 8,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      }
    }
  });

  const salones = data.equipos_por_salon.map(d => d.salon);
  const cantidadesSalon = data.equipos_por_salon.map(d => d.cantidad);
  new Chart(document.getElementById('equiposPorSalonChart'), {
    type: 'bar',
    data: {
      labels: salones,
      datasets: [{
        label: 'Equipos por Salón',
        data: cantidadesSalon,
        backgroundColor: colorPalette.orange,
        borderRadius: 4,
        maxBarThickness: 40,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',  
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  const roles = data.usuarios_por_rol.map(d => d.rol);
  const cantidadesRol = data.usuarios_por_rol.map(d => d.cantidad);
  new Chart(document.getElementById('usuariosPorRolChart'), {
    type: 'pie',
    data: {
      labels: roles,
      datasets: [{
        label: 'Usuarios por Rol',
        data: cantidadesRol,
        backgroundColor: [
          colorPalette.success,
          colorPalette.info,
          colorPalette.purple
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'right'
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#000',
          bodyColor: '#000'
        }
      }
    }
  });
}



if (window.location.pathname.includes('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      document.querySelector('.content-area').innerHTML = `
        <div class="alert alert-info m-4">
          <h5><i class="bi bi-info-circle-fill me-2"></i>Cargando dashboard</h5>
          <p class="mb-0">Por favor, espere mientras se cargan los datos...</p>
        </div>
      `;
      
      const data = await api.getDashboard();
      console.log('Datos del dashboard (API):', data);
      
      const rol = data.rol === 1 ? "admin" : "usuario";
      
      if (rol === 'admin') {
        document.querySelector('.content-area').innerHTML = `
          <!-- Resumen de Reportes -->
          <div class="row mb-4">
              <div class="col-12 mb-4">
                  <div class="card shadow-sm border-0">
                      <div class="card-body p-4">
                          <h5 class="fw-bold mb-3">Bienvenido al Panel de Control</h5>
                          <p class="text-muted mb-0">Aquí encontrarás un resumen de la actividad y estadísticas del sistema de gestión de reportes.</p>
                      </div>
                  </div>
              </div>
          </div>
          
          <!-- Resumen de Reportes -->
          <div class="row mb-4">
              <div class="col-md-4 mb-3 mb-md-0">
                  <div class="stat-card card border-0 shadow-sm">
                      <div class="card-body p-4 d-flex align-items-center">
                          <div class="icon-container bg-primary bg-opacity-10">
                              <i class="bi bi-file-earmark-text text-primary fs-4"></i>
                          </div>
                          <div class="stat-content">
                              <div class="stat-title">Total Reportes</div>
                              <div class="stat-value text-primary" id="totalReportes">0</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="col-md-4 mb-3 mb-md-0">
                  <div class="stat-card card border-0 shadow-sm">
                      <div class="card-body p-4 d-flex align-items-center">
                          <div class="icon-container bg-warning bg-opacity-10">
                              <i class="bi bi-hourglass-split text-warning fs-4"></i>
                          </div>
                          <div class="stat-content">
                              <div class="stat-title">Reportes Pendientes</div>
                              <div class="stat-value text-warning" id="reportesPendientes">0</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="col-md-4">
                  <div class="stat-card card border-0 shadow-sm">
                      <div class="card-body p-4 d-flex align-items-center">
                          <div class="icon-container bg-success bg-opacity-10">
                              <i class="bi bi-check-circle text-success fs-4"></i>
                          </div>
                          <div class="stat-content">
                              <div class="stat-title">Reportes Resueltos</div>
                              <div class="stat-value text-success" id="reportesResueltos">0</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Gráficos y Estadísticas -->
          <div class="row">
              <!-- Reportes por Estado -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-pie-chart-fill text-primary"></i> Reportes por Estado</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="reportesPorEstadoChart"></canvas>
                      </div>
                  </div>
              </div>

              <!-- Reportes por Sede -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-building text-primary"></i> Reportes por Sede</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="reportesPorSedeChart"></canvas>
                      </div>
                  </div>
              </div>

              <!-- Reportes por Mes -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-calendar3 text-primary"></i> Reportes por Mes</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="reportesPorMesChart"></canvas>
                      </div>
                  </div>
              </div>

              <!-- Usuarios por Rol -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-people-fill text-primary"></i> Usuarios por Rol</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="usuariosPorRolChart"></canvas>
                      </div>
                  </div>
              </div>

              <!-- Equipos por Estado -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-pc-display text-primary"></i> Equipos por Estado</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="equiposPorEstadoChart"></canvas>
                      </div>
                  </div>
              </div>

              <!-- Equipos por Salón -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-geo-alt-fill text-primary"></i> Equipos por Salón</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="equiposPorSalonChart"></canvas>
                      </div>
                  </div>
              </div>
          </div>
        `;
        document.getElementById('totalReportes').textContent = data.pendientes + data.resueltos;
        document.getElementById('reportesPendientes').textContent = data.pendientes;
        document.getElementById('reportesResueltos').textContent = data.resueltos;
        
        pintarGraficasAdmin(data);
      } else {
        document.querySelector('.content-area').innerHTML = `
          <!-- Resumen de Reportes -->
          <div class="row mb-4">
              <div class="col-12 mb-4">
                  <div class="card shadow-sm border-0">
                      <div class="card-body p-4">
                          <h5 class="fw-bold mb-3">Bienvenido al Panel de Control</h5>
                          <p class="text-muted mb-0">Aquí encontrarás un resumen de tus reportes y estadísticas personales.</p>
                      </div>
                  </div>
              </div>
          </div>
          
          <!-- Resumen de Reportes -->
          <div class="row mb-4">
              <div class="col-md-4 mb-3 mb-md-0">
                  <div class="stat-card card border-0 shadow-sm">
                      <div class="card-body p-4 d-flex align-items-center">
                          <div class="icon-container bg-primary bg-opacity-10">
                              <i class="bi bi-file-earmark-text text-primary fs-4"></i>
                          </div>
                          <div class="stat-content">
                              <div class="stat-title">Total Reportes</div>
                              <div class="stat-value text-primary" id="totalReportes">0</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="col-md-4 mb-3 mb-md-0">
                  <div class="stat-card card border-0 shadow-sm">
                      <div class="card-body p-4 d-flex align-items-center">
                          <div class="icon-container bg-warning bg-opacity-10">
                              <i class="bi bi-hourglass-split text-warning fs-4"></i>
                          </div>
                          <div class="stat-content">
                              <div class="stat-title">Reportes Pendientes</div>
                              <div class="stat-value text-warning" id="reportesPendientes">0</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="col-md-4">
                  <div class="stat-card card border-0 shadow-sm">
                      <div class="card-body p-4 d-flex align-items-center">
                          <div class="icon-container bg-success bg-opacity-10">
                              <i class="bi bi-check-circle text-success fs-4"></i>
                          </div>
                          <div class="stat-content">
                              <div class="stat-title">Reportes Resueltos</div>
                              <div class="stat-value text-success" id="reportesResueltos">0</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Gráficos y Estadísticas -->
          <div class="row">
              <!-- Reportes por Estado -->
              <div class="col-lg-4 mb-4">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-pie-chart-fill text-primary"></i> Reportes por Estado</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="reportesPorEstadoChart"></canvas>
                      </div>
                  </div>
              </div>

              <!-- Reportes por Mes -->
              <div class="col-lg-4 mb-4" id="reportesPorMesContainer">
                  <div class="dashboard-box card border-0 shadow-sm">
                      <div class="card-header bg-white">
                          <h5 class="card-title"><i class="bi bi-calendar3 text-primary"></i> Tus Reportes por Mes</h5>
                      </div>
                      <div class="card-body">
                          <canvas id="reportesPorMesChart"></canvas>
                      </div>
                  </div>
              </div>
          </div>
        `;
        
        // Actualizar contadores en las tarjetas
        document.getElementById('totalReportes').textContent = data.pendientes + data.resueltos;
        document.getElementById('reportesPendientes').textContent = data.pendientes;
        document.getElementById('reportesResueltos').textContent = data.resueltos;
        
        pintarGraficasUsuario(data);
      }
    } catch (error) {
    console.error('Error al cargar dashboard:', error);
    document.querySelector('.content-area').innerHTML = `
      <div class="alert alert-danger m-4">
        <h5><i class="bi bi-exclamation-triangle-fill me-2"></i>Error al cargar el dashboard</h5>
        <p class="mb-0">No se pudieron cargar los datos. Error: ${error.message || 'Desconocido'}</p>
        <hr>
        <p class="mb-0">Verifica tu conexión a internet y que el servidor esté funcionando correctamente.</p>
        <button class="btn btn-outline-danger mt-3" onclick="window.location.reload()">Intentar nuevamente</button>
      </div>
    `;
    }
  });
}

if (window.location.pathname.endsWith('perfil.html')) {
  document.addEventListener('DOMContentLoaded', function () {
    cargarDatosUsuario();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      if (userId) {
        cargarUltimosReportes(userId, token);
      }
    }
  });
}

async function cargarDatosUsuario() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.id;

  try {
    const res = await fetch(`http://127.0.0.1:8000/usuarios/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Error al obtener el perfil de usuario');
    const data = await res.json();
    const user = data.usuario;
    let rolTexto = 'Desconocido';
    if (user.rol === 1) {
      rolTexto = 'Administrador';
    } else if (user.rol === 2) {
      rolTexto = 'Estudiante';
    } else if (user.rol === 3) {
      rolTexto = 'Profesor';
    }

    document.getElementById('nombreUsuario').textContent = `${user.nombre} ${user.apellido || ''}`;
    document.getElementById('descripcionUsuario').textContent = user.descripcion || 'Sin descripción';
    document.getElementById('correoUsuario').textContent = user.email;
    document.getElementById('rolUsuario').textContent = rolTexto;
    document.getElementById('fechaCreacionUsuario').textContent = user.fecha_creacion || 'N/D';

    document.getElementById('nombrePerfil').value = user.nombre;
    document.getElementById('emailPerfil').value = user.email;
    document.getElementById('descripcionPerfil').value = user.descripcion || '';

    if (user.img_usuario) {
      document.querySelector('.perfil-foto').src = user.img_usuario;
      document.getElementById('modalPerfilFoto').src = user.img_usuario;
    }
  } catch (err) {
    console.error('Error al cargar datos del usuario:', err);
  }
}

if (window.location.pathname.endsWith('perfil.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    document.getElementById('guardarPerfilBtn').addEventListener('click', actualizarPerfil);
    
    const cambiarFotoOverlay = document.querySelector('.cambiar-foto-overlay');
    const fotoPerfilInput = document.getElementById('fotoPerfilInput');
    
    if (cambiarFotoOverlay && fotoPerfilInput) {
      cambiarFotoOverlay.addEventListener('click', () => {
        fotoPerfilInput.click();
      });
      
      fotoPerfilInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            document.querySelector('.perfil-foto-editar').src = e.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }
  });
}

function validarSoloLetras(valor) {
  return /^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/.test(valor);
}

async function actualizarPerfil() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.id;
  const rol = payload.rol;

  const nombre = document.getElementById('nombrePerfil').value.trim();
  const email = document.getElementById('emailPerfil').value.trim();
  const descripcion = document.getElementById('descripcionPerfil').value.trim();
  const imagen = document.getElementById('fotoPerfilInput').files[0];

  if (!nombre || !email) {
    alert('El nombre y el correo son obligatorios.');
    return;
  }
  
  if (!validarSoloLetras(nombre)) {
    const nombrePerfilInput = document.getElementById('nombrePerfil');
    nombrePerfilInput.classList.add('is-invalid');
    
    if (!nombrePerfilInput.nextElementSibling || !nombrePerfilInput.nextElementSibling.classList.contains('invalid-feedback')) {
      const feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      feedback.innerHTML = '<strong>Nombre inválido:</strong> El nombre solo debe contener letras y espacios. No se permiten números ni caracteres especiales.';
      nombrePerfilInput.parentNode.insertBefore(feedback, nombrePerfilInput.nextSibling);
    }
    
    alert('No se puede actualizar el perfil: El nombre solo debe contener letras y espacios. No se permiten números ni caracteres especiales.');
    return;
  }
  
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('email', email);
  formData.append('descripcion', descripcion);
  formData.append('rol', rol);
  if (imagen) formData.append('imagen', imagen);

  try {
    const res = await fetch(`http://127.0.0.1:8000/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Error al actualizar el perfil');
    }

    const updatedUser = await res.json();

    cargarDatosUsuario();

    const modal = bootstrap.Modal.getInstance(document.getElementById('editarPerfilModal'));
    modal.hide();

    alert('Perfil actualizado exitosamente');
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    alert('Ocurrió un error al actualizar el perfil');
  }
}

export async function cargarUltimosReportes(idUsuario, token) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/reportes/usuario/${idUsuario}/ultimos`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const contenedor = document.getElementById("ultimosReportesUsuario");
    contenedor.innerHTML = '';

    if (!res.ok) throw new Error("No se pudieron obtener los reportes");

    const reportes = await res.json();

    if (reportes.length === 0) {
      contenedor.innerHTML = `<p class="text-muted">No hay reportes recientes.</p>`;
      return;
    }

    const row = document.createElement('div');
    row.className = 'row g-3';

        reportes.forEach((reporte, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-8 col-lg-6 mb-4';
      
      let badge = 'bg-warning text-dark';
      let estadoTexto = 'En proceso';
      if (reporte.estado_equipo?.toLowerCase() === 'pendiente') {
        badge = 'bg-secondary';
        estadoTexto = 'Pendiente';
      } else if (reporte.resuelto) {
        badge = 'bg-success';
        estadoTexto = 'Resuelto';
      }

      const fecha = new Date(reporte.fecha_registro).toISOString().split('T')[0];
      const descripcion = reporte.descripcion || 'Sin descripción';
      let ubicacion = 'Ubicación desconocida';
      if (reporte.equipo) {
        const sede = reporte.equipo.sede || 'Sin sede';
        const salon = reporte.equipo.salon || 'Sin salón';
        ubicacion = `Sede ${sede}, Salón ${salon}`;
      }

      col.innerHTML = `
        <div class="card reporte-card">
          <img src="${reporte.img_equipo || '../assets/img/pc1.jpg'}" class="card-img-top" alt="Reporte ${index + 1}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">Reporte #${reporte.ID_reporte}</h6>
              <span class="badge ${badge}">${estadoTexto}</span>
            </div>
            <p class="card-text text-muted small">${descripcion} - ${ubicacion}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">${fecha}</small>
              <i class="bi bi-arrow-right text-dark"></i>
            </div>
          </div>
        </div>
      `;

      row.appendChild(col);
    });

    contenedor.appendChild(row);
  } catch (err) {
    console.error("Error al cargar reportes:", err);
    const contenedor = document.getElementById("ultimosReportesUsuario");
    contenedor.innerHTML = `<p class="text-muted">No hay reportes recientes.</p>`;
  }
}