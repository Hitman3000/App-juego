const $ = (id) => document.getElementById(id);

const canvasPersona = $("persona");
const canvasFoto = $("foto-dni");
const dniModal = $("dni");
const burbuja = $("burbuja");
const dniMesa = $("dni-mesa");
const persiana = $("persiana");
const luzAlarma = $("luz-alarma");
const bombillo = $("bombillo");

const infoDia = $("info-dia");
const infoVidas = $("info-vidas");
const modal = $("modal");
const modalTitulo = $("modal-titulo");
const modalSubtitulo = $("modal-subtitulo");
const modalTexto = $("modal-texto");
const modalIcono = $("modal-icono");
const modalCajaExplicacion = $("modal-caja-explicacion");
const modalDetalleAdicional = $("modal-detalle-adicional");
const btnModal = $("btn-modal");

const modalLista = $("modal-lista");
const contenidoManual = $("contenido-manual");

let dniVisible = false;
let inspeccionesDoc = 0;
let nivelManualSeleccionado = 1;

/* ── Personaje y Animaciones ───────────────────────────────── */

function mostrarPersona(estudiante, saludo) {
  const elPersona = $("persona");
  if (!elPersona) return;

  elPersona.classList.add("oculto-ventana");
  dniMesa.classList.remove("anim-deslizar");
  dniMesa.classList.add("oculto-mesa");
  burbuja.classList.remove("visible");
  burbuja.innerHTML = "";

  if (typeof AudioJuego !== "undefined") {
    AudioJuego.iniciar();
    AudioJuego.puerta();
  }

  // Cargar imagen ilustrada del estudiante (no canvas)
  let fotoSrc = "img/estudiantes/carlos.png";
  if (estudiante) {
    if (estudiante.foto) {
      fotoSrc = estudiante.foto;
    } else if (typeof estudiante === 'string') {
      fotoSrc = estudiante;
    } else if (estudiante.nombre && typeof ESTUDIANTES_PNFI !== 'undefined') {
      const match = ESTUDIANTES_PNFI.find(e => e.nombre === estudiante.nombre);
      if (match && match.foto) fotoSrc = match.foto;
    }
  }

  elPersona.src = fotoSrc;

  setTimeout(() => {
    elPersona.classList.remove("oculto-ventana");

    setTimeout(() => {
      dniMesa.classList.remove("oculto-mesa");
      dniMesa.classList.add("anim-deslizar");
      if (typeof AudioJuego !== "undefined") AudioJuego.papel();

      setTimeout(() => {
        burbuja.innerHTML = "<div class='burbuja-frase'>" + (saludo || "Buenas tardes, inspector.") + "</div>";
        burbuja.classList.add("visible");
      }, 450);

    }, 350);

  }, 100);
}

function ocultarPersona() {
  const elPersona = $("persona");
  if (elPersona) elPersona.classList.add("oculto-ventana");
  dniMesa.classList.add("oculto-mesa");
  burbuja.classList.remove("visible");
}

/* ── Ficha del Caso (Modal Inspección) ───────────────────────── */

function toggleDni() {
  if (dniVisible) {
    dniModal.classList.add("oculto");
    dniVisible = false;
  } else {
    if (typeof estado !== "undefined" && estado.visitas && estado.visitas.length > 0) {
      renderFichaCaso(estado.visitas[estado.visitas.length - 1]);
    }
    dniModal.classList.remove("oculto");
    dniVisible = true;
    inspeccionesDoc++;
    if (typeof AudioJuego !== "undefined") AudioJuego.papel();
  }
}

