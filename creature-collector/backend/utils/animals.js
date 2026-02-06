const ANIMAL_TEMPLATES = {
  'rabbit': { name: 'Rabbit', type: 'earth', baseHp: 20, baseAttack: 5, baseDefense: 3, baseSpeed: 8, rarity: 'common' },
  'squirrel': { name: 'Squirrel', type: 'earth', baseHp: 15, baseAttack: 4, baseDefense: 2, baseSpeed: 10, rarity: 'common' },
  'deer': { name: 'Deer', type: 'earth', baseHp: 30, baseAttack: 6, baseDefense: 4, baseSpeed: 7, rarity: 'common' },
  'fox': { name: 'Fox', type: 'earth', baseHp: 25, baseAttack: 7, baseDefense: 3, baseSpeed: 9, rarity: 'common' },
  'wolf': { name: 'Wolf', type: 'earth', baseHp: 40, baseAttack: 12, baseDefense: 6, baseSpeed: 8, rarity: 'uncommon' },
  'eagle': { name: 'Eagle', type: 'air', baseHp: 35, baseAttack: 14, baseDefense: 4, baseSpeed: 12, rarity: 'uncommon' },
  'snake': { name: 'Snake', type: 'earth', baseHp: 30, baseAttack: 15, baseDefense: 5, baseSpeed: 6, rarity: 'uncommon' },
  'boar': { name: 'Wild Boar', type: 'earth', baseHp: 50, baseAttack: 10, baseDefense: 8, baseSpeed: 5, rarity: 'uncommon' },
  'bear': { name: 'Bear', type: 'earth', baseHp: 80, baseAttack: 20, baseDefense: 15, baseSpeed: 4, rarity: 'rare' },
  'lion': { name: 'Lion', type: 'earth', baseHp: 70, baseAttack: 25, baseDefense: 12, baseSpeed: 9, rarity: 'rare' },
  'falcon': { name: 'Peregrine Falcon', type: 'air', baseHp: 45, baseAttack: 28, baseDefense: 6, baseSpeed: 15, rarity: 'rare' },
  'shark': { name: 'Shark', type: 'water', baseHp: 75, baseAttack: 24, baseDefense: 10, baseSpeed: 8, rarity: 'rare' },
  'dragon': { name: 'Dragon', type: 'fire', baseHp: 120, baseAttack: 40, baseDefense: 25, baseSpeed: 7, rarity: 'epic' },
  'griffin': { name: 'Griffin', type: 'air', baseHp: 100, baseAttack: 35, baseDefense: 20, baseSpeed: 11, rarity: 'epic' },
  'kraken': { name: 'Kraken', type: 'water', baseHp: 150, baseAttack: 30, baseDefense: 30, baseSpeed: 3, rarity: 'epic' },
  'golem': { name: 'Stone Golem', type: 'earth', baseHp: 200, baseAttack: 25, baseDefense: 40, baseSpeed: 2, rarity: 'epic' },
  'phoenix': { name: 'Phoenix', type: 'fire', baseHp: 150, baseAttack: 50, baseDefense: 20, baseSpeed: 12, rarity: 'legendary' },
  'leviathan': { name: 'Leviathan', type: 'water', baseHp: 180, baseAttack: 45, baseDefense: 35, baseSpeed: 6, rarity: 'legendary' },
  'behemoth': { name: 'Behemoth', type: 'earth', baseHp: 250, baseAttack: 40, baseDefense: 50, baseSpeed: 3, rarity: 'legendary' },
  'celestial_dragon': { name: 'Celestial Dragon', type: 'fire', baseHp: 300, baseAttack: 80, baseDefense: 50, baseSpeed: 10, rarity: 'mythical' },
  'void_walker': { name: 'Void Walker', type: 'dark', baseHp: 200, baseAttack: 70, baseDefense: 30, baseSpeed: 15, rarity: 'mythical' }
};

const RARITY_CHANCES = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 0.9,
  mythical: 0.1
};

function getWildAnimalStats(templateId, level = 1) {
  const template = ANIMAL_TEMPLATES[templateId];
  if (!template) return null;

  const multiplier = 1 + ((level - 1) * 0.1);

  return {
    templateId,
    name: template.name,
    type: template.type,
    rarity: template.rarity,
    level,
    hp: Math.floor(template.baseHp * multiplier),
    maxHp: Math.floor(template.baseHp * multiplier),
    attack: Math.floor(template.baseAttack * multiplier),
    defense: Math.floor(template.baseDefense * multiplier),
    speed: Math.floor(template.baseSpeed * multiplier)
  };
}

function generateRandomAnimal(playerLevel = 1) {
  const rand = Math.random() * 100;
  let selectedRarity;
  let cumulative = 0;

  for (const [rarity, chance] of Object.entries(RARITY_CHANCES)) {
    cumulative += chance;
    if (rand <= cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  const possibleAnimals = Object.entries(ANIMAL_TEMPLATES)
    .filter(([_, data]) => data.rarity === selectedRarity)
    .map(([id, _]) => id);

  const selectedId = possibleAnimals[Math.floor(Math.random() * possibleAnimals.length)];

  const levelVariance = Math.floor(Math.random() * 3) - 1;
  const animalLevel = Math.max(1, playerLevel + levelVariance);

  return getWildAnimalStats(selectedId, animalLevel);
}

module.exports = {
  ANIMAL_TEMPLATES,
  RARITY_CHANCES,
  getWildAnimalStats,
  generateRandomAnimal
};