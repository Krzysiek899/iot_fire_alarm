const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');
const crypto = require('crypto');

const router = express.Router();

/**
 * Generowanie tokena powiązania dla użytkownika
 */
router.post('/generate-token', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Generowanie unikalnego tokena
    const token = crypto.randomBytes(32).toString('hex');

    // Ustalenie czasu wygaśnięcia (np. 24 godziny od teraz)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const query = `
        INSERT INTO user_tokens (user_id, token, expires_at, used)
        VALUES (?, ?, ?, FALSE)
    `;

    db.query(query, [userId, token, expiresAt], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        res.json({ message: 'Token wygenerowany', token });
    });
});

module.exports = router;
