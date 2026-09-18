/**
 * seed.js — Datos de prueba para D.D.D.
 * Ejecutar con: node seed.js
 */

const API = 'http://localhost:3000/api';

// Jugadores con perfiles realistas
const jugadores = [
  { nombre: 'Hitman3000',   nivel: 5, skill: 'elite' },
  { nombre: 'LauraB',       nivel: 4, skill: 'alto' },
  { nombre: 'DanielDDD',    nivel: 4, skill: 'alto' },
  { nombre: 'MarcosR',      nivel: 3, skill: 'medio' },
  { nombre: 'Sofia_P',      nivel: 5, skill: 'elite' },
  { nombre: 'Juanito99',    nivel: 2, skill: 'bajo' },
  { nombre: 'ElenaT',       nivel: 3, skill: 'medio' },
  { nombre: 'Rafa_DDD',     nivel: 4, skill: 'alto' },
  { nombre: 'CristinaM',    nivel: 2, skill: 'bajo' },
  { nombre: 'Pablo_X',      nivel: 3, skill: 'medio' },
  { nombre: 'Valentina',    nivel: 5, skill: 'elite' },
  { nombre: 'Sergio_99',    nivel: 1, skill: 'novato' },
  { nombre: 'AndreaDDD',    nivel: 3, skill: 'medio' },
  { nombre: 'LucasGG',      nivel: 4, skill: 'alto' },
  { nombre: 'NataliaK',     nivel: 2, skill: 'bajo' },
];

// Parámetros por perfil de habilidad
const perfiles = {
  elite:  { puntMin: 900, puntMax: 1500, precMin: 82, precMax: 98, inspMin: 1, inspMax: 3 },
  alto:   { puntMin: 600, puntMax: 950,  precMin: 65, precMax: 85, inspMin: 2, inspMax: 5 },
  medio:  { puntMin: 350, puntMax: 650,  precMin: 50, precMax: 70, inspMin: 3, inspMax: 7 },
  bajo:   { puntMin: 150, puntMax: 380,  precMin: 35, precMax: 55, inspMin: 4, inspMax: 9 },
  novato: { puntMin: 50,  puntMax: 200,  precMin: 20, precMax: 40, inspMin: 5, inspMax: 12 },
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarPartida(jugador) {
  const p = perfiles[jugador.skill];
  const puntuacion = rand(p.puntMin, p.puntMax);
  const precision = rand(p.precMin, p.precMax) / 100;
  const totalAcciones = rand(8, 20);
  const aciertos = Math.round(totalAcciones * precision);
  const fallos = totalAcciones - aciertos;
  const nivel_alcanzado = rand(1, jugador.nivel);
  const tiempo_jugado = rand(60, 480);
  const inspecciones_doc = rand(
    p.inspMin * totalAcciones,
    p.inspMax * totalAcciones
  );

  return {
    nombre: jugador.nombre,
    puntuacion,
    nivel_alcanzado,
    aciertos,
    fallos,
    tiempo_jugado,
    inspecciones_doc,
  };
}

async function postPartida(datos) {
  const resp = await fetch(`${API}/partida`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  return resp.json();
}

async function seed() {
  console.log('Insertando datos de prueba en D.D.D...\n');
  let ok = 0, err = 0;

  for (const jugador of jugadores) {
    const numPartidas = rand(3, 8);
    for (let i = 0; i < numPartidas; i++) {
      const partida = generarPartida(jugador);
      try {
        const result = await postPartida(partida);
        if (result.ok) {
          ok++;
          process.stdout.write(`  OK ${jugador.nombre} — partida #${i+1}: ${partida.puntuacion} pts (Nv${partida.nivel_alcanzado})\n`);
        } else {
          err++;
          process.stdout.write(`  ERR ${jugador.nombre} — error: ${JSON.stringify(result)}\n`);
        }
      } catch (e) {
        err++;
        console.error(`  ERR ${jugador.nombre}:`, e.message);
      }
    }
  }

  console.log(`\nSeed completado: ${ok} partidas insertadas, ${err} errores.`);

  try {
    const resp = await fetch(`${API}/estadisticas`);
    const data = await resp.json();
    const s = data.estadisticas;
    console.log('\nEstadisticas resultantes:');
    console.log(`  Jugadores:     ${s.total_jugadores}`);
    console.log(`  Partidas:      ${s.total_partidas}`);
    console.log(`  Prom. puntaje: ${s.promedio_puntuacion}`);
    console.log(`  Max. puntaje:  ${s.puntuacion_maxima}`);
    console.log(`  Precision:     ${s.precision_global}%`);
  } catch (e) {
    console.error('No se pudo obtener estadisticas:', e.message);
  }
}

seed();
