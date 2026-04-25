// ========================
// ROOMIE — buscar.js
// Búsqueda y mapa de habitaciones
// ========================

// ---- Datos de habitaciones de ejemplo ----
const habitacionesEstaticas = [
    {
        id: 1,
        titulo: 'Habitación individual luminosa',
        direccion: 'Calle Mayor 14, Madrid',
        zona: 'Centro · Madrid',
        precio: 450,
        tipo: 'individual',
        disponible: true,
        habitacionesTotales: 4,
        habitacionesLibres: 2,
        mascotas: false,
        wifi: true,
        empadronamiento: true,
        amueblada: true,
        fotos: ['🛏️'],
        caracteristicas: ['Cama 90cm', '12m²', 'Ventana exterior', 'Armario empotrado'],
        descripcion: 'Habitación luminosa en piso compartido con 4 habitaciones. Cocina equipada, dos baños y salón con terraza.',
        reglas: 'No se permiten mascotas. Silencio después de las 23h. No se puede fumar en el interior.',
        lat: 55, lng: 50
    },
    {
        id: 2,
        titulo: 'Habitación doble en piso universitario',
        direccion: 'Av. Complutense 5, Madrid',
        zona: 'Ciudad Universitaria · Madrid',
        precio: 380,
        tipo: 'compartida',
        disponible: true,
        habitacionesTotales: 6,
        habitacionesLibres: 3,
        mascotas: true,
        wifi: true,
        empadronamiento: false,
        amueblada: true,
        fotos: ['🛏️'],
        caracteristicas: ['Cama 90cm', '15m²', 'Escritorio', 'Estantería'],
        descripcion: 'Piso en zona universitaria ideal para estudiantes. Muy bien comunicado con la facultad de Medicina.',
        reglas: 'Mascotas pequeñas permitidas. Ambiente tranquilo de estudio.',
        lat: 25, lng: 30
    },
    {
        id: 3,
        titulo: 'Estudio privado reformado',
        direccion: 'C/ Balmes 88, Barcelona',
        zona: 'Gràcia · Barcelona',
        precio: 695,
        tipo: 'estudio',
        disponible: true,
        habitacionesTotales: 1,
        habitacionesLibres: 1,
        mascotas: false,
        wifi: true,
        empadronamiento: true,
        amueblada: true,
        fotos: ['🏠'],
        caracteristicas: ['Cama 150cm', '30m²', 'Baño privado', 'Kitchenette', 'AC'],
        descripcion: 'Estudio completamente independiente, totalmente reformado y amueblado. Ideal para un profesional o estudiante de postgrado.',
        reglas: 'No se permiten mascotas ni fiestas.',
        lat: 70, lng: 65
    },
    {
        id: 4,
        titulo: 'Habitación en piso nuevo',
        direccion: 'C/ Colón 22, Valencia',
        zona: 'Eixample · Valencia',
        precio: 320,
        tipo: 'individual',
        disponible: true,
        habitacionesTotales: 3,
        habitacionesLibres: 1,
        mascotas: false,
        wifi: true,
        empadronamiento: true,
        amueblada: true,
        fotos: ['🛏️'],
        caracteristicas: ['Cama 105cm', '10m²', 'Armario', 'Ventana patio'],
        descripcion: 'Piso reformado de 3 habitaciones en el centro de Valencia. A 10 minutos a pie de la Universidad de Valencia.',
        reglas: 'No se permiten fiestas. Convivencia respetuosa.',
        lat: 40, lng: 75
    },
    {
        id: 5,
        titulo: 'Habitación amueblada zona universitaria',
        direccion: 'Av. de Andalucía 14, Sevilla',
        zona: 'Los Remedios · Sevilla',
        precio: 290,
        tipo: 'individual',
        disponible: true,
        habitacionesTotales: 5,
        habitacionesLibres: 2,
        mascotas: true,
        wifi: true,
        empadronamiento: false,
        amueblada: true,
        fotos: ['🛏️'],
        caracteristicas: ['Cama 90cm', '9m²', 'Armario', 'Escritorio'],
        descripcion: 'Habitación en piso de 5 estudiantes muy bien comunicado. Ambiente muy dinámico y sociable.',
        reglas: 'Mascotas pequeñas permitidas. Se permiten visitas con previo aviso.',
        lat: 75, lng: 25
    },
    {
        id: 6,
        titulo: 'Piso compartido zona Alameda',
        direccion: 'C/ Feria 33, Sevilla',
        zona: 'Alameda · Sevilla',
        precio: 330,
        tipo: 'compartida',
        disponible: false,
        habitacionesTotales: 4,
        habitacionesLibres: 0,
        mascotas: false,
        wifi: true,
        empadronamiento: true,
        amueblada: true,
        fotos: ['🏠'],
        caracteristicas: ['Cama 90cm', '11m²', 'Armario', 'Terraza compartida'],
        descripcion: 'Piso céntrico con terraza. Actualmente sin disponibilidad, pero puedes apuntarte en lista de espera.',
        reglas: 'No mascotas. No fumar en el interior.',
        lat: 85, lng: 55
    },
    {
        id: 7,
        titulo: 'Habitación grande con baño privado',
        direccion: 'C/ la Palma 8, Bilbao',
        zona: 'Casco Viejo · Bilbao',
        precio: 520,
        tipo: 'individual',
        disponible: true,
        habitacionesTotales: 3,
        habitacionesLibres: 1,
        mascotas: false,
        wifi: true,
        empadronamiento: true,
        amueblada: true,
        fotos: ['🛏️'],
        caracteristicas: ['Cama 135cm', '20m²', 'Baño en suite', 'Escritorio', 'AC'],
        descripcion: 'Habitación premium con baño privado en piso de diseño en el casco viejo de Bilbao.',
        reglas: 'No mascotas. No ruido después de las 22h.',
        lat: 20, lng: 80
    },
    {
        id: 8,
        titulo: 'Habitación económica estudiantes',
        direccion: 'C/ San Fernando 45, Granada',
        zona: 'Centro · Granada',
        precio: 250,
        tipo: 'compartida',
        disponible: true,
        habitacionesTotales: 6,
        habitacionesLibres: 4,
        mascotas: false,
        wifi: true,
        empadronamiento: false,
        amueblada: true,
        fotos: ['🛏️'],
        caracteristicas: ['Cama 90cm', '8m²', 'Armario', 'Luz natural'],
        descripcion: 'La opción más económica de Granada. Piso de estudiantes muy cerca de la Universidad de Granada.',
        reglas: 'Exclusivo para estudiantes. Comunidad responsable.',
        lat: 50, lng: 85
    }
];

