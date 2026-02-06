const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, default: 1 },
  obtainedAt: { type: Date, default: Date.now }
});

const equippedItemSchema = new mongoose.Schema({
  slot: { type: String, enum: ['weapon', 'armor', 'accessory1', 'accessory2'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  equippedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  gold: { type: Number, default: 100 },
  gems: { type: Number, default: 0 },

  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  totalHunts: { type: Number, default: 0 },
  totalBattles: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },

  inventory: [inventoryItemSchema],
  equipped: [equippedItemSchema],

  activeEffects: [{
    type: { type: String },
    value: { type: Number },
    expiresAt: { type: Date }
  }],

  activeTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }],

  lastHunt: { type: Date, default: null },
  lastBattle: { type: Date, default: null },
  lastShopRefresh: { type: Date, default: null }
}, { timestamps: true });

userSchema.methods.hasItem = function(itemId, quantity = 1) {
  const inventoryItem = this.inventory.find(i => i.item.toString() === itemId);
  return inventoryItem && inventoryItem.quantity >= quantity;
};

userSchema.methods.addItem = function(itemId, quantity = 1) {
  const existingItem = this.inventory.find(i => i.item.toString() === itemId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.inventory.push({ item: itemId, quantity });
  }
};

userSchema.methods.removeItem = function(itemId, quantity = 1) {
  const index = this.inventory.findIndex(i => i.item.toString() === itemId);
  if (index > -1) {
    this.inventory[index].quantity -= quantity;
    if (this.inventory[index].quantity <= 0) {
      this.inventory.splice(index, 1);
    }
    return true;
  }
  return false;
};

userSchema.methods.getTotalStats = function() {
  let bonusStats = { attack: 0, defense: 0, speed: 0, hp: 0 };
  this.equipped.forEach(equip => {
    if (equip.item && equip.item.stats) {
      bonusStats.attack += equip.item.stats.attack || 0;
      bonusStats.defense += equip.item.stats.defense || 0;
      bonusStats.speed += equip.item.stats.speed || 0;
      bonusStats.hp += equip.item.stats.hp || 0;
    }
  });
  return bonusStats;
};

module.exports = mongoose.model('User', userSchema);