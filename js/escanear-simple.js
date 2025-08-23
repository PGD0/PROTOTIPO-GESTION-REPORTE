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
    const codigoEquipoInput =  document.getElementById("codigoBarras") || document.getElementById('codigoEquipo');
    const btnEscanear = document.getElementById('btnEscanear'); 
    let html5QrcodeScanner = null;

    const onScanSuccess = (decodedText, decodedResult) => {
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

    const onScanFailure = (error) => {
        console.warn(`Error de escaneo = ${error}`);
    }

    const iniciarCamara = () => {
        const readerElement = document.getElementById('reader');
        readerElement.innerHTML = ''; 

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        btnIniciarCamara.style.display = 'none';
        btnDetenerCamara.style.display = 'inline-block';
    }

    const detenerCamara = () => {
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

    const mostrarMensaje = (mensaje) => {
        codigoDetectado.textContent = mensaje;
        resultadoEscaneo.style.display = 'block';
        btnUsarCodigo.style.display = 'none';
    }

    const validarCodigoEquipo = (codigo) => {
        const regex = /^PC-\d{8}-[A-Z]+(-[A-Z]+)?(-\d+)?$/;
        return regex.test(codigo);
    }

    const usarCodigo = () => {
        const codigo = codigoDetectado.textContent;

        codigoEquipoInput.value = codigo;

        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();

        limpiarEstado();
    }

    const limpiarEstado = () => {
        resultadoEscaneo.style.display = 'none';
        btnUsarCodigo.style.display = 'none';
        imagenPreview.style.display = 'none';
        codigoDetectado.textContent = '';

        if (html5QrcodeScanner) {
            detenerCamara();
        }

        document.getElementById("reader").innerHTML = "";
    }

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

    if (btnEscanear) {
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
    modal.addEventListener('hidden.bs.modal', limpiarEstado);

    document.getElementById('escanearModal').addEventListener('hidden.bs.modal', () => {
        const modalEquipo = document.getElementById('equipoModal');
        if (!modalEquipo.classList.contains('show')) {
            const modalInstance = new bootstrap.Modal(modalEquipo);
            modalInstance.show();
        }
    });
});
