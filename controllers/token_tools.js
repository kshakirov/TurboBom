let jwt = require('jsonwebtoken'),
    config = require('config'),
    //cookie = require('cookie'),
    jwtConfig = config.get('TurboGraph.jwt'),
    tokenExpiration = jwtConfig.tokenExpiration,
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
