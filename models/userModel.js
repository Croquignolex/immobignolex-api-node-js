module.exports = class UserModel {
    constructor(user) {
        Object.assign(this, user);
    };

    get authResponse() {
        return {
            name: this.name,
            role: this.role,
            email: this.email,
            avatar: this.avatar,
            username: this.username,
            permissions: this.permissions
        };
    };
};
