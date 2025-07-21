// hacer-reporte.js
// Funcionalidad para el formulario de crear reportes
import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const sedeSelect = document.getElementById('sedeSelect');
    const bloqueContainer = document.getElementById('bloqueContainer');
    const bloqueSelect = document.getElementById('bloqueSelect');
    const salonContainer = document.getElementById('salonContainer');
    const salonSelect = document.getElementById('salonSelect');

    // Datos mock de bloques y salones (solo como fallback)
    const bloquesData = {
        'soledad': [
            { id: 1, nombre: 'Bloque A' },
            { id: 2, nombre: 'Bloque B' },
            { id: 3, nombre: 'Bloque C' },
            { id: 4, nombre: 'Bloque D' },
            { id: 5, nombre: 'Bloque E' },
            { id: 6, nombre: 'Bloque F' }
        ],
        'plaza': [
            { id: 7, nombre: 'Bloque 1' },
            { id: 8, nombre: 'Bloque 2' }
        ],
        'centro': [
            { id: 9, nombre: 'Bloque Norte' },
            { id: 10, nombre: 'Bloque Sur' }
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
        'plaza': {
            '7': [ // Bloque 1
                { id: 13, nombre: 'Oficina 1' },
                { id: 14, nombre: 'Oficina 2' }
            ],
            '8': [ // Bloque 2
                { id: 15, nombre: 'Oficina 3' }
            ]
        },
        'centro': {
            '9': [ // Bloque Norte
                { id: 16, nombre: 'Aula 1' },
                { id: 17, nombre: 'Aula 2' }
            ],
            '10': [ // Bloque Sur
                { id: 18, nombre: 'Aula 3' }
            ]
        }
    };

    // Función para cargar bloques desde la API
    async function cargarBloques(sedeId) {
        try {
            // Obtener todos los bloques
            const bloques = await api.getBloques();
            console.log('Bloques obtenidos de la API:', bloques);
            // Filtrar por sede
            return bloques.filter(bloque => bloque.sede_id == sedeId);
        } catch (error) {
            console.error('Error cargando bloques:', error);
            // Fallback a datos mock
            return bloquesData[sedeId] || [];
        }
    }

    // Función para cargar salones desde la API
    async function cargarSalones(sedeId, bloqueId = null) {
        try {
            // Obtener todos los salones
            const salones = await api.getSalones();
            console.log('Salones obtenidos de la API:', salones);
            
            // Filtrar por sede y bloque si es necesario
            let salonesFiltrados;
            if (bloqueId) {
                // Intentar filtrar por bloque, pero verificar si el campo existe
                salonesFiltrados = salones.filter(salon => {
                    const sedeCoincide = salon.sede == sedeId;
                    // Verificar si el salón tiene el campo bloque
                    const bloqueCoincide = salon.bloque ? salon.bloque == bloqueId : false;
                    return sedeCoincide && bloqueCoincide;
                });
                
                // Si no hay resultados, intentar obtener todos los salones de la sede
                if (salonesFiltrados.length === 0) {
                    console.log('No se encontraron salones con el bloque especificado, mostrando todos los de la sede');
                    salonesFiltrados = salones.filter(salon => salon.sede == sedeId);
                }
            } else {
                salonesFiltrados = salones.filter(salon => salon.sede == sedeId);
            }
            
            console.log('Salones filtrados:', salonesFiltrados);
            return salonesFiltrados;
        } catch (error) {
            console.error('Error cargando salones:', error);
            // Fallback a datos mock
            if (bloqueId && salonesData[sedeId] && salonesData[sedeId][bloqueId]) {
                return salonesData[sedeId][bloqueId] || [];
            } else if (sedeId && !bloqueId) {
                // Si solo tenemos sede pero no bloque, intentar obtener todos los salones de esa sede
                let todosLosSalones = [];
                if (salonesData[sedeId]) {
                    // Recorrer todos los bloques de la sede y agregar sus salones
                    Object.values(salonesData[sedeId]).forEach(salones => {
                        todosLosSalones = todosLosSalones.concat(salones);
                    });
                }
                return todosLosSalones;
            } else {
                // Si no hay bloque seleccionado o no hay datos para ese bloque, devolver array vacío
                return [];
            }
        }
    }

    // Función para poblar select de bloques
    function poblarBloques(bloques) {
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        bloques.forEach(bloque => {
            const option = document.createElement('option');
            option.value = bloque.ID_bloque || bloque.id; // Compatibilidad con ambos formatos
            option.textContent = bloque.nombre_bloque || bloque.nombre; // Compatibilidad con ambos formatos
            bloqueSelect.appendChild(option);
        });
        
        // Mostrar el contenedor de bloques si hay opciones disponibles
        if (bloques.length > 0) {
            bloqueContainer.style.display = 'block';
        } else {
            bloqueContainer.style.display = 'none';
            console.warn('No se encontraron bloques para mostrar');
        }
    }
    
    // Función para poblar select de salones
    function poblarSalones(salones) {
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        salones.forEach(salon => {
            const option = document.createElement('option');
            option.value = salon.ID_salon || salon.id; // Compatibilidad con ambos formatos
            option.textContent = salon.codigo_salon || salon.nombre; // Compatibilidad con ambos formatos
            salonSelect.appendChild(option);
        });
        
        // Mostrar el contenedor de salones si hay opciones disponibles
        if (salones.length > 0) {
            salonContainer.style.display = 'block';
        } else {
            salonContainer.style.display = 'none';
            console.warn('No se encontraron salones para mostrar');
        }
    }

    // Event listener para cambio de sede
    sedeSelect.addEventListener('change', async function() {
        const sedeSeleccionada = this.value;
        
        // Limpiar selecciones previas
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';

        if (sedeSeleccionada) {
            // Cargar bloques para cualquier sede
            const bloques = await cargarBloques(sedeSeleccionada);
            poblarBloques(bloques);
            
            // Cargar todos los salones de la sede si no hay bloques o son pocos
            if (bloques.length === 0 || bloques.length < 3) {
                const salones = await cargarSalones(sedeSeleccionada);
                poblarSalones(salones);
            } else {
                // Si hay muchos bloques, ocultar salones hasta que se seleccione un bloque
                salonContainer.style.display = 'none';
            }
        } else {
            // Ocultar todo si no hay sede seleccionada
            bloqueContainer.style.display = 'none';
            salonContainer.style.display = 'none';
        }
    });

    // Event listener para cambio de bloque
    bloqueSelect.addEventListener('change', async function() {
        const bloqueSeleccionado = this.value;
        const sedeSeleccionada = sedeSelect.value;
        
        if (bloqueSeleccionado && sedeSeleccionada) {
            // Cargar salones del bloque seleccionado
            const salones = await cargarSalones(sedeSeleccionada, bloqueSeleccionado);
            poblarSalones(salones);
        } else if (sedeSeleccionada) {
            // Si no hay bloque seleccionado pero sí hay sede, cargar todos los salones de la sede
            const salones = await cargarSalones(sedeSeleccionada);
            poblarSalones(salones);
        } else {
            // Si no hay sede seleccionada, limpiar salones
            salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
            salonContainer.style.display = 'none';
        }
    });

    // Función para obtener datos del formulario
    function obtenerDatosFormulario() {
        return {
            sede: sedeSelect.value,
            bloque: bloqueSelect.value,
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
        // Validación básica de campos requeridos
        if (!datos.sede || !datos.salon || !datos.codigoEquipo || !datos.tipoProblema || !datos.titulo || !datos.descripcion || !datos.imagen) {
            mostrarMensaje('Por favor, completa todos los campos obligatorios y adjunta una imagen.', 'danger');
            return;
        }
        // Deshabilitar botón de envío
        const submitBtn = this.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        mostrarMensaje('Enviando reporte...', 'info');
        try {
            // Usar la función de API para crear el reporte
            await api.crearReporte({
                ID_equipo: datos.codigoEquipo,
                descripcion: datos.descripcion,
                estado_equipo: datos.tipoProblema,
                ID_usuario: localStorage.getItem('user_id') || 1,
                resuelto: false,
                imagen: datos.imagen
            });
            
            mostrarMensaje('Reporte enviado exitosamente', 'success');
            this.reset();
            // Opcional: actualizar lista de reportes si existe función global
            if (typeof renderReportes === 'function') renderReportes();
        } catch (err) {
            mostrarMensaje(err.message, 'danger');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Función para mostrar mensajes de feedback
    function mostrarMensaje(msg, tipo) {
        let msgDiv = document.getElementById('mensajeFeedback');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'mensajeFeedback';
            msgDiv.className = 'alert mt-3';
            document.querySelector('form').prepend(msgDiv);
        }
        msgDiv.textContent = msg;
        msgDiv.className = 'alert mt-3 alert-' + tipo;
    }
});