// api.js
// Módulo para consumir el backend real usando fetch y JWT

const API_URL = 'http://127.0.0.1:8000';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function login(email, password) {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Error de autenticación');
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

async function register({ nombre, apellido, email, contraseña, rol, descripcion = "", imagen = null }) {
  try {
    console.log('Intentando registrar usuario:', { nombre, apellido, email, contraseña, rol });

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('email', email);
    formData.append('contraseña', contraseña);
    formData.append('rol', rol);
    formData.append('descripcion', descripcion);

    const res = await fetch(`${API_URL}/usuarios/`, {
      method: 'POST',
      body: formData
    });
    console.log('Respuesta del servidor:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Error en registro:', errorData);
      throw new Error(errorData.detail || `Error de registro: ${res.status} ${res.statusText}`);
    }
    
    const userData = await res.json();
    console.log('Usuario registrado exitosamente:', userData);
    return userData;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
}

async function getUsuarios() {
  const res = await fetch(`${API_URL}/usuarios/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los usuarios');
  return await res.json();
}

async function getRoles() {
  const res = await fetch(`${API_URL}/roles/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los roles');
  return await res.json();
}

async function getSedes() {
  const res = await fetch(`${API_URL}/sedes/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener las sedes');
  return await res.json();
}

async function getBloques() {
  const res = await fetch(`${API_URL}/bloques/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los bloques');
  return await res.json();
}

async function getSalones() {
  const res = await fetch(`${API_URL}/salones/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los salones');
  return await res.json();
}

async function getEquipos() {
  const res = await fetch(`${API_URL}/equipos/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los equipos');
  return await res.json();
}

async function getReportes() {
  const res = await fetch(`${API_URL}/reportes/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los reportes');
  return await res.json();
}

async function crearReporte({ ID_equipo, descripcion, estado_equipo, ID_usuario, resuelto, imagen }) {
  const form = new FormData();
  form.append('ID_equipo', ID_equipo);
  form.append('descripcion', descripcion);
  form.append('estado_equipo', estado_equipo);
  form.append('ID_usuario', ID_usuario);
  form.append('resuelto', resuelto ? 'true' : 'false');
  form.append('imagen', imagen); // Debe ser un File
  const res = await fetch(`${API_URL}/reportes/`, {
    method: 'POST',
    headers: authHeaders(),
    body: form
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Error al crear el reporte');
  }
  return await res.json();
}

async function getDashboard() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/dashboard/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('No se pudo cargar el dashboard');
  return res.json();
}

export default {
  login,
  register,
  getUsuarios,
  getRoles,
  getSedes,
  getBloques,
  getSalones,
  getEquipos,
  getReportes,
  crearReporte,
  getToken,
  setToken,
  clearToken,
  authHeaders,
  getDashboard
}; 