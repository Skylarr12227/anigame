const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: String, required: true },
  name: { type: String, required: true },
  nickname: { type: String, default: null },

  hp: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  speed: { type: Number, required: true },

  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },

  rarity: { type: String, required: true },
  type: { type: String, required: true },

  capturedAt: { type: Date, default: Date.now },
  capturedFrom: String,

  isActive: { type: Boolean, default: true },
  inBattle: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);