// seguimiento-form-manager.js - Formulario de Agregar Seguimiento

// ==================== VARIABLES GLOBALES ====================
let maestrosSeguimiento = {
    muestras: [],
    resultados: [],
    cuentaCon: []
};

let archivosSeguimiento = {
    foto: null,
    documentos: []
};

// ==================== ABRIR MODAL DE SEGUIMIENTO ====================
window.abrirModalSeguimiento = async function() {
    if (!pacienteSeleccionado) {
        alert('No hay paciente seleccionado');
        return;
    }
    
    const modal = document.getElementById('modalSeguimiento') || crearModalSeguimiento();
    
    // Limpiar formulario y archivos
    limpiarFormularioSeguimiento();
    archivosSeguimiento = { foto: null, documentos: [] };
    
    // Precargar datos del paciente
    precargarDatosSeguimiento();
    
    // Cargar maestros
    await cargarMaestrosSeguimiento();
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// ==================== CREAR MODAL DE SEGUIMIENTO ====================
function crearModalSeguimiento() {
    const modal = document.createElement('div');
    modal.id = 'modalSeguimiento';
    modal.className = 'modal-expediente';
    modal.innerHTML = `
        <div class="modal-expediente-content modal-form">
            <div class="modal-expediente-header">
                <div class="header-info">
                    <h2><i class="fas fa-plus-circle"></i> Agregar Seguimiento</h2>
                    <p>Paciente: <strong id="seguimientoPacienteNombre">-</strong></p>
                </div>
                <button onclick="cerrarModalSeguimiento()" class="btn-icon" title="Cerrar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-expediente-body">
                <form id="formSeguimiento" class="patient-form">
                    <!-- DATOS PERSONALES -->
                    <div class="form-section">
                        <h3><i class="fas fa-user"></i> Datos Personales</h3>
                        
                        <div class="info-readonly">
                            <div class="info-row">
                                <span class="label">ID Paciente:</span>
                                <span class="value" id="seguimientoPacienteId">-</span>
                            </div>
                            <div class="info-row">
                                <span class="label">DNI:</span>
                                <span class="value" id="seguimientoPacienteDni">-</span>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="segNombres">
                                    <i class="fas fa-id-card"></i> Nombres Completos *
                                </label>
                                <input type="text" id="segNombres" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="segEdad">
                                    <i class="fas fa-birthday-cake"></i> Edad *
                                </label>
                                <input type="number" id="segEdad" required min="0" max="120">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="segDireccion">
                                <i class="fas fa-map-marker-alt"></i> Dirección *
                            </label>
                            <textarea id="segDireccion" rows="2" required></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="segCelular">
                                    <i class="fas fa-phone"></i> Celular *
                                </label>
                                <input type="tel" id="segCelular" required 
                                       pattern="[0-9]{9}" maxlength="9">
                            </div>
                            
                            <div class="form-group">
                                <label for="segCelularOpcional">
                                    <i class="fas fa-phone-alt"></i> Celular Opcional
                                </label>
                                <input type="tel" id="segCelularOpcional" 
                                       pattern="[0-9]{9}" maxlength="9">
                            </div>
                        </div>
                    </div>
                    
                    <!-- INFORMACIÓN MÉDICA -->
                    <div class="form-section">
                        <h3><i class="fas fa-stethoscope"></i> Información Médica</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="segMuestra">
                                    <i class="fas fa-vial"></i> Tipo de Muestra *
                                </label>
                                <div style="display: flex; gap: 8px;">
                                    <select id="segMuestra" required style="flex: 1;">
                                        <option value="">Cargando...</option>
                                    </select>
                                    <button type="button" onclick="agregarNuevoTipoSeguimiento('muestra')" 
                                            class="btn-icon" title="Agregar nuevo tipo">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="segResultado">
                                    <i class="fas fa-clipboard-check"></i> Resultado *
                                </label>
                                <div style="display: flex; gap: 8px;">
                                    <select id="segResultado" required style="flex: 1;">
                                        <option value="">Cargando...</option>
                                    </select>
                                    <button type="button" onclick="agregarNuevoTipoSeguimiento('resultado')" 
                                            class="btn-icon" title="Agregar nuevo tipo">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="segObservacion">
                                <i class="fas fa-notes-medical"></i> Observación
                            </label>
                            <textarea id="segObservacion" rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="segCheckTratamiento">
                                <span>¿Cuenta con tratamiento particular?</span>
                            </label>
                        </div>
                        
                        <div class="form-group" id="segTratamientoContainer" style="display: none;">
                            <label for="segTratamiento">
                                <i class="fas fa-pills"></i> Detalles del Tratamiento
                            </label>
                            <textarea id="segTratamiento" rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-check-square"></i> Ya Cuenta Con:
                                <button type="button" onclick="agregarNuevoTipoSeguimiento('cuenta_con')" 
                                        class="btn-icon-small" style="margin-left: 10px;" title="Agregar opción">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </label>
                            <div id="segCuentaConContainer" class="checkbox-grid">
                                <p class="loading">Cargando opciones...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ARCHIVOS -->
                    <div class="form-section">
                        <h3><i class="fas fa-paperclip"></i> Archivos Adjuntos</h3>
                        
                        <div class="form-group">
                            <label><i class="fas fa-camera"></i> Foto del Paciente</label>
                            <div class="file-upload-area">
                                <input type="file" id="segFoto" accept="image/*" style="display: none;">
                                <button type="button" class="btn btn-secondary" 
                                        onclick="document.getElementById('segFoto').click()">
                                    <i class="fas fa-camera"></i> Seleccionar Foto
                                </button>
                                <div id="segFotoPreview" class="file-preview"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label><i class="fas fa-file-alt"></i> Documentos Adicionales (Máx. 5)</label>
                            <div class="file-upload-area">
                                <input type="file" id="segDocumentos" multiple 
                                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="display: none;">
                                <button type="button" class="btn btn-secondary" 
                                        onclick="document.getElementById('segDocumentos').click()">
                                    <i class="fas fa-upload"></i> Seleccionar Documentos
                                </button>
                                <div id="segDocumentosPreview" class="file-preview"></div>
                            </div>
                            <small>Formatos: PDF, DOC, DOCX, JPG, PNG (Máx. 5MB cada uno)</small>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="modal-expediente-footer">
                <div id="segProgresoContainer" style="display: none; flex: 1;">
                    <div class="progress-bar">
                        <div id="segProgressBar" class="progress-fill"></div>
                    </div>
                    <p id="segProgressText" class="progress-text"></p>
                </div>
                <button type="button" onclick="cerrarModalSeguimiento()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="button" onclick="guardarSeguimiento()" class="btn btn-primary" id="btnGuardarSeguimiento">
                    <i class="fas fa-save"></i> Guardar Seguimiento
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos
    configurarEventosSeguimiento();
    
    return modal;
}

// ==================== PRECARGAR DATOS ====================
function precargarDatosSeguimiento() {
    document.getElementById('seguimientoPacienteNombre').textContent = pacienteSeleccionado.nombres_apellidos;
    document.getElementById('seguimientoPacienteId').textContent = pacienteSeleccionado.id;
    document.getElementById('seguimientoPacienteDni').textContent = pacienteSeleccionado.dni || '-';
    
    document.getElementById('segNombres').value = pacienteSeleccionado.nombres_apellidos || '';
    document.getElementById('segEdad').value = pacienteSeleccionado.edad || '';
    document.getElementById('segDireccion').value = pacienteSeleccionado.direccion || '';
    document.getElementById('segCelular').value = pacienteSeleccionado.celular || '';
    
    // Precargar tratamiento si existe
    if (pacienteSeleccionado.tratamiento_particular && pacienteSeleccionado.tratamiento_particular.trim() !== '') {
        document.getElementById('segCheckTratamiento').checked = true;
        document.getElementById('segTratamientoContainer').style.display = 'block';
        document.getElementById('segTratamiento').value = pacienteSeleccionado.tratamiento_particular;
    }
}

// ==================== CARGAR MAESTROS ====================
async function cargarMaestrosSeguimiento() {
    try {
        mostrarProgresoSeguimiento('Cargando opciones...', 0);
        
        // Tipos de Muestra
        const dataMuestras = await window.apiService.obtenerTiposMuestra();
        if (dataMuestras && dataMuestras.success && Array.isArray(dataMuestras.data)) {
            maestrosSeguimiento.muestras = dataMuestras.data;
            llenarSelectMuestrasSeguimiento();
        }
        
        mostrarProgresoSeguimiento('Cargando opciones...', 33);
        
        // Tipos de Resultado
        const dataResultados = await window.apiService.obtenerTiposResultado();
        if (dataResultados && dataResultados.success && Array.isArray(dataResultados.data)) {
            maestrosSeguimiento.resultados = dataResultados.data;
            llenarSelectResultadosSeguimiento();
        }
        
        mostrarProgresoSeguimiento('Cargando opciones...', 66);
        
        // Tipos de Cuenta Con
        const dataCuentaCon = await window.apiService.obtenerTiposCuentaCon();
        if (dataCuentaCon && dataCuentaCon.success && Array.isArray(dataCuentaCon.data)) {
            maestrosSeguimiento.cuentaCon = dataCuentaCon.data;
            llenarCheckboxesCuentaConSeguimiento();
            
            // Preseleccionar los que ya tiene
            if (pacienteSeleccionado.ya_cuenta_con) {
                const seleccionados = pacienteSeleccionado.ya_cuenta_con.split(', ');
                seleccionados.forEach(item => {
                    const checkbox = document.querySelector(`input[name="segCuentaCon[]"][value="${item}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
        
        ocultarProgresoSeguimiento();
        
    } catch (error) {
        console.error('❌ Error al cargar maestros:', error);
        alert('Error al cargar opciones del formulario');
    }
}

function llenarSelectMuestrasSeguimiento() {
    const select = document.getElementById('segMuestra');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione tipo de muestra...</option>';
    maestrosSeguimiento.muestras.forEach(item => {
        const option = document.createElement('option');
        option.value = item.tipo;
        option.textContent = item.tipo;
        select.appendChild(option);
    });
}

function llenarSelectResultadosSeguimiento() {
    const select = document.getElementById('segResultado');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione resultado...</option>';
    maestrosSeguimiento.resultados.forEach(item => {
        const option = document.createElement('option');
        option.value = item.tipo;
        option.textContent = item.tipo;
        select.appendChild(option);
    });
}

function llenarCheckboxesCuentaConSeguimiento() {
    const container = document.getElementById('segCuentaConContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    maestrosSeguimiento.cuentaCon.forEach((item, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'segCuentaCon[]';
        checkbox.value = item.tipo;
        checkbox.id = `segcc_${index}`;
        
        const span = document.createElement('span');
        span.textContent = item.tipo;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

// ==================== CONFIGURAR EVENTOS ====================
function configurarEventosSeguimiento() {
    // Tratamiento particular
    const checkTratamiento = document.getElementById('segCheckTratamiento');
    const tratamientoContainer = document.getElementById('segTratamientoContainer');
    if (checkTratamiento) {
        checkTratamiento.addEventListener('change', function() {
            tratamientoContainer.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // Validación de celulares
    const celularInput = document.getElementById('segCelular');
    if (celularInput) {
        celularInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 9);
        });
    }
    
    const celularOpcInput = document.getElementById('segCelularOpcional');
    if (celularOpcInput) {
        celularOpcInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 9);
        });
    }
    
    // Foto
    const inputFoto = document.getElementById('segFoto');
    if (inputFoto) {
        inputFoto.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('⚠️ Por favor seleccione una imagen válida');
                this.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('⚠️ La imagen no debe superar los 5MB');
                this.value = '';
                return;
            }
            
            archivosSeguimiento.foto = file;
            mostrarVistaPreviaSeguimiento(file, 'segFotoPreview');
        });
    }
    
    // Documentos
    const inputDocs = document.getElementById('segDocumentos');
    if (inputDocs) {
        inputDocs.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            if (files.length > 5) {
                alert('⚠️ Máximo 5 documentos permitidos');
                this.value = '';
                return;
            }
            
            for (let file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`⚠️ El archivo ${file.name} supera los 5MB`);
                    this.value = '';
                    return;
                }
            }
            
            archivosSeguimiento.documentos = files;
            mostrarDocumentosSeguimiento(files);
        });
    }
}

