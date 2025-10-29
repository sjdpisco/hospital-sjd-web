// nuevo-paciente.js - Gestión de Nuevo Paciente

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
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('formNuevoPaciente')) {
        inicializarFormularioNuevo();
    }
});

async function inicializarFormularioNuevo() {
    console.log('Inicializando formulario de nuevo paciente...');
    
    // Cargar maestros médicos
    await cargarMaestrosMedicos();
    
    // Configurar eventos del formulario
    configurarEventosFormulario();
    
    // Configurar archivos
    configurarArchivos();
}

// ==================== CARGAR MAESTROS MÉDICOS ====================
async function cargarMaestrosMedicos() {
    try {
        console.log('Cargando maestros médicos...');
        
        // Llamar al endpoint de maestros
        const response = await fetch('http://localhost/hospital-api/maestros_medicos.php');
        const data = await response.json();
        
        if (data.success) {
            maestrosMedicos = data.data;
            console.log('Maestros cargados:', maestrosMedicos);
            
            // Llenar los selectores
            llenarSelectMuestras();
            llenarSelectResultados();
            llenarCheckboxesCuentaCon();
        } else {
            console.error('Error al cargar maestros:', data.message);
            mostrarError('No se pudieron cargar las opciones médicas');
        }
    } catch (error) {
        console.error('Error en cargarMaestrosMedicos:', error);
        mostrarError('Error de conexión al cargar opciones');
    }
}

function llenarSelectMuestras() {
    const select = document.getElementById('muestra');
    select.innerHTML = '<option value="">Seleccione tipo de muestra...</option>';
    
    maestrosMedicos.muestras.forEach(muestra => {
        const option = document.createElement('option');
        option.value = muestra;
        option.textContent = muestra;
        select.appendChild(option);
    });
}

function llenarSelectResultados() {
    const select = document.getElementById('resultado');
    select.innerHTML = '<option value="">Seleccione resultado...</option>';
    
    maestrosMedicos.resultados.forEach(resultado => {
        const option = document.createElement('option');
        option.value = resultado;
        option.textContent = resultado;
        select.appendChild(option);
    });
}

function llenarCheckboxesCuentaCon() {
    const container = document.getElementById('cuentaConContainer');
    container.innerHTML = '';
    
    if (maestrosMedicos.cuentaCon.length === 0) {
        container.innerHTML = '<p class="loading">No hay opciones disponibles</p>';
        return;
    }
    
    maestrosMedicos.cuentaCon.forEach(opcion => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'cuentaCon[]';
        checkbox.value = opcion;
        
        const span = document.createElement('span');
        span.textContent = opcion;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

// ==================== CONFIGURAR EVENTOS ====================
function configurarEventosFormulario() {
    // Formulario principal
    const form = document.getElementById('formNuevoPaciente');
    form.addEventListener('submit', guardarNuevoPaciente);
    
    // Checkbox de tratamiento
    const checkTratamiento = document.getElementById('checkTratamiento');
    const tratamientoContainer = document.getElementById('tratamientoContainer');
    
    checkTratamiento.addEventListener('change', function() {
        tratamientoContainer.style.display = this.checked ? 'block' : 'none';
        const textarea = document.getElementById('tratamientoParticular');
        textarea.required = this.checked;
    });
    
    // Validación de DNI
    document.getElementById('dni').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').substring(0, 8);
    });
    
    // Validación de celulares
    ['celular', 'celularOpcional'].forEach(id => {
        document.getElementById(id).addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').substring(0, 9);
        });
    });
}

// ==================== CONFIGURAR ARCHIVOS ====================
function configurarArchivos() {
    // Foto del paciente
    const inputFoto = document.getElementById('fotoPaciente');
    inputFoto.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione una imagen válida');
                this.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB');
                this.value = '';
                return;
            }
            
            archivosSeleccionados.foto = file;
            mostrarVistaPrevia(file, 'fotoPreview', true);
        }
    });
    
    // Documentos adicionales
    const inputDocs = document.getElementById('documentos');
    inputDocs.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        if (files.length > 5) {
            alert('Máximo 5 documentos permitidos');
            this.value = '';
            return;
        }
        
        // Validar cada archivo
        for (let file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert(`El archivo ${file.name} supera los 5MB`);
                this.value = '';
                return;
            }
        }
        
        archivosSeleccionados.documentos = files;
        mostrarDocumentosSeleccionados(files);
    });
}

function mostrarVistaPrevia(file, containerId, esImagen) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (esImagen) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Vista previa">
                <button type="button" class="remove-file" onclick="eliminarFoto()">
                    <i class="fas fa-times"></i>
                </button>
                <p>${file.name}</p>
            `;
            container.appendChild(div);
        };
        reader.readAsDataURL(file);
    }
}

function mostrarDocumentosSeleccionados(files) {
    const container = document.getElementById('documentosPreview');
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        
        const icon = obtenerIconoArchivo(file.name);
        
        div.innerHTML = `
            <i class="fas ${icon}" style="font-size: 40px; color: var(--primary);"></i>
            <p>${file.name}</p>
            <small>${formatearTamano(file.size)}</small>
            <button type="button" class="remove-file" onclick="eliminarDocumento(${index})">
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

