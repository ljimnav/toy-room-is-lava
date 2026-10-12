var renderer, scene, camera;
var reloj;

// Grafo de escena
var habitacion;
var jugador;

var modeloGLTF = null;
var contenedorModeloGLTF = null;
var modeloJugador;
var escalaOriginalModelo = null;
var RUTA_PERSONAJE_GLTF = 'models/chibi/ChibiHero.glb';
var ROTACION_CHIBI = 0;

var peluche;
var cabezaPeluche;
var modeloPelucheExterno = null;
var ojosPeluche = [];
var RUTA_PELUCHE_GLTF = 'models/teddy/scene.gltf';
var ALTURA_PELUCHE = 72;
var ROTACION_PELUCHE_GLTF = 0;
var POS_PELUCHE_INICIAL = new THREE.Vector3(532, 330, -372);

var lava;
var texturaLava;
var puerta;
var hojaPuerta;
var colliderPuerta;
var movil;
var brazosMovil;
var interruptores = [];

// Materiales
var materialPared;
var materialMadera;
var materialTela;
var materialLava;

var materialSoporte;
var materialPaginas;
var materialCarton;
var materialOscuro;

var materialRosa;
var materialAzul;
var materialAmarillo;
var materialVerde;
var materialRojo;
var materialMorado;
var materialNaranja;

var materialEstrella;
var materialOjos;
var materialSalida;

var materialPeluche;
var materialPelucheClaro;

var materialesBloque;

// Luces
var luzAmbiental;
var luzPrincipal;
var luzLava;

var linterna;
var objetivoLinterna;

var luzSalida;
var luzOjos;


var INTENSIDAD_PRINCIPAL = 1.0;
var INTENSIDAD_AMBIENTAL = 0.55;
var INTENSIDAD_AMBIENTAL_OSCURA = 0.08;
var INTENSIDAD_LAVA = 1.25;
var INTENSIDAD_LAVA_APAGON = 1.9;
var INTENSIDAD_LINTERNA = 2.6;

var estadoLuces = {v: 1}; // 0 apagón
var estadoOjos = {v: 0};
var COLOR_CLARO = 0x1a1630;
var COLOR_OSCURO = 0x0a0612;

// Colisiones
var plataformas = [];
var obstaculos = [];
var colisionables = [];

var EPS = 0.01;


// Jugador
var p_pos = new THREE.Vector3(); // p_pos representa LOS PIES del jugador
var anguloJugador = 0; // Dirección hacia la que mira
var velocidadY = 0;
var enSuelo = false;
var plataformaActual = null;

// Constantes de física
var gravedad = 0.75;
var fuerzaSalto = 13.5;
var velocidadMaxCaida = 22;
// Caja de colisión del jugador
var radioJugador = 10;
var alturaJugador = 46;
var alturaOjos = 38;
// Permite subir pequeños escalones
var margenEscalon = 6;
// Altura a la que toca lava
var alturaLava = 6;

var framesCoyote = 6; // permite saltar unos frames después de abandonar una plataforma
var framesBufferSalto = 6; // si pulsas espacio justo antes de aterrizar, el juego recuerda la pulsación unos frames y salta cuando tocas el suelo
var framesSinSuelo = 999;
var bufferSalto = 0;


// Cámara
var anguloCamara = Math.PI / 2;
var pitchCamara = 0.35;
var distanciaTercera = 125;
var estadoCamara = {distancia: 125};
var camObjetivo = new THREE.Vector3();
var dirVista = new THREE.Vector3();
var arrastrando = false;
var ratonX = 0;
var ratonY = 0;


// Checkpoints
// 0 = cama
// 1 = escritorio
// 2 = estantería
// 3 = cofre

var checkpoints = [
    {
        nombre: 'Cama',
        pos: new THREE.Vector3(-420,110,200),
        yaw: Math.PI / 2
    },

    {
        nombre: 'Escritorio',
        pos: new THREE.Vector3(385,207,195),
        yaw: Math.PI
    },

    {
        nombre: 'Estantería',
        pos: new THREE.Vector3(475,330,-320),
        yaw: -Math.PI / 2
    },

    {
        nombre: 'Cofre',
        pos: new THREE.Vector3(-150,160,-375),
        yaw: Math.PI / 2
    }
];


var checkpointActual = 0;
var posicionCheckpoint = new THREE.Vector3();


// Estado del juego
var numInterruptores = 0;
var apagonActivado = false;
var puertaAbierta = false;
var gameOver = false;
var victoria = false;
var puedeReaparecer = false;
var muertes = 0;
var tiempoFrames = 0;
var tiempoJuego = 0;

var zonaVictoria = new THREE.Box3(
        new THREE.Vector3(-70,60,-600),
        new THREE.Vector3(70,200,-510));

var timeoutMensaje = null;
var timeoutPuedeReaparecer = null;
var timeoutAutoReaparecer = null;
var temporizadores = [];


// Animaciones
var mixer = null;
var acciones = {};
var accionActual = null;
var personajeGLTFCargado = false;


// Controles
var controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,

    camIzquierda: false,
    camDerecha: false,
    camArriba: false,
    camAbajo: false,

    speed: 3.0
};


document.addEventListener(
    'keydown',
    function(event)
    {
        switch(event.code)
        {
            // Movimiento
            case 'KeyW': controls.moveForward = true;
                break;

            case 'KeyS': controls.moveBackward = true;
                break;

            case 'KeyA': controls.moveLeft = true;
                break;

            case 'KeyD': controls.moveRight = true;
                break;


            // Cámara
            case 'ArrowLeft': controls.camIzquierda = true;
                event.preventDefault();
                break;

            case 'ArrowRight': controls.camDerecha = true;
                event.preventDefault();
                break;

            case 'ArrowUp': controls.camArriba = true;
                event.preventDefault();
                break;


            case 'ArrowDown': controls.camAbajo = true;
                event.preventDefault();
                break;


            // Salto
            case 'Space': event.preventDefault();

                if (!event.repeat)
                {
                    if (gameOver)
                        reaparecerSiPuede();
                    else
                        saltar();
                }
                break;


            case 'Enter':
                if (gameOver)
                    reaparecerSiPuede();
                break;


            // Interacción
            case 'KeyE':
                if (!event.repeat)
                    interactuar();
                break;


            // Volver al checkpoint
            case 'KeyC':
                if (!event.repeat)
                    volverACheckpoint();
                break;


            // Reinicio total
            case 'KeyR':
                if (!event.repeat)
                    reiniciarJuego();
                break;

        }

    }

);


document.addEventListener(
    'keyup',

    function(event)
    {

        switch(event.code)
        {

            case 'KeyW':

                controls.moveForward = false;

                break;


            case 'KeyS':

                controls.moveBackward = false;

                break;


            case 'KeyA':

                controls.moveLeft = false;

                break;


            case 'KeyD':

                controls.moveRight = false;

                break;


            case 'ArrowLeft':

                controls.camIzquierda = false;

                break;


            case 'ArrowRight':

                controls.camDerecha = false;

                break;


            case 'ArrowUp':

                controls.camArriba = false;

                break;


            case 'ArrowDown':

                controls.camAbajo = false;

                break;

        }

    }

);


// Si la ventana pierde el foco soltamos todas las teclas
window.addEventListener(
    'blur',
    function()
    {
        soltarTeclas();
    }
);


function soltarTeclas()
{
    controls.moveForward = false;
    controls.moveBackward = false;
    controls.moveLeft = false;
    controls.moveRight = false;

    controls.camIzquierda = false;
    controls.camDerecha = false;
    controls.camArriba = false;
    controls.camAbajo = false;
}


// -------------------------------------------------------------------

init();

loadScene();

render();


function init()
{
    renderer =
        new THREE.WebGLRenderer({
            antialias: true
        });


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.setClearColor(
        new THREE.Color(
            COLOR_CLARO
        )
    );


    document
        .getElementById('container')
        .appendChild(
            renderer.domElement
        );


    // Sombras
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();


    // Niebla.
    scene.fog = new THREE.FogExp2(0x120a1c,0);
    var aspectRatio =
        window.innerWidth /
        window.innerHeight;
    camera =
        new THREE.PerspectiveCamera(
            60,
            aspectRatio,
            0.1,
            3000
        );

    reloj =
        new THREE.Clock();



    renderer.domElement.addEventListener(
        'mousedown',
        function(e)
        {
            arrastrando = true;
            ratonX = e.clientX;
            ratonY = e.clientY;
        }
    );
    document.addEventListener(
        'mouseup',
        function()
        {
            arrastrando = false;
        }
    );


    document.addEventListener(
        'mousemove',
        function(e)
        {
            if (!arrastrando)
                return;
            var dx =
                e.clientX - ratonX;
            var dy =
                e.clientY - ratonY;
            ratonX =
                e.clientX;
            ratonY =
                e.clientY;
            anguloCamara -=
                dx * 0.005;
            pitchCamara +=
                dy * 0.004;
            limitarPitch();
        }
    );


    renderer.domElement.addEventListener(
        'wheel',
        function(e)
        {
            distanciaTercera =
                THREE.MathUtils.clamp(
                    distanciaTercera +
                    e.deltaY * 0.1,
                    60,
                    240
                );


            estadoCamara.distancia = distanciaTercera;
            e.preventDefault();
        },

        {
            passive: false
        }

    );

    renderer.domElement.addEventListener(
        'contextmenu',
        function(e)
        {
            e.preventDefault();
        }
    );


    window.addEventListener(
        'resize',
        updateAspectRatio
    );

}


