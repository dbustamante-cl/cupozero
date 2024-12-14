const express = require('express');
const router = express.Router();
const { getBankCards } = require('../controllers/bankCardsController');

router.get('/bank_cards', getBankCards);

module.exports = router;