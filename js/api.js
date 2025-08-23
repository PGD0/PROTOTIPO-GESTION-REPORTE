const API_URL = 'http://127.0.0.1:8000';

const getToken = () => {
  return localStorage.getItem('token');
}

const setToken = (token) => {
  localStorage.setItem('token', token);
}

const clearToken = () => {
  localStorage.removeItem('token');
}

const authHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

const login = async (email, password) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Error de autenticación');
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

const register = async ({ nombre, apellido, email, contraseña, rol, descripcion = "", imagen = null }) => {
  try {
    console.log('Intentando registrar usuario:', { nombre, apellido, email, contraseña, rol });

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('email', email);
    formData.append('contraseña', contraseña);
    formData.append('rol', rol);
    formData.append('descripcion', descripcion);

    const res = await fetch(`${API_URL}/usuarios/`, {
      method: 'POST',
      body: formData
    });
    console.log('Respuesta del servidor:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Error en registro:', errorData);
      throw new Error(errorData.detail || `Error de registro: ${res.status} ${res.statusText}`);
    }
    
    const userData = await res.json();
    console.log('Usuario registrado exitosamente:', userData);
    return userData;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
}

const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/usuarios/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los usuarios');
  return await res.json();
}

const getRoles = async () => {
  const res = await fetch(`${API_URL}/roles/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los roles');
  return await res.json();
}

const getSedes = async() => {
  const res = await fetch(`${API_URL}/sedes/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener las sedes');
  return await res.json();
}

const getBloques = async () => {
  try {
    const res = await fetch(`${API_URL}/bloques/`, { headers: authHeaders() });
    if (!res.ok) {
      if (res.status === 404) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'No se encontraron bloques');
      }
      throw new Error('No se pudieron obtener los bloques');
    }
    return await res.json();
  } catch (error) {
    console.error('Error en getBloques:', error);
    throw error;
  }
}

const getSalones = async () => {
  const res = await fetch(`${API_URL}/salones/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los salones');
  return await res.json();
}

const getEquipos = async () => {
  const res = await fetch(`${API_URL}/equipos/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los equipos');
  return await res.json();
}

const getReportes = async () => {
  const res = await fetch(`${API_URL}/reportes/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los reportes');
  return await res.json();
}

const getReporte = async (id) => {
  const res = await fetch(`${API_URL}/reportes/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudo obtener el reporte');
  const data = await res.json();
  return data && data.reporte ? data.reporte : data;
}

const getReportesPorUsuario = async (id) => {
    const res = await fetch(`${API_URL}/reportes/usuario/${id}/todos`, { 
        headers: authHeaders() 
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Error al obtener reportes del usuario');
    }
    return await res.json();
}

const crearReporte = async ({
  ID_equipo,
  sede,
  bloque,
  salon,
  titulo,
  tipo_problema,
  prioridad,
  descripcion,
  contacto,
  ID_usuario,
  resuelto,
  imagen
}) => {
  const form = new FormData();
  form.append('ID_equipo', ID_equipo);
  form.append('sede', sede);
  if (bloque) form.append('bloque', bloque);
  form.append('salon', salon);
  form.append('titulo', titulo);
  form.append('tipo_problema', tipo_problema);
  form.append('prioridad', prioridad);
  form.append('descripcion', descripcion);
  if (contacto) form.append('contacto', contacto);
  form.append('ID_usuario', ID_usuario);
  form.append('resuelto', resuelto ? 'true' : 'false');
  if (imagen) form.append('imagen', imagen);

  const res = await fetch(`${API_URL}/reportes/`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
    },
    body: form
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Error al crear el reporte');
  }
  return await res.json();
}

const updateReporte = async (id, data) => {
  const res = await fetch(`${API_URL}/reportes/${id}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al actualizar el reporte');
  }
  return await res.json();
}

const getDashboard = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/dashboard/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('No se pudo cargar el dashboard');
  return res.json();
}

const verificarPassword = async (usuarioId, password) => {
  try {
    const res = await fetch(`${API_URL}/usuarios/verificar-password`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario_id: usuarioId,
        password: password
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al verificar la contraseña');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en verificarPassword:', error);
    throw error;
  }
}

const notificarUsuario = async (idReporte) => {
  try {
    const res = await fetch(`${API_URL}/reportes/${idReporte}/notificar-usuario`, {
      method: 'POST',
      headers: authHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al notificar al usuario');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en notificarUsuario:', error);
    throw error;
  }
}

const marcarReporteResuelto = async (idReporte) => {
  try {
    const res = await fetch(`${API_URL}/reportes/${idReporte}/marcar-resuelto`, {
      method: 'PUT',
      headers: authHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al marcar reporte como resuelto');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en marcarReporteResuelto:', error);
    throw error;
  }
}

const deleteReporte = async (idReporte) => {
  try {
    const res = await fetch(`${API_URL}/reportes/${idReporte}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al eliminar el reporte');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en deleteReporte:', error);
    throw error;
  }
}

const getEquipoPorCodigo = async (codigoBarras) => {
    const res = await fetch(`${API_URL}/equipos/por-codigo/${codigoBarras}`, { 
        headers: authHeaders() 
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Equipo no encontrado');
    }
    return await res.json();
}

const updateUsuario = async (id, data) => {
  try {
    if (!data.imagen) {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al actualizar el usuario');
      }
      
      return await res.json();
    } else {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al actualizar el usuario');
      }
      
      return await res.json();
    }
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    throw error;
  }
}

const deleteUsuario = async (id) => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al eliminar el usuario');
    }
    
    return true;
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    throw error;
  }
}

export default {
  login,
  register,
  getUsuarios,
  getRoles,
  getSedes,
  getBloques,
  getSalones,
  getEquipos,
  getReportes,
  getReporte,
  crearReporte,
  updateReporte,
  getToken,
  setToken,
  clearToken,
  authHeaders,
  getDashboard,
  verificarPassword,
  notificarUsuario,
  marcarReporteResuelto,
  deleteReporte,
  getEquipoPorCodigo,
  getReportesPorUsuario,
  updateUsuario,
  deleteUsuario
};