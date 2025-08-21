import api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  const token = api.getToken();
  if (!token) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('usuariosContainer');
  
  const eliminarModal = new bootstrap.Modal(document.getElementById('confirmarEliminarUsuarioModal'));
  const cambioRolModal = new bootstrap.Modal(document.getElementById('confirmarCambioRolModal'));
  
  const usuarioIdEliminar = document.getElementById('usuarioIdEliminar');
  const mensajeEliminarUsuario = document.getElementById('mensajeEliminarUsuario');
  const btnConfirmarEliminarUsuario = document.getElementById('btnConfirmarEliminarUsuario');
  
  const usuarioIdCambioRol = document.getElementById('usuarioIdCambioRol');
  const nuevoRolId = document.getElementById('nuevoRolId');
  const mensajeCambioRol = document.getElementById('mensajeCambioRol');
  const btnConfirmarCambioRol = document.getElementById('btnConfirmarCambioRol');
  
  const render = async () => {
    const usuarios = await api.getUsuarios();
    const roles = await api.getRoles();
    
    if ($.fn.DataTable.isDataTable('#tablaUsuarios')) {
      $('#tablaUsuarios').DataTable().destroy();
    }
    
    container.innerHTML = `
      <div class="table-responsive">
        <table id="tablaUsuarios" class="table table-bordered table-hover table-striped w-100">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
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
        </table>
      </div>
    `;
    
    const dataTable = $('#tablaUsuarios').DataTable({
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
      },
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel me-2"></i>Excel',
          className: 'btn btn-outline-success btn-sm',
          exportOptions: {
            columns: [0, 1, 2, 3, 4]
          }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF',
          className: 'btn btn-outline-danger btn-sm',
          exportOptions: {
            columns: [0, 1, 2, 3, 4]
          },
          customize: function(doc) {
            const table = doc.content[1].table;
            for (let i = 0; i < table.body.length; i++) {
              if (i > 0) { 
                const userId = parseInt(table.body[i][0].text);
                const selectElement = document.querySelector(`.rol-select[data-id="${userId}"]`);
                if (selectElement) {
                  const selectedRolText = selectElement.options[selectElement.selectedIndex].text;
                  table.body[i][4] = { text: selectedRolText };
                }
              }
            }
          }
        }
      ]
    });
    
    container.querySelectorAll('.rol-select').forEach(sel => {
      sel.addEventListener('change', function() {
        const id = parseInt(this.dataset.id);
        const nombre = this.dataset.nombre;
        const rolSeleccionado = this.options[this.selectedIndex].text;
        
        usuarioIdCambioRol.value = id;
        nuevoRolId.value = this.value;
        mensajeCambioRol.textContent = `¿Estás seguro de que deseas cambiar el rol de ${nombre} a "${rolSeleccionado}"?`;
        
        cambioRolModal.show();
      });
    });
    
    container.querySelectorAll('.eliminar-usuario').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const nombre = this.dataset.nombre;
        
        usuarioIdEliminar.value = id;
        mensajeEliminarUsuario.textContent = `¿Estás seguro de que deseas eliminar al usuario ${nombre}?`;
        
        eliminarModal.show();
      });
    });
  }
  
  document.getElementById('formConfirmarEliminarUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(usuarioIdEliminar.value);
    const password = document.getElementById('passwordEliminarUsuario').value;
    
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) throw new Error("No se encontró información del usuario");
      
      const currentUser = JSON.parse(currentUserStr);
      
      if (parseInt(currentUser.ID_usuarios) === id) {
        alert('No puedes eliminar tu propia cuenta. Esta acción debe ser realizada por otro administrador.');
        return;
      }
      const verificado = await api.verificarPassword(currentUser.ID_usuarios, password);
      if (!verificado) {
        alert('Contraseña incorrecta. Por favor, intenta nuevamente.');
        return;
      }
      
      await api.deleteUsuario(id);
      eliminarModal.hide();
      document.getElementById('passwordEliminarUsuario').value = '';
      await render();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(`Error al eliminar usuario: ${error.message}`);
    }
  });
  
  document.getElementById('formConfirmarCambioRol').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(usuarioIdCambioRol.value);
    const rol = parseInt(nuevoRolId.value);
    const password = document.getElementById('passwordCambioRol').value;
    
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) throw new Error("No se encontró información del usuario");
      
      const currentUser = JSON.parse(currentUserStr);
      
      if (parseInt(currentUser.ID_usuarios) === id) {
        alert('No puedes cambiar tu propio rol. Esta acción debe ser realizada por otro administrador.');
        return;
      }
      
      const verificado = await api.verificarPassword(currentUser.ID_usuarios, password);
      if (!verificado) {
        alert('Contraseña incorrecta. Por favor, intenta nuevamente.');
        return;
      }
      
      await api.updateUsuario(id, { rol });
      cambioRolModal.hide();
      document.getElementById('passwordCambioRol').value = '';
      await render();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert(`Error al cambiar rol: ${error.message}`);
    }
  });
  
  await render();
});