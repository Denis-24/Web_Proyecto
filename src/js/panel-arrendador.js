document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();

    // Proteger ruta solo para arrendadores
    if (!session || session.tipo !== 'arrendador') {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('addRoomForm');
    const myRoomsGrid = document.getElementById('myRoomsGrid');
    const photoInput = document.getElementById('rPhotoInput');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');

    let uploadedPhotos = [];

    // Manejar previsualización de fotos
    photoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        const slotsAvailable = 4 - uploadedPhotos.length;
        const filesToProcess = files.slice(0, slotsAvailable);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                uploadedPhotos.push(base64);
                renderPhotoPreviews();
            };
            reader.readAsDataURL(file);
        });
    });

    function renderPhotoPreviews() {
        photoPreviewContainer.innerHTML = '';
        uploadedPhotos.forEach((src, index) => {
            const div = document.createElement('div');
            div.style = 'position:relative; width:100px; height:100px; border-radius:10px; overflow:hidden; border:2px solid var(--teal-pale); shadow:var(--shadow-sm);';
            div.innerHTML = `
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                <button type="button" onclick="removeUploadedPhoto(${index})" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:10px; display:flex; align-items:center; justify-content:center;">✕</button>
            `;
            photoPreviewContainer.appendChild(div);
        });
    }

    window.removeUploadedPhoto = function (index) {
        uploadedPhotos.splice(index, 1);
        renderPhotoPreviews();
    };

    // --- SISTEMA DE NOTIFICACIONES ---
    function showToast(msg, icon = '✅') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');
        const toastIcon = document.getElementById('toastIcon');

        toastMsg.textContent = msg;
        toastIcon.textContent = icon;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    let confirmCallback = null;
    window.customConfirm = function (title, text, icon, btnText, callback) {
        const overlay = document.getElementById('confirmOverlay');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmText').textContent = text;
        document.getElementById('confirmIcon').textContent = icon;
        const actionBtn = document.getElementById('confirmActionBtn');
        actionBtn.textContent = btnText;

        confirmCallback = callback;
        overlay.classList.add('show');
    };

    window.closeConfirmModal = function () {
        document.getElementById('confirmOverlay').classList.remove('show');
    };

    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirmModal();
    });

    // --- MANEJO DE DATOS ---
    function getCustomRooms() {
        return JSON.parse(localStorage.getItem('customHabitaciones')) || [];
    }

    function saveCustomRooms(rooms) {
        localStorage.setItem('customHabitaciones', JSON.stringify(rooms));
    }

    function getHistoryRooms() {
        return JSON.parse(localStorage.getItem('customHabitacionesHistory')) || [];
    }

    function saveToHistory(room) {
        const history = getHistoryRooms();
        const roomWithDate = { ...room, addedAt: new Date().toLocaleDateString() };
        history.push(roomWithDate);
        localStorage.setItem('customHabitacionesHistory', JSON.stringify(history));
    }

    // Navegación de Pestañas
    window.switchPanelTab = function (tab) {
        const activeSection = document.getElementById('activeRoomsSection');
        const historySection = document.getElementById('historySection');
        const tabActiveBtn = document.getElementById('tabActive');
        const tabHistoryBtn = document.getElementById('tabHistory');

        if (tab === 'active') {
            activeSection.style.display = 'block';
            historySection.style.display = 'none';
            tabActiveBtn.style.color = 'var(--teal)';
            tabActiveBtn.style.borderBottom = '3px solid var(--teal)';
            tabHistoryBtn.style.color = 'var(--gray-500)';
            tabHistoryBtn.style.borderBottom = '3px solid transparent';
            renderMisHabitaciones();
        } else {
            activeSection.style.display = 'none';
            historySection.style.display = 'block';
            tabHistoryBtn.style.color = 'var(--teal)';
            tabHistoryBtn.style.borderBottom = '3px solid var(--teal)';
            tabActiveBtn.style.color = 'var(--gray-500)';
            tabActiveBtn.style.borderBottom = '3px solid transparent';
            renderMisHistorial();
        }
    };

    function renderMisHistorial() {
        const history = getHistoryRooms();
        const activeRooms = getCustomRooms();

        const misHistoryEntries = history.filter(r => r.ownerId === session.email);
        const misActiveRooms = activeRooms.filter(r => r.ownerId === session.email);

        // Crear un mapa de IDs activos para búsqueda rápida
        const activeIds = new Set(misActiveRooms.map(r => r.id));

        // Unificar: Todo lo que está en historial es la base. 
        // Si hay algo en activos que no está en historial (por errores previos), lo añadimos temporalmente para la vista
        let displayHistory = [...misHistoryEntries];

        misActiveRooms.forEach(active => {
            if (!displayHistory.find(h => h.id === active.id)) {
                displayHistory.push({ ...active, addedAt: 'Recién añadida' });
            }
        });

        const historyGrid = document.getElementById('historyGrid');
        historyGrid.innerHTML = '';

        if (displayHistory.length === 0) {
            historyGrid.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;text-align:center;padding:40px;background:white;border-radius:var(--radius-lg);margin-top:20px;border:1px dashed var(--gray-300);">No hay registros históricos aún.</p>';
            return;
        }

        // Ordenar por ID descentente (más nuevos primero)
        displayHistory.sort((a, b) => b.id.localeCompare(a.id)).forEach(r => {
            const firstImg = (r.fotos && r.fotos.length > 0) ? r.fotos[0] : 'https://loremflickr.com/400/300/room';
            const isActive = activeIds.has(r.id);

            const item = document.createElement('div');
            item.className = 'my-room-item';
            // Si está activa, mostrar borde teal. Si no, opacidad reducida.
            item.style = `background:white; padding:15px; border-radius:var(--radius-lg); display:flex; gap:20px; align-items:center; margin-bottom:15px; border:1px solid var(--gray-100); ${isActive ? 'border-left: 5px solid var(--teal); box-shadow: 0 4px 15px rgba(0,0,0,0.05);' : 'opacity:0.75; filter: grayscale(30%);'}`;

            item.innerHTML = `
                <img src="${firstImg}" style="width:100px; height:70px; border-radius:10px; object-fit:cover;">
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:700; color:var(--dark); font-size:1.1rem;">${r.titulo}</span>
                        <div style="display:flex; gap:10px; align-items:center;">
                            ${isActive ? '<span style="font-size:0.7rem; color:var(--teal); font-weight:800; background:var(--teal-pale); padding:4px 10px; border-radius:100px;">🟢 ACTIVA</span>' : '<span style="font-size:0.7rem; color:var(--gray-500); font-weight:700; background:var(--gray-100); padding:4px 10px; border-radius:100px;">📜 ARCHIVADA</span>'}
                            <span style="font-size:0.75rem; color:var(--gray-400);">Publicado: ${r.addedAt || 'N/A'}</span>
                        </div>
                    </div>
                    <span style="color:var(--gray-500); font-size:0.85rem; display:block; margin-top:4px;">📍 ${r.direccion}</span>
                </div>
            `;
            historyGrid.appendChild(item);
        });
    }

    function renderMisHabitaciones() {
        const rooms = getCustomRooms();
        const misRooms = rooms.filter(r => r.ownerId === session.email);

        myRoomsGrid.innerHTML = '';
        if (misRooms.length === 0) {
            myRoomsGrid.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;text-align:center;padding:40px;background:white;border-radius:var(--radius-lg);margin-top:20px;border:1px dashed var(--gray-300);">Aún no tienes anuncios activos.</p>';
            return;
        }

        misRooms.forEach(r => {
            const firstImg = (r.fotos && r.fotos.length > 0) ? r.fotos[0] : 'https://loremflickr.com/400/300/room';
            const item = document.createElement('div');
            item.className = 'my-room-item';
            item.style = 'background:white; padding:15px; border-radius:var(--radius-lg); display:flex; gap:20px; align-items:center; margin-bottom:15px; border:1px solid var(--gray-100); transition:all 0.3s; box-shadow:0 10px 30px rgba(0,0,0,0.04);';
            item.innerHTML = `
                <img src="${firstImg}" style="width:110px; height:80px; border-radius:12px; object-fit:cover;">
                <div class="my-room-item-details" style="flex:1;">
                    <span class="my-room-item-title" style="font-weight:700; color:var(--dark); font-size:1.15rem; display:block;">${r.titulo}</span>
                    <span class="my-room-item-address" style="color:var(--gray-500); font-size:0.85rem; display:block; margin-top:5px;">📍 ${r.direccion} · ${r.zona}</span>
                </div>
                <div style="text-align:right; display:flex; flex-direction:column; gap:10px;">
                    <span class="my-room-item-price" style="font-weight:800; color:var(--teal); font-size:1.4rem;">${r.precio}€<small style="font-size:0.75rem; color:var(--gray-500); font-weight:400;">/mes</small></span>
                    <button class="btn btn-outline" style="border-color:#ffeded; color: #ef4444; background:#fffafa; padding: 8px 16px; font-size:0.85rem; font-weight:600; border-radius:100px;" onclick="eliminarHabitacion('${r.id}')">Eliminar del mapa</button>
                </div>
            `;
            myRoomsGrid.appendChild(item);
        });
    }

    window.eliminarHabitacion = function (idToRemove) {
        customConfirm(
            '¿Eliminar anuncio?',
            'Esta habitación dejará de ser pública en los resultados de búsqueda, pero quedará guardada en tu historial.',
            '🗑️',
            'SÍ, ELIMINAR',
            () => {
                const rooms = getCustomRooms();
                const nuevas = rooms.filter(r => r.id !== idToRemove);
                saveCustomRooms(nuevas);
                renderMisHabitaciones();
                showToast('Habitación eliminada correctamente', '🗑️');
            }
        );
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newId = 'custom_' + Date.now();
        const rooms = getCustomRooms();

        const nueva = {
            id: newId,
            ownerId: session.email,
            titulo: document.getElementById('rTitulo').value,
            direccion: document.getElementById('rDireccion').value,
            zona: document.getElementById('rZona').value,
            precio: parseInt(document.getElementById('rPrecio').value),
            tipo: document.getElementById('rTipo').value,
            descripcion: document.getElementById('rDesc').value,
            disponible: true,
            habitacionesTotales: 3,
            habitacionesLibres: 1,
            mascotas: false,
            wifi: true,
            empadronamiento: false,
            amueblada: true,
            fotos: uploadedPhotos.length > 0 ? uploadedPhotos : ['https://loremflickr.com/800/600/room,interior?lock=' + Math.floor(Math.random() * 1000)],
            caracteristicas: ['Amueblada', 'Ventana al exterior'],
            reglas: 'Normas estándar de buena convivencia.',
            lat: 40 + Math.random(), lng: -3 + Math.random()
        };

        rooms.push(nueva);
        saveCustomRooms(rooms);
        saveToHistory(nueva);

        showToast('¡Habitación publicada con éxito!', '🚀');

        form.reset();
        uploadedPhotos = [];
        renderPhotoPreviews();
        renderMisHabitaciones();
    });

    renderMisHabitaciones();
});
