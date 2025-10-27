// URL de la API de Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbxToelrJkVmRQYgdrtR5W9qT9ZjcebWwFeTseDOr8Vc1SMeHwcLAAkebeulv7rUFtDO/exec';

// Servicio de API
const ApiService = {
    // Login
    async login(usuario, contraseña) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    usuario: usuario,
                    contraseña: contraseña
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    // Registrar nuevo paciente
    async registrarPaciente(datoPaciente) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'registrar_paciente',
                    ...datoPaciente
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al registrar paciente:', error);
            throw error;
        }
    },

    // Buscar pacientes
    async buscarPacientes(criterio) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'buscar_pacientes',
                    criterio: criterio
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al buscar pacientes:', error);
            throw error;
        }
    },

    // Obtener historial de paciente
    async obtenerHistorial(idPaciente) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'obtener_historial',
                    id_paciente: idPaciente
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al obtener historial:', error);
            throw error;
        }
    },

    // Agregar seguimiento
    async agregarSeguimiento(datoSeguimiento) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'agregar_seguimiento',
                    ...datoSeguimiento
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al agregar seguimiento:', error);
            throw error;
        }
    },

    // Listar todos los pacientes
    async listarTodosPacientes() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'listar_todos_pacientes'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al listar pacientes:', error);
            throw error;
        }
    },

    // Obtener tipos de muestra
    async obtenerTiposMuestra() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'obtener_tipos_muestra'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al obtener tipos de muestra:', error);
            throw error;
        }
    },

    // Obtener tipos de resultado
    async obtenerTiposResultado() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'obtener_tipos_resultado'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al obtener tipos de resultado:', error);
            throw error;
        }
    },

    // Obtener tipos de "cuenta con"
    async obtenerTiposCuentaCon() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'obtener_tipos_cuenta_con'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al obtener tipos cuenta con:', error);
            throw error;
        }
    },

    // Agregar tipo de muestra
    async agregarTipoMuestra(tipo) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'agregar_tipo_muestra',
                    tipo: tipo
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al agregar tipo de muestra:', error);
            throw error;
        }
    },

    // Agregar tipo de resultado
    async agregarTipoResultado(tipo) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'agregar_tipo_resultado',
                    tipo: tipo
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al agregar tipo de resultado:', error);
            throw error;
        }
    },

    // Agregar tipo de "cuenta con"
    async agregarTipoCuentaCon(tipo) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'agregar_tipo_cuenta_con',
                    tipo: tipo
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al agregar tipo cuenta con:', error);
            throw error;
        }
    },

    // Cambiar estado de paciente
    async cambiarEstadoPaciente(idPaciente, motivo, usuario) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'cambiar_estado_paciente',
                    id_paciente: idPaciente,
                    motivo_baja: motivo,
                    dado_baja_por: usuario
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            throw error;
        }
    },

    // Subir archivo
    async subirArchivo(fileBase64, mimeType, fileName, pacienteId) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'subir_archivo',
                    file_base64: fileBase64,
                    mime_type: mimeType,
                    file_name: fileName,
                    paciente_id: pacienteId
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error al subir archivo:', error);
            throw error;
        }
    }
};
