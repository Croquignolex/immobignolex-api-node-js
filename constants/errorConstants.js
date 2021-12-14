// General
module.exports.GENERAL = {
    DATABASE: "DATABASE_ERROR",
    FORM_DATA: "FORM_DATA_ERROR",
    BOT_REQUEST: "BOT_REQUEST_ERROR",
    CLOUD_SERVICE: "CLOUD_SERVICE_ERROR",
    PICTURE_TYPE: "BAD_PICTURE_TYPE_ERROR",
};

// Middleware
module.exports.MIDDLEWARE = {
    INVALID_TOKEN: "INVALID_TOKEN_ERROR",
    PERMISSION_DENIED: "PERMISSION_DENIED",
    NO_PERMISSIONS: "NO_PERMISSIONS_ERROR",
    UNAUTHORIZED_REQUEST: "UNAUTHORIZED_REQUEST_ERROR",
};

// Users
module.exports.USERS = {
    USER_AUTH: "USER_AUTH_ERROR",
    USER_TOKEN: "USER_TOKEN_NOT_FOUND",
    USER_DISABLED: "USER_DISABLED_ERROR",
    SAME_PASSWORD: "USER_HAS_SAME_PASSWORD",
    USER_INFO_UPDATE: "USER_INFO_UPDATE_ERROR",
    PASSWORD_NOT_MATCH: "USER_PASSWORD_NOT_MATCH",
    USER_TOKENS_UPDATE: "USER_TOKENS_UPDATE_ERROR",
    USER_AVATAR_UPDATE: "USER_AVATAR_UPDATE_ERROR",
    NOT_FOUND_BY_USERNAME: "USER_NOT_FOUND_BY_USERNAME",
};

// Properties
module.exports.PROPERTIES = {
    NOT_FOUND_BY_ID: "PROPERTY_NOT_FOUND_BY_ID_ERROR",
    PROPERTIES_PICTURES_UPDATE: "PROPERTIES_PICTURES_UPDATE_ERROR",
    PROPERTY_PICTURE_DELETE: "PROPERTY_PICTURE_DELETE_ERROR",
};
