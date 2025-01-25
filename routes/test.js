
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: `Witaj, użytkowniku ${req.user.email}` });
});

module.exports = router;