// -------------------------------------------------------------------

function loadScene()
{
    // 1. CARGA DE TEXTURAS
    var textureLoader = new THREE.TextureLoader();

    // lava
    texturaLava = textureLoader.load('images/lava.png');
    texturaLava.wrapS = THREE.RepeatWrapping;
    texturaLava.wrapT = THREE.RepeatWrapping;
    texturaLava.repeat.set(8,6);

    // madera
    var texturaMadera = textureLoader.load('images/madera.png');
    texturaMadera.wrapS = THREE.RepeatWrapping;
    texturaMadera.wrapT = THREE.RepeatWrapping;
    texturaMadera.repeat.set(2,2);

    // pared
    var texturaPared = textureLoader.load('images/pared.png');
    texturaPared.wrapS = THREE.RepeatWrapping;
    texturaPared.wrapT = THREE.RepeatWrapping;
    texturaPared.repeat.set(6,3);

    // tela
    var texturaTela = textureLoader.load('images/tela.png');
    texturaTela.wrapS = THREE.RepeatWrapping;
    texturaTela.wrapT = THREE.RepeatWrapping;
    texturaTela.repeat.set(3,3);


    // 2. MATERIALES
    materialPared = new THREE.MeshLambertMaterial({map: texturaPared});
    materialMadera = new THREE.MeshLambertMaterial({map: texturaMadera});
    materialTela = new THREE.MeshLambertMaterial({map: texturaTela, color: 0xffd7ed});
    materialCarton = new THREE.MeshLambertMaterial({color: 0xc89b63});
    materialSoporte = new THREE.MeshLambertMaterial({color: 0x7a5c99, transparent: true, opacity: 0.5});
    materialPaginas = new THREE.MeshLambertMaterial({color: 0xfff7e6});

    materialRosa = new THREE.MeshPhongMaterial({color: 0xff8fcf, shininess: 70});
    materialAzul = new THREE.MeshPhongMaterial({color: 0x68b9ff, shininess: 70});
    materialAmarillo = new THREE.MeshPhongMaterial({color: 0xffdc5a, shininess: 70});
    materialVerde = new THREE.MeshPhongMaterial({color: 0x6fdc8c, shininess: 60});
    materialRojo = new THREE.MeshPhongMaterial({color: 0xff5a5a, shininess: 70});
    materialMorado = new THREE.MeshPhongMaterial({color: 0xb67cff, shininess: 60});
    materialNaranja = new THREE.MeshPhongMaterial({color: 0xffa04a, shininess: 60});
    materialOscuro = new THREE.MeshPhongMaterial({color: 0x25253a, shininess: 90});


    // Bloque multicolor
    materialesBloque = [
        new THREE.MeshPhongMaterial({
            color: 0xff5a5a,
            shininess: 70}),

        new THREE.MeshPhongMaterial({
            color: 0x5aaeff,
            shininess: 70}),

        new THREE.MeshPhongMaterial({
            color: 0xffe45a,
            shininess: 70}),

        new THREE.MeshPhongMaterial({
            color: 0x6ed67a,
            shininess: 70}),

        new THREE.MeshPhongMaterial({
            color: 0xff8fcf,
            shininess: 70}),

        new THREE.MeshPhongMaterial({
            color: 0xffa04a,
            shininess: 70})];


    materialLava = new THREE.MeshPhongMaterial({map: texturaLava, color: 0xffffff, 
        emissive: 0xffffff, emissiveMap: texturaLava, emissiveIntensity: 0.85, shininess: 35,
        side: THREE.DoubleSide}); // emissive hace que el material brille con luz propia

    materialEstrella = new THREE.MeshPhongMaterial({color: 0xfff6b0, emissive: 0xfff08a,
        emissiveIntensity: 0.25});

    materialOjos = new THREE.MeshPhongMaterial({color: 0x000000, emissive: 0xff3a10,
        emissiveIntensity: 0});
    materialOjos.fog = false; // ignora la niebla de la escena

    materialSalida = new THREE.MeshPhongMaterial({color: 0xfff3c4, emissive: 0xfff3c4,
        emissiveIntensity: 0.9});


    // 3. GRAFO PRINCIPAL
    habitacion = new THREE.Object3D();
    scene.add(habitacion);

    crearHabitacion();
    crearVentana();
    crearArcoiris();
    crearEstrellas();
    crearMovil();

    // tramo 1
    crearCama();
    crearLibros();
    crearSilla();
    crearEscritorio();

    // tramo 2
    crearJuguetesTramo2();
    crearEstanteria();

    // tramo 3
    crearJuguetesTramo3();
    crearCofre();
    crearPuerta();

    // Peluche
    crearPeluche();


    // 4. JUGADOR
    jugador = new THREE.Object3D();
    scene.add(jugador);
    cargarPersonajeGLTF();


    // 5. LUCES
    luzAmbiental = new THREE.AmbientLight(0xffffff, INTENSIDAD_AMBIENTAL);
    scene.add(luzAmbiental);

    luzPrincipal = new THREE.PointLight(0xfff0d0, INTENSIDAD_PRINCIPAL, 1600, 1);
    luzPrincipal.position.set(0, 430, 0); // cerca del techo
    luzPrincipal.castShadow = true;
    luzPrincipal.shadow.mapSize.width = 1024;
    luzPrincipal.shadow.mapSize.height = 1024;
    scene.add(luzPrincipal);

    luzLava = new THREE.PointLight(0xff3a00, INTENSIDAD_LAVA, 950, 1);
    luzLava.position.set(0,45,0);
    scene.add(luzLava); // ilumina los objetos próximos a la lava pero sin sombras

    linterna = new THREE.SpotLight(0xfff6dd,0,650,Math.PI / 6,0.45,1);
    linterna.castShadow = true;
    linterna.shadow.mapSize.width = 1024;
    linterna.shadow.mapSize.height = 1024;
    linterna.shadow.camera.near = 8;
    objetivoLinterna = new THREE.Object3D();
    scene.add(linterna);
    scene.add(objetivoLinterna);
    linterna.target = objetivoLinterna;

    luzSalida = new THREE.PointLight(0xfff0c0,0,420,1);
    luzSalida.position.set(0,160,-530);
    scene.add(luzSalida);


    // 6. SOMBRAS
    scene.traverse(
        function(objeto)
        {
            if (objeto.isMesh)
            {
                objeto.castShadow = !objeto.userData.sinSombra;
                objeto.receiveShadow = true; // todos los objetos de la habitación pueden recibir sombras proyectadas por otros
            }});

    lava.castShadow = false;
    lava.receiveShadow = true;


    // 7. COLISIONES Y ESTADO INICIAL
    actualizarCajasColision();
    calcularPosicionesInterruptores();
    calcularAlcanceSalto();
    colocarJugadorEnCheckpoint();
    actualizarHUD();
    mostrarMensaje('Activa los 3 interruptores y llega a la puerta. ¡No pises el suelo!',4500);

}


// -------------------------------------------------------------------

// FUNCIONES AUXILIARES DE CONSTRUCCIÓN
function crearCaja(padre, ancho, alto, fondo, material, x, yCentro, z) // bounding boxes
{
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, fondo), material);
    mesh.position.set(x, yCentro, z);
    padre.add(mesh);
    return mesh;
}

function registrarSolido(lista, mesh, nombre, tipo)
{
    mesh.geometry.computeBoundingBox();

    var registro = {
    mesh: mesh,
    box: new THREE.Box3(),
    nombre: nombre,
    tipo: tipo,
    activo: true
    };

    lista.push(registro);
    return registro;
}

function registrarPlataforma(mesh, nombre)
{
    return registrarSolido(plataformas, mesh, nombre, 'plataforma');
}

function registrarObstaculo(mesh, nombre) // paredes por ejemplo
{
    return registrarSolido(obstaculos, mesh, nombre, 'obstaculo');
}

function actualizarCajasColision()
{
    scene.updateMatrixWorld(true);
    colisionables = plataformas.concat(obstaculos);
    for (var i=0; i<colisionables.length; i++)
    {
        var c = colisionables[i];
        c.box.copy(c.mesh.geometry.boundingBox).applyMatrix4(c.mesh.matrixWorld); // La bounding box está definida en las coordenadas locales de la geometría pero muchos objetos son hijos de otros objetos y tienen posiciones relativas
    }
}


// x, z: centro (en el sistema del padre); yTop: altura de la cara SUPERIOR.
function crearPlataformaCaja(nombre, x, yTop, z, ancho, alto, fondo, material, padre)
{
    padre = padre || habitacion;
    var mesh = crearCaja(padre, ancho, alto, fondo, material, x, yTop - alto/2, z);
    var registro = registrarPlataforma(mesh, nombre);

    // Columna debajo para que no parezca que flota sobre la lava
    var alturaSoporte = (yTop - alto) - 2;
    if (alturaSoporte > 4)
    {
        var soporte = new THREE.Mesh(
            new THREE.BoxGeometry(Math.max(ancho - 24, 8), alturaSoporte, Math.max(fondo - 24, 8)),
            materialSoporte
        );
        soporte.position.y = -alto/2 - alturaSoporte/2;
        mesh.add(soporte);
    }

    return registro;
}

