const botonLogin = document.getElementById("crear");

botonLogin.addEventListener("click", (e) => {
    e.preventDefault();

    const correoInput = document.getElementById("email").value.trim();
    const pwdInput = document.getElementById("pwd").value;

    // Leer las listas del LocalStorage
    const inq = JSON.parse(localStorage.getItem('listaInquilinos')) || [];
    const arr = JSON.parse(localStorage.getItem('listaArrendadores')) || [];
    
    // Unir todos los usuarios registrados
    const todos = [...inq, ...arr];

    // Buscar coincidencia
    const encontrado = todos.find(u => u.correo === correoInput && u.contrasenya === pwdInput);

    if (encontrado) {
        localStorage.setItem('usuario', JSON.stringify(encontrado));
        window.location.href = "inicio.html";
    } else {
        alert("Usuario no encontrado o datos incorrectos");
    }
});