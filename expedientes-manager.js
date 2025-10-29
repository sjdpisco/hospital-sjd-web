// expedientes-manager.js - Gestión de Expedientes y Seguimiento de Pacientes

// ==================== VARIABLES GLOBALES ====================
let pacienteSeleccionado = null;
let historialPaciente = [];

// ==================== INICIALIZAR SECCIÓN DE LISTA/CONSULTA ====================
function inicializarListaPacientes() {
    console.log('📋 Inicializando lista de pacientes...');
    cargarTodosPacientes();
}

// ==================== CARGAR TODOS LOS PACIENTES ====================
async function cargarTodosPacientes() {
    const contenedor = document.getElementById('listaPacientesContainer');
    if (!contenedor) return;
    
    contenedor.innerHTML = '<div class="loading-center"><div class="spinner"></div><p>Cargando pacientes...</p></div>';
    
    try {
        const resultado = await window.apiService.obtenerTodosPacientes();
        
        if (resultado && resultado.success && Array.isArray(resultado.data)) {
            const pacientes = resultado.data;
            
            if (pacientes.length === 0) {
                contenedor.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No hay pacientes registrados</p></div>';
                return;
            }
            
            // Ordenar por días desde último registro (más urgentes primero)
            pacientes.sort((a, b) => {
                const diasA = a.dias_desde_ultimo_registro || 0;
                const diasB = b.dias_desde_ultimo_registro || 0;
                return diasB - diasA;
            });
            
            renderizarListaPacientes(pacientes);
            
            console.log('✅ Lista cargada:', pacientes.length, 'pacientes');
        } else {
            contenedor.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error al cargar pacientes</p></div>';
        }
    } catch (error) {
        console.error('❌ Error:', error);
        contenedor.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error de conexión</p></div>';
    }
}

// ==================== RENDERIZAR LISTA DE PACIENTES ====================
function renderizarListaPacientes(pacientes) {
    const contenedor = document.getElementById('listaPacientesContainer');
    
    let html = '<div class="pacientes-grid">';
    
    pacientes.forEach(paciente => {
        const dias = paciente.dias_desde_ultimo_registro || 0;
        const colorDias = obtenerColorPorDias(dias);
        const estadoClass = paciente.estado === 'ACTIVO' ? 'activo' : 'inactivo';
        
        html += `
            <div class="paciente-card ${estadoClass}" onclick="verDetallePaciente('${paciente.id}')">
                <div class="paciente-card-header">
                    <div class="paciente-id">${paciente.id}</div>
                    <div class="paciente-dias" style="background-color: ${colorDias}20; border-color: ${colorDias};">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${dias} días</span>
                    </div>
                </div>
                
                <div class="paciente-card-body">
                    <h3 class="paciente-nombre">
                        <i class="fas fa-user"></i>
                        ${paciente.nombres_apellidos}
                    </h3>
                    
                    <div class="paciente-info">
                        <div class="info-item">
                            <i class="fas fa-id-card"></i>
                            <span>DNI: ${paciente.dni || '-'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-birthday-cake"></i>
                            <span>${paciente.edad} años</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span>${paciente.celular || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="paciente-medico">
                        <div class="medico-item">
                            <span class="label">Muestra:</span>
                            <span class="value">${paciente.muestra || 'N/A'}</span>
                        </div>
                        <div class="medico-item">
                            <span class="label">Resultado:</span>
                            <span class="value">${paciente.resultado || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="paciente-footer">
                        <span class="fecha-registro">
                            <i class="fas fa-clock"></i>
                            ${formatearFecha(paciente.fecha_registro)}
                        </span>
                        <span class="estado-badge ${estadoClass}">
                            ${paciente.estado || 'ACTIVO'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    contenedor.innerHTML = html;
}

// ==================== VER DETALLE DEL PACIENTE ====================
async function verDetallePaciente(idPaciente) {
    console.log('👁️ Cargando detalle del paciente:', idPaciente);
    
    // Mostrar overlay de carga
    mostrarOverlayCarga('Cargando expediente...');
    
    try {
        // Buscar datos del paciente
        const resultadoBusqueda = await window.apiService.buscarPaciente(idPaciente);
        
        if (!resultadoBusqueda.success || !resultadoBusqueda.data || resultadoBusqueda.data.length === 0) {
            ocultarOverlayCarga();
            alert('No se encontró el paciente');
            return;
        }
        
        pacienteSeleccionado = resultadoBusqueda.data[0];
        
        // Cargar historial
        const resultadoHistorial = await window.apiService.obtenerHistorialPaciente(idPaciente);
        
        if (resultadoHistorial.success && Array.isArray(resultadoHistorial.data)) {
            historialPaciente = resultadoHistorial.data;
        } else {
            historialPaciente = [];
        }
        
        ocultarOverlayCarga();
        
        // Mostrar modal con el detalle
        mostrarModalDetallePaciente();
        
    } catch (error) {
        ocultarOverlayCarga();
        console.error('❌ Error:', error);
        alert('Error al cargar el expediente');
    }
}

// ==================== MOSTRAR MODAL DE DETALLE ====================
function mostrarModalDetallePaciente() {
    const modal = document.getElementById('modalDetallePaciente') || crearModalDetalle();
    
    // Actualizar contenido
    document.getElementById('detallePacienteId').textContent = pacienteSeleccionado.id;
    document.getElementById('detallePacienteNombre').textContent = pacienteSeleccionado.nombres_apellidos;
    document.getElementById('detallePacienteDni').textContent = pacienteSeleccionado.dni || '-';
    document.getElementById('detallePacienteEdad').textContent = `${pacienteSeleccionado.edad} años`;
    document.getElementById('detalleHistorialCount').textContent = `${historialPaciente.length} registro(s)`;
    
    // Renderizar historial
    renderizarHistorial();
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ==================== CREAR MODAL DE DETALLE ====================
function crearModalDetalle() {
    const modal = document.createElement('div');
    modal.id = 'modalDetallePaciente';
    modal.className = 'modal-expediente';
    modal.innerHTML = `
        <div class="modal-expediente-content">
            <div class="modal-expediente-header">
                <div class="header-info">
                    <h2 id="detallePacienteId">-</h2>
                    <h3 id="detallePacienteNombre">-</h3>
                    <div class="header-tags">
                        <span class="tag"><i class="fas fa-id-card"></i> DNI: <span id="detallePacienteDni">-</span></span>
                        <span class="tag"><i class="fas fa-birthday-cake"></i> <span id="detallePacienteEdad">-</span></span>
                        <span class="tag"><i class="fas fa-history"></i> <span id="detalleHistorialCount">0</span></span>
                    </div>
                </div>
                <div class="header-actions">
                    <button onclick="imprimirFichaPaciente()" class="btn-icon" title="Imprimir Ficha">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="actualizarDetallePaciente()" class="btn-icon" title="Actualizar">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button onclick="cerrarModalDetalle()" class="btn-icon" title="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="modal-expediente-body">
                <div id="historialContainer"></div>
            </div>
            
            <div class="modal-expediente-footer">
                <button onclick="abrirModalSeguimiento()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Agregar Seguimiento
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModalDetalle();
        }
    });
    
    return modal;
}

