let jwt = require('jsonwebtoken'),
    config = require('config'),
    jwtConfig = config.get('TurboGraph_v2.jwt'),
    tokenSecret = jwtConfig.secret;

function verifyToken(token) {
    try {
        return jwt.verify(token, tokenSecret);
    } catch (err) {
        console.error(`Token verification error: ${err}`);
        return false;
    }
}

function getToken(authorization) {
    let token = false;
    if (authorization) {
        token = authorization.split(" ");
        token = token[1];
        if (token == 'undefined') {
            token = false;
        }
    }

    return token;
}


exports.getToken = getToken;
exports.verifyToken = verifyToken;