// Combinar con habitaciones personalizadas
const customHabitaciones = JSON.parse(localStorage.getItem('customHabitaciones')) || [];
const habitaciones = [...habitacionesEstaticas, ...customHabitaciones];

let filteredHabitaciones = [...habitaciones];
let activeRoomId = null;

// ---- Render Tarjetas de Habitaciones ----
function renderRooms(rooms) {
    const panel = document.getElementById('roomsPanel');
    if (!panel) return;
    if (rooms.length === 0) {
        panel.innerHTML = `
      <div style="text-align:center;padding:48px 24px;color:var(--gray-500);">
        <div style="font-size:3rem;margin-bottom:16px;">🔍</div>
        <h3 style="color:var(--gray-700);margin-bottom:8px;">Sin resultados</h3>
        <p>Prueba con otros filtros o amplía tu búsqueda.</p>
        <button class="btn btn-outline" style="margin-top:16px;" onclick="resetFiltros()">Ver todas las habitaciones</button>
      </div>
    `;
        return;
    }

    panel.innerHTML = rooms.map(h => `
    <div
      class="room-card ${activeRoomId === h.id ? 'active' : ''}"
      id="card-${h.id}"
      onclick="seleccionarHabitacion(${h.id})"
      tabindex="0"
      role="button"
      aria-label="${h.titulo}, ${h.precio}€ al mes"
      onkeypress="if(event.key==='Enter') seleccionarHabitacion(${h.id})"
    >
      <div class="room-card-img">
        ${h.fotos[0]}
        <span class="room-badge">${h.disponible ? '✅ Disponible' : '❌ Ocupada'}</span>
      </div>
      <div class="room-card-body">
        <div class="room-price">${h.precio}€<span>/mes</span></div>
        <div class="room-title">${h.titulo}</div>
        <div class="room-location">📍 ${h.zona}</div>
        
        <div class="room-features-list">
          ${h.caracteristicas.slice(0, 2).map(c => `<span>• ${c}</span>`).join('')}
          <span>• 🏠 ${h.habitacionesTotales} hab</span>
        </div>

        <div class="room-tags">
          ${h.wifi ? '<span class="room-tag">📶 Wifi</span>' : ''}
          ${h.mascotas ? '<span class="room-tag">🐾 Mascotas</span>' : ''}
          ${h.empadronamiento ? '<span class="room-tag">📋 Empadronamiento</span>' : ''}
          <span class="room-tag yellow">${capitalize(h.tipo)}</span>
        </div>
      </div>
    </div>
  `).join('');

    // Update count
    const numEl = document.getElementById('numResults');
    if (numEl) numEl.textContent = rooms.length;
}

