// .env config
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

// Cloudinary options
module.exports.CLOUDINARY = {
    NAME: process.env.CLOUD_NAME,
    SECURE: process.env.CLOUD_SECURE,
    API_KEY: process.env.CLOUD_API_KEY,
    API_SECRET: process.env.CLOUD_API_SECRET
};

// Mongo DB
module.exports.DATABASE_URL = process.env.MONGO_DB_URL;
