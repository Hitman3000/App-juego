const RENDER_API = 'https://app-juego-fflq.onrender.com/api';

const API = (window.location.origin && window.location.origin.includes('onrender.com'))
  ? `${window.location.origin}/api`
  : (window.location.port === '3000')
    ? `${window.location.origin}/api`
    : RENDER_API;
let rankingData = [];
let ordenActual = 'mejor_puntuacion';
let apiDisponible = false;

/* ============================================================
   RELOJ EN VIVO
   ============================================================ */
function iniciarReloj() {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  function actualizar() {
    const ahora = new Date();
    const h = String(ahora.getHours()).padStart(2, '0');
    const m = String(ahora.getMinutes()).padStart(2, '0');
    const s = String(ahora.getSeconds()).padStart(2, '0');
    document.getElementById('reloj-hora').textContent = `${h}:${m}:${s}`;

    const dia = dias[ahora.getDay()];
    const fecha = String(ahora.getDate()).padStart(2, '0');
    const mes = meses[ahora.getMonth()];
    const año = ahora.getFullYear();
    document.getElementById('reloj-fecha').textContent = `${dia} ${fecha} ${mes} ${año}`;
  }

  actualizar();
  setInterval(actualizar, 1000);
}

/* ============================================================
   ESTADO / INDICADOR
   ============================================================ */
function actualizarEstado() {
  const el = document.getElementById('db-indicator');
  const label = document.getElementById('db-label');

  el.classList.remove('online', 'offline', 'sindb');

  if (!navigator.onLine) {
    el.classList.add('offline');
    label.textContent = 'OFFLINE';
  } else if (apiDisponible) {
    el.classList.add('online');
    label.textContent = 'EN LÍNEA';
  } else {
    el.classList.add('sindb');
    label.textContent = 'SIN BASE';
  }
}

async function verificarAPI() {
  try {
    const resp = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await resp.json();
    apiDisponible = data.ok === true;
  } catch {
    apiDisponible = false;
  }
  actualizarEstado();
}

/* ============================================================
   ANIMACIÓN DE CONTADOR
   ============================================================ */
