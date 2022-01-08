module.exports = class LeaseModel {
    constructor(lease) {
        Object.assign(this, lease);
    };

    get miniResponseFormat() {
        return {
            id: this._id,
            name: this.name
        };
    };

    get simpleResponseFormat() {
        return {
            id: this._id,
            name: this.name,

        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,

        };
    };
};
