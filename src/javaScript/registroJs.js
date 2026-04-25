//Cambio color cuando se pulsan los botones
const botonInquilino = document.getElementById("botonInquilino")
const botonArrendador = document.getElementById("botonArrendador")
const crear1 = document.getElementById("crear");

let soyInquilino = true;
let soyArrendador = false;

botonInquilino.addEventListener("click",() => {

    soyInquilino = true;
    soyArrendador= false;
    botonInquilino.classList.toggle('botonPulsado')
    botonArrendador.classList.toggle('botonPulsado')
})

botonArrendador.addEventListener("click", () => {
    soyInquilino = false;
    soyArrendador = true;
    botonInquilino.classList.toggle('botonPulsado')
    botonArrendador.classList.toggle('botonPulsado')
})

//Valores formulario
const crear = document.getElementById("crear")

crear.addEventListener("click",(e) => {
    e.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let apellidos = document.getElementById("apellidos").value;
    let correo = document.getElementById("email").value;
    let telefono = document.getElementById("telefono").value;
    let contrasenya = document.getElementById("pwd").value;
    let contrasenyaConfirm = document.getElementById("pwd_confirm").value;
    let tipo;

    if(nombre === "" || apellidos === "" || correo === "" || telefono === "" || contrasenya === "" || contrasenyaConfirm === ""){
        alert("Rellena todos los campos")

    }else{

        if(contrasenya !== contrasenyaConfirm){
        alert("Las contraseñas tienen que coincidir")

    }else{

        if(soyInquilino === true){
            tipo = "Inquilino"
        }else if(soyArrendador === true){
            tipo = "Arrendador"
        }

        let usuario = {
            nombre: nombre,
            apellidos: apellidos,
            correo: correo,
            telefono: telefono,
            contrasenya: contrasenya,
            tipo: tipo
        }

        let nombreLista = (usuario.tipo === "Inquilino") ? "listaInquilinos" : "listaArrendadores";


        let listaExistente = JSON.parse(localStorage.getItem(nombreLista)) || [];
    
        listaExistente.push(usuario);
        localStorage.setItem(nombreLista, JSON.stringify(listaExistente));

        localStorage.setItem('usuario',JSON.stringify(usuario))
        window.location.href = "inicio.html"

    }


    }



})