// ==================== RENDERIZAR HISTORIAL ====================
function renderizarHistorial() {
    const container = document.getElementById('historialContainer');
    
    if (historialPaciente.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay registros en el historial</p></div>';
        return;
    }
    
    let html = '<div class="historial-timeline">';
    
    historialPaciente.forEach((seguimiento, index) => {
        const tipoRegistro = seguimiento.tipo_registro || 'SEGUIMIENTO';
        const esInicial = tipoRegistro === 'INICIAL';
        const colorTipo = esInicial ? '#3b82f6' : '#10b981';
        const iconoTipo = esInicial ? 'fa-user-plus' : 'fa-timeline';
        
        html += `
            <div class="historial-item">
                <div class="historial-marker" style="background-color: ${colorTipo};">
                    <i class="fas ${iconoTipo}"></i>
                </div>
                
                <div class="historial-card">
                    <div class="historial-card-header">
                        <div>
                            <h4>Secuencia ${seguimiento.secuencia}</h4>
                            <span class="tipo-badge" style="background-color: ${colorTipo}20; color: ${colorTipo};">
                                ${tipoRegistro}
                            </span>
                        </div>
                        <button onclick="toggleHistorialDetalle(${index})" class="btn-expand">
                            <i class="fas fa-chevron-down" id="chevron-${index}"></i>
                        </button>
                    </div>
                    
                    <div class="historial-card-meta">
                        <span><i class="fas fa-calendar"></i> ${seguimiento.fecha_registro}</span>
                        <span><i class="fas fa-user"></i> ${seguimiento.registrado_por || '-'}</span>
                    </div>
                    
                    <div class="historial-card-body" id="detalle-${index}" style="display: none;">
                        <div class="info-grid">
                            <div class="info-row">
                                <span class="label">Edad:</span>
                                <span class="value">${seguimiento.edad}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Dirección:</span>
                                <span class="value">${seguimiento.direccion || '-'}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Celular:</span>
                                <span class="value">${seguimiento.celular || '-'}</span>
                            </div>
                            ${seguimiento.celular_opcional ? `
                            <div class="info-row">
                                <span class="label">Celular Opcional:</span>
                                <span class="value">${seguimiento.celular_opcional}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="info-divider"></div>
                        
                        <div class="info-grid">
                            <div class="info-row highlight">
                                <span class="label">Muestra:</span>
                                <span class="value">${seguimiento.muestra || '-'}</span>
                            </div>
                            <div class="info-row highlight">
                                <span class="label">Resultado:</span>
                                <span class="value">${seguimiento.resultado || '-'}</span>
                            </div>
                            ${seguimiento.observacion ? `
                            <div class="info-row full-width">
                                <span class="label">Observación:</span>
                                <span class="value">${seguimiento.observacion}</span>
                            </div>
                            ` : ''}
                            ${seguimiento.tratamiento_particular ? `
                            <div class="info-row full-width">
                                <span class="label">Tratamiento Particular:</span>
                                <span class="value">${seguimiento.tratamiento_particular}</span>
                            </div>
                            ` : ''}
                            ${seguimiento.ya_cuenta_con ? `
                            <div class="info-row full-width">
                                <span class="label">Ya cuenta con:</span>
                                <span class="value">${seguimiento.ya_cuenta_con}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        ${seguimiento.foto_url ? `
                        <div class="info-divider"></div>
                        <div class="archivos-section">
                            <h5><i class="fas fa-camera"></i> Foto del seguimiento</h5>
                            <div class="foto-preview">
                                <img src="${seguimiento.foto_url}" alt="Foto" onclick="verImagenCompleta('${seguimiento.foto_url}')">
                            </div>
                        </div>
                        ` : ''}
                        
                        ${seguimiento.archivos_urls ? renderizarArchivosAdjuntos(seguimiento.archivos_urls) : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ==================== RENDERIZAR ARCHIVOS ADJUNTOS ====================
function renderizarArchivosAdjuntos(archivosUrls) {
    if (!archivosUrls || archivosUrls.trim() === '') return '';
    
    const urls = archivosUrls.split(', ').filter(url => url.trim() !== '');
    if (urls.length === 0) return '';
    
    // Separar imágenes de PDFs
    const imagenes = [];
    const pdfs = [];
    
    urls.forEach(url => {
        const extension = url.toLowerCase().split('.').pop();
        if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
            imagenes.push(url);
        } else {
            pdfs.push(url);
        }
    });
    
    let html = '<div class="info-divider"></div><div class="archivos-section">';
    html += '<h5><i class="fas fa-paperclip"></i> Archivos adjuntos</h5>';
    
    // Mostrar imágenes
    if (imagenes.length > 0) {
        html += '<div class="imagenes-grid">';
        imagenes.forEach(url => {
            html += `
                <div class="imagen-thumbnail" onclick="verImagenCompleta('${url}')">
                    <img src="${url}" alt="Archivo">
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Mostrar PDFs
    if (pdfs.length > 0) {
        html += '<div class="pdfs-list">';
        pdfs.forEach(url => {
            const fileName = url.split('/').pop();
            html += `
                <div class="pdf-item">
                    <i class="fas fa-file-pdf"></i>
                    <span>${fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName}</span>
                    <button onclick="abrirPdf('${url}')" class="btn-icon-small">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// ==================== TOGGLE DETALLE HISTORIAL ====================
window.toggleHistorialDetalle = function(index) {
    const detalle = document.getElementById(`detalle-${index}`);
    const chevron = document.getElementById(`chevron-${index}`);
    
    if (detalle.style.display === 'none') {
        detalle.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        detalle.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
};

// ==================== VER IMAGEN COMPLETA ====================
window.verImagenCompleta = function(url) {
    const modal = document.createElement('div');
    modal.className = 'modal-imagen';
    modal.innerHTML = `
        <div class="modal-imagen-content">
            <button onclick="this.parentElement.parentElement.remove()" class="btn-close-imagen">
                <i class="fas fa-times"></i>
            </button>
            <img src="${url}" alt="Imagen">
        </div>
    `;
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
};

// ==================== ABRIR PDF ====================
window.abrirPdf = function(url) {
    window.open(url, '_blank');
};

// ==================== ACTUALIZAR DETALLE ====================
window.actualizarDetallePaciente = async function() {
    if (!pacienteSeleccionado) return;
    await verDetallePaciente(pacienteSeleccionado.id);
};

// ==================== CERRAR MODAL ====================
window.cerrarModalDetalle = function() {
    const modal = document.getElementById('modalDetallePaciente');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Recargar lista por si hay cambios
    if (typeof inicializarListaPacientes === 'function') {
        inicializarListaPacientes();
    }
};

// ==================== IMPRIMIR FICHA ====================
window.imprimirFichaPaciente = function() {
    alert('Funcionalidad de impresión en desarrollo.\n\nPróximamente podrás generar un PDF con toda la información del paciente.');
};

// ==================== UTILIDADES ====================
function obtenerColorPorDias(dias) {
    if (dias <= 7) return '#10b981'; // Verde
    if (dias <= 30) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return fecha;
    }
}

function mostrarOverlayCarga(mensaje) {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div class="spinner"></div>
        <p>${mensaje}</p>
    `;
    overlay.style.display = 'flex';
}

function ocultarOverlayCarga() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

console.log('✅ expedientes-manager.js cargado');