function crearLibro(nombre, x, yTop, z, ancho, alto, fondo, material)
{
    var registro = crearPlataformaCaja(nombre, x, yTop, z, ancho, alto, fondo, material);
    var paginas = new THREE.Mesh(
        new THREE.BoxGeometry(ancho - 8, alto - 8, fondo + 2),
        materialPaginas
    );
    registro.mesh.add(paginas);

    return registro;
}


// CONSTRUCCIÓN DE LA HABITACIÓN
function crearPared(nombre, ancho, alto, fondo, x, y, z, material)
{
    var mesh = crearCaja(habitacion, ancho, alto, fondo, material || materialPared, x, y, z);
    mesh.userData.sinSombra = true;       // las paredes no necesitan proyectar sombra
    registrarObstaculo(mesh, nombre);     // pero SÍ son sólidas
    return mesh;
}


function crearHabitacion()
{
    // Lava. A efectos de colisión la muerte se detecta
    // comparando la altura de los pies con alturaLava.
    lava = new THREE.Mesh(new THREE.PlaneGeometry(1200, 900, 20, 20), materialLava);
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = 4;
    habitacion.add(lava);

    // Interior de la habitación: x [-590, 590], z [-440, 440], y hasta 490.
    crearPared('paredIzquierda', 20, 500, 900, -600, 250, 0);
    crearPared('paredDerecha',   20, 500, 900,  600, 250, 0);
    crearPared('paredDelantera', 1200, 500, 20, 0, 250, 450);

    // Pared trasera por trozos para dejar el hueco de la puerta (x de -70 a 70)
    crearPared('paredTraseraIzq', 530, 500, 20, -335, 250, -450);
    crearPared('paredTraseraDer', 530, 500, 20,  335, 250, -450);
    crearPared('sobrePuerta',     140, 250, 20,    0, 375, -450);   // y de 250 a 500

    crearPared('techo', 1200, 20, 900, 0, 500, 0);

    // Pasillo de salida detrás de la puerta (160 de ancho, z de -440 a -600)
    crearPared('pasilloIzq',   10, 270, 160, -85, 135, -520);
    crearPared('pasilloDer',   10, 270, 160,  85, 135, -520);
    crearPared('techoPasillo', 180, 20, 160,   0, 260, -520);
    crearPared('fondoPasillo', 180, 270, 10,   0, 135, -605, materialSalida);
}


// Ventana con luna en la pared trasera emisiva
function crearVentana()
{
    var ventana = new THREE.Object3D();
    ventana.position.set(-335, 290, -439);
    habitacion.add(ventana);

    var cristal = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 160),
        new THREE.MeshPhongMaterial({color:0x2a3a7a, emissive:0x4a5cc0, emissiveIntensity:0.8})
    );
    cristal.userData.sinSombra = true;
    ventana.add(cristal);

    var luna = new THREE.Mesh(
        new THREE.CircleGeometry(20, 24),
        new THREE.MeshBasicMaterial({color:0xfff7c8})
    );
    luna.position.set(-22, 36, 0.5);
    luna.userData.sinSombra = true;
    ventana.add(luna);

    // Marco
    var m1 = crearCaja(ventana, 132, 8, 8, materialMadera, 0, 84, 3);
    var m2 = crearCaja(ventana, 132, 8, 8, materialMadera, 0, -84, 3);
    var m3 = crearCaja(ventana, 8, 176, 8, materialMadera, -62, 0, 3);
    var m4 = crearCaja(ventana, 8, 176, 8, materialMadera, 62, 0, 3);
    var m5 = crearCaja(ventana, 120, 5, 5, materialMadera, 0, 0, 3);
    var m6 = crearCaja(ventana, 5, 160, 5, materialMadera, 0, 0, 3);
    var marco = [m1, m2, m3, m4, m5, m6];
    for (var i=0; i<marco.length; i++)
        marco[i].userData.sinSombra = true;
}


// Arcoíris infantil en la pared
function crearArcoiris()
{
    var arco = new THREE.Object3D();
    arco.position.set(588, 170, 120);
    arco.rotation.y = -Math.PI / 2;       // para que mire hacia el interior de la habitación
    habitacion.add(arco);

    var colores = [0xff5a5a, 0xffa04a, 0xffe45a, 0x6ed67a, 0x5aaeff, 0xa27aff];

    for (var i=0; i<colores.length; i++)
    {
        var tubo = new THREE.Mesh(
            new THREE.TorusGeometry(120 - i*13, 6.5, 8, 40, Math.PI),
            new THREE.MeshPhongMaterial({color:colores[i], shininess:40})
        );
        tubo.userData.sinSombra = true;
        arco.add(tubo);
    }

    // Nubes en los extremos
    var materialNube = new THREE.MeshLambertMaterial({color:0xffffff});
    var extremos = [-110, 110];
    for (var j=0; j<extremos.length; j++)
    {
        for (var k=0; k<3; k++)
        {
            var nube = new THREE.Mesh(new THREE.SphereGeometry(16 - k*2, 12, 8), materialNube);
            nube.position.set(extremos[j] + (k-1)*18, 8 + (k===1 ? 8 : 0), 4);
            nube.userData.sinSombra = true;
            arco.add(nube);
        }
    }
}


// Estrellas que brillan pegadas al techo
function crearEstrellas()
{
    for (var i=0; i<45; i++)
    {
        var estrella = new THREE.Mesh(new THREE.OctahedronGeometry(5), materialEstrella);
        estrella.scale.y = 0.25;
        estrella.position.set(-560 + Math.random()*1120, 487.5, -420 + Math.random()*840);
        estrella.rotation.y = Math.random() * Math.PI;
        estrella.userData.sinSombra = true;
        habitacion.add(estrella);
    }
}


// Móvil de cuna colgado del techo.
// movil -> cuerda + brazosMovil -> (cuerdas -> juguetes colgantes)
// Gira lentamente (animación en update) y gira más rápido tras el apagón.
function crearMovil()
{
    movil = new THREE.Object3D();
    movil.position.set(-20, 490, -40);
    habitacion.add(movil);

    var cuerda = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 100, 8), materialOscuro);
    cuerda.position.y = -50;
    movil.add(cuerda);

    brazosMovil = new THREE.Object3D();
    brazosMovil.position.y = -100;
    movil.add(brazosMovil);

    var brazo1 = crearCaja(brazosMovil, 160, 4, 4, materialMadera, 0, 0, 0);
    var brazo2 = crearCaja(brazosMovil, 4, 4, 160, materialMadera, 0, 0, 0);

    var materialesJuguete = [materialRosa, materialAzul, materialAmarillo, materialVerde];
    var posiciones = [[80,0],[-80,0],[0,80],[0,-80]];

    for (var i=0; i<4; i++)
    {
        var hilo = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 40, 6), materialOscuro);
        hilo.position.set(posiciones[i][0], -20, posiciones[i][1]);
        brazosMovil.add(hilo);

        var juguete = new THREE.Mesh(
            (i % 2 === 0) ? new THREE.SphereGeometry(11, 14, 10) : new THREE.OctahedronGeometry(12),
            materialesJuguete[i]
        );
        juguete.position.set(posiciones[i][0], -50, posiciones[i][1]);
        brazosMovil.add(juguete);
    }

    brazo1.userData.sinSombra = true;
    brazo2.userData.sinSombra = true;
}


// MUEBLES Y JUGUETES
//     [PLATAFORMA] = jugable   [OBSTÁCULO] = sólido   [DECORATIVO] = sin colisión

// cama -> base, patas, colchón, cabecero, almohadas
function crearCama()
{
    var cama = new THREE.Object3D();
    cama.position.set(-420, 0, 245);
    habitacion.add(cama);

    // Base
    crearCaja(cama, 262, 50, 312, materialMadera, 0, 55, 0);

    // Patas
    var patasX = [-115, 115];
    var patasZ = [-145, 145];
    for (var i=0; i<2; i++)
        for (var j=0; j<2; j++)
            crearCaja(cama, 20, 28, 20, materialMadera, patasX[i], 18, patasZ[j]);

    // Colchón [PLATAFORMA]  (cara superior en y = 110)
    var colchon = crearCaja(cama, 280, 30, 330, materialTela, 0, 95, 0);
    registrarPlataforma(colchon, 'cama');

    // Cabecero [OBSTÁCULO]
    var cabecero = crearCaja(cama, 280, 160, 25, materialMadera, 0, 125, 177.5);
    registrarObstaculo(cabecero, 'cabecero');

    // Almohadas [OBSTÁCULO bajo]: se pueden pisar, pero no son parte del recorrido
    var almohada1 = crearCaja(cama, 100, 20, 60, materialPaginas, -65, 120, 125);
    var almohada2 = crearCaja(cama, 100, 20, 60, materialPaginas,  65, 120, 125);
    registrarObstaculo(almohada1, 'almohada1');
    registrarObstaculo(almohada2, 'almohada2');
}


// ---- LIBROS DEL TRAMO 1 ----
function crearLibros()
{
    // Libro rosa: a 30 unidades de la cama, 25 más alto
    crearLibro('libro1', -195, 135, 255, 110, 30, 80, materialRosa);

    // Libro azul: a 35 unidades del anterior, 30 más alto
    crearLibro('libro2', -55, 165, 235, 100, 32, 90, materialAzul);
}


