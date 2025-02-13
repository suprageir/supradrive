const jwt = require("jsonwebtoken");
const config = process.env;


const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var token = bearerToken;
    }

    if (!bearerHeader) {
        var token = req.cookies.supradrivetoken;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, config.SUPRADRIVE_SECRET_TOKENKEY);
            req.user = decoded;
        }
        catch (err) {
            return res.status(401).send("Invalid Token");
        }
    }
    else {
        return res.status(403).send("A token is required for authentication");
    }
    return next();
};


module.exports = verifyToken;