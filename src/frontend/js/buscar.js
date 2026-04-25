// ========================
// ROOMIE — buscar.js (Full-Stack + Leaflet Map)
// Búsqueda de habitaciones con mapa interactivo
// ========================

let habitaciones = [];
let filteredHabitaciones = [];
let activeRoomId = null;
let map = null;
let markers = [];
let markerGroup = null;

// ---- Initialize Map ----
function initMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer || map) return;

    // Default center: Spain
    map = L.map('mapContainer', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([40.0, -3.5], 6);

    // OpenStreetMap tiles (free, no API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    markerGroup = L.featureGroup().addTo(map);
}

// ---- Create Custom Marker Icon ----
function createMarkerIcon(precio, isActive = false) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin ${isActive ? 'active' : ''}">
            <span>${precio}€</span>
        </div>`,
        iconSize: [60, 36],
        iconAnchor: [30, 36],
        popupAnchor: [0, -40]
    });
}

// ---- Update Map Markers ----
function updateMapMarkers(rooms) {
    if (!map || !markerGroup) return;

    // Clear existing markers
    markerGroup.clearLayers();
    markers = [];

    rooms.forEach(h => {
        if (!h.lat || !h.lng || (h.lat === 0 && h.lng === 0)) return;

        const marker = L.marker([h.lat, h.lng], {
            icon: createMarkerIcon(h.precio, activeRoomId === h.id)
        });

        // Popup content
        const popupContent = `
            <div class="map-popup">
                <div class="map-popup-title">${h.titulo}</div>
                <div class="map-popup-price">${h.precio}€/mes</div>
                <div class="map-popup-location">📍 ${h.zona}</div>
                <div class="map-popup-tags">
                    ${h.wifi ? '<span class="popup-tag">📶 Wifi</span>' : ''}
                    ${h.mascotas ? '<span class="popup-tag">🐾 Mascotas</span>' : ''}
                    <span class="popup-tag">${capitalize(h.tipo)}</span>
                </div>
                <button class="btn btn-primary btn-sm map-popup-btn" onclick="seleccionarHabitacion(${h.id})">
                    Ver detalles
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 280,
            className: 'roomie-popup'
        });

        marker.on('click', () => {
            activeRoomId = h.id;
            highlightCard(h.id);
        });

        marker.roomId = h.id;
        markers.push(marker);
        markerGroup.addLayer(marker);
    });

    // Fit map to markers
    if (markers.length > 0) {
        try {
            map.fitBounds(markerGroup.getBounds().pad(0.1), { maxZoom: 14 });
        } catch (e) {
            // If bounds are too small
        }
    }
}

function highlightCard(id) {
    document.querySelectorAll('.room-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ---- Fetch Rooms from API ----
async function fetchRooms(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/rooms?${queryString}` : '/rooms';
        const data = await apiRequest(url);
        return data.rooms || [];
    } catch (err) {
        console.error('Error fetching rooms:', err);
        showToast('Error al cargar habitaciones: ' + err.message, 'error');
        return [];
    }
}

// ---- Render Room Cards ----
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

    panel.innerHTML = rooms.map(h => {
        // Determine image source
        let imgSrc = `https://loremflickr.com/800/600/bedroom,interior?lock=${h.id}0`;
        if (h.fotos && h.fotos.length > 0 && h.fotos[0]) {
            imgSrc = h.fotos[0];
        }
        const imgHtml = `<img class="room-img" src="${imgSrc}" loading="lazy" alt="${h.titulo}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://loremflickr.com/800/600/house,interior?lock=${h.id}1'">`;

        return `
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
        ${imgHtml}
        <span class="room-badge">${h.disponible ? '✅ Disponible' : '❌ Ocupada'}</span>
      </div>
      <div class="room-card-body">
        <div class="room-price">${h.precio}€<span>/mes</span></div>
        <div class="room-title">${h.titulo}</div>
        <div class="room-location">📍 ${h.zona}</div>
        
        <div class="room-features-list">
          ${(h.caracteristicas || []).slice(0, 2).map(c => `<span>• ${c}</span>`).join('')}
          <span>• 🏠 ${h.habitaciones_totales || 1} hab</span>
        </div>

        <div class="room-tags">
          ${h.wifi ? '<span class="room-tag">📶 Wifi</span>' : ''}
          ${h.mascotas ? '<span class="room-tag">🐾 Mascotas</span>' : ''}
          ${h.empadronamiento ? '<span class="room-tag">📋 Empadronamiento</span>' : ''}
          <span class="room-tag yellow">${capitalize(h.tipo)}</span>
        </div>
      </div>
    </div>
  `;
    }).join('');

    // Update count
    const numEl = document.getElementById('numResults');
    if (numEl) numEl.textContent = rooms.length;

    // Update map markers
    updateMapMarkers(rooms);
}

