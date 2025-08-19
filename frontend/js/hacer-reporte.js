
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
        if (codigo.length < 5) return; 
        
        try {
            const equipo = await api.getEquipoPorCodigo(codigo);
            
            if (equipo) {
                if (equipo.sede) {
                    sedeSelect.value = equipo.sede.ID_sede;
                    const event = new Event('change');
                    sedeSelect.dispatchEvent(event);
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    if (equipo.salon && equipo.salon.bloque) {
                        bloqueSelect.value = equipo.salon.bloque.ID_bloque;
                        const bloqueEvent = new Event('change');
                        bloqueSelect.dispatchEvent(bloqueEvent);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    if (equipo.salon) {
                        salonSelect.value = equipo.salon.ID_salon;
                    }
                }
            }
        } catch (error) {
            console.log('Equipo no encontrado o error:', error.message);
        }
    });

    async function cargarSedes() {
        try {
            const sedes = await api.getSedes();
            console.log('Sedes obtenidas de la API:', sedes);
            
            sedeSelect.innerHTML = '<option value="">Seleccionar sede</option>';
            
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

    async function cargarBloques(sedeId) {
        try {
            const bloques = await api.getBloques();
            console.log('Bloques obtenidos de la API:', bloques);
            return bloques.filter(bloque => bloque.sede_id == sedeId);
        } catch (error) {
            console.error('Error cargando bloques:', error);
            if (error.message && error.message.includes('No se encontraron bloques')) {
                console.log('No hay bloques disponibles en la base de datos');
                return []; 
            } else {
                mostrarMensaje('Error al cargar los bloques. Por favor, intenta más tarde.', 'danger');
                return [];
            }
        }
    }

    async function cargarSalones(sedeId, bloqueId = null) {
        try {
            const salones = await api.getSalones();
            console.log('Salones obtenidos de la API:', salones);
            
            let salonesFiltrados;
            if (bloqueId) {
                salonesFiltrados = salones.filter(salon => {
                    const sedeCoincide = salon.sede == sedeId;
                    const bloqueCoincide = salon.bloque ? salon.bloque == bloqueId : false;
                    return sedeCoincide && bloqueCoincide;
                });
            } else {
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

    function poblarBloques(bloques) {
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        bloques.forEach(bloque => {
            const option = document.createElement('option');
            option.value = bloque.ID_bloque || bloque.id; 
            option.textContent = bloque.nombre_bloque || bloque.nombre;
            bloqueSelect.appendChild(option);
        });
        
        if (bloques.length > 0) {
            bloqueContainer.style.display = 'block';
        } else {
            bloqueContainer.style.display = 'none';
            console.warn('No se encontraron bloques para mostrar');
        }
    }
    
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
            option.value = salon.ID_salon || salon.id; 
            option.textContent = salon.codigo_salon || salon.nombre; 
            salonSelect.appendChild(option);
        });
        
        salonContainer.style.display = 'block';
    }

    cargarSedes();

    sedeSelect.addEventListener('change', async function() {
        const sedeSeleccionada = this.value;
        
        bloqueSelect.innerHTML = '<option value="">Seleccionar bloque</option>';
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        bloqueContainer.style.display = 'none';
        salonContainer.style.display = 'none';
    
        if (sedeSeleccionada) {
            try {
                const bloques = await cargarBloques(sedeSeleccionada);
                
                if (bloques && bloques.length > 0) {
                    poblarBloques(bloques);
                } else {
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

    bloqueSelect.addEventListener('change', async function() {
        const bloqueSeleccionado = this.value;
        const sedeSeleccionada = sedeSelect.value;
        
        salonSelect.innerHTML = '<option value="">Seleccionar salón</option>';
        salonContainer.style.display = 'none';
        
        if (bloqueSeleccionado && sedeSeleccionada) {
            const salones = await cargarSalones(sedeSeleccionada, bloqueSeleccionado);
            poblarSalones(salones);
        } else if (sedeSeleccionada) {
            const salones = await cargarSalones(sedeSeleccionada);
            poblarSalones(salones);
        }
    });

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

    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const datos = obtenerDatosFormulario();

        if (!datos.sede || !datos.salon || !datos.codigoEquipo || !datos.tipoProblema || !datos.titulo || !datos.descripcion) {
            mostrarMensaje('Por favor, completa todos los campos obligatorios.', 'danger');
            return;
        }

        const submitBtn = this.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        mostrarMensaje('Enviando reporte...', 'info');

        try {
            const equipos = await api.getEquipos();
            const equipo = equipos.find(eq => eq.codigo_barras === datos.codigoEquipo);
            
            if (!equipo) {
                throw new Error('No se encontró ningún equipo con ese código. Verifica el código ingresado.');
            }

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