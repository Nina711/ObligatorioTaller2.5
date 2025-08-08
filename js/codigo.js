const menu = document.querySelector("#menu");
const router = document.querySelector("#ruteo");
const home = document.querySelector("#pantalla-home");
const registro = document.querySelector("#pantalla-registro");
const login = document.querySelector("#pantalla-login");
const agregarEvaluacion = document.querySelector("#pantalla-agregar-evaluacion");
const listarEvaluaciones = document.querySelector("#pantalla-listar-evaluaciones");
const mapa = document.querySelector("#pantalla-mapa");
const nav = document.querySelector("ion-nav");
let fechaSeleccionada = null;

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
    let html = ``;
    if (token) {
        html += `   <ion-item href="/" onclick="CerrarMenu()">Home</ion-item>
                    <ion-item href="/agregar-evaluacion" onclick="CerrarMenu()">Agregar evaluacion</ion-item>
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

function FechaActual() {
    let hoy = new Date();
    let anio = hoy.getFullYear();
    let mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    let dia = hoy.getDate().toString().padStart(2, '0');
    let hoyFormateadaLocal = `${anio}-${mes}-${dia}`;

    return hoyFormateadaLocal;
}

function Logout() {
    localStorage.clear();
    nav.push("page-login")
    ArmarMenu();
    CerrarMenu();
}

function Eventos() {
    router.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
    document.querySelector("#btnRegistrar").addEventListener('click', TomarDatosRegistro);
    document.querySelector("#btnAgregarEvaluacion").addEventListener('click', TomarDatosEvaluacion);
    document.addEventListener('ionModalDidPresent', TomarFecha);
    document.addEventListener('ionViewwillEnter', cargarEvaluaciones);
}

async function cargarEvaluaciones() {
    await listaEvaluaciones();
}

async function TomarDatosRegistro() {
    let n = document.querySelector("#txtRegistroNombre").value;
    let p = document.querySelector("#txtRegistroPassword").value;
    let pais = document.querySelector("#slcPais").value;

    if (DatosValidos(n, p, pais)) {
        let registro = new Object();
        registro.usuario = n;
        registro.password = p;
        registro.idPais = pais;

        let response = await fetch(`https://goalify.develotion.com/usuarios.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registro),
        });

        PrenderLoading("Registrando...");
        let body = await response.json();


        if (body.codigo == 200) {
            let loginObj = new Object();
            ApagarLoader();
            MostrarToast("Usuario creado con éxito", 2000);
            loginObj.usuario = n;
            loginObj.password = p;

            let responseLogin = await fetch(`https://goalify.develotion.com/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginObj),
            });

            let bodyLogin = await responseLogin.json();

            if (bodyLogin.codigo == 200) {
                localStorage.setItem("token", bodyLogin.token);
                localStorage.setItem("iduser", bodyLogin.id);
                ArmarMenu();
                nav.push("page-home");
            }
        } else {
            ApagarLoader();
            Alertar("ALERTA!!", "Registro usuario", body.mensaje);
        }
    } else {
        ApagarLoader();
        Alertar("ALERTA!!", "Registro usuario", "Complete todos los campos");
    }

    document.querySelector("#txtRegistroNombre").value = "";
    document.querySelector("#txtRegistroPassword").value = "";
    document.querySelector("#slcPais").value = "";
}

function DatosValidos(nombre, password, pais) {
    let sonValidos = true;

    if (nombre === "" || password === "" || pais === "") {
        sonValidos = false;
    }

    return sonValidos;
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

    PrenderLoading("Iniciando sesión...");
    let body = await response.json();

    if (body.codigo == 200) {
        ApagarLoader();
        MostrarToast("Sesión iniciada con éxito", 2000);
        localStorage.setItem("token", body.token);
        localStorage.setItem("iduser", body.id);
        ArmarMenu();
        nav.push("page-home");

    } else if (body.codigo == 409) {
        ApagarLoader();
        Alertar("ALERTA!!!", "Login", body.mensaje);
    } else if (body.codigo == 404) {
        ApagarLoader();
        Alertar("ALERTA!!!", "Login", body.mensaje);
    }

    document.querySelector("#txtLoginUser").value = "";
    document.querySelector("#txtLoginPassword").value = "";

}

async function TomarDatosEvaluacion() {
    let objetivo = document.querySelector("#slcObjetivo").value;
    let calificacion = document.querySelector("#txtCalificacion").value;
    let fecha = fechaSeleccionada;
    let usuario = localStorage.getItem("iduser");
    let token = localStorage.getItem("token");


    if (!validarFecha(fecha) && validarCamposEvaluacion(objetivo, calificacion, usuario)) {
        let response = await fetch(`https://goalify.develotion.com/evaluaciones.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token,
                'iduser': usuario
            },
            body: JSON.stringify({
                'idObjetivo': objetivo,
                'idUsuario': usuario,
                'calificacion': calificacion,
                'fecha': fecha
            })
        });
        PrenderLoading("Agregando evaluacion");
        let body = await response.json();

        if (body.codigo == 200) {
            ApagarLoader();
            ArmarMenu();
            nav.push("page-listar-evaluaciones");

        } else {
            ApagarLoader();
            Alertar("ALERTA!!", "Agregar evaluacion", body.mensaje);
        }
    } else {
        ApagarLoader();
        Alertar("ALERTA!!", "Agregar evaluacion", "Datos invalidos");
    }

    document.querySelector("#slcObjetivo").value = "";
    document.querySelector("#txtCalificacion").value = "";
    let hoy = FechaActual()
    document.querySelector("#miFecha").value = hoy;
}

