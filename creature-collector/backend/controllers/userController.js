const User = require('../models/User');
const Animal = require('../models/Animal');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('activeTeam')
      .populate('equipped.item')
      .select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    user.activeEffects = user.activeEffects.filter(e => e.expiresAt > now);

    const collectionCount = await Animal.countDocuments({ owner: req.userId });
    const equipmentStats = user.getTotalStats();

    res.json({
      ...user.toObject(),
      collectionCount,
      xpNeeded: user.level * 100,
      xpProgress: (user.xp / (user.level * 100)) * 100,
      equipmentStats,
      activeEffects: user.activeEffects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCollection = async (req, res) => {
  try {
    const { page = 1, limit = 20, rarity, sortBy = 'capturedAt' } = req.query;

    const query = { owner: req.userId };
    if (rarity) query.rarity = rarity;

    const animals = await Animal.find(query)
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Animal.countDocuments(query);

    res.json({
      animals,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { animalIds } = req.body;

    if (!Array.isArray(animalIds) || animalIds.length > 3) {
      return res.status(400).json({ error: 'Team must have 1-3 animals' });
    }

    const animals = await Animal.find({
      _id: { $in: animalIds },
      owner: req.userId
    });

    if (animals.length !== animalIds.length) {
      return res.status(400).json({ error: 'Invalid animals in team' });
    }

    const user = await User.findById(req.userId);
    user.activeTeam = animalIds;
    await user.save();

    await Animal.updateMany(
      { owner: req.userId },
      { isActive: false }
    );
    await Animal.updateMany(
      { _id: { $in: animalIds } },
      { isActive: true }
    );

    res.json({ message: 'Team updated', team: animals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.renameAnimal = async (req, res) => {
  try {
    const { nickname } = req.body;

    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { nickname },
      { new: true }
    );

    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.releaseAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!animal) return res.status(404).json({ error: 'Animal not found' });

    await User.findByIdAndUpdate(req.userId, {
      $pull: { activeTeam: animal._id }
    });

    await Animal.deleteOne({ _id: req.params.id });
    res.json({ message: 'Animal released successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'wins', limit = 10 } = req.query;

    const validTypes = ['wins', 'level', 'totalHunts', 'gold'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    const users = await User.find()
      .sort({ [type]: -1 })
      .limit(limit * 1)
      .select('username level wins totalHunts gold');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.healAll = async (req, res) => {
  try {
    const HEAL_COST = 10;
    const user = await User.findById(req.userId);

    const animals = await Animal.find({ owner: req.userId });
    let totalCost = 0;
    let healedCount = 0;

    for (const animal of animals) {
      if (animal.hp < animal.maxHp) {
        const healAmount = animal.maxHp - animal.hp;
        totalCost += healAmount * HEAL_COST;
        healedCount++;
      }
    }

    if (user.gold < totalCost) {
      return res.status(400).json({ 
        error: 'Not enough gold', 
        required: totalCost, 
        have: user.gold 
      });
    }

    for (const animal of animals) {
      animal.hp = animal.maxHp;
      await animal.save();
    }

    user.gold -= totalCost;
    await user.save();

    res.json({
      message: `Healed ${healedCount} animals`,
      cost: totalCost,
      remainingGold: user.gold
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};