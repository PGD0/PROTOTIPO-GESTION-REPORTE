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

        // Validaciones de contraseña
        const password = passwordInput.value;
        const errores = [];
        if (password.length < 8) {
            errores.push('La contraseña debe tener al menos 8 caracteres.');
        }
        if (!/[A-Z]/.test(password)) {
            errores.push('La contraseña debe contener al menos una letra mayúscula.');
        }
        if (!/[a-z]/.test(password)) {
            errores.push('La contraseña debe contener al menos una letra minúscula.');
        }
        if (!/[0-9]/.test(password)) {
            errores.push('La contraseña debe contener al menos un número.');
        }
        // Confirmar contraseña
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput && password !== confirmPasswordInput.value) {
            errores.push('Las contraseñas no coinciden.');
        }
        if (errores.length > 0) {
            errorDiv.innerHTML = errores.join('<br>');
            errorDiv.classList.remove('d-none');
            return;
        }

        try {
            // Llamar a la API para registrar al usuario
            await api.register({
                nombre: firstNameInput.value,
                apellido: lastNameInput.value,
                email: emailInput.value,
                contraseña: password,
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