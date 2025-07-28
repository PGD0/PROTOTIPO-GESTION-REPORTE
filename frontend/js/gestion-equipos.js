const sedeSelect = document.getElementById('sede');
const bloqueSelect = document.getElementById('bloque');
const salonSelect = document.getElementById('salon');
const bloqueContainer = document.getElementById('bloqueContainer');

async function cargarEquipos() {
    try {
        const res = await fetch('http://127.0.0.1:8000/equipos/');
        const equipos = await res.json();

        const tbody = document.querySelector('#tablaEquipos tbody');
        tbody.innerHTML = ''; // Limpiar contenido previo

        if (equipos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="7" class="text-center text-muted">
                    <i class="bi bi-info-circle me-2"></i>No hay equipos registrados aún.
                </td>
            `;
            tbody.appendChild(tr);
            return;
        }

        equipos.forEach(equipo => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${equipo.ID_equipo}</td>
            <td>${equipo.codigo_barras}</td>
            <td>${equipo.marca}</td>
            <td>${equipo.sede}</td>
            <td>${equipo.salon}</td>
            <td>${equipo.bloque || '-'}</td>
            <td>
                <span class="badge ${equipo.funcional ? 'bg-success' : 'bg-danger'}">
                    ${equipo.funcional ? 'Sí' : 'No'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarEquipo(${equipo.ID_equipo})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEquipo(${equipo.ID_equipo})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
    } catch (error) {
        console.error("Error al cargar equipos:", error);
        const tbody = document.querySelector('#tablaEquipos tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los equipos
                </td>
            </tr>
        `;
    }
}

async function editarEquipo(id) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/equipos/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el equipo");
        const equipo = await res.json();

        // Abrir modal
        const equipoModal = new bootstrap.Modal(document.getElementById('equipoModal'));
        equipoModal.show();

        // Llenar campos
        document.getElementById('equipoId').value = equipo.ID_equipo;
        document.getElementById('codigoBarras').value = equipo.codigo_barras;
        document.getElementById('marca').value = equipo.marca;

        // Espera a que las sedes carguen antes de setear
        await cargarSedes();
        document.getElementById('sede').value = equipo.sede_id;

        const sedeNombre = document.getElementById('sede')
            .options[document.getElementById('sede').selectedIndex].text.toLowerCase();

        if (sedeNombre.includes("soledad")) {
            document.getElementById('bloqueContainer').style.display = 'block';
            await cargarBloques(equipo.sede_id);
            document.getElementById('bloque').value = equipo.bloque_id || "";
            await cargarSalonesPorBloque(equipo.bloque_id);
        } else {
            document.getElementById('bloqueContainer').style.display = 'none';
            await cargarSalonesPorSede(equipo.sede_id);
        }

        document.getElementById('salon').value = equipo.salon_id;
        document.getElementById('funcional').checked = equipo.funcional;

    } catch (error) {
        console.error("Error al editar equipo:", error);
        alert("Hubo un problema al cargar los datos del equipo.");
    }
}

async function eliminarEquipo(id) {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este equipo?");
    if (!confirmar) return;

    try {
        const res = await fetch(`http://127.0.0.1:8000/equipos/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'No se pudo eliminar el equipo');
        }

        alert("Equipo eliminado correctamente.");
        cargarEquipos(); // Recargar la tabla después de eliminar
    } catch (error) {
        console.error("Error al eliminar equipo:", error);
        alert("Hubo un problema al eliminar el equipo.");
    }
}

async function cargarSedes() {
    try {
        const res = await fetch('http://127.0.0.1:8000/sedes/');
        const sedes = await res.json();

        sedeSelect.innerHTML = '<option value="">Selecciona una sede</option>';
        sedes.forEach(sede => {
            const option = document.createElement('option');
            option.value = sede.ID_sede;
            option.textContent = sede.nombre_sede;
            sedeSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar sedes:", error);
    }
}

async function cargarBloques(sedeId) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/bloques/`);
        const bloques = await res.json();
        const bloquesFiltrados = bloques.filter(b => b.sede_id === parseInt(sedeId));

        bloqueSelect.innerHTML = '<option value="">Selecciona un bloque</option>';
        bloquesFiltrados.forEach(bloque => {
            const option = document.createElement('option');
            option.value = bloque.ID_bloque;
            option.textContent = bloque.nombre_bloque;
            bloqueSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar bloques:", error);
    }
}

async function cargarSalonesPorSede(sedeId) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/salones/por_sede/${sedeId}`);
        if (!res.ok) throw new Error("No se pudieron obtener salones");
        const salones = await res.json();
        renderSalones(salones);
    } catch (error) {
        console.error("Error al cargar salones por sede:", error);
    }
}

async function cargarSalonesPorBloque(bloqueId) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/salones/por_bloque/${bloqueId}`);
        if (!res.ok) throw new Error("No se pudieron obtener salones");
        const salones = await res.json();
        renderSalones(salones);
    } catch (error) {
        console.error("Error al cargar salones por bloque:", error);
    }
}

