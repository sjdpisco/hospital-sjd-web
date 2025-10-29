// nuevo-paciente-logic.js - CON FUNCIONALIDAD COMPLETA DE ARCHIVOS

// ==================== VARIABLES GLOBALES ====================
let maestrosMedicos = {
    muestras: [],
    resultados: [],
    cuentaCon: []
};

let archivosSeleccionados = {
    foto: null,
    documentos: []
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM Cargado - Inicializando formulario...');
    
    if (typeof window.apiService === 'undefined') {
        console.error('❌ window.apiService NO está disponible');
        alert('Error: Servicio API no disponible. Por favor recarga la página.');
        return;
    }
    
    console.log('✅ window.apiService está disponible');
    
    verificarSesion();
    await cargarMaestrosMedicos();
    configurarFormulario();
    configurarBotonesAgregar();
    configurarArchivos(); // ⚠️ IMPORTANTE: Configurar archivos
});

// ==================== VERIFICAR SESIÓN ====================
function verificarSesion() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        alert('⚠️ Sesión no válida. Redirigiendo al login...');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const userData = JSON.parse(usuario);
        const nombreElement = document.getElementById('nombreUsuario');
        if (nombreElement) {
            nombreElement.textContent = userData.nombre_completo || userData.nombre || userData.usuario;
        }
        console.log('✅ Usuario verificado:', userData.nombre || userData.usuario);
    } catch (error) {
        console.error('❌ Error al parsear usuario:', error);
        window.location.href = 'index.html';
    }
}

// ==================== CERRAR SESIÓN ====================
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    }
}

// ==================== CARGAR MAESTROS MÉDICOS ====================
async function cargarMaestrosMedicos() {
    try {
        console.log('📥 Iniciando carga de maestros médicos...');
        
        actualizarSelectConMensaje('muestra', 'Cargando...');
        actualizarSelectConMensaje('resultado', 'Cargando...');
        actualizarCheckboxConMensaje('checkboxesCuentaCon', 'Cargando opciones...');
        
        const dataMuestras = await window.apiService.obtenerTiposMuestra();
        if (dataMuestras && dataMuestras.success && Array.isArray(dataMuestras.data)) {
            maestrosMedicos.muestras = dataMuestras.data;
            llenarSelectMuestras();
            console.log(`✅ ${maestrosMedicos.muestras.length} tipos de muestra cargados`);
        } else {
            actualizarSelectConMensaje('muestra', 'Error al cargar');
        }
        
        const dataResultados = await window.apiService.obtenerTiposResultado();
        if (dataResultados && dataResultados.success && Array.isArray(dataResultados.data)) {
            maestrosMedicos.resultados = dataResultados.data;
            llenarSelectResultados();
            console.log(`✅ ${maestrosMedicos.resultados.length} tipos de resultado cargados`);
        } else {
            actualizarSelectConMensaje('resultado', 'Error al cargar');
        }
        
        const dataCuentaCon = await window.apiService.obtenerTiposCuentaCon();
        if (dataCuentaCon && dataCuentaCon.success && Array.isArray(dataCuentaCon.data)) {
            maestrosMedicos.cuentaCon = dataCuentaCon.data;
            llenarCheckboxesCuentaCon();
            console.log(`✅ ${maestrosMedicos.cuentaCon.length} tipos de cuenta con cargados`);
        } else {
            actualizarCheckboxConMensaje('checkboxesCuentaCon', 'Error al cargar');
        }
        
        console.log('🎉 Carga de maestros completada');
        
    } catch (error) {
        console.error('❌ Error general al cargar maestros:', error);
        alert('Error al cargar las opciones del formulario. Por favor recarga la página.');
    }
}

// ==================== FUNCIONES AUXILIARES ====================
function actualizarSelectConMensaje(selectId, mensaje) {
    const select = document.getElementById(selectId);
    if (select) select.innerHTML = `<option value="">${mensaje}</option>`;
}

function actualizarCheckboxConMensaje(containerId, mensaje) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = `<p class="loading">${mensaje}</p>`;
}

