module.exports = class UserModel {
    constructor(user) {
        Object.assign(this, user);
    };

    get authResponse() {
        return {
            name: this.name,
            roles: this.roles,
            email: this.email,
            username: this.username
        };
    };
};
