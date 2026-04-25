let datosGuardados = localStorage.getItem('usuario');
let usuario = JSON.parse(datosGuardados);

if (!usuario) {
    window.location.href = "login.html";
} else {
    let perfil = document.getElementById("perfil");
    perfil.innerHTML = `${usuario.nombre}`;

    let contenedor = document.querySelector('.contenedor');
    contenedor.innerHTML = `
        <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
            <h3>Mis Datos</h3>
            <p><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellidos}</p>
            <p><strong>Correo:</strong> ${usuario.correo}</p>
            <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
        </div>
    `;
}

document.getElementById("registro").addEventListener("click", () => {
    localStorage.removeItem('usuario');
    window.location.href = "login.html";
});