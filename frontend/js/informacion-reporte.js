import api from './api.js';
import { getPrioridadBadge } from './main.js';

let reporteActual = null;
let equipos = [];
let usuarios = [];
let esAdmin = false;

document.addEventListener('DOMContentLoaded', async function() {
    const token = api.getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await configurarSidebarYNavbar();

    const urlParams = new URLSearchParams(window.location.search);
    const reporteId = urlParams.get('id');
    
    if (!reporteId) {
        alert('No se especificó un reporte');
        window.location.href = 'gestion-reportes.html';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        esAdmin = payload.rol === 1;
    } catch (error) {
        console.error('Error al decodificar token:', error);
        esAdmin = false;
    }

    await cargarDatos(reporteId);
    
    configurarEventListeners();
});

async function configurarSidebarYNavbar() {
    try {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            const sidebarResponse = await fetch('../js/sidebar-component.js');
            const sidebarText = await sidebarResponse.text();
            const sidebarModule = await import('../js/sidebar-component.js');
            await sidebarModule.default();
        }

        configurarNavbar();
        
        configurarSidebarToggle();
        
    } catch (error) {
        console.error('Error al configurar sidebar y navbar:', error);
    }
}

function configurarNavbar() {
    try {
        const token = api.getToken();
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userName = payload.nombre || 'Usuario';
            document.getElementById('userName').textContent = userName;
        }

        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            api.clearToken();
            window.location.href = 'login.html';
        });
    } catch (error) {
        console.error('Error al configurar navbar:', error);
    }
}

function configurarSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const body = document.body;
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            body.classList.toggle('sidebar-collapsed');
        });
    }
}

async function cargarDatos(reporteId) {
    try {
        const [reporte, equiposData, usuariosData] = await Promise.all([
            api.getReporte(reporteId),
            api.getEquipos(),
            api.getUsuarios()
        ]);

        reporteActual = reporte;
        equipos = equiposData;
        usuarios = usuariosData;

        const equipo = equipos.find(e => Number(e.ID_equipo) === Number(reporte.ID_equipo)) || {};
        const usuario = usuarios.find(u => Number(u.ID_usuarios) === Number(reporte.ID_usuario)) || {};

        document.getElementById('reporteId').textContent = `#${reporte.ID_reporte}`;
        
        const estadoBadge = document.getElementById('reporteEstado');
        const estado = reporte.estado_equipo || 'Pendiente';
        const badgeClass = (estado === 'Resuelto' || estado === 'Solucionado') ? 'bg-success' : 
                          estado === 'En Proceso' ? 'bg-info' : 'bg-warning text-dark';
        estadoBadge.innerHTML = `<span class="badge ${badgeClass} status-badge">${estado}</span>`;
        
        const resueltoBadge = document.getElementById('reporteResuelto');
        const resuelto = reporte.resuelto;
        const resueltoClass = resuelto ? 'bg-success' : 'bg-warning text-dark';
        resueltoBadge.innerHTML = `<span class="badge ${resueltoClass} status-badge">${resuelto ? 'Sí' : 'No'}</span>`;
        
        const prioridadBadge = document.getElementById('reportePrioridad');
        if (prioridadBadge) {
            if (reporte.prioridad) {
                prioridadBadge.innerHTML = getPrioridadBadge(reporte.prioridad);
            } else {
                prioridadBadge.innerHTML = '<span class="badge bg-secondary status-badge">No especificada</span>';
            }
        }
        
        document.getElementById('reporteFechaRegistro').textContent = 
            reporte.fecha_registro ? new Date(reporte.fecha_registro).toLocaleDateString('es-ES') : 'N/A';
        
        document.getElementById('reporteFechaSolucion').textContent = 
            reporte.fecha_solucion ? new Date(reporte.fecha_solucion).toLocaleDateString('es-ES') : 'No aplica';

        document.getElementById('usuarioNombre').textContent = 
            usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'No especificado';
        document.getElementById('usuarioEmail').textContent = usuario.email || 'No especificado';
        
        const rolTexto = usuario.rol === 1 ? 'Administrador' : 
                        usuario.rol === 2 ? 'Estudiante' : 
                        usuario.rol === 3 ? 'Profesor' : 'No especificado';
        document.getElementById('usuarioRol').textContent = rolTexto;

        document.getElementById('equipoCodigo').textContent = equipo.codigo_barras || 'No especificado';
        document.getElementById('equipoMarca').textContent = equipo.marca || 'No especificada';
        document.getElementById('equipoModelo').textContent = equipo.modelo || 'No especificado';
        document.getElementById('equipoSede').textContent = equipo.sede || 'No especificada';
        document.getElementById('equipoSalon').textContent = equipo.salon || 'No especificado';

        document.getElementById('reporteDescripcion').textContent = reporte.descripcion || 'Sin descripción';

        const imagenElement = document.getElementById('equipoImagen');
        if (reporte.img_equipo) {
            imagenElement.src = reporte.img_equipo;
        } else {
            imagenElement.src = '../assets/img/computer.png';
        }

        const estadoSelect = document.getElementById('estadoSelect');
        estadoSelect.value = (estado === 'Solucionado') ? 'Resuelto' : estado;

        configurarBotones(reporte);

    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar la información del reporte');
    }
}

