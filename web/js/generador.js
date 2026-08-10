function estaVencido(vence) {
  return vence.anio < CONFIG.ANIO_ACTUAL ||
    (vence.anio === CONFIG.ANIO_ACTUAL && vence.mes <= CONFIG.MES_ACTUAL);
}

function fechasNormales() {
  const anioE = CONFIG.ANIO_ACTUAL - 3;
  const anioV = CONFIG.ANIO_ACTUAL + 2;
  return { emitido: { mes: CONFIG.MES_ACTUAL, anio: anioE }, vence: { mes: CONFIG.MES_ACTUAL, anio: anioV } };
}

function cambiarRasgoSutil(rostro) {
  const copia = clonarRostro(rostro);
  if (copia.lunar) {
    copia.lunar = false;
    return { rostro: copia, motivo: "a la persona le falta el lunar que aparece en la foto del DNI." };
  }
  if (copia.cicatriz) {
    copia.cicatriz = false;
    return { rostro: copia, motivo: "no tiene la cicatriz que aparece en la foto del DNI." };
  }
  if (copia.lentes) {
    copia.lentes = false;
    return { rostro: copia, motivo: "no lleva los lentes que aparecen en la foto del DNI." };
  }
  if (copia.barba) {
    copia.barba = false;
    return { rostro: copia, motivo: "no tiene la barba que aparece en la foto del DNI." };
  }
  if (copia.bigote) {
    copia.bigote = false;
    return { rostro: copia, motivo: "no tiene el bigote que aparece en la foto del DNI." };
  }
  const otros = ["#3a6ea5", "#3f7d44", "#6b4423", "#777777"].filter(c => c !== copia.colorOjos);
  copia.colorOjos = elegir(otros);
  return { rostro: copia, motivo: "el color de sus ojos no coincide con la foto del DNI." };
}

function tipoImpostor() {
  const r = Math.random();
  if (r < 0.07) return "robot";
  if (r < 0.27) return "doble";
  if (r < 0.47) return "desconocido";
  if (r < 0.67) return "vencido";
  if (r < 0.84) return "suplantador";
  return "datos";
}

function saludoPara(visita) {
  const base = elegir(SALUDOS);
  if (Math.random() < 0.6) {
    return "Soy " + visita.dni.nombre + ", apartamento " + visita.dni.apartamento + ". " + base;
  }
  return base;
}

function generarVisita(dia, ultimoId) {
  let residente;
  do {
    residente = elegir(RESIDENTES);
  } while (residente.id === ultimoId);

  const probImpostor = CONFIG.PROB_IMPOSTOR + (dia - 1) * CONFIG.PROB_IMPOSTOR_POR_DIA;
  const esImpostor = Math.random() < Math.min(0.85, probImpostor);
  const tipo = esImpostor ? tipoImpostor() : "normal";

  const f = fechasNormales();
  const dniBase = {
    nombre: residente.nombre,
    edad: residente.edad,
    apartamento: residente.apartamento,
    foto: residente.rostro,
    emitido: f.emitido,
    vence: f.vence
  };

  let visita = {
    tipo: tipo,
    correcta: "entrar",
    motivo: "",
    correctoMsg: "El visitante era el residente correcto.",
    dni: null,
    persona: { rostro: null, saludo: "" },
    residenteId: residente.id
  };

  if (tipo === "normal") {
    visita.dni = dniBase;
    visita.persona.rostro = residente.rostro;
    visita.correctoMsg = "Todo en orden. Era " + residente.nombre + ".";
  }

  if (tipo === "doble") {
    const cam = cambiarRasgoSutil(residente.rostro);
    visita.dni = dniBase;
    visita.persona.rostro = cam.rostro;
    visita.correcta = "seguridad";
    visita.motivo = "Era un doble: " + cam.motivo;
    visita.correctoMsg = "Era un doble disfrazado de " + residente.nombre + ". ¡Bien detectado!";
  }

  if (tipo === "robot") {
    const copia = clonarRostro(residente.rostro);
    copia.piel = "#9aa2ad";
    copia.colorOjos = "#d33f3f";
    copia.gesto = "serio";
    visita.dni = dniBase;
    visita.persona.rostro = copia;
    visita.correcta = "seguridad";
    visita.motivo = "El visitante tiene apariencia no humana (robot).";
    visita.correctoMsg = "Era una amenaza no humana. ¡Bien bloqueado!";
  }

  if (tipo === "desconocido") {
    const rostro = elegir(ROSTROS_FALSOS);
    const fake = {
      nombre: elegir(NOMBRES_FALSOS),
      edad: 20 + Math.floor(Math.random() * 50),
      apartamento: elegir(APARTAMENTOS),
      foto: rostro,
      emitido: f.emitido,
      vence: f.vence
    };
    visita.dni = fake;
    visita.persona.rostro = rostro;
    visita.correcta = "seguridad";
    visita.motivo = "El nombre NO figura en la lista de residentes.";
    visita.correctoMsg = "No estaba registrado. ¡Bien, lo rechazaste!";
  }

  if (tipo === "vencido") {
    const d = clonarRostro(residente.rostro);
    visita.dni = {
      nombre: residente.nombre,
      edad: residente.edad,
      apartamento: residente.apartamento,
      foto: residente.rostro,
      emitido: { mes: CONFIG.MES_ACTUAL, anio: CONFIG.ANIO_ACTUAL - 6 },
      vence: { mes: CONFIG.MES_ACTUAL, anio: CONFIG.ANIO_ACTUAL - 1 }
    };
    visita.persona.rostro = d;
    visita.correcta = "seguridad";
    visita.motivo = "El documento está VENCIDO.";
    visita.correctoMsg = "El DNI había caducado. ¡No podía entrar!";
  }

  if (tipo === "suplantador") {
    visita.dni = dniBase;
    visita.persona.rostro = elegir(ROSTROS_FALSOS);
    visita.correcta = "seguridad";
    visita.motivo = "La persona en la puerta NO coincide con la foto del DNI.";
    visita.correctoMsg = "No era " + residente.nombre + ". Estaba suplantando su identidad.";
  }

  if (tipo === "datos") {
    visita.dni = clonarRostro(dniBase);
    if (Math.random() < 0.5) {
      visita.dni.edad = residente.edad + 3 + Math.floor(Math.random() * 8);
      visita.motivo = "La edad del DNI (" + visita.dni.edad + ") no coincide con la lista de residentes (" + residente.edad + ").";
    } else {
      let otro;
      do { otro = elegir(APARTAMENTOS); } while (otro === residente.apartamento);
      visita.dni.apartamento = otro;
      visita.motivo = "El apartamento del DNI (" + otro + ") no coincide con el residente registrado (" + residente.apartamento + ").";
    }
    visita.persona.rostro = residente.rostro;
    visita.correcta = "seguridad";
    visita.correctoMsg = "Los datos del documento no coincidían con el registro. ¡Bien!";
  }

  visita.persona.saludo = saludoPara(visita);
  return visita;
}

function generarDia(dia) {
  const n = CONFIG.VISITAS_BASE + dia;
  const visitas = [];
  let ultimoId = null;
  for (let i = 0; i < n; i++) {
    const v = generarVisita(dia, ultimoId);
    ultimoId = v.residenteId;
    visitas.push(v);
  }
  return visitas;
}
