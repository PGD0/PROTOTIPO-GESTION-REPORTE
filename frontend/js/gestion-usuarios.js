document.addEventListener('DOMContentLoaded', async function() {
  await window.apiMock.initMockDB();
  const session = window.apiMock.getSession();
  if (!session || !window.apiMock.isAdmin(session)) {
    window.location.href = 'dashboard.html';
    return;
  }
  const container = document.getElementById('usuariosContainer');
  function render() {
    const usuarios = window.apiMock.getUsuarios();
    const roles = window.apiMock.getRoles();
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
              <select class="form-select form-select-sm rol-select" data-id="${u.ID_usuarios}">
                ${roles.map(r => `<option value="${r.ID_rol}" ${u.rol===r.ID_rol?'selected':''}>${r.tipo_rol}</option>`).join('')}
              </select>
            </td>
            <td>
              <button class="btn btn-danger btn-sm eliminar-usuario" data-id="${u.ID_usuarios}"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
    // Eventos para cambiar rol
    container.querySelectorAll('.rol-select').forEach(sel => {
      sel.addEventListener('change', function() {
        const id = parseInt(this.dataset.id);
        window.apiMock.updateUsuario(id, { rol: parseInt(this.value) });
        render();
      });
    });
    // Eventos para eliminar usuario
    container.querySelectorAll('.eliminar-usuario').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        if (confirm('¿Seguro que deseas eliminar este usuario?')) {
          window.apiMock.deleteUsuario(id);
          render();
        }
      });
    });
  }
  render();
}); 