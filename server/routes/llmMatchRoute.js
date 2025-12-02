const express = require('express');
const router = express.Router();

// Placeholder for LLM matching route
// This will be implemented in future sprints
router.post('/match', async (req, res) => {
  // TODO: Implement LLM-based resume matching
  res.json({ message: 'LLM matching route - to be implemented' });
});

module.exports = router;