function renderFichaCaso(caso) {
  if (!caso) return;

  const est = caso.estudiante || { nombre: "Estudiante PNFI", rol: "Trayecto I", carnet: "UPTT-2024" };
  const imgFoto = $("foto-dni");
  if (imgFoto) {
    let fotoCarnet = "img/estudiantes/carlos.jpg";
    if (est.fotoCarnet) {
      fotoCarnet = est.fotoCarnet;
    } else if (est.foto) {
      fotoCarnet = est.foto;
    } else if (est.nombre && typeof ESTUDIANTES_PNFI !== 'undefined') {
      const match = ESTUDIANTES_PNFI.find(e => e.nombre === est.nombre);
      if (match && match.fotoCarnet) fotoCarnet = match.fotoCarnet;
    }
    imgFoto.src = fotoCarnet;
  }

  const casoNumTag = $("caso-numero-tag");
  if (casoNumTag) {
    casoNumTag.textContent = "EXPEDIENTE · NIVEL " + caso.nivel;
  }

  $("dni-datos").innerHTML =
    "<div><span class='etiqueta'>REMITENTE</span>" + est.nombre + "</div>" +
    "<div><span class='etiqueta'>CONDICIÓN</span>" + est.rol + "</div>" +
    "<div><span class='etiqueta'>EXPEDIENTE</span>" + est.carnet + "</div>";

  // Enunciado formal del caso
  const textoEnunciadoEl = $("texto-enunciado");
  if (textoEnunciadoEl) {
    textoEnunciadoEl.textContent = caso.enunciado;
  }

  // Indicaciones al pie de la ficha
  const instruccionNivel = CONFIG.NIVELES_INFO[caso.nivel] ? CONFIG.NIVELES_INFO[caso.nivel].accion : "V (Verdadero) / F (Falso)";
  $("dni-fechas").innerHTML =
    "<div><span class='etiqueta' style='display:block'>DICTAMEN REQUERIDO</span>" + instruccionNivel + "</div>" +
    "<div><span class='etiqueta' style='display:block'>NORMA</span>Manual del Inspector</div>";
}

/* ── Visita / Caso en Pantalla ──────────────────────────────── */

function renderCaso(caso) {
  mostrarPersona(caso.estudiante, caso.saludo);
  renderFichaCaso(caso);
  if (dniVisible) toggleDni();
  ocultarModal();
  setBombillo("gris");

  actualizarBotonesPorNivel(caso.nivel);

  const chapaPared = $("chapa-nivel-pared");
  if (chapaPared) {
    chapaPared.textContent = "NIVEL " + caso.nivel;
  }

  const smTexto = $("sm-texto");
  if (smTexto) smTexto.textContent = "· VENTANILLA ABIERTA";
  const smLed = $("sm-led");
  if (smLed) smLed.classList.remove("rojo");

  persiana.classList.remove("caer");
  luzAlarma.classList.remove("activa");
}

function actualizarBotonesPorNivel(nivel) {
  const lblIzq = $("lbl-sello-izq");
  const lblDer = $("lbl-sello-der");
  const btnIzq = $("hit-lock");
  const btnDer = $("hit-unlock");

  if (!lblIzq || !lblDer) return;

  lblIzq.textContent = "F";
  lblDer.textContent = "V";

  if (nivel === 4) {
    if (btnIzq) btnIzq.title = "Falso / Contradicción (F)";
    if (btnDer) btnDer.title = "Verdadero / Tautología (V)";
  } else if (nivel === 5) {
    if (btnIzq) btnIzq.title = "Inválido / Falacia (F)";
    if (btnDer) btnDer.title = "Válido (V)";
  } else {
    if (btnIzq) btnIzq.title = "Falso / Rechazar (F)";
    if (btnDer) btnDer.title = "Verdadero / Admitir (V)";
  }
}

/* ── Bombillo de estado ────────────────────────────────────── */

function setBombillo(estadoLuz) {
  bombillo.classList.remove("gris", "verde", "rojo");
  bombillo.classList.add(estadoLuz || "gris");
}

/* ── Animación Alarma y Persiana ───────────────────────────── */

function dispararAlarma(callback) {
  burbuja.classList.remove("visible");
  const smTexto = $("sm-texto");
  if (smTexto) smTexto.textContent = "· BLOQUEADA";
  const smLed = $("sm-led");
  if (smLed) smLed.classList.add("rojo");
  persiana.classList.add("caer");
  luzAlarma.classList.add("activa");
  setBombillo("rojo");
  if (typeof AudioJuego !== "undefined") {
    AudioJuego.alarma();
    AudioJuego.persiana();
  }
  setTimeout(callback, 900);
}

/* ── HUD ───────────────────────────────────────────────────── */

