// Verificar sesión
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
    window.location.href = 'index.html';
} else {
    document.getElementById('nombreUsuario').textContent = usuario.nombre_completo;
}

// Cerrar sesión
document.getElementById('btnCerrarSesion').addEventListener('click', function() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
});

// Cargar tipos
async function cargarTipos() {
    try {
        // Tipos de muestra
        const dataMuestra = await ApiService.obtenerTiposMuestra();
        if (dataMuestra.success) {
            const select = document.getElementById('muestra');
            dataMuestra.data.forEach(tipo => {
                select.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
        // Tipos de resultado
        const dataResultado = await ApiService.obtenerTiposResultado();
        if (dataResultado.success) {
            const select = document.getElementById('resultado');
            dataResultado.data.forEach(tipo => {
                select.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
        
        // Tipos de cuenta con
        const dataCuentaCon = await ApiService.obtenerTiposCuentaCon();
        if (dataCuentaCon.success) {
            const select = document.getElementById('ya_cuenta_con');
            dataCuentaCon.data.forEach(tipo => {
                select.innerHTML += `<option value="${tipo.tipo}">${tipo.tipo}</option>`;
            });
        }
    } catch (error) {
        console.error('Error al cargar tipos:', error);
    }
}

// Guardar registro
document.getElementById('formNuevoRegistro').addEventListener('submit', async function(e) {
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
            registrado_por: usuario.usuario
        };
        
        const data = await ApiService.registrarPaciente(datoPaciente);
        
        if (data.success) {
            alert('✅ Paciente registrado exitosamente con ID: ' + data.data.id);
            document.getElementById('formNuevoRegistro').reset();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Registro';
    }
});

// Cargar tipos al iniciar
cargarTipos();
