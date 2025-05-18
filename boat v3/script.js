const size = 10;
const tableroJugador = [];
const tableroIA = [];
const barcosIA = [];
const barcosJugador = [];

let barcoSeleccionado = null;
let nombreSeleccionado = "";
let orientacion = "H";
let barcosColocados = 0;
const barcosPendientes = {
  Portaaviones: 5,
  Acorazado: 4,
  Crucero: 3,
  Submarino: 3,
  Destructor: 2
};

function crearTablero(tablero, esJugador) {
  for (let y = 0; y < size; y++) {
    const fila = [];
    for (let x = 0; x < size; x++) {
      fila.push({ tieneBarco: false, disparado: false });
    }
    tablero.push(fila);
  }

  if (!esJugador) {
    colocarBarcos(tablero, barcosIA);
    pintarTablero(tablero, "ia", false);
  } else {
    pintarTablero(tablero, "jugador", true);
  }
}

function colocarBarcos(tablero, listaBarcos) {
  const tamaños = [5, 4, 3, 3, 2];
  for (let size of tamaños) {
    let colocado = false;
    while (!colocado) {
      let x = Math.floor(Math.random() * (10 - size));
      let y = Math.floor(Math.random() * 10);
      let horizontal = Math.random() > 0.5;
      let espacioLibre = true;
      for (let i = 0; i < size; i++) {
        let cx = horizontal ? x + i : x;
        let cy = horizontal ? y : y + i;
        if (cx >= 10 || cy >= 10 || tablero[cy][cx].tieneBarco) {
          espacioLibre = false;
          break;
        }
      }
      if (espacioLibre) {
        let coords = [];
        for (let i = 0; i < size; i++) {
          let cx = horizontal ? x + i : x;
          let cy = horizontal ? y : y + i;
          tablero[cy][cx].tieneBarco = true;
          coords.push([cx, cy]);
        }
        listaBarcos.push({ coords, hundido: false });
        colocado = true;
      }
    }
  }
}

function pintarTablero(tablero, id, mostrarBarcos) {
  const contenedor = document.getElementById(id);
  contenedor.innerHTML = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const casilla = document.createElement("div");
      casilla.classList.add("casilla");
      const celda = tablero[y][x];
      if (celda.disparado) {
        if (celda.tieneBarco) {
          casilla.classList.add("tocado");
        } else {
          casilla.classList.add("agua");
        }
      } else if (mostrarBarcos && celda.tieneBarco) {
        casilla.classList.add("barco");
      }
      contenedor.appendChild(casilla);
    }
  }
}

function seleccionarBarco(nombre, tamano) {
  barcoSeleccionado = tamano;
  nombreSeleccionado = nombre;
}

function cambiarOrientacion() {
  orientacion = orientacion === "H" ? "V" : "H";
}

function esPosicionValida(tablero, x, y, tamano, orientacion) {
  for (let i = 0; i < tamano; i++) {
    let cx = orientacion === "H" ? x + i : x;
    let cy = orientacion === "H" ? y : y + i;
    if (cx >= 10 || cy >= 10 || tablero[cy][cx].tieneBarco) {
      return false;
    }
  }
  return true;
}

function colocarBarco(tablero, listaBarcos, x, y, tamano, nombre, orientacion) {
  let coords = [];
  for (let i = 0; i < tamano; i++) {
    let cx = orientacion === "H" ? x + i : x;
    let cy = orientacion === "H" ? y : y + i;
    tablero[cy][cx].tieneBarco = true;
    coords.push([cx, cy]);
  }
  listaBarcos.push({ nombre, coords, hundido: false });
}

document.getElementById("jugador").addEventListener("click", (e) => {
  if (!barcoSeleccionado) return;

  const casillas = [...e.currentTarget.children];
  const index = casillas.indexOf(e.target);
  const x = index % size;
  const y = Math.floor(index / size);

  if (esPosicionValida(tableroJugador, x, y, barcoSeleccionado, orientacion)) {
    colocarBarco(tableroJugador, barcosJugador, x, y, barcoSeleccionado, nombreSeleccionado, orientacion);
    pintarTablero(tableroJugador, "jugador", true);

    delete barcosPendientes[nombreSeleccionado];
    barcoSeleccionado = null;
    nombreSeleccionado = "";
    barcosColocados++;

    if (barcosColocados === 5) {
      document.getElementById("btnJugar").disabled = false;
    }
  } else {
    alert("Posición inválida");
  }
});

function iniciarJuego() {
  document.getElementById("btnJugar").disabled = true;
  document.getElementById("disparoForm").style.display = "block";
  pintarTablero(tableroIA, "ia", false);
}

document.getElementById("disparoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const x = parseInt(document.getElementById("x").value);
  const y = parseInt(document.getElementById("y").value);
  disparar(x, y);
  document.getElementById("disparoForm").reset();
});

function disparar(x, y) {
  if (tableroIA[y][x].disparado) {
    mostrarMensaje("¡Ya disparaste ahí!");
    return;
  }

  tableroIA[y][x].disparado = true;

  if (tableroIA[y][x].tieneBarco) {
    mostrarMensaje("¡Tocado!");
    checkHundido(tableroIA, barcosIA, x, y);
  } else {
    mostrarMensaje("Agua.");
    setTimeout(turnoIA, 1000);
  }

  pintarTablero(tableroIA, "ia", false);
  checkFinJuego(tableroIA, barcosIA);
}

function turnoIA() {
  let x, y;
  do {
    x = Math.floor(Math.random() * size);
    y = Math.floor(Math.random() * size);
  } while (tableroJugador[y][x].disparado);

  tableroJugador[y][x].disparado = true;

  if (tableroJugador[y][x].tieneBarco) {
    mostrarMensaje("¡La IA te ha tocado!");
    checkHundido(tableroJugador, barcosJugador, x, y);
    pintarTablero(tableroJugador, "jugador", true);
    setTimeout(turnoIA, 1000); 
  } else {
    mostrarMensaje("La IA falló.");
    pintarTablero(tableroJugador, "jugador", true);
  }

  checkFinJuego(tableroJugador, barcosJugador);
}

function checkHundido(tablero, barcos, x, y) {
  for (let barco of barcos) {
    let hundido = barco.coords.every(([bx, by]) => tablero[by][bx].disparado);
    if (hundido && !barco.hundido) {
      barco.hundido = true;
      barco.coords.forEach(([bx, by]) => {
        tablero[by][bx].hundido = true;
      });
      mostrarMensaje("¡Hundido!");
    }
  }
}

function checkFinJuego(tablero, barcos) {
  if (barcos.every(b => b.hundido)) {
    mostrarMensaje("¡Fin del juego!");
  }
}

function mostrarMensaje(msg) {
  document.getElementById("mensaje").innerText = msg;
}

crearTablero(tableroJugador, true);
crearTablero(tableroIA, false);
