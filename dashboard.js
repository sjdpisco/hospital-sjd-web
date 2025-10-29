// dashboard.js - Lógica del Dashboard CON EXPEDIENTES
// VERSION CON FORMULARIO EMBEBIDO Y GESTIÓN DE EXPEDIENTES

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Dashboard...');
    verificarSesion();
    inicializarDashboard();
    cargarEstadisticas();
    configurarNavegacion();
});

// ==================== VERIFICAR SESIÓN ====================
function verificarSesion() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        console.log('⚠️ No hay sesión activa, redirigiendo...');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const userData = JSON.parse(usuario);
        
        // Actualizar nombre en sidebar
        const nombreElement = document.getElementById('nombreUsuario');
        if (nombreElement) {
            nombreElement.textContent = userData.nombre_completo || userData.nombre || userData.usuario;
        }
        
        // Actualizar información en configuración
        const configUsuario = document.getElementById('configUsuario');
        if (configUsuario) {
            configUsuario.textContent = userData.usuario || userData.nombre || '-';
        }
        
        const configRol = document.getElementById('configRol');
        if (configRol) {
            configRol.textContent = userData.rol || 'Usuario';
        }
        
        if (userData.loginTime) {
            const fecha = new Date(userData.loginTime);
            const configUltimaSesion = document.getElementById('configUltimaSesion');
            if (configUltimaSesion) {
                configUltimaSesion.textContent = fecha.toLocaleString('es-ES');
            }
        }
        
        console.log('✅ Sesión verificada:', userData.nombre || userData.usuario);
    } catch (error) {
        console.error('❌ Error al parsear sesión:', error);
        window.location.href = 'index.html';
    }
}

// ==================== INICIALIZAR DASHBOARD ====================
function inicializarDashboard() {
    console.log('📊 Inicializando componentes del dashboard...');
    
    // Actualizar hora cada minuto
    actualizarHora();
    setInterval(actualizarHora, 60000);
    
    console.log('✅ Dashboard inicializado');
}

// ==================== NAVEGACIÓN ====================
function configurarNavegacion() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const seccion = this.dataset.section;
            cambiarSeccion(seccion);
        });
    });
    
    console.log('✅ Navegación configurada');
}

function cambiarSeccion(seccion) {
    console.log('📍 Cambiando a sección:', seccion);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccionElement = document.getElementById(`seccion-${seccion}`);
    if (seccionElement) {
        seccionElement.classList.add('active');
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.querySelector(`[data-section="${seccion}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Actualizar título
    const titulos = {
        'inicio': '<i class="fas fa-home"></i> Panel de Inicio',
        'nuevo': '<i class="fas fa-user-plus"></i> Nuevo Registro',
        'buscar': '<i class="fas fa-search"></i> Buscar Paciente',
        'lista': '<i class="fas fa-list"></i> Lista de Pacientes',
        'configuracion': '<i class="fas fa-cog"></i> Configuración'
    };
    const tituloElement = document.getElementById('tituloSeccion');
    if (tituloElement) {
        tituloElement.innerHTML = titulos[seccion] || 'Dashboard';
    }
    
    // Cargar datos según sección
    if (seccion === 'lista') {
        if (typeof inicializarListaPacientes === 'function') {
            inicializarListaPacientes();
        } else {
            cargarPacientes();
        }
    } else if (seccion === 'nuevo') {
        console.log('📝 Sección de nuevo paciente activada');
        if (typeof inicializarFormularioNuevo === 'function') {
            inicializarFormularioNuevo();
        } else {
            console.error('❌ inicializarFormularioNuevo no está definida');
        }
    }
}

// ==================== ESTADÍSTICAS ====================
async function cargarEstadisticas() {
    console.log('📊 Cargando estadísticas...');
    
    try {
        if (typeof window.apiService === 'undefined') {
            console.error('❌ apiService no disponible');
            return;
        }
        
        const resultado = await window.apiService.obtenerTodosPacientes();
        
        if (resultado && resultado.success && Array.isArray(resultado.data)) {
            const pacientes = resultado.data;
            
            // Total de pacientes
            const totalElement = document.getElementById('totalPacientes');
            if (totalElement) {
                totalElement.textContent = pacientes.length;
            }
            
            // Pacientes activos
            const activos = pacientes.filter(p => p.estado === 'ACTIVO').length;
            const activosElement = document.getElementById('pacientesActivos');
            if (activosElement) {
                activosElement.textContent = activos;
            }
            
            // Registros de hoy
            const hoy = new Date().toISOString().split('T')[0];
            const registrosHoy = pacientes.filter(p => {
                if (p.fecha_registro) {
                    return p.fecha_registro.startsWith(hoy);
                }
                return false;
            }).length;
            const registrosHoyElement = document.getElementById('registrosHoy');
            if (registrosHoyElement) {
                registrosHoyElement.textContent = registrosHoy;
            }
            
            console.log('✅ Estadísticas cargadas:', {
                total: pacientes.length,
                activos: activos,
                hoy: registrosHoy
            });
        } else {
            console.error('❌ Error al cargar estadísticas:', resultado);
        }
        
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

function actualizarHora() {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const horaElement = document.getElementById('ultimaActualizacion');
    if (horaElement) {
        horaElement.textContent = hora;
    }
}

// ==================== BUSCAR PACIENTE ====================
async function buscarPaciente() {
    const termino = document.getElementById('inputBuscar').value.trim();
    const resultado = document.getElementById('resultadoBusqueda');
    
    if (!termino) {
        resultado.innerHTML = '<p class="loading">Ingrese un término de búsqueda</p>';
        return;
    }
    
    resultado.innerHTML = '<p class="loading">Buscando...</p>';
    
    try {
        if (typeof window.apiService === 'undefined') {
            resultado.innerHTML = '<p class="loading">Error: Servicio no disponible</p>';
            return;
        }
        
        const response = await window.apiService.buscarPaciente(termino);
        
        if (response && response.success && Array.isArray(response.data)) {
            const encontrados = response.data;
            
            if (encontrados.length === 0) {
                resultado.innerHTML = '<p class="loading">No se encontraron resultados</p>';
                return;
            }
            
            let html = '<div class="stats-grid">';
            encontrados.forEach(p => {
                const dias = p.dias_desde_ultimo_registro || 0;
                const colorDias = obtenerColorPorDiasBusqueda(dias);
                
                html += `
                    <div class="stat-card blue" style="cursor: pointer;" onclick="verDetallePacienteDesdeBase('${p.id}')">
                        <div class="stat-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${p.nombres_apellidos}</h3>
                            <p><strong>ID:</strong> ${p.id}</p>
                            <p><strong>Edad:</strong> ${p.edad} años</p>
                            <p><strong>Celular:</strong> ${p.celular}</p>
                            <p><strong>DNI:</strong> ${p.dni || '-'}</p>
                            <p style="color: ${colorDias}; font-weight: bold; margin-top: 8px;">
                                <i class="fas fa-calendar-alt"></i> ${dias} días desde último registro
                            </p>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            resultado.innerHTML = html;
        } else {
            resultado.innerHTML = '<p class="loading">Error al buscar</p>';
        }
        
    } catch (error) {
        console.error('Error:', error);
        resultado.innerHTML = '<p class="loading">Error al buscar</p>';
    }
}

