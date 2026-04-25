// ========================
// ROOMIE — auth.js (Full-Stack)
// Login, Registro con API real
// ========================

// ---- Toggle Password Visibility ----
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁️';
}

// ---- Password Strength ----
function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['', 'Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];
    const widths = ['0%', '20%', '40%', '60%', '80%', '100%'];

    return { score, label: labels[score], color: colors[score], width: widths[score] };
}

// Password strength indicator
const regPasswordInput = document.getElementById('regPassword');
if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
        const val = regPasswordInput.value;
        const strength = checkPasswordStrength(val);
        const container = document.getElementById('pwdStrength');
        if (!container) return;
        if (!val) { container.innerHTML = ''; return; }
        container.innerHTML = `
      <div style="height:4px;background:var(--gray-200);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${strength.width};background:${strength.color};border-radius:2px;transition:all 0.3s ease;"></div>
      </div>
      <span style="font-size:0.78rem;color:${strength.color};font-weight:500;">${strength.label}</span>
    `;
    });
}

// ---- Tipo de Usuario ----
function seleccionarTipo(tipo) {
    const btns = document.querySelectorAll('.tipo-btn');
    btns.forEach(btn => {
        const isActive = btn.dataset.tipo === tipo;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
    const hiddenInput = document.getElementById('tipoUsuario');
    if (hiddenInput) hiddenInput.value = tipo;
}

// Check URL params for tipo
(function () {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get('tipo');
    if (tipo === 'arrendador' || tipo === 'inquilino') {
        seleccionarTipo(tipo);
    }
})();

// ---- Show / Hide Alert ----
function showAuthAlert(alertId, msgId, message, type = 'error') {
    const alert = document.getElementById(alertId);
    const msg = document.getElementById(msgId);
    if (!alert) return;
    if (msg) msg.textContent = message;
    alert.className = `alert alert-${type} show`;
    setTimeout(() => alert.classList.remove('show'), 5000);
}

// ---- Login (API) ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');

        if (!email || !password) {
            showAuthAlert('loginError', 'loginErrorMsg', 'Por favor, introduce tu email y contraseña.');
            return;
        }

        // Loading state
        btn.textContent = '⏳ Iniciando sesión...';
        btn.disabled = true;

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Save token and session
            saveToken(data.token);
            saveSession(data.user);

            showAuthAlert('loginError', 'loginErrorMsg', '¡Sesión iniciada!', 'success');
            btn.textContent = '✅ ¡Bienvenido/a!';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);

        } catch (err) {
            btn.textContent = 'Iniciar sesión';
            btn.disabled = false;
            showAuthAlert('loginError', 'loginErrorMsg', err.message || 'Email o contraseña incorrectos.');
        }
    });
}

// ---- Login Social ----
function loginSocial(provider) {
    showToast(`Inicio con ${provider} próximamente disponible`, 'warning');
}

// ---- Registro (API) ----
const registroForm = document.getElementById('registroForm');
if (registroForm) {
    registroForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const nombre = document.getElementById('regNombre').value.trim();
        const apellidos = document.getElementById('regApellidos').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const telefono = document.getElementById('regTelefono').value.trim();
        const password = document.getElementById('regPassword').value;
        const password2 = document.getElementById('regPassword2').value;
        const terminos = document.getElementById('regTerminos').checked;
        const tipo = document.getElementById('tipoUsuario').value;
        const btn = document.getElementById('regBtn');

        // Frontend validations
        if (!nombre || !apellidos || !email || !password || !password2) {
            showAuthAlert('regError', 'regErrorMsg', 'Por favor, completa todos los campos obligatorios.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAuthAlert('regError', 'regErrorMsg', 'Introduce un correo electrónico válido.');
            return;
        }
        if (password.length < 8) {
            showAuthAlert('regError', 'regErrorMsg', 'La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== password2) {
            showAuthAlert('regError', 'regErrorMsg', 'Las contraseñas no coinciden.');
            return;
        }
        if (!terminos) {
            showAuthAlert('regError', 'regErrorMsg', 'Debes aceptar los términos y condiciones.');
            return;
        }

        // Loading
        btn.textContent = '⏳ Creando cuenta...';
        btn.disabled = true;

        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ nombre, apellidos, email, telefono, password, tipo })
            });

            // Save token and session
            saveToken(data.token);
            saveSession(data.user);

            document.getElementById('regSuccess').classList.add('show');
            btn.textContent = '✅ ¡Cuenta creada!';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (err) {
            btn.textContent = 'Crear cuenta gratis';
            btn.disabled = false;
            showAuthAlert('regError', 'regErrorMsg', err.message || 'Error al crear la cuenta.');
        }
    });
}
