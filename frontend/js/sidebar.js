import api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    renderSidebarNav();
    setupSidebar();
});

function renderSidebarNav() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';

    const linksPublicos = [
        {
            href: 'homepage.html',
            icon: 'bi-house',
            text: 'Inicio',
            id: 'homepageLink',
            active: window.location.pathname.endsWith('homepage.html')
        },
        {
            href: 'reportes.html',
            icon: 'bi-file-earmark-text',
            text: 'Reportes',
            id: 'reportesLink',
            active: window.location.pathname.endsWith('reportes.html')
        },
        {
            href: 'hacer-reporte.html',
            icon: 'bi-plus-circle',
            text: 'Nuevo Reporte',
            id: 'nuevoReporteLink',
            active: window.location.pathname.endsWith('hacer-reporte.html')
        },
        {
            href: 'dashboard.html',
            icon: 'bi-graph-up',
            text: 'Dashboard',
            id: 'dashboardLink',
            active: window.location.pathname.endsWith('dashboard.html')
        }
    ];
    linksPublicos.forEach(link => {
        nav.appendChild(crearNavItem(link));
    });

    nav.appendChild(document.createElement('hr')).className = 'my-3';

    const token = api.getToken();
    let esAdmin = false;
    if (token) {
        try {
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                esAdmin = currentUser && currentUser.rol === 1;
            }
        } catch (error) {
            console.error('Error al verificar el rol de administrador:', error);
        }
    }
    if (esAdmin) {
        const linksAdmin = [
            {
                href: 'gestion-usuarios.html',
                icon: 'bi-people',
                text: 'Gestión de Usuarios',
                id: 'gestionUsuariosLink',
                active: window.location.pathname.endsWith('gestion-usuarios.html')
            },
            {
                href: 'gestion-reportes.html',
                icon: 'bi-clipboard-data',
                text: 'Gestión de Reportes',
                id: 'gestionReportesLink',
                active: window.location.pathname.endsWith('gestion-reportes.html')
            },
            {
                href: 'gestion-equipos.html',
                icon: 'bi-pc-display',
                text: 'Gestión de Equipos',
                id: 'gestionEquiposLink',
                active: window.location.pathname.endsWith('gestion-equipos.html')
            }
        ];
        linksAdmin.forEach(link => {
            nav.appendChild(crearNavItem(link));
        });
        nav.appendChild(document.createElement('hr')).className = 'my-3';
    }

    nav.appendChild(crearNavItem({
        href: '../index.html',
        icon: 'bi-box-arrow-right',
        text: 'Salir',
        id: 'salirLink',
        active: false
    }));
}

function crearNavItem({href, icon, text, id, active}) {
    const div = document.createElement('div');
    div.className = 'nav-item';
    const a = document.createElement('a');
    a.href = href;
    a.className = 'nav-link' + (active ? ' active' : '');
    a.id = id;
    a.innerHTML = `<i class="bi ${icon}"></i> <span>${text}</span>`;
    div.appendChild(a);
    return div;
}

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