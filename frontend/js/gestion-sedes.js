import api from './api.js';

// Elementos DOM para Sedes
const tablaSedes = document.querySelector('#tablaSedes tbody');
const formSede = document.getElementById('formSede');
const sedeId = document.getElementById('sedeId');
const nombreSede = document.getElementById('nombreSede');

// Elementos DOM para Bloques
const tablaBloques = document.querySelector('#tablaBloques tbody');
const formBloque = document.getElementById('formBloque');
const bloqueId = document.getElementById('bloqueId');
const nombreBloque = document.getElementById('nombreBloque');
const sedeBloque = document.getElementById('sedeBloque');

// Elementos DOM para Salones
const tablaSalones = document.querySelector('#tablaSalones tbody');
const formSalon = document.getElementById('formSalon');
const salonId = document.getElementById('salonId');
const codigoSalon = document.getElementById('codigoSalon');
const sedeSalon = document.getElementById('sedeSalon');
const bloqueSalon = document.getElementById('bloqueSalon');
const bloqueSalonContainer = document.getElementById('bloqueSalonContainer');

// Elementos DOM para Eliminación
const formEliminar = document.getElementById('formEliminar');
const eliminarId = document.getElementById('eliminarId');
const eliminarTipo = document.getElementById('eliminarTipo');
const eliminarMensaje = document.getElementById('eliminarMensaje');
const passwordConfirm = document.getElementById('passwordConfirm');

// Variables globales
let todasLasSedes = [];
let todosLosBloques = [];
let todosLosSalones = [];

// Funciones para cargar datos
async function cargarSedes() {
    try {
        const sedes = await api.getSedes();
        todasLasSedes = sedes;
        renderizarTablaSedes(sedes);
        actualizarSelectSedes();
    } catch (error) {
        console.error("Error al cargar sedes:", error);
        mostrarError(tablaSedes, "Error al cargar las sedes");
    }
}

async function cargarBloques() {
    try {
        const bloques = await api.getBloques();
        todosLosBloques = bloques;
        renderizarTablaBloques(bloques);
        actualizarSelectBloques();
    } catch (error) {
        console.error("Error al cargar bloques:", error);
        mostrarError(tablaBloques, "Error al cargar los bloques");
    }
}

async function cargarSalones() {
    try {
        // Asegurarse de que las sedes y bloques estén cargados primero
        if (todasLasSedes.length === 0) {
            await cargarSedes();
        }
        if (todosLosBloques.length === 0) {
            await cargarBloques();
        }
        
        const salones = await api.getSalones();
        console.log('Salones cargados desde API:', salones);
        todosLosSalones = salones;
        renderizarTablaSalones(salones);
    } catch (error) {
        console.error("Error al cargar salones:", error);
        mostrarError(tablaSalones, "Error al cargar los salones");
    }
}

// Funciones para renderizar tablas
function renderizarTablaSedes(sedes) {
    tablaSedes.innerHTML = '';
    
    if (sedes.length === 0) {
        mostrarMensajeVacio(tablaSedes, "No hay sedes registradas aún");
        return;
    }
    
    sedes.forEach(sede => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sede.ID_sede}</td>
            <td>${sede.nombre_sede}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarSede(${sede.ID_sede})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('sede', ${sede.ID_sede}, '${sede.nombre_sede}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tablaSedes.appendChild(tr);
    });
}

function renderizarTablaBloques(bloques) {
    tablaBloques.innerHTML = '';
    
    if (bloques.length === 0) {
        mostrarMensajeVacio(tablaBloques, "No hay bloques registrados aún");
        return;
    }
    
    bloques.forEach(bloque => {
        const sede = todasLasSedes.find(s => s.ID_sede === bloque.sede_id);
        const nombreSede = sede ? sede.nombre_sede : 'Desconocida';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bloque.ID_bloque}</td>
            <td>${bloque.nombre_bloque}</td>
            <td>${nombreSede}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarBloque(${bloque.ID_bloque})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('bloque', ${bloque.ID_bloque}, '${bloque.nombre_bloque}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tablaBloques.appendChild(tr);
    });
}

