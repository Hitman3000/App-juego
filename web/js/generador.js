// Generador de Casos y Visitas — Logic-Play UPTT (Inspector Lógico)

function elegir(lista) {
  if (!lista || lista.length === 0) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

let casosUsadosPorNivel = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};

function reiniciarHistorialCasos(nivel) {
  if (nivel) {
    casosUsadosPorNivel[nivel] = [];
  } else {
    casosUsadosPorNivel = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  }
}

function generarVisitaLogica(nivel) {
  const casosDelNivel = CASOS_LOGICA.filter(c => c.nivel === nivel);
  let disponibles = casosDelNivel.filter(c => !casosUsadosPorNivel[nivel].includes(c.id));

  if (disponibles.length === 0) {
    casosUsadosPorNivel[nivel] = [];
    disponibles = casosDelNivel;
  }

  const casoElegido = elegir(disponibles);
  casosUsadosPorNivel[nivel].push(casoElegido.id);

  const estudiante = elegir(ESTUDIANTES_PNFI);
  const saludo = elegir(SALUDOS_ACADEMICOS);

  return {
    ...casoElegido,
    estudiante: {
      nombre: estudiante.nombre,
      rol: estudiante.rol,
      carnet: estudiante.carnet,
      foto: estudiante.foto,
      fotoCarnet: estudiante.fotoCarnet || estudiante.foto,
      rostro: estudiante.rostro ? clonarRostro(estudiante.rostro) : null
    },
    saludo: saludo
  };
}
