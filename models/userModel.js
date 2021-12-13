const generalHelpers = require('../helpers/generalHelpers');

module.exports = class UserModel {
    constructor(user) {
        Object.assign(this, user);
    };

    get responseFormat() {
        return {
            name: this.name,
            role: this.role,
            email: this.email,
            phone: this.phone,
            enable: this.enable,
            username: this.username,
            permissions: this.permissions,
            description: this.description,
            avatar: generalHelpers.filePublicUrl(this.avatar),
            properties: (this.properties) ? 0 : this.properties?.length,
        };
    };
};
