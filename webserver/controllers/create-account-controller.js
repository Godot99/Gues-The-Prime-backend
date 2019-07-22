'use strict';

const bcrypt = require('bcrypt');
const Joi = require('joi');
const sendgridMail = require('@sendgrid/mail');
const uuidV4 = require('uuid/v4');

const UserProfileModel = require('../../models/user-profile-model');
const UserActivation = require('../../models/user-activation-model');
const UserModel = require('../../models/user-model');

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function validateSchema(payload) {
  const schema = {
    nickName: Joi.string().allow(''),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
  };

  return Joi.validate(payload, schema);
}

async function createProfile(uuid) {
  const userProfileData = {
    uuid,
    nickName: null,
  };

  const profileCreated = await UserModel.create(userProfileData);

  return profileCreated;
}

async function addVerificationCode(uuid) {
  const verificationCode = uuidV4();
  const now = new Date();
  const createdAt = now
    .toISOString()
    .substring(0, 19)
    .replace('T', ' ');

  const userActivation = new UserActivation({
    uuid,
    verificationCode,
    createdAt,
  });

  try {
    await userActivation.save();
    return verificationCode;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function sendEmailRegistration(userEmail, verificationCode) {
  const linkActivation = `${process.env.URL}/api/account/activate?verification_code=${verificationCode}`;
  const msg = {
    to: userEmail,
    from: {
      email: 'guesstheprime@yopmail.com',
      name: 'Guess the Prime',
    },
    subject: 'Welcome to Gues the Prime!',
    text: 'Enjoy the game',
    html: `To confirm the account <a href='${linkActivation}'>activate it here</a>`,
  };

  const data = await sendgridMail.send(msg);

  return data;
}


async function createAccount(req, res) {
  const accountData = req.body;

  try {
    await validateSchema(accountData);
  } catch (e) {
    return res.status(400).send(e);
  }

  const now = new Date();
  const securePassword = await bcrypt.hash(accountData.password, 10);
  const uuid = uuidV4();
  const createdAt = now
    .toISOString()
    .substring(0, 19)
    .replace('T', ' ');


  try {
    const userProfileModel = new UserProfileModel({
      uuid,
      email: accountData.email,
      password: securePassword,
      createdAt,
    });

    await userProfileModel.save();
    const verificationCode = await addVerificationCode(uuid);

    await sendEmailRegistration(accountData.email, verificationCode);
    await createProfile(uuid);
    return res.status(201).send();
  } catch (e) {
    console.log('Error creating profile');
    console.log(e.message);
    return res.status(500).send(e.message);
  }
}

module.exports = createAccount;
