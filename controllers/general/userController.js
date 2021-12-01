// POST: Update user avatar
module.exports.updateAvatar = async (req, res) => {
    // Data
    const username = req.username;
    return res.send({message: "", status: true, data: null});
};

// DELETE: Delete user avatar
module.exports.deleteAvatar = async (req, res) => {
    // Data
    const username = req.username;
    return res.send({message: "", status: true, data: null});
};
