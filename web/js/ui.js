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
const modalTexto = $("modal-texto");
const modalIcono = $("modal-icono");
const btnModal = $("btn-modal");
const modalLista = $("modal-lista");
const listaResidentes = $("lista-residentes");

let dniVisible = false;

/* ── Personaje y Animaciones ───────────────────────────────── */

function mostrarPersona(rostro, saludo) {
  canvasPersona.classList.add("oculto-ventana");
  dniMesa.classList.remove("anim-deslizar");
  dniMesa.classList.add("oculto-mesa");
  burbuja.classList.remove("visible");
  burbuja.textContent = "";

  pintarRostro(canvasPersona, rostro, 220, 300);

  setTimeout(() => {
    canvasPersona.classList.remove("oculto-ventana");
    
    setTimeout(() => {
      dniMesa.classList.remove("oculto-mesa");
      dniMesa.classList.add("anim-deslizar");
      
      setTimeout(() => {
        burbuja.textContent = saludo;
        burbuja.classList.add("visible");
      }, 500);
      
    }, 400);

  }, 100);
}

function ocultarPersona() {
  canvasPersona.classList.add("oculto-ventana");
  dniMesa.classList.add("oculto-mesa");
  burbuja.classList.remove("visible");
}

/* ── DNI (Modal Inspección) ────────────────────────────────── */

function pintarFotoDni(rostro) {
  pintarRostro(canvasFoto, rostro, 90, 120);
}

function toggleDni() {
  if (dniVisible) {
    dniModal.classList.add("oculto");
    dniVisible = false;
  } else {
    dniModal.classList.remove("oculto");
    dniVisible = true;
  }
}

function renderDni(visita) {
  pintarFotoDni(visita.dni.foto);
  const ven = estaVencido(visita.dni.vence);
  $("dni-datos").innerHTML =
    "<div><span class='etiqueta'>NOMBRE</span>" + visita.dni.nombre + "</div>" +
    "<div><span class='etiqueta'>EDAD</span>" + visita.dni.edad + " años</div>" +
    "<div><span class='etiqueta'>APARTAMENTO</span>" + visita.dni.apartamento + "</div>";
  $("dni-fechas").innerHTML =
    "<div><span class='etiqueta' style='display:block'>EMISIÓN</span>" +
    ("0" + visita.dni.emitido.mes).slice(-2) + "/" + visita.dni.emitido.anio + "</div>" +
    "<div><span class='etiqueta' style='display:block'>VENCE</span>" +
    ("0" + visita.dni.vence.mes).slice(-2) + "/" + visita.dni.vence.anio +
    (ven ? " <span class='vencido'>⚠ VENCIDO</span>" : "") + "</div>";
}

/* ── Visita ────────────────────────────────────────────────── */

function renderVisita(visita) {
  mostrarPersona(visita.persona.rostro, visita.persona.saludo);
  renderDni(visita);
  if (dniVisible) toggleDni();
  ocultarModal();
  setBombillo("gris");

  persiana.classList.remove("caer");
  luzAlarma.classList.remove("activa");
}

/* ── Bombillo de estado ────────────────────────────────────── */

function setBombillo(estadoLuz) {
  bombillo.classList.remove("gris", "verde", "rojo");
  bombillo.classList.add(estadoLuz || "gris");
}

/* ── Animación Alarma ──────────────────────────────────────── */

function dispararAlarma(callback) {
  persiana.classList.add("caer");
  luzAlarma.classList.add("activa");
  setBombillo("rojo");
  setTimeout(callback, 1000);
}

/* ── HUD y Modales ─────────────────────────────────────────── */

function renderCabecera(dia, visitante, total, vidas) {
  infoDia.textContent = "Día " + dia + " · Visitante " + visitante + "/" + total;
  let corazones = "";
  for (let i = 0; i < CONFIG.VIDAS; i++) corazones += i < vidas ? "❤️" : "🖤";
  infoVidas.textContent = corazones;
}

function renderListaResidentes() {
  listaResidentes.innerHTML = "";
  RESIDENTES.forEach((r) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "residente";
    const canvas = document.createElement("canvas");
    canvas.width = 52;
    canvas.height = 64;
    pintarRostro(canvas, r.rostro, 52, 64);

    const ficha = document.createElement("div");
    ficha.className = "ficha";
    ficha.innerHTML =
      "<div class='nombre'>" + r.nombre + "</div>" +
      "<div class='rasgo'>" + r.rasgo + "</div>";

    const meta = document.createElement("div");
    meta.innerHTML =
      "<div class='apt'>" + r.apartamento + "</div>" +
      "<span class='edad'>" + r.edad + " años</span>";

    tarjeta.appendChild(canvas);
    tarjeta.appendChild(ficha);
    tarjeta.appendChild(meta);
    listaResidentes.appendChild(tarjeta);
  });
}

function mostrarModal(titulo, texto, botonTexto, alContinuar, icono) {
  modalIcono.textContent = icono || "";
  modalTitulo.textContent = titulo;
  modalTexto.textContent  = texto;
  btnModal.textContent    = botonTexto || "Continuar";
  modal.classList.remove("oculto");
  btnModal.onclick = () => {
    modal.classList.add("oculto");
    if (alContinuar) alContinuar();
  };
}

function ocultarModal() { modal.classList.add("oculto"); }
function abrirLista() { renderListaResidentes(); modalLista.classList.remove("oculto"); }
function cerrarLista() { modalLista.classList.add("oculto"); }
function mostrarInicio(alComenzar) {
  const inicio = $("modal-inicio");
  inicio.classList.remove("oculto");
  $("btn-comenzar").onclick = () => {
    inicio.classList.add("oculto");
    alComenzar();
  };
}

$("btn-cerrar-dni").onclick = toggleDni;
$("dni-mesa").onclick = toggleDni;
$("hit-papeles").onclick = abrirLista;
$("btn-cerrar-lista").onclick = cerrarLista;
$("modal-lista").addEventListener("click", (e) => {
  if (e.target.id === "modal-lista") cerrarLista();
});