// silla -> asiento, patas, respaldo
function crearSilla()
{
    var silla = new THREE.Object3D();
    silla.position.set(80, 0, 215);
    habitacion.add(silla);

    // Asiento [PLATAFORMA]  (cara superior en y = 160)
    var asiento = crearCaja(silla, 110, 22, 105, materialMadera, 0, 149, 0);
    registrarPlataforma(asiento, 'silla');

    // Patas
    var px = [-42, 42];
    var pz = [-40, 40];
    for (var i=0; i<2; i++)
        for (var j=0; j<2; j++)
            crearCaja(silla, 16, 138, 16, materialMadera, px[i], 69, pz[j]);

    // Respaldo [OBSTÁCULO]
    var respaldo = crearCaja(silla, 110, 120, 16, materialMadera, 0, 220, 44);
    registrarObstaculo(respaldo, 'respaldoSilla');
}


// escritorio -> tablero, patas, cajonera, objetos, interruptor 1
function crearEscritorio()
{
    var escritorio = new THREE.Object3D();
    escritorio.position.set(320, 0, 215);
    habitacion.add(escritorio);

    // Tablero [PLATAFORMA]  (cara superior en y = 207)
    var tablero = crearCaja(escritorio, 300, 24, 185, materialMadera, 0, 195, 0);
    registrarPlataforma(tablero, 'escritorio');

    // Patas
    var px = [-130, 130];
    var pz = [-70, 70];
    for (var i=0; i<2; i++)
        for (var j=0; j<2; j++)
            crearCaja(escritorio, 22, 195, 22, materialMadera, px[i], 97.5, pz[j]);

    // Cajonera bajo el tablero
    crearCaja(escritorio, 90, 120, 150, materialMadera, 100, 123, 0);

    // Bote de lápices
    var bote = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 14, 32, 16),
        materialAzul
    );
    bote.position.set(110, 223, 70);
    escritorio.add(bote);

    var coloresLapiz = [0xff6b6b, 0x5ec8ff, 0xffdf5e, 0x71e08a];
    for (var k=0; k<4; k++)
    {
        var lapiz = new THREE.Mesh(
            new THREE.CylinderGeometry(2.6, 2.6, 52, 8),
            new THREE.MeshPhongMaterial({color:coloresLapiz[k], shininess:40})
        );
        lapiz.position.set(110 + Math.cos(k*1.6)*6, 245, 70 + Math.sin(k*1.6)*6);
        lapiz.rotation.z = (k - 1.5) * 0.12;
        escritorio.add(lapiz);
    }

    // Cuaderno
    crearCaja(escritorio, 60, 3, 80, materialRosa, 20, 208.5, 60);

    // INTERRUPTOR 1 (hijo del escritorio): mundo = (420, 207, 170)
    crearInterruptor(1, escritorio, 100, 207, -45);
}


// ---- TRAMO 2: libro, bloque, camión ----
function crearJuguetesTramo2()
{
    // Libro rojo, pegado al borde norte del escritorio
    crearLibro('libroA', 330, 235, 60, 110, 30, 80, materialRojo);

    // Cubo de juguete con una cara de cada color
    crearPlataformaCaja('bloqueB', 330, 262, -45, 85, 85, 80, materialesBloque);

    // camion -> caja (plataforma), cabina (plataforma), ruedas, ventanilla
    var camion = new THREE.Object3D();
    camion.position.set(440, 0, -150);
    habitacion.add(camion);

    var caja = crearPlataformaCaja('camionCaja', -40, 285, 0, 130, 40, 80, materialRojo, camion);
    var cabina = crearPlataformaCaja('camionCabina', 75, 325, 0, 60, 70, 80, materialAmarillo, camion);

    // Ruedas
    var xRuedas = [-75, -10, 75];
    for (var i=0; i<xRuedas.length; i++)
    {
        for (var s=-1; s<=1; s+=2)
        {
            var rueda = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 12, 16), materialOscuro);
            rueda.rotation.x = Math.PI / 2;
            rueda.position.set(xRuedas[i], 252, s * 46);
            camion.add(rueda);
        }
    }

    // Ventanilla de la cabina
    var ventanilla = crearCaja(cabina.mesh, 60.5, 22, 56, materialAzul, 0, 18, 0);
    ventanilla.scale.x = 0.04;
    ventanilla.position.x = 30.5;
}


// estanteria -> laterales, panel trasero, 3 baldas, objetos, interruptor 2
// La balda superior ("tejado") es la plataforma del tramo 2/3.
function crearEstanteria()
{
    var estanteria = new THREE.Object3D();
    estanteria.position.set(492.5, 0, -305);
    habitacion.add(estanteria);

    // Laterales [OBSTÁCULO]: llegan hasta justo debajo de la balda superior
    var lateral1 = crearCaja(estanteria, 125, 310, 22, materialMadera, 0, 155, -84);
    var lateral2 = crearCaja(estanteria, 125, 310, 22, materialMadera, 0, 155,  84);
    registrarObstaculo(lateral1, 'lateralEstanteria1');
    registrarObstaculo(lateral2, 'lateralEstanteria2');

    // Panel trasero
    crearCaja(estanteria, 10, 330, 190, materialMadera, 57.5, 165, 0);

    // Baldas bajas [OBSTÁCULO]  (cara superior en y = 90 y y = 210)
    var balda1 = crearCaja(estanteria, 125, 20, 190, materialMadera, 0, 80, 0);
    var balda2 = crearCaja(estanteria, 125, 20, 190, materialMadera, 0, 200, 0);
    registrarObstaculo(balda1, 'balda1');
    registrarObstaculo(balda2, 'balda2');

    // Balda superior [PLATAFORMA]  (cara superior en y = 330)
    var balda3 = crearCaja(estanteria, 125, 20, 190, materialMadera, 0, 320, 0);
    registrarPlataforma(balda3, 'estanteria');

    // Objetos
    var pelota = new THREE.Mesh(new THREE.SphereGeometry(22, 18, 14), materialRojo);
    pelota.position.set(5, 232, 40);
    estanteria.add(pelota);

    crearCaja(estanteria, 34, 34, 34, materialesBloque, -10, 107, -30);
    crearCaja(estanteria, 28, 28, 28, materialAzul, 10, 104, 30);
    crearCaja(estanteria, 40, 40, 40, materialAmarillo, -15, 230, -40);

    // INTERRUPTOR 2 (hijo de la estantería): mundo = (482.5, 330, -360)
    crearInterruptor(2, estanteria, -10, 330, -55);
}


// ---- TRAMO 3: cajas, tren, regla ----
function crearJuguetesTramo3()
{
    // Caja de cartón (con una cinta decorativa)
    var cajaCarton = crearPlataformaCaja('cajaCarton', 350, 295, -300, 90, 60, 90, materialCarton);
    var cinta = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 92), materialAmarillo);
    cinta.position.y = 30.5;
    cajaCarton.mesh.add(cinta);

    // Ladrillo Lego
    var lego = crearPlataformaCaja('lego', 235, 262, -210, 80, 50, 80, materialVerde);
    for (var i=-1; i<=1; i+=2)
    {
        for (var j=-1; j<=1; j+=2)
        {
            var saliente = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 5, 14), materialVerde);
            saliente.position.set(i*18, 27.5, j*18);
            lego.mesh.add(saliente);
        }
    }

    // TREN DE JUGUETE: tren -> vagon1, vagon2, locomotora (cada uno con ruedas)
    var tren = new THREE.Object3D();
    tren.position.set(0, 0, -180);
    habitacion.add(tren);

    crearVagon(tren, 'vagon1', 110, 235, 100, 45, 60, materialAzul);
    crearVagon(tren, 'vagon2', -20, 235, 100, 45, 60, materialAmarillo);
    var locomotora = crearVagon(tren, 'locomotora', -150, 255, 90, 55, 60, materialRojo);

    // Chimenea de la locomotora
    var chimenea = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 22, 12), materialOscuro);
    chimenea.position.set(-28, 38, 0);
    locomotora.mesh.add(chimenea);

    // REGLA: puente estrecho [PLATAFORMA]
    var regla = crearPlataformaCaja('regla', -150, 215, -287.5, 34, 8, 95, materialAmarillo);

    // Marcas de la regla
    for (var m=0; m<10; m++)
    {
        var marca = new THREE.Mesh(
            new THREE.BoxGeometry((m % 2 === 0) ? 14 : 8, 0.6, 1.4),
            materialOscuro
        );
        marca.position.set(-8, 4.2, -42 + m*9.5);
        regla.mesh.add(marca);
    }
}


function crearVagon(padre, nombre, x, yTop, ancho, alto, fondo, material)
{
    var registro = crearPlataformaCaja(nombre, x, yTop, 0, ancho, alto, fondo, material, padre);

    // Ruedas
    for (var sx=-1; sx<=1; sx+=2)
    {
        for (var sz=-1; sz<=1; sz+=2)
        {
            var rueda = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 6, 14), materialOscuro);
            rueda.rotation.x = Math.PI / 2;
            rueda.position.set(sx * ancho * 0.3, -alto/2 + 2, sz * (fondo/2 + 3));
            registro.mesh.add(rueda);
        }
    }

    return registro;
}


