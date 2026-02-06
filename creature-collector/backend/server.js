require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/animalhunt', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Seed shop items
  const shopController = require('./controllers/shopController');
  shopController.seedItems();
})
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/hunt', require('./routes/hunt'));
app.use('/api/battle', require('./routes/battle'));
app.use('/api/shop', require('./routes/shop'));

// Socket.io connection handling
const huntController = require('./controllers/huntController');
const battleController = require('./controllers/battleController');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (userId) => {
    socket.userId = userId;
    socket.join(userId);
    console.log(`User ${userId} authenticated on socket ${socket.id}`);
  });

  socket.on('hunt', (data) => huntController.socketHunt(socket, io, data));
  socket.on('battleAction', (data) => battleController.socketBattleAction(socket, io, data));

  socket.on('joinBattle', (battleId) => {
    socket.join(`battle:${battleId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };