// Permissions
module.exports.PERMISSIONS = {
    BASIC: "basic"
};

// Mongo db loop directive
module.exports.LOOP_DIRECTIVE = {
    CREATOR: {
        $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "username",
            as: "creator"
        },
    }
};
