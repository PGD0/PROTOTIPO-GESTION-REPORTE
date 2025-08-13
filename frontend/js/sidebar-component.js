// sidebar-component.js - Componente modular del sidebar para todas las páginas
import api from './api.js';

// Función principal que inyecta y configura el sidebar
export function initSidebar() {
    // Inyectar el HTML del sidebar si no existe
    injectSidebarHTML();
    // Renderizar los enlaces de navegación según el rol del usuario
    renderSidebarNav();
    // Configurar la funcionalidad del sidebar
    setupSidebar();
}

// Función para inyectar el HTML del sidebar
function injectSidebarHTML() {
    // Verificar si ya existe un sidebar
    if (document.getElementById('sidebar')) return;
    
    // Crear el overlay para móviles
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    document.body.prepend(overlay);
    
    // Crear el sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';
    
    // Agregar el contenido del sidebar
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
    
    // Insertar el sidebar al principio del body
    document.body.prepend(sidebar);
    
    // Verificar si existe el contenedor principal
    let mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        // Si no existe, crear el contenedor principal
        mainContent = document.createElement('div');
        mainContent.className = 'main-content-wrapper';
        mainContent.id = 'mainContent';
        
        // Mover todo el contenido del body (excepto el sidebar y overlay) al mainContent
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (child !== sidebar && child !== overlay && child.tagName !== 'SCRIPT') {
                mainContent.appendChild(child);
            }
        });
        
        // Agregar el mainContent al body
        document.body.appendChild(mainContent);
    }
    
    // Verificar si existe el botón de toggle para móviles
    const topNavbar = mainContent.querySelector('.top-navbar');
    if (topNavbar) {
        const mobileToggle = topNavbar.querySelector('#mobileSidebarToggle');
        if (!mobileToggle) {
            // Crear el botón de toggle para móviles
            const toggleButton = document.createElement('button');
            toggleButton.className = 'btn btn-link d-lg-none me-3';
            toggleButton.id = 'mobileSidebarToggle';
            toggleButton.innerHTML = '<i class="bi bi-list fs-4"></i>';
            
            // Insertar al principio del navbar
            const firstChild = topNavbar.querySelector('.d-flex');
            if (firstChild) {
                firstChild.prepend(toggleButton);
            }
        }
    }
}

// Función para renderizar los enlaces de navegación
function renderSidebarNav() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';

    // Obtener la ruta actual para marcar el enlace activo
    const currentPath = window.location.pathname;
    
    // Enlaces públicos
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

    // Separador
    nav.appendChild(document.createElement('hr')).className = 'my-3';

    // Enlaces administrativos (solo para admin)
    const token = api.getToken();
    let esAdmin = false;
    if (token) {
        try {
            // Obtener el usuario actual del localStorage (guardado por auth.js)
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                // Verificar si el usuario es administrador (rol = 1)
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
        // Otro separador si quieres separar admin de salir
        nav.appendChild(document.createElement('hr')).className = 'my-3';
    }

    // Enlace salir (siempre al final)
    nav.appendChild(crearNavItem({
        href: '../index.html',
        icon: 'bi-box-arrow-right',
        text: 'Salir',
        id: 'salirLink',
        active: false
    }));
}

// Función para crear un elemento de navegación
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

// Función para configurar la funcionalidad del sidebar
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