function TomarFecha() {
    let fecha = document.querySelector("#miFecha");

    if (fecha) {
        fecha.addEventListener("ionChange", guardarFecha);
    }
}

function guardarFecha(event) {
    fechaSeleccionada = event.detail.value.substring(0, 10);
    console.log("Fecha guardada:", fechaSeleccionada);
}

function validarFecha(fecha) {
    let hoy = FechaActual();

    return fecha > hoy;
}

function validarCamposEvaluacion(objetivo, calificacion, usuario) {
    let esValido = true;
    if (objetivo == "" || calificacion == "" || calificacion < -5 || calificacion > 5 || usuario == "") {
        esValido = false;
    }

    return esValido;
}

async function listaEvaluaciones(filtro) {
    PrenderLoading("Cargando evaluaciones");
    let data = await obtenerEvaluaciones();
    let evaluaciones = data.evaluaciones;

    let evaluacionesFiltradas = aplicarFiltroFecha(evaluaciones, filtro);

    let html = ``;

    if (evaluacionesFiltradas == "") {
        Alertar("ALERTA!!", "Lo sentimos", "No se encontraron evaluaciones");
        setTimeout(function () { nav.push("page-agregar-evaluacion") }, 1000);
    }

    for (let eval of evaluacionesFiltradas) {
        let emoji = await obtenerEmojiPorId(eval.idObjetivo);
        html += `<ion-item-sliding>
                    <ion-item-options side="start">
                    <ion-item-option id="${eval.idUsuario}" color="danger" onclick="BorrarEvaluacion(${eval.id})">Eliminar</ion-item-option>
                    </ion-item-options>

                    <ion-item>
                    <ion-label>${emoji} - Calificacion: ${eval.calificacion} - Fecha: ${eval.fecha} </ion-label>
                    </ion-item>
                </ion-item-sliding>`;
    }
    ApagarLoader();

    document.querySelector("#lista-evaluaciones").innerHTML = html;

}

function aplicarFiltroFecha(evaluaciones, filtro) {
    let hoy = new Date();
    let fechaLimite = new Date(hoy);
    let evaluacionesPorFecha = [];

    if (filtro === "semana") {
        fechaLimite.setDate(hoy.getDate() - 7);
    } else if (filtro === "mes") {
        fechaLimite.setMonth(hoy.getMonth() - 1);
    } else {
        return evaluaciones;
    }

    hoy = hoy.toISOString().substring(0, 10);
    fechaLimite = fechaLimite.toISOString().substring(0, 10);

    for (let evaluacion of evaluaciones) {
        if (evaluacion.fecha >= fechaLimite && evaluacion.fecha <= hoy) {
            evaluacionesPorFecha.push(evaluacion);
        }
    }

    return evaluacionesPorFecha;
}

function FiltrarEvaluaciones(filtro) {
    listaEvaluaciones(filtro);
}


async function obtenerEmojiPorId(idObjetivo) {
    let response = await fetch(`https://goalify.develotion.com/objetivos.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token"),
            'iduser': localStorage.getItem("iduser")
        }
    });

    let body = await response.json();

    for (let objetivo of body.objetivos) {
        if (objetivo.id === idObjetivo) {
            return objetivo.emoji;
        }
    }

    return "No hay emoji";
}

async function obtenerEvaluaciones() {
    let iduser = localStorage.getItem("iduser");
    let token = localStorage.getItem("token");

    let response = await fetch(`https://goalify.develotion.com/evaluaciones.php?idUsuario=${iduser}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': token,
            'iduser': iduser,
        }
    });

    let body = await response.json();

    return body;

}

