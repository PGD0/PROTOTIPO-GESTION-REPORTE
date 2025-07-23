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

// Eliminar la función setupSidebar() de aquí, ya que está definida en sidebar.js

// Variables globales para almacenar los datos
let todosLosReportes = [];
let todosLosEquipos = [];
let todosLosUsuarios = [];

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
            api.getUsuarios()
        ])
        .then(([reportes, equipos, usuarios]) => {
            todosLosReportes = reportes || [];
            todosLosEquipos = equipos || [];
            todosLosUsuarios = usuarios || [];
            
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
                return r.resuelto;
            }
            return true;
        });
    }
    
    // Filtro por sede
    if (filtros.sede) {
        reportesFiltrados = reportesFiltrados.filter(r => {
            const equipo = todosLosEquipos.find(e => e.ID_equipo === r.ID_equipo) || {};
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
                            <span>${equipo.salon || r.salon || 'Ubicación no especificada'}</span>
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

// --- INTEGRACIÓN LOGIN ---
if (window.location.pathname.endsWith('login.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    form.appendChild(errorDiv);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const pass = passInput.value;
      errorDiv.classList.add('d-none');
      // Validación básica
      if (!email || !pass) {
        errorDiv.textContent = 'Por favor, completa todos los campos.';
        errorDiv.classList.remove('d-none');
        return;
      }
      try {
        const data = await api.login(email, pass);
        if (!data || !data.access_token) {
          throw new Error('No se recibió el token de autenticación.');
        }
        
        // Obtener información del usuario actual
        const usuarios = await api.getUsuarios();
        const currentUser = usuarios.find(user => user.email === email);
        
        // Guardar información del usuario en localStorage
        if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Redirigir según el rol del usuario
        if (currentUser && currentUser.rol === 1) { // Administrador
          window.location.href = 'dashboard.html';
        } else { // Usuario normal
          window.location.href = 'homepage.html';
        }
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
}

// --- INTEGRACIÓN REGISTRO ---
if (window.location.pathname.endsWith('register.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const nombre = document.getElementById('firstName');
    const apellido = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    form.appendChild(errorDiv);
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-3 d-none';
    form.appendChild(successDiv);
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');
      
      const email = emailInput.value.trim();
      const pass = passInput.value;
      
      console.log('Iniciando registro...');
      
      try {
        const userData = await api.register({
          nombre: nombre.value.trim(),
          apellido: apellido.value.trim(),
          email,
          contraseña: pass,
          rol: 2 // Por defecto usuario normal
        });
        
        console.log('Registro exitoso:', userData);
        successDiv.textContent = 'Usuario registrado exitosamente. Redirigiendo...';
        successDiv.classList.remove('d-none');
        
        // Esperar un momento antes de redirigir
        setTimeout(() => {
          window.location.href = 'homepage.html';
        }, 2000);
        
      } catch (err) {
        console.error('Error en registro:', err);
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
}

function pintarGraficasUsuario(data) {
  // GRAFICA 1 - Resueltos vs Pendientes
  new Chart(document.getElementById('grafica1'), {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Resueltos'],
      datasets: [{
        data: [data.pendientes, data.resueltos],
        backgroundColor: ['#ffc107', '#198754']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // GRAFICA 2 - Reportes por mes (propios)
  if (data.reportes_mensuales && Object.keys(data.reportes_mensuales).length > 0) {
    new Chart(document.getElementById('grafica2'), {
      type: 'bar',
      data: {
        labels: Object.keys(data.reportes_mensuales),
        datasets: [{
          label: 'Tus Reportes por Mes',
          data: Object.values(data.reportes_mensuales),
          backgroundColor: '#0dcaf0'
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  }

  // GRAFICA 3 - Total equipos reportados (gráfico de barras simple)
  new Chart(document.getElementById('grafica3'), {
    type: 'bar',
    data: {
      labels: ['Equipos reportados'],
      datasets: [{
        label: 'Total',
        data: [data.equipos_reportados],
        backgroundColor: '#fd7e14'
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // GRAFICA 4 - Últimos reportes por estado
  if (data.ultimos_reportes && data.ultimos_reportes.length > 0) {
    const fechas = data.ultimos_reportes.map(r => new Date(r.fecha).toLocaleDateString('es-ES'));
    const estados = data.ultimos_reportes.map(r => r.estado === 'Resuelto' ? 1 : 0);
    new Chart(document.getElementById('grafica4'), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Estado de últimos reportes',
          data: estados,
          backgroundColor: 'rgba(13,110,253,0.2)',
          borderColor: '#0d6efd',
          fill: true
        }]
      },
      options: {
        plugins: {
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
          }
        }
      }
    });
  }
}

function pintarGraficasAdmin(data) {
  // GRAFICA 1: Pendientes vs Resueltos
  new Chart(document.getElementById('grafica1'), {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Resueltos'],
      datasets: [{
        data: [data.pendientes, data.resueltos],
        backgroundColor: ['#ffc107', '#198754']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // GRAFICA 2: Equipos funcionales vs no funcionales
  new Chart(document.getElementById('grafica2'), {
    type: 'pie',
    data: {
      labels: ['Funcionales', 'No Funcionales'],
      datasets: [{
        data: [data.equipos_funcionales, data.equipos_no_funcionales],
        backgroundColor: ['#0d6efd', '#dc3545']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // GRAFICA 3: Reportes por sede
  const sedes = data.reportes_por_sede.map(d => d.sede);
  const cantidadesSedes = data.reportes_por_sede.map(d => d.cantidad);
  new Chart(document.getElementById('grafica3'), {
    type: 'bar',
    data: {
      labels: sedes,
      datasets: [{
        label: 'Reportes por Sede',
        data: cantidadesSedes,
        backgroundColor: '#6610f2'
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // GRAFICA 4: Reportes por mes
  const meses = data.reportes_por_mes.map(d => `Mes ${d.mes}`);
  const cantidadesMes = data.reportes_por_mes.map(d => d.cantidad);
  new Chart(document.getElementById('grafica4'), {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Reportes por Mes',
        data: cantidadesMes,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.2)',
        fill: true
      }]
    },
    options: { plugins: { legend: { display: true } } }
  });

  // GRAFICA 5: Equipos por salón
  const salones = data.equipos_por_salon.map(d => d.salon);
  const cantidadesSalon = data.equipos_por_salon.map(d => d.cantidad);
  new Chart(document.getElementById('grafica5'), {
    type: 'bar',
    data: {
      labels: salones,
      datasets: [{
        label: 'Equipos por Salón',
        data: cantidadesSalon,
        backgroundColor: '#fd7e14'
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // GRAFICA 6: Usuarios por rol
  const roles = data.usuarios_por_rol.map(d => d.rol);
  const cantidadesRol = data.usuarios_por_rol.map(d => d.cantidad);
  new Chart(document.getElementById('grafica6'), {
    type: 'pie',
    data: {
      labels: roles,
      datasets: [{
        data: cantidadesRol,
        backgroundColor: ['#198754', '#0dcaf0', '#6f42c1']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}



// --- PROTECCIÓN DE DASHBOARD ---
if (window.location.pathname.endsWith('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      const data = await api.getDashboard();
      console.log('Datos del dashboard:', data);
      const rol = data.rol === 1 ? "admin" : "usuario";

      if (rol === 'admin') {
        pintarGraficasAdmin(data);
      } else {
        pintarGraficasUsuario(data);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', err);
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
        // Aquí deberías obtener el usuario actual (ID_usuario) de localStorage o backend
        const ID_usuario = 1; // Ajustar según implementación real
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
    document.getElementById('nombreUsuario').textContent = user.nombre;
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