function renderizarTablaSalones(salones) {
    tablaSalones.innerHTML = '';
    
    if (salones.length === 0) {
        mostrarMensajeVacio(tablaSalones, "No hay salones registrados aún");
        return;
    }
    
    salones.forEach(salon => {
        // Depuración para ver la estructura de los datos
        console.log('Datos del salón:', salon);
        console.log('Todas las sedes:', todasLasSedes);
        console.log('Todos los bloques:', todosLosBloques);
        
        // Buscar la sede por ID
        const sede = todasLasSedes.find(s => s.ID_sede === salon.sede);
        const nombreSede = sede ? sede.nombre_sede : 'Desconocida';
        
        // Buscar el bloque si existe
        let nombreBloque = '-';
        if (salon.bloque) {
            const bloque = todosLosBloques.find(b => b.ID_bloque === salon.bloque);
            if (bloque) {
                nombreBloque = bloque.nombre_bloque;
            } else {
                console.log('No se encontró el bloque con ID:', salon.bloque);
            }
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${salon.ID_salon}</td>
            <td>${salon.codigo_salon}</td>
            <td>${nombreSede}</td>
            <td>${nombreBloque}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarSalon(${salon.ID_salon})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('salon', ${salon.ID_salon}, '${salon.codigo_salon}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tablaSalones.appendChild(tr);
    });
}

// Funciones para actualizar selects
function actualizarSelectSedes() {
    // Actualizar select para bloques
    sedeBloque.innerHTML = '<option value="">Selecciona una sede</option>';
    sedeSalon.innerHTML = '<option value="">Selecciona una sede</option>';
    
    todasLasSedes.forEach(sede => {
        // Para el select de bloques
        const optionBloque = document.createElement('option');
        optionBloque.value = sede.ID_sede;
        optionBloque.textContent = sede.nombre_sede;
        sedeBloque.appendChild(optionBloque);
        
        // Para el select de salones
        const optionSalon = document.createElement('option');
        optionSalon.value = sede.ID_sede;
        optionSalon.textContent = sede.nombre_sede;
        sedeSalon.appendChild(optionSalon);
    });
}

function actualizarSelectBloques(sedeId = null) {
    bloqueSalon.innerHTML = '<option value="">Selecciona un bloque</option>';
    
    let bloquesFiltrados = todosLosBloques;
    if (sedeId) {
        bloquesFiltrados = todosLosBloques.filter(b => b.sede_id === parseInt(sedeId));
    }
    
    bloquesFiltrados.forEach(bloque => {
        const option = document.createElement('option');
        option.value = bloque.ID_bloque;
        option.textContent = bloque.nombre_bloque;
        bloqueSalon.appendChild(option);
    });
}

// Funciones para editar elementos
async function editarSede(id) {
    try {
        // Obtener la sede específica
        const response = await fetch(`http://127.0.0.1:8000/sedes/${id}`, {
            headers: api.authHeaders()
        });
        if (!response.ok) throw new Error("No se pudo obtener la sede");
        const data = await response.json();
        
        // Extraer la sede del objeto de respuesta
        // La API devuelve {message: "...", sede: {...}}
        const sede = data.sede;
        
        if (!sede) {
            throw new Error("La estructura de datos de la sede no es válida");
        }
        
        // Abrir modal y llenar campos
        const sedeModal = new bootstrap.Modal(document.getElementById('sedeModal'));
        sedeId.value = sede.ID_sede;
        nombreSede.value = sede.nombre_sede;
        
        sedeModal.show();
    } catch (error) {
        console.error("Error al editar sede:", error);
        alert("Hubo un problema al cargar los datos de la sede.");
    }
}

async function editarBloque(id) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/bloques/${id}`, {
            headers: api.authHeaders()
        });
        if (!response.ok) throw new Error("No se pudo obtener el bloque");
        const bloque = await response.json();
        
        // Abrir modal y llenar campos
        const bloqueModal = new bootstrap.Modal(document.getElementById('bloqueModal'));
        bloqueId.value = bloque.ID_bloque;
        nombreBloque.value = bloque.nombre_bloque;
        sedeBloque.value = bloque.sede_id;
        bloqueModal.show();
    } catch (error) {
        console.error("Error al editar bloque:", error);
        alert("Hubo un problema al cargar los datos del bloque.");
    }
}
// http://127.0.0.1:8000/salones/${id}
async function editarSalon(id) {
    try {
        // Usar los headers de autenticación
        const response = await fetch(`http://localhost:8000/salones/${id}`, {
            headers: api.authHeaders()
        });
        if (!response.ok) throw new Error("No se pudo obtener la información del salón");

        const data = await response.json();
        console.log('Datos del salón recibidos:', data);
        const s = data.salon;

        document.getElementById("salonId").value = s.ID_salon;
        document.getElementById("codigoSalon").value = s.codigo_salon;
        document.getElementById("sedeSalon").value = s.sede;

        const sedeId = s.sede;
        const bloqueId = s.bloque;
        
        console.log('Sede ID:', sedeId, 'Bloque ID:', bloqueId);

        // Asegurarse de que las sedes estén cargadas
        if (todasLasSedes.length === 0) {
            await cargarSedes();
        }

        // Cargar bloques por sede
        const bloqueResponse = await fetch(`http://localhost:8000/bloques/por_sede/${sedeId}`, {
            headers: api.authHeaders()
        });
        const bloques = await bloqueResponse.json();
        console.log('Bloques por sede:', bloques);

        const bloqueSelect = document.getElementById("bloqueSalon");
        bloqueSelect.innerHTML = "<option value=''>Seleccione un bloque</option>";

        if (bloques && bloques.length > 0) {
            document.getElementById("bloqueSalonContainer").style.display = "block";

            bloques.forEach(b => {
                const option = document.createElement("option");
                option.value = b.ID_bloque;
                option.textContent = b.nombre_bloque;
                if (b.ID_bloque == bloqueId) {
                    option.selected = true;
                }
                bloqueSelect.appendChild(option);
            });
        } else {
            document.getElementById("bloqueSalonContainer").style.display = "none";
        }

        const modal = new bootstrap.Modal(document.getElementById("salonModal"));
        modal.show();

    } catch (error) {
        console.error("Error al cargar el salón:", error);
        alert("Ocurrió un error al cargar el salón. Intenta de nuevo.");
    }
}