async function BorrarEvaluacion(idEvaluacion) {
    let iduser = localStorage.getItem("iduser");
    let token = localStorage.getItem("token");

    let response = await fetch(`https://goalify.develotion.com/evaluaciones.php?idEvaluacion=${idEvaluacion}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'token': token,
            'iduser': iduser,
        }
    });

    let body = await response.json();

    if (body.codigo === 200) {
        MostrarToast("Evaluacion borrada con exito", 2000);
        setTimeout(function () { listaEvaluaciones() }, 1000);
    } else {
        Alertar("ALERTA!!", "Borrar evaluacion", body.mensaje);
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
            PoblarSelectObjetivos();
            break;
        case "/listar-evaluaciones":
            listarEvaluaciones.style.display = "block";
            listaEvaluaciones('todo');
            break;
        case "/mapa":
            mapa.style.display = "block";
            CargarMapa();
            break;
        default:
            if (localStorage.getItem("iduser") != null) {
                home.style.display = "block";
                PrenderLoading("Calculando promedios")
                agregarPromediosCalificaciones();
                break;
            } else {
                login.style.display = "block";
                break;
            }
    }
}

async function PoblarSelectPaises() {

    let response = await fetch("https://goalify.develotion.com/paises.php");
    let body = await response.json();


    let html = ``;
    for (let pais of body.paises) {
        html += ` <ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
    }
    document.querySelector("#slcPais").innerHTML = html;

}

async function PoblarSelectObjetivos() {

    let response = await fetch(`https://goalify.develotion.com/objetivos.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token"),
            'iduser': localStorage.getItem("iduser")
        },
    });

    let body = await response.json();

    let html = ``;

    for (let objetivo of body.objetivos) {
        html += `<ion-select-option value="${objetivo.id}">${objetivo.nombre}</ion-select-option>`
    }

    document.querySelector("#slcObjetivo").innerHTML = html;
}

function OcultarTodo() {
    home.style.display = "none";
    registro.style.display = "none";
    login.style.display = "none";
    agregarEvaluacion.style.display = "none";
    listarEvaluaciones.style.display = "none";
    mapa.style.display = "none";
}

function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}

const loading = document.createElement('ion-loading');

function PrenderLoading(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoader() {
    loading.dismiss();
}

function CargarMapa() {
    if (map != null) {
        map.remove();
    }

    setTimeout(function () { CrearMapa() }, 200);
}

function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;
    document.body.appendChild(toast);
    toast.present();
}

var map = null;

async function CrearMapa() {
    map = L.map('map').setView([-34.89434734598432, -56.15323438268764], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    PrenderLoading("Calculando cantidad de usuarios por pais");
    let response = await fetch("https://goalify.develotion.com/paises.php");
    let body = await response.json();
    let paises = body.paises;
    let usuariosPorPais = await obtenerUsuariosPorPais();

    for (let pais of paises) {
        let cantidadUsuarios = await CantidadUsuariosPorId(pais.id, usuariosPorPais);
        var marker = L.marker([pais.latitude, pais.longitude]).addTo(map).bindPopup(`Cantidad de usuarios: ${cantidadUsuarios}`)
    }

    ApagarLoader();
}

async function obtenerUsuariosPorPais() {
    let response = await fetch(`https://goalify.develotion.com/usuariosPorPais.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token"),
            'iduser': localStorage.getItem("iduser")
        }
    });

    let body = await response.json();

    let paises = body.paises;

    return paises;
}

async function CantidadUsuariosPorId(idPais, listaPaises) {

    for (let pais of listaPaises) {
        if (pais.id === idPais) {
            return pais.cantidadDeUsuarios;
        }
    }
}


function promedioGlobalCalificaciones(evaluaciones) {
    let sumatoria = 0;
    let promedio = 0;
    let totalEvaluaciones = evaluaciones.length;

    if (totalEvaluaciones === 0) {
        return 0
    }

    for (let e of evaluaciones) {
        sumatoria += e.calificacion;
    }

    promedio = sumatoria / totalEvaluaciones;

    return promedio;
}

function promedioDiarioCalificaciones(evaluaciones) {
    let sumatoria = 0;
    let promedio = 0;
    let totalEvaluaciones = 0;
    let hoy = FechaActual();


    for (let e of evaluaciones) {
        if (e.fecha == hoy) {
            totalEvaluaciones++;
            sumatoria += e.calificacion;
        }
    }

    promedio = sumatoria / totalEvaluaciones;

    if (totalEvaluaciones === 0) {
        return 0
    }
    return promedio;
}


async function agregarPromediosCalificaciones() {
    let data = await obtenerEvaluaciones();
    let evaluaciones = data.evaluaciones;
    let promedioGlobal = promedioGlobalCalificaciones(evaluaciones);
    let promedioDiario = promedioDiarioCalificaciones(evaluaciones);

    ApagarLoader();
    document.querySelector("#puntajeGlobal").innerHTML = `${promedioGlobal.toFixed(2)}`;
    document.querySelector("#puntajeDiario").innerHTML = `${promedioDiario.toFixed(2)}`;
} 