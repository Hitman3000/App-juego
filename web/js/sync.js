/* ── Configuración del Servidor ─────────────────────────────── */

const SERVER_IP = localStorage.getItem('ddd_server_ip') || '';

const CURRENT_ORIGIN_API = (typeof window !== 'undefined' && window.location.origin && window.location.protocol.startsWith('http'))
  ? `${window.location.origin}/api`
  : null;

const API_CANDIDATAS = [
  SERVER_IP ? `http://${SERVER_IP}:3000/api` : null,
  CURRENT_ORIGIN_API,
  'http://10.0.2.2:3000/api',
  'http://localhost:3000/api'
].filter(Boolean);

let API_URL = API_CANDIDATAS[0];
let apiDetectada = false;

async function detectarAPI() {
  for (const base of API_CANDIDATAS) {
    try {
      const resp = await fetch(`${base}/health`, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        API_URL = base;
        apiDetectada = true;
        localStorage.setItem('ddd_api_url', base);
        return;
      }
    } catch {}
  }
}

async function configurarServidor(ip) {
  localStorage.setItem('ddd_server_ip', ip);
  API_URL = `http://${ip}:3000/api`;
  apiDetectada = false;
  await detectarAPI();
  return apiDetectada;
}

(async () => {
  const guardada = localStorage.getItem('ddd_api_url');
  if (guardada) API_URL = guardada;
  await detectarAPI();
})();

/* ── SyncManager ────────────────────────────────────────────── */

const SyncManager = {
  colaKey:     'ddd_cola_sync',
  jugadorKey:  'ddd_jugador_nombre',
  uuidKey:     'ddd_jugador_uuid',

  /* ── Identidad del jugador ── */

  /**
   * Genera un UUID v4 simple sin dependencias externas.
   * Ej: "550e8400-e29b-41d4-a716-446655440000"
   */
  _generarUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback manual para entornos sin crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * Devuelve el UUID del jugador.
   * Si no existe todavía, lo genera y lo persiste en localStorage.
   * Este UUID se crea UNA SOLA VEZ y nunca cambia, aunque el jugador
   * cambie su nombre de pantalla.
   */
  obtenerUUID() {
    let uuid = localStorage.getItem(this.uuidKey);
    if (!uuid) {
      uuid = this._generarUUID();
      localStorage.setItem(this.uuidKey, uuid);
    }
    return uuid;
  },

  /** Devuelve el nombre visible del jugador (puede ser '') */
  obtenerNombre() {
    return localStorage.getItem(this.jugadorKey) || '';
  },

  /**
   * Guarda el nombre del jugador.
   * Si es la primera vez (no hay UUID aún), también genera el UUID
   * para que ambos queden vinculados desde el primer momento.
   */
  guardarNombre(nombre) {
    this.obtenerUUID(); // Asegura que el UUID exista antes de guardar el nombre
    localStorage.setItem(this.jugadorKey, nombre.trim());
  },

  /* ── Comunicación con la API ── */

  async enviarPartida(datos) {
    try {
      const resp = await fetch(`${API_URL}/partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      return await resp.json();
    } catch {
      return null;
    }
  },

  /* ── Cola offline ── */

  obtenerCola() {
    try {
      const data = localStorage.getItem(this.colaKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  guardarCola(cola) {
    localStorage.setItem(this.colaKey, JSON.stringify(cola));
  },

  agregarACola(partida) {
    const cola = this.obtenerCola();
    cola.push(partida);
    this.guardarCola(cola);
  },

  /* ── Sincronización ── */

  /**
   * Intenta subir todas las partidas pendientes en la cola.
   * Se llama automáticamente al recuperar conexión o al cargar la app.
   */
  async sincronizar() {
    if (!navigator.onLine) return;
    await detectarAPI(); // Re-detecta la API por si cambió la red

    const cola = this.obtenerCola();
    if (cola.length === 0) return;

    const pendientes = [...cola];
    const exitosas   = [];

    for (const partida of pendientes) {
      const resultado = await this.enviarPartida(partida);
      if (resultado && resultado.ok) {
        exitosas.push(partida);
      }
    }

    if (exitosas.length > 0) {
      // Conserva solo las que fallaron (comparación por referencia exacta)
      const restante = cola.filter(p => !exitosas.includes(p));
      this.guardarCola(restante);
      console.log(`[Sync] ${exitosas.length} partida(s) sincronizada(s). Pendientes: ${restante.length}`);
    }
  },

  /**
   * Guarda una partida.
   * Flujo:
   *   1. Si hay conexión → intenta enviar directo a la API.
   *   2. Si falla (o sin conexión) → encola en localStorage.
   *   3. Al subir exitosamente, vacía las partidas pendientes.
   */
  async guardarPartida(datosPartida) {
    const nombre = this.obtenerNombre();
    if (!nombre) return { ok: false, error: 'Sin nombre de jugador' };

    const datos = {
      uuid:             this.obtenerUUID(),   // ← identificador único permanente
      nombre,                                  // ← nombre visible (puede repetirse entre distintos jugadores)
      puntuacion:       datosPartida.puntuacion,
      nivel_alcanzado:  datosPartida.nivel_alcanzado,
      aciertos:         datosPartida.aciertos,
      fallos:           datosPartida.fallos,
      tiempo_jugado:    datosPartida.tiempo_jugado,
      inspecciones_doc: datosPartida.inspecciones_doc
    };

    if (navigator.onLine && apiDetectada) {
      const resultado = await this.enviarPartida(datos);
      if (resultado && resultado.ok) {
        // Aprovecha el envío exitoso para drenar la cola pendiente
        await this.sincronizar();
        return resultado;
      }
    }

    // Sin conexión o API caída → guardar en cola para subir después
    this.agregarACola(datos);
    return { ok: true, offline: true, enCola: this.obtenerCola().length };
  },

  /* ── Consultas de ranking / estadísticas ── */

  async obtenerRanking() {
    try {
      const resp = await fetch(`${API_URL}/ranking`);
      return await resp.json();
    } catch {
      return { ok: false };
    }
  },

  async obtenerEstadisticas() {
    try {
      const resp = await fetch(`${API_URL}/estadisticas`);
      return await resp.json();
    } catch {
      return { ok: false };
    }
  }
};

/* ── Sincronización Automática ──────────────────────────────── */

// Al recuperar conexión → subir cola pendiente
window.addEventListener('online', () => {
  console.log('[Sync] Conexión recuperada. Sincronizando cola...');
  setTimeout(() => SyncManager.sincronizar(), 1500);
});

// Al cargar la app → intentar subir cola aunque ya haya conexión
window.addEventListener('load', () => {
  setTimeout(() => SyncManager.sincronizar(), 2500);
});
