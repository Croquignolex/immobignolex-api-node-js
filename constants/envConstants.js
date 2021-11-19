require('dotenv').config();

// App config
module.exports.APP = {
    LOGGER: process.env.LOGGER,
    ENVIRONMENT: process.env.ENVIRONMENT,
    TIMEOUT: parseInt(process.env.TIMEOUT),
    ORIGINS: JSON.parse(process.env.CORS_ORIGINS),
    SERVER_PORT: parseInt(process.env.SERVER_PORT)
};

// JWT options
module.exports.JWT = {
    EXPIRE: process.env.JWT_EXPIRE,
    ISSUER: process.env.JWT_ISSUER,
    SUBJECT: process.env.JWT_SUBJECT,
    AUDIENCE: process.env.JWT_AUDIENCE
};

// Services URL
module.exports.SERVICE = {
    USERS: process.env.USERS_SERVICE_URL,
    ROLES: process.env.ROLES_SERVICE_URL,
    TOKENS: process.env.TOKENS_SERVICE_URL
};