// ---- Select Room ----
function seleccionarHabitacion(id) {
    activeRoomId = id;
    const h = habitaciones.find(h => h.id === id);
    if (!h) return;

    // Update visual state
    highlightCard(id);

    // Pan map to marker
    if (map && h.lat && h.lng) {
        map.setView([h.lat, h.lng], 15, { animate: true });
        // Open popup
        const marker = markers.find(m => m.roomId === id);
        if (marker) marker.openPopup();
    }

    abrirModal(id);
}

// ---- Modal: Room Detail ----
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

    const fotos = (h.fotos && h.fotos.length > 0 && h.fotos[0]) ? h.fotos : defaultImgs;

    const imgMain = fotos[0] || defaultImgs[0];
    const imgTh1 = fotos[1] || defaultImgs[1];
    const imgTh2 = fotos[2] || defaultImgs[2];
    const imgTh3 = fotos[3] || defaultImgs[3];

    // Owner info
    const ownerName = h.owner_nombre ? `${h.owner_nombre} ${h.owner_apellidos || ''}` : 'Arrendador';

    body.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      
      <!-- Left: Gallery -->
      <div>
        <div style="border-radius:var(--radius-lg); overflow:hidden; margin-bottom:12px; height:280px; box-shadow:var(--shadow-md);">
          <img id="modalMainImg" src="${imgMain}" alt="Foto principal" style="width:100%; height:100%; border-radius:inherit; object-fit:cover; transition: opacity 0.3s ease-in-out;" onerror="this.src='${defaultImgs[0]}'">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div onclick="document.getElementById('modalMainImg').src='${imgTh1}'" style="border-radius:var(--radius-md); overflow:hidden; height:90px; cursor:pointer; opacity:0.8; transition:all 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
            <img src="${imgTh1}" alt="Foto 2" style="width:100%; height:100%; border-radius:inherit; object-fit:cover;" onerror="this.src='${defaultImgs[1]}'">
          </div>
          <div onclick="document.getElementById('modalMainImg').src='${imgTh2}'" style="border-radius:var(--radius-md); overflow:hidden; height:90px; cursor:pointer; opacity:0.8; transition:all 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
            <img src="${imgTh2}" alt="Foto 3" style="width:100%; height:100%; border-radius:inherit; object-fit:cover;" onerror="this.src='${defaultImgs[2]}'">
          </div>
          <div onclick="document.getElementById('modalMainImg').src='${imgTh3}'" style="border-radius:var(--radius-md); overflow:hidden; height:90px; cursor:pointer; opacity:0.8; transition:all 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
            <img src="${imgTh3}" alt="Foto 4" style="width:100%; height:100%; border-radius:inherit; object-fit:cover;" onerror="this.src='${defaultImgs[3]}'">
          </div>
        </div>

        <!-- Mini map in modal -->
        ${h.lat && h.lng ? `
        <div style="margin-top:16px;">
            <h4 style="margin-bottom:8px;color:var(--dark);font-size:0.95rem;">📍 Ubicación</h4>
            <div id="modalMap" style="height:180px;border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--gray-100);"></div>
        </div>` : ''}
      </div>

      <!-- Right: Details -->
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

        <!-- Owner Badge -->
        <div style="background:var(--gray-100);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--teal);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;">
                ${ownerName.charAt(0).toUpperCase()}
            </div>
            <div>
                <div style="font-weight:600;color:var(--dark);font-size:0.95rem;">${ownerName}</div>
                <div style="font-size:0.78rem;color:var(--gray-500);">Arrendador verificado</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div style="background:var(--gray-100);border-radius:var(--radius-md);padding:12px;text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:var(--dark);">${h.habitaciones_totales || 1}</div>
            <div style="font-size:0.75rem;color:var(--gray-500);">Habitaciones totales</div>
          </div>
          <div style="background:var(--gray-100);border-radius:var(--radius-md);padding:12px;text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:${(h.habitaciones_libres || 0) > 0 ? 'var(--teal)' : '#EF4444'};">${h.habitaciones_libres || 0}</div>
            <div style="font-size:0.75rem;color:var(--gray-500);">Disponibles</div>
          </div>
        </div>

        <h4 style="margin-bottom:8px;color:var(--dark);font-size:0.95rem;">📋 Descripción</h4>
        <p style="font-size:0.85rem;margin-bottom:16px;line-height:1.6;color:var(--gray-700)">${h.descripcion}</p>

        <h4 style="margin-bottom:8px;color:var(--dark);font-size:0.95rem;">🛏️ Características y Servicios</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:24px;">
          ${(h.caracteristicas || []).map(c => `<span class="room-tag">✓ ${c}</span>`).join('')}
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

    // Initialize mini map in modal
    if (h.lat && h.lng) {
        setTimeout(() => {
            const modalMapEl = document.getElementById('modalMap');
            if (modalMapEl) {
                const miniMap = L.map('modalMap', { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView([h.lat, h.lng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap'
                }).addTo(miniMap);
                L.marker([h.lat, h.lng]).addTo(miniMap);
            }
        }, 200);
    }
}

function cerrarModal(event) {
    const overlay = document.getElementById('modalOverlay');
    if (event && event.target !== overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        cerrarModal({ target: document.getElementById('modalOverlay') });
    }
});