// Función para confirmar eliminación
function confirmarEliminar(tipo, id, nombre) {
    const eliminarModal = new bootstrap.Modal(document.getElementById('eliminarModal'));
    eliminarId.value = id;
    eliminarTipo.value = tipo;
    
    let mensaje = "";
    switch (tipo) {
        case 'sede':
            mensaje = `¿Estás seguro de que deseas eliminar la sede "${nombre}"?`;
            break;
        case 'bloque':
            mensaje = `¿Estás seguro de que deseas eliminar el bloque "${nombre}"?`;
            break;
        case 'salon':
            mensaje = `¿Estás seguro de que deseas eliminar el salón "${nombre}"?`;
            break;
    }
    
    eliminarMensaje.textContent = mensaje;
    passwordConfirm.value = "";
    eliminarModal.show();
}

// Funciones para guardar elementos
async function guardarSede(e) {
    e.preventDefault();
    
    const data = {
        nombre_sede: nombreSede.value.trim()
    };
    
    if (!data.nombre_sede) {
        alert("Por favor ingresa el nombre de la sede.");
        return;
    }
    
    // Si es edición, mostrar modal de confirmación
    if (sedeId.value) {
        const confirmarModal = new bootstrap.Modal(document.getElementById('confirmarModificacionModal'));
        document.getElementById('confirmarModificacionTipo').value = 'sede';
        document.getElementById('confirmarModificacionId').value = sedeId.value;
        document.getElementById('confirmarModificacionData').value = JSON.stringify(data);
        document.getElementById('confirmarModificacionMensaje').textContent = 
            `¿Estás seguro de que deseas modificar la sede "${data.nombre_sede}"?`;
        confirmarModal.show();
        return;
    }
    
    // Si es creación, continuar normalmente
    const url = `http://127.0.0.1:8000/sedes/`;
    const method = 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...api.authHeaders()
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al guardar la sede');
        }
        
        alert("Sede creada correctamente.");
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('sedeModal'));
        modal.hide();
        
        formSede.reset();
        sedeId.value = '';
        
        // Recargar datos
        await cargarSedes();
    } catch (error) {
        console.error("Error al guardar sede:", error);
        alert("Hubo un problema al guardar la sede.");
    }
}

