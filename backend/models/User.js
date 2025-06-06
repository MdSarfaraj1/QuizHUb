const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/10337/10337609.png', 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  quizzesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  quizzesTaken: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true }, 
    userScore: { type: Number, required: true }, 
    maxQuizScore: { type: Number, required: true }, 
    submissionDate: { type: Date, default: Date.now } ,
    correctAnswers: Number,
    wrongAnswers: Number,
    timeTaken:Number,
    difficulty:{
      type:String,
      enum:['easy', 'medium','hard' ]
    },
    category:String
  }],
  learnLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalScore: { type: Number, default: 0 },        
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  lastQuizOfTheDate: Date,
  createdAt: { type: Date, default: Date.now },
  quizOfTheDayStreak: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});
userSchema.virtual('totalQuizzes').get(function () {
  return this.quizzesTaken.length;
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('User', userSchema);