// cofre -> cuerpo, tapa, correas, cerradura, interruptor 3
function crearCofre()
{
    var cofre = new THREE.Object3D();
    cofre.position.set(-170, 0, -390);
    habitacion.add(cofre);

    // Cuerpo [OBSTÁCULO] (y de 4 a 145)
    var cuerpo = crearCaja(cofre, 130, 141, 80, materialAzul, 0, 74.5, 0);
    registrarObstaculo(cuerpo, 'cuerpoCofre');

    // Tapa [PLATAFORMA]  (cara superior en y = 160)
    var tapa = crearCaja(cofre, 140, 15, 90, materialAmarillo, 0, 152.5, 0);
    registrarPlataforma(tapa, 'cofre');

    // Correas y cerradura
    crearCaja(cofre, 14, 143, 82, materialMadera, -40, 74.5, 0);
    crearCaja(cofre, 14, 143, 82, materialMadera,  40, 74.5, 0);
    crearCaja(cofre, 16, 24, 6, materialAmarillo, 0, 120, 42);

    // INTERRUPTOR 3 (hijo del cofre): mundo = (-200, 160, -380)
    crearInterruptor(3, cofre, -30, 160, 10);
}



// puertaGrupo -> marco (3 piezas) + puerta (bisagra) -> hoja + pomo
// La plataforma de salida es un pedestal verde delante de la puerta.
function crearPuerta()
{
    // Pedestal de salida [PLATAFORMA] (y = 70). Continúa por el pasillo.
    crearPlataformaCaja('salida', 0, 70, -480, 160, 70, 240, materialVerde);

    // Felpudo
    crearCaja(habitacion, 100, 2, 50, materialRosa, 0, 71, -410);

    var puertaGrupo = new THREE.Object3D();
    puertaGrupo.position.set(0, 0, -450);
    habitacion.add(puertaGrupo);

    // Marco de madera 
    crearCaja(puertaGrupo, 10, 180, 8, materialMadera, -75, 160, 14);
    crearCaja(puertaGrupo, 10, 180, 8, materialMadera,  75, 160, 14);
    crearCaja(puertaGrupo, 160, 10, 8, materialMadera,   0, 255, 14);

    // El nodo "puerta" actúa como BISAGRA: al girarlo gira toda la hoja.
    puerta = new THREE.Object3D();
    puerta.position.set(-69, 70, 0);
    puertaGrupo.add(puerta);

    hojaPuerta = new THREE.Mesh(new THREE.BoxGeometry(138, 176, 12), materialMadera);
    // Desplaza la hoja con respecto a la bisagra (si no, giraría por su centro)
    hojaPuerta.position.set(69, 88, 0);
    puerta.add(hojaPuerta);

    // Pomo
    var pomo = new THREE.Mesh(
        new THREE.SphereGeometry(7, 16, 12),
        new THREE.MeshPhongMaterial({color:0xffd35c, shininess:120})
    );
    pomo.position.set(124, 85, 9);
    puerta.add(pomo);

    // La hoja es un [OBSTÁCULO] mientras la puerta está cerrada.
    // Al abrirla se desactiva (colliderPuerta.activo = false).
    colliderPuerta = registrarObstaculo(hojaPuerta, 'puerta');
}


function crearPeluche()
{
    peluche = new THREE.Object3D();
    peluche.position.copy(POS_PELUCHE_INICIAL);
    peluche.rotation.y = -Math.PI / 2;
    habitacion.add(peluche);


    // Este nodo será el pivote que gira
    
    cabezaPeluche = new THREE.Object3D();
    peluche.add(cabezaPeluche);

    // OJOS ROJOS
    for (
        var o = -1;
        o <= 1;
        o += 2
    )
    {
        var ojoBrillante = new THREE.Mesh(new THREE.SphereGeometry(3.4,10,8),materialOjos);
        ojoBrillante.position.set(o * 6,54,8);
        ojoBrillante.visible = false;
        ojoBrillante.userData.sinSombra = true;
        cabezaPeluche.add(ojoBrillante);
        ojosPeluche.push(ojoBrillante);
    }

    luzOjos = new THREE.PointLight(0xff3a10,0,140,1);
    luzOjos.position.set(0,54,24);
    cabezaPeluche.add(luzOjos);
    cargarPelucheGLTF();
}


function cargarPelucheGLTF()
{
    var loader = new THREE.GLTFLoader();

    loader.load(RUTA_PELUCHE_GLTF, function(gltf)
    {
        modeloPelucheExterno = gltf.scene;

        modeloPelucheExterno.traverse(function(objeto)
        {
            if (objeto.isMesh)
            {
                objeto.castShadow = true;
                objeto.receiveShadow = true;
            }
        });

        modeloPelucheExterno.updateMatrixWorld(true);
        var caja = new THREE.Box3().setFromObject(modeloPelucheExterno);
        var altura = caja.max.y - caja.min.y;

        modeloPelucheExterno.scale.setScalar(ALTURA_PELUCHE / altura);

        modeloPelucheExterno.updateMatrixWorld(true);
        caja.setFromObject(modeloPelucheExterno);

        var centroX = (caja.min.x + caja.max.x) / 2;
        var centroZ = (caja.min.z + caja.max.z) / 2;

        modeloPelucheExterno.position.x -= centroX;
        modeloPelucheExterno.position.y -= caja.min.y;
        modeloPelucheExterno.position.z -= centroZ;

        modeloPelucheExterno.rotation.y = ROTACION_PELUCHE_GLTF;
        cabezaPeluche.add(modeloPelucheExterno);
    });
}


// INTERRUPTORES
function crearInterruptor(numero, padre, x, y, z)
{
    var grupo = new THREE.Object3D();
    grupo.position.set(x, y, z);
    padre.add(grupo);

    var base = new THREE.Mesh(
        new THREE.BoxGeometry(30, 8, 30),
        new THREE.MeshPhongMaterial({color:0x444444, shininess:70})
    );
    base.position.y = 4;
    grupo.add(base);

    // Cada interruptor tiene su material para poder cambiarle el color
    var materialBoton = new THREE.MeshPhongMaterial({color:0xff4545, emissive:0xff2020,
        emissiveIntensity:0.6, shininess:90});

    var boton = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 8, 20), materialBoton);
    boton.position.y = 12;
    grupo.add(boton);

    grupo.userData.numero = numero;
    grupo.userData.activado = false;
    grupo.userData.boton = boton;
    grupo.userData.yBotonInicial = 12;
    grupo.userData.posMundo = new THREE.Vector3();

    interruptores.push(grupo);
    return grupo;
}


function calcularPosicionesInterruptores()
{
    scene.updateMatrixWorld(true);

    for (var i=0; i<interruptores.length; i++)
        interruptores[i].getWorldPosition(interruptores[i].userData.posMundo);
}


// PERSONAJE
// ChibiHero.glb tiene modelo, rig, Idle, Walk, Run, Jump, Wave
function cargarPersonajeGLTF()
{
    var loader = new THREE.GLTFLoader();

    loader.load(RUTA_PERSONAJE_GLTF, function(gltf)
    {
        contenedorModeloGLTF = new THREE.Object3D();
        modeloGLTF = gltf.scene;

        // Sombras del modelo
        modeloGLTF.traverse(function(objeto)
        {
            if (objeto.isMesh)
            {
                objeto.castShadow = true;
                objeto.receiveShadow = true;
            }
        });

        // Escalar el modelo a la altura del jugador
        modeloGLTF.updateMatrixWorld(true);
        var caja = new THREE.Box3().setFromObject(modeloGLTF);
        var altura = caja.max.y - caja.min.y;

        modeloGLTF.scale.setScalar(alturaJugador / altura);

        // Centrar el modelo y colocar los pies en Y = 0
        modeloGLTF.updateMatrixWorld(true);
        caja.setFromObject(modeloGLTF);

        var centroX = (caja.min.x + caja.max.x) / 2;
        var centroZ = (caja.min.z + caja.max.z) / 2;

        modeloGLTF.position.x -= centroX;
        modeloGLTF.position.y -= caja.min.y;
        modeloGLTF.position.z -= centroZ;

        // Añadir el modelo al grafo de escena
        contenedorModeloGLTF.rotation.y = ROTACION_CHIBI;
        contenedorModeloGLTF.add(modeloGLTF);
        jugador.add(contenedorModeloGLTF);

        modeloJugador = contenedorModeloGLTF;
        escalaOriginalModelo = null;

        // ANIMACIONES
        mixer = new THREE.AnimationMixer(modeloGLTF);
        acciones = {};

        for (var i=0; i<gltf.animations.length; i++)
        {
            var clip = gltf.animations[i];
            var nombre = clip.name.toLowerCase();

            if (nombre.includes('idle'))
                acciones.idle = mixer.clipAction(clip);
            else if (nombre.includes('walk'))
                acciones.walk = mixer.clipAction(clip);
            else if (nombre.includes('run'))
                acciones.run = mixer.clipAction(clip);
            else if (nombre.includes('jump'))
                acciones.jump = mixer.clipAction(clip);
            else if (nombre.includes('wave'))
                acciones.wave = mixer.clipAction(clip);
        }

        // Jump y Wave se ejecutan una sola vez
        acciones.jump.setLoop(THREE.LoopOnce, 1);
        acciones.jump.clampWhenFinished = true;

        acciones.wave.setLoop(THREE.LoopOnce, 1);
        acciones.wave.clampWhenFinished = true;

        // Empezar con la animación Idle
        acciones.idle.play();
        accionActual = acciones.idle;

        personajeGLTFCargado = true;
        console.log('ChibiHero GLB cargado correctamente.');
    });
}


