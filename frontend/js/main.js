// main.js - Unificado (sidebar y vista de reportes)
import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    setupVistaReportes();
    // Renderizar reportes siempre al cargar la página de reportes
    if (window.location.pathname.endsWith('reportes.html')) {
        const reportesContainer = document.getElementById('reportesContainer');
        if (reportesContainer) {
            renderReportes();
        }
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

// Variables globales para almacenar los datos
let todosLosReportes = [];
let todosLosEquipos = [];
let todosLosUsuarios = [];
let todasLasSedes = [];

function renderReportes(filtros = {}) {
    // Usar API real
    const container = document.getElementById('reportesContainer');
    if (!container) return;
    
    // Si no tenemos datos cargados, los obtenemos primero
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
            
            // Actualizar el filtro de sedes con datos dinámicos
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
    
    // Aplicar filtros
    let reportesFiltrados = todosLosReportes;
    
    // Filtrar reportes resueltos (siempre se aplica este filtro)
    reportesFiltrados = reportesFiltrados.filter(r => !r.resuelto);
    
    // Filtro por estado
    if (filtros.estado) {
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (filtros.estado === 'pendiente') {
                return r.estado_equipo === 'Pendiente' || !r.estado_equipo;
            } else if (filtros.estado === 'en-proceso') {
                // Modificación: Considerar como "en proceso" los reportes que no están resueltos
                // y tienen un estado_equipo que no es "Pendiente" ni "Solucionado"
                return !r.resuelto && r.estado_equipo && 
                       r.estado_equipo !== 'Pendiente' && 
                       r.estado_equipo !== 'Solucionado';
            } else if (filtros.estado === 'resuelto') {
                return false; // No mostrar reportes resueltos aunque se seleccione este filtro
            }
            return true;
        });
    }
    
    // Filtro por sede
    if (filtros.sede) {
        reportesFiltrados = reportesFiltrados.filter(r => {
            const equipo = todosLosEquipos.find(e => e.ID_equipo === r.ID_equipo) || {};
            // Verificar si el nombre de la sede coincide con el filtro
            if (equipo.sede) {
                return equipo.sede.toLowerCase().includes(filtros.sede.toLowerCase());
            }
            // Si no se encuentra la sede, intentar filtrar por el nombre del salón
            const ubicacion = equipo.salon || r.salon || '';
            return ubicacion.toLowerCase().includes(filtros.sede.toLowerCase());
        });
    }
    
    // Filtro por fecha desde
    if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde);
        fechaDesde.setHours(0, 0, 0, 0);
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (!r.fecha_registro) return false;
            const fechaReporte = new Date(r.fecha_registro);
            return fechaReporte >= fechaDesde;
        });
    }
    
    // Filtro por fecha hasta
    if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        reportesFiltrados = reportesFiltrados.filter(r => {
            if (!r.fecha_registro) return false;
            const fechaReporte = new Date(r.fecha_registro);
            return fechaReporte <= fechaHasta;
        });
    }
    
    // Mostrar mensaje si no hay reportes
    if (reportesFiltrados.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No hay reportes que coincidan con los filtros seleccionados.</div></div>';
        return;
    }
    
    // Renderizar reportes filtrados
    container.innerHTML = '';
    reportesFiltrados.forEach(r => {
        const equipo = todosLosEquipos.find(e => e.ID_equipo === r.ID_equipo) || {};
        const usuario = todosLosUsuarios.find(u => u.ID_usuarios === r.ID_usuario) || {};
        
        // Estado visual y badge
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
                                    // Mostrar sede y salón si están disponibles
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

// Función para actualizar el filtro de sedes con datos dinámicos
function actualizarFiltroSedes() {
    const filtroSede = document.getElementById('filtro-sede');
    if (!filtroSede) return;
    
    // Guardar el valor seleccionado actualmente (si hay)
    const valorSeleccionado = filtroSede.value;
    
    // Limpiar opciones actuales, manteniendo solo la opción por defecto
    filtroSede.innerHTML = '<option value="">Todas las sedes</option>';
    
    // Agregar las sedes desde la API
    if (todasLasSedes && todasLasSedes.length > 0) {
        todasLasSedes.forEach(sede => {
            const option = document.createElement('option');
            option.value = sede.nombre_sede.toLowerCase();
            option.textContent = sede.nombre_sede;
            filtroSede.appendChild(option);
        });
    }
    
    // Restaurar el valor seleccionado si existía
    if (valorSeleccionado) {
        filtroSede.value = valorSeleccionado;
    }
}

function setupVistaReportes() {
    const reportesContainer = document.getElementById('reportesContainer');
    if (!reportesContainer) return;
    
    // Configurar eventos de filtros
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroSede = document.getElementById('filtro-sede');
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde');
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta');
    
    // Función para aplicar filtros
    function aplicarFiltros() {
        const filtros = {
            estado: filtroEstado ? filtroEstado.value : '',
            sede: filtroSede ? filtroSede.value : '',
            fechaDesde: filtroFechaDesde ? filtroFechaDesde.value : '',
            fechaHasta: filtroFechaHasta ? filtroFechaHasta.value : ''
        };
        renderReportes(filtros);
    }
    
    // Asignar eventos de cambio a los filtros
    if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
    if (filtroSede) filtroSede.addEventListener('change', aplicarFiltros);
    if (filtroFechaDesde) filtroFechaDesde.addEventListener('change', aplicarFiltros);
    if (filtroFechaHasta) filtroFechaHasta.addEventListener('change', aplicarFiltros);
    
    // Render inicial de tarjetas
    renderReportes();
}

// Función para ver detalles del reporte
function verDetalleReporte(idReporte) {
    // Por ahora solo muestra un alert, pero se puede expandir para mostrar un modal
    const reporte = todosLosReportes.find(r => r.ID_reporte === idReporte);
    if (reporte) {
        alert(`Detalles del reporte #${idReporte}:\n\nDescripción: ${reporte.descripcion}\nEstado: ${reporte.estado_equipo}\nFecha: ${reporte.fecha_registro ? new Date(reporte.fecha_registro).toLocaleDateString('es-ES') : 'No especificada'}`);
    } else {
        api.getReportes()
            .then(reportes => {
                const reporte = reportes.find(r => r.ID_reporte === idReporte);
                if (reporte) {
                    alert(`Detalles del reporte #${idReporte}:\n\nDescripción: ${reporte.descripcion}\nEstado: ${reporte.estado_equipo}\nFecha: ${reporte.fecha_registro ? new Date(reporte.fecha_registro).toLocaleDateString('es-ES') : 'No especificada'}`);
                }
            })
            .catch(error => {
                console.error('Error al obtener detalles del reporte:', error);
                alert('Error al obtener detalles del reporte');
            });
    }
}

function pintarGraficasUsuario(data) {
  // Configuración común para todos los gráficos
  Chart.defaults.font.family = "'Inter', 'Poppins', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#495057';
  
  // Paleta de colores consistente
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
  
  // GRAFICA 1 - Resueltos vs Pendientes
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

  // GRAFICA 2 - Reportes por mes (propios)
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

  // GRAFICA 3 - Estado de últimos reportes
  if (data.ultimos_reportes && data.ultimos_reportes.length > 0) {
    // Crear un nuevo elemento para el gráfico de últimos reportes si no existe
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

  // GRAFICA 4 - Últimos reportes por estado
  if (data.ultimos_reportes && data.ultimos_reportes.length > 0) {
    // Crear un nuevo elemento para el gráfico de reportes por estado del usuario si no existe
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
    const fechas = data.ultimos_reportes.map(r => new Date(r.fecha).toLocaleDateString('es-ES'));
    const estados = data.ultimos_reportes.map(r => r.estado === 'Resuelto' ? 1 : 0);
    new Chart(document.getElementById('reportesPorEstadoUsuarioChart'), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Estado de reportes',
          data: estados,
          backgroundColor: 'rgba(13,110,253,0.1)',
          borderColor: colorPalette.primary,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: colorPalette.primary,
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
            grid: {
              display: false
            }
          }
        }
      }
    });
  } else {
    ocultarGraficaSiVacia('reportesPorMesChart', false);
  }

  ocultarGraficaSiVacia('grafica5', false);
  ocultarGraficaSiVacia('grafica6', false);
}