// ---- Contact / Visit Requests (API) ----
async function contactarArrendador(id) {
    const session = getSession();
    if (!session) {
        showToast('Inicia sesión para contactar con el arrendador', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    try {
        await apiRequest(`/rooms/${id}/contact`, {
            method: 'POST',
            body: JSON.stringify({ tipo: 'contacto', mensaje: 'Me interesa esta habitación' })
        });
        showToast('✉️ Solicitud de contacto enviada al arrendador', 'success');
    } catch (err) {
        showToast('Error al enviar solicitud: ' + err.message, 'error');
    }
}

async function solicitarVisita(id) {
    const session = getSession();
    if (!session) {
        showToast('Inicia sesión para solicitar una visita', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    cerrarModal({ target: document.getElementById('modalOverlay') });

    try {
        await apiRequest(`/rooms/${id}/contact`, {
            method: 'POST',
            body: JSON.stringify({ tipo: 'visita', mensaje: 'Me gustaría visitar esta habitación' })
        });
        setTimeout(() => {
            showToast('📅 Solicitud de visita enviada correctamente', 'success');
        }, 300);
    } catch (err) {
        showToast('Error al solicitar visita: ' + err.message, 'error');
    }
}

// ---- Filters (API) ----
async function aplicarFiltros() {
    const query = (document.getElementById('searchQuery')?.value || '').trim();
    const precio = document.getElementById('filterPrecio')?.value || '';
    const tipo = document.getElementById('filterTipo')?.value || '';
    const opcion = document.getElementById('filterOpciones')?.value || '';
    const sort = document.getElementById('sortSelect')?.value || '';

    const params = {};
    if (query) params.q = query;
    if (precio) params.precio = precio;
    if (tipo) params.tipo = tipo;
    if (opcion) params.opcion = opcion;
    if (sort && sort !== 'relevancia') params.sort = sort;

    habitaciones = await fetchRooms(params);
    filteredHabitaciones = [...habitaciones];
    renderRooms(filteredHabitaciones);

    const msg = filteredHabitaciones.length === 0
        ? 'Ajusta los filtros para encontrar más opciones'
        : `${filteredHabitaciones.length} habitaciones encontradas`;
    showToast(`🔍 ${msg}`, filteredHabitaciones.length === 0 ? 'warning' : 'success');
}

async function resetFiltros() {
    const fields = ['searchQuery', 'filterPrecio', 'filterTipo', 'filterOpciones'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
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

    habitaciones = await fetchRooms();
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

// ---- Custom Selects UI ----
function initCustomSelects() {
    const selects = document.querySelectorAll('select.filter-input');
    selects.forEach(select => {
        select.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        const trigger = document.createElement('div');
        trigger.className = 'custom-select';
        const selectedOpt = select.options[select.selectedIndex];
        trigger.textContent = selectedOpt ? selectedOpt.textContent : '';
        wrapper.appendChild(trigger);

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

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            if (!isOpen) wrapper.classList.add('open');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    });
}

// ---- Utils ----
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', async () => {
    initCustomSelects();
    initMap();

    // Read query params
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q) {
        const input = document.getElementById('searchQuery');
        if (input) input.value = q;
        await aplicarFiltros();
    } else {
        // Load all rooms from API
        habitaciones = await fetchRooms();
        filteredHabitaciones = [...habitaciones];
        renderRooms(filteredHabitaciones);
    }

    // Enter to search
    const searchInput = document.getElementById('searchQuery');
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') aplicarFiltros();
        });
    }
});
