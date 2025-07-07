// api-mock.js
// Simula un backend usando localStorage y archivos JSON de ejemplo

const JSON_FILES = [
  'usuarios', 'roles', 'sedes', 'bloques', 'salones', 'equipos', 'reportes'
];

// Cargar datos iniciales desde archivos JSON si localStorage está vacío
async function initMockDB() {
  for (const name of JSON_FILES) {
    if (!localStorage.getItem(name)) {
      const res = await fetch(`../json/${name}.json`);
      const data = await res.json();
      localStorage.setItem(name, JSON.stringify(data));
    }
  }
}

// Utilidades para acceder a los "datos"
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Sesión simulada
function setSession(user) {
  localStorage.setItem('session', JSON.stringify(user));
}
function getSession() {
  return JSON.parse(localStorage.getItem('session') || 'null');
}
function clearSession() {
  localStorage.removeItem('session');
}

// Login
function login(email, password) {
  const usuarios = getData('usuarios');
  const user = usuarios.find(u => u.email === email && u.contraseña === password);
  if (user) {
    setSession(user);
    return { success: true, user };
  }
  return { success: false, message: 'Credenciales incorrectas' };
}

// Registro
function register(nombre, apellido, email, password) {
  const usuarios = getData('usuarios');
  if (usuarios.some(u => u.email === email)) {
    return { success: false, message: 'El correo ya está registrado' };
  }
  const roles = getData('roles');
  const rolUsuario = roles.find(r => r.tipo_rol === 'Usuario')?.ID_rol || 2;
  const nuevo = {
    ID_usuarios: usuarios.length ? Math.max(...usuarios.map(u => u.ID_usuarios)) + 1 : 1,
    nombre, apellido, email, contraseña: password, rol: rolUsuario,
    fecha_creacion: new Date().toISOString()
  };
  usuarios.push(nuevo);
  setData('usuarios', usuarios);
  setSession(nuevo);
  return { success: true, user: nuevo };
}

// CRUD de reportes
function getReportes() {
  return getData('reportes');
}
function addReporte(reporte) {
  const reportes = getData('reportes');
  reporte.ID_reporte = reportes.length ? Math.max(...reportes.map(r => r.ID_reporte)) + 1 : 1;
  reporte.fecha_registro = new Date().toISOString();
  reportes.push(reporte);
  setData('reportes', reportes);
  return reporte;
}
function updateReporte(id, changes) {
  const reportes = getData('reportes');
  const idx = reportes.findIndex(r => r.ID_reporte === id);
  if (idx !== -1) {
    reportes[idx] = { ...reportes[idx], ...changes };
    setData('reportes', reportes);
    return reportes[idx];
  }
  return null;
}
function deleteReporte(id) {
  let reportes = getData('reportes');
  reportes = reportes.filter(r => r.ID_reporte !== id);
  setData('reportes', reportes);
}

// CRUD de usuarios (solo admin)
function getUsuarios() {
  return getData('usuarios');
}
function updateUsuario(id, changes) {
  const usuarios = getData('usuarios');
  const idx = usuarios.findIndex(u => u.ID_usuarios === id);
  if (idx !== -1) {
    usuarios[idx] = { ...usuarios[idx], ...changes };
    setData('usuarios', usuarios);
    return usuarios[idx];
  }
  return null;
}
function deleteUsuario(id) {
  let usuarios = getData('usuarios');
  usuarios = usuarios.filter(u => u.ID_usuarios !== id);
  setData('usuarios', usuarios);
}

// Roles y permisos
function getRoles() {
  return getData('roles');
}
function isAdmin(user) {
  const roles = getRoles();
  const rol = roles.find(r => r.ID_rol === user.rol);
  return rol && rol.tipo_rol === 'Administrador';
}

// Exportar funciones globalmente para fácil acceso
typeof window !== 'undefined' && (window.apiMock = {
  initMockDB,
  login,
  register,
  getSession,
  setSession,
  clearSession,
  getReportes,
  addReporte,
  updateReporte,
  deleteReporte,
  getUsuarios,
  updateUsuario,
  deleteUsuario,
  getRoles,
  isAdmin,
  getData
}); 