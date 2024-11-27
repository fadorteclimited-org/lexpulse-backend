const jwt = require('jsonwebtoken');


function adminAuth(req, res, next) {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({msg: 'No token, authorization denied'});

    try {
        const body = req.body;
        if (body && body.operationName === "IntrospectionQuery") {
            return next();
        }
        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        // Verify token
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
        // Find the scanner from payload
        const admin = decoded;
        if ( !admin || admin.role !== 'admin') {
            return res.status(403).json({msg: 'Invalid token, authorization denied'});
        }

        req.admin = admin;
        next();

    } catch (error) {
        console.log(error);
        res.status(403).json({msg: 'Token is not valid'});
    }
}

module.exports = adminAuth;