// Estado de la aplicación
const AppState = {
    currentUser: null,
    currentScreen: 'login',
    pacientes: [],
    filteredPacientes: [],
    currentFilter: 'TODOS'
};

// Utilidades
const Utils = {
    // Mostrar/ocultar pantallas
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        AppState.currentScreen = screenId;
    },

    // Mostrar loading overlay
    showLoading(message = 'Procesando...') {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        overlay.style.display = 'flex';
    },

    // Ocultar loading overlay
    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    },

    // Mostrar toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Guardar en localStorage
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error al guardar en storage:', error);
        }
    },

    // Obtener de localStorage
    getFromStorage(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error al leer storage:', error);
            return null;
        }
    },

    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Calcular días desde fecha
    daysSince(dateString) {
        if (!dateString) return 0;
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },

    // Color según días
    getColorByDays(days) {
        if (days <= 7) return '#4CAF50'; // Verde
        if (days <= 30) return '#FF9800'; // Naranja
        return '#f44336'; // Rojo
    }
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('Inicializando aplicación...');
    
    // Verificar si hay sesión guardada
    checkSavedSession();
    
    // Configurar event listeners
    setupEventListeners();
}

function checkSavedSession() {
    const savedUser = Utils.getFromStorage('currentUser');
    const rememberUser = Utils.getFromStorage('rememberUser');
    
    if (rememberUser && savedUser) {
        document.getElementById('usuario').value = savedUser.usuario;
        document.getElementById('recordar').checked = true;
    }
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Dashboard cards
    document.getElementById('card-lista-pacientes')?.addEventListener('click', () => {
        loadListaPacientes();
    });

    document.getElementById('card-nuevo-registro')?.addEventListener('click', () => {
        Utils.showScreen('nuevo-registro-screen');
        loadNuevoRegistroForm();
    });

    document.getElementById('card-buscar')?.addEventListener('click', () => {
        Utils.showToast('Funcionalidad de búsqueda en desarrollo', 'warning');
    });

    // Botones de volver
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            Utils.showScreen('home-screen');
        });
    });

    // Refresh button
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        loadListaPacientes();
    });

    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            handleFilterChange(e.target.dataset.filter);
        });
    });
}

// ===================================
// LOGIN
// ===================================
async function handleLogin(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const recordar = document.getElementById('recordar').checked;
    
    if (!usuario || !contrasena) {
        showLoginError('Por favor complete todos los campos');
        return;
    }
    
    Utils.showLoading('Iniciando sesión...');
    
    try {
        const result = await ApiService.login(usuario, contrasena);
        
        Utils.hideLoading();
        
        if (result.success) {
            AppState.currentUser = result.data;
            
            // Guardar en localStorage si está marcado "recordar"
            if (recordar) {
                Utils.saveToStorage('rememberUser', true);
                Utils.saveToStorage('currentUser', result.data);
            } else {
                localStorage.removeItem('rememberUser');
                localStorage.removeItem('currentUser');
            }
            
            // Mostrar pantalla home
            showHomeScreen();
            Utils.showToast('Bienvenido ' + result.data.nombre_completo, 'success');
        } else {
            showLoginError(result.message || 'Usuario o contraseña incorrectos');
        }
    } catch (error) {
        Utils.hideLoading();
        showLoginError('Error de conexión. Intente nuevamente.');
        console.error('Error en login:', error);
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showHomeScreen() {
    Utils.showScreen('home-screen');
    
    // Actualizar información del usuario
    document.getElementById('user-name').textContent = AppState.currentUser.nombre_completo;
    document.getElementById('user-role').textContent = AppState.currentUser.rol;
}

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        AppState.currentUser = null;
        AppState.pacientes = [];
        Utils.showScreen('login-screen');
        document.getElementById('login-form').reset();
        Utils.showToast('Sesión cerrada', 'success');
    }
}

// ===================================
// LISTA DE PACIENTES
// ===================================
async function loadListaPacientes() {
    Utils.showScreen('lista-pacientes-screen');
    Utils.showLoading('Cargando pacientes...');
    
    try {
        const result = await ApiService.listarTodosPacientes();
        
        Utils.hideLoading();
        
        if (result.success) {
            AppState.pacientes = result.data;
            AppState.filteredPacientes = result.data;
            renderPacientesList();
        } else {
            Utils.showToast('Error al cargar pacientes: ' + result.message, 'error');
        }
    } catch (error) {
        Utils.hideLoading();
        Utils.showToast('Error de conexión', 'error');
        console.error('Error al cargar pacientes:', error);
    }
}

