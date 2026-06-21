const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import controllers
const checkEmailController = require('./src/controllers/auth/checkEmailController');
const resetPasswordController = require('./src/controllers/auth/resetPasswordController');
const loginController = require('./src/controllers/auth/loginController');
const signupController = require('./src/controllers/auth/signupController');
const blogController = require('./src/controllers/auth/blogController');
const sendOtpByEmailController = require('./src/controllers/auth/sendOtpByEmailController');
const similarBlogsController = require('./src/controllers/auth/similarBlogsController');
const userController = require('./src/controllers/auth/userController');
const userFullName = require('./src/controllers/auth/userFullName');
const updateProfilePicture = require('./src/controllers/auth/update-profile');
const updateFullNameController = require('./src/controllers/auth/updateFullNameController');
const updateEmailController = require('./src/controllers/auth/updateEmailController');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// MONGODB_URI must be set as an environment variable (never hardcoded here).
// Local dev:  add it to a .env file (see .env.example) and load it with dotenv, e.g.:
//   require('dotenv').config();
// Vercel:     Project -> Settings -> Environment Variables -> add MONGODB_URI.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    'Missing MONGODB_URI environment variable. Set it in your .env file locally, ' +
    'or in your hosting provider\'s Environment Variables settings (e.g. Vercel Project ' +
    'Settings -> Environment Variables). The server will not start without it.'
  );
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.post('/api/checkEmail', checkEmailController);
app.post('/api/resetPassword', resetPasswordController);
app.post('/api/login', loginController);
app.post('/api/signup', signupController);

// Blog routes
app.post('/api/blogs', blogController.createBlog);
app.get('/api/blogs', blogController.getAllBlogs);
app.get('/api/blog/:blogId', blogController.getBlogById);
app.post('/api/blogs/:blogId/like', blogController.handleLike);
app.post('/api/blogs/:blogId/comment', blogController.handleComment);
app.delete('/api/blogs/:blogId/comment/:commentId', blogController.handleDeleteComment);

app.get('/api/user/:email', userController.getUserByEmail);
app.get('/api/user-fullname/:email', userFullName.getUserFullName);

// Send OTP by email route
app.post('/api/sendOtpByEmail', sendOtpByEmailController);

app.get('/api/similar-blogs/:currentBlogId', similarBlogsController.getSimilarBlogs);

// Add route for updating profile picture
app.post('/api/update-profile-picture', updateProfilePicture);

app.post('/api/update-full-name', updateFullNameController);

// Add route for updating email address
app.post('/api/update-email', updateEmailController);

// Default route
app.get('/', (req, res) => {
  res.send('Hello, your server is running!');
});

// Only call app.listen() when running locally (node server.js).
// On Vercel, the app is exported and invoked as a serverless function instead.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
