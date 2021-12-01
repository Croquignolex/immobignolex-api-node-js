const errorConstants = require("../constants/errorConstants");

// Manage extracted permissions from payload
module.exports = (req, res, next) => {
    // Check username existence
    const username = req.username;
    if(!username) return res.status(403).send({
        data: null,
        status: false,
        message: errorConstants.MIDDLEWARE.NO_PERMISSIONS
    });

    // Params data
    const usernameHandled = req.params.username;

    if(username !== usernameHandled) return next();

    res.status(403).send({status: false, message: errorConstants.MIDDLEWARE.PERMISSION_DENIED, data: null});
};
