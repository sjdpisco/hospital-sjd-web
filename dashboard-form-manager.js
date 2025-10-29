// dashboard-form-manager.js - Gestión del formulario en el dashboard
// VERSION CON SUBIDA DE ARCHIVOS COMPLETA

// ==================== VARIABLES GLOBALES ====================
let maestrosMedicosForm = {
    muestras: [],
    resultados: [],
    cuentaCon: []
};

let archivosForm = {
    foto: null,
    documentos: []
};

// ==================== INICIALIZAR CUANDO SE ABRE LA SECCIÓN ====================
function inicializarFormularioNuevo() {
    console.log('📝 Inicializando formulario de nuevo paciente en dashboard...');
    
    if (typeof window.apiService === 'undefined') {
        console.error('❌ window.apiService NO disponible');
        alert('Error: Servicio API no disponible');
        return;
    }
    
    console.log('✅ API Service disponible, cargando maestros...');
    
    cargarMaestrosMedicosForm();
    configurarEventosFormulario();
    configurarArchivosForm();
}

// ==================== CARGAR MAESTROS MÉDICOS ====================
async function cargarMaestrosMedicosForm() {
    try {
        console.log('📥 Cargando maestros médicos para formulario...');
        
        const selectMuestra = document.getElementById('muestra');
        const selectResultado = document.getElementById('resultado');
        const containerCuentaCon = document.getElementById('cuentaConContainer');
        
        if (selectMuestra) selectMuestra.innerHTML = '<option value="">Cargando...</option>';
        if (selectResultado) selectResultado.innerHTML = '<option value="">Cargando...</option>';
        if (containerCuentaCon) containerCuentaCon.innerHTML = '<p class="loading">Cargando opciones...</p>';
        
        // Cargar Tipos de Muestra
        const dataMuestras = await window.apiService.obtenerTiposMuestra();
        if (dataMuestras && dataMuestras.success && Array.isArray(dataMuestras.data)) {
            maestrosMedicosForm.muestras = dataMuestras.data;
            llenarSelectMuestrasForm();
            console.log(`✅ ${maestrosMedicosForm.muestras.length} tipos de muestra cargados`);
        } else {
            if (selectMuestra) selectMuestra.innerHTML = '<option value="">Error al cargar</option>';
        }
        
        // Cargar Tipos de Resultado
        const dataResultados = await window.apiService.obtenerTiposResultado();
        if (dataResultados && dataResultados.success && Array.isArray(dataResultados.data)) {
            maestrosMedicosForm.resultados = dataResultados.data;
            llenarSelectResultadosForm();
            console.log(`✅ ${maestrosMedicosForm.resultados.length} tipos de resultado cargados`);
        } else {
            if (selectResultado) selectResultado.innerHTML = '<option value="">Error al cargar</option>';
        }
        
        // Cargar Tipos de Cuenta Con
        const dataCuentaCon = await window.apiService.obtenerTiposCuentaCon();
        if (dataCuentaCon && dataCuentaCon.success && Array.isArray(dataCuentaCon.data)) {
            maestrosMedicosForm.cuentaCon = dataCuentaCon.data;
            llenarCheckboxesCuentaConForm();
            console.log(`✅ ${maestrosMedicosForm.cuentaCon.length} tipos de cuenta con cargados`);
        } else {
            if (containerCuentaCon) containerCuentaCon.innerHTML = '<p class="loading">Error al cargar</p>';
        }
        
        console.log('🎉 Maestros médicos cargados exitosamente');
        
    } catch (error) {
        console.error('❌ Error al cargar maestros:', error);
        alert('Error al cargar opciones del formulario');
    }
}

// ==================== LLENAR SELECT DE MUESTRAS ====================
function llenarSelectMuestrasForm() {
    const select = document.getElementById('muestra');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione tipo de muestra...</option>';
    
    maestrosMedicosForm.muestras.forEach(item => {
        const option = document.createElement('option');
        option.value = item.tipo;
        option.textContent = item.tipo;
        select.appendChild(option);
    });
    
    const optionNuevo = document.createElement('option');
    optionNuevo.value = '__NUEVO__';
    optionNuevo.textContent = '+ Agregar nuevo tipo';
    optionNuevo.style.color = '#667eea';
    optionNuevo.style.fontWeight = 'bold';
    select.appendChild(optionNuevo);
}

