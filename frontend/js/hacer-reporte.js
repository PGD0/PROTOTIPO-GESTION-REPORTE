// hacer-reporte.js
// Funcionalidad para el formulario de crear reportes

document.addEventListener('DOMContentLoaded', function() {
    const sedeSelect = document.getElementById('sedeSelect');
    const bloqueContainer = document.getElementById('bloqueContainer');
    const bloqueSelect = document.getElementById('bloqueSelect');
    const salonContainer = document.getElementById('salonContainer');
    const salonSelect = document.getElementById('salonSelect');

    // Datos mock de bloques y salones (reemplazar con llamadas a la API)
    const bloquesData = {
        'soledad': [
            { id: 1, nombre: 'Bloque A' },
            { id: 2, nombre: 'Bloque B' },
            { id: 3, nombre: 'Bloque C' },
            { id: 4, nombre: 'Bloque D' },
            { id: 5, nombre: 'Bloque E' },
            { id: 6, nombre: 'Bloque F' }
        ]
    };

    const salonesData = {
        'soledad': {
            '1': [ // Bloque A
                { id: 1, nombre: 'Salón 101' },
                { id: 2, nombre: 'Salón 102' },
                { id: 3, nombre: 'Salón 103' }
            ],
            '2': [ // Bloque B
                { id: 4, nombre: 'Salón 201' },
                { id: 5, nombre: 'Salón 202' },
                { id: 6, nombre: 'Salón 203' }
            ],
            '3': [ // Bloque C
                { id: 7, nombre: 'Salón 301' },
                { id: 8, nombre: 'Salón 302' },
                { id: 9, nombre: 'Salón 303' }
            ],
            '4': [ // Bloque D
                { id: 10, nombre: 'Salón 401' },
                { id: 11, nombre: 'Salón 402' },
                { id: 12, nombre: 'Salón 403' }
            ],
            '5': [ // Bloque E
                { id: 13, nombre: 'Salón 501' },
                { id: 14, nombre: 'Salón 502' },
                { id: 15, nombre: 'Salón 503' }
            ],
            '6': [ // Bloque F
                { id: 16, nombre: 'Salón 601' },
                { id: 17, nombre: 'Salón 602' },
                { id: 18, nombre: 'Salón 603' }
            ]
        },
        'plaza': [
            { id: 13, nombre: 'Oficina 1' },
            { id: 14, nombre: 'Oficina 2' },
            { id: 15, nombre: 'Oficina 3' }
        ],
        'centro': [
            { id: 16, nombre: 'Aula 1' },
            { id: 17, nombre: 'Aula 2' },
            { id: 18, nombre: 'Aula 3' }
        ]
    };

    // Función para cargar bloques desde la API
    async function cargarBloques(sedeId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/bloques/?sede_id=${sedeId}`);
            if (response.ok) {
                const bloques = await response.json();
                return bloques;
            }
        } catch (error) {
            console.error('Error cargando bloques:', error);
        }
        return bloquesData[sedeId] || [];
    }

    // Función para cargar salones desde la API
    async function cargarSalones(sedeId, bloqueId = null) {
        try {
            let url = `http://127.0.0.1:8000/salones/?sede_id=${sedeId}`;
            if (bloqueId) {
                url += `&bloque_id=${bloqueId}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const salones = await response.json();
                return salones;
            }
        } catch (error) {
            console.error('Error cargando salones:', error);
        }
        
        // Fallback a datos mock
        if (sedeId === 'soledad' && bloqueId) {
            return salonesData[sedeId][bloqueId] || [];
        } else {
            return salonesData[sedeId] || [];
        }
    }

    // Función para poblar select de bloques
    function poblarBloques(bloques) {
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        bloques.forEach(bloque => {
            const option = document.createElement('option');
            option.value = bloque.id;
            option.textContent = bloque.nombre;
            bloqueSelect.appendChild(option);
        });
    }

    // Función para poblar select de salones
    function poblarSalones(salones) {
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        salones.forEach(salon => {
            const option = document.createElement('option');
            option.value = salon.id;
            option.textContent = salon.nombre;
            salonSelect.appendChild(option);
        });
    }

    // Event listener para cambio de sede
    sedeSelect.addEventListener('change', async function() {
        const sedeSeleccionada = this.value;
        
        // Limpiar selecciones previas
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';

        if (sedeSeleccionada === 'soledad') {
            // Mostrar selector de bloques para Soledad
            bloqueContainer.style.display = 'block';
            
            // Cargar bloques
            const bloques = await cargarBloques(sedeSeleccionada);
            poblarBloques(bloques);
            
        } else if (sedeSeleccionada) {
            // Ocultar selector de bloques para otras sedes
            bloqueContainer.style.display = 'none';
            
            // Cargar salones directamente
            const salones = await cargarSalones(sedeSeleccionada);
            poblarSalones(salones);
        } else {
            // Ocultar todo si no hay sede seleccionada
            bloqueContainer.style.display = 'none';
            salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        }
    });

    // Event listener para cambio de bloque (solo para Soledad)
    bloqueSelect.addEventListener('change', async function() {
        const bloqueSeleccionado = this.value;
        const sedeSeleccionada = sedeSelect.value;
        
        if (bloqueSeleccionado && sedeSeleccionada === 'soledad') {
            // Cargar salones del bloque seleccionado
            const salones = await cargarSalones(sedeSeleccionada, bloqueSeleccionado);
            poblarSalones(salones);
        }
    });

    // Función para obtener datos del formulario
    function obtenerDatosFormulario() {
        return {
            sede: sedeSelect.value,
            bloque: sedeSelect.value === 'soledad' ? bloqueSelect.value : null,
            salon: salonSelect.value,
            codigoEquipo: document.getElementById('codigoEquipo').value,
            tipoProblema: document.getElementById('tipoProblema').value,
            titulo: document.getElementById('tituloReporte').value,
            descripcion: document.getElementById('descripcionReporte').value,
            prioridad: document.getElementById('prioridadReporte').value,
            contacto: document.getElementById('contactoReporte').value,
            imagen: document.getElementById('imagenReporte').files[0]
        };
    }

    // Event listener para envío del formulario
    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const datos = obtenerDatosFormulario();
        console.log('Datos del formulario:', datos);
        
        // Aquí puedes enviar los datos a tu API
        // await enviarReporte(datos);
        
        alert('Reporte enviado exitosamente');
    });
}); 