function obtenerColorPorDiasBusqueda(dias) {
    if (dias <= 7) return '#10b981';
    if (dias <= 30) return '#f59e0b';
    return '#ef4444';
}

// Función auxiliar para abrir detalle desde búsqueda
window.verDetallePacienteDesdeBase = function(idPaciente) {
    // Cambiar a sección de lista
    cambiarSeccion('lista');
    
    // Esperar un momento y abrir el detalle
    setTimeout(() => {
        if (typeof verDetallePaciente === 'function') {
            verDetallePaciente(idPaciente);
        }
    }, 300);
};

// ==================== CARGAR PACIENTES (TABLA SIMPLE) ====================
async function cargarPacientes() {
    const tabla = document.getElementById('tablaPacientes');
    tabla.innerHTML = '<p class="loading">Cargando pacientes...</p>';
    
    try {
        if (typeof window.apiService === 'undefined') {
            tabla.innerHTML = '<p class="loading">Error: Servicio no disponible</p>';
            return;
        }
        
        const resultado = await window.apiService.obtenerTodosPacientes();
        
        if (resultado && resultado.success && Array.isArray(resultado.data)) {
            const pacientes = resultado.data;
            
            if (pacientes.length === 0) {
                tabla.innerHTML = '<p class="loading">No hay pacientes registrados</p>';
                return;
            }
            
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>DNI</th>
                            <th>Celular</th>
                            <th>Estado</th>
                            <th>Fecha Registro</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            pacientes.forEach(p => {
                html += `
                    <tr>
                        <td><strong>${p.id || '-'}</strong></td>
                        <td>${p.nombres_apellidos}</td>
                        <td>${p.edad}</td>
                        <td>${p.dni || '-'}</td>
                        <td>${p.celular || '-'}</td>
                        <td><span style="color: ${p.estado === 'ACTIVO' ? '#10b981' : '#6b7280'}">${p.estado || 'ACTIVO'}</span></td>
                        <td>${p.fecha_registro || '-'}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            tabla.innerHTML = html;
            
            console.log('✅ Tabla cargada con', pacientes.length, 'pacientes');
        } else {
            tabla.innerHTML = '<p class="loading">Error al cargar pacientes</p>';
        }
        
    } catch (error) {
        console.error('Error:', error);
        tabla.innerHTML = '<p class="loading">Error al cargar pacientes</p>';
    }
}

// ==================== FUNCIÓN AUXILIAR PARA LIMPIAR FORMULARIO ====================
function limpiarFormularioDashboard() {
    if (typeof limpiarFormulario === 'function') {
        limpiarFormulario();
    } else {
        const form = document.getElementById('formNuevoPaciente');
        if (form) {
            form.reset();
        }
    }
}

// ==================== CERRAR SESIÓN ====================
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    }
}

console.log('✅ dashboard.js (con expedientes) cargado correctamente');