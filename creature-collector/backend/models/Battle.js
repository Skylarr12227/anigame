const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  type: { type: String, enum: ['pve', 'pvp'], required: true },

  challengerTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }],
  opponentTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }],

  status: { 
    type: String, 
    enum: ['waiting', 'active', 'completed', 'cancelled'], 
    default: 'waiting' 
  },
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  turnNumber: { type: Number, default: 0 },

  log: [{
    turn: Number,
    action: String,
    actor: String,
    target: String,
    damage: Number,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],

  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rewards: {
    gold: Number,
    xp: Number,
    drops: [String]
  },

  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);