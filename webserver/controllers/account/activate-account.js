'use strict';

const UserActivation = require('../../../models/user-activation-model');

async function activate(req, res) {
  const { verification_code: verificationCode } = req.query;

  if (!verificationCode) {
    return res.status(400).json({
      message: 'invalid verification code',
      target: 'verification_code',
    });
  }

  try {
    const now = new Date();
    const query = { verificationCode };
    await UserActivation.findOneAndUpdate(query, { verifiedAt: now });
    return res.status(200).send('Activated');
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

module.exports = activate;
