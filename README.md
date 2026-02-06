# Creature Collector

A multiplayer, text-based web game inspired by OwO Bot's animal hunting and battling system. Built with React, Node.js, Express, Socket.io, and PostgreSQL.

## Features

### Core Gameplay
- **Hunting System**: Hunt for creatures with tiered rarity (Common, Uncommon, Rare, Epic, Mythical, Legendary, Ultra)
- **Zoo Collection**: Track all species you've ever caught with lifetime Zoo Points
- **Pet Leveling**: Pets gain XP from hunting and battles, automatically increasing stats
- **Battle System**: Turn-based automated PvP combat with up to 3 pets per team
- **Economy**: Earn and spend currency on hunts, items, and weapons

### Multiplayer Features
- **Real-time Chat**: Global chat channel for all players
- **PvP Battles**: Match against other players in real-time
- **Leaderboards**: Compete for Zoo Points, Battle Wins, and Pet Levels
- **Live Announcements**: Rare catches announced to all players

### Progression
- **Rarity Tiers**: 7 tiers of creature rarity with increasing difficulty and rewards
- **XP Curve**: Extremely grindy leveling at high levels
- **Stat Growth**: Automatic stat increases on level up
- **Weapons**: Equip weapons to pets for battle advantages

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- Socket.io Client
- Vite build tool

### Backend
- Node.js + Express
- Socket.io for real-time communication
- Prisma ORM
- PostgreSQL database
- JWT authentication

## Project Structure

```
creature-collector/
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── config/    # Game configuration
│   │   ├── data/      # Animal species data
│   │   ├── middleware/# Auth middleware
│   │   ├── systems/   # Game systems (hunting, battle, economy)
│   │   └── server.ts  # Main server file
│   └── prisma/
│       └── schema.prisma  # Database schema
│
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom hooks
│   │   └── types/     # TypeScript types
│   └── dist/          # Production build
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your backend URL
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Game Mechanics

### Hunting
- Each hunt costs 10 currency
- Multi-hunt (5 hunts) costs 45 currency
- Rarity chances:
  - Common: 50%
  - Uncommon: 30%
  - Rare: 15%
  - Epic: 4%
  - Mythical: 0.9%
  - Legendary: 0.09%
  - Ultra: 0.01%

### Battle System
- Turn-based automated combat
- Up to 3 pets per team
- Pets choose between physical, magical, or weapon attacks
- Damage calculated using attacker stats vs defender resistances
- XP rewards for all participants
- Bonus XP for wins and win streaks

### Pet Leveling
- XP gained from hunting and battles
- Stats automatically increase on level up:
  - HP: +8% per level
  - Physical Attack: +6% per level
  - Physical Defense: +5% per level
  - Magical Attack: +6% per level
  - Magical Defense: +5% per level
  - Energy: +3% per level

### Economy
- Daily rewards with streak bonuses
- Sell unwanted pets for currency
- Buy items and weapons from the shop
- Battle rewards

## API & Socket Events

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `authenticate` (socket) - Authenticate socket connection

### Hunting
- `hunt` - Perform a single hunt
- `multi_hunt` - Perform 5 hunts at once
- `hunt_result` - Receive hunt result

### Pets
- `get_pets` - Get user's pets
- `sell_pet` - Sell a pet
- `nickname_pet` - Set pet nickname

### Battle
- `find_battle` - Find PvP opponent
- `battle_npc` - Battle AI opponent
- `get_battle_teams` - Get battle teams
- `update_team` - Update battle team
- `battle_result` - Receive battle result

### Economy
- `daily` - Claim daily reward
- `get_shop` - Get shop items
- `buy_item` - Buy an item
- `use_item` - Use a consumable item
- `buy_weapon` - Buy a weapon

### Chat
- `chat_message` - Send chat message
- `chat_message` (receive) - Receive chat message
- `announcement` - Receive system announcement

## Database Schema

### Main Tables
- `users` - User accounts and progression
- `animal_species` - Creature definitions
- `pets` - Player-owned pets
- `zoo_entries` - Zoo collection tracking
- `battle_teams` - Battle team configurations
- `battles` - Battle history
- `items` - Shop items
- `weapons` - Equipable weapons
- `chat_messages` - Chat history

## License

MIT License

## Credits

Inspired by OwO Bot's hunting and battling system.
