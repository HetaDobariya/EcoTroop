const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all blogs
router.get('/', (req, res) => {
  db.query("SELECT * FROM blogs", (err, results) => {
    if (err) {
      console.error("Error fetching blogs:", err);
      return res.status(500).json({ error: "Error fetching blogs" });
    }
    res.json(results);
  });
});

// Add a new blog
router.post('/', (req, res) => {
  const { title, youtube_link } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query = "INSERT INTO blogs (title, youtube_link, created_at) VALUES (?, ?, ?)";
  db.query(query, [title, youtube_link, date], (err, result) => {
    if (err) {
      console.error("Error inserting blog:", err);
      return res.status(500).json({ error: "Error inserting blog" });
    }

    res.status(200).json({
      id: result.insertId,
      title,
      youtube_link,
      created_at: date,
    });
  });
});

// Delete a blog
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM blogs WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting blog:", err);
      return res.status(500).json({ error: "Error deleting blog" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  });
});

module.exports = router;
