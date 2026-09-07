const CONFIG = {
  VIDAS: 3,
  CASOS_POR_NIVEL: 5, // 5 aciertos para avanzar al siguiente nivel (o completar los 20 en modo práctica)
  NIVELES_TOTALES: 5,
  PUNTOS_ACIERTO: 15,
  PUNTOS_ERROR: 5,
  NIVELES_INFO: {
    1: { nombre: "Nivel 1: Abstracción Formal", tema: "Proposiciones vs No Proposiciones", accion: "V (Verdadero) / F (Falso)" },
    2: { nombre: "Nivel 2: Segmentación Estructural", tema: "Variables atómicas y negaciones", accion: "CONFIRMAR" },
    3: { nombre: "Nivel 3: Formalización Simbólica", tema: "Traducción con 7 conectivos", accion: "FORMALIZAR" },
    4: { nombre: "Nivel 4: Validación", tema: "Tablas de verdad y fórmulas", accion: "TAUTOLOGÍA / CONTRADICCIÓN / CONTINGENCIA" },
    5: { nombre: "Nivel 5: Inferencia Lógica", tema: "Validez de argumentos y falacias", accion: "VÁLIDO / INVÁLIDO" }
  }
};

const ESTUDIANTES_PNFI = [
  {
    id: 1, nombre: "Carlos Mendoza", rol: "Estudiante Trayecto I - PNFI", carnet: "UPTT-2024-041",
    foto: "img/estudiantes/carlos.png", fotoCarnet: "img/estudiantes/carlos.jpg",
    rostro: { piel: "#e8b08c", cabello: { estilo: "corto", color: "#4a3325" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 2, nombre: "María Briceño", rol: "Estudiante Trayecto I - PNFI", carnet: "UPTT-2024-098",
    foto: "img/estudiantes/maria.png", fotoCarnet: "img/estudiantes/maria.jpg",
    rostro: { piel: "#c68a5f", cabello: { estilo: "largo", color: "#1c1a17" }, colorOjos: "#6b4423", cejas: true, lentes: true, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "neutral" }
  },
  {
    id: 3, nombre: "Alejandro Gómez", rol: "Preparador de Algorítmica", carnet: "UPTT-2023-112",
    foto: "img/estudiantes/alejandro.png", fotoCarnet: "img/estudiantes/alejandro.jpg",
    rostro: { piel: "#f0c8a0", cabello: { estilo: "pompadour", color: "#7a4a2b" }, colorOjos: "#3f7d44", cejas: true, lentes: false, lunar: true, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: true, bigote: false, gesto: "neutral" }
  },
  {
    id: 4, nombre: "Valeria Paredes", rol: "Estudiante Trayecto I - PNFI", carnet: "UPTT-2024-177",
    foto: "img/estudiantes/valeria.png", fotoCarnet: "img/estudiantes/valeria.jpg",
    rostro: { piel: "#e8b08c", cabello: { estilo: "ondulado", color: "#b3542e" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 5, nombre: "Prof. Ricardo Silva", rol: "Docente de Lógica Matemática", carnet: "DOC-UPTT-018",
    foto: "img/estudiantes/ricardo.png", fotoCarnet: "img/estudiantes/ricardo.jpg",
    rostro: { piel: "#8d5a3b", cabello: { estilo: "corto", color: "#a9a9a9" }, colorOjos: "#6b4423", cejas: true, lentes: true, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: true, gesto: "serio" }
  },
  {
    id: 6, nombre: "Yulimar Rivas", rol: "Estudiante Trayecto I - PNFI", carnet: "UPTT-2024-205",
    foto: "img/estudiantes/yulimar.png", fotoCarnet: "img/estudiantes/yulimar.jpg",
    rostro: { piel: "#f0c8a0", cabello: { estilo: "largo", color: "#1c1a17" }, colorOjos: "#3f7d44", cejas: true, lentes: false, lunar: true, lunarPos: "izquierda", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 7, nombre: "Daniel Uzcátegui", rol: "Representante Estudiantil PNFI", carnet: "UPTT-2023-055",
    foto: "img/estudiantes/daniel.png", fotoCarnet: "img/estudiantes/daniel.jpg",
    rostro: { piel: "#c68a5f", cabello: { estilo: "afro", color: "#1c1a17" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: true, bigote: true, gesto: "neutral" }
  },
  {
    id: 8, nombre: "Sofía Castellanos", rol: "Estudiante Trayecto I - PNFI", carnet: "UPTT-2024-311",
    foto: "img/estudiantes/sofia.png", fotoCarnet: "img/estudiantes/sofia.jpg",
    rostro: { piel: "#e8b08c", cabello: { estilo: "largo", color: "#e0c050" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  }
];

const SALUDOS_ACADEMICOS = [
  "Buenos días, inspector. Traigo un caso del laboratorio para su dictamen.",
  "Saludos. Aquí tiene el registro para validar.",
  "Inspector, por favor analice el siguiente enunciado del diagnóstico.",
  "Buenas tardes. Presento la siguiente ficha para su verificación formal.",
  "Aquí está el caso asignado. ¿Cumple con el criterio lógico?",
  "Traigo una declaración del cuaderno de trabajo para su inspección."
];
