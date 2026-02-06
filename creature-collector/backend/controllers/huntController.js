const User = require('../models/User');
const Animal = require('../models/Animal');
const Item = require('../models/Item');
const { generateRandomAnimal, calculateGoldReward } = require('../utils/animals');
const { calculateDamage } = require('../utils/helpers');
const shopController = require('./shopController');

const HUNT_COOLDOWN = 15000;

exports.socketHunt = async (socket, io, data) => {
  try {
    const userId = socket.userId;
    if (!userId) {
      return socket.emit('huntError', { message: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return socket.emit('huntError', { message: 'User not found' });
    }

    const now = new Date();
    if (user.lastHunt && (now - user.lastHunt) < HUNT_COOLDOWN) {
      const remaining = HUNT_COOLDOWN - (now - user.lastHunt);
      return socket.emit('huntCooldown', { remainingTime: remaining });
    }

    const wildAnimal = generateRandomAnimal(user.level);
    const userTeam = await Animal.find({ owner: userId, isActive: true }).limit(3);

    if (userTeam.length === 0) {
      return socket.emit('huntError', { message: 'No active animals! Add animals to your team first.' });
    }

    let battleLog = [];
    let currentAnimal = { ...wildAnimal };
    let captured = false;
    let escaped = false;

    const playerAnimal = userTeam[0];
    let rounds = 0;
    const maxRounds = 10;

    while (currentAnimal.hp > 0 && playerAnimal.hp > 0 && rounds < maxRounds) {
      rounds++;

      const dmgToWild = calculateDamage(playerAnimal, currentAnimal);
      currentAnimal.hp -= dmgToWild;
      battleLog.push({
        round,
        action: 'attack',
        actor: playerAnimal.name,
        target: currentAnimal.name,
        damage: dmgToWild,
        message: `${playerAnimal.name} deals ${dmgToWild} damage to ${currentAnimal.name}!`
      });

      if (currentAnimal.hp <= 0) break;

      const dmgToPlayer = calculateDamage(currentAnimal, playerAnimal);
      playerAnimal.hp -= dmgToPlayer;
      battleLog.push({
        round,
        action: 'counter',
        actor: currentAnimal.name,
        target: playerAnimal.name,
        damage: dmgToPlayer,
        message: `${currentAnimal.name} deals ${dmgToPlayer} damage to ${playerAnimal.name}!`
      });
    }

    let outcome = '';
    let rewards = {};

    if (currentAnimal.hp <= 0) {
      const captureChance = getCaptureChance(wildAnimal.rarity, user);
      if (Math.random() < captureChance) {
        captured = true;

        const newAnimal = new Animal({
          owner: userId,
          templateId: wildAnimal.templateId,
          name: wildAnimal.name,
          hp: wildAnimal.maxHp,
          maxHp: wildAnimal.maxHp,
          attack: wildAnimal.attack,
          defense: wildAnimal.defense,
          speed: wildAnimal.speed,
          rarity: wildAnimal.rarity,
          type: wildAnimal.type,
          level: wildAnimal.level,
          capturedFrom: 'wild'
        });
        await newAnimal.save();

        outcome = 'captured';
        rewards = {
          gold: calculateGoldReward(wildAnimal.rarity),
          xp: wildAnimal.level * 5,
          animal: newAnimal
        };
      } else {
        outcome = 'defeated';
        rewards = {
          gold: Math.floor(calculateGoldReward(wildAnimal.rarity) / 2),
          xp: wildAnimal.level * 2
        };
      }

      // Generate loot drop
      const droppedItemId = shopController.generateLootDrop(wildAnimal.rarity);
      if (droppedItemId) {
        const droppedItem = await Item.findOne({ itemId: droppedItemId });
        if (droppedItem) {
          user.addItem(droppedItem._id, 1);
          rewards.droppedItem = {
            id: droppedItem._id,
            name: droppedItem.name,
            icon: droppedItem.icon,
            rarity: droppedItem.rarity
          };
        }
      }
    } else if (playerAnimal.hp <= 0) {
      outcome = 'lost';
      rewards = { gold: 1, xp: 1 };
    } else {
      outcome = 'escaped';
      escaped = true;
    }

    // Check for XP boost
    const xpBoost = user.activeEffects.find(e => e.type === 'xp_boost' && e.expiresAt > now);
    if (xpBoost) {
      rewards.xp = Math.floor(rewards.xp * xpBoost.value);
    }

    user.gold += rewards.gold;
    user.xp += rewards.xp;
    user.totalHunts += 1;
    user.lastHunt = now;

    const xpNeeded = user.level * 100;
    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp -= xpNeeded;
    }

    await user.save();

    socket.emit('huntResult', {
      success: true,
      outcome,
      wildAnimal,
      battleLog,
      captured,
      escaped,
      rewards,
      userStats: {
        gold: user.gold,
        level: user.level,
        xp: user.xp,
        totalHunts: user.totalHunts
      }
    });

  } catch (error) {
    console.error('Hunt error:', error);
    socket.emit('huntError', { message: error.message });
  }
};

function getCaptureChance(rarity, user) {
  let chances = {
    common: 0.8,
    uncommon: 0.6,
    rare: 0.4,
    epic: 0.2,
    legendary: 0.1,
    mythical: 0.05
  };

  // Check for catch boost
  const catchBoost = user.activeEffects.find(e => e.type === 'catch_boost' && e.expiresAt > new Date());
  if (catchBoost) {
    return Math.min(0.95, chances[rarity] + catchBoost.value);
  }

  return chances[rarity] || 0.5;
}

exports.getHuntStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now = new Date();
    let remaining = 0;

    if (user.lastHunt && (now - user.lastHunt) < HUNT_COOLDOWN) {
      remaining = HUNT_COOLDOWN - (now - user.lastHunt);
    }

    res.json({
      canHunt: remaining === 0,
      remainingTime: remaining,
      totalHunts: user.totalHunts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};