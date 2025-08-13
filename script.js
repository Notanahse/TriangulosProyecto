const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const entradaTamano = document.getElementById('tamanoCuadricula');
const botonIniciar = document.getElementById('botonIniciar');
const controlVelocidad = document.getElementById('velocidad');
const contador = document.getElementById('contador');

const VELOCIDAD_MIN = parseInt(controlVelocidad.min);
const VELOCIDAD_MAX = parseInt(controlVelocidad.max);

let idAnimacion = null;
let enEjecucion = false;

function obtenerPuntosCuadricula(n) {
  const tamano = lienzo.width;
  const espacio = tamano / n;
  const puntos = [];
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      puntos.push({ x: j * espacio, y: i * espacio });
    }
  }
  return { puntos, espacio };
}

function dibujarCuadricula(n, espacio) {
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 1;
  for (let i = 0; i <= n; i++) {
    const pos = i * espacio;
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(lienzo.width, pos);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, lienzo.height);
    ctx.stroke();
  }
}

function tipoTriangulo(a, b, c) {
  function distancia(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
  const d1 = distancia(a, b);
  const d2 = distancia(b, c);
  const d3 = distancia(c, a);
  const lados = [d1, d2, d3].sort((x, y) => x - y);
  const [l1, l2, l3] = lados;
  const iguales = (x, y) => Math.abs(x - y) < 1e-2;

  if (iguales(l1, l2) && iguales(l2, l3)) return 'equilátero';
  if (iguales(l1, l2) || iguales(l2, l3) || iguales(l1, l3)) return 'isósceles';
  if (Math.abs(l1 * l1 + l2 * l2 - l3 * l3) < 1e-1) return 'rectángulo';
  return 'escaleno';
}

function colorPorTipo(tipo) {
  switch (tipo) {
    case 'equilátero': return 'rgba(255, 0, 0, 0.3)';
    case 'isósceles': return 'rgba(0, 255, 0, 0.3)';
    case 'rectángulo': return 'rgba(0, 0, 255, 0.3)';
    case 'escaleno': return 'rgba(255, 255, 0, 0.3)';
  }
}

async function dibujarTriangulos(puntos, n, espacio) {
  const conteoTipos = { equilátero: 0, isósceles: 0, rectángulo: 0, escaleno: 0 };
  const totalPuntos = puntos.length;

  for (let i = 0; i < totalPuntos - 2; i++) {
    for (let j = i + 1; j < totalPuntos - 1; j++) {
      for (let k = j + 1; k < totalPuntos; k++) {
        const a = puntos[i], b = puntos[j], c = puntos[k];
        const tipo = tipoTriangulo(a, b, c);
        conteoTipos[tipo]++;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = colorPorTipo(tipo);
        ctx.fill();

        await new Promise(res => setTimeout(res, VELOCIDAD_MAX - controlVelocidad.value + VELOCIDAD_MIN));
        if (!enEjecucion) return;
      }
    }
  }

  const total = Object.values(conteoTipos).reduce((a, b) => a + b, 0);
  contador.innerHTML = `
    <p><strong>Total:</strong> ${total}</p>
    <ul>
      ${Object.entries(conteoTipos).map(([tipo, cantidad]) => `<li>${tipo}: ${cantidad}</li>`).join('')}
    </ul>
  `;
}

botonIniciar.addEventListener('click', () => {
  if (enEjecucion) {
    enEjecucion = false;
    botonIniciar.textContent = 'Iniciar';
    return;
  }

  enEjecucion = true;
  botonIniciar.textContent = 'Reiniciar';
  const n = parseInt(entradaTamano.value);
  const { puntos, espacio } = obtenerPuntosCuadricula(n);
  dibujarCuadricula(n, espacio);
  dibujarTriangulos(puntos, n, espacio);
});
