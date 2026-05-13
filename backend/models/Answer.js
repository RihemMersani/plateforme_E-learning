const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Answer', AnswerSchema);
