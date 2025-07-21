import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('form');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Crear un div para mostrar mensajes de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    registerForm.appendChild(errorDiv);
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ocultar mensaje de error previo
        errorDiv.classList.add('d-none');
        
        try {
            // Llamar a la API para registrar al usuario
            await api.register({
                nombre: firstNameInput.value,
                apellido: lastNameInput.value,
                email: emailInput.value,
                contraseña: passwordInput.value,
                rol: 2 // Rol por defecto para usuarios normales
            });
            
            // Redirigir a la página de login tras registro exitoso
            window.location.href = 'login.html';
        } catch (error) {
            // Mostrar mensaje de error
            errorDiv.textContent = error.message || 'Error al registrar usuario';
            errorDiv.classList.remove('d-none');
        }
    });
});