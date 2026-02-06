// Game types for Creature Collector

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  currency: number;
  zooPoints: number;
  totalHunts: number;
  battleWins: number;
  battleLosses: number;
}

export interface AnimalSpecies {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  rarity: Rarity;
  emoji: string;
  baseHp: number;
  basePAtk: number;
  basePDef: number;
  baseMAtk: number;
  baseMDef: number;
  baseEnergy: number;
}

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'MYTHICAL' | 'LEGENDARY' | 'ULTRA';

export interface Pet {
  id: string;
  userId: string;
  speciesId: string;
  species: AnimalSpecies;
  nickname: string | null;
  level: number;
  xp: number;
  maxHp: number;
  currentHp: number;
  pAtk: number;
  pDef: number;
  mAtk: number;
  mDef: number;
  maxEnergy: number;
  currentEnergy: number;
  weaponId: string | null;
  weapon: Weapon | null;
  caughtAt: string;
}

export interface Weapon {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  pAtkBonus: number;
  mAtkBonus: number;
  energyCost: number;
  emoji: string;
}

export interface BattleTeam {
  id: string;
  userId: string;
  name: string;
  pet1: Pet | null;
  pet2: Pet | null;
  pet3: Pet | null;
  pet1Id: string | null;
  pet2Id: string | null;
  pet3Id: string | null;
  isActive: boolean;
}

export interface BattleAction {
  turn: number;
  actor: {
    petId: string;
    name: string;
    emoji: string;
    team: 1 | 2;
  };
  action: 'physical' | 'magical' | 'weapon';
  target: {
    petId: string;
    name: string;
    emoji: string;
  };
  damage: number;
  isCrit: boolean;
  isKO: boolean;
  remainingHp: number;
  message: string;
}

export interface BattleResult {
  success: boolean;
  message: string;
  battleId?: string;
  winner?: string;
  loser?: string;
  isDraw?: boolean;
  actions: BattleAction[];
  team1Xp: number;
  team2Xp: number;
  isPlayer1?: boolean;
  isNpc?: boolean;
}

export interface HuntResult {
  success: boolean;
  message: string;
  animal?: AnimalSpecies;
  pet?: Pet;
  isNew?: boolean;
  zooPointsGained: number;
  xpGained: number;
  currencySpent: number;
  remainingCurrency: number;
}

export interface Item {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'CONSUMABLE' | 'WEAPON' | 'BOOST' | 'COSMETIC';
  buyPrice: number | null;
  sellPrice: number;
  emoji: string;
  quantity?: number;
}

export interface Inventory {
  currency: number;
  items: Item[];
}

export interface ChatMessage {
  username: string;
  content: string;
  timestamp: string;
  type?: 'chat' | 'system' | 'announcement';
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

export interface BattleLeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  winRate: string;
}

export interface PetLeaderboardEntry {
  rank: number;
  username: string;
  petName: string;
  level: number;
  emoji: string;
}

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#9CA3AF',
  UNCOMMON: '#22C55E',
  RARE: '#3B82F6',
  EPIC: '#A855F7',
  MYTHICAL: '#F97316',
  LEGENDARY: '#EAB308',
  ULTRA: '#EF4444',
};

export const RARITY_EMOJIS: Record<Rarity, string> = {
  COMMON: '⚪',
  UNCOMMON: '🟢',
  RARE: '🔵',
  EPIC: '🟣',
  MYTHICAL: '🟠',
  LEGENDARY: '🟡',
  ULTRA: '🔴',
};
