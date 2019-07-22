"use strict";

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userActivationSchema = new Schema({
    uuid: {
        type: String,
        unique: true
    },
    verificationCode: {
        type: String,
        unique: true
    },
    createdAt: Date,
    verifiedAt: Date
});

const UserActivation = mongoose.model('UserActivation', userActivationSchema);

module.exports = UserActivation;