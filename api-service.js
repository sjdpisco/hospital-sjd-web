// api-service.js - COMPATIBLE CON APPS SCRIPT EXISTENTE (Flutter + Web)

const API_URL = 'https://script.google.com/macros/s/AKfycbxToelrJkVmRQYgdrtR5W9qT9ZjcebWwFeTseDOr8Vc1SMeHwcLAAkebeulv7rUFtDO/exec';

// ==================== FUNCIÓN GENÉRICA ====================
async function llamarAPI(action, params = {}) {
    try {
        console.log('📤 Llamando a API:', action);
        
        const urlParams = new URLSearchParams({
            action: action,
            ...params
        });
        
        const url = `${API_URL}?${urlParams.toString()}`;
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Respuesta:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en llamada API:', error);
        return {
            success: false,
            message: 'Error de conexión: ' + error.message
        };
    }
}

// ==================== LOGIN ====================
async function login(usuario, password) {
    return await llamarAPI('login', { 
        usuario: usuario,
        contraseña: password
    });
}

// ==================== REGISTRAR PACIENTE ====================
async function registrarPaciente(datosPaciente) {
    return await llamarAPI('registrar_paciente', {
        nombres_apellidos: datosPaciente.nombres_apellidos || '',
        edad: datosPaciente.edad || '',
        direccion: datosPaciente.direccion || '',
        dni: datosPaciente.dni || '',
        celular: datosPaciente.celular || '',
        celular_opcional: datosPaciente.celular_opcional || '',
        muestra: datosPaciente.muestra || '',
        resultado: datosPaciente.resultado || '',
        observacion: datosPaciente.observacion || '',
        tratamiento_particular: datosPaciente.tratamiento_particular || '',
        ya_cuenta_con: datosPaciente.ya_cuenta_con || '',
        registrado_por: datosPaciente.registrado_por || '',
        foto_url: datosPaciente.foto_url || '',
        archivos_urls: datosPaciente.archivos_urls || ''
    });
}