// ---- Seleccionar una habitación ----
function seleccionarHabitacion(id) {
    activeRoomId = id;
    const h = habitaciones.find(h => h.id === id);
    if (!h) return;

    // Actualizar estado visual
    document.querySelectorAll('.room-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`card-${id}`);
    if (card) { card.classList.add('active'); card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }

    // Al seleccionar una habitación horizontal se podría abrir directo el modal
    abrirModal(id);
}

// ---- Modal: Detalle Completo ----
function abrirModal(id) {
    const h = habitaciones.find(h => h.id === id);
    if (!h) return;

    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    title.textContent = h.titulo;


    const defaultImgs = [
        `https://loremflickr.com/800/600/bedroom,interior?lock=${h.id}1`,
        `https://loremflickr.com/800/600/bathroom,interior?lock=${h.id}2`,
        `https://loremflickr.com/800/600/kitchen,interior?lock=${h.id}3`,
        `https://loremflickr.com/800/600/livingroom,interior?lock=${h.id}4`
    ];

    const fotos = (h.fotos && h.fotos.length > 0 && h.fotos[0] !== '🛏️' && h.fotos[0] !== '🏠') ? h.fotos : defaultImgs;

    const imgMain = fotos[0];
    const imgTh1 = fotos[1] || defaultImgs[1];
    const imgTh2 = fotos[2] || defaultImgs[2];
    const imgTh3 = fotos[3] || defaultImgs[3];

    body.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      
      <!-- Izquierda: Galería -->
      <div>
        <div style="border-radius:var(--radius-lg); overflow:hidden; margin-bottom:12px; height:280px; box-shadow:var(--shadow-md);">
          <img id="modalMainImg" src="${imgMain}" alt="Foto principal" style="width:100%; height:100%; border-radius:inherit; object-fit:cover; transition: opacity 0.3s ease-in-out;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div onclick="document.getElementById('modalMainImg').src='${imgTh1}'" style="border-radius:var(--radius-md); overflow:hidden; height:90px; cursor:pointer; opacity:0.8; transition:all 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
            <img src="${imgTh1}" alt="Baño" style="width:100%; height:100%; border-radius:inherit; object-fit:cover;">
          </div>
          <div onclick="document.getElementById('modalMainImg').src='${imgTh2}'" style="border-radius:var(--radius-md); overflow:hidden; height:90px; cursor:pointer; opacity:0.8; transition:all 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
            <img src="${imgTh2}" alt="Cocina" style="width:100%; height:100%; border-radius:inherit; object-fit:cover;">
          </div>
          <div onclick="document.getElementById('modalMainImg').src='${imgTh3}'" style="border-radius:var(--radius-md); overflow:hidden; height:90px; cursor:pointer; opacity:0.8; transition:all 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
            <img src="${imgTh3}" alt="Salón" style="width:100%; height:100%; border-radius:inherit; object-fit:cover;">
          </div>
        </div>
      </div>

      <!-- Derecha: Características -->
      <div>
        <div style="background:var(--teal-pale);border-radius:var(--radius-md);padding:16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:1.8rem;font-weight:800;color:var(--teal);">${h.precio}€<span style="font-size:0.9rem;font-weight:400;color:var(--gray-500);">/mes</span></div>
            <div style="font-size:0.85rem;color:var(--gray-500);">📍 ${h.direccion}</div>
          </div>
          <span style="background:${h.disponible ? 'var(--teal)' : '#EF4444'};color:white;padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:700;">
            ${h.disponible ? '✅ Disponible' : '❌ Ocupada'}
          </span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div style="background:var(--gray-100);border-radius:var(--radius-md);padding:12px;text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:var(--dark);">${h.habitacionesTotales}</div>
            <div style="font-size:0.75rem;color:var(--gray-500);">Habitaciones totales</div>
          </div>
          <div style="background:var(--gray-100);border-radius:var(--radius-md);padding:12px;text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:${h.habitacionesLibres > 0 ? 'var(--teal)' : '#EF4444'};">${h.habitacionesLibres}</div>
            <div style="font-size:0.75rem;color:var(--gray-500);">Disponibles</div>
          </div>
        </div>

        <h4 style="margin-bottom:8px;color:var(--dark);font-size:0.95rem;">📋 Descripción</h4>
        <p style="font-size:0.85rem;margin-bottom:16px;line-height:1.6;color:var(--gray-700)">${h.descripcion}</p>

        <h4 style="margin-bottom:8px;color:var(--dark);font-size:0.95rem;">🛏️ Características y Servicios</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:24px;">
          ${h.caracteristicas.map(c => `<span class="room-tag">✓ ${c}</span>`).join('')}
          ${h.wifi ? '<span class="room-tag yellow">✅ Wifi incluido</span>' : ''}
          ${h.mascotas ? '<span class="room-tag yellow">🐾 Mascotas OK</span>' : ''}
          ${h.empadronamiento ? '<span class="room-tag yellow">📝 Empadronamiento</span>' : ''}
          ${h.amueblada ? '<span class="room-tag yellow">🛋️ Amueblada</span>' : ''}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <button class="btn btn-outline btn-full" onclick="contactarArrendador(${h.id})" ${!h.disponible ? 'disabled' : ''}>
            📞 Contactar
          </button>
          <button class="btn btn-primary btn-full" onclick="solicitarVisita(${h.id})" ${!h.disponible ? 'disabled' : ''}>
            📅 Solicitar visita
          </button>
        </div>
        ${!h.disponible ? '<p style="text-align:center;margin-top:12px;font-size:0.82rem;color:#EF4444;">Esta habitación no está disponible actualmente.</p>' : ''}
      </div>
    </div>
  `;

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function cerrarModal(event) {
    const overlay = document.getElementById('modalOverlay');
    if (event && event.target !== overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// También cerrar con ESC
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        cerrarModal({ target: document.getElementById('modalOverlay') });
    }
});

// ---- Contactar / Solicitar Visita ----
function contactarArrendador(id) {
    const h = habitaciones.find(h => h.id === id);
    showToast(`✉️ Formulario de contacto para "${h?.titulo}" (funcionalidad en desarrollo)`, 'warning');
}

function solicitarVisita(id) {
    const h = habitaciones.find(h => h.id === id);
    cerrarModal({ target: document.getElementById('modalOverlay') });
    setTimeout(() => {
        showToast(`📅 Solicitud de visita enviada para "${h?.titulo}"`, 'success');
    }, 300);
}

function generarHabitacionesSimuladas(query) {
    const cityName = query.charAt(0).toUpperCase() + query.slice(1);
    const mockRooms = [];
    const tipos = ['individual', 'compartida', 'estudio'];
    const titles = ['Habitación luminosa', 'Piso increíble', 'Estudio reformado', 'Habitación tranquila', 'Acogedora habitación'];

    for (let i = 0; i < 6; i++) {
        const id = 1000 + i;
        const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
        const latBase = 15 + Math.random() * 70;
        const lngBase = 15 + Math.random() * 70;

        mockRooms.push({
            id: id,
            titulo: titles[i % titles.length] + ' en ' + cityName,
            direccion: `Calle Central ${i + 1}, ${cityName}`,
            zona: `Zona Viva · ${cityName}`,
            precio: 250 + Math.floor(Math.random() * 450), // 250-700
            tipo: tipoAleatorio,
            disponible: Math.random() > 0.15, // 85% disponible
            habitacionesTotales: 3 + (i % 2),
            habitacionesLibres: 1 + (i % 2),
            mascotas: Math.random() > 0.5,
            wifi: true,
            empadronamiento: Math.random() > 0.4,
            amueblada: true,
            fotos: [`<img class="room-img" src="https://loremflickr.com/500/350/bedroom,interior?lock=${id}" loading="lazy" alt="Habitación en ${cityName}" />`],
            caracteristicas: ['Luz natural', 'Armario empotrado', 'Escritorio amplio'],
            descripcion: `Estupenda opción de alquiler ubicada en ${cityName}. Muy bien conectada con transporte público y universidades.`,
            reglas: 'Se pide convivencia responsable. No se permiten fiestas.',
            lat: latBase, lng: lngBase
        });
    }
    return mockRooms;
}

// ---- Filtros ----
function aplicarFiltros() {
    const query = (document.getElementById('searchQuery')?.value || '').toLowerCase().trim();
    const precio = parseInt(document.getElementById('filterPrecio')?.value || '0');
    const tipo = document.getElementById('filterTipo')?.value || '';
    const opcion = document.getElementById('filterOpciones')?.value || '';

    let filtradasTemp = habitaciones.filter(h => {
        const matchQuery = !query || h.titulo.toLowerCase().includes(query) || h.zona.toLowerCase().includes(query) || h.direccion.toLowerCase().includes(query);
        const matchPrecio = !precio || h.precio <= precio;
        const matchTipo = !tipo || h.tipo === tipo;
        let matchOpcion = true;
        if (opcion === 'wifi') matchOpcion = h.wifi;
        if (opcion === 'mascotas') matchOpcion = h.mascotas;
        if (opcion === 'empadronamiento') matchOpcion = h.empadronamiento;
        if (opcion === 'amueblada') matchOpcion = h.amueblada;

        return matchQuery && matchPrecio && matchTipo && matchOpcion;
    });

    // ¡MAGIA! Si no hay resultados para esa "ciudad" o query, generamos habitaciones automáticas para ese lugar
    if (filtradasTemp.length === 0 && query.length > 2) {
        let nuevasSimuladas = generarHabitacionesSimuladas(query);
        // Volvemos a aplicar los filtros de precio, tipo u opción sobre las nuevas habitaciones simuladas
        filtradasTemp = nuevasSimuladas.filter(h => {
            const matchPrecio = !precio || h.precio <= precio;
            const matchTipo = !tipo || h.tipo === tipo;
            let matchOpcion = true;
            if (opcion === 'wifi') matchOpcion = h.wifi;
            if (opcion === 'mascotas') matchOpcion = h.mascotas;
            if (opcion === 'empadronamiento') matchOpcion = h.empadronamiento;
            if (opcion === 'amueblada') matchOpcion = h.amueblada;
            return matchPrecio && matchTipo && matchOpcion;
        });
    }

    filteredHabitaciones = filtradasTemp;
    renderRooms(filteredHabitaciones);

    const msg = filteredHabitaciones.length === 0
        ? 'Ajusta los filtros para encontrar más opciones'
        : `${filteredHabitaciones.length} habitaciones encontradas`;
    showToast(`🔍 ${msg}`, filteredHabitaciones.length === 0 ? 'warning' : 'success');
}

function resetFiltros() {
    const fields = ['searchQuery', 'filterPrecio', 'filterTipo', 'filterOpciones'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            // Sincronizar el dropdown personalizado
            if (el.tagName === 'SELECT' && el.style.display === 'none') {
                const wrapper = el.parentElement;
                if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
                    const trigger = wrapper.querySelector('.custom-select');
                    const opts = wrapper.querySelectorAll('.custom-option');
                    if (trigger && el.options[0]) trigger.textContent = el.options[0].textContent;
                    opts.forEach(o => o.classList.remove('selected'));
                    if (opts.length > 0) opts[0].classList.add('selected');
                }
            }
        }
    });
    filteredHabitaciones = [...habitaciones];
    renderRooms(filteredHabitaciones);
}

// ---- Sort ----
function sortResults(key) {
    const sorted = [...filteredHabitaciones];
    if (key === 'precio-asc') sorted.sort((a, b) => a.precio - b.precio);
    if (key === 'precio-desc') sorted.sort((a, b) => b.precio - a.precio);
    if (key === 'reciente') sorted.sort((a, b) => b.id - a.id);
    renderRooms(sorted);
}

// ---- Utils Dropdown Custom ----
function initCustomSelects() {
    const selects = document.querySelectorAll('select.filter-input');
    selects.forEach(select => {
        // Ocultar select nativo
        select.style.display = 'none';

        // Contenedor principal
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select); // mover el select original dentro

        // Gatillo visual
        const trigger = document.createElement('div');
        trigger.className = 'custom-select';
        const selectedOpt = select.options[select.selectedIndex];
        trigger.textContent = selectedOpt ? selectedOpt.textContent : '';
        wrapper.appendChild(trigger);

        // Lista de opciones personalizadas
        const optionsList = document.createElement('div');
        optionsList.className = 'custom-options';

        Array.from(select.options).forEach((opt, idx) => {
            const div = document.createElement('div');
            div.className = 'custom-option' + (idx === select.selectedIndex ? ' selected' : '');
            div.textContent = opt.textContent;
            div.dataset.value = opt.value;
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                select.value = opt.value;
                trigger.textContent = opt.textContent;
                optionsList.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                div.classList.add('selected');
                wrapper.classList.remove('open');
            });
            optionsList.appendChild(div);
        });
        wrapper.appendChild(optionsList);

        // Manejar apertura/cierre
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            if (!isOpen) wrapper.classList.add('open');
        });
    });

    // Cerrar clickeando fuera
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    });
}

// ---- Utils ----
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    initCustomSelects();

    // Inyectar imágenes reales a la base de datos inicial estática
    habitaciones.forEach(h => {
        if (!h.fotos[0].includes('<img')) {
            h.fotos[0] = `<img class="room-img" src="https://loremflickr.com/500/350/bedroom,hotel?lock=${h.id}" loading="lazy" alt="Habitación" />`;
        }
    });

    // Leer query params
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        const input = document.getElementById('searchQuery');
        if (input) input.value = q;
        aplicarFiltros();
    } else {
        renderRooms(habitaciones);
    }

    // Enter en búsqueda
    const searchInput = document.getElementById('searchQuery');
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') aplicarFiltros();
        });
    }
});
