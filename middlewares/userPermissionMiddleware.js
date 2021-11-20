const errorConstants = require("../constants/errorConstants");
const generalConstants = require("../constants/generalConstants");

// Manage extracted permissions from payload
module.exports = (req, res, next) => {
    // Check permissions existence
    const permissions = req.permissions;
    if(!permissions) return res.status(403).json({
        data: null,
        status: false,
        message: errorConstants.MIDDLEWARE.NO_PERMISSIONS
    });

    if(permissions.includes(generalConstants.ROLES.USER)) return next();

    res.status(403).json({status: false, message: errorConstants.MIDDLEWARE.PERMISSION_DENIED, data: null});
};
