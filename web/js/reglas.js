function evaluarDecision(visita, decision) {
  return visita.correcta === decision;
}

function textoFeedback(visita, decision) {
  if (evaluarDecision(visita, decision)) {
    return {
      acierto: true,
      titulo: "¡Correcto!",
      texto: visita.correctoMsg
    };
  }
  const mensajes = {
    entrar: "Dejaste entrar a alguien que no debía.",
    seguridad: "Llamaste a seguridad, pero no era lo correcto."
  };
  let texto = (mensajes[decision] || "Decisión incorrecta.") + " " + (visita.motivo ? "Detalle: " + visita.motivo : "");
  return { acierto: false, titulo: "¡Incorrecto!", texto: texto };
}

function accionCorrectaTexto(visita) {
  if (visita.correcta === "entrar") return "Dejar entrar";
  return "Seguridad";
}
