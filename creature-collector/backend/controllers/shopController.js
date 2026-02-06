const User = require('../models/User');
const Animal = require('../models/Animal');
const Item = require('../models/Item');

const DEFAULT_ITEMS = [
  {
    itemId: 'health_potion_small',
    name: 'Small Health Potion',
    description: 'Restores 20 HP to one animal',
    category: 'consumable',
    rarity: 'common',
    buyPrice: 15,
    sellPrice: 5,
    isConsumable: true,
    effects: [{ type: 'heal', value: 20 }],
    icon: '🧪'
  },
  {
    itemId: 'health_potion_medium',
    name: 'Health Potion',
    description: 'Restores 50 HP to one animal',
    category: 'consumable',
    rarity: 'uncommon',
    buyPrice: 35,
    sellPrice: 12,
    isConsumable: true,
    effects: [{ type: 'heal', value: 50 }],
    icon: '🧪'
  },
  {
    itemId: 'health_potion_large',
    name: 'Large Health Potion',
    description: 'Restores 100 HP to one animal',
    category: 'consumable',
    rarity: 'rare',
    buyPrice: 80,
    sellPrice: 25,
    isConsumable: true,
    effects: [{ type: 'heal', value: 100 }],
    icon: '🧪'
  },
  {
    itemId: 'revive_crystal',
    name: 'Revive Crystal',
    description: 'Revives a fainted animal with 25% HP',
    category: 'consumable',
    rarity: 'rare',
    buyPrice: 100,
    sellPrice: 30,
    isConsumable: true,
    effects: [{ type: 'revive', value: 25 }],
    icon: '💎'
  },
  {
    itemId: 'catch_bait',
    name: 'Premium Bait',
    description: 'Increases catch rate by 25% for next hunt',
    category: 'consumable',
    rarity: 'uncommon',
    buyPrice: 50,
    sellPrice: 15,
    isConsumable: true,
    effects: [{ type: 'catch_boost', value: 0.25, duration: 1 }],
    icon: '🥩'
  },
  {
    itemId: 'xp_boost_potion',
    name: 'XP Boost Potion',
    description: '2x XP for 30 minutes',
    category: 'consumable',
    rarity: 'epic',
    buyPrice: 200,
    sellPrice: 60,
    isConsumable: true,
    effects: [{ type: 'xp_boost', value: 2, duration: 30 }],
    icon: '⚗️'
  },
  {
    itemId: 'sword_wooden',
    name: 'Wooden Sword',
    description: 'A basic training sword',
    category: 'weapon',
    rarity: 'common',
    buyPrice: 50,
    sellPrice: 15,
    stats: { attack: 5 },
    levelRequired: 1,
    icon: '🗡️'
  },
  {
    itemId: 'sword_iron',
    name: 'Iron Sword',
    description: 'A sturdy iron blade',
    category: 'weapon',
    rarity: 'uncommon',
    buyPrice: 150,
    sellPrice: 45,
    stats: { attack: 15 },
    levelRequired: 5,
    icon: '⚔️'
  },
  {
    itemId: 'sword_steel',
    name: 'Steel Sword',
    description: 'A sharp steel weapon',
    category: 'weapon',
    rarity: 'rare',
    buyPrice: 400,
    sellPrice: 120,
    stats: { attack: 30 },
    levelRequired: 15,
    icon: '🗡️'
  },
  {
    itemId: 'bow_hunting',
    name: 'Hunting Bow',
    description: 'Increases hunting efficiency',
    category: 'weapon',
    rarity: 'uncommon',
    buyPrice: 120,
    sellPrice: 36,
    stats: { attack: 10, speed: 5 },
    levelRequired: 3,
    icon: '🏹'
  },
  {
    itemId: 'armor_leather',
    name: 'Leather Armor',
    description: 'Basic protection',
    category: 'armor',
    rarity: 'common',
    buyPrice: 80,
    sellPrice: 24,
    stats: { defense: 10, hp: 10 },
    levelRequired: 1,
    icon: '🛡️'
  },
  {
    itemId: 'armor_chain',
    name: 'Chainmail',
    description: 'Better protection',
    category: 'armor',
    rarity: 'uncommon',
    buyPrice: 250,
    sellPrice: 75,
    stats: { defense: 25, hp: 20 },
    levelRequired: 8,
    icon: '👕'
  },
  {
    itemId: 'armor_plate',
    name: 'Plate Armor',
    description: 'Heavy but strong',
    category: 'armor',
    rarity: 'rare',
    buyPrice: 600,
    sellPrice: 180,
    stats: { defense: 50, hp: 40 },
    levelRequired: 20,
    icon: '🛡️'
  },
  {
    itemId: 'animal_fur',
    name: 'Animal Fur',
    description: 'Soft fur from wild animals',
    category: 'loot',
    rarity: 'common',
    buyPrice: 0,
    sellPrice: 8,
    isShopItem: false,
    icon: '🧶'
  },
  {
    itemId: 'sharp_claw',
    name: 'Sharp Claw',
    description: 'A sharp animal claw',
    category: 'loot',
    rarity: 'common',
    buyPrice: 0,
    sellPrice: 12,
    isShopItem: false,
    icon: '🦴'
  },
  {
    itemId: 'rare_egg',
    name: 'Rare Egg',
    description: 'Might hatch something special?',
    category: 'loot',
    rarity: 'epic',
    buyPrice: 500,
    sellPrice: 150,
    isShopItem: true,
    icon: '🥚'
  }
];

