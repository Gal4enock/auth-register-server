const { Schema, model, SchemaTypes} = require('mongoose');

const User = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "USER" },
  subordinates: [{ type:  SchemaTypes.ObjectId, ref: "USER" }],
});

module.exports = model('User', User);