// ==================== SUBIR ARCHIVO - VERSIÓN WEB COMPATIBLE ====================
async function subirArchivo(file, pacienteId) {
    return new Promise((resolve, reject) => {
        console.log('📤 Preparando archivo para subir (modo Web)...');
        console.log('   Nombre:', file.name);
        console.log('   Tamaño:', (file.size / 1024).toFixed(2), 'KB');
        console.log('   Tipo:', file.type);
        console.log('   Paciente ID:', pacienteId);
        
        // Validación de tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('El archivo supera los 5MB'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const base64String = e.target.result.split(',')[1];
                
                console.log('✅ Archivo convertido a Base64');
                console.log('   Tamaño Base64:', (base64String.length / 1024).toFixed(2), 'KB');
                
                // CRÍTICO: Dividir en chunks si es muy grande (URL limit ~2MB)
                const CHUNK_SIZE = 1900000; // ~1.9MB por seguridad
                
                if (base64String.length > CHUNK_SIZE) {
                    console.log('⚠️ Archivo grande, usando chunking...');
                    resolve(await subirArchivoEnChunks(base64String, file.name, file.type, pacienteId));
                    return;
                }
                
                // Archivo pequeño: subir directamente
                const params = {
                    action: 'subir_archivo',
                    file_base64: base64String,
                    file_name: file.name,
                    mime_type: file.type,
                    paciente_id: pacienteId
                };
                
                const result = await llamarAPIPost(params);
                
                if (result.success) {
                    console.log('✅ Archivo subido exitosamente');
                    console.log('   URL:', result.data.file_url);
                } else {
                    console.error('❌ Error al subir:', result.message);
                }
                
                resolve(result);
                
            } catch (error) {
                console.error('❌ Error al procesar archivo:', error);
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            console.error('❌ Error al leer archivo:', error);
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

// ==================== LLAMADA API CON POST (para archivos) ====================
async function llamarAPIPost(params) {
    try {
        console.log('📤 Enviando POST con archivo...');
        
        // Crear FormData
        const formData = new FormData();
        for (const key in params) {
            formData.append(key, params[key]);
        }
        
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('❌ Error en POST:', error);
        return {
            success: false,
            message: 'Error al subir archivo: ' + error.message
        };
    }
}

// ==================== SUBIR ARCHIVO EN CHUNKS (para archivos grandes) ====================
async function subirArchivoEnChunks(base64String, fileName, mimeType, pacienteId) {
    try {
        console.log('📦 Dividiendo archivo en chunks...');
        
        const CHUNK_SIZE = 1900000;
        const totalChunks = Math.ceil(base64String.length / CHUNK_SIZE);
        
        console.log(`   Total chunks: ${totalChunks}`);
        
        // Crear un ID único para esta subida
        const uploadId = Date.now().toString();
        
        // Subir cada chunk
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, base64String.length);
            const chunk = base64String.substring(start, end);
            
            console.log(`📤 Subiendo chunk ${i + 1}/${totalChunks}...`);
            
            const params = {
                action: 'subir_archivo_chunk',
                upload_id: uploadId,
                chunk_index: i,
                total_chunks: totalChunks,
                chunk_data: chunk,
                file_name: fileName,
                mime_type: mimeType,
                paciente_id: pacienteId
            };
            
            const result = await llamarAPIPost(params);
            
            if (!result.success) {
                throw new Error(`Error en chunk ${i + 1}: ${result.message}`);
            }
            
            // Si es el último chunk, retornar el resultado final
            if (i === totalChunks - 1) {
                console.log('✅ Todos los chunks subidos');
                return result;
            }
        }
        
    } catch (error) {
        console.error('❌ Error en chunking:', error);
        return {
            success: false,
            message: 'Error al subir archivo en chunks: ' + error.message
        };
    }
}

// ==================== ACTUALIZAR URLs ====================
async function actualizarUrls(idPaciente, fotoUrl, archivosUrls) {
    console.log('🔗 Actualizando URLs...');
    console.log('   ID Paciente:', idPaciente);
    console.log('   Foto URL:', fotoUrl ? 'Sí' : 'No');
    console.log('   Archivos URLs:', archivosUrls ? 'Sí' : 'No');
    
    return await llamarAPI('actualizar_urls', {
        id_paciente: idPaciente,
        foto_url: fotoUrl || '',
        archivos_urls: archivosUrls || ''
    });
}

// ==================== MAESTROS MÉDICOS ====================
async function obtenerTiposMuestra() {
    return await llamarAPI('obtener_tipos_muestra');
}

async function obtenerTiposResultado() {
    return await llamarAPI('obtener_tipos_resultado');
}

async function obtenerTiposCuentaCon() {
    return await llamarAPI('obtener_tipos_cuenta_con');
}

async function agregarTipoMuestra(tipo) {
    return await llamarAPI('agregar_tipo_muestra', { tipo: tipo });
}

async function agregarTipoResultado(tipo) {
    return await llamarAPI('agregar_tipo_resultado', { tipo: tipo });
}

async function agregarTipoCuentaCon(tipo) {
    return await llamarAPI('agregar_tipo_cuenta_con', { tipo: tipo });
}

// ==================== BÚSQUEDA Y LISTADO ====================
async function buscarPaciente(criterio) {
    return await llamarAPI('buscar_pacientes', { criterio: criterio });
}

async function obtenerTodosPacientes() {
    return await llamarAPI('listar_todos_pacientes');
}

async function obtenerHistorialPaciente(idPaciente) {
    return await llamarAPI('obtener_historial', { id_paciente: idPaciente });
}

async function agregarSeguimiento(datosSeguimiento) {
    return await llamarAPI('agregar_seguimiento', datosSeguimiento);
}

async function cambiarEstadoPaciente(idPaciente, estado, motivo, usuario) {
    return await llamarAPI('cambiar_estado_paciente', {
        id_paciente: idPaciente,
        estado: estado,
        motivo: motivo,
        usuario: usuario
    });
}

// ==================== VERIFICAR CONEXIÓN ====================
async function verificarConexion() {
    try {
        const response = await fetch(API_URL);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// ==================== EXPORTAR ====================
window.apiService = {
    login,
    registrarPaciente,
    buscarPaciente,
    obtenerTodosPacientes,
    obtenerHistorialPaciente,
    agregarSeguimiento,
    cambiarEstadoPaciente,
    obtenerTiposMuestra,
    obtenerTiposResultado,
    obtenerTiposCuentaCon,
    agregarTipoMuestra,
    agregarTipoResultado,
    agregarTipoCuentaCon,
    subirArchivo,
    actualizarUrls,
    verificarConexion
};

console.log('✅ API Service cargado (compatible Web + Flutter)');