// ==================== LLENAR SELECT DE RESULTADOS ====================
function llenarSelectResultadosForm() {
    const select = document.getElementById('resultado');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione resultado...</option>';
    
    maestrosMedicosForm.resultados.forEach(item => {
        const option = document.createElement('option');
        option.value = item.tipo;
        option.textContent = item.tipo;
        select.appendChild(option);
    });
    
    const optionNuevo = document.createElement('option');
    optionNuevo.value = '__NUEVO__';
    optionNuevo.textContent = '+ Agregar nuevo tipo';
    optionNuevo.style.color = '#667eea';
    optionNuevo.style.fontWeight = 'bold';
    select.appendChild(optionNuevo);
}

// ==================== LLENAR CHECKBOXES ====================
function llenarCheckboxesCuentaConForm() {
    const container = document.getElementById('cuentaConContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (maestrosMedicosForm.cuentaCon.length === 0) {
        container.innerHTML = '<p class="loading">No hay opciones disponibles</p>';
        return;
    }
    
    maestrosMedicosForm.cuentaCon.forEach((item, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.style.cssText = 'display:flex; align-items:center; gap:8px; padding:8px; cursor:pointer;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'cuentaCon[]';
        checkbox.value = item.tipo;
        checkbox.id = `cc_${index}`;
        
        const span = document.createElement('span');
        span.textContent = item.tipo;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

// ==================== CONFIGURAR EVENTOS ====================
function configurarEventosFormulario() {
    console.log('⚙️ Configurando eventos del formulario...');
    
    const form = document.getElementById('formNuevoPaciente');
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }
    
    form.addEventListener('submit', guardarNuevoPacienteForm);
    
    const checkTratamiento = document.getElementById('checkTratamiento');
    const tratamientoContainer = document.getElementById('tratamientoContainer');
    
    if (checkTratamiento && tratamientoContainer) {
        checkTratamiento.addEventListener('change', function() {
            tratamientoContainer.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    const dniInput = document.getElementById('dni');
    if (dniInput) {
        dniInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 8);
        });
    }
    
    const celularInput = document.getElementById('celular');
    if (celularInput) {
        celularInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 9);
        });
    }
    
    const celularOpcInput = document.getElementById('celularOpcional');
    if (celularOpcInput) {
        celularOpcInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 9);
        });
    }
    
    const selectMuestra = document.getElementById('muestra');
    if (selectMuestra) {
        selectMuestra.addEventListener('change', function() {
            if (this.value === '__NUEVO__') {
                agregarNuevaMuestraForm();
            }
        });
    }
    
    const selectResultado = document.getElementById('resultado');
    if (selectResultado) {
        selectResultado.addEventListener('change', function() {
            if (this.value === '__NUEVO__') {
                agregarNuevoResultadoForm();
            }
        });
    }
    
    console.log('✅ Eventos configurados');
}

// ==================== AGREGAR NUEVOS TIPOS ====================
async function agregarNuevaMuestraForm() {
    const nuevoTipo = prompt('Ingrese el nuevo tipo de muestra:');
    if (!nuevoTipo || !nuevoTipo.trim()) {
        document.getElementById('muestra').value = '';
        return;
    }
    
    try {
        const resultado = await window.apiService.agregarTipoMuestra(nuevoTipo.trim());
        if (resultado.success) {
            alert('✅ Tipo agregado exitosamente');
            await cargarMaestrosMedicosForm();
            document.getElementById('muestra').value = nuevoTipo.trim();
        } else {
            alert('❌ Error: ' + resultado.message);
            document.getElementById('muestra').value = '';
        }
    } catch (error) {
        alert('❌ Error al agregar tipo');
        document.getElementById('muestra').value = '';
    }
}

async function agregarNuevoResultadoForm() {
    const nuevoTipo = prompt('Ingrese el nuevo tipo de resultado:');
    if (!nuevoTipo || !nuevoTipo.trim()) {
        document.getElementById('resultado').value = '';
        return;
    }
    
    try {
        const resultado = await window.apiService.agregarTipoResultado(nuevoTipo.trim());
        if (resultado.success) {
            alert('✅ Tipo agregado exitosamente');
            await cargarMaestrosMedicosForm();
            document.getElementById('resultado').value = nuevoTipo.trim();
        } else {
            alert('❌ Error: ' + resultado.message);
            document.getElementById('resultado').value = '';
        }
    } catch (error) {
        alert('❌ Error al agregar tipo');
        document.getElementById('resultado').value = '';
    }
}

