// Motor de Reglas y Validación Pedagógica — Logic-Play UPTT

function evaluarDecisionCaso(caso, decision) {
  if (!caso || !decision) return false;

  const decNorm = decision.toString().trim().toUpperCase();

  // Nivel 1: ADMITIR / RECHAZAR
  if (caso.nivel === 1) {
    return decNorm === caso.accionCorrecta.toUpperCase();
  }

  // Nivel 2: CONFIRMAR segmentación
  if (caso.nivel === 2) {
    return decNorm === 'CONFIRMAR';
  }

  // Nivel 3: FORMALIZAR
  if (caso.nivel === 3) {
    if (typeof decision === 'object' && decision.formula) {
      const limpia = decision.formula.replace(/\s+/g, '');
      const esperada = caso.formula.replace(/\s+/g, '');
      return limpia === esperada;
    }
    return decNorm === 'FORMALIZAR';
  }

  // Nivel 4: TAUTOLOGIA / CONTRADICCION / CONTINGENCIA
  if (caso.nivel === 4) {
    return decNorm === caso.tipo.toUpperCase();
  }

  // Nivel 5: VALIDO / INVALIDO
  if (caso.nivel === 5) {
    return decNorm === caso.accionCorrecta.toUpperCase();
  }

  return false;
}

function textoFeedbackCaso(caso, decision) {
  const acierto = evaluarDecisionCaso(caso, decision);

  if (acierto) {
    return {
      acierto: true,
      titulo: "¡DICTAMEN CORRECTO!",
      icono: "✅",
      texto: caso.feedbackOk,
      detalle: caso.veredicto,
      subtitulo: "Acierto acreditado en el registro del inspector."
    };
  }

  return {
    acierto: false,
    titulo: "REVISIÓN FORMATIVA",
    icono: "❌",
    texto: caso.feedbackError,
    detalle: "Veredicto esperado: " + caso.veredicto,
    subtitulo: "Consulta el Manual del Inspector Lógico en el escritorio para repasar la regla."
  };
}
