// ========================
// ROOMIE — panel-arrendador.js (Full-Stack)
// Panel de control para arrendadores con API real
// ========================

document.addEventListener('DOMContentLoaded', async () => {
    const session = getSession();

    // Protect route: only for arrendadores
    if (!session || session.tipo !== 'arrendador') {
        showToast('Acceso restringido. Solo para arrendadores.', 'warning');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }

    const form = document.getElementById('addRoomForm');
    const myRoomsGrid = document.getElementById('myRoomsGrid');
    const photoInput = document.getElementById('rPhotoInput');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');

    let uploadedPhotos = []; // File objects for upload
    let uploadedPreviews = []; // Base64 previews

    // ---- Photo Preview ----
    photoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        const slotsAvailable = 4 - uploadedPhotos.length;
        const filesToProcess = files.slice(0, slotsAvailable);

        filesToProcess.forEach(file => {
            uploadedPhotos.push(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedPreviews.push(event.target.result);
                renderPhotoPreviews();
            };
            reader.readAsDataURL(file);
        });
    });

    function renderPhotoPreviews() {
        photoPreviewContainer.innerHTML = '';
        uploadedPreviews.forEach((src, index) => {
            const div = document.createElement('div');
            div.style = 'position:relative; width:100px; height:100px; border-radius:10px; overflow:hidden; border:2px solid var(--teal-pale);';
            div.innerHTML = `
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                <button type="button" onclick="removeUploadedPhoto(${index})" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:10px; display:flex; align-items:center; justify-content:center;">✕</button>
            `;
            photoPreviewContainer.appendChild(div);
        });
    }

    window.removeUploadedPhoto = function (index) {
        uploadedPhotos.splice(index, 1);
        uploadedPreviews.splice(index, 1);
        renderPhotoPreviews();
    };

    // ---- Toast Notifications ----
    function showPanelToast(msg, icon = '✅') {
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

    // ---- Confirm Modal ----
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

    // ---- Tab Navigation ----
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
            renderMisHabitaciones(); // Just shows same list with different styling
        }
    };

    // ---- Render My Rooms (from API) ----
    async function renderMisHabitaciones() {
        try {
            const data = await apiRequest('/rooms/user/my-rooms');
            const rooms = data.rooms || [];

            myRoomsGrid.innerHTML = '';
            if (rooms.length === 0) {
                myRoomsGrid.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;text-align:center;padding:40px;background:white;border-radius:var(--radius-lg);margin-top:20px;border:1px dashed var(--gray-300);">Aún no tienes anuncios activos. ¡Publica tu primera habitación!</p>';
                return;
            }

            rooms.forEach(r => {
                const firstImg = (r.fotos && r.fotos.length > 0 && r.fotos[0]) ? r.fotos[0] : '';
                const imgHtml = firstImg
                    ? `<img src="${firstImg}" style="width:110px; height:80px; border-radius:12px; object-fit:cover;" onerror="this.style.display='none'">`
                    : `<div style="width:110px; height:80px; border-radius:12px; background:var(--teal-pale); display:flex; align-items:center; justify-content:center; font-size:2rem;">🏠</div>`;

                const item = document.createElement('div');
                item.className = 'my-room-item';
                item.style = 'background:white; padding:15px; border-radius:var(--radius-lg); display:flex; gap:20px; align-items:center; margin-bottom:15px; border:1px solid var(--gray-100); transition:all 0.3s; box-shadow:0 10px 30px rgba(0,0,0,0.04);';
                item.innerHTML = `
                    ${imgHtml}
                    <div class="my-room-item-details" style="flex:1;">
                        <span class="my-room-item-title" style="font-weight:700; color:var(--dark); font-size:1.15rem; display:block;">${r.titulo}</span>
                        <span class="my-room-item-address" style="color:var(--gray-500); font-size:0.85rem; display:block; margin-top:5px;">📍 ${r.direccion} · ${r.zona}</span>
                        <span style="font-size:0.75rem; color:var(--gray-400); margin-top:4px; display:block;">
                            ${r.disponible ? '<span style="color:var(--teal);font-weight:600;">🟢 Activa</span>' : '<span style="color:#ef4444;font-weight:600;">🔴 Inactiva</span>'}
                            · Coordenadas: ${r.lat?.toFixed(4) || '—'}, ${r.lng?.toFixed(4) || '—'}
                        </span>
                    </div>
                    <div style="text-align:right; display:flex; flex-direction:column; gap:10px;">
                        <span class="my-room-item-price" style="font-weight:800; color:var(--teal); font-size:1.4rem;">${r.precio}€<small style="font-size:0.75rem; color:var(--gray-500); font-weight:400;">/mes</small></span>
                        <button class="btn btn-outline" style="border-color:#ffeded; color: #ef4444; background:#fffafa; padding: 8px 16px; font-size:0.85rem; font-weight:600; border-radius:100px;" onclick="eliminarHabitacion(${r.id})">Eliminar</button>
                    </div>
                `;
                myRoomsGrid.appendChild(item);
            });
        } catch (err) {
            myRoomsGrid.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px;">Error al cargar habitaciones: ${err.message}</p>`;
        }
    }

    // ---- Delete Room (API) ----
    window.eliminarHabitacion = function (idToRemove) {
        customConfirm(
            '¿Eliminar anuncio?',
            'Esta habitación se eliminará permanentemente de la plataforma.',
            '🗑️',
            'SÍ, ELIMINAR',
            async () => {
                try {
                    await apiRequest(`/rooms/${idToRemove}`, { method: 'DELETE' });
                    showPanelToast('Habitación eliminada correctamente', '🗑️');
                    renderMisHabitaciones();
                } catch (err) {
                    showPanelToast('Error al eliminar: ' + err.message, '❌');
                }
            }
        );
    };

    // ---- Create Room (API) ----
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('rTitulo').value.trim();
        const direccion = document.getElementById('rDireccion').value.trim();
        const zona = document.getElementById('rZona').value.trim();
        const precio = document.getElementById('rPrecio').value;
        const tipo = document.getElementById('rTipo').value;
        const descripcion = document.getElementById('rDesc').value.trim();

        // Get coordinates from geocoding
        let lat = 0, lng = 0;
        const latInput = document.getElementById('rLat');
        const lngInput = document.getElementById('rLng');
        if (latInput && lngInput) {
            lat = parseFloat(latInput.value) || 0;
            lng = parseFloat(lngInput.value) || 0;
        }

        if (!titulo || !direccion || !zona || !precio) {
            showPanelToast('Completa todos los campos obligatorios', '⚠️');
            return;
        }

        try {
            const data = await apiRequest('/rooms', {
                method: 'POST',
                body: JSON.stringify({
                    titulo, direccion, zona,
                    precio: parseFloat(precio),
                    tipo, descripcion,
                    lat, lng,
                    habitaciones_totales: 3,
                    habitaciones_libres: 1,
                    mascotas: false,
                    wifi: true,
                    empadronamiento: false,
                    amueblada: true,
                    caracteristicas: ['Amueblada', 'Ventana al exterior'],
                    reglas: 'Normas estándar de buena convivencia.'
                })
            });

            // Upload photos if any
            if (uploadedPhotos.length > 0 && data.room) {
                const formData = new FormData();
                uploadedPhotos.forEach(file => formData.append('photos', file));

                try {
                    await fetch(`${API_BASE}/rooms/${data.room.id}/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${getToken()}` },
                        body: formData
                    });
                } catch (uploadErr) {
                    console.warn('Photo upload failed:', uploadErr);
                }
            }

            showPanelToast('¡Habitación publicada con éxito!', '🚀');

            form.reset();
            uploadedPhotos = [];
            uploadedPreviews = [];
            renderPhotoPreviews();
            renderMisHabitaciones();

        } catch (err) {
            showPanelToast('Error al publicar: ' + err.message, '❌');
        }
    });

    // Initial load
    renderMisHabitaciones();
});
