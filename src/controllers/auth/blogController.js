const BlogData = require('../../models/blogModel');

/* ── Create ── */
const createBlog = async (req, res) => {
  const { email, title, content, image, tags } = req.body;
  try {
    const newBlog = new BlogData({
      email, title, content, image: image || null,
      tags: Array.isArray(tags) ? tags : [],
    });
    await newBlog.save();
    res.status(201).json({ message: 'Blog saved successfully', blog: newBlog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* ── Get All (sorted newest first) ── */
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await BlogData.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* ── Get by ID ── */
const getBlogById = async (req, res) => {
  try {
    const blog = await BlogData.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* ── Like ── */
const handleLike = async (req, res) => {
  try {
    const blog = await BlogData.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.likes += 1;
    await blog.save();
    res.status(200).json({ likes: blog.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* ── Add Comment ── */
const handleComment = async (req, res) => {
  const { user, text } = req.body;
  try {
    const blog = await BlogData.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.comments.push({ user, text });
    await blog.save();
    res.status(200).json({ comments: blog.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* ── Delete Comment ── */
const handleDeleteComment = async (req, res) => {
  const { blogId, commentId } = req.params;
  try {
    const blog = await BlogData.findOneAndUpdate(
      { _id: blogId, 'comments._id': commentId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog or comment not found' });
    res.status(200).json({ comments: blog.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* ── Similar Blogs (sorted by likes, exclude current) ── */
const getSimilarBlogs = async (req, res) => {
  try {
    const blogs = await BlogData.find({ _id: { $ne: req.params.blogId } })
      .sort({ likes: -1, createdAt: -1 })
      .limit(5);
    res.status(200).json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { createBlog, getAllBlogs, getBlogById, handleLike, handleComment, handleDeleteComment, getSimilarBlogs };
