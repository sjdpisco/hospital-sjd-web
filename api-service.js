// Configuración de la API
const API_CONFIG = {
    URL: 'https://script.google.com/macros/s/AKfycbxToelrJkVmRQYgdrtR5W9qT9ZjcebWwFeTseDOr8Vc1SMeHwcLAAkebeulv7rUFtDO/exec',
    TIMEOUT: 30000 // 30 segundos
};

// Servicio de API
const ApiService = {
    // Método para hacer login
    async login(usuario, contrasena) {
        try {
            const url = `${API_CONFIG.URL}?action=login&usuario=${encodeURIComponent(usuario)}&contraseña=${encodeURIComponent(contrasena)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para listar todos los pacientes
    async listarTodosPacientes() {
        try {
            const url = `${API_CONFIG.URL}?action=listar_todos_pacientes`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al listar pacientes:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para buscar pacientes
    async buscarPacientes(criterio) {
        try {
            const url = `${API_CONFIG.URL}?action=buscar_pacientes&criterio=${encodeURIComponent(criterio)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al buscar pacientes:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para obtener historial de paciente
    async obtenerHistorialPaciente(idPaciente) {
        try {
            const url = `${API_CONFIG.URL}?action=obtener_historial&id_paciente=${encodeURIComponent(idPaciente)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para obtener tipos de muestra
    async obtenerTiposMuestra() {
        try {
            const url = `${API_CONFIG.URL}?action=obtener_tipos_muestra`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener tipos de muestra:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para obtener tipos de resultado
    async obtenerTiposResultado() {
        try {
            const url = `${API_CONFIG.URL}?action=obtener_tipos_resultado`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener tipos de resultado:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para obtener tipos de "Ya cuenta con"
    async obtenerTiposCuentaCon() {
        try {
            const url = `${API_CONFIG.URL}?action=obtener_tipos_cuenta_con`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener tipos cuenta con:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para registrar paciente
    async registrarPaciente(dataPaciente) {
        try {
            const params = new URLSearchParams({
                action: 'registrar_paciente',
                ...dataPaciente
            });

            const url = `${API_CONFIG.URL}?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al registrar paciente:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para cambiar estado de paciente
    async cambiarEstadoPaciente(idPaciente, estado, motivo, usuario) {
        try {
            const params = new URLSearchParams({
                action: 'cambiar_estado_paciente',
                id_paciente: idPaciente,
                estado: estado,
                motivo: motivo,
                usuario: usuario
            });

            const url = `${API_CONFIG.URL}?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    },

    // Método para agregar seguimiento
    async agregarSeguimiento(dataSeguimiento) {
        try {
            const params = new URLSearchParams({
                action: 'agregar_seguimiento',
                ...dataSeguimiento
            });

            const url = `${API_CONFIG.URL}?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al agregar seguimiento:', error);
            return {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        }
    }
};