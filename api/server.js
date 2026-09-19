const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir estáticos: Dashboard y Juego
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));
app.use('/juego', express.static(path.join(__dirname, '../web')));
app.use(express.static(path.join(__dirname, '../web')));

// POST /api/partida - Guardar resultado de una partida
app.post('/api/partida', async (req, res) => {
  try {
    const { nombre, puntuacion, nivel_alcanzado, aciertos, fallos, tiempo_jugado, inspecciones_doc } = req.body;

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const nombreLimpio = nombre.trim().substring(0, 50);

    // Buscar o crear jugador
    const { rows: jugadores } = await pool.query(
      'SELECT id FROM jugadores WHERE nombre = $1',
      [nombreLimpio]
    );

    let jugadorId;
    if (jugadores.length === 0) {
      const { rows: newJugador } = await pool.query(
        'INSERT INTO jugadores (nombre) VALUES ($1) RETURNING id',
        [nombreLimpio]
      );
      jugadorId = newJugador[0].id;
    } else {
      jugadorId = jugadores[0].id;
    }

    // Insertar partida
    const { rows: newPartida } = await pool.query(
      `INSERT INTO partidas (jugador_id, puntuacion, nivel_alcanzado, aciertos, fallos, tiempo_jugado, inspecciones_doc)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        jugadorId,
        puntuacion || 0,
        nivel_alcanzado || 1,
        aciertos || 0,
        fallos || 0,
        tiempo_jugado || 0,
        inspecciones_doc || 0
      ]
    );

    const partidaId = newPartida[0].id;

    // Obtener posición del jugador en el ranking
    const { rows: ranking } = await pool.query(
      'SELECT COUNT(*)::int as posicion FROM jugadores j INNER JOIN partidas p ON j.id = p.jugador_id WHERE p.puntuacion > $1',
      [puntuacion || 0]
    );

    res.json({
      ok: true,
      partidaId,
      jugadorId,
      posicion: (ranking[0]?.posicion || 0) + 1
    });

  } catch (err) {
    console.error('Error al guardar partida:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/ranking - Top 20 jugadores (mejor puntaje de cada uno)
app.get('/api/ranking', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        j.nombre,
        MAX(p.puntuacion)::int as mejor_puntuacion,
        COALESCE(ROUND(AVG(p.puntuacion)::numeric)::int, 0) as promedio_puntuacion,
        MAX(p.nivel_alcanzado)::int as mejor_nivel,
        COUNT(p.id)::int as total_partidas,
        COALESCE(ROUND((AVG(p.aciertos)::numeric / NULLIF(AVG(p.aciertos + p.fallos), 0) * 100)::numeric)::int, 0) as precision_pct,
        COALESCE(ROUND(AVG(p.inspecciones_doc::numeric / NULLIF(p.aciertos + p.fallos, 0))::numeric, 1)::float, 0) as promedio_inspecciones
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

    const { rows: jugadores } = await pool.query(
      'SELECT id, nombre, created_at FROM jugadores WHERE nombre = $1',
      [nombre]
    );

    if (jugadores.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const { rows: partidas } = await pool.query(
      `SELECT puntuacion, nivel_alcanzado, aciertos, fallos, tiempo_jugado, inspecciones_doc, jugado_en
       FROM partidas
       WHERE jugador_id = $1
       ORDER BY jugado_en DESC
       LIMIT 20`,
      [jugadores[0].id]
    );

    res.json({
      ok: true,
      jugador: jugadores[0],
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
    const { rows: totales } = await pool.query(`
      SELECT 
        COUNT(DISTINCT j.id)::int as total_jugadores,
        COUNT(p.id)::int as total_partidas,
        COALESCE(ROUND(AVG(p.puntuacion)::numeric)::int, 0) as promedio_puntuacion,
        COALESCE(MAX(p.puntuacion)::int, 0) as puntuacion_maxima,
        COALESCE(ROUND(AVG(p.nivel_alcanzado)::numeric, 1)::float, 0) as promedio_nivel,
        COALESCE(ROUND((AVG(p.aciertos)::numeric / NULLIF(AVG(p.aciertos + p.fallos), 0) * 100)::numeric)::int, 0) as precision_global,
        COALESCE(ROUND(AVG(p.tiempo_jugado)::numeric)::int, 0) as promedio_tiempo,
        COALESCE(ROUND(AVG(p.inspecciones_doc::numeric / NULLIF(p.aciertos + p.fallos, 0))::numeric, 1)::float, 0) as promedio_inspecciones
      FROM jugadores j
      INNER JOIN partidas p ON j.id = p.jugador_id
    `);

    const { rows: nivelDistribucion } = await pool.query(`
      SELECT nivel_alcanzado, COUNT(*)::int as total
      FROM partidas
      GROUP BY nivel_alcanzado
      ORDER BY nivel_alcanzado
    `);

    res.json({
      ok: true,
      estadisticas: totales[0] || {},
      distribucion_niveles: nivelDistribucion
    });

  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check con verificación de base de datos
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      ok: false,
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`API D.D.D. (PostgreSQL) corriendo en http://localhost:${PORT}`);
});