function animarContador(el, destino, sufijo = '', duracion = 800) {
  if (destino === '--' || destino === null || destino === undefined) {
    el.textContent = '--';
    return;
  }
  const valorFinal = Number(destino);
  if (isNaN(valorFinal)) { el.textContent = destino; return; }

  const inicio = Date.now();
  const desde = 0;

  function step() {
    const progreso = Math.min((Date.now() - inicio) / duracion, 1);
    const ease = 1 - Math.pow(1 - progreso, 3); // ease-out cubic
    const valor = Math.round(desde + (valorFinal - desde) * ease);
    el.textContent = valor + sufijo;
    if (progreso < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  el.classList.remove('animate');
  void el.offsetWidth; // reflow
  el.classList.add('animate');
}

function fmt(val) {
  if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '--';
  return val;
}

/* ============================================================
   ESTADÍSTICAS
   ============================================================ */
async function cargarEstadisticas() {
  try {
    const resp = await fetch(`${API}/estadisticas`, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.ok) throw new Error('API error');

    apiDisponible = true;
    actualizarEstado();

    const s = data.estadisticas;
    const hayDatos = s.total_jugadores && s.total_jugadores > 0;

    animarContador(document.getElementById('stat-jugadores'), s.total_jugadores || 0);
    animarContador(document.getElementById('stat-partidas'), s.total_partidas || 0);
    animarContador(document.getElementById('stat-promedio'), hayDatos ? s.promedio_puntuacion : '--');
    animarContador(document.getElementById('stat-maxima'), hayDatos ? s.puntuacion_maxima : '--');
    animarContador(document.getElementById('stat-precision'), hayDatos ? s.precision_global : '--', '%');
    document.getElementById('stat-inspecciones').textContent = hayDatos ? (fmt(s.promedio_inspecciones) + '/doc') : '--';

    renderNiveles(data.distribucion_niveles || []);
    marcarUltimaActualizacion();

  } catch (e) {
    console.warn('estadísticas no disponibles:', e.message);
    apiDisponible = false;
    actualizarEstado();
  }
}

/* ============================================================
   RANKING
   ============================================================ */
async function cargarRanking() {
  try {
    const resp = await fetch(`${API}/ranking`, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.ok) throw new Error('API error');
    rankingData = data.ranking;
    renderRanking();
    renderPodio();
  } catch {
    rankingData = [];
    renderRanking();
    renderPodio();
  }
}

function renderRanking() {
  const container = document.getElementById('tabla-ranking');

  if (!rankingData || rankingData.length === 0) {
    container.innerHTML = '<div class="vacio">Sin datos de ranking aún.<br>¡Juega algunas partidas para aparecer aquí!</div>';
    return;
  }

  const sorted = [...rankingData].sort((a, b) => {
    if (ordenActual === 'precision_pct') return (b.precision_pct || 0) - (a.precision_pct || 0);
    if (ordenActual === 'promedio_puntuacion') return (b.promedio_puntuacion || 0) - (a.promedio_puntuacion || 0);
    return (b.mejor_puntuacion || 0) - (a.mejor_puntuacion || 0);
  });

  let html = `<table class="tabla-ranking">
    <thead><tr>
      <th>#</th>
      <th>Jugador</th>
      <th>Mejor</th>
      <th>Prom.</th>
      <th>Nivel</th>
      <th>Precisión</th>
      <th>Partidas</th>
      <th>Insp./Doc</th>
    </tr></thead><tbody>`;

  sorted.forEach((r, i) => {
    const pos = i + 1;
    let posClass = 'pos-n';
    let rowClass = '';
    let medal = pos;
    if (pos === 1) { posClass = 'pos-1'; rowClass = 'row-top1'; medal = '🥇'; }
    else if (pos === 2) { posClass = 'pos-2'; rowClass = 'row-top2'; medal = '🥈'; }
    else if (pos === 3) { posClass = 'pos-3'; rowClass = 'row-top3'; medal = '🥉'; }

    const pct = r.precision_pct !== null && r.precision_pct !== undefined ? Number(r.precision_pct) : 0;
    const fillClass = pct >= 70 ? '' : pct >= 45 ? 'mid' : 'low';
    const pctText = r.precision_pct !== null ? pct + '%' : '--';
    const mejor = r.mejor_puntuacion !== null ? r.mejor_puntuacion + ' pts' : '--';
    const prom = r.promedio_puntuacion !== null ? r.promedio_puntuacion + ' pts' : '--';
    const insp = r.promedio_inspecciones !== null && r.promedio_inspecciones !== undefined ? r.promedio_inspecciones + '/doc' : '--';

    html += `<tr class="${rowClass}">
      <td class="${posClass}">${medal}</td>
      <td class="nombre-jugador">${escapeHtml(r.nombre)}</td>
      <td>${mejor}</td>
      <td>${prom}</td>
      <td><span class="nivel-badge">Nv ${r.mejor_nivel || 1}</span></td>
      <td>
        <div class="precision-cell">
          <div class="precision-track"><div class="precision-fill ${fillClass}" style="width:${pct}%"></div></div>
          <span class="precision-pct">${pctText}</span>
        </div>
      </td>
      <td>${r.total_partidas || 0}</td>
      <td>${insp}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/* ============================================================
   PODIO (Top 3 lateral)
   ============================================================ */
function renderPodio() {
  const container = document.getElementById('podio-container');

  const sorted = [...rankingData].sort((a, b) => (b.mejor_puntuacion || 0) - (a.mejor_puntuacion || 0));
  const top = sorted.slice(0, Math.min(sorted.length, 6));

  if (top.length === 0) {
    container.innerHTML = '<div class="vacio">Sin datos aún</div>';
    return;
  }

  const estilos = ['gold', 'silver', 'bronze'];
  const medallas = ['🥇', '🥈', '🥉'];

  container.innerHTML = top.map((r, i) => {
    const estilo = estilos[i] || '';
    const medalla = medallas[i] || (i + 1);
    return `<div class="podio-card ${estilo}">
      <div class="podio-pos">${medalla}</div>
      <div class="podio-info">
        <div class="podio-nombre">${escapeHtml(r.nombre)}</div>
        <div class="podio-meta">Nv${r.mejor_nivel || 1} · ${r.total_partidas || 0} partidas · ${r.precision_pct || 0}% prec.</div>
      </div>
      <div class="podio-pts">${r.mejor_puntuacion || 0}</div>
    </div>`;
  }).join('');
}

/* ============================================================
   GRÁFICO NIVELES
   ============================================================ */
function renderNiveles(niveles) {
  const container = document.getElementById('chart-niveles');
  if (!niveles || niveles.length === 0) {
    container.innerHTML = '<div class="vacio">Sin datos de niveles</div>';
    return;
  }

  const max = Math.max(...niveles.map(n => n.total), 1);

  container.innerHTML = niveles.map(n => {
    const pct = (n.total / max) * 100;
    return `<div class="chart-bar">
      <div class="chart-count">${n.total}</div>
      <div class="chart-col">
        <div class="chart-fill" style="height:${pct}%"></div>
      </div>
      <div class="chart-label">Nv ${n.nivel_alcanzado}</div>
    </div>`;
  }).join('');
}

/* ============================================================
   UTILIDADES
   ============================================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function marcarUltimaActualizacion() {
  const ahora = new Date();
  const h = String(ahora.getHours()).padStart(2, '0');
  const m = String(ahora.getMinutes()).padStart(2, '0');
  const s = String(ahora.getSeconds()).padStart(2, '0');
  const el = document.getElementById('last-update-time');
  if (el) el.textContent = `${h}:${m}:${s}`;
}

async function refrescarTodo() {
  const btn = document.getElementById('btn-refresh');
  if (btn) {
    btn.disabled = true;
    btn.querySelector('.refresh-icon').style.animation = 'spin .4s linear infinite';
    setTimeout(() => {
      btn.querySelector('.refresh-icon').style.animation = '';
      btn.disabled = false;
    }, 1500);
  }
  await Promise.all([cargarEstadisticas(), cargarRanking()]);
}

/* ============================================================
   TABS
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ordenActual = btn.dataset.orden;
    renderRanking();
  });
});

/* ============================================================
   BOTÓN REFRESH
   ============================================================ */
document.getElementById('btn-refresh').addEventListener('click', refrescarTodo);

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('online', () => { verificarAPI(); refrescarTodo(); });
window.addEventListener('offline', () => { apiDisponible = false; actualizarEstado(); });

iniciarReloj();
actualizarEstado();
verificarAPI();
cargarEstadisticas();
cargarRanking();

// Auto-refresh cada 30 segundos
setInterval(() => {
  if (navigator.onLine) refrescarTodo();
}, 30000);
