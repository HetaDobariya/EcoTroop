const Feedback = require('../models/feedbackModel');

const createFeedback = (req, res) => {
  const { email, message } = req.body;
  
  Feedback.create({ email, message }, (err, data) => {
    if (err) {
      console.error("Error inserting feedback:", err);
      return res.status(500).json({ message: 'Error submitting feedback' });
    }
    return res.json({ message: 'Feedback submitted successfully' });
  });
};

const getAllFeedback = (req, res) => {
  Feedback.getAll((err, data) => {
    if (err) {
      console.error("Error fetching feedback:", err);
      return res.status(500).json({ error: 'Error fetching feedback' });
    }
    return res.json(data);
  });
};

const deleteFeedback = (req, res) => {
  const feedbackId = req.params.id; // Get ID from URL params
  
  if (!feedbackId) {
    return res.status(400).json({ error: 'Feedback ID is required' });
  }

  Feedback.delete(feedbackId, (err, data) => { // Pass feedbackId here
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: 'Error While deleting feedback' });
    }
    
    // Check if any rows were actually deleted
    if (data.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    return res.json({ 
      message: 'Feedback deleted successfully', 
      affectedRows: data.affectedRows 
    });
  });
};


module.exports = {
  createFeedback,
  getAllFeedback,
  deleteFeedback
};
