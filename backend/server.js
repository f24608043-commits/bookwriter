const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import route handlers
const { signUp, signIn, signOut, authenticateToken } = require('./auth');
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getProfile,
  updateProfile,
} = require('./services');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Authentication routes
app.post('/auth/signup', signUp);
app.post('/auth/signin', signIn);
app.post('/auth/signout', signOut);

// Book routes
app.get('/books', getBooks);
app.get('/books/:id', getBookById);
app.post('/books', authenticateToken, createBook);
app.put('/books/:id', authenticateToken, updateBook);
app.delete('/books/:id', authenticateToken, deleteBook);

// Profile routes
app.get('/profiles/:userId', getProfile);
app.put('/profiles/:userId', authenticateToken, updateProfile);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files for Vercel
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
