"use strict";

const mongoose = require("mongoose");

const { Schema } = mongoose;

const userProfileSchema = new Schema({
    uuid: {
        type: String,
        unique: true
    },
    email: String,
    password: String,
    createdAt: Date
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
