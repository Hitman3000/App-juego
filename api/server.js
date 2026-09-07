const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

// POST /api/partida - Guardar resultado de una partida
app.post('/api/partida', async (req, res) => {
  try {
    const { nombre, puntuacion, nivel_alcanzado, aciertos, fallos, tiempo_jugado, inspecciones_doc } = req.body;

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const nombreLimpio = nombre.trim().substring(0, 50);

    // Buscar o crear jugador
    let [jugadores] = await pool.query('SELECT id FROM jugadores WHERE nombre = ?', [nombreLimpio]);
    let jugadorId;

    if (jugadores.length === 0) {
      const [result] = await pool.query('INSERT INTO jugadores (nombre) VALUES (?)', [nombreLimpio]);
      jugadorId = result.insertId;
    } else {
      jugadorId = jugadores[0].id;
    }

    // Insertar partida
    const [result] = await pool.query(
      'INSERT INTO partidas (jugador_id, puntuacion, nivel_alcanzado, aciertos, fallos, tiempo_jugado, inspecciones_doc) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [jugadorId, puntuacion || 0, nivel_alcanzado || 1, aciertos || 0, fallos || 0, tiempo_jugado || 0, inspecciones_doc || 0]
    );

    // Obtener posición del jugador en el ranking
    const [ranking] = await pool.query(
      'SELECT COUNT(*) as posicion FROM jugadores j INNER JOIN partidas p ON j.id = p.jugador_id WHERE p.puntuacion > ?',
      [puntuacion || 0]
    );

    res.json({
      ok: true,
      partidaId: result.insertId,
      jugadorId,
      posicion: (ranking[0].posicion || 0) + 1
    });

  } catch (err) {
    console.error('Error al guardar partida:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/ranking - Top 20 jugadores (mejor puntaje de cada uno)
app.get('/api/ranking', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        j.nombre,
        MAX(p.puntuacion) as mejor_puntuacion,
        ROUND(AVG(p.puntuacion)) as promedio_puntuacion,
        MAX(p.nivel_alcanzado) as mejor_nivel,
        COUNT(p.id) as total_partidas,
        ROUND(AVG(p.aciertos) / NULLIF(AVG(p.aciertos + p.fallos), 0) * 100) as precision_pct,
        ROUND(AVG(p.inspecciones_doc / NULLIF(p.aciertos + p.fallos, 0)), 1) as promedio_inspecciones
      FROM jugadores j
      INNER JOIN partidas p ON j.id = p.jugador_id
      GROUP BY j.id, j.nombre
      ORDER BY mejor_puntuacion DESC
      LIMIT 20
    `);

    res.json({ ok: true, ranking: rows });

  } catch (err) {
    console.error('Error al obtener ranking:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/ranking/:nombre - Historial de un jugador
app.get('/api/ranking/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre;

    const [jugador] = await pool.query('SELECT id, nombre, created_at FROM jugadores WHERE nombre = ?', [nombre]);
    if (jugador.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const [partidas] = await pool.query(
      'SELECT puntuacion, nivel_alcanzado, aciertos, fallos, tiempo_jugado, inspecciones_doc, jugado_en FROM partidas WHERE jugador_id = ? ORDER BY jugado_en DESC LIMIT 20',
      [jugador[0].id]
    );

    res.json({
      ok: true,
      jugador: jugador[0],
      partidas
    });

  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/estadisticas - Estadísticas globales
app.get('/api/estadisticas', async (req, res) => {
  try {
    const [totales] = await pool.query(`
      SELECT 
        COUNT(DISTINCT j.id) as total_jugadores,
        COUNT(p.id) as total_partidas,
        ROUND(AVG(p.puntuacion)) as promedio_puntuacion,
        MAX(p.puntuacion) as puntuacion_maxima,
        ROUND(AVG(p.nivel_alcanzado), 1) as promedio_nivel,
        ROUND(AVG(p.aciertos) / NULLIF(AVG(p.aciertos + p.fallos), 0) * 100) as precision_global,
        ROUND(AVG(p.tiempo_jugado)) as promedio_tiempo,
        ROUND(AVG(p.inspecciones_doc / NULLIF(p.aciertos + p.fallos, 0)), 1) as promedio_inspecciones
      FROM jugadores j
      INNER JOIN partidas p ON j.id = p.jugador_id
    `);

    const [nivelDistribucion] = await pool.query(`
      SELECT nivel_alcanzado, COUNT(*) as total
      FROM partidas
      GROUP BY nivel_alcanzado
      ORDER BY nivel_alcanzado
    `);

    res.json({
      ok: true,
      estadisticas: totales[0],
      distribucion_niveles: nivelDistribucion
    });

  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API D.D.D. corriendo en http://localhost:${PORT}`);
});
