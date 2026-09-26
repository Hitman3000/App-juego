/* ── Configuración del Servidor ─────────────────────────────── */

const SERVER_IP = localStorage.getItem('ddd_server_ip') || '';

const RENDER_API = 'https://app-juego-fflq.onrender.com/api';

const CURRENT_ORIGIN_API = (typeof window !== 'undefined' && window.location.origin && window.location.protocol.startsWith('http'))
  ? `${window.location.origin}/api`
  : null;

const API_CANDIDATAS = [
  RENDER_API,
  SERVER_IP ? `http://${SERVER_IP}:3000/api` : null,
  CURRENT_ORIGIN_API,
  'http://10.0.2.2:3000/api',
  'http://localhost:3000/api'
].filter(Boolean);

let API_URL = API_CANDIDATAS[0];
let apiDetectada = false;

async function detectarAPI() {
  // Primero prueba la que ya había funcionado antes si está guardada
  const guardada = localStorage.getItem('ddd_api_url');
  const lista = guardada ? [guardada, ...API_CANDIDATAS.filter(c => c !== guardada)] : API_CANDIDATAS;

  for (const base of lista) {
    try {
      // 12s para permitir cold-start de Render
      const resp = await fetch(`${base}/health`, { signal: AbortSignal.timeout(12000) });
      if (resp.ok) {
        API_URL = base;
        apiDetectada = true;
        localStorage.setItem('ddd_api_url', base);
        return true;
      }
    } catch {}
  }
  return false;
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
  sesionKey:   'ddd_partida_sesion_id',

  /* ── Identidad del jugador y sesión ── */

  /**
   * Genera un UUID v4 simple sin dependencias externas.
   */
  _generarUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * Devuelve el UUID único permanente del jugador.
   */
  obtenerUUID() {
    let uuid = localStorage.getItem(this.uuidKey);
    if (!uuid) {
      uuid = this._generarUUID();
      localStorage.setItem(this.uuidKey, uuid);
    }
    return uuid;
  },

  /**
   * Obtiene o genera el ID de la partida/sesión en curso.
   */
  obtenerSesionId(forzarNueva = false) {
    if (forzarNueva) {
      const nuevoId = this._generarUUID();
      localStorage.setItem(this.sesionKey, nuevoId);
      return nuevoId;
    }
    let sid = localStorage.getItem(this.sesionKey);
    if (!sid) {
      sid = this._generarUUID();
      localStorage.setItem(this.sesionKey, sid);
    }
    return sid;
  },

  nuevaSesion() {
    return this.obtenerSesionId(true);
  },

  /** Devuelve el nombre visible del jugador (puede ser '') */
  obtenerNombre() {
    return localStorage.getItem(this.jugadorKey) || '';
  },

  /**
   * Guarda el nombre del jugador.
   */
  guardarNombre(nombre) {
    this.obtenerUUID();
    localStorage.setItem(this.jugadorKey, (nombre || '').trim());
  },

  /* ── Comunicación con la API ── */

  async enviarPartida(datos) {
    try {
      const resp = await fetch(`${API_URL}/partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
        signal: AbortSignal.timeout(15000)
      });
      if (!resp.ok) return null;
      apiDetectada = true;
      return await resp.json();
    } catch (e) {
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
    partida.id_local = partida.id_local || this._generarUUID();

    // Si ya existe una partida en cola con el mismo sesion_id, actualizarla
    const idx = partida.sesion_id ? cola.findIndex(p => p.sesion_id === partida.sesion_id) : -1;
    if (idx >= 0) {
      cola[idx] = { ...cola[idx], ...partida };
    } else {
      cola.push(partida);
    }

    this.guardarCola(cola);
  },

  /* ── Sincronización ── */

  /**
   * Intenta subir todas las partidas pendientes en la cola.
   */
  async sincronizar() {
    if (!navigator.onLine) return;

    const cola = this.obtenerCola();
    if (cola.length === 0) return;

    // Asegurar que la API esté detectada
    if (!apiDetectada) {
      await detectarAPI();
    }

    const exitosasIds = new Set();

    for (const partida of cola) {
      const resultado = await this.enviarPartida(partida);
      if (resultado && resultado.ok) {
        exitosasIds.add(partida.id_local || partida.sesion_id);
      }
    }

    if (exitosasIds.size > 0) {
      const actualizada = this.obtenerCola().filter(p => !exitosasIds.has(p.id_local || p.sesion_id));
      this.guardarCola(actualizada);
      console.log(`[Sync] ${exitosasIds.size} partida(s) sincronizada(s). Restantes: ${actualizada.length}`);
    }
  },

  /**
   * Guarda una partida.
   * Si hay conexión online, intenta enviar de inmediato a la API.
   * Si falla o no hay conexión, se encola localmente.
   */
  async guardarPartida(datosPartida) {
    const nombre = this.obtenerNombre();
    if (!nombre) return { ok: false, error: 'Sin nombre de jugador' };

    const sesionId = datosPartida.sesion_id || this.obtenerSesionId();

    const datos = {
      id_local:         this._generarUUID(),
      uuid:             this.obtenerUUID(),
      sesion_id:        sesionId,
      nombre,
      puntuacion:       datosPartida.puntuacion || 0,
      nivel_alcanzado:  datosPartida.nivel_alcanzado || 1,
      aciertos:         datosPartida.aciertos || 0,
      fallos:           datosPartida.fallos || 0,
      tiempo_jugado:    datosPartida.tiempo_jugado || 0,
      inspecciones_doc: datosPartida.inspecciones_doc || 0
    };

    if (navigator.onLine) {
      const resultado = await this.enviarPartida(datos);
      if (resultado && resultado.ok) {
        // Drenar la cola si había algo pendiente
        setTimeout(() => this.sincronizar(), 500);
        return resultado;
      }
    }

    // Sin conexión o API caída → guardar en cola local para subir después
    this.agregarACola(datos);
    return { ok: true, offline: true, enCola: this.obtenerCola().length };
  },

  /* ── Consultas de ranking / estadísticas ── */

  async obtenerRanking() {
    try {
      const resp = await fetch(`${API_URL}/ranking`, { signal: AbortSignal.timeout(10000) });
      return await resp.json();
    } catch {
      return { ok: false };
    }
  },

  async obtenerEstadisticas() {
    try {
      const resp = await fetch(`${API_URL}/estadisticas`, { signal: AbortSignal.timeout(10000) });
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
  setTimeout(() => SyncManager.sincronizar(), 1000);
});

// Al cargar la app → intentar subir cola
window.addEventListener('load', () => {
  setTimeout(() => SyncManager.sincronizar(), 2000);
});

// Tarea periódica de reintento en segundo plano (cada 15s si hay cola y red)
setInterval(() => {
  if (navigator.onLine && SyncManager.obtenerCola().length > 0) {
    SyncManager.sincronizar();
  }
}, 15000);
