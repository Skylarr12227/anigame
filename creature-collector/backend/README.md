# Animal Hunt Backend

A multiplayer text-based hunting game backend with real-time battles, animal collection, and shop system.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Hunting**: Real-time animal encounters with rarity system (Common → Mythical)
- **Battles**: Turn-based PvE combat with AI opponents
- **Collection**: Capture, manage, and train animals
- **Shop System**: Buy/sell items, equipment, and consumables
- **Inventory**: Equipment slots (weapon, armor, accessories) and consumables
- **Economy**: Gold currency with boosters and buffs

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start MongoDB
Make sure MongoDB is running locally or use MongoDB Atlas

### 4. Run Server
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### User
- `GET /api/user/profile` - Get profile
- `GET /api/user/collection` - Get animals
- `POST /api/user/team` - Update team
- `POST /api/user/heal` - Heal all animals
- `GET /api/user/leaderboard` - View rankings

### Hunt
- `GET /api/hunt/status` - Check cooldown
- WebSocket: `hunt` - Perform hunt

### Battle
- `POST /api/battle/create` - Start battle
- `GET /api/battle/active` - List active battles
- WebSocket: `battleAction` - Attack/defend

### Shop
- `GET /api/shop` - View shop catalog
- `GET /api/shop/inventory` - View inventory
- `POST /api/shop/buy` - Buy item
- `POST /api/shop/sell` - Sell item
- `POST /api/shop/use` - Use consumable
- `POST /api/shop/equip` - Equip gear
- `POST /api/shop/unequip` - Unequip gear

## WebSocket Events

### Client → Server
- `authenticate` - Identify connection
- `hunt` - Start hunting
- `joinBattle` - Join battle room
- `battleAction` - Perform battle action

### Server → Client
- `huntResult` - Hunt completed
- `huntCooldown` - Cooldown active
- `battleUpdate` - Battle state updated
- `battleEnd` - Battle finished

## Default Shop Items

### Consumables
- Health Potions (Small/Medium/Large)
- Revive Crystal
- Premium Bait (+catch rate)
- XP Boost Potion (2x XP for 30min)

### Equipment
- Wooden/Iron/Steel Swords
- Hunting Bow
- Leather/Chain/Plate Armor

### Loot (Hunt Drops)
- Animal Fur
- Sharp Claw
- Rare Egg

## Environment Variables

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/animalhunt
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- bcrypt.js

## License

MIT