// hacer-reporte.js
// Funcionalidad para el formulario de crear reportes
import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const sedeSelect = document.getElementById('sedeSelect');
    const bloqueContainer = document.getElementById('bloqueContainer');
    const bloqueSelect = document.getElementById('bloqueSelect');
    const salonContainer = document.getElementById('salonContainer');
    const salonSelect = document.getElementById('salonSelect');
    const codigoEquipoInput = document.getElementById('codigoEquipo');

    codigoEquipoInput.addEventListener('input', async function() {
        const codigo = this.value.trim();
        if (codigo.length < 5) return; // Longitud mínima para buscar
        
        try {
            const equipo = await api.getEquipoPorCodigo(codigo);
            
            // Si encontramos el equipo, autocompletamos
            if (equipo) {
                // Llenar sede
                if (equipo.sede) {
                    sedeSelect.value = equipo.sede.ID_sede;
                    // Disparar evento para cargar bloques
                    const event = new Event('change');
                    sedeSelect.dispatchEvent(event);
                    
                    // Esperar a que carguen los bloques
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Llenar bloque si existe
                    if (equipo.salon && equipo.salon.bloque) {
                        bloqueSelect.value = equipo.salon.bloque.ID_bloque;
                        // Disparar evento para cargar salones
                        const bloqueEvent = new Event('change');
                        bloqueSelect.dispatchEvent(bloqueEvent);
                    }
                    
                    // Esperar a que carguen los salones
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Llenar salón
                    if (equipo.salon) {
                        salonSelect.value = equipo.salon.ID_salon;
                    }
                }
            }
        } catch (error) {
            console.log('Equipo no encontrado o error:', error.message);
            // No hacemos nada, el usuario puede seguir escribiendo
        }
    });

    // Función para cargar sedes desde la API
    async function cargarSedes() {
        try {
            const sedes = await api.getSedes();
            console.log('Sedes obtenidas de la API:', sedes);
            
            // Limpiar y agregar opción por defecto
            sedeSelect.innerHTML = '<option value="">Seleccionar sede</option>';
            
            // Poblar el select con las sedes de la base de datos
            sedes.forEach(sede => {
                const option = document.createElement('option');
                option.value = sede.ID_sede;
                option.textContent = sede.nombre_sede;
                sedeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error cargando sedes:', error);
            mostrarMensaje('Error al cargar las sedes. Por favor, intenta más tarde.', 'danger');
        }
    }

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
            // Verificar si el error es "No se encontraron bloques"
            if (error.message && error.message.includes('No se encontraron bloques')) {
                console.log('No hay bloques disponibles en la base de datos');
                return []; // Devolver array vacío sin mostrar mensaje de error
            } else {
                // Para otros errores, mostrar mensaje
                mostrarMensaje('Error al cargar los bloques. Por favor, intenta más tarde.', 'danger');
                return [];
            }
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
                // Filtrar por bloque específico
                salonesFiltrados = salones.filter(salon => {
                    const sedeCoincide = salon.sede == sedeId;
                    // Verificar si el salón tiene el campo bloque
                    const bloqueCoincide = salon.bloque ? salon.bloque == bloqueId : false;
                    return sedeCoincide && bloqueCoincide;
                });
            } else {
                // Si no se especifica bloque, mostrar todos los salones de la sede
                // incluyendo aquellos que no tienen bloque asignado
                salonesFiltrados = salones.filter(salon => salon.sede == sedeId);
            }
            
            console.log('Salones filtrados:', salonesFiltrados);
            return salonesFiltrados || [];
        } catch (error) {
            console.error('Error cargando salones:', error);
            mostrarMensaje('Error al cargar los salones. Por favor, intenta más tarde.', 'danger');
            return [];
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
        
        if (!salones || salones.length === 0) {
            salonContainer.style.display = 'none';
            console.warn('No se encontraron salones para mostrar');
            mostrarMensaje('No se encontraron salones para la sede seleccionada', 'warning');
            return;
        }
        
        salones.forEach(salon => {
            const option = document.createElement('option');
            option.value = salon.ID_salon || salon.id; // Compatibilidad con ambos formatos
            option.textContent = salon.codigo_salon || salon.nombre; // Compatibilidad con ambos formatos
            salonSelect.appendChild(option);
        });
        
        // Mostrar el contenedor de salones si hay opciones disponibles
        salonContainer.style.display = 'block';
    }

    // Cargar sedes al iniciar la página
    cargarSedes();

    // Event listener para cambio de sede
    sedeSelect.addEventListener('change', async function() {
        const sedeSeleccionada = this.value;
        
        // Limpiar selecciones previas
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        bloqueContainer.style.display = 'none';
        salonContainer.style.display = 'none';
    
        if (sedeSeleccionada) {
            try {
                // Cargar bloques para la sede seleccionada
                const bloques = await cargarBloques(sedeSeleccionada);
                
                // Verificar si la sede tiene bloques
                if (bloques && bloques.length > 0) {
                    // Si tiene bloques, mostrar el selector de bloques
                    poblarBloques(bloques);
                    // No cargar salones automáticamente, esperar a que se seleccione un bloque
                } else {
                    // Si no tiene bloques, cargar directamente los salones de la sede
                    console.log('La sede no tiene bloques, cargando salones directamente');
                    const salones = await cargarSalones(sedeSeleccionada);
                    poblarSalones(salones);
                }
            } catch (error) {
                console.error('Error al cargar datos para la sede:', error);
                mostrarMensaje('Error al cargar datos para la sede seleccionada. Por favor, intenta más tarde.', 'danger');
            }
        }
    });

    // Event listener para cambio de bloque
    bloqueSelect.addEventListener('change', async function() {
        const bloqueSeleccionado = this.value;
        const sedeSeleccionada = sedeSelect.value;
        
        // Limpiar selecciones previas de salones
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        salonContainer.style.display = 'none';
        
        if (bloqueSeleccionado && sedeSeleccionada) {
            // Cargar salones del bloque seleccionado
            const salones = await cargarSalones(sedeSeleccionada, bloqueSeleccionado);
            poblarSalones(salones);
        } else if (sedeSeleccionada) {
            // Si no hay bloque seleccionado pero sí hay sede, cargar todos los salones de la sede
            const salones = await cargarSalones(sedeSeleccionada);
            poblarSalones(salones);
        }
    });

    // Función para obtener datos del formulario
    function obtenerDatosFormulario() {
        const sedeSelect = document.getElementById('sedeSelect');
        const bloqueSelect = document.getElementById('bloqueSelect');
        const salonSelect = document.getElementById('salonSelect');

        return {
            sede: sedeSelect?.value || '',
            bloque: bloqueSelect?.value || null,
            salon: salonSelect?.value || '',
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

        // Validación básica
        if (!datos.sede || !datos.salon || !datos.codigoEquipo || !datos.tipoProblema || !datos.titulo || !datos.descripcion) {
            mostrarMensaje('Por favor, completa todos los campos obligatorios.', 'danger');
            return;
        }

        const submitBtn = this.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        mostrarMensaje('Enviando reporte...', 'info');

        try {
            // Verificar equipo
            const equipos = await api.getEquipos();
            const equipo = equipos.find(eq => eq.codigo_barras === datos.codigoEquipo);
            
            if (!equipo) {
                throw new Error('No se encontró ningún equipo con ese código. Verifica el código ingresado.');
            }

            // Usar api.crearReporte en lugar de fetch directo
            await api.crearReporte({
                ID_equipo: equipo.ID_equipo,
                sede: datos.sede,
                bloque: datos.bloque,
                salon: datos.salon,
                titulo: datos.titulo,
                tipo_problema: datos.tipoProblema,
                prioridad: datos.prioridad,
                descripcion: datos.descripcion,
                contacto: datos.contacto,
                ID_usuario: JSON.parse(localStorage.getItem('currentUser'))?.ID_usuarios || 1,
                resuelto: false,
                imagen: datos.imagen
            });

            mostrarMensaje('Reporte enviado exitosamente', 'success');
            this.reset();
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