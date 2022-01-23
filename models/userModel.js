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

    get responseFormat() {
        return {
            id: this._id,
            cni: this.cni,
            name: this.name,
            post: this.post,
            role: this.role,
            email: this.email,
            phone: this.phone,
            enable: this.enable,
            balance: this.balance,
            username: this.username,
            updatable: this.updatable,
            deletable: this.deletable,
            created_at: this.created_at,
            permissions: this.permissions,
            description: this.description,
            avatar: generalHelpers.filePublicUrl(this.avatar),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null
        };
    };
};
