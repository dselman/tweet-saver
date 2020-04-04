require('dotenv').config()

const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'

const connectionString = process.env.DATABASE_URL + '&ssl=true';

const pool = new Pool({
  connectionString: connectionString
})

module.exports = { pool }