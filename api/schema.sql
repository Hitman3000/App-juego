-- Esquema PostgreSQL para el juego D.D.D.

CREATE TABLE IF NOT EXISTS jugadores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partidas (
    id SERIAL PRIMARY KEY,
    jugador_id INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
    puntuacion INTEGER NOT NULL DEFAULT 0,
    nivel_alcanzado INTEGER NOT NULL DEFAULT 1,
    aciertos INTEGER NOT NULL DEFAULT 0,
    fallos INTEGER NOT NULL DEFAULT 0,
    tiempo_jugado INTEGER NOT NULL DEFAULT 0,
    inspecciones_doc INTEGER NOT NULL DEFAULT 0,
    jugado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar rankings y consultas de historial
CREATE INDEX IF NOT EXISTS idx_jugadores_nombre ON jugadores(nombre);
CREATE INDEX IF NOT EXISTS idx_partidas_jugador_id ON partidas(jugador_id);
CREATE INDEX IF NOT EXISTS idx_partidas_puntuacion ON partidas(puntuacion DESC);
CREATE INDEX IF NOT EXISTS idx_partidas_jugado_en ON partidas(jugado_en DESC);