// ==================== VISTA PREVIA DE ARCHIVOS ====================
function mostrarVistaPreviaSeguimiento(file, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <img src="${e.target.result}" alt="Vista previa" 
                 style="max-width:150px; max-height:150px; border-radius:8px; display:block;">
            <button type="button" class="remove-file" onclick="eliminarFotoSeguimiento()">
                <i class="fas fa-times"></i>
            </button>
            <p style="margin:5px 0 0 0; font-size:12px;">${file.name}</p>
        `;
        container.appendChild(div);
    };
    reader.readAsDataURL(file);
}

function mostrarDocumentosSeguimiento(files) {
    const container = document.getElementById('segDocumentosPreview');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        
        const icon = obtenerIconoArchivo(file.name);
        
        div.innerHTML = `
            <i class="fas ${icon}" style="font-size:40px; color:#667eea; display:block; text-align:center;"></i>
            <p style="margin:8px 0 0 0; font-size:13px; max-width:120px; overflow:hidden; text-overflow:ellipsis;">${file.name}</p>
            <small style="color:#6b7280; font-size:11px;">${formatearTamano(file.size)}</small>
            <button type="button" class="remove-file" onclick="eliminarDocumentoSeguimiento(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

window.eliminarFotoSeguimiento = function() {
    archivosSeguimiento.foto = null;
    const input = document.getElementById('segFoto');
    if (input) input.value = '';
    const container = document.getElementById('segFotoPreview');
    if (container) container.innerHTML = '';
};

window.eliminarDocumentoSeguimiento = function(index) {
    const input = document.getElementById('segDocumentos');
    if (!input) return;
    
    const dt = new DataTransfer();
    const files = Array.from(input.files);
    
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    
    input.files = dt.files;
    archivosSeguimiento.documentos = files;
    mostrarDocumentosSeguimiento(files);
};

// ==================== AGREGAR NUEVO TIPO ====================
window.agregarNuevoTipoSeguimiento = async function(tipo) {
    const nuevoTipo = prompt('Ingrese el nuevo tipo:');
    if (!nuevoTipo || !nuevoTipo.trim()) return;
    
    mostrarProgresoSeguimiento('Guardando nuevo tipo...', 50);
    
    try {
        let resultado;
        if (tipo === 'muestra') {
            resultado = await window.apiService.agregarTipoMuestra(nuevoTipo.trim());
        } else if (tipo === 'resultado') {
            resultado = await window.apiService.agregarTipoResultado(nuevoTipo.trim());
        } else {
            resultado = await window.apiService.agregarTipoCuentaCon(nuevoTipo.trim());
        }
        
        if (resultado.success) {
            alert('✅ Tipo agregado exitosamente');
            await cargarMaestrosSeguimiento();
            
            if (tipo === 'muestra') {
                document.getElementById('segMuestra').value = nuevoTipo.trim();
            } else if (tipo === 'resultado') {
                document.getElementById('segResultado').value = nuevoTipo.trim();
            }
        } else {
            alert('❌ Error: ' + resultado.message);
        }
    } catch (error) {
        alert('❌ Error al agregar tipo');
    }
    
    ocultarProgresoSeguimiento();
};

// ==================== GUARDAR SEGUIMIENTO ====================
window.guardarSeguimiento = async function() {
    const form = document.getElementById('formSeguimiento');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    if (!confirm('¿Está seguro de agregar este seguimiento?')) return;
    
    const btnGuardar = document.getElementById('btnGuardarSeguimiento');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        // Obtener cuenta con
        const cuentaCon = [];
        document.querySelectorAll('input[name="segCuentaCon[]"]:checked').forEach(cb => {
            cuentaCon.push(cb.value);
        });
        
        const tieneTratamiento = document.getElementById('segCheckTratamiento').checked;
        const tratamiento = tieneTratamiento ? (document.getElementById('segTratamiento').value.trim() || '') : '';
        
        mostrarProgresoSeguimiento('Guardando datos del seguimiento...', 10);
        
        let fotoUrl = '';
        let archivosUrls = '';
        
        // Subir foto si existe
        if (archivosSeguimiento.foto) {
            mostrarProgresoSeguimiento('Subiendo foto...', 30);
            
            const resultadoFoto = await window.apiService.subirArchivo(
                archivosSeguimiento.foto,
                pacienteSeleccionado.id
            );
            
            if (resultadoFoto.success) {
                fotoUrl = resultadoFoto.data.file_url;
            }
        }
        
        // Subir documentos si existen
        if (archivosSeguimiento.documentos.length > 0) {
            const urlsDocumentos = [];
            
            for (let i = 0; i < archivosSeguimiento.documentos.length; i++) {
                const porcentaje = 30 + ((i + 1) / archivosSeguimiento.documentos.length) * 50;
                mostrarProgresoSeguimiento(`Subiendo documento ${i + 1} de ${archivosSeguimiento.documentos.length}...`, porcentaje);
                
                const doc = archivosSeguimiento.documentos[i];
                const resultadoDoc = await window.apiService.subirArchivo(doc, pacienteSeleccionado.id);
                
                if (resultadoDoc.success) {
                    urlsDocumentos.push(resultadoDoc.data.file_url);
                }
            }
            
            archivosUrls = urlsDocumentos.join(', ');
        }
        
        mostrarProgresoSeguimiento('Registrando seguimiento...', 90);
        
        // Agregar seguimiento
        const formData = {
            id_paciente: pacienteSeleccionado.id,
            nombres_apellidos: document.getElementById('segNombres').value.trim(),
            edad: document.getElementById('segEdad').value,
            direccion: document.getElementById('segDireccion').value.trim(),
            dni: pacienteSeleccionado.dni,
            celular: document.getElementById('segCelular').value.trim(),
            celular_opcional: document.getElementById('segCelularOpcional').value.trim(),
            muestra: document.getElementById('segMuestra').value,
            resultado: document.getElementById('segResultado').value,
            observacion: document.getElementById('segObservacion').value.trim(),
            tratamiento_particular: tratamiento,
            ya_cuenta_con: cuentaCon.join(', '),
            registrado_por: usuario.usuario || usuario.nombre,
            foto_url: fotoUrl,
            archivos_urls: archivosUrls
        };
        
        const resultado = await window.apiService.agregarSeguimiento(formData);
        
        ocultarProgresoSeguimiento();
        
        if (resultado.success) {
            alert(`✅ Seguimiento agregado exitosamente\n\nSecuencia: ${resultado.data.secuencia}`);
            
            cerrarModalSeguimiento();
            
            // Actualizar detalle del paciente
            await verDetallePaciente(pacienteSeleccionado.id);
        } else {
            alert('❌ Error: ' + resultado.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al guardar: ' + error.message);
        ocultarProgresoSeguimiento();
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Seguimiento';
    }
};

// ==================== CERRAR MODAL ====================
window.cerrarModalSeguimiento = function() {
    const modal = document.getElementById('modalSeguimiento');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// ==================== UTILIDADES ====================
function limpiarFormularioSeguimiento() {
    const form = document.getElementById('formSeguimiento');
    if (form) {
        form.reset();
    }
    
    document.querySelectorAll('input[name="segCuentaCon[]"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.getElementById('segTratamientoContainer').style.display = 'none';
    
    const fotoPreview = document.getElementById('segFotoPreview');
    if (fotoPreview) fotoPreview.innerHTML = '';
    
    const docsPreview = document.getElementById('segDocumentosPreview');
    if (docsPreview) docsPreview.innerHTML = '';
}

function mostrarProgresoSeguimiento(mensaje, porcentaje) {
    const container = document.getElementById('segProgresoContainer');
    const progressBar = document.getElementById('segProgressBar');
    const progressText = document.getElementById('segProgressText');
    
    if (container) container.style.display = 'flex';
    if (progressBar) progressBar.style.width = porcentaje + '%';
    if (progressText) progressText.textContent = mensaje;
}

function ocultarProgresoSeguimiento() {
    const container = document.getElementById('segProgresoContainer');
    if (container) container.style.display = 'none';
}

console.log('✅ seguimiento-form-manager.js cargado');