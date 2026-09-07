const AudioJuego = (() => {
  let ctx = null;
  let master = null;
  let silenciado = false;
  let iniciado = false;
  let melodiaTimer = null;

  function crearContexto() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const c = new AC();
    if (c.state === "suspended") c.resume();
    return c;
  }

  function iniciar() {
    if (iniciado) return;
    ctx = crearContexto();
    if (!ctx) {
      iniciado = true;
      return;
    }
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    arrancarDrone();
    melodiaTimer = setInterval(programarMelodia, 2600);
    iniciado = true;
  }

  function tono(frec, dur, tipo, vol, cuando, glide) {
    if (!ctx) return;
    const t = cuando || ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tipo || "sine";
    osc.frequency.setValueAtTime(frec, t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function ruido(dur, vol, filtro, cuando) {
    if (!ctx) return;
    const t = cuando || ctx.currentTime;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = filtro || 1200;
    f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = vol || 0.1;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t);
  }

  function arrancarDrone() {
    const base = 55;
    const mults = [1, 1.5, 2, 2.5];
    const vols = [0.045, 0.03, 0.018, 0.01];
    mults.forEach((m, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = base * m;
      g.gain.value = vols[i];
      osc.connect(g);
      g.connect(master);
      osc.start();
    });
  }

  function programarMelodia() {
    if (!ctx || silenciado) return;
    const notas = [220, 261.63, 293.66, 329.63, 392, 349.23];
    const t = ctx.currentTime + 0.1;
    const n = notas[Math.floor(Math.random() * notas.length)];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = n;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.6);
    g.gain.linearRampToValueAtTime(0, t + 3.1);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 3.3);
  }

  function tocarPuerta() {
    if (!ctx) return;
    const t = ctx.currentTime;
    tono(85, 0.09, "sine", 0.28, t, 55);
    ruido(0.06, 0.16, 400, t);
    tono(85, 0.09, "sine", 0.28, t + 0.22, 55);
    ruido(0.06, 0.16, 400, t + 0.22);
  }

  function papel() {
    if (!ctx) return;
    ruido(0.3, 0.05, 3000);
    ruido(0.2, 0.035, 800, ctx.currentTime + 0.08);
  }

  function acierto() {
    if (!ctx) return;
    const t = ctx.currentTime;
    tono(523.25, 0.12, "sine", 0.14, t);
    tono(659.25, 0.2, "sine", 0.14, t + 0.12);
    tono(783.99, 0.28, "sine", 0.12, t + 0.24);
  }

  function error() {
    if (!ctx) return;
    const t = ctx.currentTime;
    tono(196, 0.35, "sawtooth", 0.11, t, 130);
    tono(98, 0.5, "sine", 0.13, t + 0.05, 80);
  }

  function ddd() {
    if (!ctx) return;
    const t = ctx.currentTime;
    tono(220, 0.5, "sawtooth", 0.1, t, 207);
    tono(233, 0.5, "sawtooth", 0.1, t, 220);
    tono(110, 0.6, "sine", 0.12, t, 98);
  }

  function abrirPuerta() {
    if (!ctx) return;
    tono(140, 0.18, "triangle", 0.05, ctx.currentTime, 70);
    ruido(0.15, 0.04, 900);
  }

  function click() {
    if (!ctx) return;
    tono(1000, 0.03, "square", 0.03);
  }

  function cambiarSilencio() {
    silenciado = !silenciado;
    if (master) {
      master.gain.value = silenciado ? 0 : 0.8;
    }
    return silenciado;
  }

  return {
    iniciar: iniciar,
    tocarPuerta: tocarPuerta,
    puerta: tocarPuerta,
    papel: papel,
    acierto: acierto,
    error: error,
    ddd: ddd,
    alarma: ddd,
    abrirPuerta: abrirPuerta,
    persiana: abrirPuerta,
    click: click,
    sello: click,
    moneda: acierto,
    fanfarria: acierto,
    timbre: tocarPuerta,
    cambiarSilencio: cambiarSilencio
  };
})();