function renderCabecera(nivel, aciertos, meta, vidas, puntos) {
  if (infoDia) {
    const infoNivel = (typeof CONFIG !== "undefined" && CONFIG.NIVELES_INFO && CONFIG.NIVELES_INFO[nivel])
      ? CONFIG.NIVELES_INFO[nivel]
      : { tema: "Nivel " + nivel, nombre: "Nivel " + nivel };
    const prefijo = window.innerWidth <= 440 ? "N" : "Nivel ";
    infoDia.textContent = `${prefijo}${nivel}: ${infoNivel.tema} · ${aciertos}/${meta}`;
    infoDia.title = `${infoNivel.nombre} (${aciertos}/${meta} aciertos)`;
  }
  const chapaPared = $("chapa-nivel-pared");
  if (chapaPared) {
    chapaPared.textContent = "NIVEL " + nivel;
    if (typeof CONFIG !== "undefined" && CONFIG.NIVELES_INFO && CONFIG.NIVELES_INFO[nivel]) {
      chapaPared.title = CONFIG.NIVELES_INFO[nivel].nombre;
    }
  }
  const scoreEl = $("info-score");
  if (scoreEl) scoreEl.textContent = (puntos || 0) + " pts";
  let corazones = "";
  const totalVidas = (typeof CONFIG !== "undefined" && CONFIG.VIDAS) ? CONFIG.VIDAS : 3;
  for (let i = 0; i < totalVidas; i++) corazones += i < vidas ? "❤️" : "🖤";
  if (infoVidas) infoVidas.textContent = corazones;
}

/* ── MANUAL DEL INSPECTOR LÓGICO (INTERACTIVO) ─────────────── */