function eliminarFoto() {
    archivosSeleccionados.foto = null;
    document.getElementById('fotoPaciente').value = '';
    document.getElementById('fotoPreview').innerHTML = '';
}

function eliminarDocumento(index) {
    const inputDocs = document.getElementById('documentos');
    const dt = new DataTransfer();
    const files = Array.from(inputDocs.files);
    
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    
    inputDocs.files = dt.files;
    archivosSeleccionados.documentos = files;
    mostrarDocumentosSeleccionados(files);
}

// ==================== GUARDAR PACIENTE ====================
async function guardarNuevoPaciente(e) {
    e.preventDefault();
    
    if (!confirm('¿Está seguro de registrar este paciente?')) {
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardar');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;
    
    try {
        // Recopilar datos del formulario
        const formData = new FormData();
        
        // Datos personales
        formData.append('nombres', document.getElementById('nombres').value.trim());
        formData.append('dni', document.getElementById('dni').value.trim());
        formData.append('edad', document.getElementById('edad').value);
        formData.append('celular', document.getElementById('celular').value.trim());
        formData.append('celular_opcional', document.getElementById('celularOpcional').value.trim());
        formData.append('direccion', document.getElementById('direccion').value.trim());
        
        // Datos médicos
        formData.append('muestra', document.getElementById('muestra').value);
        formData.append('resultado', document.getElementById('resultado').value);
        formData.append('observacion', document.getElementById('observacion').value.trim());
        
        // Ya cuenta con
        const cuentaCon = [];
        document.querySelectorAll('input[name="cuentaCon[]"]:checked').forEach(cb => {
            cuentaCon.push(cb.value);
        });
        formData.append('cuenta_con', JSON.stringify(cuentaCon));
        
        // Tratamiento particular
        const tieneTratamiento = document.getElementById('checkTratamiento').checked;
        formData.append('tiene_tratamiento', tieneTratamiento ? '1' : '0');
        if (tieneTratamiento) {
            formData.append('tratamiento_particular', 
                document.getElementById('tratamientoParticular').value.trim());
        }
        
        // Usuario registrador
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        formData.append('usuario_registrador', usuario.nombre);
        
        // Archivos
        if (archivosSeleccionados.foto) {
            formData.append('foto', archivosSeleccionados.foto);
        }
        
        archivosSeleccionados.documentos.forEach((doc, index) => {
            formData.append(`documento_${index}`, doc);
        });
        
        // Mostrar progreso
        mostrarProgreso(0, 'Enviando datos...');
        
        // Enviar al servidor
        const response = await fetch('http://localhost/hospital-api/registrar_paciente.php', {
            method: 'POST',
            body: formData
        });
        
        const resultado = await response.json();
        
        ocultarProgreso();
        
        if (resultado.success) {
            alert('✅ Paciente registrado exitosamente\n\nID: ' + resultado.paciente_id);
            
            // Mostrar botón de PDF
            document.getElementById('btnGenerarPDF').style.display = 'inline-flex';
            document.getElementById('btnGenerarPDF').onclick = () => {
                generarPDFPaciente(resultado.paciente_id);
            };
            
            // Limpiar formulario
            setTimeout(() => {
                if (confirm('¿Desea registrar otro paciente?')) {
                    limpiarFormulario();
                } else {
                    cambiarSeccion('lista');
                }
            }, 1000);
            
        } else {
            alert('❌ Error: ' + resultado.message);
        }
        
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error de conexión al guardar paciente');
        ocultarProgreso();
    } finally {
        btnGuardar.innerHTML = textoOriginal;
        btnGuardar.disabled = false;
    }
}

// ==================== UTILIDADES ====================
function limpiarFormulario() {
    document.getElementById('formNuevoPaciente').reset();
    archivosSeleccionados = { foto: null, documentos: [] };
    document.getElementById('fotoPreview').innerHTML = '';
    document.getElementById('documentosPreview').innerHTML = '';
    document.getElementById('tratamientoContainer').style.display = 'none';
    document.getElementById('btnGenerarPDF').style.display = 'none';
}

function mostrarProgreso(porcentaje, mensaje) {
    const container = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    
    container.style.display = 'block';
    bar.style.width = porcentaje + '%';
    bar.textContent = porcentaje + '%';
    text.textContent = mensaje;
}

function ocultarProgreso() {
    document.getElementById('progressContainer').style.display = 'none';
}

function mostrarError(mensaje) {
    alert('⚠️ ' + mensaje);
}

async function generarPDFPaciente(pacienteId) {
    alert('🔄 Generando PDF del paciente...\n\nEsta función estará disponible próximamente.');
    // Aquí implementarás la generación de PDF
}