function cambiarAnimacionPersonaje(nombre)
{
    // Comprobamos que exista todo
    if (
        !personajeGLTFCargado ||
        !acciones[nombre] ||
        accionActual === acciones[nombre]
    )
    {
        return;
    }


    var nueva = acciones[nombre];
    if (accionActual)
    {
        accionActual.fadeOut(
            0.18
        );

    }

    nueva.reset();
    nueva.fadeIn(0.18);
    nueva.play();
    accionActual = nueva;

}

function actualizarAnimacionPersonaje(moviendose)
{
    // Saltando
    if (!enSuelo)
    {
        cambiarAnimacionPersonaje(
            'jump'
        );
    }

    // Andando
    else if (moviendose)
    {
        cambiarAnimacionPersonaje(
            'walk'
        );

    }

    // Quieto
    else
    {
        cambiarAnimacionPersonaje(
            'idle'
        );
    }
}


// Física del jugador y colisiones

function calcularAlcanceSalto()
{
    // Simula un salto para saber el alcance real y poder diseñar el nivel
    var y = 0, vy = fuerzaSalto, frames = 0, alturaMax = 0;

    do
    {
        vy -= gravedad;
        y += vy;
        frames++;
        if (y > alturaMax)
            alturaMax = y;
    }
    while (y > 0 && frames < 300);

    console.log('Salto: altura máxima ~' + alturaMax.toFixed(0) +
                ' u, duración ' + frames + ' frames, alcance en llano ~' +
                (frames * controls.speed).toFixed(0) + ' u');
}


function saltar()
{
    if (gameOver || victoria)
        return;
    bufferSalto = framesBufferSalto;
}


// ¿Se solapa la caja del jugador con la caja b en el plano horizontal XZ?
function solapaXZ(b)
{
    return (p_pos.x + radioJugador > b.min.x && p_pos.x - radioJugador < b.max.x &&
            p_pos.z + radioJugador > b.min.z && p_pos.z - radioJugador < b.max.z);
}


// Colisión horizontal contra TODOS los sólidos (paredes, muebles, puerta...)
function resolverColisionHorizontal(eje, delta)
{
    for (var i=0; i<colisionables.length; i++)
    {
        var c = colisionables[i];

        if (!c.activo)
            continue;

        var b = c.box;
        var pies = p_pos.y;
        var cabeza = p_pos.y + alturaJugador;

        // Si está totalmente por encima o por debajo del objeto, no choca
        if (pies >= b.max.y - EPS)
            continue;
        if (cabeza <= b.min.y + EPS)
            continue;

        // Si no hay solape horizontal tampoco choca
        if (!solapaXZ(b))
            continue;

        if (b.max.y - pies <= margenEscalon)
        {
            p_pos.y = b.max.y;
            continue;
        }

        // Choque
        if (eje === 'x')
            p_pos.x = (delta > 0) ? b.min.x - radioJugador : b.max.x + radioJugador;
        else
            p_pos.z = (delta > 0) ? b.min.z - radioJugador : b.max.z + radioJugador;
    }
}


// ¿Estaba por encima de la plataforma en el frame anterior y ahora mi nueva posición cruza su cara superior?
function aplicarGravedadYSuelo()
{
    velocidadY -= gravedad;
    if (velocidadY < -velocidadMaxCaida)
        velocidadY = -velocidadMaxCaida;

    var yAnterior = p_pos.y;
    p_pos.y += velocidadY;

    enSuelo = false;
    plataformaActual = null;

    var sueloY = -Infinity;

    for (var i=0; i<colisionables.length; i++)
    {
        var c = colisionables[i];

        if (!c.activo)
            continue;

        var b = c.box;

        if (!solapaXZ(b))
            continue;

        if (velocidadY <= 0)
        {
            // CAYENDO (o quietos): aterrizamos si ANTES estábamos por encima de
            // la cara superior y AHORA la hemos alcanzado o cruzado.
            if (yAnterior >= b.max.y - EPS && p_pos.y <= b.max.y && b.max.y > sueloY)
            {
                sueloY = b.max.y;
                plataformaActual = c;
            }
        }
        else
        {
            // SUBIENDO: si la cabeza cruza la cara inferior, nos golpeamos
            // y empezamos a caer.
            var cabezaAnterior = yAnterior + alturaJugador;

            if (cabezaAnterior <= b.min.y + EPS && p_pos.y + alturaJugador > b.min.y)
            {
                p_pos.y = b.min.y - alturaJugador;
                velocidadY = 0;
            }
        }
    }

    if (plataformaActual)
    {
        p_pos.y = sueloY;
        velocidadY = 0;
        enSuelo = true;

    }

    if (enSuelo)
        framesSinSuelo = 0;
    else
        framesSinSuelo++;
}

function limitesDeSeguridad()
{
    p_pos.x = THREE.MathUtils.clamp(p_pos.x, -585, 585);
    p_pos.z = THREE.MathUtils.clamp(p_pos.z, -595, 435);
}


// Interpola entre dos ángulos por el camino más corto
function girarHacia(actual, objetivo, factor)
{
    var d = objetivo - actual;

    while (d > Math.PI)
        d -= 2 * Math.PI;
    while (d < -Math.PI)
        d += 2 * Math.PI;

    return actual + d * factor;
}


function actualizarJugador()
{
    // ---------- 1) Dirección de movimiento RELATIVA A LA CÁMARA ----------
    var adelante = new THREE.Vector3(Math.sin(anguloCamara), 0, Math.cos(anguloCamara));
    var derecha = new THREE.Vector3(-Math.cos(anguloCamara), 0, Math.sin(anguloCamara));
    var mover = new THREE.Vector3(0, 0, 0);

    if (controls.moveForward)
        mover.add(adelante);
    if (controls.moveBackward)
        mover.sub(adelante);
    if (controls.moveRight)
        mover.add(derecha);
    if (controls.moveLeft)
        mover.sub(derecha);

    var moviendose = mover.lengthSq() > 0;

    if (moviendose)
    {
        // Normaliza para que en diagonal no vaya más rápido
        mover.normalize();
        // El muñeco gira suavemente hacia donde se mueve
        anguloJugador = girarHacia(anguloJugador, Math.atan2(mover.x, mover.z), 0.25);
    }

    // ---------- 2) Salto ----------
    if (bufferSalto > 0)
    {
        bufferSalto--;

        if (enSuelo || framesSinSuelo <= framesCoyote)
        {
            velocidadY = fuerzaSalto;
            enSuelo = false;
            framesSinSuelo = 999;   // evita un segundo salto en el aire
            bufferSalto = 0;
        }
    }

    // ---------- 3) Movimiento horizontal eje por eje ----------
    var dx = mover.x * controls.speed;
    var dz = mover.z * controls.speed;

    if (dx !== 0)
    {
        p_pos.x += dx;
        resolverColisionHorizontal('x', dx);
    }

    if (dz !== 0)
    {
        p_pos.z += dz;
        resolverColisionHorizontal('z', dz);
    }

    limitesDeSeguridad();

    // ---------- 4) Movimiento vertical ----------
    aplicarGravedadYSuelo();

    // ---------- 5) Actualizar el nodo del jugador ----------
    jugador.position.copy(p_pos);
    jugador.rotation.y = anguloJugador;

    actualizarAnimacionPersonaje(moviendose);

    // ---------- 6) Muerte al tocar la lava ----------
    // La lava está en y = 4. Si los PIES llegan a ella, morimos.
    if (p_pos.y <= alturaLava)
        morir();
}


// -------------------------------------------------------------------
// Checkpoints
function guardarCheckpoint(indice)
{
    if (indice <= checkpointActual)
        return;

    checkpointActual = indice;
    posicionCheckpoint.copy(checkpoints[indice].pos);
}


function colocarJugadorEnCheckpoint()
{
    var cp = checkpoints[checkpointActual];
    posicionCheckpoint.copy(cp.pos);

    p_pos.copy(posicionCheckpoint);
    velocidadY = 0;
    enSuelo = false;
    framesSinSuelo = 999;
    bufferSalto = 0;

    // Mirar hacia donde sigue el recorrido
    anguloCamara = cp.yaw;
    anguloJugador = cp.yaw;
    pitchCamara = 0.35;

    jugador.position.copy(p_pos);
    jugador.rotation.y = anguloJugador;

    actualizarCamara(true);
}


// Tecla C: volver al último checkpoint sin morir
function volverACheckpoint()
{
    if (gameOver || victoria)
        return;

    colocarJugadorEnCheckpoint();
    mostrarMensaje('Has vuelto al checkpoint: ' + checkpoints[checkpointActual].nombre, 1500);
}


// Interacción
function buscarInterruptorCercano()
{
    var masCercano = null;
    var distanciaMinima = 99999;

    for (var i=0; i<interruptores.length; i++)
    {
        var interruptor = interruptores[i];

        if (interruptor.userData.activado)
            continue;

        var pos = interruptor.userData.posMundo;
        var ddx = p_pos.x - pos.x;
        var ddz = p_pos.z - pos.z;
        var dy = Math.abs(p_pos.y - pos.y);
        var distancia = Math.sqrt(ddx*ddx + ddz*ddz);

        if (distancia < 60 && dy < 40 && distancia < distanciaMinima)
        {
            distanciaMinima = distancia;
            masCercano = interruptor;
        }
    }

    return masCercano;
}


