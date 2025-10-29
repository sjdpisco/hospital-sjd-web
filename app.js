// app.js - Sistema de Gestión Hospitalaria

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado');
    
    // Verificar si estamos en la página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Formulario de login encontrado');
        loginForm.addEventListener('submit', handleLogin);
    }
});

// ==================== LOGIN ====================
async function handleLogin(e) {
    e.preventDefault();
    console.log('Formulario enviado');
    
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('Usuario:', usuario);
    
    if (!usuario || !password) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Mostrar indicador de carga
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Ingresando...';
    btnSubmit.disabled = true;
    
    try {
        console.log('Intentando login...');
        
        // Llamar a la función login de api-service.js
        const resultado = await login(usuario, password);
        
        console.log('Resultado:', resultado);
        
        if (resultado.success) {
            // Guardar datos del usuario
            localStorage.setItem('usuario', JSON.stringify({
                nombre: usuario,
                rol: resultado.rol || 'usuario',
                loginTime: new Date().toISOString()
            }));
            
            alert('¡Login exitoso! Bienvenido ' + usuario);
            
            // Redirigir al dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert(resultado.message || 'Usuario o contraseña incorrectos');
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error de conexión: ' + error.message);
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
}

// ==================== CERRAR SESIÓN ====================
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}
