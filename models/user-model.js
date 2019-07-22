'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  uuid: {
    type: String,
    unique: true,
  },
  nickName: String,
});

userSchema.index(
  {
    nickName: 'text',
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
