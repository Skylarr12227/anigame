const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },

  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },

  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },
  isShopItem: { type: Boolean, default: true },

  effects: [{
    type: { type: String },
    value: { type: Number },
    duration: { type: Number, default: 0 }
  }],

  stats: {
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    hp: { type: Number, default: 0 }
  },

  levelRequired: { type: Number, default: 1 },
  isConsumable: { type: Boolean, default: false },
  maxStack: { type: Number, default: 99 },
  icon: { type: String, default: '📦' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);