// ==================== CONFIGURAR ARCHIVOS (NUEVO) ====================
function configurarArchivosForm() {
    console.log('📎 Configurando manejo de archivos...');
    
    // FOTO DEL PACIENTE
    const inputFoto = document.getElementById('fotoPaciente');
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
            
            archivosForm.foto = file;
            mostrarVistaPrevia(file);
            console.log('📷 Foto seleccionada:', file.name);
        });
    }
    
    // DOCUMENTOS ADICIONALES
    const inputDocs = document.getElementById('documentos');
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
            
            archivosForm.documentos = files;
            mostrarDocumentosSeleccionados(files);
            console.log('📄 Documentos seleccionados:', files.length);
        });
    }
    
    console.log('✅ Archivos configurados');
}

// ==================== MOSTRAR VISTA PREVIA ====================
function mostrarVistaPrevia(file) {
    const container = document.getElementById('fotoPreview');
    if (!container) return;
    
    container.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.style.cssText = 'position:relative; display:inline-block; margin:10px;';
        div.innerHTML = `
            <img src="${e.target.result}" alt="Vista previa" 
                 style="max-width:150px; max-height:150px; border-radius:8px; display:block;">
            <button type="button" class="remove-file" onclick="eliminarFotoForm()" 
                    style="position:absolute; top:-8px; right:-8px; background:#ef4444; color:white; 
                           border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">
                <i class="fas fa-times"></i>
            </button>
            <p style="margin:5px 0 0 0; font-size:12px;">${file.name}</p>
        `;
        container.appendChild(div);
    };
    reader.readAsDataURL(file);
}

