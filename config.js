require('dotenv').config()

const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'

const connectionString = process.env.PG_CONNECTION_STRING;

const pool = new Pool({
  connectionString: connectionString,
  ssl: true,
})

module.exports = { pool }