function configurarBotones(reporte) {
    const btnMarcarResuelto = document.getElementById('btnMarcarResuelto');
    const btnNotificarUsuario = document.getElementById('btnNotificarUsuario');
    const estadoSelect = document.getElementById('estadoSelect');

    if (reporte.resuelto) {
        btnMarcarResuelto.style.display = 'none';
        btnNotificarUsuario.style.display = 'block';
        estadoSelect.value = 'Resuelto';
    } else {
        btnMarcarResuelto.style.display = 'block';
        btnNotificarUsuario.style.display = 'none';
    }

    if (!esAdmin) {
        btnMarcarResuelto.style.display = 'none';
        btnNotificarUsuario.style.display = 'none';
        document.getElementById('btnEliminarReporte').style.display = 'none';
        estadoSelect.style.display = 'none';
        document.querySelector('label[for="estadoSelect"]').style.display = 'none';
    }
}

function configurarEventListeners() {
    document.getElementById('estadoSelect').addEventListener('change', async function() {
        if (!esAdmin) return;
        
        const nuevoEstado = this.value;
        const esResuelto = nuevoEstado === 'Resuelto';
        
        try {
            await api.updateReporte(reporteActual.ID_reporte, {
                estado_equipo: esResuelto ? 'Solucionado' : nuevoEstado,
                resuelto: esResuelto ? 1 : 0,
                fecha_solucion: esResuelto ? new Date().toISOString() : null
            });
            
            await cargarDatos(reporteActual.ID_reporte);
            
            alert('✅ Estado del reporte actualizado correctamente');
        } catch (error) {
            alert(`❌ Error al actualizar estado: ${error.message}`);
        }
    });

    document.getElementById('btnMarcarResuelto').addEventListener('click', async function() {
        if (!esAdmin) return;
        
        if (confirm('¿Deseas marcar este reporte como resuelto?')) {
            try {
                await api.marcarReporteResuelto(reporteActual.ID_reporte);
                
                await cargarDatos(reporteActual.ID_reporte);
                
                alert('✅ Reporte marcado como resuelto correctamente');
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }
    });

    document.getElementById('btnNotificarUsuario').addEventListener('click', async function() {
        if (!esAdmin) return;
        
        if (confirm('¿Deseas notificar al usuario que su equipo ha sido reparado?')) {
            try {
                const resultado = await api.notificarUsuario(reporteActual.ID_reporte);
                
                if (resultado.success) {
                    alert(`✅ Notificación enviada correctamente a: ${resultado.usuario} (${resultado.email})`);
                } else {
                    alert(`❌ Error al enviar notificación: ${resultado.message}`);
                }
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }
    });

    document.getElementById('btnEliminarReporte').addEventListener('click', async function() {
        if (!esAdmin) return;
        
        if (confirm('¿Seguro que deseas eliminar este reporte? Esta acción no se puede deshacer.')) {
            try {
                await api.deleteReporte(reporteActual.ID_reporte);
                alert('✅ Reporte eliminado correctamente');
                window.location.href = 'gestion-reportes.html';
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }
    });
}
