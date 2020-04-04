require('dotenv').config()

const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?ssl=true&rejectUnauthorized=false`;

const config = {
  connectionString: isProduction ? `${process.env.DATABASE_URL}?ssl=true&rejectUnauthorized=false` : connectionString,
  ssl: isProduction,
}

console.log(JSON.stringify(config, null,2));
const pool = new Pool(config)

module.exports = { pool }