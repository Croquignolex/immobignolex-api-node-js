const generalHelpers = require('../helpers/generalHelpers');

module.exports = class UserModel {
    constructor(user) {
        Object.assign(this, user);
    };

    get miniResponseFormat() {
        return {
            name: this.name,
            username: this.username
        };
    };

    get simpleResponseFormat() {
        return {
            name: this.name,
            post: this.post,
            role: this.role,
            email: this.email,
            phone: this.phone,
            enable: this.enable,
            username: this.username,
            permissions: this.permissions,
            description: this.description,
            avatar: generalHelpers.filePublicUrl(this.avatar),
            properties: this.properties ? this.properties?.length : 0
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            post: this.post,
            role: this.role,
            email: this.email,
            phone: this.phone,
            enable: this.enable,
            username: this.username,
            created_at: this.created_at,
            permissions: this.permissions,
            description: this.description,
            avatar: generalHelpers.filePublicUrl(this.avatar),
            properties: this.properties ? this.properties?.length : 0,
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null
        };
    };
};
