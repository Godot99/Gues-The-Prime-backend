'use strict';

const jwt = require('jsonwebtoken');

const { AUTH_JWT_SECRET: authJwtSecret } = process.env;

function checkJwtToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send();
  }

  const [prefix, token] = authorization.split(' ');
  if (prefix !== 'JWT') {
    return res.status(401).send();
  }

  if (!token) {
    return res.status(401).send();
  }

  try {
    const decoded = jwt.verify(token, authJwtSecret);

    req.claims = {
      uuid: decoded.uuid,
      role: decoded.role,
    };

    return next();
  } catch (e) {
    return res.status(401).send();
  }
}

module.exports = checkJwtToken;
