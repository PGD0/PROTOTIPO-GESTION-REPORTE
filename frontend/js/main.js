// main.js - Unificado (sidebar y vista de reportes)

document.addEventListener('DOMContentLoaded', function() {
    setupSidebar();
    setupVistaReportes();
    // Renderizar reportes siempre al cargar la página de reportes
    if (window.location.pathname.endsWith('reportes.html')) {
        const reportesContainer = document.getElementById('reportesContainer');
        if (reportesContainer) {
            reportesContainer.classList.add('vista-tarjetas');
            renderReportes('tarjetas');
        }
    }
    // --- MOSTRAR ENLACE DE GESTIÓN DE USUARIOS EN SIDEBAR SOLO PARA ADMIN ---
    const session = window.apiMock && window.apiMock.getSession && window.apiMock.getSession();
    const roles = window.apiMock && window.apiMock.getRoles && window.apiMock.getRoles();
    if (!session || !roles) return;
    const rol = roles.find(r => r.ID_rol === session.rol);
    if (rol && rol.tipo_rol === 'Administrador') {
        document.querySelectorAll('.sidebar-nav').forEach(nav => {
            if (!nav.querySelector('#gestionUsuariosSidebar')) {
                const div = document.createElement('div');
                div.className = 'nav-item';
                div.innerHTML = `<a href="gestion-usuarios.html" class="nav-link" id="gestionUsuariosSidebar"><i class="bi bi-people"></i> <span>Gestión de Usuarios</span></a>`;
                nav.insertBefore(div, nav.querySelector('hr.my-3'));
            }
        });
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

function renderReportes(modo = 'tarjetas') {
    if (!window.apiMock) return;
    const reportes = window.apiMock.getReportes();
    const equipos = window.apiMock.getData('equipos');
    const usuarios = window.apiMock.getUsuarios();
    const container = document.getElementById('reportesContainer');
    if (!container) return;
    container.innerHTML = '';
    if (reportes.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay reportes registrados.</div>';
        return;
    }
    if (modo === 'tarjetas') {
        reportes.forEach(r => {
            const equipo = equipos.find(e => e.ID_equipo === r.ID_equipo) || {};
            // Estado visual y progreso
            let estado = 'Pendiente', badge = 'bg-warning text-dark';
            if (r.estado_equipo && r.estado_equipo.toLowerCase().includes('proceso')) {
                estado = 'En Proceso'; badge = 'bg-warning text-dark';
            } else if (r.resuelto) {
                estado = 'Resuelto'; badge = 'bg-success';
            }
            const card = document.createElement('div');
            card.className = 'reporte-card col-12 col-md-6 col-lg-4';
            card.innerHTML = `
                <div class="card h-100">
                    <img src="../assets/img/${r.img_equipo || equipo.img || 'computer.png'}" class="card-img-top" alt="Equipo" style="object-fit: cover; height: 180px; min-height: 180px; max-height: 220px;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="text-muted small d-block mb-1"><i class="bi bi-calendar me-1"></i>${r.fecha_registro ? r.fecha_registro.split('T')[0] : ''}</span>
                                <h5 class="card-title fw-bold mb-1">${r.descripcion}</h5>
                            </div>
                            <span class="badge ${badge} align-self-start"><i class="bi ${estado === 'Resuelto' ? 'bi-check-circle' : estado === 'En Proceso' ? 'bi-clock' : 'bi-exclamation-circle'} me-1"></i>${estado}</span>
                        </div>
                        <p class="card-text text-muted mb-2">${equipo.salon || r.salon || ''}</p>
                        <p class="card-text mb-0">${r.detalle || r.descripcion || ''}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } else if (modo === 'lista') {
        const table = document.createElement('table');
        table.className = 'table table-striped';
        table.innerHTML = `
            <thead><tr><th>Fecha</th><th>Descripción</th><th>Estado</th><th>Equipo</th><th>Usuario</th><th>Resuelto</th></tr></thead>
            <tbody>
                ${reportes.map(r => {
                    const equipo = equipos.find(e => e.ID_equipo === r.ID_equipo) || {};
                    const usuario = usuarios.find(u => u.ID_usuarios === r.ID_usuario) || {};
                    return `
                    <tr>
                        <td>${r.fecha_registro ? r.fecha_registro.split('T')[0] : ''}</td>
                        <td>${r.descripcion}</td>
                        <td>${r.estado_equipo || ''}</td>
                        <td>${equipo.codigo_barras || ''}</td>
                        <td>${usuario.nombre || ''}</td>
                        <td>${r.resuelto ? 'Sí' : 'No'}</td>
                    </tr>
                `}).join('')}
            </tbody>
        `;
        container.appendChild(table);
    }
}

function setupVistaReportes() {
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const toggleViewIcon = document.getElementById('toggleViewIcon');
    const reportesContainer = document.getElementById('reportesContainer');
    let isArticulosView = true;
    if (toggleViewBtn && toggleViewIcon && reportesContainer) {
        toggleViewBtn.addEventListener('click', function() {
            isArticulosView = !isArticulosView;
            if (isArticulosView) {
                reportesContainer.classList.remove('vista-lista');
                reportesContainer.classList.add('vista-tarjetas');
                toggleViewIcon.classList.remove('bi-list-ul');
                toggleViewIcon.classList.add('bi-grid-3x3-gap');
                renderReportes('tarjetas');
            } else {
                reportesContainer.classList.remove('vista-tarjetas');
                reportesContainer.classList.add('vista-lista');
                toggleViewIcon.classList.remove('bi-grid-3x3-gap');
                toggleViewIcon.classList.add('bi-list-ul');
                renderReportes('lista');
            }
        });
        // Render inicial
        renderReportes('tarjetas');
    }
}

// --- INTEGRACIÓN LOGIN ---
if (window.location.pathname.endsWith('login.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    await window.apiMock.initMockDB();
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    form.appendChild(errorDiv);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const pass = passInput.value;
      const res = window.apiMock.login(email, pass);
      if (res.success) {
        if (window.apiMock.isAdmin(res.user)) {
          window.location.href = 'dashboard.html';
        } else {
          window.location.href = 'homepage.html';
        }
      } else {
        errorDiv.textContent = res.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
}

// --- INTEGRACIÓN REGISTRO ---
if (window.location.pathname.endsWith('register.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    await window.apiMock.initMockDB();
    const form = document.querySelector('form');
    const nombre = document.getElementById('firstName');
    const apellido = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    form.appendChild(errorDiv);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const pass = passInput.value;
      const res = window.apiMock.register(
        nombre.value.trim(),
        apellido.value.trim(),
        email,
        pass
      );
      if (res.success) {
        window.location.href = 'homepage.html';
      } else {
        errorDiv.textContent = res.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
}

// --- PROTECCIÓN DE DASHBOARD ---
if (window.location.pathname.endsWith('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    await window.apiMock.initMockDB();
    const session = window.apiMock.getSession();
    if (!session || !window.apiMock.isAdmin(session)) {
      window.location.href = 'homepage.html';
    }
    const reportes = window.apiMock.getReportes();
    const equipos = window.apiMock.getData('equipos');
    const usuarios = window.apiMock.getUsuarios();
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
    await window.apiMock.initMockDB();
    const session = window.apiMock.getSession();
    if (!session) {
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
    // Opcional: cargar equipos en select
    if (equipo && equipo.tagName === 'SELECT') {
      const equipos = window.apiMock.getData('equipos');
      equipo.innerHTML = '<option value="">Selecciona un equipo</option>' +
        equipos.map(eq => `<option value="${eq.ID_equipo}">${eq.codigo_barras} (${eq.marca})</option>`).join('');
    }
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');
      if (!desc.value.trim() || !equipo.value) {
        errorDiv.textContent = 'Debes completar todos los campos.';
        errorDiv.classList.remove('d-none');
        return;
      }
      const nuevo = {
        ID_equipo: parseInt(equipo.value),
        descripcion: desc.value.trim(),
        img_equipo: '',
        estado_equipo: 'Pendiente',
        resuelto: 0,
        ID_usuario: session.ID_usuarios
      };
      window.apiMock.addReporte(nuevo);
      successDiv.textContent = 'Reporte añadido correctamente.';
      successDiv.classList.remove('d-none');
      form.reset();
    });
  });
} 