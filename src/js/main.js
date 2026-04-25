// ========================
// ROOMIE — main.js
// Lógica principal del sitio
// ========================

// SESSION_KEY, getSession() y clearSession() se definen en auth.js cuando está cargado.
// En páginas que no cargan auth.js, usamos esta versión de respaldo (no usa const para evitar conflictos).
if (typeof getSession === 'undefined') {
    window.getSession = function () {
        return JSON.parse(localStorage.getItem('roomie_session') || 'null');
    };
}
if (typeof clearSession === 'undefined') {
    window.clearSession = function () {
        localStorage.removeItem('roomie_session');
    };
}

// ---- Gestión dinámica del navbar según sesión ----
function initNavbarSession() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    const session = getSession();

    if (session) {
        // Usuario logueado: mostrar widget de bienvenida
        const initial = (session.nombre || 'U').charAt(0).toUpperCase();
        const nombre = session.nombre || 'Usuario';
        const email = session.email || '';
        const tipo = session.tipo === 'arrendador' ? '🏡 Arrendador' : '🎓 Inquilino';

        navAuth.innerHTML = `
      <div class="nav-user" id="navUserWidget" role="button" aria-haspopup="true" aria-expanded="false" tabindex="0">
        <div class="nav-user-avatar">${initial}</div>
        <div class="nav-user-info">
          <span class="nav-user-greeting">Bienvenido/a</span>
          <span class="nav-user-name">${nombre}</span>
        </div>
        <span class="nav-user-chevron">▼</span>
        <div class="nav-user-dropdown" role="menu">
          <div class="dropdown-header">
            <strong>${nombre}</strong>
            <span>${email}</span>
            <span style="display:block;margin-top:2px;font-size:0.75rem;color:var(--teal);font-weight:600;">${tipo}</span>
          </div>
          <button class="dropdown-item" onclick="window.location.href='buscar.html'" role="menuitem">
            🔍 Buscar habitaciones
          </button>
          ${session.tipo === 'arrendador' ? `
          <button class="dropdown-item" onclick="window.location.href='panel-arrendador.html'" role="menuitem">
            📋 Mis Habitaciones
          </button>
          ` : ''}
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="cerrarSesion()" role="menuitem">
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    `;

        // Toggle del dropdown
        const widget = document.getElementById('navUserWidget');
        if (widget) {
            widget.addEventListener('click', (e) => {
                e.stopPropagation();
                widget.classList.toggle('open');
                widget.setAttribute('aria-expanded', widget.classList.contains('open'));
            });
            // Cerrar al hacer clic fuera
            document.addEventListener('click', () => {
                widget.classList.remove('open');
                widget.setAttribute('aria-expanded', 'false');
            });
            // Teclado accesible
            widget.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') widget.classList.toggle('open');
            });
        }

    } else {
        // Sin sesión: mostrar botones de login/registro
        navAuth.innerHTML = `
      <a href="login.html" class="btn btn-outline">Iniciar sesión</a>
      <a href="registro.html" class="btn btn-primary">Registrarse</a>
    `;
    }
}

function cerrarSesion() {
    clearSession();
    showToast('👋 Sesión cerrada correctamente', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
}

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ---- Hamburger Menu ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });
}

// ---- Smooth scroll para anclas ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ---- Hero search ----
function buscarDesdeHero() {
    const input = document.getElementById('heroSearchInput');
    const query = input ? input.value.trim() : '';
    window.location.href = query
        ? `buscar.html?q=${encodeURIComponent(query)}`
        : 'buscar.html';
}

const heroInput = document.getElementById('heroSearchInput');
if (heroInput) {
    heroInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') buscarDesdeHero();
    });
}

// ---- Scroll Reveal ----
function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
}

// ---- Toast Notifications ----
function showToast(message, type = 'default', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', default: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    // Sesión en navbar → funciona en todas las páginas con #navAuth
    initNavbarSession();

    initReveal();
    document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .audience-card').forEach(el => {
        el.classList.add('reveal');
    });
    initReveal();
});
