// src/services/api.js

const API_URL = 'https://script.google.com/macros/s/AKfycbxToelrJkVmRQYgdrtR5W9qT9ZjcebWwFeTseDOr8Vc1SMeHwcLAAkebeulv7rUFtDO/exec';

// Función auxiliar para hacer peticiones GET
async function fetchData(action, params = {}) {
  try {
    const queryParams = new URLSearchParams({
      action,
      ...params
    });
    
    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchData:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión'
    };
  }
}

// Función auxiliar para hacer peticiones POST
async function postData(action, payload = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...payload
      }),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en postData:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión'
    };
  }
}

// ==================== AUTENTICACIÓN ====================

export async function login(usuario, contraseña) {
  return await fetchData('login', { usuario, contraseña });
}

// ==================== PACIENTES ====================

export async function registrarPaciente(pacienteData) {
  return await postData('registrar_paciente', pacienteData);
}

export async function buscarPacientes(criterio) {
  return await fetchData('buscar_pacientes', { criterio });
}

export async function listarTodosPacientes() {
  return await fetchData('listar_todos_pacientes');
}

export async function obtenerHistorialPaciente(idPaciente) {
  return await fetchData('obtener_historial', { id_paciente: idPaciente });
}

export async function agregarSeguimiento(seguimientoData) {
  return await postData('agregar_seguimiento', seguimientoData);
}

export async function cambiarEstadoPaciente(idPaciente, estado, motivo, usuario) {
  return await postData('cambiar_estado_paciente', {
    id_paciente: idPaciente,
    estado,
    motivo,
    usuario
  });
}

export async function actualizarUrls(idPaciente, fotoUrl, archivosUrls) {
  return await postData('actualizar_urls', {
    id_paciente: idPaciente,
    foto_url: fotoUrl || '',
    archivos_urls: archivosUrls || ''
  });
}

// ==================== TIPOS (CATÁLOGOS) ====================

export async function obtenerTiposMuestra() {
  return await fetchData('obtener_tipos_muestra');
}

export async function obtenerTiposResultado() {
  return await fetchData('obtener_tipos_resultado');
}

export async function obtenerTiposCuentaCon() {
  return await fetchData('obtener_tipos_cuenta_con');
}

export async function agregarTipoMuestra(tipo) {
  return await postData('agregar_tipo_muestra', { tipo });
}

export async function agregarTipoResultado(tipo) {
  return await postData('agregar_tipo_resultado', { tipo });
}

export async function agregarTipoCuentaCon(tipo) {
  return await postData('agregar_tipo_cuenta_con', { tipo });
}

// ==================== ARCHIVOS ====================

export async function subirArchivo(fileBase64, fileName, mimeType, pacienteId) {
  return await postData('subir_archivo', {
    file_base64: fileBase64,
    file_name: fileName,
    mime_type: mimeType,
    paciente_id: pacienteId
  });
}

// Función auxiliar para convertir File a Base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remover el prefijo "data:image/png;base64," o similar
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// ==================== UTILIDADES ====================

export function formatearFecha(fecha) {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calcularDiasDesdeRegistro(fecha) {
  if (!fecha) return 0;
  const fechaRegistro = new Date(fecha);
  const hoy = new Date();
  const diferencia = hoy - fechaRegistro;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}