function renderSalones(salones) {
    salonSelect.innerHTML = '<option value="">Selecciona un salón</option>';
    salones.forEach(salon => {
        const option = document.createElement('option');
        option.value = salon.ID_salon;
        option.textContent = salon.codigo_salon;
        salonSelect.appendChild(option);
    });
}

// Eventos
sedeSelect.addEventListener('change', async () => {
    const sedeId = parseInt(sedeSelect.value);
    const nombreSeleccionado = sedeSelect.options[sedeSelect.selectedIndex].text;

    if (nombreSeleccionado.toLowerCase().includes("soledad")) {
        bloqueContainer.style.display = 'block';
        await cargarBloques(sedeId);
        salonSelect.innerHTML = '<option value="">Selecciona un bloque primero</option>';
    } else {
        bloqueContainer.style.display = 'none';
        await cargarSalonesPorSede(sedeId);
    }
});

bloqueSelect.addEventListener('change', () => {
    const bloqueId = parseInt(bloqueSelect.value);
    if (bloqueId) {
        cargarSalonesPorBloque(bloqueId);
    } else {
        salonSelect.innerHTML = '<option value="">Selecciona un bloque</option>';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarSedes();
    cargarEquipos();
});

const formEquipo = document.getElementById('formEquipo');

formEquipo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const equipoId = document.getElementById('equipoId').value;
    const data = {
        codigo_barras: document.getElementById('codigoBarras').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        sede: parseInt(document.getElementById('sede').value),
        salon: parseInt(document.getElementById('salon').value),
        funcional: document.getElementById('funcional').checked
    };

    if (!data.codigo_barras || !data.marca || isNaN(data.sede) || isNaN(data.salon)) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    const url = equipoId
        ? `http://127.0.0.1:8000/equipos/${equipoId}`   // PUT para editar
        : `http://127.0.0.1:8000/equipos/`;             // POST para crear

    const method = equipoId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al guardar el equipo');
        }

        const mensaje = equipoId ? "Equipo actualizado correctamente." : "Equipo creado correctamente.";
        alert(mensaje);

        const modal = bootstrap.Modal.getInstance(document.getElementById('equipoModal'));
        modal.hide();

        formEquipo.reset();
        salonSelect.innerHTML = '<option value="">Selecciona un salón</option>';
        bloqueSelect.innerHTML = '<option value="">Selecciona un bloque</option>';
        bloqueContainer.style.display = 'none';

        cargarEquipos(); // refrescar la tabla
    } catch (error) {
        console.error("Error al guardar equipo:", error);
        alert("Hubo un problema al guardar el equipo.");
    }
});

document.querySelector('[data-bs-target="#equipoModal"]').addEventListener('click', () => {
    formEquipo.reset();
    document.getElementById('equipoId').value = '';
    document.getElementById('codigoBarras').readOnly = false;
    bloqueSelect.innerHTML = '<option value="">Selecciona un bloque</option>';
    salonSelect.innerHTML = '<option value="">Selecciona un salón</option>';
    bloqueContainer.style.display = 'none';
});

window.editarEquipo = editarEquipo;
