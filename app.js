// Variables globales
let usuarioActual = null;
let pacienteSeleccionado = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    configurarEventos();
});

function verificarSesion() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
        mostrarDashboard();
    } else {
        mostrarLogin();
    }
}

function configurarEventos() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Botón cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }

    // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const seccion = this.dataset.seccion;
            mostrarSeccion(seccion);
        });
    });

    // Formulario nuevo registro
    const formNuevoRegistro = document.getElementById('formNuevoRegistro');
    if (formNuevoRegistro) {
        formNuevoRegistro.addEventListener('submit', handleNuevoRegistro);
    }

    // Formulario búsqueda
    const formBusqueda = document.getElementById('formBusqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', handleBusqueda);
    }

    // Formulario seguimiento
    const formSeguimiento = document.getElementById('formSeguimiento');
    if (formSeguimiento) {
        formSeguimiento.addEventListener('submit', handleSeguimiento);
    }
}

// ==================== LOGIN ====================
function mostrarLogin() {
    document.getElementById('loginSection').classList.remove('d-none');
    document.getElementById('dashboardSection').classList.add('d-none');
}

function mostrarDashboard() {
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('dashboardSection').classList.remove('d-none');
    
    // Mostrar nombre de usuario
    if (usuarioActual) {
        document.getElementById('nombreUsuario').textContent = usuarioActual.nombre_completo;
        document.getElementById('rolUsuario').textContent = usuarioActual.rol;
    }
    
    // Mostrar sección de inicio por defecto
    mostrarSeccion('inicio');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const contraseña = document.getElementById('contraseña').value;
    const btnLogin = document.getElementById('btnLogin');
    
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';
    
    try {
        const data = await ApiService.login(usuario, contraseña);
        
        if (data.success) {
            usuarioActual = data.data;
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
            mostrarAlerta('¡Bienvenido ' + usuarioActual.nombre_completo + '!', 'success');
            setTimeout(() => {
                mostrarDashboard();
            }, 1000);
        } else {
            mostrarAlerta(data.message, 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión: ' + error.message, 'danger');
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Ingresar';
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    usuarioActual = null;
    pacienteSeleccionado = null;
    mostrarLogin();
    mostrarAlerta('Sesión cerrada correctamente', 'info');
}

// ==================== NAVEGACIÓN ====================
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Remover clase activa de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccionElement = document.getElementById(seccion + 'Section');
    if (seccionElement) {
        seccionElement.classList.remove('d-none');
    }
    
    // Activar botón correspondiente
    const btnActivo = document.querySelector(`[data-seccion="${seccion}"]`);
    if (btnActivo) {
        btnActivo.classList.add('active');
    }
    
    // Cargar datos según la sección
    if (seccion === 'nuevoRegistro') {
        cargarTiposParaRegistro();
    } else if (seccion === 'listaPacientes') {
        cargarListaPacientes();
    }
}

// ==================== NUEVO REGISTRO ====================
async function cargarTiposParaRegistro() {
    try {
        // Cargar tipos de muestra
        const dataMuestra = await ApiService.obtenerTiposMuestra();
        if (dataMuestra.success) {
            const selectMuestra = document.getElementById('muestra');
            selectMuestra.innerHTML = '<option value="">Seleccione...</option>';
            dataMuestra.data.forEach(tipo => {
                selectMuestra.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
        // Cargar tipos de resultado
        const dataResultado = await ApiService.obtenerTiposResultado();
        if (dataResultado.success) {
            const selectResultado = document.getElementById('resultado');
            selectResultado.innerHTML = '<option value="">Seleccione...</option>';
            dataResultado.data.forEach(tipo => {
                selectResultado.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
        // Cargar tipos de "cuenta con"
        const dataCuentaCon = await ApiService.obtenerTiposCuentaCon();
        if (dataCuentaCon.success) {
            const selectCuentaCon = document.getElementById('ya_cuenta_con');
            selectCuentaCon.innerHTML = '<option value="">Seleccione...</option>';
            dataCuentaCon.data.forEach(tipo => {
                selectCuentaCon.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
    } catch (error) {
        console.error('Error al cargar tipos:', error);
        mostrarAlerta('Error al cargar opciones del formulario', 'warning');
    }
}

async function handleNuevoRegistro(e) {
    e.preventDefault();
    
    const btnGuardar = document.getElementById('btnGuardarRegistro');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        const datoPaciente = {
            nombres_apellidos: document.getElementById('nombres_apellidos').value,
            edad: document.getElementById('edad').value,
            direccion: document.getElementById('direccion').value,
            dni: document.getElementById('dni').value,
            celular: document.getElementById('celular').value,
            celular_opcional: document.getElementById('celular_opcional').value,
            muestra: document.getElementById('muestra').value,
            resultado: document.getElementById('resultado').value,
            observacion: document.getElementById('observacion').value,
            tratamiento_particular: document.getElementById('tratamiento_particular').value,
            ya_cuenta_con: document.getElementById('ya_cuenta_con').value,
            foto_url: '',
            archivos_urls: '',
            registrado_por: usuarioActual.usuario
        };
        
        const data = await ApiService.registrarPaciente(datoPaciente);
        
        if (data.success) {
            mostrarAlerta('✅ Paciente registrado exitosamente con ID: ' + data.data.id, 'success');
            document.getElementById('formNuevoRegistro').reset();
        } else {
            mostrarAlerta('Error: ' + data.message, 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión: ' + error.message, 'danger');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Registro';
    }
}

// ==================== BÚSQUEDA ====================
async function handleBusqueda(e) {
    e.preventDefault();
    
    const criterio = document.getElementById('criterioBusqueda').value;
    const btnBuscar = document.getElementById('btnBuscar');
    
    btnBuscar.disabled = true;
    btnBuscar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Buscando...';
    
    try {
        const data = await ApiService.buscarPacientes(criterio);
        
        if (data.success) {
            mostrarResultadosBusqueda(data.data);
        } else {
            mostrarAlerta('Error: ' + data.message, 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión: ' + error.message, 'danger');
    } finally {
        btnBuscar.disabled = false;
        btnBuscar.textContent = 'Buscar';
    }
}

function mostrarResultadosBusqueda(pacientes) {
    const container = document.getElementById('resultadosBusqueda');
    
    if (pacientes.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No se encontraron pacientes</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead><tr>';
    html += '<th>ID</th>';
    html += '<th>Nombres y Apellidos</th>';
    html += '<th>DNI</th>';
    html += '<th>Edad</th>';
    html += '<th>Celular</th>';
    html += '<th>Última Fecha</th>';
    html += '<th>Días</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';
    
    pacientes.forEach(paciente => {
        const pacienteStr = JSON.stringify(paciente).replace(/"/g, '&quot;');
        html += '<tr>';
        html += `<td>${paciente.id}</td>`;
        html += `<td>${paciente.nombres_apellidos}</td>`;
        html += `<td>${paciente.dni}</td>`;
        html += `<td>${paciente.edad}</td>`;
        html += `<td>${paciente.celular}</td>`;
        html += `<td>${paciente.ultima_fecha}</td>`;
        html += `<td>${paciente.dias_desde_ultimo_registro}</td>`;
        html += `<td>
            <button class="btn btn-sm btn-primary" onclick='verDetallePaciente(${pacienteStr})'>
                <i class="bi bi-eye"></i> Ver
            </button>
            <button class="btn btn-sm btn-success" onclick='abrirSeguimiento(${pacienteStr})'>
                <i class="bi bi-plus-circle"></i> Seguimiento
            </button>
        </td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function verDetallePaciente(paciente) {
    pacienteSeleccionado = paciente;
    
    let html = `
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="bi bi-person-circle"></i> Información del Paciente</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>ID:</strong> ${paciente.id}</p>
                        <p><strong>Nombres y Apellidos:</strong> ${paciente.nombres_apellidos}</p>
                        <p><strong>DNI:</strong> ${paciente.dni}</p>
                        <p><strong>Edad:</strong> ${paciente.edad}</p>
                        <p><strong>Dirección:</strong> ${paciente.direccion}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Celular:</strong> ${paciente.celular}</p>
                        <p><strong>Celular Opcional:</strong> ${paciente.celular_opcional || 'N/A'}</p>
                        <p><strong>Muestra:</strong> ${paciente.muestra}</p>
                        <p><strong>Resultado:</strong> ${paciente.resultado}</p>
                        <p><strong>Cuenta con:</strong> ${paciente.ya_cuenta_con || 'N/A'}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <p><strong>Observación:</strong> ${paciente.observacion || 'N/A'}</p>
                        <p><strong>Tratamiento Particular:</strong> ${paciente.tratamiento_particular || 'N/A'}</p>
                        <p><strong>Registrado por:</strong> ${paciente.registrado_por}</p>
                        <p><strong>Fecha de Registro:</strong> ${paciente.fecha_registro}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear modal si no existe
    let modal = document.getElementById('modalDetallePaciente');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modalDetallePaciente';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalle del Paciente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="contenidoDetallePaciente"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('contenidoDetallePaciente').innerHTML = html;
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function abrirSeguimiento(paciente) {
    pacienteSeleccionado = paciente;
    mostrarSeccion('seguimiento');
    
    // Llenar información del paciente en el formulario de seguimiento
    document.getElementById('seguimientoNombres').value = paciente.nombres_apellidos;
    document.getElementById('seguimientoEdad').value = paciente.edad;
    document.getElementById('seguimientoDireccion').value = paciente.direccion;
    document.getElementById('seguimientoDni').value = paciente.dni;
    document.getElementById('seguimientoCelular').value = paciente.celular;
    
    // Cargar tipos para seguimiento
    cargarTiposParaSeguimiento();
    
    // Cargar historial
    cargarHistorialPaciente(paciente.id);
}

// ==================== SEGUIMIENTO ====================
async function cargarTiposParaSeguimiento() {
    try {
        // Cargar tipos de muestra
        const dataMuestra = await ApiService.obtenerTiposMuestra();
        if (dataMuestra.success) {
            const selectMuestra = document.getElementById('seguimientoMuestra');
            selectMuestra.innerHTML = '<option value="">Seleccione...</option>';
            dataMuestra.data.forEach(tipo => {
                selectMuestra.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
        // Cargar tipos de resultado
        const dataResultado = await ApiService.obtenerTiposResultado();
        if (dataResultado.success) {
            const selectResultado = document.getElementById('seguimientoResultado');
            selectResultado.innerHTML = '<option value="">Seleccione...</option>';
            dataResultado.data.forEach(tipo => {
                selectResultado.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
        // Cargar tipos de "cuenta con"
        const dataCuentaCon = await ApiService.obtenerTiposCuentaCon();
        if (dataCuentaCon.success) {
            const selectCuentaCon = document.getElementById('seguimientoCuentaCon');
            selectCuentaCon.innerHTML = '<option value="">Seleccione...</option>';
            dataCuentaCon.data.forEach(tipo => {
                selectCuentaCon.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
    } catch (error) {
        console.error('Error al cargar tipos:', error);
    }
}

async function cargarHistorialPaciente(idPaciente) {
    try {
        const data = await ApiService.obtenerHistorial(idPaciente);
        
        if (data.success) {
            mostrarHistorial(data.data);
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
        mostrarAlerta('Error al cargar historial', 'warning');
    }
}

function mostrarHistorial(historial) {
    const container = document.getElementById('historialPaciente');
    
    if (historial.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay historial disponible</div>';
        return;
    }
    
    let html = '<div class="timeline">';
    
    historial.forEach((registro, index) => {
        const tipoClass = registro.tipo_registro === 'INICIAL' ? 'bg-primary' : 'bg-success';
        html += `
            <div class="card mb-3 shadow-sm">
                <div class="card-header ${tipoClass} text-white">
                    <strong><i class="bi bi-calendar-event"></i> ${registro.tipo_registro}</strong> 
                    <span class="float-end">${registro.fecha_registro}</span>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Muestra:</strong> ${registro.muestra}</p>
                            <p><strong>Resultado:</strong> ${registro.resultado}</p>
                            <p><strong>Cuenta con:</strong> ${registro.ya_cuenta_con || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Observación:</strong> ${registro.observacion || 'N/A'}</p>
                            <p><strong>Tratamiento:</strong> ${registro.tratamiento_particular || 'N/A'}</p>
                            <p><strong>Registrado por:</strong> ${registro.registrado_por}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

async function handleSeguimiento(e) {
    e.preventDefault();
    
    if (!pacienteSeleccionado) {
        mostrarAlerta('No hay paciente seleccionado', 'warning');
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardarSeguimiento');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        const datoSeguimiento = {
            id_paciente: pacienteSeleccionado.id,
            nombres_apellidos: document.getElementById('seguimientoNombres').value,
            edad: document.getElementById('seguimientoEdad').value,
            direccion: document.getElementById('seguimientoDireccion').value,
            dni: document.getElementById('seguimientoDni').value,
            celular: document.getElementById('seguimientoCelular').value,
            celular_opcional: document.getElementById('seguimientoCelularOpcional').value,
            muestra: document.getElementById('seguimientoMuestra').value,
            resultado: document.getElementById('seguimientoResultado').value,
            observacion: document.getElementById('seguimientoObservacion').value,
            tratamiento_particular: document.getElementById('seguimientoTratamiento').value,
            ya_cuenta_con: document.getElementById('seguimientoCuentaCon').value,
            registrado_por: usuarioActual.usuario
        };
        
        const data = await ApiService.agregarSeguimiento(datoSeguimiento);
        
        if (data.success) {
            mostrarAlerta('✅ Seguimiento agregado exitosamente', 'success');
            cargarHistorialPaciente(pacienteSeleccionado.id);
            // Limpiar solo los campos editables
            document.getElementById('seguimientoMuestra').value = '';
            document.getElementById('seguimientoResultado').value = '';
            document.getElementById('seguimientoObservacion').value = '';
            document.getElementById('seguimientoTratamiento').value = '';
            document.getElementById('seguimientoCuentaCon').value = '';
            document.getElementById('seguimientoCelularOpcional').value = '';
        } else {
            mostrarAlerta('Error: ' + data.message, 'danger');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión: ' + error.message, 'danger');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Seguimiento';
    }
}

// ==================== LISTA DE PACIENTES ====================
async function cargarListaPacientes() {
    const container = document.getElementById('listaPacientesContainer');
    container.innerHTML = '<div class="text-center"><div class="spinner-border"></div><p>Cargando pacientes...</p></div>';
    
    try {
        const data = await ApiService.listarTodosPacientes();
        
        if (data.success) {
            mostrarTablaPacientes(data.data);
        } else {
            container.innerHTML = '<div class="alert alert-danger">Error al cargar pacientes</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

function mostrarTablaPacientes(pacientes) {
    const container = document.getElementById('listaPacientesContainer');
    
    if (pacientes.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay pacientes registrados</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped table-hover">';
    html += '<thead class="table-dark"><tr>';
    html += '<th>ID</th>';
    html += '<th>Nombres y Apellidos</th>';
    html += '<th>DNI</th>';
    html += '<th>Edad</th>';
    html += '<th>Celular</th>';
    html += '<th>Resultado</th>';
    html += '<th>Fecha Registro</th>';
    html += '<th>Estado</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';
    
    pacientes.forEach(paciente => {
        const estadoBadge = paciente.estado === 'ACTIVO' 
            ? '<span class="badge bg-success">ACTIVO</span>' 
            : '<span class="badge bg-danger">INACTIVO</span>';
        
        const pacienteStr = JSON.stringify(paciente).replace(/"/g, '&quot;');
        
        html += '<tr>';
        html += `<td>${paciente.id}</td>`;
        html += `<td>${paciente.nombres_apellidos}</td>`;
        html += `<td>${paciente.dni}</td>`;
        html += `<td>${paciente.edad}</td>`;
        html += `<td>${paciente.celular}</td>`;
        html += `<td>${paciente.resultado}</td>`;
        html += `<td>${paciente.fecha_registro}</td>`;
        html += `<td>${estadoBadge}</td>`;
        html += `<td>
            <button class="btn btn-sm btn-primary" onclick='verDetallePaciente(${pacienteStr})'>
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-success" onclick='abrirSeguimiento(${pacienteStr})'>
                <i class="bi bi-plus-circle"></i>
            </button>
        </td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ==================== UTILIDADES ====================
function mostrarAlerta(mensaje, tipo) {
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        // Crear contenedor si no existe
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '9999';
        alertContainer.style.maxWidth = '400px';
        document.body.appendChild(alertContainer);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} alert-dismissible fade show shadow`;
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
