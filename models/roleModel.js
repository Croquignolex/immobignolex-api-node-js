module.exports = class RoleModel {
    constructor(role) {
        Object.assign(this, role);
    };

    get miniResponseFormat() {
        return {
            id: this._id,
            name: this.name
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            permissions: this.permissions
        };
    };
};
