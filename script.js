// Variables globales
let proyectos = JSON.parse(localStorage.getItem('proyectos')) || [];
let comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
let usuarioCreador = { username: "admin", password: "admin123" }; // En una aplicación real, esto se haría con un sistema de autenticación seguro
let sesionIniciada = false;

// Elementos del DOM
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('login-form');
const panelCreador = document.getElementById('panel-creador');
const cerrarPanelBtn = document.getElementById('cerrar-panel');
const proyectosLista = document.getElementById('proyectos-lista');
const comentariosLista = document.getElementById('comentarios-lista');
const comentarioForm = document.getElementById('comentario-form');
const proyectoSelector = document.getElementById('proyecto-selector');

// Funciones para los tabs del panel de creador
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarProyectos();
    cargarComentarios();
    actualizarSelectorProyectos();
    
    // Event listeners
    loginBtn.addEventListener('click', abrirLoginModal);
    closeModal.addEventListener('click', cerrarLoginModal);
    loginForm.addEventListener('submit', validarLogin);
    cerrarPanelBtn.addEventListener('click', cerrarPanelCreador);
    comentarioForm.addEventListener('submit', agregarComentario);
    
    // Event listeners para el panel de creador
    document.getElementById('nuevo-proyecto-form').addEventListener('submit', crearProyecto);
    document.getElementById('actualizar-form').addEventListener('submit', actualizarProyecto);
    
    // Event listeners para los tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            cambiarTab(tabId);
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            cerrarLoginModal();
        }
    });
    
    // Inicializar las luciérnagas y elementos visuales de progreso
    crearLuciernagas();
    iniciarAnimacionProgreso();
});

// Función para crear luciérnagas
function crearLuciernagas() {
    const firefliesContainer = document.querySelector('.fireflies-container');
    
    // Limpiar luciérnagas existentes si las hay
    if (firefliesContainer) {
        firefliesContainer.innerHTML = '';
        
        // Crear nuevas luciérnagas
        const numFireflies = 60;
        
        for (let i = 0; i < numFireflies; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            
            // Posición inicial aleatoria
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // Movimiento aleatorio más suave
            const moveX = (Math.random() * 150) - 75;
            const moveY = (Math.random() * 150) - 75;
            
            // Duración aleatoria más lenta
            const duration = 5 + Math.random() * 10;
            const delay = Math.random() * 15;
            
            // Establecer propiedades
            firefly.style.top = `${y}%`;
            firefly.style.left = `${x}%`;
            firefly.style.setProperty('--move-x', `${moveX}px`);
            firefly.style.setProperty('--move-y', `${moveY}px`);
            firefly.style.animationDuration = `${duration}s, ${duration}s, ${duration * 2}s`;
            firefly.style.animationDelay = `${delay}s, ${delay}s, ${delay}s`;
            
            firefliesContainer.appendChild(firefly);
        }
    }
}

// Función para iniciar la animación de progreso
function iniciarAnimacionProgreso() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Crear elementos para representar visualmente el progreso
    const progressSymbols = document.createElement('div');
    progressSymbols.className = 'progress-symbols';
    
    // Crear varios elementos que representan el crecimiento/evolución
    for (let i = 0; i < 12; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'progress-symbol-item';
        
        // Variar los tamaños para crear una secuencia de crecimiento
        symbol.style.setProperty('--scale', 0.5 + (i * 0.1));
        symbol.style.setProperty('--delay', i * 0.3 + 's');
        symbol.style.setProperty('--duration', 6 + (i * 0.5) + 's');
        
        // Posición con mejor distribución para representar el crecimiento
        symbol.style.left = `${5 + (i * 8) + (Math.random() * 5)}%`;
        symbol.style.bottom = `${15 + (i * 5) + (Math.random() * 8)}%`;
        
        progressSymbols.appendChild(symbol);
    }
    
    heroSection.appendChild(progressSymbols);
}

