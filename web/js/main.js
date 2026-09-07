let estado = {
  dia: 1,
  visitas: [],
  indice: 0,
  vidas: CONFIG.VIDAS,
  aciertos: 0,
  puntos: 0,
  ocupado: false
};

let sesion = {
  inicio: 0,
  fallos: 0,
  inspeccionesDoc: 0
};

function comenzarNivel(nivel) {
  estado.dia = nivel || 1;
  estado.aciertos = 0;
  estado.indice = 0;
  estado.ocupado = false;
  
  reiniciarHistorialCasos(estado.dia);

  if (nivel === 1 || !sesion.inicio) {
    sesion.inicio = Date.now();
    sesion.fallos = 0;
    sesion.inspeccionesDoc = 0;
    inspeccionesDoc = 0;
  }

  siguienteCaso();
}

function siguienteCaso() {
  const caso = generarVisitaLogica(estado.dia);
  estado.visitas.push(caso);
  
  renderCabecera(estado.dia, estado.aciertos, CONFIG.CASOS_POR_NIVEL, estado.vidas, estado.puntos);
  renderCaso(caso);
  estado.ocupado = false;
}

function finDeNivel() {
  syncStats();
  if (typeof AudioJuego !== "undefined") AudioJuego.fanfarria();

  if (estado.dia >= CONFIG.NIVELES_TOTALES) {
    mostrarModalFeedback(
      true,
      "¡DICTAMEN GLOBAL COMPLETADO!",
      "Inspector Oficial del PNFI - UPTTMBI",
      "Has superado con éxito los 5 niveles del Manual del Inspector Lógico. Puntuación final: " + estado.puntos + " pts.",
      "Demostraste dominio en Abstracción, Segmentación, Formalización, Validación e Inferencia.",
      reiniciar
    );
  } else {
    const siguiente = estado.dia + 1;
    const infoSig = CONFIG.NIVELES_INFO[siguiente] || { nombre: "Nivel " + siguiente };
    mostrarModalFeedback(
      true,
      "¡NIVEL " + estado.dia + " COMPLETADO!",
      "5 Casos Analizados Correctamente",
      "Puntuación acumulada: " + estado.puntos + " pts · Vidas restantes: " + estado.vidas,
      "Próxima asignación: " + infoSig.nombre + " (" + infoSig.tema + ")",
      () => comenzarNivel(siguiente)
    );
  }
}

function avanzarTrasDecision() {
  if (estado.vidas <= 0) {
    syncStats();
    if (typeof AudioJuego !== "undefined") AudioJuego.error();
    mostrarModalFeedback(
      false,
      "TURNO SUSPENDIDO",
      "Agotaste las 3 vidas de inspección",
      "Has acumulado 3 errores de dictamen en este nivel. Repasa la teoría en el Manual del Inspector y vuelve a intentarlo.",
      "Puntuación final: " + estado.puntos + " pts.",
      reiniciar
    );
    return;
  }

  if (estado.aciertos >= CONFIG.CASOS_POR_NIVEL) {
    finDeNivel();
    return;
  }

  ocultarPersona();
  setTimeout(siguienteCaso, 600);
}

function decidir(accionBoton) {
  if (estado.ocupado) return;
  const caso = estado.visitas[estado.visitas.length - 1];
  if (!caso) return;

  estado.ocupado = true;
  if (typeof dniVisible !== "undefined" && dniVisible) toggleDni();

  if (typeof AudioJuego !== "undefined") AudioJuego.sello();

  // Mapeo según el nivel activo
  let decisionReal = accionBoton;
  const esFalso = accionBoton === 'izq' || accionBoton === 'falso' || accionBoton === 'F' || accionBoton === 'f';
  const esVerdadero = accionBoton === 'der' || accionBoton === 'verdadero' || accionBoton === 'V' || accionBoton === 'v';

  if (caso.nivel === 1) {
    // F -> RECHAZAR, V -> ADMITIR
    if (esFalso) decisionReal = 'RECHAZAR';
    if (esVerdadero) decisionReal = 'ADMITIR';
  } else if (caso.nivel === 4) {
    if (esFalso) decisionReal = 'CONTRADICCION';
    if (esVerdadero) decisionReal = 'TAUTOLOGIA';
  } else if (caso.nivel === 5) {
    if (esFalso) decisionReal = 'INVALIDO';
    if (esVerdadero) decisionReal = 'VALIDO';
  }

  const fb = textoFeedbackCaso(caso, decisionReal);

  if (fb.acierto) {
    estado.aciertos++;
    estado.puntos += CONFIG.PUNTOS_ACIERTO * estado.dia;
    setBombillo("verde");
    if (typeof AudioJuego !== "undefined") AudioJuego.moneda();

    renderCabecera(estado.dia, estado.aciertos, CONFIG.CASOS_POR_NIVEL, estado.vidas, estado.puntos);

    mostrarModalFeedback(
      true,
      fb.titulo,
      CONFIG.NIVELES_INFO[caso.nivel].nombre,
      fb.texto,
      fb.detalle,
      avanzarTrasDecision
    );
  } else {
    estado.vidas--;
    sesion.fallos++;
    estado.puntos = Math.max(0, estado.puntos - CONFIG.PUNTOS_ERROR);

    renderCabecera(estado.dia, estado.aciertos, CONFIG.CASOS_POR_NIVEL, estado.vidas, estado.puntos);

    dispararAlarma(() => {
      mostrarModalFeedback(
        false,
        fb.titulo,
        CONFIG.NIVELES_INFO[caso.nivel].nombre,
        fb.texto,
        fb.detalle,
        avanzarTrasDecision
      );
    });
  }
}

function reiniciar() {
  estado.vidas = CONFIG.VIDAS;
  estado.puntos = 0;
  estado.visitas = [];
  estado.aciertos = 0;
  comenzarNivel(1);
}

function enlazarBotones() {
  const btnIzq = $("hit-lock");
  const btnDer = $("hit-unlock");

  const dispararIzq = (e) => {
    e.preventDefault();
    e.stopPropagation();
    decidir("izq");
  };

  const dispararDer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    decidir("der");
  };

  btnIzq.addEventListener("pointerdown", dispararIzq);
  btnIzq.addEventListener("click", dispararIzq);

  btnDer.addEventListener("pointerdown", dispararDer);
  btnDer.addEventListener("click", dispararDer);

  // Atajos de teclado: V (Verdadero) y F (Falso)
  window.addEventListener("keydown", (e) => {
    if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")) return;
    const modalInicio = $("modal-inicio");
    if (modalInicio && !modalInicio.classList.contains("oculto")) return;

    const modalFeedback = $("modal");
    if (modalFeedback && !modalFeedback.classList.contains("oculto")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        $("btn-modal")?.click();
      }
      return;
    }

    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      decidir("izq");
    } else if (e.key === "v" || e.key === "V") {
      e.preventDefault();
      decidir("der");
    }
  });
}

enlazarBotones();

mostrarInicio((nivelElegido) => {
  comenzarNivel(nivelElegido || 1);
});

function syncStats() {
  const tiempoJugado = Math.floor((Date.now() - (sesion.inicio || Date.now())) / 1000);
  const inspecciones = inspeccionesDoc;

  if (typeof SyncManager !== 'undefined') {
    SyncManager.guardarPartida({
      puntuacion: estado.puntos,
      nivel_alcanzado: estado.dia,
      aciertos: estado.aciertos,
      fallos: sesion.fallos,
      tiempo_jugado: tiempoJugado,
      inspecciones_doc: inspecciones
    });
  }
}
