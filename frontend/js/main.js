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

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarBrand = document.getElementById('sidebarBrand');
    const sidebarLogo = document.getElementById('sidebarLogo');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function isMobile() {
        return window.innerWidth <= 991.98;
    }

    function toggleSidebar() {
        if (!isMobile()) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
            if (sidebar.classList.contains('collapsed')) {
                sidebarLogo.src = '../assets/img/IUB_Logo2.png';
            } else {
                sidebarLogo.src = '../assets/img/logo_IUB.png';
            }
        }
    }
    function toggleMobileSidebar() {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
    }
    function closeMobileSidebar() {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (mobileSidebarToggle) mobileSidebarToggle.addEventListener('click', toggleMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);
    document.addEventListener('click', function(e) {
        if (isMobile()) {
            if (!sidebar.contains(e.target) && (!mobileSidebarToggle || !mobileSidebarToggle.contains(e.target))) {
                closeMobileSidebar();
            }
        }
    });
    window.addEventListener('resize', function() {
        if (isMobile()) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            sidebarLogo.src = '../assets/img/logo_IUB.png';
            closeMobileSidebar();
        } else {
            closeMobileSidebar();
        }
    });
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (isMobile()) {
                closeMobileSidebar();
            }
        });
    });
    if (sidebarBrand) {
        sidebarBrand.addEventListener('click', function(e) {
            e.preventDefault();
            if (isMobile()) {
                closeMobileSidebar();
            } else {
                toggleSidebar();
            }
        });
    }
}