// Función para cargar proyectos
function cargarProyectos() {
    if (proyectos.length === 0) {
        proyectosLista.innerHTML = `
            <div class="proyecto-card">
                <div class="proyecto-info">
                    <h3>No hay proyectos disponibles</h3>
                    <p>Pronto se añadirán nuevos proyectos.</p>
                </div>
            </div>
        `;
        return;
    }
    
    proyectosLista.innerHTML = '';
    
    proyectos.forEach(proyecto => {
        const ultimaActualizacion = proyecto.actualizaciones && proyecto.actualizaciones.length > 0 
            ? proyecto.actualizaciones[proyecto.actualizaciones.length - 1] 
            : null;
            
        const proyectoHTML = `
            <div class="proyecto-card" data-id="${proyecto.id}">
                <div class="proyecto-info">
                    <h3>${proyecto.titulo}</h3>
                    <p>${proyecto.descripcion}</p>
                    
                    ${ultimaActualizacion ? `
                    <div class="actualizacion">
                        <h4>Última actualización: ${formatearFecha(ultimaActualizacion.fecha)}</h4>
                        <p>${ultimaActualizacion.nota}</p>
                    </div>
                    ` : ''}
                    
                    <div class="progreso">
                        <div class="barra-progreso">
                            <div class="progreso-completado" style="width: ${proyecto.progreso}%"></div>
                        </div>
                        <span>${proyecto.progreso}%</span>
                    </div>
                </div>
            </div>
        `;
        
        proyectosLista.innerHTML += proyectoHTML;
    });
}

// Función para cargar comentarios
function cargarComentarios() {
    if (comentarios.length === 0) {
        comentariosLista.innerHTML = `<p>No hay comentarios aún. ¡Sé el primero en comentar!</p>`;
        
        if (document.getElementById('admin-comentarios-lista')) {
            document.getElementById('admin-comentarios-lista').innerHTML = `<p>No hay comentarios para mostrar.</p>`;
        }
        return;
    }
    
    comentariosLista.innerHTML = '';
    
    // Comentarios recientes primero
    const comentariosOrdenados = [...comentarios].reverse();
    
    comentariosOrdenados.slice(0, 5).forEach(comentario => {
        const proyecto = proyectos.find(p => p.id === comentario.proyectoId);
        const nombreProyecto = proyecto ? proyecto.titulo : 'Proyecto desconocido';
        
        const comentarioHTML = `
            <div class="comentario-item">
                <h4>${comentario.nombre} <span>${formatearFecha(comentario.fecha)}</span></h4>
                <p>${comentario.texto}</p>
                <span class="tag-proyecto">${nombreProyecto}</span>
            </div>
        `;
        
        comentariosLista.innerHTML += comentarioHTML;
    });
    
    // También actualizar la lista en el panel de administrador si existe
    if (document.getElementById('admin-comentarios-lista')) {
        const adminComentariosList = document.getElementById('admin-comentarios-lista');
        adminComentariosList.innerHTML = '';
        
        comentariosOrdenados.forEach(comentario => {
            const proyecto = proyectos.find(p => p.id === comentario.proyectoId);
            const nombreProyecto = proyecto ? proyecto.titulo : 'Proyecto desconocido';
            
            const comentarioHTML = `
                <div class="comentario-item">
                    <h4>${comentario.nombre} <span>${formatearFecha(comentario.fecha)}</span></h4>
                    <p>${comentario.texto}</p>
                    <span class="tag-proyecto">${nombreProyecto}</span>
                </div>
            `;
            
            adminComentariosList.innerHTML += comentarioHTML;
        });
    }
}

// Función para actualizar el selector de proyectos
function actualizarSelectorProyectos() {
    // Selector para comentarios
    proyectoSelector.innerHTML = '<option value="">Selecciona un proyecto</option>';
    
    proyectos.forEach(proyecto => {
        proyectoSelector.innerHTML += `<option value="${proyecto.id}">${proyecto.titulo}</option>`;
    });
    
    // Selector para el panel de administrador
    const selectorProyectoAdmin = document.getElementById('selector-proyecto');
    if (selectorProyectoAdmin) {
        selectorProyectoAdmin.innerHTML = '<option value="">Selecciona un proyecto</option>';
        
        proyectos.forEach(proyecto => {
            selectorProyectoAdmin.innerHTML += `<option value="${proyecto.id}">${proyecto.titulo}</option>`;
        });
    }
}

