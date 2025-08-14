import api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  const token = api.getToken();
  if (!token) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('usuariosContainer');
  
  // Referencias a los modales
  const eliminarModal = new bootstrap.Modal(document.getElementById('confirmarEliminarUsuarioModal'));
  const cambioRolModal = new bootstrap.Modal(document.getElementById('confirmarCambioRolModal'));
  
  // Referencias a elementos del DOM para eliminar usuario
  const usuarioIdEliminar = document.getElementById('usuarioIdEliminar');
  const mensajeEliminarUsuario = document.getElementById('mensajeEliminarUsuario');
  const btnConfirmarEliminarUsuario = document.getElementById('btnConfirmarEliminarUsuario');
  
  // Referencias a elementos del DOM para cambiar rol
  const usuarioIdCambioRol = document.getElementById('usuarioIdCambioRol');
  const nuevoRolId = document.getElementById('nuevoRolId');
  const mensajeCambioRol = document.getElementById('mensajeCambioRol');
  const btnConfirmarCambioRol = document.getElementById('btnConfirmarCambioRol');
  
  // Función para renderizar la tabla de usuarios
  async function render() {
    const usuarios = await api.getUsuarios();
    const roles = await api.getRoles();
    container.innerHTML = `<table class="table table-bordered table-hover">
      <thead><tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
      <tbody>
        ${usuarios.map(u => `
          <tr>
            <td>${u.ID_usuarios}</td>
            <td>${u.nombre}</td>
            <td>${u.apellido}</td>
            <td>${u.email}</td>
            <td>
              <select class="form-select form-select-sm rol-select" data-id="${u.ID_usuarios}" data-nombre="${u.nombre} ${u.apellido}">
                ${roles.map(r => `<option value="${r.ID_rol}" ${u.rol===r.ID_rol?'selected':''}>${r.tipo_rol}</option>`).join('')}
              </select>
            </td>
            <td>
              <button class="btn btn-danger btn-sm eliminar-usuario" data-id="${u.ID_usuarios}" data-nombre="${u.nombre} ${u.apellido}"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
    
    // Eventos para cambiar rol
    container.querySelectorAll('.rol-select').forEach(sel => {
      sel.addEventListener('change', function() {
        const id = parseInt(this.dataset.id);
        const nombre = this.dataset.nombre;
        const rolSeleccionado = this.options[this.selectedIndex].text;
        
        // Configurar modal de confirmación
        usuarioIdCambioRol.value = id;
        nuevoRolId.value = this.value;
        mensajeCambioRol.textContent = `¿Estás seguro de que deseas cambiar el rol de ${nombre} a "${rolSeleccionado}"?`;
        
        // Mostrar modal
        cambioRolModal.show();
      });
    });
    
    // Eventos para eliminar usuario
    container.querySelectorAll('.eliminar-usuario').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const nombre = this.dataset.nombre;
        
        // Configurar modal de confirmación
        usuarioIdEliminar.value = id;
        mensajeEliminarUsuario.textContent = `¿Estás seguro de que deseas eliminar al usuario ${nombre}?`;
        
        // Mostrar modal
        eliminarModal.show();
      });
    });
  }
  
  // Evento para confirmar eliminación de usuario
  document.getElementById('formConfirmarEliminarUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(usuarioIdEliminar.value);
    const password = document.getElementById('passwordEliminarUsuario').value;
    
    try {
      // Obtener el usuario actual del localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) throw new Error("No se encontró información del usuario");
      
      const currentUser = JSON.parse(currentUserStr);
      
      // Verificar si el usuario está intentando eliminar su propia cuenta
      if (parseInt(currentUser.ID_usuarios) === id) {
        alert('No puedes eliminar tu propia cuenta. Esta acción debe ser realizada por otro administrador.');
        return;
      }
      
      // Verificar la contraseña del usuario
      const verificado = await api.verificarPassword(currentUser.ID_usuarios, password);
      if (!verificado) {
        alert('Contraseña incorrecta. Por favor, intenta nuevamente.');
        return;
      }
      
      // Si la contraseña es correcta, proceder con la eliminación
      await api.deleteUsuario(id);
      eliminarModal.hide();
      document.getElementById('passwordEliminarUsuario').value = '';
      await render();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(`Error al eliminar usuario: ${error.message}`);
    }
  });
  
  // Evento para confirmar cambio de rol
  document.getElementById('formConfirmarCambioRol').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(usuarioIdCambioRol.value);
    const rol = parseInt(nuevoRolId.value);
    const password = document.getElementById('passwordCambioRol').value;
    
    try {
      // Obtener el usuario actual del localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) throw new Error("No se encontró información del usuario");
      
      const currentUser = JSON.parse(currentUserStr);
      
      // Verificar si el usuario está intentando cambiar su propio rol
      if (parseInt(currentUser.ID_usuarios) === id) {
        alert('No puedes cambiar tu propio rol. Esta acción debe ser realizada por otro administrador.');
        return;
      }
      
      // Verificar la contraseña del usuario
      const verificado = await api.verificarPassword(currentUser.ID_usuarios, password);
      if (!verificado) {
        alert('Contraseña incorrecta. Por favor, intenta nuevamente.');
        return;
      }
      
      // Si la contraseña es correcta, proceder con el cambio de rol
      await api.updateUsuario(id, { rol });
      cambioRolModal.hide();
      document.getElementById('passwordCambioRol').value = '';
      await render();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert(`Error al cambiar rol: ${error.message}`);
    }
  });
  
  // Renderizar tabla inicial
  await render();
});