function interactuar()
{
    if (gameOver || victoria)
        return;

    var interruptor = buscarInterruptorCercano();

    if (interruptor)
        activarInterruptor(interruptor);
    else
        mostrarMensaje('No hay ningún interruptor suficientemente cerca.', 1100);
}


function activarInterruptor(interruptor)
{
    var numero = interruptor.userData.numero;

    interruptor.userData.activado = true;
    numInterruptores++;

    // El botón se pone verde y se hunde (animación con TWEEN)
    var boton = interruptor.userData.boton;
    boton.material.color.setHex(0x51e36e);
    boton.material.emissive.setHex(0x30ff60);
    boton.material.emissiveIntensity = 0.6;

    tweenSimple(boton.position, {y: 7}, 250);

    // Se guarda el checkpoint ligado a este interruptor
    guardarCheckpoint(numero);

    mostrarMensaje('Interruptor ' + numero + ' activado (' + numInterruptores + '/3)' +
                   '  ·  Checkpoint guardado: ' + checkpoints[numero].nombre, 2600);
    actualizarHUD();

    // Al activar el segundo se va la luz
    if (numero === 2 && !apagonActivado)
        programar(activarApagon, 1700);

    // Si ya están los tres, abrimos la puerta
    if (numInterruptores === 3)
        programar(abrirPuerta, 1500);
}


// APAGÓN
function aplicarLuces()
{
    var v = estadoLuces.v;      // 1 = luz normal, 0 = apagón

    luzPrincipal.intensity = INTENSIDAD_PRINCIPAL * v;
    luzAmbiental.intensity = INTENSIDAD_AMBIENTAL_OSCURA +
                             (INTENSIDAD_AMBIENTAL - INTENSIDAD_AMBIENTAL_OSCURA) * v;

    // El fondo y la niebla también se oscurecen un poco
    var color = new THREE.Color(COLOR_OSCURO).lerp(new THREE.Color(COLOR_CLARO), v);
    renderer.setClearColor(color);
}


function activarApagon()
{
    if (apagonActivado)
        return;

    apagonActivado = true;

    mostrarMensaje('¡Se ha ido la luz!', 2600);

    if (typeof TWEEN === 'undefined')
    {
        estadoLuces.v = 0;
        aplicarLuces();
        terminarApagon();
        return;
    }

    // Parpadeo: [valor de luz, duración en ms]
    var secuencia = [
        [0.10, 90], [0.90, 130], [0.00, 70], [0.65, 110],
        [0.05, 80], [0.45, 160], [0.00, 500]
    ];

    var primero = null;
    var anterior = null;

    for (var i=0; i<secuencia.length; i++)
    {
        var t = new TWEEN.Tween(estadoLuces).to({v: secuencia[i][0]}, secuencia[i][1]);
        t.onUpdate(aplicarLuces);

        if (anterior)
            anterior.chain(t);       // cada tween empieza cuando acaba el anterior
        else
            primero = t;

        anterior = t;
    }

    anterior.onComplete(terminarApagon);
    primero.start();
}


function terminarApagon()
{
    // Linterna
    tweenSimple(linterna, {intensity: INTENSIDAD_LINTERNA}, 700);
    mostrarMensaje('Tu linterna se ha encendido: ilumina hacia donde mira la cámara', 3500);

    // El ambiente cambia: más niebla, lava más intensa, estrellas brillando
    tweenSimple(scene.fog, {density: 0.0011}, 3000);
    tweenSimple(luzLava, {intensity: INTENSIDAD_LAVA_APAGON}, 1500);
    tweenSimple(materialEstrella, {emissiveIntensity: 1.3}, 2500);

    // La sorpresa del peluche, unos segundos después
    programar(secuenciaPeluche, 3500);
}


// Los ojos y su luz dependen de estadoOjos.v (0..1)
function aplicarOjos()
{
    var v = estadoOjos.v;

    for (var i=0; i<ojosPeluche.length; i++)
        ojosPeluche[i].visible = v > 0.02;

    materialOjos.emissiveIntensity = 2.0 * v;
    luzOjos.intensity = 1.3 * v;
}


// El peluche gira la cabeza hacia el jugador, sus ojos se encienden, parpadean y se apagan lentamente.
function secuenciaPeluche()
{
    // 1) La cabeza gira lentamente hacia donde está el jugador
    var easing = (typeof TWEEN !== 'undefined' && TWEEN.Easing) ? TWEEN.Easing.Quadratic.InOut : null;
    tweenSimple(cabezaPeluche.rotation, {y: 0.95}, 2600, easing);

    if (typeof TWEEN === 'undefined')
    {
        estadoOjos.v = 1;
        aplicarOjos();
        return;
    }

    // 2) Ojos: aparecen, se quedan, parpadean y se apagan. [brillo, ms]
    var secuencia = [
        [1.0, 700], [1.0, 2600],
        [0.0, 90], [1.0, 90], [0.0, 90], [1.0, 150],
        [1.0, 1500], [0.0, 2500]
    ];

    var primero = null;
    var anterior = null;

    for (var i=0; i<secuencia.length; i++)
    {
        var t = new TWEEN.Tween(estadoOjos).to({v: secuencia[i][0]}, secuencia[i][1]);
        t.onUpdate(aplicarOjos);

        if (anterior)
            anterior.chain(t);
        else
            primero = t;

        anterior = t;
    }

    primero.delay(1200).start();
}


// Al final del juego el peluche "aparece" al fondo del pasillo de salida.
function pelucheAlPasillo()
{
    peluche.position.set(0, 70, -572);
    peluche.rotation.y = 0;                // mirando hacia la puerta (+z)
    cabezaPeluche.rotation.y = 0;

    tweenSimple(estadoOjos, {v: 0.75}, 1200, null, aplicarOjos);
}


function abrirPuerta()
{
    if (puertaAbierta)
        return;

    puertaAbierta = true;

    mostrarMensaje('¡Puerta desbloqueada! Baja al pedestal verde y cruza la puerta.', 3800);

    // La hoja deja de ser un obstáculo
    colliderPuerta.activo = false;

    var easingPuerta = (typeof TWEEN !== 'undefined' && TWEEN.Easing)
        ? TWEEN.Easing.Quadratic.InOut
        : null;

    // Gira el nodo BISAGRA +90º en Y: la hoja se abre hacia fuera
    tweenSimple(puerta.rotation, {y: Math.PI / 2}, 1800, easingPuerta);

    // La luz del pasillo se enciende
    tweenSimple(luzSalida, {intensity: 1.8}, 1500);

    programar(pelucheAlPasillo, 2600);
}


function comprobarVictoria()
{
    if (!puertaAbierta || victoria)
        return;

    // Hemos entrado en la zona final del pasillo
    if (zonaVictoria.containsPoint(p_pos))
    {
        victoria = true;
        soltarTeclas();

        // Al ganar, el personaje saluda
    if (
        personajeGLTFCargado &&
        acciones.wave
    )
    {
        cambiarAnimacionPersonaje(
            'wave'
        );
    }

        var segundos = Math.floor(tiempoJuego);
        var puntos = Math.max(100, 1500 - muertes * 100 - segundos * 2); // Empiezas con 1500 puntos y vas perdiendo puntuación según muertes y tiempo
        document.getElementById('resumenVictoria').textContent =
            'Tiempo: ' + formatearTiempo(segundos) + '  ·  Muertes: ' + muertes +
            '  ·  Puntuación: ' + puntos;

        document.getElementById('victoria').style.display = 'flex';
        document.getElementById('aviso').style.display = 'none';
    }
}


function morir()
{
    if (gameOver || victoria)
        return;

    gameOver = true;
    puedeReaparecer = false;
    muertes++;
    soltarTeclas();

    document.getElementById('checkpointMuerte').textContent = checkpoints[checkpointActual].nombre;
    document.getElementById('muerte').style.display = 'flex';
    document.getElementById('aviso').style.display = 'none';

    // El juguete "se derrite": se encoge con TWEEN
    escalaOriginalModelo = modeloJugador.scale.clone();
    tweenSimple(modeloJugador.scale, {x:0.01, y:0.01, z:0.01}, 450);

    // Tras 0.7 s se puede saltar la espera con ESPACIO/ENTER;
    // a los 2.6 s reaparecemos automáticamente.
    timeoutPuedeReaparecer = setTimeout(function(){ puedeReaparecer = true; }, 700);
    timeoutAutoReaparecer = setTimeout(reaparecerEnCheckpoint, 2600);

    actualizarHUD();
}


function reaparecerSiPuede()
{
    if (gameOver && puedeReaparecer)
        reaparecerEnCheckpoint();
}


// Reaparecer NO reinicia el nivel: se mantienen interruptores, puerta, apagón...
function reaparecerEnCheckpoint()
{
    clearTimeout(timeoutPuedeReaparecer);
    clearTimeout(timeoutAutoReaparecer);

    if (!gameOver)
        return;

    gameOver = false;
    puedeReaparecer = false;

    document.getElementById('muerte').style.display = 'none';

    restaurarEscalaJugador();
    colocarJugadorEnCheckpoint();

    mostrarMensaje('Has reaparecido en: ' + checkpoints[checkpointActual].nombre, 1800);
}


