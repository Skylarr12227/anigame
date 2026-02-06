const Battle = require('../models/Battle');
const User = require('../models/User');
const Animal = require('../models/Animal');
const Item = require('../models/Item');
const { calculateDamage } = require('../utils/helpers');
const shopController = require('./shopController');

const BATTLE_COOLDOWN = 60000;

exports.createBattle = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, opponentId } = req.body;

    const user = await User.findById(userId);

    const now = new Date();
    if (user.lastBattle && (now - user.lastBattle) < BATTLE_COOLDOWN) {
      return res.status(400).json({
        error: 'Battle cooldown active',
        remainingTime: BATTLE_COOLDOWN - (now - user.lastBattle)
      });
    }

    const team = await Animal.find({ owner: userId, isActive: true });
    if (team.length === 0) {
      return res.status(400).json({ error: 'No active animals in team' });
    }

    let battleData = {
      challenger: userId,
      type,
      challengerTeam: team.map(a => a._id),
      status: 'active'
    };

    if (type === 'pvp') {
      if (!opponentId) return res.status(400).json({ error: 'Opponent required for PvP' });
      battleData.opponent = opponentId;
      battleData.status = 'waiting';
    } else {
      battleData.opponentTeam = await generateAiTeam(user.level);
      battleData.currentTurn = userId;
    }

    const battle = new Battle(battleData);
    await battle.save();

    await battle.populate('challenger challengerTeam');
    if (type === 'pvp') await battle.populate('opponent opponentTeam');

    res.status(201).json(battle);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate('challenger', 'username')
      .populate('opponent', 'username')
      .populate('challengerTeam')
      .populate('opponentTeam');

    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    res.json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.socketBattleAction = async (socket, io, data) => {
  try {
    const { battleId, action, targetId } = data;
    const userId = socket.userId;

    const battle = await Battle.findById(battleId)
      .populate('challenger challengerTeam')
      .populate('opponent opponentTeam');

    if (!battle) return socket.emit('battleError', { message: 'Battle not found' });
    if (battle.status !== 'active') return socket.emit('battleError', { message: 'Battle not active' });
    if (battle.currentTurn.toString() !== userId) return socket.emit('battleError', { message: 'Not your turn' });

    const isChallenger = battle.challenger._id.toString() === userId;
    const myTeam = isChallenger ? battle.challengerTeam : battle.opponentTeam;
    const enemyTeam = isChallenger ? battle.opponentTeam : battle.challengerTeam;

    const myAnimal = myTeam.find(a => a.hp > 0);
    const targetAnimal = enemyTeam.find(a => a._id.toString() === targetId && a.hp > 0) || 
                        enemyTeam.find(a => a.hp > 0);

    if (!myAnimal || !targetAnimal) {
      return socket.emit('battleError', { message: 'Invalid target' });
    }

    let logEntry = {
      turn: battle.turnNumber + 1,
      actor: myAnimal.name,
      timestamp: new Date()
    };

    if (action === 'attack') {
      const damage = calculateDamage(myAnimal, targetAnimal);
      targetAnimal.hp -= damage;
      logEntry.action = 'attack';
      logEntry.target = targetAnimal.name;
      logEntry.damage = damage;
      logEntry.message = `${myAnimal.name} attacks ${targetAnimal.name} for ${damage} damage!`;

      if (targetAnimal.hp <= 0) {
        logEntry.message += ` ${targetAnimal.name} fainted!`;
      }
    } else if (action === 'defend') {
      logEntry.action = 'defend';
      logEntry.message = `${myAnimal.name} is defending!`;
    }

    await myAnimal.save();
    await targetAnimal.save();

    const enemyAlive = enemyTeam.some(a => a.hp > 0);
    const myAlive = myTeam.some(a => a.hp > 0);

    if (!enemyAlive || !myAlive) {
      battle.status = 'completed';
      battle.endedAt = new Date();

      if (myAlive) {
        battle.winner = userId;

        const xpGain = enemyTeam.reduce((sum, a) => sum + (a.level * 10), 0);
        const goldGain = 50;

        const user = await User.findById(userId);

        // Check for XP boost
        const xpBoost = user.activeEffects.find(e => e.type === 'xp_boost' && e.expiresAt > new Date());
        const finalXp = xpBoost ? Math.floor(xpGain * xpBoost.value) : xpGain;

        // Generate loot
        const drops = [];
        for (const enemy of enemyTeam) {
          const dropId = shopController.generateLootDrop(enemy.rarity);
          if (dropId) {
            const item = await Item.findOne({ itemId: dropId });
            if (item) {
              user.addItem(item._id, 1);
              drops.push({
                name: item.name,
                icon: item.icon,
                rarity: item.rarity
              });
            }
          }
        }

        user.xp += finalXp;
        user.gold += goldGain;
        user.wins += 1;
        await user.save();

        battle.rewards = { xp: finalXp, gold: goldGain, drops };

        const xpNeeded = user.level * 100;
        if (user.xp >= xpNeeded) {
          user.level += 1;
          user.xp -= xpNeeded;
          await user.save();
        }
      }

      battle.log.push(logEntry);
      await battle.save();

      io.to(`battle:${battleId}`).emit('battleEnd', {
        battle,
        winner: battle.winner,
        rewards: battle.rewards
      });
      return;
    }

    battle.currentTurn = isChallenger ? battle.opponent._id : battle.challenger._id;
    battle.turnNumber += 1;
    battle.log.push(logEntry);
    await battle.save();

    io.to(`battle:${battleId}`).emit('battleUpdate', {
      battle,
      lastAction: logEntry,
      nextTurn: battle.currentTurn
    });

    if (battle.type === 'pve' && battle.currentTurn.toString() !== userId) {
      setTimeout(() => processAiTurn(battle, io), 1500);
    }

  } catch (error) {
    console.error('Battle action error:', error);
    socket.emit('battleError', { message: error.message });
  }
};