function renderReportes() {
    if (!window.apiMock) return;
    const reportes = window.apiMock.getReportes();
    const equipos = window.apiMock.getData('equipos');
    const usuarios = window.apiMock.getUsuarios();
    const container = document.getElementById('reportesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (reportes.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No hay reportes registrados.</div></div>';
        return;
    }
    
    reportes.forEach(r => {
        const equipo = equipos.find(e => e.ID_equipo === r.ID_equipo) || {};
        const usuario = usuarios.find(u => u.ID_usuarios === r.ID_usuario) || {};
        
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
                    <img src="../assets/img/${r.img_equipo || equipo.img || 'computer.png'}" 
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
    if (reportesContainer) {
        // Render inicial de tarjetas
        renderReportes();
    }
}

// Función para ver detalles del reporte
function verDetalleReporte(idReporte) {
    // Por ahora solo muestra un alert, pero se puede expandir para mostrar un modal
    const reportes = window.apiMock.getReportes();
    const reporte = reportes.find(r => r.ID_reporte === idReporte);
    if (reporte) {
        alert(`Detalles del reporte #${idReporte}:\n\nDescripción: ${reporte.descripcion}\nEstado: ${reporte.estado_equipo}\nFecha: ${reporte.fecha_registro ? new Date(reporte.fecha_registro).toLocaleDateString('es-ES') : 'No especificada'}`);
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
      try {
        await api.login(email, pass);
        // Aquí podrías guardar info de usuario si el backend lo permite
        window.location.href = 'homepage.html';
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

// --- PROTECCIÓN DE DASHBOARD ---
if (window.location.pathname.endsWith('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    const token = api.getToken();
    if (!token) {
      window.location.href = 'homepage.html';
      return;
    }
    // Aquí puedes cargar datos del dashboard usando api.getReportes(), api.getEquipos(), etc.
    // Indicadores
    const totalReportes = reportes.length;
    const pendientes = reportes.filter(r => !r.resuelto).length;
    const resueltos = reportes.filter(r => r.resuelto).length;
    const totalEquipos = equipos.length;
    const indicadoresRow = document.getElementById('indicadoresRow');
    if (indicadoresRow) {
      indicadoresRow.innerHTML = `
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-clipboard-data text-primary fs-2"></i></div>
              <h3 class="fw-bold">${totalReportes}</h3>
              <div class="text-muted">Total de Reportes</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-clock text-warning fs-2"></i></div>
              <h3 class="fw-bold text-warning">${pendientes}</h3>
              <div class="text-muted">Pendientes</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-check-circle text-success fs-2"></i></div>
              <h3 class="fw-bold text-success">${resueltos}</h3>
              <div class="text-muted">Resueltos</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-pc-display text-info fs-2"></i></div>
              <h3 class="fw-bold text-info">${totalEquipos}</h3>
              <div class="text-muted">Equipos Registrados</div>
            </div>
          </div>
        </div>
      `;
    }
    // Gráficas (ejemplo de datos)
    if (window.Chart) {
      // 1. Reportes por estado
      new Chart(document.getElementById('grafica1'), {
        type: 'doughnut',
        data: {
          labels: ['Pendientes', 'Resueltos'],
          datasets: [{
            data: [pendientes, resueltos],
            backgroundColor: ['#ffc107', '#198754']
          }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
      });
      // 2. Reportes por equipo
      const equiposLabels = equipos.map(e => e.codigo_barras);
      const reportesPorEquipo = equipos.map(e => reportes.filter(r => r.ID_equipo === e.ID_equipo).length);
      new Chart(document.getElementById('grafica2'), {
        type: 'bar',
        data: {
          labels: equiposLabels,
          datasets: [{ label: 'Reportes por Equipo', data: reportesPorEquipo, backgroundColor: '#0d6efd' }]
        },
        options: { plugins: { legend: { display: false } } }
      });
      // 3. Reportes por día (últimos 7 días)
      const dias = Array.from({length: 7}, (_,i) => {
        const d = new Date(); d.setDate(d.getDate()-i);
        return d.toISOString().split('T')[0];
      }).reverse();
      const reportesPorDia = dias.map(dia => reportes.filter(r => r.fecha_registro && r.fecha_registro.startsWith(dia)).length);
      new Chart(document.getElementById('grafica3'), {
        type: 'line',
        data: {
          labels: dias,
          datasets: [{ label: 'Reportes por Día', data: reportesPorDia, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', fill: true }]
        },
        options: { plugins: { legend: { display: false } } }
      });
      // 4. Reportes por usuario
      const usuariosLabels = usuarios.map(u => u.nombre);
      const reportesPorUsuario = usuarios.map(u => reportes.filter(r => r.ID_usuario === u.ID_usuarios).length);
      new Chart(document.getElementById('grafica4'), {
        type: 'bar',
        data: {
          labels: usuariosLabels,
          datasets: [{ label: 'Reportes por Usuario', data: reportesPorUsuario, backgroundColor: '#6610f2' }]
        },
        options: { plugins: { legend: { display: false } } }
      });
      // 5. Equipos funcionales vs no funcionales
      const funcionales = equipos.filter(e => e.funcional).length;
      const noFuncionales = equipos.length - funcionales;
      new Chart(document.getElementById('grafica5'), {
        type: 'pie',
        data: {
          labels: ['Funcionales', 'No funcionales'],
          datasets: [{ data: [funcionales, noFuncionales], backgroundColor: ['#198754', '#dc3545'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
      });
      // 6. Reportes por estado_equipo
      const estados = Array.from(new Set(reportes.map(r => r.estado_equipo)));
      const reportesPorEstado = estados.map(est => reportes.filter(r => r.estado_equipo === est).length);
      new Chart(document.getElementById('grafica6'), {
        type: 'bar',
        data: {
          labels: estados,
          datasets: [{ label: 'Reportes por Estado', data: reportesPorEstado, backgroundColor: '#fd7e14' }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
    // Tabla de registros recientes
    const tabla = document.getElementById('tablaRegistrosDashboard');
    if (tabla) {
      const equiposMap = Object.fromEntries(equipos.map(e => [e.ID_equipo, e]));
      const usuariosMap = Object.fromEntries(usuarios.map(u => [u.ID_usuarios, u]));
      const ultimos = [...reportes].sort((a,b) => (b.fecha_registro||'').localeCompare(a.fecha_registro||''))
        .slice(0, 10);
      tabla.querySelector('tbody').innerHTML = ultimos.map(r => `
        <tr>
          <td>${r.fecha_registro ? r.fecha_registro.split('T')[0] : ''}</td>
          <td>${equiposMap[r.ID_equipo]?.codigo_barras || '-'}</td>
          <td>${r.descripcion}</td>
          <td><span class="badge ${r.resuelto ? 'bg-success' : 'bg-warning text-dark'}">${r.estado_equipo}</span></td>
          <td>${usuariosMap[r.ID_usuario]?.nombre || '-'}</td>
        </tr>
      `).join('');
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