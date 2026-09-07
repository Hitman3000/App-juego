// Manual del Inspector Lógico — Logic-Play UPTT
// Contenido teórico extraído del Manual Oficial para consulta interactiva en cabina.

const MANUAL_TEORIA = {
  1: {
    nivel: 1,
    titulo: "NIVEL 1 — ABSTRACCIÓN FORMAL",
    subtitulo: "Reconocimiento de proposiciones",
    icono: "📜",
    resumen: "Una proposición lógica es todo enunciado declarativo (afirmativo) al que se le puede asignar un único valor de verdad: Verdadero (V) o Falso (F).",
    principios: [
      {
        nombre: "Principio de Bivalencia",
        descripcion: "Toda proposición es V o F, nunca ambas cosas a la vez."
      },
      {
        nombre: "Principio de No Contradicción",
        descripcion: "Una proposición no puede ser V y F simultáneamente."
      }
    ],
    noProposiciones: [
      { tipo: "Preguntas", ejemplo: "¿Ya instalaste el software Logic-Play en tu teléfono?" },
      { tipo: "Órdenes o exhortaciones", ejemplo: "Cierra la puerta del laboratorio." },
      { tipo: "Exclamaciones emotivas", ejemplo: "¡Qué difícil está la lógica proposicional!" },
      { tipo: "Deseos o anhelos", ejemplo: "Ojalá el laboratorio tenga conexión estable hoy." },
      { tipo: "Enunciados ambiguos", ejemplo: "Frases incompletas o paradójicas sin valor de verdad definido." }
    ],
    reglaInspector: "Si el enunciado afirma un hecho comprobable (sea cierto o falso) -> ADMITIR como Proposición. Si es pregunta, orden, exclamación o deseo -> RECHAZAR."
  },

  2: {
    nivel: 2,
    titulo: "NIVEL 2 — SEGMENTACIÓN ESTRUCTURAL",
    subtitulo: "Aislamiento de variables y detección de negaciones",
    icono: "🔍",
    resumen: "Una proposición simple (atómica) expresa una sola idea y no se puede subdividir. Una proposición compuesta (molecular) une dos o más cláusulas mediante conectivos lógicos.",
    pasos: [
      "1. Lee el enunciado completo atentamente.",
      "2. Localiza las palabras conectoras: 'y', 'o', 'si... entonces', 'si y solo si', 'no', 'ni', 'pero'.",
      "3. Separa las cláusulas que quedan a cada lado del conector.",
      "4. Asigna letras minúsculas (p, q, r, s...) a cada cláusula atómica.",
      "5. Identifica negaciones explícitas ('no', 'es falso que') o dobles ('ni... ni', 'tampoco')."
    ],
    reglaInspector: "Asegúrate de que cada variable (p, q, r) contenga una cláusula afirmativa completa y marca el operador de negación (¬) en las partes correspondientes."
  },

  3: {
    nivel: 3,
    titulo: "NIVEL 3 — FORMALIZACIÓN SIMBÓLICA",
    subtitulo: "Traducción al lenguaje formal con los 7 conectivos",
    icono: "📐",
    resumen: "Traduce proposiciones del lenguaje natural a fórmulas lógicas utilizando variables y conectivos normalizados.",
    conectivos: [
      { simbolo: "¬p", nombre: "Negación", lectura: "no p", clave: "no, es falso que, nunca", verdad: "Falso cuando p es V; Verdadero cuando p es F" },
      { simbolo: "p ∧ q", nombre: "Conjunción", lectura: "p y q", clave: "y, pero, además, tanto... como", verdad: "Verdadero solo si ambas son V" },
      { simbolo: "p ∨ q", nombre: "Disyunción inclusiva", lectura: "p o q", clave: "o, al menos uno de los dos", verdad: "Falso solo si ambas son F" },
      { simbolo: "p ⊕ q", nombre: "Disyunción exclusiva", lectura: "o p o q, no ambos", clave: "o bien... o bien, uno u otro", verdad: "Verdadero cuando una es V y la otra F" },
      { simbolo: "p → q", nombre: "Condicional", lectura: "si p, entonces q", clave: "si... entonces, p solo si q, q si p", verdad: "Falso únicamente cuando antecedente es V y consecuente es F" },
      { simbolo: "p ↔ q", nombre: "Bicondicional", lectura: "p si y solo si q", clave: "si y solo si, equivalente a", verdad: "Verdadero cuando ambas comparten el mismo valor" },
      { simbolo: "¬(p ∧ q)", nombre: "NAND / Negación conjunta", lectura: "no ambos a la vez", clave: "no es el caso que p y q", verdad: "Falso solo si ambas son V" },
      { simbolo: "¬(p ∨ q)", nombre: "NOR / Negación alterna", lectura: "ni p ni q", clave: "ni uno ni el otro", verdad: "Verdadero solo si ambas son F" }
    ],
    precedencia: "Orden de fuerza sin paréntesis: ¬ > ∧ > ∨ > → > ↔. ¡Usa paréntesis para evitar ambigüedades!"
  },

  4: {
    nivel: 4,
    titulo: "NIVEL 4 — VALIDACIÓN",
    subtitulo: "Tablas de verdad y clasificación de fórmulas",
    icono: "📊",
    resumen: "Evalúa los valores de verdad posibles de una fórmula completa para todas sus combinaciones (2ⁿ filas) y clasifica su comportamiento.",
    clasificaciones: [
      { tipo: "TAUTOLOGÍA", definicion: "El resultado final es Verdadero en ABSOLUTAMENTE TODAS las filas.", color: "#4ade80" },
      { tipo: "CONTRADICCIÓN", definicion: "El resultado final es Falso en ABSOLUTAMENTE TODAS las filas.", color: "#f87171" },
      { tipo: "CONTINGENCIA", definicion: "El resultado contiene al menos una fila Verdadera y al menos una Falsa.", color: "#fbbf24" }
    ],
    equivalencias: [
      "Doble negación: ¬¬p ≡ p",
      "De Morgan 1: ¬(p ∧ q) ≡ ¬p ∨ ¬q",
      "De Morgan 2: ¬(p ∨ q) ≡ ¬p ∧ ¬q",
      "Equivalencia condicional: p → q ≡ ¬p ∨ q",
      "Contrapositiva: p → q ≡ ¬q → ¬p"
    ]
  },

  5: {
    nivel: 5,
    titulo: "NIVEL 5 — INFERENCIA LÓGICA",
    subtitulo: "Reglas de inferencia y validez de argumentos",
    icono: "⚖️",
    resumen: "Un argumento es VÁLIDO si es imposible que sus premisas sean verdaderas y su conclusión falsa al mismo tiempo. La validez depende de la forma lógica, no de la temática.",
    reglasValidas: [
      { nombre: "Modus Ponens (MP)", esquema: "p → q,  p  ⊢  q", ejemplo: "Si estudio, apruebo. Estudio. ∴ Apruebo." },
      { nombre: "Modus Tollens (MT)", esquema: "p → q,  ¬q  ⊢  ¬p", ejemplo: "Si llueve, se moja la calle. No se moja. ∴ No llueve." },
      { nombre: "Silogismo Hipotético (SH)", esquema: "p → q,  q → r  ⊢  p → r", ejemplo: "Si p entonces q; si q entonces r. ∴ Si p entonces r." },
      { nombre: "Silogismo Disyuntivo (SD)", esquema: "p ∨ q,  ¬p  ⊢  q", ejemplo: "Aprueba o repite. No aprueba. ∴ Repite." },
      { nombre: "Simplificación (Simp)", esquema: "p ∧ q  ⊢  p", ejemplo: "Estudia lógica y BD. ∴ Estudia lógica." },
      { nombre: "Conjunción (Conj)", esquema: "p,  q  ⊢  p ∧ q", ejemplo: "Compila. No hay errores. ∴ Compila y no hay errores." },
      { nombre: "Adición (Ad)", esquema: "p  ⊢  p ∨ q", ejemplo: "Aprobó. ∴ Aprobó o ganó una beca." },
      { nombre: "Dilema Constructivo (DC)", esquema: "p → q,  r → s,  p ∨ r  ⊢  q ∨ s", ejemplo: "Si estudio apruebo, si duermo rindo. Estudio o duermo. ∴ Apruebo o rindo." }
    ],
    falacias: [
      { nombre: "Afirmación del Consecuente", esquema: "p → q,  q  ⊢  p (INVÁLIDO)", advertencia: "Que ocurra el consecuente no garantiza que haya sido causado por ese antecedente particular." },
      { nombre: "Negación del Antecedente", esquema: "p → q,  ¬p  ⊢  ¬q (INVÁLIDO)", advertencia: "Negar el antecedente no implica que el consecuente no ocurra por otra causa." },
      { nombre: "Uso indebido de disyunción inclusiva", esquema: "p ∨ q,  p  ⊢  ¬q (INVÁLIDO)", advertencia: "La disyunción inclusiva admite que ambas cosas sean verdaderas simultáneamente." }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MANUAL_TEORIA };
}
