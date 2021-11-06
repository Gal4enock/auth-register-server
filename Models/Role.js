const { Schema, model } = require('mongoose');

const Role = new Schema({
  value: { type: String, required: true, default: 'USER' },
  subordinates: [{ type: String, required: false }],
  boss: { type: String, required: false }
});

module.exports = model('Role', Role);