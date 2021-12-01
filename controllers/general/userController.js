const avatarsHelpers = require('../../helpers/cloudary/avatarsHelpers');

// POST: Update user avatar
module.exports.updateAvatar = async (req, res) => {
    // Data
    const username = req.username;
    const {avatar} = req.body;
    console.log(req.body);


    const file = await blobToImage(avatar);
    return await avatarsHelpers.saveUserAvatar(file);
};

// DELETE: Delete user avatar
module.exports.deleteAvatar = async (req, res) => {
    // Data
    const username = req.username;
    return res.send({message: "", status: true, data: null});
};

const blobToImage = (blob) => {
    return new Promise(resolve => {
        const url = URL.createObjectURL(blob)
        let img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve(img)
        }
        img.src = url
    })
}
