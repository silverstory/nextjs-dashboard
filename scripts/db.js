// db.js
// import postgres from 'postgres';

const postgres = require('postgres');

// const sql = postgres({ /* options */ }) // will use psql environment variables

const sql = postgres(process.env.POSTGRES_URL, {
  host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
  port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
  database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
  username             : process.env.POSTGRES_USER,            // Username of database user
  password             : process.env.POSTGRES_PASSWORD,            // Password of database user
});


// export default sql

module.exports = sql;