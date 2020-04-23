const express = require('express');
const server = express();
const PORT = process.env.PORT;
const { Pool } = require('pg')
const pool = new Pool()

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
    server.get('/', (req, res) => res.status(200).send(result.rows));
    console.log(result.rows);
  })
})