function restaurarEscalaJugador()
{
    if (escalaOriginalModelo)
        modeloJugador.scale.copy(escalaOriginalModelo);
}


// Tecla R: reinicio COMPLETO desde cero
function reiniciarJuego()
{
    cancelarProgramados();
    clearTimeout(timeoutPuedeReaparecer);
    clearTimeout(timeoutAutoReaparecer);

    // Cancela todas las animaciones TWEEN en curso
    if (typeof TWEEN !== 'undefined' && TWEEN.removeAll)
        TWEEN.removeAll();

    gameOver = false;
    victoria = false;
    puedeReaparecer = false;
    soltarTeclas();

    document.getElementById('muerte').style.display = 'none';
    document.getElementById('victoria').style.display = 'none';
    document.getElementById('aviso').style.display = 'none';

    // Estado del juego
    numInterruptores = 0;
    puertaAbierta = false;
    apagonActivado = false;
    muertes = 0;
    tiempoJuego = 0;
    checkpointActual = 0;

    // Restaurar interruptores
    for (var i=0; i<interruptores.length; i++)
    {
        var inter = interruptores[i];
        inter.userData.activado = false;
        inter.userData.boton.material.color.setHex(0xff4545);
        inter.userData.boton.material.emissive.setHex(0xff2020);
        inter.userData.boton.position.y = inter.userData.yBotonInicial;
    }

    // Restaurar puerta
    puerta.rotation.y = 0;
    colliderPuerta.activo = true;

    // Restaurar luces y ambiente
    estadoLuces.v = 1;
    aplicarLuces();
    luzLava.intensity = INTENSIDAD_LAVA;
    linterna.intensity = 0;
    luzSalida.intensity = 0;
    scene.fog.density = 0;
    materialEstrella.emissiveIntensity = 0.25;

    // Restaurar peluche
    estadoOjos.v = 0;
    aplicarOjos();
    peluche.position.copy(POS_PELUCHE_INICIAL);
    peluche.rotation.y = -Math.PI / 2;
    cabezaPeluche.rotation.y = 0;

    // Restaurar cámara y personaje
    distanciaTercera = 125;
    estadoCamara.distancia = distanciaTercera;

    restaurarEscalaJugador();
    colocarJugadorEnCheckpoint();
    actualizarHUD();

    mostrarMensaje('¡Nuevo intento! Activa los tres interruptores.', 2200);
}


// -------------------------------------------------------------------
// CÁMARA
function limitarPitch()
{
    // En tercera persona no dejamos bajar la cámara por debajo del suelo
    pitchCamara = THREE.MathUtils.clamp(pitchCamara, -0.15, 1.3);
}

// Evita que la cámara atraviese paredes y techo
function limitarCamara(pos)
{
    pos.y = THREE.MathUtils.clamp(pos.y, 8, 482);

    if (p_pos.z < -436)
    {
        // Jugador en el pasillo: la cámara solo puede estar dentro del hueco de la puerta
        pos.x = THREE.MathUtils.clamp(pos.x, -66, 66);
        pos.z = THREE.MathUtils.clamp(pos.z, -595, 432);
    }
    else
    {
        pos.x = THREE.MathUtils.clamp(pos.x, -582, 582);
        pos.z = THREE.MathUtils.clamp(pos.z, -432, 432);
    }
}


function controlarCamaraConTeclado()
{
    // Flechas: giran la cámara
    if (controls.camIzquierda)
        anguloCamara += 0.04;
    if (controls.camDerecha)
        anguloCamara -= 0.04;
    if (controls.camArriba)
        pitchCamara -= 0.03;
    if (controls.camAbajo)
        pitchCamara += 0.03;

    limitarPitch();
}


function actualizarCamara(inmediata)
{
    // Punto que sigue la cámara: aproximadamente la cabeza del jugador
    var cabeza =
        new THREE.Vector3(
            p_pos.x,
            p_pos.y + alturaOjos,
            p_pos.z
        );

    if (inmediata)
        camObjetivo.copy(cabeza);
    else
        camObjetivo.lerp(cabeza, 0.2);


    // Dirección hacia la que mira la cámara
    dirVista.set(

        Math.sin(anguloCamara) *
        Math.cos(pitchCamara),

        -Math.sin(pitchCamara),

        Math.cos(anguloCamara) *
        Math.cos(pitchCamara)

    );


    // Coloca la cámara detrás del jugador
    var pos =
        camObjetivo
            .clone()
            .sub(
                dirVista
                    .clone()
                    .multiplyScalar(
                        estadoCamara.distancia
                    )
            );


    // Evita atravesar paredes y techo
    limitarCamara(pos);
    camera.position.copy(pos);


    // Siempre mira hacia el jugador
    camera.lookAt(camObjetivo);


    // El personaje siempre se ve
    if (modeloJugador)
        modeloJugador.visible = true;


    // Linterna
    if (linterna && objetivoLinterna)
    {
        linterna.position
            .copy(cabeza)
            .add(
                dirVista
                    .clone()
                    .multiplyScalar(14)
            );


        objetivoLinterna.position
            .copy(cabeza)
            .add(
                dirVista
                    .clone()
                    .multiplyScalar(220)
            );
    }
}


// -------------------------------------------------------------------
// UI

function mostrarMensaje(texto, duracion)
{
    var mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.style.display = 'block';

    if (timeoutMensaje)
        clearTimeout(timeoutMensaje);

    timeoutMensaje = setTimeout(function()
    {
        mensaje.style.display = 'none';
    }, duracion || 1500);
}


function formatearTiempo(segundos)
{
    var m = Math.floor(segundos / 60);
    var s = segundos % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}


function actualizarHUD()
{
    document.getElementById('contadorInterruptores').textContent = numInterruptores + ' / 3';
    document.getElementById('checkpointHUD').textContent = checkpoints[checkpointActual].nombre;
    document.getElementById('muertesHUD').textContent = muertes;
    document.getElementById('tiempoHUD').textContent = formatearTiempo(Math.floor(tiempoJuego));
}


// Muestra "E - activar interruptor" cuando hay uno al alcance
function actualizarAvisoInteraccion()
{
    var aviso = document.getElementById('aviso');
    aviso.style.display = buscarInterruptorCercano() ? 'block' : 'none';
}


// Temporizadores
function programar(funcion, ms)
{
    var id = setTimeout(funcion, ms);
    temporizadores.push(id);
    return id;
}

function cancelarProgramados()
{
    for (var i=0; i<temporizadores.length; i++)
        clearTimeout(temporizadores[i]);

    temporizadores = [];
}


// -------------------------------------------------------------------

function tweenSimple(objeto, destino, duracion, easing, alActualizar, alTerminar)
{
    if (typeof TWEEN !== 'undefined')
    {
        var t = new TWEEN.Tween(objeto).to(destino, duracion);

        if (easing)
            t.easing(easing);

        if (alActualizar)
            t.onUpdate(alActualizar);

        if (alTerminar)
            t.onComplete(alTerminar);

        t.start();
        return t;
    }

    for (var propiedad in destino)
        objeto[propiedad] = destino[propiedad];

    if (alActualizar)
        alActualizar();
    if (alTerminar)
        alTerminar();

    return null;
}


function updateAspectRatio()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}


// UPDATE (se llama 60 veces por segundo, a paso fijo)
function animarEntorno()
{
    // Animar lava desplazando la textura
    if (texturaLava)
    {
        texturaLava.offset.x += 0.0007;
        texturaLava.offset.y += 0.0012;
    }

    // El móvil del techo gira (más rápido tras el apagón)
    if (brazosMovil)
    {
        brazosMovil.rotation.y += apagonActivado ? 0.2 : 0.004;
        movil.rotation.z = Math.sin(tiempoFrames * 0.01) * 0.03;
    }

    // Los interruptores sin activar "palpitan" para llamar la atención
    for (var i=0; i<interruptores.length; i++)
    {
        var inter = interruptores[i];

        if (!inter.userData.activado)
            inter.userData.boton.material.emissiveIntensity = 0.55 + 0.45 * Math.sin(tiempoFrames * 0.1 + i);
    }
}


function update(delta)
{
    tiempoFrames++;
    animarEntorno();

    // Solo actualiza el juego mientras seguimos jugando
    if (!gameOver && !victoria)
    {
        tiempoJuego += delta; // delta es el tiempo real transcurrido desde el frame anterior

        // Movimiento, salto, gravedad y colisiones
        actualizarJugador();
        comprobarVictoria();

        // Mostrar "E - activar" si estamos cerca de un interruptor
        if (!gameOver && !victoria)
            actualizarAvisoInteraccion();

        if (tiempoFrames % 15 === 0)
            actualizarHUD();
    }
    // Actualizar las animaciones del personaje GLTF
    if (mixer)
        mixer.update(delta);


    // Actualizar cámara
    controlarCamaraConTeclado();
    actualizarCamara(false);
}


function render()
{
    requestAnimationFrame(render);

    // Tiempo transcurrido desde el frame anterior
    var delta = reloj.getDelta();

    // Actualizar lógica del juego
    update(delta);

    // Actualizar animaciones TWEEN
    if (typeof TWEEN !== 'undefined')
        TWEEN.update();

    // Dibujar la escena
    renderer.render(scene, camera);
}
