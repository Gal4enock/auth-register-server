const { Schema, model } = require('mongoose');

const User = new Schema({
  username: { type: String, unique: true, required: true },
  parol: { type: String, required: true },
  roles: [{ type: String, ref: 'Role' }]
});

module.exports = model('User', User);