function handleFilterChange(filter) {
    AppState.currentFilter = filter;
    
    // Actualizar chips activos
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.filter === filter) {
            chip.classList.add('active');
        }
    });
    
    // Filtrar pacientes
    if (filter === 'TODOS') {
        AppState.filteredPacientes = AppState.pacientes;
    } else {
        AppState.filteredPacientes = AppState.pacientes.filter(p => p.estado === filter);
    }
    
    renderPacientesList();
}

function renderPacientesList() {
    const container = document.getElementById('pacientes-list');
    const countBar = document.getElementById('pacientes-count');
    
    countBar.textContent = `${AppState.filteredPacientes.length} paciente(s) encontrado(s)`;
    
    if (AppState.filteredPacientes.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <p>No hay pacientes registrados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = AppState.filteredPacientes.map(paciente => {
        const diasDesdeUltimo = paciente.dias_desde_ultimo_registro || 0;
        const color = Utils.getColorByDays(diasDesdeUltimo);
        const estadoColor = paciente.estado === 'ACTIVO' ? '#4CAF50' : '#f44336';
        
        return `
            <div class="patient-card" data-id="${paciente.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <h3 style="color: var(--primary-color); margin-bottom: 8px;">${paciente.id}</h3>
                        <h4 style="font-size: 18px; margin-bottom: 8px;">${paciente.nombres_apellidos}</h4>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="
                            padding: 4px 12px;
                            background: ${color}20;
                            color: ${color};
                            border: 1px solid ${color};
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">
                            ${diasDesdeUltimo} días
                        </span>
                        <span style="
                            padding: 4px 12px;
                            background: ${estadoColor}20;
                            color: ${estadoColor};
                            border: 1px solid ${estadoColor};
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">
                            ${paciente.estado}
                        </span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
                    <div>
                        <span style="color: var(--text-secondary); font-size: 12px;">DNI:</span>
                        <p style="font-weight: 500;">${paciente.dni}</p>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary); font-size: 12px;">Edad:</span>
                        <p style="font-weight: 500;">${paciente.edad} años</p>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary); font-size: 12px;">Celular:</span>
                        <p style="font-weight: 500;">${paciente.celular}</p>
                    </div>
                </div>
                
                <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <span style="color: var(--text-secondary); font-size: 11px;">Muestra:</span>
                            <p style="font-weight: 500; font-size: 13px;">${paciente.muestra || 'N/A'}</p>
                        </div>
                        <div>
                            <span style="color: var(--text-secondary); font-size: 11px;">Resultado:</span>
                            <p style="font-weight: 500; font-size: 13px;">${paciente.resultado || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                ${paciente.estado === 'INACTIVO' && paciente.motivo_baja ? `
                    <div style="margin-top: 12px; padding: 12px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
                        <p style="font-size: 12px; color: #c62828;"><strong>Motivo de baja:</strong> ${paciente.motivo_baja}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Agregar event listeners a las cards
    container.querySelectorAll('.patient-card').forEach(card => {
        card.addEventListener('click', () => {
            const pacienteId = card.dataset.id;
            showPacienteDetail(pacienteId);
        });
    });
}

function showPacienteDetail(pacienteId) {
    Utils.showToast('Funcionalidad de detalle en desarrollo', 'warning');
    // Aquí se implementará la vista de detalle del paciente
}

// ===================================
// NUEVO REGISTRO
// ===================================
async function loadNuevoRegistroForm() {
    Utils.showLoading('Cargando formulario...');
    
    // Aquí cargarías los tipos de muestra, resultado, etc.
    Utils.hideLoading();
    
    const formContainer = document.querySelector('#nuevo-registro-screen .patient-form');
    formContainer.innerHTML = `
        <p style="text-align: center; padding: 40px; color: var(--text-secondary);">
            Formulario de registro en desarrollo
        </p>
    `;
}

// Mensaje de consola
console.log('%c🏥 Hospital San Juan de Dios - Sistema Web', 'color: #0066CC; font-size: 16px; font-weight: bold;');
console.log('%cVersión 1.0.0', 'color: #757575;');