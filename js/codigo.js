const menu = document.querySelector("#menu");
const router = document.querySelector("#ruteo");
const home = document.querySelector("#pantalla-home");
const registro = document.querySelector("#pantalla-registro");
const login = document.querySelector("#pantalla-login");
const agregarEvaluacion = document.querySelector("#pantalla-agregar-evaluacion");
const listarEvaluaciones = document.querySelector("#pantalla-listar-evaluaciones");
const mapa = document.querySelector("#pantalla-mapa");
const nav = document.querySelector("ion-nav");

Inicio();

function CerrarMenu() {
    menu.close();
}
function Inicio() {
    Eventos();
    ArmarMenu();
}

function ArmarMenu() {
    let token = localStorage.getItem("token");
    let html = `<ion-item href="/" onclick="CerrarMenu()">Home</ion-item>`;
    if (token) {
        html += `<ion-item href="/agregar-evaluacion" onclick="CerrarMenu()">Agregar evaluacion</ion-item>
                    <ion-item href="/listar-evaluaciones" onclick="CerrarMenu()">Evaluaciones</ion-item>
                    <ion-item href="/mapa" onclick="CerrarMenu()">Mapa</ion-item>
                    <ion-item onclick="Logout()">Logout</ion-item>
                    `;
    } else {
        html += `<ion-item href="/registro" onclick="CerrarMenu()">Registro</ion-item>
                    <ion-item href="/login" onclick="CerrarMenu()">Login</ion-item>`;
    }

    document.querySelector("#menu-opciones").innerHTML = html;
}

function Logout() {

}

function Eventos() {
    router.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
}

async function TomarDatosLogin() {
    let u = document.querySelector("#txtLoginUser").value;
    let p = document.querySelector("#txtLoginPassword").value;

    let loginObj = new Object();
    loginObj.usuario = u;
    loginObj.password = p;

    let response = await fetch(`https://goalify.develotion.com/login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginObj),
    });

    let body = await response.json();

    if (body.codigo == 200) {
        console.log(body)

        localStorage.setItem("token", body.token);
        localStorage.setItem("iduser", body.id);

        ArmarMenu();
        nav.push("page-home");

    } else {
        alert("Error");
    }
}

function Navegar(evt) {
    console.log(evt);
    OcultarTodo();
    let ruta = evt.detail.to;

    switch (ruta) {
        case "/registro":
            registro.style.display = "block";
            PoblarSelectPaises();
            break;
        case "/login":
            login.style.display = "block";
            break;
        case "/agregar-evaluacion":
            agregarEvaluacion.style.display = "block";
            break;
        case "/listar-evaluaciones":
            listarEvaluaciones.style.display = "block";
            break;
        case "/mapa":
            mapa.style.display = "block";
            break;
        default:
            home.style.display = "block";
            break;
    }
}

async function PoblarSelectPaises() {

    let response = await fetch("https://goalify.develotion.com/paises.php");
    let body = await response.json();

    console.log(body);
    let html = ``;
    for (let pais of body.paises) {
        html += ` <ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
    }
    document.querySelector("#slcPais").innerHTML = html;

}

function OcultarTodo() {
    home.style.display = "none";
    registro.style.display = "none";
    login.style.display = "none";
    agregarEvaluacion.style.display = "none";
    listarEvaluaciones.style.display = "none";
    mapa.style.display = "none";
}


