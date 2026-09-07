const SERVER_IP = localStorage.getItem('ddd_server_ip') || '';

const API_CANDIDATAS = [
  SERVER_IP ? `http://${SERVER_IP}:3000/api` : null,
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

const SyncManager = {
  colaKey: 'ddd_cola_sync',
  jugadorKey: 'ddd_jugador_nombre',

  obtenerNombre() {
    return localStorage.getItem(this.jugadorKey) || '';
  },

  guardarNombre(nombre) {
    localStorage.setItem(this.jugadorKey, nombre);
  },

  async enviarPartida(datos) {
    try {
      const resp = await fetch(`${API_URL}/partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const result = await resp.json();
      return result;
    } catch (e) {
      return null;
    }
  },

  async sincronizar() {
    if (!navigator.onLine) return;

    const cola = this.obtenerCola();
    if (cola.length === 0) return;

    const pendientes = [...cola];
    const exitosas = [];

    for (const partida of pendientes) {
      const resultado = await this.enviarPartida(partida);
      if (resultado && resultado.ok) {
        exitosas.push(partida);
      }
    }

    if (exitosas.length > 0) {
      const restante = cola.filter(p => !exitosas.includes(p));
      this.guardarCola(restante);
    }
  },

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

  async guardarPartida(datosPartida) {
    const nombre = this.obtenerNombre();
    if (!nombre) return { ok: false, error: 'Sin nombre' };

    const datos = {
      nombre,
      puntuacion: datosPartida.puntuacion,
      nivel_alcanzado: datosPartida.nivel_alcanzado,
      aciertos: datosPartida.aciertos,
      fallos: datosPartida.fallos,
      tiempo_jugado: datosPartida.tiempo_jugado,
      inspecciones_doc: datosPartida.inspecciones_doc
    };

    if (navigator.onLine && apiDetectada) {
      const resultado = await this.enviarPartida(datos);
      if (resultado && resultado.ok) {
        await this.sincronizar();
        return resultado;
      }
    }

    this.agregarACola(datos);
    return { ok: true, offline: true, enCola: this.obtenerCola().length };
  },

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

window.addEventListener('online', () => {
  setTimeout(() => SyncManager.sincronizar(), 1000);
});

window.addEventListener('load', () => {
  setTimeout(() => SyncManager.sincronizar(), 2000);
});
