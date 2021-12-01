const generalHelpers = require('../helpers/generalHelpers');

module.exports = class UserModel {
    constructor(user) {
        Object.assign(this, user);
    };

    get authResponse() {
        return {
            name: this.name,
            role: this.role,
            email: this.email,
            username: this.username,
            permissions: this.permissions,
            avatar: generalHelpers.filePublicUrl(this.avatar)
        };
    };
};
