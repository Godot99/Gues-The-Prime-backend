'use strict';

const mongoose = require('mongoose');

const { MONGO_URI: mongoUri } = process.env;

async function connect() {
  const conn = await mongoose.connect(mongoUri, { useNewUrlParser: true });

  return conn;
}

async function disconnect() {
  mongoose.connection.close();
}

module.exports = {
  connect,
  disconnect,
};