async function guardarBloque(e) {
    e.preventDefault();
    
    const data = {
        nombre_bloque: nombreBloque.value.trim(),
        sede_id: parseInt(sedeBloque.value)
    };
    
    if (!data.nombre_bloque || isNaN(data.sede_id)) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }
    
    // Si es edición, mostrar modal de confirmación
    if (bloqueId.value) {
        const confirmarModal = new bootstrap.Modal(document.getElementById('confirmarModificacionModal'));
        document.getElementById('confirmarModificacionTipo').value = 'bloque';
        document.getElementById('confirmarModificacionId').value = bloqueId.value;
        document.getElementById('confirmarModificacionData').value = JSON.stringify(data);
        
        // Obtener el nombre de la sede para el mensaje
        const sede = todasLasSedes.find(s => s.ID_sede === data.sede_id);
        const nombreSede = sede ? sede.nombre_sede : 'Desconocida';
        
        document.getElementById('confirmarModificacionMensaje').textContent = 
            `¿Estás seguro de que deseas modificar el bloque "${data.nombre_bloque}" de la sede "${nombreSede}"?`;
        confirmarModal.show();
        return;
    }
    
    // Si es creación, continuar normalmente
    const url = `http://127.0.0.1:8000/bloques/`;
    const method = 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...api.authHeaders()
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al guardar el bloque');
        }
        
        alert("Bloque creado correctamente.");
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('bloqueModal'));
        modal.hide();
        
        formBloque.reset();
        bloqueId.value = '';
        
        // Recargar datos
        await cargarBloques();
    } catch (error) {
        console.error("Error al guardar bloque:", error);
        alert("Hubo un problema al guardar el bloque.");
    }
}

async function guardarSalon(e) {
    e.preventDefault();
    
    const sedeValue = sedeSalon.value.trim();
    const bloqueValue = bloqueSalon.value.trim();
    
    const data = {
        codigo_salon: codigoSalon.value.trim(),
        sede: sedeValue ? parseInt(sedeValue) : null
    };
    
    // Agregar bloque si está visible y seleccionado
    if (bloqueSalonContainer.style.display !== 'none' && bloqueValue) {
        data.bloque = parseInt(bloqueValue);
    }
    
    console.log('Datos a enviar al guardar salón:', data);
    
    if (!data.codigo_salon || !data.sede) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }
    
    // Si es edición, mostrar modal de confirmación
    if (salonId.value) {
        const confirmarModal = new bootstrap.Modal(document.getElementById('confirmarModificacionModal'));
        document.getElementById('confirmarModificacionTipo').value = 'salon';
        document.getElementById('confirmarModificacionId').value = salonId.value;
        document.getElementById('confirmarModificacionData').value = JSON.stringify(data);
        
        // Obtener nombres de sede y bloque para el mensaje
        const sede = todasLasSedes.find(s => s.ID_sede === data.sede);
        const nombreSede = sede ? sede.nombre_sede : 'Desconocida';
        
        let infoBloque = '';
        if (data.bloque) {
            const bloque = todosLosBloques.find(b => b.ID_bloque === data.bloque);
            if (bloque) {
                infoBloque = ` del bloque "${bloque.nombre_bloque}"`;
            }
        }
        
        document.getElementById('confirmarModificacionMensaje').textContent = 
            `¿Estás seguro de que deseas modificar el salón "${data.codigo_salon}" de la sede "${nombreSede}"${infoBloque}?`;
        confirmarModal.show();
        return;
    }
    
    // Si es creación, continuar normalmente
    const url = `http://127.0.0.1:8000/salones/`;
    const method = 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...api.authHeaders()
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            throw new Error(errorData.detail || 'Error al guardar el salón');
        }
        
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);
        
        alert("Salón creado correctamente.");
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('salonModal'));
        modal.hide();
        
        formSalon.reset();
        salonId.value = '';
        bloqueSalonContainer.style.display = 'none';
        
        // Recargar datos
        await cargarSedes();
        await cargarBloques();
        await cargarSalones();
    } catch (error) {
        console.error("Error al guardar salón:", error);
        alert("Hubo un problema al guardar el salón: " + error.message);
    }
}

