const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
});

module.exports = mongoose.model('Achievement', achievementSchema);