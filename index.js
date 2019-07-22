
'use strict';

require('dotenv').config();

const port = process.env.PORT;
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const routers = require('./webserver/routes');
const mongoPool = require('./databases/mongo-pool');


const app = express();
app.use(bodyParser.json());

app.use(cors());


app.use('/api', routers.accountRouter);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).send({
    error: `Body parser: ${err.message}`,
  });
});


app.use((err, req, res, next) => {
  const { name: errorName } = err;

  if (errorName === 'AccountNotActivatedError') {
    return res.status(403).send({
      message: err.message,
    });
  }

  return res.status(500).send({
    error: err.message,
  });
});

async function init() {
  try {
    await mongoPool.connect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }


  app.listen(port, () => {
    console.log(`Server running and listening on port ${port}`);
  });
}

init();
