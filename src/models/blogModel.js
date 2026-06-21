const mongoose = require('mongoose');

const BlogDataSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true },
    title:    { type: String, required: true },
    content:  { type: String, required: true },
    image:    { type: String, default: null },
    tags:     { type: [String], default: [] },
    likes:    { type: Number, default: 0 },
    comments: [{ user: String, text: String }],
  },
  { timestamps: true }   // adds createdAt & updatedAt automatically
);

const BlogData = mongoose.model('BlogData', BlogDataSchema);
module.exports = BlogData;
