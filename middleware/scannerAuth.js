const jwt = require('jsonwebtoken');
const Scanner = require('../models/scannerModel');

function scannerAuth(req, res, next) {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        // Verify token
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);

        // Find the scanner from payload
        Scanner.findById(decoded.id, (err, scanner) => {
            if (err || !scanner || !scanner.activated) {
                return res.status(403).json({ msg: 'Scanner not found' });
            }

            req.scanner = scanner;
            next();
        });
    } catch (error) {
        console.log(error);
        res.status(403).json({ msg: 'Token is not valid' });
    }
}

module.exports = scannerAuth;