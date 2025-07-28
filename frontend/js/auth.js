// auth.js
// Script para proteger páginas que requieren autenticación y autorización

// Importar el módulo API
import api from './api.js';

// Páginas públicas (no requieren autenticación)
const PUBLIC_PAGES = [
  'index.html',
  'login.html',
  'register.html',
  'dashboard.html'
];

// Páginas que requieren rol de administrador (ID_rol = 1)
const ADMIN_PAGES = [
  'gestion-reportes.html',
  'gestion-usuarios.html'
];

// Función para verificar si la página actual es pública
function isPublicPage() {
  const currentPage = window.location.pathname.split('/').pop();
  return PUBLIC_PAGES.includes(currentPage) || currentPage === '';
}

// Función para verificar si la página actual requiere rol de administrador
function isAdminPage() {
  const currentPage = window.location.pathname.split('/').pop();
  return ADMIN_PAGES.includes(currentPage);
}

// Función para redirigir a la página de login
function redirectToLogin() {
  window.location.href = '../html/login.html';
}

// Función para redirigir a la página de inicio
function redirectToHome() {
  window.location.href = '../html/homepage.html';
}

// Función para obtener el usuario actual
async function getCurrentUser() {
  try {
    // Obtener todos los usuarios
    const usuarios = await api.getUsuarios();
    
    // Obtener el email del usuario del token JWT (si está disponible)
    const token = api.getToken();
    if (!token) return null;
    
    // Decodificar el token JWT para obtener el email del usuario
    const tokenData = parseJwt(token);
    if (!tokenData || !tokenData.sub) return null;
    
    // Buscar el usuario por email
    const currentUser = usuarios.find(user => user.email === tokenData.sub);
    
    // Guardar la información del usuario en localStorage
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    return currentUser;
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
}

// Función para decodificar el token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
}

// Función para verificar si el usuario tiene rol de administrador
function isAdmin(user) {
  return user && user.rol === 1; // Asumiendo que el ID_rol 1 es para administradores
}

// Verificar autenticación y autorización al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
  // Si es una página pública, no verificar autenticación
  if (isPublicPage()) return;
  
  // Verificar si el usuario está autenticado
  const token = api.getToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  
  // Obtener información del usuario actual
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    // Si no se puede obtener la información del usuario, cerrar sesión y redirigir al login
    api.clearToken();
    redirectToLogin();
    return;
  }
  
  // Verificar si la página requiere rol de administrador
  if (isAdminPage() && !isAdmin(currentUser)) {
    // Si el usuario no es administrador y la página requiere rol de administrador, redirigir a la página de inicio
    redirectToHome();
    return;
  }
});

// Exportar funciones para uso en otros archivos
export default {
  isPublicPage,
  isAdminPage,
  getCurrentUser,
  isAdmin
};