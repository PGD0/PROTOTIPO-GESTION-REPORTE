import api from './api.js';

const PUBLIC_PAGES = [
  'index.html',
  'login.html',
  'register.html',
  'dashboard.html'
];

const ADMIN_PAGES = [
  'gestion-reportes.html',
  'gestion-usuarios.html'
];

function isPublicPage() {
  const currentPage = window.location.pathname.split('/').pop();
  return PUBLIC_PAGES.includes(currentPage) || currentPage === '';
}

function isAdminPage() {
  const currentPage = window.location.pathname.split('/').pop();
  return ADMIN_PAGES.includes(currentPage);
}

function redirectToLogin() {
  window.location.href = '../html/login.html';
}

function redirectToHome() {
  window.location.href = '../html/homepage.html';
}

async function getCurrentUser() {
  try {
    const usuarios = await api.getUsuarios();
    
    const token = api.getToken();
    if (!token) return null;
    
    const tokenData = parseJwt(token);
    if (!tokenData || !tokenData.sub) return null;
    
    const currentUser = usuarios.find(user => user.email === tokenData.sub);
    
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    return currentUser;
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
}

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

function isAdmin(user) {
  return user && user.rol === 1; 
}

document.addEventListener('DOMContentLoaded', async function() {
  if (isPublicPage()) return;
  
  const token = api.getToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    api.clearToken();
    redirectToLogin();
    return;
  }
  
  if (isAdminPage() && !isAdmin(currentUser)) {
    redirectToHome();
    return;
  }
});

export default {
  isPublicPage,
  isAdminPage,
  getCurrentUser,
  isAdmin
};