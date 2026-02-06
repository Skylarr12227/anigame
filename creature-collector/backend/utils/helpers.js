function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function calculateDamage(attacker, defender, isCrit = false) {
  const baseDamage = attacker.attack - (defender.defense * 0.5);
  const variance = Math.random() * 0.4 + 0.8;
  let damage = Math.floor(baseDamage * variance);

  if (isCrit) damage *= 2;

  return Math.max(1, damage);
}

function calculateXpGain(winner, loser) {
  const baseXp = 10;
  const levelDiff = loser.level - winner.level;
  const multiplier = 1 + (levelDiff * 0.1);
  return Math.floor(baseXp * multiplier);
}

function calculateGoldReward(animalRarity) {
  const rewards = {
    common: 5,
    uncommon: 10,
    rare: 25,
    epic: 100,
    legendary: 500,
    mythical: 2000
  };
  return rewards[animalRarity] || 5;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

module.exports = {
  generateId,
  calculateDamage,
  calculateXpGain,
  calculateGoldReward,
  formatTime
};