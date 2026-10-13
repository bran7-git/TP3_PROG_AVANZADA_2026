/**
 * Pool de conexiones a Postgres.
 *
 * Se configura enteramente por variables de entorno para que funcione tanto
 * corriendo "suelto" (npm run dev contra un Postgres local) como dentro de
 * docker compose, donde DB_HOST pasa a ser el nombre del servicio ("db")
 * en vez de "localhost".
 */

import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    // Opciones de resiliencia para evitar ENOTFOUND al reiniciar contenedores
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
})

// Escuchador de errores en el pool para evitar que un corte puntual tumbe la API
pool.on('error', (err) => {
    console.error('⚠️ Error inesperado en el pool de PostgreSQL:', err.message)
})

// Chequeo con reintentos al arrancar la aplicación
const connectWithRetry = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query('SELECT NOW()')
            console.log('✅ Conectado a Postgres')
            return
        } catch (err) {
            console.error(`❌ Intento ${i + 1}/${retries} - No se pudo conectar a Postgres: ${err.message}`)
            if (i < retries - 1) {
                await new Promise((res) => setTimeout(res, delay))
            }
        }
    }
}

connectWithRetry()