// Función para eliminar elementos
async function eliminarElemento(e) {
    e.preventDefault();
    
    const id = eliminarId.value;
    const tipo = eliminarTipo.value;
    const password = passwordConfirm.value;
    
    if (!password) {
        alert("Por favor ingresa tu contraseña para confirmar.");
        return;
    }
    
    // Verificar la contraseña del administrador
    try {
        // Obtener el usuario actual del localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) throw new Error("No se encontró información del usuario");
        
        const currentUser = JSON.parse(currentUserStr);
        
        // Verificar la contraseña usando la nueva función de la API
        const verificacionExitosa = await api.verificarPassword(currentUser.ID_usuarios, password);
        
        if (!verificacionExitosa) {
            throw new Error("Contraseña incorrecta");
        }
        
        // Si la contraseña es correcta, proceder con la eliminación
        let url = '';
        switch (tipo) {
            case 'sede':
                url = `http://127.0.0.1:8000/sedes/${id}`;
                break;
            case 'bloque':
                url = `http://127.0.0.1:8000/bloques/${id}`;
                break;
            case 'salon':
                url = `http://127.0.0.1:8000/salones/${id}`;
                break;
            default:
                throw new Error("Tipo de elemento no válido");
        }
        
        const deleteResponse = await fetch(url, {
            method: 'DELETE',
            headers: api.authHeaders()
        });
        
        if (!deleteResponse.ok) {
            const error = await deleteResponse.json();
            throw new Error(error.detail || `Error al eliminar ${tipo}`);
        }
        
        alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado correctamente.`);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('eliminarModal'));
        modal.hide();
        
        // Recargar datos según el tipo
        switch (tipo) {
            case 'sede':
                await cargarSedes();
                await cargarBloques();
                await cargarSalones();
                break;
            case 'bloque':
                await cargarBloques();
                await cargarSalones();
                break;
            case 'salon':
                await cargarSalones();
                break;
        }
    } catch (error) {
        console.error(`Error al eliminar ${tipo}:`, error);
        alert(error.message || `Hubo un problema al eliminar el ${tipo}.`);
    }
}

// Funciones de utilidad
function mostrarMensajeVacio(tabla, mensaje) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td colspan="5" class="text-center text-muted">
            <i class="bi bi-info-circle me-2"></i>${mensaje}.
        </td>
    `;
    tabla.appendChild(tr);
}

function mostrarError(tabla, mensaje) {
    tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>${mensaje}
            </td>
        </tr>
    `;
}

// Función para procesar la confirmación de modificación
async function procesarModificacionConfirmada(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('confirmarModificacionTipo').value;
    const id = document.getElementById('confirmarModificacionId').value;
    const dataStr = document.getElementById('confirmarModificacionData').value;
    const password = document.getElementById('passwordModificacion').value;
    
    if (!password) {
        alert("Por favor ingresa tu contraseña para confirmar.");
        return;
    }
    
    // Verificar la contraseña del administrador
    try {
        // Obtener el usuario actual del localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) throw new Error("No se encontró información del usuario");
        
        const currentUser = JSON.parse(currentUserStr);
        
        // Verificar la contraseña usando la función de la API
        const verificacionExitosa = await api.verificarPassword(currentUser.ID_usuarios, password);
        
        if (!verificacionExitosa) {
            throw new Error("Contraseña incorrecta");
        }
        
        // Si la contraseña es correcta, proceder con la modificación
        const data = JSON.parse(dataStr);
        let url = '';
        
        switch (tipo) {
            case 'sede':
                url = `http://127.0.0.1:8000/sedes/${id}`;
                break;
            case 'bloque':
                url = `http://127.0.0.1:8000/bloques/${id}`;
                break;
            case 'salon':
                url = `http://127.0.0.1:8000/salones/${id}`;
                break;
            default:
                throw new Error("Tipo de elemento no válido");
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...api.authHeaders()
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Error al modificar ${tipo}`);
        }
        
        alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} modificado correctamente.`);
        
        // Cerrar el modal de confirmación
        const confirmarModal = bootstrap.Modal.getInstance(document.getElementById('confirmarModificacionModal'));
        confirmarModal.hide();
        
        // Cerrar el modal de edición según el tipo
        let editModal;
        switch (tipo) {
            case 'sede':
                editModal = bootstrap.Modal.getInstance(document.getElementById('sedeModal'));
                formSede.reset();
                sedeId.value = '';
                break;
            case 'bloque':
                editModal = bootstrap.Modal.getInstance(document.getElementById('bloqueModal'));
                formBloque.reset();
                bloqueId.value = '';
                break;
            case 'salon':
                editModal = bootstrap.Modal.getInstance(document.getElementById('salonModal'));
                formSalon.reset();
                salonId.value = '';
                bloqueSalonContainer.style.display = 'none';
                break;
        }
        
        if (editModal) {
            editModal.hide();
        }
        
        // Recargar datos según el tipo
        switch (tipo) {
            case 'sede':
                await cargarSedes();
                await cargarBloques();
                await cargarSalones();
                break;
            case 'bloque':
                await cargarBloques();
                await cargarSalones();
                break;
            case 'salon':
                await cargarSalones();
                break;
        }
    } catch (error) {
        console.error(`Error al modificar ${tipo}:`, error);
        alert(error.message || `Hubo un problema al modificar el ${tipo}.`);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    cargarSedes();
    cargarBloques();
    cargarSalones();
    
    // Event listeners para formularios
    formSede.addEventListener('submit', guardarSede);
    formBloque.addEventListener('submit', guardarBloque);
    formSalon.addEventListener('submit', guardarSalon);
    formEliminar.addEventListener('submit', eliminarElemento);
    
    // Event listener para el formulario de confirmación de modificación
    document.getElementById('formConfirmarModificacion').addEventListener('submit', procesarModificacionConfirmada);
    
    // Event listener para resetear formularios al abrir modales
    document.querySelector('[data-bs-target="#sedeModal"]').addEventListener('click', () => {
        formSede.reset();
        sedeId.value = '';
    });
    
    document.querySelector('[data-bs-target="#bloqueModal"]').addEventListener('click', () => {
        formBloque.reset();
        bloqueId.value = '';
    });
    
    document.querySelector('[data-bs-target="#salonModal"]').addEventListener('click', () => {
        formSalon.reset();
        salonId.value = '';
        bloqueSalonContainer.style.display = 'none';
    });
    
    // Event listener para mostrar/ocultar bloques según la sede seleccionada
    sedeSalon.addEventListener('change', () => {
        const sedeId = parseInt(sedeSalon.value);
        if (!sedeId) {
            bloqueSalonContainer.style.display = 'none';
            return;
        }

        const bloquesAsociados = todosLosBloques.filter(b => b.sede_id === sedeId);

        if (bloquesAsociados.length > 0) {
            bloqueSalonContainer.style.display = 'block';
            actualizarSelectBloques(sedeId);
        } else {
            bloqueSalonContainer.style.display = 'none';
            bloqueSalon.innerHTML = '<option value="">No hay bloques disponibles</option>';
        }
    });
});

// Exponer funciones para uso global
window.editarSede = editarSede;
window.editarBloque = editarBloque;
window.editarSalon = editarSalon;
window.confirmarEliminar = confirmarEliminar;