'use strict';

const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const AccountNotActivatedError = require('./errors/account-not-activated-error');
const UserActivationModel = require('../../models/user-activation-model');
const UserProfileModel = require('../../models/user-profile-model');

async function validateData(payload) {
  const schema = {
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
  };

  return Joi.validate(payload, schema);
}

async function login(req, res, next) {
  /**
   * Validación de los datos de entrada con Joi.
   */
  const accountData = { ...req.body };
  try {
    await validateData(accountData);
  } catch (e) {
    return res.status(400).send(e);
  }

  /**
   * 1. Comprobación de que el usuario existe en la base de datos.
   */
  try {
    const userProfile = await UserProfileModel.findOne({
      email: accountData.email,
    });

    if (!userProfile) {
      return res.status(400).send('Invalid email');
    }

    /**
     * 2. Comprobación de que la cuenta está activada.
     */

    const userActivation = await UserActivationModel.findOne({
      uuid: userProfile.uuid,
    });
    if (!userActivation || !userActivation.verifiedAt) {
      const accountNotActivated = new AccountNotActivatedError(
        'You need to confirm the verification link'
      );
      return next(accountNotActivated);
    }

    /**
     * 3. Comprobación de la password.
     */
    const passwordChecked = await bcrypt.compare(
      accountData.password,
      userProfile.password
    );
    if (passwordChecked === false) {
      return res.status(400).send('Invalid password');
    }

    /**
     * 4. Se genera un token JWT con uuid + role (admin) asociado al token
     * La duración del token es de 1 minuto (podria ir en variable de entorno)
     */
    const payloadJwt = {
      uuid: userProfile.uuid,
      role: 'admin',
    };

    const jwtTokenExpiration = parseInt(process.env.AUTH_ACCESS_TOKEN_TTL, 10);
    const token = jwt.sign(payloadJwt, process.env.AUTH_JWT_SECRET, {
      expiresIn: jwtTokenExpiration,
    });
    const response = {
      accessToken: token,
      expiresIn: jwtTokenExpiration,
    };

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e.message);
  }
}

module.exports = login;