async function processAiTurn(battle, io) {
  try {
    const aiTeam = battle.opponentTeam;
    const playerTeam = battle.challengerTeam;

    const aiAnimal = aiTeam.find(a => a.hp > 0);
    const target = playerTeam.find(a => a.hp > 0);

    if (!aiAnimal || !target) return;

    const damage = calculateDamage(aiAnimal, target);
    target.hp -= damage;
    await target.save();

    const logEntry = {
      turn: battle.turnNumber + 1,
      action: 'attack',
      actor: aiAnimal.name,
      target: target.name,
      damage: damage,
      message: `${aiAnimal.name} attacks ${target.name} for ${damage} damage!`,
      timestamp: new Date()
    };

    if (target.hp <= 0) {
      logEntry.message += ` ${target.name} fainted!`;
    }

    const playerAlive = playerTeam.some(a => a.hp > 0);

    if (!playerAlive) {
      battle.status = 'completed';
      battle.endedAt = new Date();
      battle.winner = battle.opponent;
      battle.log.push(logEntry);
      await battle.save();

      io.to(`battle:${battle._id}`).emit('battleEnd', {
        battle,
        winner: null,
        message: 'You lost the battle!'
      });
      return;
    }

    battle.currentTurn = battle.challenger;
    battle.turnNumber += 1;
    battle.log.push(logEntry);
    await battle.save();

    io.to(`battle:${battle._id}`).emit('battleUpdate', {
      battle,
      lastAction: logEntry,
      nextTurn: battle.challenger
    });

  } catch (error) {
    console.error('AI turn error:', error);
  }
}

async function generateAiTeam(playerLevel) {
  const { generateRandomAnimal } = require('../utils/animals');
  const teamSize = Math.min(3, Math.floor(playerLevel / 5) + 1);
  const team = [];

  for (let i = 0; i < teamSize; i++) {
    const animal = generateRandomAnimal(playerLevel + Math.floor(Math.random() * 3));
    team.push(animal);
  }

  return team;
}

exports.getActiveBattles = async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [
        { challenger: req.userId },
        { opponent: req.userId }
      ],
      status: { $in: ['waiting', 'active'] }
    }).populate('challenger opponent', 'username');

    res.json(battles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};