function mostrarDocumentosSeleccionados(files) {
    const container = document.getElementById('documentosPreview');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.style.cssText = 'position:relative; display:inline-block; background:#f3f4f6; padding:15px; margin:10px; border-radius:8px;';
        
        const icon = obtenerIconoArchivo(file.name);
        
        div.innerHTML = `
            <i class="fas ${icon}" style="font-size:40px; color:#667eea; display:block; text-align:center;"></i>
            <p style="margin:8px 0 0 0; font-size:13px; max-width:120px; overflow:hidden; text-overflow:ellipsis;">${file.name}</p>
            <small style="color:#6b7280; font-size:11px;">${formatearTamano(file.size)}</small>
            <button type="button" class="remove-file" onclick="eliminarDocumentoForm(${index})" 
                    style="position:absolute; top:-8px; right:-8px; background:#ef4444; color:white; 
                           border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function obtenerIconoArchivo(nombre) {
    const ext = nombre.split('.').pop().toLowerCase();
    const iconos = {
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image'
    };
    return iconos[ext] || 'fa-file';
}

function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ==================== ELIMINAR ARCHIVOS ====================
window.eliminarFotoForm = function() {
    archivosForm.foto = null;
    const inputFoto = document.getElementById('fotoPaciente');
    if (inputFoto) inputFoto.value = '';
    const container = document.getElementById('fotoPreview');
    if (container) container.innerHTML = '';
    console.log('🗑️ Foto eliminada');
};

window.eliminarDocumentoForm = function(index) {
    const inputDocs = document.getElementById('documentos');
    if (!inputDocs) return;
    
    const dt = new DataTransfer();
    const files = Array.from(inputDocs.files);
    
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    
    inputDocs.files = dt.files;
    archivosForm.documentos = files;
    mostrarDocumentosSeleccionados(files);
    console.log('🗑️ Documento eliminado, quedan:', files.length);
};

// ==================== GUARDAR PACIENTE (CON ARCHIVOS) ====================
async function guardarNuevoPacienteForm(e) {
    e.preventDefault();
    
    if (!confirm('¿Está seguro de registrar este paciente?')) {
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardar');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;
    
    try {
        // 1. OBTENER DATOS
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        const cuentaCon = [];
        document.querySelectorAll('input[name="cuentaCon[]"]:checked').forEach(cb => {
            cuentaCon.push(cb.value);
        });
        
        const tieneTratamiento = document.getElementById('checkTratamiento')?.checked || false;
        const tratamiento = tieneTratamiento ? 
            (document.getElementById('tratamientoParticular')?.value.trim() || '') : '';
        
        const formData = {
            nombres_apellidos: document.getElementById('nombres')?.value.trim() || '',
            edad: document.getElementById('edad')?.value || '',
            dni: document.getElementById('dni')?.value.trim() || '',
            celular: document.getElementById('celular')?.value.trim() || '',
            celular_opcional: document.getElementById('celularOpcional')?.value.trim() || '',
            direccion: document.getElementById('direccion')?.value.trim() || '',
            muestra: document.getElementById('muestra')?.value || '',
            resultado: document.getElementById('resultado')?.value || '',
            observacion: document.getElementById('observacion')?.value.trim() || '',
            tratamiento_particular: tratamiento,
            ya_cuenta_con: cuentaCon.join(', '),
            registrado_por: usuario.usuario || usuario.nombre,
            foto_url: '',
            archivos_urls: ''
        };
        
        console.log('📤 Enviando datos:', formData);
        
        // 2. REGISTRAR PACIENTE
        const resultado = await window.apiService.registrarPaciente(formData);
        
        if (!resultado.success) {
            alert('❌ Error: ' + resultado.message);
            btnGuardar.innerHTML = textoOriginal;
            btnGuardar.disabled = false;
            return;
        }
        
        const pacienteId = resultado.data.id;
        console.log('✅ Paciente registrado con ID:', pacienteId);
        
        // 3. SUBIR ARCHIVOS SI HAY
        let fotoUrl = '';
        let archivosUrls = '';
        
        if (archivosForm.foto || archivosForm.documentos.length > 0) {
            console.log('📤 Subiendo archivos...');
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo archivos...';
            
            // Subir foto
            if (archivosForm.foto) {
                console.log('📷 Subiendo foto...');
                const resultadoFoto = await window.apiService.subirArchivo(
                    archivosForm.foto, 
                    pacienteId
                );
                
                if (resultadoFoto.success) {
                    fotoUrl = resultadoFoto.data.file_url;
                    console.log('✅ Foto subida:', fotoUrl);
                }
            }
            
            // Subir documentos
            if (archivosForm.documentos.length > 0) {
                console.log('📄 Subiendo documentos...');
                const urlsDocumentos = [];
                
                for (let doc of archivosForm.documentos) {
                    const resultadoDoc = await window.apiService.subirArchivo(doc, pacienteId);
                    if (resultadoDoc.success) {
                        urlsDocumentos.push(resultadoDoc.data.file_url);
                    }
                }
                
                archivosUrls = urlsDocumentos.join(', ');
                console.log('✅ Documentos subidos:', urlsDocumentos.length);
            }
            
            // 4. ACTUALIZAR URLs
            if (fotoUrl || archivosUrls) {
                console.log('🔗 Actualizando URLs en el registro...');
                await window.apiService.actualizarUrls(pacienteId, fotoUrl, archivosUrls);
            }
        }
        
        alert(`✅ Paciente registrado exitosamente\n\nID: ${pacienteId}\n\n` +
              `Foto: ${fotoUrl ? 'Sí' : 'No'}\n` +
              `Documentos: ${archivosForm.documentos.length}`);
        
        // Limpiar formulario
        document.getElementById('formNuevoPaciente').reset();
        document.querySelectorAll('input[name="cuentaCon[]"]').forEach(cb => cb.checked = false);
        document.getElementById('tratamientoContainer').style.display = 'none';
        
        // Limpiar archivos
        archivosForm = { foto: null, documentos: [] };
        const fotoPreview = document.getElementById('fotoPreview');
        if (fotoPreview) fotoPreview.innerHTML = '';
        const docsPreview = document.getElementById('documentosPreview');
        if (docsPreview) docsPreview.innerHTML = '';
        
        // Actualizar estadísticas
        if (typeof cargarEstadisticas === 'function') {
            cargarEstadisticas();
        }
        
        setTimeout(() => {
            if (confirm('¿Desea registrar otro paciente?')) {
                // Quedarse en el formulario
            } else {
                cambiarSeccion('inicio');
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al guardar: ' + error.message);
    } finally {
        btnGuardar.innerHTML = textoOriginal;
        btnGuardar.disabled = false;
    }
}

// ==================== LIMPIAR FORMULARIO ====================
function limpiarFormulario() {
    const form = document.getElementById('formNuevoPaciente');
    if (form) {
        form.reset();
    }
    
    document.querySelectorAll('input[name="cuentaCon[]"]').forEach(cb => {
        cb.checked = false;
    });
    
    const tratamientoContainer = document.getElementById('tratamientoContainer');
    if (tratamientoContainer) {
        tratamientoContainer.style.display = 'none';
    }
    
    // Limpiar archivos
    archivosForm = { foto: null, documentos: [] };
    const fotoPreview = document.getElementById('fotoPreview');
    if (fotoPreview) fotoPreview.innerHTML = '';
    const docsPreview = document.getElementById('documentosPreview');
    if (docsPreview) docsPreview.innerHTML = '';
    
    console.log('🧹 Formulario limpiado completamente');
}

console.log('✅ dashboard-form-manager.js CON ARCHIVOS cargado');