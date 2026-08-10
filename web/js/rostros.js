function clonarRostro(r) {
  return JSON.parse(JSON.stringify(r));
}

function elegir(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function pintarRostro(canvas, r, ancho, alto) {
  const ctx = canvas.getContext("2d");
  canvas.width = ancho;
  canvas.height = alto;
  ctx.clearRect(0, 0, ancho, alto);

  const cx = ancho / 2;
  const rx = ancho * 0.27;
  const ry = alto * 0.21;
  const cy = alto * 0.52;

  ctx.fillStyle = r.piel;
  ctx.fillRect(cx - rx * 0.25, cy + ry * 0.7, rx * 0.5, alto * 0.26);

  pintarPelo(ctx, r, cx, cy, rx, ry, "trasero");

  ctx.fillStyle = r.piel;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx - rx, cy + ry * 0.1, rx * 0.14, ry * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + rx, cy + ry * 0.1, rx * 0.14, ry * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const oy = cy - ry * 0.12;
  const ox1 = cx - rx * 0.38;
  const ox2 = cx + rx * 0.38;
  const rOjo = rx * 0.11;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(ox1, oy, rOjo, rOjo * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ox2, oy, rOjo, rOjo * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = r.colorOjos;
  ctx.beginPath();
  ctx.arc(ox1, oy, rOjo * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ox2, oy, rOjo * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(ox1, oy, rOjo * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ox2, oy, rOjo * 0.28, 0, Math.PI * 2);
  ctx.fill();

  const colorCejas = r.colorCejas || (r.cabello && r.cabello.color) || "#3a2a20";

  if (r.cejas) {
    ctx.strokeStyle = colorCejas;
    ctx.lineWidth = Math.max(2, rx * 0.05);
    ctx.beginPath();
    ctx.moveTo(ox1 - rOjo * 0.9, oy - rOjo * 1.2);
    ctx.lineTo(ox1 + rOjo * 0.9, oy - rOjo * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox2 - rOjo * 0.9, oy - rOjo * 1.5);
    ctx.lineTo(ox2 + rOjo * 0.9, oy - rOjo * 1.2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = Math.max(1.5, rx * 0.04);
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry * 0.05);
  ctx.quadraticCurveTo(cx + rx * 0.08, cy + ry * 0.28, cx, cy + ry * 0.33);
  ctx.stroke();

  ctx.strokeStyle = "#7a3b3b";
  ctx.lineWidth = Math.max(2, rx * 0.05);
  const my = cy + ry * 0.5;
  ctx.beginPath();
  if (r.gesto === "feliz") {
    ctx.arc(cx, my - ry * 0.06, rx * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (r.gesto === "serio") {
    ctx.moveTo(cx - rx * 0.16, my + ry * 0.02);
    ctx.lineTo(cx + rx * 0.16, my + ry * 0.02);
  } else {
    ctx.moveTo(cx - rx * 0.16, my);
    ctx.lineTo(cx + rx * 0.16, my);
  }
  ctx.stroke();

  if (r.barba) {
    ctx.fillStyle = colorCejas;
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.55, cy + ry * 0.15);
    ctx.lineTo(cx + rx * 0.55, cy + ry * 0.15);
    ctx.lineTo(cx + rx * 0.38, cy + ry * 0.95);
    ctx.quadraticCurveTo(cx, cy + ry * 1.15, cx - rx * 0.38, cy + ry * 0.95);
    ctx.closePath();
    ctx.fill();
  }

  if (r.bigote) {
    ctx.fillStyle = colorCejas;
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.12, my - ry * 0.02, rx * 0.16, ry * 0.06, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + rx * 0.12, my - ry * 0.02, rx * 0.16, ry * 0.06, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (r.lentes) {
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = Math.max(1.5, rx * 0.04);
    ctx.beginPath();
    ctx.ellipse(ox1, oy, rOjo * 1.5, rOjo * 1.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(ox2, oy, rOjo * 1.5, rOjo * 1.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox1 + rOjo * 1.5, oy);
    ctx.lineTo(ox2 - rOjo * 1.5, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox1 - rOjo * 1.5, oy);
    ctx.lineTo(cx - rx * 0.95, oy - ry * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox2 + rOjo * 1.5, oy);
    ctx.lineTo(cx + rx * 0.95, oy - ry * 0.05);
    ctx.stroke();
  }

  if (r.lunar) {
    const lado = r.lunarPos === "izquierda" ? -1 : 1;
    ctx.fillStyle = "#5a3b28";
    ctx.beginPath();
    ctx.arc(cx + lado * rx * 0.45, cy + ry * 0.28, Math.max(1.5, rx * 0.05), 0, Math.PI * 2);
    ctx.fill();
  }

  if (r.cicatriz) {
    const lado = r.cicatrizLado === "derecha" ? 1 : -1;
    ctx.strokeStyle = "#c2453a";
    ctx.lineWidth = Math.max(1.5, rx * 0.035);
    ctx.beginPath();
    ctx.moveTo(cx + lado * rx * 0.85, cy - ry * 0.55);
    ctx.lineTo(cx + lado * rx * 0.55, cy - ry * 0.25);
    ctx.lineTo(cx + lado * rx * 0.65, cy + ry * 0.05);
    ctx.stroke();
  }

  pintarPelo(ctx, r, cx, cy, rx, ry, "frontal");
}

function pintarPelo(ctx, r, cx, cy, rx, ry, capa) {
  const c = r.cabello ? r.cabello.color : "#1c1a17";
  const estilo = r.cabello ? r.cabello.estilo : "corto";

  if (capa === "frontal") {
    if (estilo === "rapado" || estilo === "afro") return;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.78, rx * 0.85, ry * 0.3, 0, Math.PI, 0);
    ctx.fill();
    return;
  }

  if (estilo === "rapado") {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.55, rx * 1.02, ry * 0.42, 0, Math.PI, 0);
    ctx.fill();
    return;
  }

  if (estilo === "afro") {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx, cy - ry * 0.35, rx * 1.02, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (estilo === "corto") {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.5, rx * 1.02, ry * 0.62, 0, Math.PI, 0);
    ctx.fill();
    return;
  }

  if (estilo === "pompadour") {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.95, rx * 0.72, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.5, rx * 1.02, ry * 0.5, 0, Math.PI, 0);
    ctx.fill();
    return;
  }

  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.45, rx * 1.05, ry * 0.75, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - rx * 1.02, cy - ry * 0.35, rx * 0.28, ry * 1.3);
  ctx.fillRect(cx + rx * 0.74, cy - ry * 0.35, rx * 0.28, ry * 1.3);
}
