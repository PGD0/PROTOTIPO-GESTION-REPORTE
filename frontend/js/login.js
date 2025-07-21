import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Crear un div para mostrar mensajes de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    loginForm.appendChild(errorDiv);
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorDiv.classList.add('d-none');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            errorDiv.textContent = 'Por favor, completa todos los campos.';
            errorDiv.classList.remove('d-none');
            return;
        }
        
        try {
            await api.login(email, password);
            // Redirigir a la página de inicio después del login exitoso
            window.location.href = 'homepage.html';
        } catch (error) {
            errorDiv.textContent = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            errorDiv.classList.remove('d-none');
        }
    });
});