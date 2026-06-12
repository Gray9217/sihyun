const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String },
  createdAt: { type: Date, default: Date.now }
})

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String },
    metadata: { type: Object },
    messages: [MessageSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Conversation', ConversationSchema)
