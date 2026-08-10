const CONFIG = {
  ANIO_ACTUAL: 2025,
  MES_ACTUAL: 5,
  VIDAS: 3,
  DIAS_TOTALES: 3,
  VISITAS_BASE: 2,
  VALIDEZ_DNI: 5,
  PROB_IMPOSTOR: 0.40,
  PROB_IMPOSTOR_POR_DIA: 0.15
};

const RESIDENTES = [
  {
    id: 1, nombre: "Lucía Fernández", edad: 29, apartamento: "1A",
    rasgo: "Tiene un lunar en la mejilla derecha",
    rostro: { piel: "#e8b08c", cabello: { estilo: "largo", color: "#4a3325" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: true, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 2, nombre: "Mateo Torres", edad: 45, apartamento: "1B",
    rasgo: "Tiene una cicatriz en la ceja izquierda",
    rostro: { piel: "#c68a5f", cabello: { estilo: "corto", color: "#1c1a17" }, colorOjos: "#6b4423", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: true, cicatrizLado: "izquierda", barba: true, bigote: false, gesto: "neutral" }
  },
  {
    id: 3, nombre: "Carmen Ruiz", edad: 67, apartamento: "2A",
    rasgo: "Usa lentes",
    rostro: { piel: "#f0c8a0", cabello: { estilo: "corto", color: "#a9a9a9" }, colorOjos: "#3f7d44", cejas: true, lentes: true, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "neutral" }
  },
  {
    id: 4, nombre: "Andrés Vega", edad: 24, apartamento: "2B",
    rasgo: "Sin rasgo particular",
    rostro: { piel: "#c68a5f", cabello: { estilo: "ondulado", color: "#1c1a17" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 5, nombre: "Sofía Molina", edad: 38, apartamento: "3A",
    rasgo: "Tiene un lunar bajo el ojo izquierdo",
    rostro: { piel: "#f0c8a0", cabello: { estilo: "largo", color: "#b3542e" }, colorOjos: "#3f7d44", cejas: true, lentes: false, lunar: true, lunarPos: "izquierda", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 6, nombre: "Raúl Campos", edad: 52, apartamento: "3B",
    rasgo: "Luce un bigote",
    rostro: { piel: "#8d5a3b", cabello: { estilo: "pompadour", color: "#7a4a2b" }, colorOjos: "#6b4423", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: true, gesto: "neutral" }
  },
  {
    id: 7, nombre: "Elena Ríos", edad: 33, apartamento: "4A",
    rasgo: "Sin rasgo particular",
    rostro: { piel: "#e8b08c", cabello: { estilo: "largo", color: "#e0c050" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" }
  },
  {
    id: 8, nombre: "Jorge Salas", edad: 41, apartamento: "4B",
    rasgo: "Tiene una cicatriz en la mejilla derecha",
    rostro: { piel: "#c68a5f", cabello: { estilo: "corto", color: "#4a3325" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: true, cicatrizLado: "derecha", barba: true, bigote: true, gesto: "serio" }
  }
];

const ROSTROS_FALSOS = [
  { piel: "#8d5a3b", cabello: { estilo: "rapado", color: "#1c1a17" }, colorOjos: "#777777", cejas: true, lentes: false, lunar: true, lunarPos: "izquierda", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "serio" },
  { piel: "#f0c8a0", cabello: { estilo: "largo", color: "#7a4a2b" }, colorOjos: "#6b4423", cejas: false, lentes: true, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "neutral" },
  { piel: "#c68a5f", cabello: { estilo: "afro", color: "#1c1a17" }, colorOjos: "#3f7d44", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: true, cicatrizLado: "derecha", barba: true, bigote: false, gesto: "neutral" },
  { piel: "#e8b08c", cabello: { estilo: "corto", color: "#a9a9a9" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: false, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: true, gesto: "feliz" },
  { piel: "#c68a5f", cabello: { estilo: "pompadour", color: "#b9804a" }, colorOjos: "#3a6ea5", cejas: true, lentes: false, lunar: true, lunarPos: "derecha", cicatriz: false, cicatrizLado: "izquierda", barba: false, bigote: false, gesto: "feliz" },
  { piel: "#f0c8a0", cabello: { estilo: "ondulado", color: "#1c1a17" }, colorOjos: "#777777", cejas: true, lentes: false, lunar: false, lunarPos: "izquierda", cicatriz: false, cicatrizLado: "derecha", barba: false, bigote: false, gesto: "serio" }
];

const NOMBRES_FALSOS = [
  "Pedro Maldonado", "Rosa Ortiz", "Tomás Herrera", "Valeria Díaz",
  "Óscar Peña", "Lorena Castro", "Fabián Roca", "Irene Soto"
];

const APARTAMENTOS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];

const SALUDOS = [
  "¡Buenas tardes!",
  "Hola, vengo de visita.",
  "Hace frío afuera, ¿puedo pasar?",
  "Buenas, tengo una cita aquí.",
  "Perdón, no encuentro el timbre.",
  "Llegué en el momento justo, ¿verdad?"
];