// ==================== LLENAR SELECTS ====================
function llenarSelectMuestras() {
    const select = document.getElementById('muestra');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione tipo de muestra...</option>';
    
    maestrosMedicos.muestras.forEach(item => {
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

function llenarSelectResultados() {
    const select = document.getElementById('resultado');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione resultado...</option>';
    
    maestrosMedicos.resultados.forEach(item => {
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

function llenarCheckboxesCuentaCon() {
    const container = document.getElementById('checkboxesCuentaCon');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!maestrosMedicos.cuentaCon || maestrosMedicos.cuentaCon.length === 0) {
        container.innerHTML = '<p class="loading">No hay opciones disponibles</p>';
        return;
    }
    
    maestrosMedicos.cuentaCon.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px; background:#fff; border-radius:6px; margin-bottom:5px;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `cuentaCon_${index}`;
        checkbox.value = item.tipo;
        checkbox.name = 'cuentaCon';
        
        const label = document.createElement('label');
        label.htmlFor = `cuentaCon_${index}`;
        label.textContent = item.tipo;
        label.style.cssText = 'cursor:pointer; flex:1; margin:0;';
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
    
    const btnAgregar = document.createElement('button');
    btnAgregar.type = 'button';
    btnAgregar.className = 'btn btn-secondary';
    btnAgregar.style.marginTop = '10px';
    btnAgregar.innerHTML = '<i class="fas fa-plus"></i> Agregar nueva opción';
    btnAgregar.onclick = () => agregarNuevoCuentaCon();
    container.appendChild(btnAgregar);
}

// ==================== CONFIGURAR BOTONES AGREGAR ====================
function configurarBotonesAgregar() {
    const selectMuestra = document.getElementById('muestra');
    if (selectMuestra) {
        selectMuestra.addEventListener('change', function(e) {
            if (e.target.value === '__NUEVO__') agregarNuevaMuestra();
        });
    }
    
    const selectResultado = document.getElementById('resultado');
    if (selectResultado) {
        selectResultado.addEventListener('change', function(e) {
            if (e.target.value === '__NUEVO__') agregarNuevoResultado();
        });
    }
}

async function agregarNuevaMuestra() {
    const nuevoTipo = prompt('Ingrese el nuevo tipo de muestra:');
    if (!nuevoTipo || nuevoTipo.trim() === '') {
        document.getElementById('muestra').value = '';
        return;
    }
    
    try {
        const resultado = await window.apiService.agregarTipoMuestra(nuevoTipo.trim());
        if (resultado.success) {
            alert('✅ Tipo de muestra agregado exitosamente');
            await cargarMaestrosMedicos();
            document.getElementById('muestra').value = nuevoTipo.trim();
        } else {
            alert('❌ Error: ' + resultado.message);
            document.getElementById('muestra').value = '';
        }
    } catch (error) {
        alert('❌ Error al agregar tipo de muestra');
        document.getElementById('muestra').value = '';
    }
}

async function agregarNuevoResultado() {
    const nuevoTipo = prompt('Ingrese el nuevo tipo de resultado:');
    if (!nuevoTipo || nuevoTipo.trim() === '') {
        document.getElementById('resultado').value = '';
        return;
    }
    
    try {
        const resultado = await window.apiService.agregarTipoResultado(nuevoTipo.trim());
        if (resultado.success) {
            alert('✅ Tipo de resultado agregado exitosamente');
            await cargarMaestrosMedicos();
            document.getElementById('resultado').value = nuevoTipo.trim();
        } else {
            alert('❌ Error: ' + resultado.message);
            document.getElementById('resultado').value = '';
        }
    } catch (error) {
        alert('❌ Error al agregar tipo de resultado');
        document.getElementById('resultado').value = '';
    }
}

async function agregarNuevoCuentaCon() {
    const nuevoTipo = prompt('Ingrese la nueva opción de "Ya cuenta con":');
    if (!nuevoTipo || nuevoTipo.trim() === '') return;
    
    try {
        const resultado = await window.apiService.agregarTipoCuentaCon(nuevoTipo.trim());
        if (resultado.success) {
            alert('✅ Opción agregada exitosamente');
            await cargarMaestrosMedicos();
        } else {
            alert('❌ Error: ' + resultado.message);
        }
    } catch (error) {
        alert('❌ Error al agregar opción');
    }
}

// ==================== CONFIGURAR ARCHIVOS (NUEVO) ====================
function configurarArchivos() {
    console.log('📎 Configurando manejo de archivos...');
    
    // FOTO DEL PACIENTE
    const inputFoto = document.getElementById('fotoPaciente');
    if (inputFoto) {
        inputFoto.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                alert('⚠️ Por favor seleccione una imagen válida');
                this.value = '';
                return;
            }
            
            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('⚠️ La imagen no debe superar los 5MB');
                this.value = '';
                return;
            }
            
            archivosSeleccionados.foto = file;
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
            
            // Validar cada archivo
            for (let file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`⚠️ El archivo ${file.name} supera los 5MB`);
                    this.value = '';
                    return;
                }
            }
            
            archivosSeleccionados.documentos = files;
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
            <button type="button" class="remove-file" onclick="eliminarFoto()" 
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
            <button type="button" class="remove-file" onclick="eliminarDocumento(${index})" 
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
window.eliminarFoto = function() {
    archivosSeleccionados.foto = null;
    const inputFoto = document.getElementById('fotoPaciente');
    if (inputFoto) inputFoto.value = '';
    const container = document.getElementById('fotoPreview');
    if (container) container.innerHTML = '';
    console.log('🗑️ Foto eliminada');
};

window.eliminarDocumento = function(index) {
    const inputDocs = document.getElementById('documentos');
    if (!inputDocs) return;
    
    const dt = new DataTransfer();
    const files = Array.from(inputDocs.files);
    
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    
    inputDocs.files = dt.files;
    archivosSeleccionados.documentos = files;
    mostrarDocumentosSeleccionados(files);
    console.log('🗑️ Documento eliminado, quedan:', files.length);
};

// ==================== CONFIGURAR FORMULARIO ====================
function configurarFormulario() {
    const form = document.getElementById('formNuevoPaciente');
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarPaciente();
    });
    
    console.log('✅ Formulario configurado');
}

// ==================== GUARDAR PACIENTE (CON ARCHIVOS) ====================
async function guardarPaciente() {
    try {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        
        // 1. OBTENER DATOS DEL FORMULARIO
        const formData = obtenerDatosFormulario();
        
        // 2. VALIDAR DATOS
        if (!validarDatos(formData)) {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            return;
        }
        
        console.log('📤 Enviando datos del paciente:', formData);
        
        // 3. REGISTRAR PACIENTE (SIN ARCHIVOS PRIMERO)
        const resultado = await window.apiService.registrarPaciente(formData);
        
        if (!resultado.success) {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            mostrarError('❌ ' + (resultado.message || 'Error al registrar paciente'));
            return;
        }
        
        const pacienteId = resultado.data.id;
        console.log('✅ Paciente registrado con ID:', pacienteId);
        
        // 4. SUBIR ARCHIVOS SI HAY
        let fotoUrl = '';
        let archivosUrls = '';
        
        if (archivosSeleccionados.foto || archivosSeleccionados.documentos.length > 0) {
            console.log('📤 Subiendo archivos...');
            
            // Subir foto
            if (archivosSeleccionados.foto) {
                console.log('📷 Subiendo foto...');
                const resultadoFoto = await window.apiService.subirArchivo(
                    archivosSeleccionados.foto, 
                    pacienteId
                );
                
                if (resultadoFoto.success) {
                    fotoUrl = resultadoFoto.data.file_url;
                    console.log('✅ Foto subida:', fotoUrl);
                }
            }
            
            // Subir documentos
            if (archivosSeleccionados.documentos.length > 0) {
                console.log('📄 Subiendo documentos...');
                const urlsDocumentos = [];
                
                for (let doc of archivosSeleccionados.documentos) {
                    const resultadoDoc = await window.apiService.subirArchivo(doc, pacienteId);
                    if (resultadoDoc.success) {
                        urlsDocumentos.push(resultadoDoc.data.file_url);
                    }
                }
                
                archivosUrls = urlsDocumentos.join(', ');
                console.log('✅ Documentos subidos:', urlsDocumentos.length);
            }
            
            // 5. ACTUALIZAR URLs EN EL REGISTRO
            if (fotoUrl || archivosUrls) {
                console.log('🔗 Actualizando URLs en el registro...');
                await window.apiService.actualizarUrls(pacienteId, fotoUrl, archivosUrls);
            }
        }
        
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        
        alert(`✅ Paciente registrado exitosamente\n\nID: ${pacienteId}\n\n` +
              `Foto: ${fotoUrl ? 'Sí' : 'No'}\n` +
              `Documentos: ${archivosSeleccionados.documentos.length}`);
        
        limpiarFormulario();
        
        setTimeout(() => {
            if (confirm('¿Desea registrar otro paciente?')) {
                // Formulario ya limpio
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al guardar paciente:', error);
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        mostrarError('Error al guardar el paciente.\n\n' + error.message);
    }
}

// ==================== OBTENER DATOS DEL FORMULARIO ====================
function obtenerDatosFormulario() {
    const checkboxes = document.querySelectorAll('input[name="cuentaCon"]:checked');
    const cuentaConArray = Array.from(checkboxes).map(cb => cb.value);
    const cuentaConString = cuentaConArray.join(', ');
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    return {
        nombres_apellidos: document.getElementById('nombres_apellidos').value.trim(),
        edad: document.getElementById('edad').value,
        dni: document.getElementById('dni').value.trim(),
        celular: document.getElementById('celular').value.trim(),
        celular_opcional: document.getElementById('celular_opcional').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        muestra: document.getElementById('muestra').value,
        resultado: document.getElementById('resultado').value,
        observacion: document.getElementById('observacion').value.trim(),
        tratamiento_particular: document.getElementById('tratamiento_particular').value.trim(),
        ya_cuenta_con: cuentaConString,
        registrado_por: usuario.usuario || usuario.nombre_completo || usuario.nombre,
        foto_url: '',
        archivos_urls: ''
    };
}

// ==================== VALIDAR DATOS ====================
function validarDatos(data) {
    if (!data.nombres_apellidos) {
        mostrarError('⚠️ El nombre es obligatorio');
        document.getElementById('nombres_apellidos').focus();
        return false;
    }
    
    if (!data.edad || data.edad < 0 || data.edad > 150) {
        mostrarError('⚠️ La edad es obligatoria y debe ser válida (0-150)');
        document.getElementById('edad').focus();
        return false;
    }
    
    if (!data.celular) {
        mostrarError('⚠️ El celular es obligatorio');
        document.getElementById('celular').focus();
        return false;
    }
    
    if (!data.muestra || data.muestra === '__NUEVO__') {
        mostrarError('⚠️ Debe seleccionar un tipo de muestra válido');
        document.getElementById('muestra').focus();
        return false;
    }
    
    if (!data.resultado || data.resultado === '__NUEVO__') {
        mostrarError('⚠️ Debe seleccionar un resultado válido');
        document.getElementById('resultado').focus();
        return false;
    }
    
    return true;
}

// ==================== LIMPIAR FORMULARIO ====================
function limpiarFormulario() {
    const form = document.getElementById('formNuevoPaciente');
    if (form) form.reset();
    
    const checkboxes = document.querySelectorAll('input[name="cuentaCon"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    // Limpiar archivos
    archivosSeleccionados = { foto: null, documentos: [] };
    const fotoPreview = document.getElementById('fotoPreview');
    if (fotoPreview) fotoPreview.innerHTML = '';
    const docsPreview = document.getElementById('documentosPreview');
    if (docsPreview) docsPreview.innerHTML = '';
    
    console.log('🧹 Formulario limpiado completamente');
}

// ==================== MOSTRAR MENSAJES ====================
function mostrarError(mensaje) {
    alert(mensaje);
}

console.log('✅ nuevo-paciente-logic.js CON ARCHIVOS cargado correctamente');