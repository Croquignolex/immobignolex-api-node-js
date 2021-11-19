require('dotenv').config();

// App config
module.exports.APP = {
    LOGGER: process.env.LOGGER,
    ENVIRONMENT: process.env.ENVIRONMENT,
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

// Mongo DB
module.exports.DATABASE_URL = process.env.MONGO_DB_URL;
