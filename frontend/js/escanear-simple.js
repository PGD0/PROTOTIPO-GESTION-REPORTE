// escanear-simple.js
// Interfaz visual simple para acceso a cámara y archivos

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del modal
    const modal = document.getElementById('escanearModal');
    const video = document.getElementById('cameraVideo');
    const btnIniciarCamara = document.getElementById('btnIniciarCamara');
    const btnDetenerCamara = document.getElementById('btnDetenerCamara');
    const btnSeleccionarImagen = document.getElementById('btnSeleccionarImagen');
    const imagenQR = document.getElementById('imagenQR');
    const imagenPreview = document.getElementById('imagenPreview');
    const previewQR = document.getElementById('previewQR');
    const resultadoEscaneo = document.getElementById('resultadoEscaneo');
    const codigoDetectado = document.getElementById('codigoDetectado');
    const btnUsarCodigo = document.getElementById('btnUsarCodigo');
    
    // Elementos del formulario principal
    const codigoEquipoInput = document.getElementById('codigoEquipo');
    
    // Variables para la cámara
    let stream = null;

    // Función para iniciar la cámara
    async function iniciarCamara() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Usar cámara trasera en móviles
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            video.srcObject = stream;
            btnIniciarCamara.style.display = 'none';
            btnDetenerCamara.style.display = 'inline-block';
            
            mostrarMensaje('Cámara activa. Apunta al código de barras del equipo.');
            
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            alert('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    }

    // Función para detener la cámara
    function detenerCamara() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        btnIniciarCamara.style.display = 'inline-block';
        btnDetenerCamara.style.display = 'none';
        resultadoEscaneo.style.display = 'none';
    }

    // Función para mostrar mensaje
    function mostrarMensaje(mensaje) {
        codigoDetectado.textContent = mensaje;
        resultadoEscaneo.style.display = 'block';
        btnUsarCodigo.style.display = 'none';
    }

    // Función para simular detección (para pruebas)
    function simularDeteccion() {
        const codigosEjemplo = [
            'PC-32013391-SOL-A-101',
            'PC-32013392-SOL-A-102',
            'PC-32013393-SOL-B-201',
            'PC-32013399-PLAZ-1',
            'PC-32013402-CENT-1'
        ];
        
        const codigoAleatorio = codigosEjemplo[Math.floor(Math.random() * codigosEjemplo.length)];
        codigoDetectado.textContent = codigoAleatorio;
        resultadoEscaneo.style.display = 'block';
        btnUsarCodigo.style.display = 'inline-block';
    }

    // Función para validar formato del código
    function validarCodigoEquipo(codigo) {
        const regex = /^PC-\d{8}-[A-Z]+(-[A-Z]+)?(-\d+)?$/;
        return regex.test(codigo);
    }

    // Función para usar el código detectado
    function usarCodigo() {
        const codigo = codigoDetectado.textContent;
        
        if (!validarCodigoEquipo(codigo)) {
            alert('El código de barras no tiene el formato correcto. Debe ser: PC-XXXXXXXX-SEDE-BLOQUE-SALON');
            return;
        }
        
        codigoEquipoInput.value = codigo;
        
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        
        limpiarEstado();
    }

    // Función para limpiar el estado del modal
    function limpiarEstado() {
        resultadoEscaneo.style.display = 'none';
        btnUsarCodigo.style.display = 'none';
        imagenPreview.style.display = 'none';
        codigoDetectado.textContent = '';
        
        if (stream) {
            detenerCamara();
        }
    }

    // Event listeners
    btnIniciarCamara.addEventListener('click', iniciarCamara);
    btnDetenerCamara.addEventListener('click', detenerCamara);
    btnUsarCodigo.addEventListener('click', usarCodigo);
    
    // Event listener para seleccionar imagen
    btnSeleccionarImagen.addEventListener('click', () => {
        imagenQR.click();
    });
    
    // Event listener para cambio de imagen
    imagenQR.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewQR.src = e.target.result;
                imagenPreview.style.display = 'block';
                
                // Simular detección después de un delay
                setTimeout(() => {
                    simularDeteccion();
                }, 1000);
            };
            reader.readAsDataURL(file);
        }
    });

    // Event listener para cuando se cierra el modal
    modal.addEventListener('hidden.bs.modal', function() {
        limpiarEstado();
    });

    // Event listener para cuando se abre el modal
    modal.addEventListener('shown.bs.modal', function() {
        // Verificar si el navegador soporta getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            btnIniciarCamara.disabled = true;
            btnIniciarCamara.title = 'Tu navegador no soporta acceso a la cámara';
        }
    });

    // Event listener para simular detección con cámara (doble clic en video)
    video.addEventListener('dblclick', function() {
        if (stream) {
            simularDeteccion();
        }
    });
}); 