// Funciones de autenticación
function abrirLoginModal() {
    loginModal.style.display = 'block';
}

function cerrarLoginModal() {
    loginModal.style.display = 'none';
    loginForm.reset();
}

function validarLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === usuarioCreador.username && password === usuarioCreador.password) {
        sesionIniciada = true;
        cerrarLoginModal();
        abrirPanelCreador();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

function abrirPanelCreador() {
    if (!sesionIniciada) return;
    
    panelCreador.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Actualizar la lista de proyectos en el panel
    actualizarSelectorProyectos();
    
    // Cargar comentarios en el panel
    cargarComentarios();
}

function cerrarPanelCreador() {
    panelCreador.style.display = 'none';
    document.body.style.overflow = 'auto';
    sesionIniciada = false;
}

// Gestión de proyectos
function crearProyecto(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo-proyecto').value;
    const descripcion = document.getElementById('descripcion-proyecto').value;
    const progreso = parseInt(document.getElementById('progreso-proyecto').value);
    
    const nuevoProyecto = {
        id: Date.now().toString(),
        titulo,
        descripcion,
        progreso,
        fechaCreacion: new Date().toISOString(),
        actualizaciones: []
    };
    
    if (progreso > 0) {
        nuevoProyecto.actualizaciones.push({
            fecha: new Date().toISOString(),
            progreso,
            nota: 'Proyecto iniciado'
        });
    }
    
    proyectos.push(nuevoProyecto);
    guardarProyectos();
    cargarProyectos();
    actualizarSelectorProyectos();
    
    document.getElementById('nuevo-proyecto-form').reset();
    
    alert('Proyecto creado exitosamente');
}

function actualizarProyecto(e) {
    e.preventDefault();
    
    const proyectoId = document.getElementById('selector-proyecto').value;
    const nuevoProgreso = parseInt(document.getElementById('actualizar-progreso').value);
    const notaActualizacion = document.getElementById('actualizar-nota').value;
    
    if (!proyectoId) {
        alert('Por favor selecciona un proyecto');
        return;
    }
    
    const proyecto = proyectos.find(p => p.id === proyectoId);
    if (!proyecto) {
        alert('Proyecto no encontrado');
        return;
    }
    
    proyecto.progreso = nuevoProgreso;
    
    const nuevaActualizacion = {
        fecha: new Date().toISOString(),
        progreso: nuevoProgreso,
        nota: notaActualizacion
    };
    
    if (!proyecto.actualizaciones) {
        proyecto.actualizaciones = [];
    }
    
    proyecto.actualizaciones.push(nuevaActualizacion);
    
    guardarProyectos();
    cargarProyectos();
    
    document.getElementById('actualizar-form').reset();
    
    alert('Proyecto actualizado exitosamente');
}

// Gestión de comentarios
function agregarComentario(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const proyectoId = document.getElementById('proyecto-selector').value;
    const texto = document.getElementById('comentario').value;
    
    if (!proyectoId) {
        alert('Por favor selecciona un proyecto');
        return;
    }
    
    const nuevoComentario = {
        id: Date.now().toString(),
        nombre,
        proyectoId,
        texto,
        fecha: new Date().toISOString()
    };
    
    comentarios.push(nuevoComentario);
    guardarComentarios();
    cargarComentarios();
    
    comentarioForm.reset();
    
    alert('Comentario enviado correctamente');
}

// Funciones de utilidad
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function cambiarTab(tabId) {
    // Ocultar todos los contenidos
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Desactivar todos los botones
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar el contenido y botón seleccionados
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Persistencia
function guardarProyectos() {
    localStorage.setItem('proyectos', JSON.stringify(proyectos));
}

function guardarComentarios() {
    localStorage.setItem('comentarios', JSON.stringify(comentarios));
}