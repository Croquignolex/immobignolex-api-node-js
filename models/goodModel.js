const UserModel = require('./userModel');
const ChamberModel = require("./chamberModel");
const generalHelpers = require('../helpers/generalHelpers');

module.exports = class GoodModel {
    constructor(good) {
        Object.assign(this, good);
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
            type: this.type,
            name: this.name,
            color: this.color,
            weigh: this.weigh,
            height: this.height,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            chamber: this.container ? new ChamberModel(this.container).miniResponseFormat : null
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            type: this.type,
            name: this.name,
            color: this.color,
            weigh: this.weigh,
            height: this.height,
            created_at: this.created_at,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            chamber: this.container ? new ChamberModel(this.container).miniResponseFormat : null
        };
    };
};