function pintarGraficasAdmin(data) {
  // Actualizar contadores en las tarjetas
  document.getElementById('totalReportes').textContent = data.pendientes + data.resueltos;
  document.getElementById('reportesPendientes').textContent = data.pendientes;
  document.getElementById('reportesResueltos').textContent = data.resueltos;
  
  // Configuración común para todos los gráficos
  Chart.defaults.font.family = "'Inter', 'Poppins', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#495057';
  
  // Paleta de colores consistente
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
  
  // GRAFICA 1: Pendientes vs Resueltos
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

  // GRAFICA 2: Equipos funcionales vs no funcionales
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

  // GRAFICA 3: Reportes por sede
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

  // GRAFICA 4: Reportes por mes
  const meses = data.reportes_por_mes.map(d => {
    // Convertir número de mes a nombre
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

  // GRAFICA 5: Equipos por salón
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
      indexAxis: 'y',  // Barras horizontales para mejor visualización
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

  // GRAFICA 6: Usuarios por rol
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



// --- PROTECCIÓN DE DASHBOARD ---
if (window.location.pathname.includes('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      // Mostrar mensaje de carga
      document.querySelector('.content-area').innerHTML = `
        <div class="alert alert-info m-4">
          <h5><i class="bi bi-info-circle-fill me-2"></i>Cargando dashboard</h5>
          <p class="mb-0">Por favor, espere mientras se cargan los datos...</p>
        </div>
      `;
      
      // Obtener datos reales del dashboard (siempre usar datos reales, nunca datos de prueba)
      const data = await api.getDashboard();
      console.log('Datos del dashboard (API):', data);
      
      // Restaurar contenido original
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
            <div class="col-lg-6 mb-4">
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
            <div class="col-lg-6 mb-4">
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
            <div class="col-lg-8 mb-4">
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
            <div class="col-lg-6 mb-4">
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
            <div class="col-lg-6 mb-4">
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
      
      // Actualizar contadores en las tarjetas (para ambos roles)
      document.getElementById('totalReportes').textContent = data.pendientes + data.resueltos;
      document.getElementById('reportesPendientes').textContent = data.pendientes;
      document.getElementById('reportesResueltos').textContent = data.resueltos;

      const rol = data.rol === 1 ? "admin" : "usuario";
      if (rol === 'admin') {
        pintarGraficasAdmin(data);
      } else {
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

// --- AÑADIR REPORTE ---
if (window.location.pathname.endsWith('hacer-reporte.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    const token = api.getToken();
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    const form = document.querySelector('form');
    if (!form) return;
    const desc = document.getElementById('descripcion');
    const equipo = document.getElementById('equipo');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    form.appendChild(errorDiv);
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-3 d-none';
    form.appendChild(successDiv);
    // Cargar equipos en select
    if (equipo && equipo.tagName === 'SELECT') {
      try {
        const equipos = await api.getEquipos();
        equipo.innerHTML = '<option value="">Selecciona un equipo</option>' +
          equipos.map(eq => `<option value="${eq.ID_equipo}">${eq.codigo_barras} (${eq.marca})</option>`).join('');
      } catch (err) {
        errorDiv.textContent = 'Error cargando equipos';
        errorDiv.classList.remove('d-none');
      }
    }
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');
      if (!desc.value.trim() || !equipo.value) {
        errorDiv.textContent = 'Debes completar todos los campos.';
        errorDiv.classList.remove('d-none');
        return;
      }
      try {
        // Obtener el usuario actual desde localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const ID_usuario = currentUser?.ID_usuarios || 1; // Usar ID del usuario actual o 1 como fallback
        await api.crearReporte({
          ID_equipo: parseInt(equipo.value),
          descripcion: desc.value.trim(),
          estado_equipo: 'Pendiente',
          ID_usuario,
          resuelto: false,
          imagen: new File([], 'placeholder.png') // Ajustar para subir imagen real
        });
        successDiv.textContent = 'Reporte añadido correctamente.';
        successDiv.classList.remove('d-none');
        form.reset();
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
}

// --- PERFIL DE USUARIO ---
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

  // Decodificar el JWT (sin verificar firma, solo extraer payload)
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

    // Rellenar elementos en la vista
    document.getElementById('nombreUsuario').textContent = `${user.nombre} ${user.apellido || ''}`;
    document.getElementById('descripcionUsuario').textContent = user.descripcion || 'Sin descripción';
    document.getElementById('correoUsuario').textContent = user.email;
    document.getElementById('rolUsuario').textContent = rolTexto;
    document.getElementById('fechaCreacionUsuario').textContent = user.fecha_creacion || 'N/D';

    // Rellenar modal de edición
    document.getElementById('nombrePerfil').value = user.nombre;
    document.getElementById('emailPerfil').value = user.email;
    document.getElementById('descripcionPerfil').value = user.descripcion || '';

    // Imagen si existe
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
    
    // Agregar event listener para el cambio de foto
    const cambiarFotoOverlay = document.querySelector('.cambiar-foto-overlay');
    const fotoPerfilInput = document.getElementById('fotoPerfilInput');
    
    if (cambiarFotoOverlay && fotoPerfilInput) {
      cambiarFotoOverlay.addEventListener('click', () => {
        fotoPerfilInput.click();
      });
      
      // Mostrar vista previa de la imagen seleccionada
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
  
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('email', email);
  formData.append('descripcion', descripcion);
  formData.append('rol', rol); // Asegurarse de que el rol sea un número válido
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

    // Actualizar datos visuales en pantalla
    cargarDatosUsuario();

    // Cerrar modal
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

    // Crear contenedor con row y espaciado entre columnas
    const row = document.createElement('div');
    row.className = 'row g-3';

    reportes.forEach((reporte, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4';

      // Determinar estado y badge
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
      const ubicacion = reporte.ubicacion || 'Ubicación desconocida';

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