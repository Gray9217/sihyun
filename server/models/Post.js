const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
  {
    emoji: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', PostSchema)
