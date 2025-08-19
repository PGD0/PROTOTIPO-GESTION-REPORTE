import api from './api.js';
export function initSidebar() {
    injectSidebarHTML();
    renderSidebarNav();
    setupSidebar();
}

function injectSidebarHTML() {
    if (document.getElementById('sidebar')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    document.body.prepend(overlay);
    
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';
    
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <a class="sidebar-brand" id="sidebarBrand" style="cursor:pointer;">
                <img src="../assets/img/logo_IUB.png" alt="Logo IUB" id="sidebarLogo">
            </a>
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="bi bi-list"></i>
            </button>
        </div>
        
        <nav class="sidebar-nav">
            <!-- Los enlaces se generarán dinámicamente -->
        </nav>
    `;
    
    document.body.prepend(sidebar);
    
    let mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        mainContent = document.createElement('div');
        mainContent.className = 'main-content-wrapper';
        mainContent.id = 'mainContent';
        
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (child !== sidebar && child !== overlay && child.tagName !== 'SCRIPT') {
                mainContent.appendChild(child);
            }
        });
        
        document.body.appendChild(mainContent);
    }
    
    const topNavbar = mainContent.querySelector('.top-navbar');
    if (topNavbar) {
        const mobileToggle = topNavbar.querySelector('#mobileSidebarToggle');
        if (!mobileToggle) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'btn btn-link d-lg-none me-3';
            toggleButton.id = 'mobileSidebarToggle';
            toggleButton.innerHTML = '<i class="bi bi-list fs-4"></i>';
            
            const firstChild = topNavbar.querySelector('.d-flex');
            if (firstChild) {
                firstChild.prepend(toggleButton);
            }
        }
    }
}

function renderSidebarNav() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';

    const currentPath = window.location.pathname;
    
    const linksPublicos = [
        {
            href: 'homepage.html',
            icon: 'bi-house',
            text: 'Inicio',
            id: 'homepageLink',
            active: currentPath.endsWith('homepage.html')
        },
        {
            href: 'mis-reporte.html',
            icon: 'bi-list-check',
            text: 'Mis Reportes',
            id: 'misReportesLink',
            active: currentPath.endsWith('mis-reporte.html')
        },
        {
            href: 'reportes.html',
            icon: 'bi-file-earmark-text',
            text: 'Reportes',
            id: 'reportesLink',
            active: currentPath.endsWith('reportes.html') && !currentPath.endsWith('gestion-reportes.html')
        },
        {
            href: 'hacer-reporte.html',
            icon: 'bi-plus-circle',
            text: 'Nuevo Reporte',
            id: 'nuevoReporteLink',
            active: currentPath.endsWith('hacer-reporte.html')
        },
        {
            href: 'dashboard.html',
            icon: 'bi-graph-up',
            text: 'Dashboard',
            id: 'dashboardLink',
            active: currentPath.endsWith('dashboard.html')
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
                active: currentPath.endsWith('gestion-usuarios.html')
            },
            {
                href: 'gestion-reportes.html',
                icon: 'bi-clipboard-data',
                text: 'Gestión de Reportes',
                id: 'gestionReportesLink',
                active: currentPath.endsWith('gestion-reportes.html')
            },
            {
                href: 'gestion-equipos.html',
                icon: 'bi-pc-display',
                text: 'Gestión de Equipos',
                id: 'gestionEquiposLink',
                active: currentPath.endsWith('gestion-equipos.html')
            },
            {
                href: 'gestion-sedes.html',
                icon: 'bi-building',
                text: 'Gestión de Sedes',
                id: 'gestionSedesLink',
                active: currentPath.endsWith('gestion-sedes.html')
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