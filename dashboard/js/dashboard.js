const API = 'http://localhost:3000/api';
let rankingData = [];
let ordenActual = 'mejor_puntuacion';

async function cargarEstadisticas() {
  try {
    const resp = await fetch(`${API}/estadisticas`);
    const data = await resp.json();
    if (!data.ok) return;

    const s = data.estadisticas;
    document.getElementById('stat-jugadores').textContent = s.total_jugadores || 0;
    document.getElementById('stat-partidas').textContent = s.total_partidas || 0;
    document.getElementById('stat-promedio').textContent = s.promedio_puntuacion || 0;
    document.getElementById('stat-maxima').textContent = s.puntuacion_maxima || 0;
    document.getElementById('stat-precision').textContent = (s.precision_global || 0) + '%';
    document.getElementById('stat-inspecciones').textContent = s.promedio_inspecciones || '0';

    renderNiveles(data.distribucion_niveles || []);
  } catch {
    console.log('API no disponible, mostrando datos de ejemplo');
  }
}

async function cargarRanking() {
  const container = document.getElementById('tabla-ranking');
  try {
    const resp = await fetch(`${API}/ranking`);
    const data = await resp.json();
    if (!data.ok) throw new Error();
    rankingData = data.ranking;
    renderRanking();
  } catch {
    container.innerHTML = '<div class="vacio">No hay datos de ranking disponibles.<br>¡Juega algunas partidas para aparecer aquí!</div>';
  }
}

function renderRanking() {
  const container = document.getElementById('tabla-ranking');

  if (rankingData.length === 0) {
    container.innerHTML = '<div class="vacio">Sin datos aún. ¡Juega para aparecer en el ranking!</div>';
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
      <th>Promedio</th>
      <th>Nivel</th>
      <th>Precisión</th>
      <th>Partidas</th>
      <th>Inspecciones</th>
    </tr></thead><tbody>`;

  sorted.forEach((r, i) => {
    const pos = i + 1;
    let posClass = 'pos-n';
    if (pos === 1) posClass = 'pos-1';
    else if (pos === 2) posClass = 'pos-2';
    else if (pos === 3) posClass = 'pos-3';

    const precision = r.precision_pct || 0;
    const barWidth = Math.max(precision, 2);

    html += `<tr>
      <td class="${posClass}">${pos <= 3 ? ['🥇','🥈','🥉'][pos-1] : pos}</td>
      <td class="nombre-jugador">${escapeHtml(r.nombre)}</td>
      <td>${r.mejor_puntuacion || 0} pts</td>
      <td>${r.promedio_puntuacion || 0} pts</td>
      <td><span class="nivel-badge">Nv ${r.mejor_nivel || 1}</span></td>
      <td><span class="precision-bar" style="width:${barWidth}px"></span>${precision}%</td>
      <td>${r.total_partidas || 0}</td>
      <td>${r.promedio_inspecciones || '0'}/doc</td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderNiveles(niveles) {
  const container = document.getElementById('chart-niveles');
  if (!niveles || niveles.length === 0) {
    container.innerHTML = '<div class="vacio">Sin datos de niveles aún</div>';
    return;
  }

  const max = Math.max(...niveles.map(n => n.total), 1);

  container.innerHTML = niveles.map(n => {
    const pct = (n.total / max) * 100;
    return `<div class="chart-bar">
      <div class="chart-count">${n.total}</div>
      <div class="chart-fill" style="height:${pct}%"></div>
      <div class="chart-label">Nv ${n.nivel_alcanzado}</div>
    </div>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function actualizarEstado() {
  const el = document.getElementById('online-status');
  if (navigator.onLine) {
    el.textContent = 'ONLINE';
    el.className = 'status-online';
  } else {
    el.textContent = 'OFFLINE';
    el.className = 'status-offline';
  }
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ordenActual = btn.dataset.orden;
    renderRanking();
  });
});

// Refresh
document.getElementById('btn-refresh').addEventListener('click', () => {
  cargarEstadisticas();
  cargarRanking();
});

// Init
window.addEventListener('online', actualizarEstado);
window.addEventListener('offline', actualizarEstado);
actualizarEstado();
cargarEstadisticas();
cargarRanking();

// Auto-refresh cada 30 segundos
setInterval(() => {
  if (navigator.onLine) {
    cargarEstadisticas();
    cargarRanking();
  }
}, 30000);