function renderManual(nivel) {
  nivelManualSeleccionado = nivel;
  const data = MANUAL_TEORIA[nivel];
  if (!data || !contenidoManual) return;

  // Actualizar botones de pestaña activa
  document.querySelectorAll(".pestana-btn").forEach((btn) => {
    btn.classList.toggle("activa", parseInt(btn.dataset.nivel) === nivel);
  });

  let html = `
    <div class="manual-seccion">
      <h3>${data.icono} ${data.titulo}</h3>
      <p><b>${data.subtitulo}</b></p>
      <p>${data.resumen}</p>
    </div>
  `;

  if (nivel === 1) {
    html += `
      <div class="manual-seccion">
        <h3>PRINCIPIOS FUNDAMENTALES</h3>
        <ul class="lista-manual">
          ${data.principios.map(p => `<li><b>${p.nombre}:</b> ${p.descripcion}</li>`).join("")}
        </ul>
      </div>
      <div class="manual-seccion">
        <h3>NO SON PROPOSICIONES LÓGICAS (RECHAZAR)</h3>
        <ul class="lista-manual">
          ${data.noProposiciones.map(item => `<li><b>${item.tipo}:</b> <em>"${item.ejemplo}"</em></li>`).join("")}
        </ul>
        <div class="regla-inspector-box">
          <b>CRITERIO DEL INSPECTOR:</b> ${data.reglaInspector}
        </div>
      </div>
    `;
  } else if (nivel === 2) {
    html += `
      <div class="manual-seccion">
        <h3>PASOS DE SEGMENTACIÓN</h3>
        <ul class="lista-manual">
          ${data.pasos.map(paso => `<li>${paso}</li>`).join("")}
        </ul>
        <div class="regla-inspector-box">
          <b>CRITERIO DEL INSPECTOR:</b> ${data.reglaInspector}
        </div>
      </div>
    `;
  } else if (nivel === 3) {
    html += `
      <div class="manual-seccion">
        <h3>TABLA DE LOS 7 CONECTIVOS FORMALES</h3>
        <div class="lista-conectivos-grid">
          ${data.conectivos.map(c => `
            <div class="tarjeta-conectivo">
              <div class="tc-cabecera">
                <span class="insignia-simbolo">${c.simbolo}</span>
                <div class="tc-titulos">
                  <span class="tc-nombre">${c.nombre}</span>
                  <span class="tc-lectura">Se lee: <em>"${c.lectura}"</em></span>
                </div>
              </div>
              <div class="tc-verdad">
                <span class="tc-etiqueta-verdad">CONDICIÓN:</span>
                <span class="tc-condicion">${c.verdad}</span>
              </div>
            </div>
          `).join("")}
        </div>
        <p style="margin-top: 8px;"><b>Precedencia:</b> ${data.precedencia}</p>
      </div>
    `;
  } else if (nivel === 4) {
    html += `
      <div class="manual-seccion">
        <h3>CLASIFICACIÓN DE FÓRMULAS</h3>
        <ul class="lista-manual">
          ${data.clasificaciones.map(cl => `
            <li><b style="color: ${cl.color}; font-size: 13px;">${cl.tipo}:</b> ${cl.definicion}</li>
          `).join("")}
        </ul>
      </div>
      <div class="manual-seccion">
        <h3>EQUIVALENCIAS ÚTILES</h3>
        <ul class="lista-manual">
          ${data.equivalencias.map(eq => `<li><code>${eq}</code></li>`).join("")}
        </ul>
      </div>
    `;
  } else if (nivel === 5) {
    html += `
      <div class="manual-seccion">
        <h3>REGLAS DE INFERENCIA VÁLIDAS</h3>
        <div class="lista-reglas-grid">
          ${data.reglasValidas.map(r => `
            <div class="tarjeta-regla">
              <div class="tr-cabecera">
                <span class="tr-nombre">${r.nombre}</span>
                <code class="tr-esquema">${r.esquema}</code>
              </div>
              <div class="tr-ejemplo">
                <span class="tr-etiqueta">Ejemplo:</span> <em>${r.ejemplo}</em>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="manual-seccion">
        <h3>FALACIAS FORMALES FRECUENTES (INVÁLIDO)</h3>
        <ul class="lista-manual">
          ${data.falacias.map(f => `
            <li><b>${f.nombre} (${f.esquema}):</b> ${f.advertencia}</li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  contenidoManual.innerHTML = html;
}

function abrirManual(nivel) {
  const targetNivel = nivel || nivelManualSeleccionado || 1;
  renderManual(targetNivel);
  modalLista.classList.remove("oculto");
  if (typeof AudioJuego !== "undefined") AudioJuego.papel();
}

function cerrarManual() {
  modalLista.classList.add("oculto");
}

// Configurar pestañas del manual
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".pestana-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = parseInt(btn.dataset.nivel);
      renderManual(n);
    });
  });
});

/* ── Modal de Feedback Pedagógico Inmediato ────────────────── */

function mostrarModalFeedback(acierto, titulo, subtitulo, texto, detalle, alContinuar) {
  modalIcono.textContent = acierto ? "✅" : "❌";
  modalTitulo.textContent = titulo;
  if (modalSubtitulo) modalSubtitulo.textContent = subtitulo || "";
  modalTexto.textContent = texto;

  if (modalCajaExplicacion) {
    modalCajaExplicacion.className = "caja-explicacion " + (acierto ? "exito" : "error");
  }

  if (modalDetalleAdicional) {
    modalDetalleAdicional.textContent = detalle || "";
    modalDetalleAdicional.style.display = detalle ? "block" : "none";
  }

  btnModal.textContent = "Continuar Inspección";
  modal.classList.remove("oculto");

  btnModal.onclick = () => {
    modal.classList.add("oculto");
    if (alContinuar) alContinuar();
  };
}

function ocultarModal() {
  modal.classList.add("oculto");
}

/* ── Modal de Inicio de Turno ──────────────────────────────── */

function mostrarInicio(alComenzar) {
  const inicio      = $("modal-inicio");
  const inputNombre = $("input-nombre");
  const selectNivel = $("select-nivel-inicio");

  // Precarga el nombre si el jugador ya había jugado antes
  const nombreGuardado = SyncManager.obtenerNombre();
  if (nombreGuardado && inputNombre) {
    inputNombre.value = nombreGuardado;
  }

  inicio.classList.remove("oculto");

  $("btn-comenzar").onclick = () => {
    const nombre = inputNombre ? inputNombre.value.trim() : "";
    if (!nombre) {
      if (inputNombre) {
        inputNombre.style.borderColor = "#c0392b";
        inputNombre.focus();
      }
      return;
    }

    // Persiste el nombre (y genera el UUID si no existe todavía)
    SyncManager.guardarNombre(nombre);

    const nivelElegido = selectNivel ? parseInt(selectNivel.value) || 1 : 1;
    inicio.classList.add("oculto");

    if (typeof AudioJuego !== "undefined") {
      AudioJuego.iniciar();
      AudioJuego.timbre();
    }

    alComenzar(nivelElegido);
  };
}

/* ── Listeners de Eventos ──────────────────────────────────── */

$("btn-cerrar-dni").onclick = toggleDni;
$("dni-mesa").onclick = toggleDni;
$("hit-papeles").onclick = () => abrirManual(typeof estado !== "undefined" ? estado.dia : 1);
$("btn-cerrar-lista").onclick = cerrarManual;

$("modal-lista").addEventListener("click", (e) => {
  if (e.target.id === "modal-lista") cerrarManual();
});

// Delegación para pestañas del manual (por si se recarga)
document.addEventListener("click", (e) => {
  const btn = e.target && e.target.closest ? e.target.closest(".pestana-btn") : null;
  if (btn && btn.dataset && btn.dataset.nivel) {
    const n = parseInt(btn.dataset.nivel);
    renderManual(n);
  }
});

/* ── Control de Escala de Tipografía (+ / -) ─────────────────── */

const ESCALAS_FUENTE = [0.85, 1.0, 1.15, 1.30, 1.45];
let indiceEscalaActual = 1; // 1.0 (100%) por defecto
let toastTimer = null;

function aplicarEscalaFuente(escala, mostrarToast) {
  document.documentElement.style.setProperty("--escala-fuente", escala);
  try {
    localStorage.setItem("logicplay_font_scale", escala);
  } catch (e) {}

  if (mostrarToast) {
    const toast = $("toast-fuente");
    if (toast) {
      const porcentaje = Math.round(escala * 100);
      toast.textContent = `Tipografía: ${porcentaje}%`;
      toast.classList.remove("oculto");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.add("oculto");
      }, 1400);
    }
    if (typeof AudioJuego !== "undefined") AudioJuego.click();
  }
}

function inicializarControlesFuente() {
  const guardada = parseFloat(localStorage.getItem("logicplay_font_scale"));
  if (!isNaN(guardada) && guardada >= 0.8 && guardada <= 1.6) {
    let mejorIdx = 1;
    let difMin = 999;
    ESCALAS_FUENTE.forEach((val, idx) => {
      const dif = Math.abs(val - guardada);
      if (dif < difMin) {
        difMin = dif;
        mejorIdx = idx;
      }
    });
    indiceEscalaActual = mejorIdx;
    aplicarEscalaFuente(ESCALAS_FUENTE[indiceEscalaActual], false);
  } else {
    aplicarEscalaFuente(ESCALAS_FUENTE[indiceEscalaActual], false);
  }

  const btnMenos = $("btn-fuente-menos");
  const btnMas = $("btn-fuente-mas");

  if (btnMenos) {
    const reducir = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (indiceEscalaActual > 0) {
        indiceEscalaActual--;
        aplicarEscalaFuente(ESCALAS_FUENTE[indiceEscalaActual], true);
      }
    };
    btnMenos.addEventListener("click", reducir);
    btnMenos.addEventListener("pointerdown", (e) => e.stopPropagation());
  }

  if (btnMas) {
    const aumentar = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (indiceEscalaActual < ESCALAS_FUENTE.length - 1) {
        indiceEscalaActual++;
        aplicarEscalaFuente(ESCALAS_FUENTE[indiceEscalaActual], true);
      }
    };
    btnMas.addEventListener("click", aumentar);
    btnMas.addEventListener("pointerdown", (e) => e.stopPropagation());
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarControlesFuente);
} else {
  inicializarControlesFuente();
}

/* ── Confeti y Celebración Visual ───────────────────────────── */

let animacionConfetiId = null;

function lanzarConfeti() {
  const canvas = $("confeti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width || 420;
  canvas.height = rect.height || 380;

  const colores = ["#f7d070", "#4ade80", "#60a5fa", "#f87171", "#fbbf24", "#e879f9", "#ffffff"];
  const particulas = [];
  const cantidad = 65;

  for (let i = 0; i < cantidad; i++) {
    particulas.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 90,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 8.5,
      vy: -Math.random() * 7.5 - 2,
      tam: Math.random() * 6 + 4,
      color: colores[Math.floor(Math.random() * colores.length)],
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 14,
      gravedad: 0.16,
      resistencia: 0.98,
      opacidad: 1
    });
  }

  let frames = 0;
  if (animacionConfetiId) cancelAnimationFrame(animacionConfetiId);

  function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let vivas = 0;

    particulas.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravedad;
      p.vx *= p.resistencia;
      p.rot += p.vrot;

      if (frames > 40) p.opacidad = Math.max(0, p.opacidad - 0.014);

      if (p.opacidad > 0 && p.y < canvas.height + 20) {
        vivas++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacidad;
        ctx.fillRect(-p.tam / 2, -p.tam / 2, p.tam, p.tam * 0.6);
        ctx.restore();
      }
    });

    frames++;
    if (vivas > 0 && frames < 200) {
      animacionConfetiId = requestAnimationFrame(dibujar);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animacionConfetiId = null;
    }
  }

  animacionConfetiId = requestAnimationFrame(dibujar);
}

function detenerConfeti() {
  if (animacionConfetiId) {
    cancelAnimationFrame(animacionConfetiId);
    animacionConfetiId = null;
  }
  const canvas = $("confeti-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ── Modal de Felicitación / Subida de Nivel y Premios ───────── */

function mostrarFelicitacionNivel(siguienteNivel, alContinuar) {
  const modalPremio = $("modal-subida-nivel");
  if (!modalPremio) {
    if (alContinuar) alContinuar();
    return;
  }

  const nombreJugador = (typeof SyncManager !== "undefined" && SyncManager.obtenerNombre())
    ? SyncManager.obtenerNombre()
    : "Inspector(a)";

  const premio = (typeof PREMIOS_NIVELES !== "undefined" && PREMIOS_NIVELES[siguienteNivel])
    ? PREMIOS_NIVELES[siguienteNivel]
    : {
        insignia: "⭐",
        tituloPremio: "Avance de Misión Lógica",
        bonoPuntos: 50,
        regalo: "☕ Taza de Café del Inspector",
        consejo: "Debes revisar el manual para seguir avanzando con éxito y dominar las nuevas reglas."
      };

  const infoNivel = (typeof CONFIG !== "undefined" && CONFIG.NIVELES_INFO && CONFIG.NIVELES_INFO[siguienteNivel])
    ? CONFIG.NIVELES_INFO[siguienteNivel]
    : { nombre: "Nivel " + siguienteNivel, tema: "Nivel " + siguienteNivel };

  // Otorgar bono de puntos si estado existe
  if (typeof estado !== "undefined" && premio.bonoPuntos) {
    estado.puntos = (estado.puntos || 0) + premio.bonoPuntos;
    renderCabecera(estado.dia, estado.aciertos, CONFIG.CASOS_POR_NIVEL, estado.vidas, estado.puntos);
  }

  const elInsignia = $("premio-insignia");
  if (elInsignia) elInsignia.textContent = premio.insignia || "🎉";

  const elTitulo = $("premio-felicitacion-titulo");
  if (elTitulo) elTitulo.textContent = "¡Excelente!";

  const elNombre = $("premio-nombre-inspector");
  if (elNombre) elNombre.textContent = `¡Felicitaciones, ${nombreJugador}!`;

  const elTag = $("premio-nivel-nombre");
  if (elTag) elTag.textContent = `Estás ingresando al Nivel ${siguienteNivel}: ${infoNivel.tema}`;

  const elItemNombre = $("premio-item-nombre");
  if (elItemNombre) elItemNombre.textContent = `${premio.tituloPremio} (+${premio.bonoPuntos} pts)`;

  const elItemDetalle = $("premio-item-detalle");
  if (elItemDetalle) elItemDetalle.textContent = premio.regalo;

  const elConsejo = $("premio-texto-consejo");
  if (elConsejo) elConsejo.textContent = premio.consejo || "Debes revisar el manual para seguir avanzando con éxito.";

  // Reproducir efectos de audio festivo
  if (typeof AudioJuego !== "undefined") {
    AudioJuego.fanfarria();
    setTimeout(() => {
      if (typeof AudioJuego.premio === "function") AudioJuego.premio();
    }, 450);
  }

  modalPremio.classList.remove("oculto");
  lanzarConfeti();

  // Botón Revisar Manual
  const btnManual = $("btn-premio-manual");
  if (btnManual) {
    btnManual.onclick = () => {
      modalPremio.classList.add("oculto");
      detenerConfeti();
      abrirManual(siguienteNivel);
    };
  }

  // Botón Continuar al siguiente nivel
  const btnContinuar = $("btn-premio-continuar");
  if (btnContinuar) {
    btnContinuar.onclick = () => {
      modalPremio.classList.add("oculto");
      detenerConfeti();
      if (alContinuar) alContinuar();
    };
  }
}

