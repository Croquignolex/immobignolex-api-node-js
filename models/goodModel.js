const UserModel = require('./userModel');
const ChamberModel = require("./chamberModel");
const PropertyModel = require("./propertyModel");
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

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            color: this.color,
            weigh: this.weigh,
            height: this.height,
            updatable: this.updatable,
            deletable: this.deletable,
            created_at: this.created_at,
            description: this.description,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            chamber: this.unit ? new ChamberModel(this.unit).miniResponseFormat : null,
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            property: this.building ? new PropertyModel(this.building).miniResponseFormat : null
        };
    };
};
