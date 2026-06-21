const Blog = require('../../models/blogModel');

const getSimilarBlogs = async (req, res) => {
  const { currentBlogId } = req.params;
  try {
    const current = await Blog.findById(currentBlogId);
    if (!current) return res.status(404).json({ error: 'Blog not found' });

    const similar = await Blog.find({ _id: { $ne: currentBlogId } })
      .sort({ likes: -1, createdAt: -1 })
      .limit(5);

    res.json(similar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getSimilarBlogs };
