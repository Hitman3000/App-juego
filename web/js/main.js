let estado = { dia: 1, visitas: [], indice: 0, vidas: CONFIG.VIDAS };

function comenzarDia(dia) {
  estado.dia = dia;
  estado.visitas = generarDia(dia);
  estado.indice = 0;
  siguienteVisitante();
}

function siguienteVisitante() {
  if (estado.indice >= estado.visitas.length) {
    finDeDia();
    return;
  }
  renderCabecera(estado.dia, estado.indice + 1, estado.visitas.length, estado.vidas);
  renderVisita(estado.visitas[estado.indice]);
}

function finDeDia() {
  if (estado.dia >= CONFIG.DIAS_TOTALES) {
    mostrarModal(
      "¡TURNO COMPLETADO!",
      "Sobreviviste a los " + CONFIG.DIAS_TOTALES + " turnos. El edificio está a salvo... por ahora.",
      "Volver a jugar",
      reiniciar,
      "🏆"
    );
  } else {
    mostrarModal(
      "Turno " + estado.dia + " completo",
      "Los " + estado.visitas.length + " visitantes de hoy han sido atendidos. Vidas restantes: " + estado.vidas,
      "Siguiente turno",
      () => comenzarDia(estado.dia + 1),
      "✅"
    );
  }
}

function avanzarTrasDecision() {
  if (estado.vidas <= 0) {
    mostrarModal(
      "FIN DEL TURNO",
      "Perdiste todas tus vidas. Los impostores ganaron... esta vez.",
      "Reintentar",
      reiniciar,
      "💀"
    );
  } else {
    estado.indice++;
    siguienteVisitante();
  }
}

function decidir(decision) {
  const visita = estado.visitas[estado.indice];
  const fb = textoFeedback(visita, decision);
  if (!fb.acierto) estado.vidas--;

  // Acierto al dejar pasar: solo bombillo verde, sin modal
  if (fb.acierto && decision === "entrar") {
    setBombillo("verde");
    ocultarPersona();
    setTimeout(avanzarTrasDecision, 700);
    return;
  }

  const icono = fb.acierto ? "✅" : "❌";
  const continuar = avanzarTrasDecision;

  if (decision === "seguridad") {
    dispararAlarma(() => {
      mostrarModal(fb.titulo, fb.texto, "Continuar", continuar, icono);
    });
  } else {
    setBombillo("rojo");
    ocultarPersona();
    setTimeout(() => {
      mostrarModal(fb.titulo, fb.texto, "Continuar", continuar, icono);
    }, 300);
  }
}

function reiniciar() {
  estado.vidas = CONFIG.VIDAS;
  comenzarDia(1);
}

$("hit-unlock").onclick = () => decidir("entrar");
$("hit-lock").onclick = () => decidir("seguridad");

mostrarInicio(reiniciar);
