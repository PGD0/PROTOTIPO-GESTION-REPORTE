import api from './api.js';

document.addEventListener('DOMContentLoaded', function () {
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
    const codigoEquipoInput = document.getElementById('codigoEquipo');
    const btnEscanear = document.getElementById('btnEscanear'); // Referencia al botón de escaneo

    let html5QrcodeScanner = null;

    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Código detectado = ${decodedText}`, decodedResult);
        codigoDetectado.textContent = decodedText;
        resultadoEscaneo.style.display = 'block';
        btnUsarCodigo.style.display = 'inline-block';

        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                document.getElementById("reader").innerHTML = "";
            }).catch(error => {
                console.error("Error al detener el escaneo:", error);
            });
        }
    }

    function onScanFailure(error) {
        console.warn(`Error de escaneo = ${error}`);
    }

    async function iniciarCamara() {
        const readerElement = document.getElementById('reader');
        readerElement.innerHTML = ''; // Limpia por si hay algo viejo

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        btnIniciarCamara.style.display = 'none';
        btnDetenerCamara.style.display = 'inline-block';
    }

    function detenerCamara() {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                document.getElementById("reader").innerHTML = "";
                html5QrcodeScanner = null;
            }).catch(error => {
                console.error("Error al detener la cámara:", error);
            });
        }

        btnIniciarCamara.style.display = 'inline-block';
        btnDetenerCamara.style.display = 'none';
        resultadoEscaneo.style.display = 'none';
    }

    function mostrarMensaje(mensaje) {
        codigoDetectado.textContent = mensaje;
        resultadoEscaneo.style.display = 'block';
        btnUsarCodigo.style.display = 'none';
    }

    function validarCodigoEquipo(codigo) {
        const regex = /^PC-\d{8}-[A-Z]+(-[A-Z]+)?(-\d+)?$/;
        return regex.test(codigo);
    }

    function usarCodigo() {
        const codigo = codigoDetectado.textContent;

        codigoEquipoInput.value = codigo;

        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();

        limpiarEstado();
    }

    function limpiarEstado() {
        resultadoEscaneo.style.display = 'none';
        btnUsarCodigo.style.display = 'none';
        imagenPreview.style.display = 'none';
        codigoDetectado.textContent = '';

        if (html5QrcodeScanner) {
            detenerCamara();
        }

        document.getElementById("reader").innerHTML = "";
    }

    // 📷 Escanear imagen desde archivo
    imagenQR.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewQR.src = e.target.result;
                imagenPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);

            const html5QrCode = new Html5Qrcode("reader");

            html5QrCode.scanFile(file, true)
                .then(decodedText => {
                    codigoDetectado.textContent = decodedText;
                    resultadoEscaneo.style.display = 'block';
                    btnUsarCodigo.style.display = 'inline-block';
                })
                .catch(err => {
                    console.error("No se pudo escanear el archivo:", err);
                    mostrarMensaje("No se detectó ningún código.");
                });
        }
    });

    // 🎯 Eventos
    btnIniciarCamara.addEventListener('click', iniciarCamara);
    btnDetenerCamara.addEventListener('click', detenerCamara);
    btnUsarCodigo.addEventListener('click', usarCodigo);
    btnSeleccionarImagen.addEventListener('click', () => imagenQR.click());

    modal.addEventListener('hidden.bs.modal', limpiarEstado);

    modal.addEventListener('shown.bs.modal', function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            btnIniciarCamara.disabled = true;
            btnIniciarCamara.title = 'Tu navegador no soporta acceso a la cámara';
        }
    });

    // Asegurarse de que el botón de escaneo esté siempre visible
    // Esto evita que el botón desaparezca cuando se abre el menú
    if (btnEscanear) {
        // Restaurar visibilidad del botón si se oculta
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    if (btnEscanear.style.display === 'none') {
                        btnEscanear.style.display = 'inline-block';
                    }
                }
            });
        });

        observer.observe(btnEscanear, { attributes: true });
    }
});
