const express = require('express');
const {getExchangeRate} = require("../controllers/utilController");
const router = express.Router();

router.get('/exchange/:currency', getExchangeRate)

module.exports = router;