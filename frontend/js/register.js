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
    
    // Función para validar que un campo solo contenga letras y espacios
    function validarSoloLetras(valor) {
        return /^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/.test(valor);
    }
    
    // Validación en tiempo real para el campo de nombre
    firstNameInput.addEventListener('input', function() {
        if (!validarSoloLetras(this.value)) {
            this.classList.add('is-invalid');
            if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('invalid-feedback')) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Solo se permiten letras y espacios';
                this.parentNode.insertBefore(feedback, this.nextSibling);
            }
        } else {
            this.classList.remove('is-invalid');
            if (this.nextElementSibling && this.nextElementSibling.classList.contains('invalid-feedback')) {
                this.nextElementSibling.remove();
            }
        }
    });
    
    // Validación en tiempo real para el campo de apellido
    lastNameInput.addEventListener('input', function() {
        if (!validarSoloLetras(this.value)) {
            this.classList.add('is-invalid');
            if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('invalid-feedback')) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Solo se permiten letras y espacios';
                this.parentNode.insertBefore(feedback, this.nextSibling);
            }
        } else {
            this.classList.remove('is-invalid');
            if (this.nextElementSibling && this.nextElementSibling.classList.contains('invalid-feedback')) {
                this.nextElementSibling.remove();
            }
        }
    });
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ocultar mensaje de error previo
        errorDiv.classList.add('d-none');
        
        // Recopilar todos los errores de validación
        const errores = [];
        
        // Validar que nombre y apellido solo contengan letras
        if (!validarSoloLetras(firstNameInput.value)) {
            errores.push('<strong>Nombre inválido:</strong> El nombre solo debe contener letras y espacios. No se permiten números ni caracteres especiales.');
            firstNameInput.classList.add('is-invalid');
        } else {
            firstNameInput.classList.remove('is-invalid');
        }
        
        if (!validarSoloLetras(lastNameInput.value)) {
            errores.push('<strong>Apellido inválido:</strong> El apellido solo debe contener letras y espacios. No se permiten números ni caracteres especiales.');
            lastNameInput.classList.add('is-invalid');
        } else {
            lastNameInput.classList.remove('is-invalid');
        }

        // Validaciones de contraseña
        const password = passwordInput.value;
        if (password.length < 8) {
            errores.push('<strong>Contraseña insegura:</strong> La contraseña debe tener al menos 8 caracteres.');
            passwordInput.classList.add('is-invalid');
        }
        if (!/[A-Z]/.test(password)) {
            errores.push('<strong>Contraseña insegura:</strong> La contraseña debe contener al menos una letra mayúscula.');
            passwordInput.classList.add('is-invalid');
        }
        if (!/[a-z]/.test(password)) {
            errores.push('<strong>Contraseña insegura:</strong> La contraseña debe contener al menos una letra minúscula.');
            passwordInput.classList.add('is-invalid');
        }
        if (!/[0-9]/.test(password)) {
            errores.push('<strong>Contraseña insegura:</strong> La contraseña debe contener al menos un número.');
            passwordInput.classList.add('is-invalid');
        }
        
        // Confirmar contraseña
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput && password !== confirmPasswordInput.value) {
            errores.push('<strong>Error de confirmación:</strong> Las contraseñas no coinciden.');
            confirmPasswordInput.classList.add('is-invalid');
        } else if (confirmPasswordInput) {
            confirmPasswordInput.classList.remove('is-invalid');
        }
        
        // Si hay errores, mostrarlos y detener el envío del formulario
        if (errores.length > 0) {
            errorDiv.innerHTML = '<h5>Por favor, corrige los siguientes errores:</h5>' + errores.join('<br>');
            errorDiv.classList.remove('d-none');
            return;
        } else {
            // Limpiar clases de error
            firstNameInput.classList.remove('is-invalid');
            lastNameInput.classList.remove('is-invalid');
            passwordInput.classList.remove('is-invalid');
            if (confirmPasswordInput) confirmPasswordInput.classList.remove('is-invalid');
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