exports.seedItems = async () => {
  try {
    const count = await Item.countDocuments();
    if (count === 0) {
      await Item.insertMany(DEFAULT_ITEMS);
      console.log('Shop items seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding items:', error);
  }
};

exports.getShop = async (req, res) => {
  try {
    const { category, rarity } = req.query;

    let query = { isShopItem: true, isActive: true };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;

    const items = await Item.find(query).sort({ category: 1, buyPrice: 1 });

    const user = await User.findById(req.userId);
    const userLevel = user.level;

    const availableItems = items.filter(item => item.levelRequired <= userLevel);
    const lockedItems = items.filter(item => item.levelRequired > userLevel);

    res.json({
      available: availableItems,
      locked: lockedItems,
      userGold: user.gold,
      userGems: user.gems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    const item = await Item.findById(itemId);
    if (!item || !item.isShopItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const user = await User.findById(req.userId);

    if (user.level < item.levelRequired) {
      return res.status(400).json({ 
        error: `Level ${item.levelRequired} required`, 
        required: item.levelRequired,
        current: user.level
      });
    }

    const totalCost = item.buyPrice * quantity;
    if (user.gold < totalCost) {
      return res.status(400).json({ 
        error: 'Not enough gold',
        required: totalCost,
        have: user.gold
      });
    }

    const existingItem = user.inventory.find(i => i.item.toString() === itemId);
    if (existingItem && existingItem.quantity + quantity > item.maxStack) {
      return res.status(400).json({ 
        error: `Cannot hold more than ${item.maxStack} of this item`,
        maxStack: item.maxStack,
        current: existingItem.quantity
      });
    }

    user.gold -= totalCost;
    user.addItem(itemId, quantity);
    await user.save();

    res.json({
      message: `Bought ${quantity}x ${item.name}`,
      item: item,
      quantity: quantity,
      totalCost: totalCost,
      remainingGold: user.gold
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sellItem = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    const user = await User.findById(req.userId);
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!user.hasItem(itemId, quantity)) {
      return res.status(400).json({ error: 'Not enough items to sell' });
    }

    const isEquipped = user.equipped.some(e => e.item.toString() === itemId);
    if (isEquipped) {
      return res.status(400).json({ error: 'Unequip item before selling' });
    }

    const totalValue = item.sellPrice * quantity;

    user.gold += totalValue;
    user.removeItem(itemId, quantity);
    await user.save();

    res.json({
      message: `Sold ${quantity}x ${item.name}`,
      item: item,
      quantity: quantity,
      earned: totalValue,
      newGold: user.gold
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.useItem = async (req, res) => {
  try {
    const { itemId, targetAnimalId } = req.body;

    const user = await User.findById(req.userId);
    const item = await Item.findById(itemId);

    if (!item || !item.isConsumable) {
      return res.status(400).json({ error: 'Item cannot be used' });
    }

    if (!user.hasItem(itemId)) {
      return res.status(400).json({ error: 'Item not in inventory' });
    }

    let result = {};

    for (const effect of item.effects) {
      switch (effect.type) {
        case 'heal':
          if (!targetAnimalId) {
            return res.status(400).json({ error: 'Target animal required' });
          }
          const animal = await Animal.findOne({ 
            _id: targetAnimalId, 
            owner: req.userId 
          });
          if (!animal) {
            return res.status(404).json({ error: 'Animal not found' });
          }
          const healAmount = Math.min(effect.value, animal.maxHp - animal.hp);
          animal.hp += healAmount;
          await animal.save();
          result = { 
            type: 'heal', 
            target: animal.name, 
            amount: healAmount,
            newHp: animal.hp 
          };
          break;

        case 'revive':
          if (!targetAnimalId) {
            return res.status(400).json({ error: 'Target animal required' });
          }
          const target = await Animal.findOne({ 
            _id: targetAnimalId, 
            owner: req.userId 
          });
          if (!target) {
            return res.status(404).json({ error: 'Animal not found' });
          }
          if (target.hp > 0) {
            return res.status(400).json({ error: 'Animal is not fainted' });
          }
          target.hp = Math.floor(target.maxHp * (effect.value / 100));
          await target.save();
          result = { 
            type: 'revive', 
            target: target.name, 
            hp: target.hp 
          };
          break;

        case 'catch_boost':
        case 'xp_boost':
        case 'gold_boost':
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + effect.duration);

          user.activeEffects.push({
            type: effect.type,
            value: effect.value,
            expiresAt: expiresAt
          });
          result = { 
            type: effect.type, 
            value: effect.value,
            duration: effect.duration,
            expiresAt: expiresAt
          };
          break;
      }
    }

    user.removeItem(itemId, 1);
    await user.save();

    res.json({
      message: `Used ${item.name}`,
      effect: result,
      item: item
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const { itemId, slot } = req.body;

    const user = await User.findById(req.userId);
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!['weapon', 'armor', 'accessory'].includes(item.category)) {
      return res.status(400).json({ error: 'Item cannot be equipped' });
    }

    if (!user.hasItem(itemId)) {
      return res.status(400).json({ error: 'Item not in inventory' });
    }

    let equipSlot = slot;
    if (!equipSlot) {
      if (item.category === 'weapon') equipSlot = 'weapon';
      else if (item.category === 'armor') equipSlot = 'armor';
      else equipSlot = 'accessory1';
    }

    const currentEquipIndex = user.equipped.findIndex(e => e.slot === equipSlot);
    if (currentEquipIndex > -1) {
      user.equipped.splice(currentEquipIndex, 1);
    }

    user.equipped.push({
      slot: equipSlot,
      item: itemId
    });

    await user.save();
    await user.populate('equipped.item');

    res.json({
      message: `Equipped ${item.name} to ${equipSlot}`,
      equipped: user.equipped,
      statsGained: item.stats
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unequipItem = async (req, res) => {
  try {
    const { slot } = req.body;

    const user = await User.findById(req.userId);

    const equipIndex = user.equipped.findIndex(e => e.slot === slot);
    if (equipIndex === -1) {
      return res.status(400).json({ error: 'No item equipped in that slot' });
    }

    const itemId = user.equipped[equipIndex].item;
    user.equipped.splice(equipIndex, 1);
    await user.save();

    const item = await Item.findById(itemId);

    res.json({
      message: `Unequipped ${item ? item.name : 'item'} from ${slot}`,
      slot: slot
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('inventory.item')
      .populate('equipped.item');

    const now = new Date();
    user.activeEffects = user.activeEffects.filter(e => e.expiresAt > now);
    await user.save();

    const bonusStats = user.getTotalStats();

    res.json({
      inventory: user.inventory,
      equipped: user.equipped,
      activeEffects: user.activeEffects,
      equipmentStats: bonusStats,
      gold: user.gold,
      gems: user.gems
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateLootDrop = (rarity) => {
  const lootTable = {
    common: ['animal_fur', 'sharp_claw'],
    uncommon: ['animal_fur', 'sharp_claw', 'health_potion_small'],
    rare: ['health_potion_medium', 'sword_wooden'],
    epic: ['health_potion_large', 'rare_egg'],
    legendary: ['rare_egg', 'xp_boost_potion']
  };

  const possibleDrops = lootTable[rarity] || lootTable.common;
  if (Math.random() < 0.3) {
    return possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
  }
  return null;
};