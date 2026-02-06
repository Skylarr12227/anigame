require('dotenv').config();
const mongoose = require('mongoose');
const shopController = require('./controllers/shopController');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/animalhunt')
  .then(async () => {
    console.log('Connected to MongoDB, seeding items...');
    await shopController.seedItems();
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });