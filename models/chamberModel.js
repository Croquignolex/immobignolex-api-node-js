const UserModel = require("./userModel");
const PropertyModel = require("./propertyModel");
const generalHelpers = require('../helpers/generalHelpers');

module.exports = class ChamberModel {
    constructor(chamber) {
        Object.assign(this, chamber);
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
            rent: this.rent,
            type: this.type,
            phone: this.phone,
            occupied: this.occupied,
            updatable: this.updatable,
            deletable: this.deletable,
            description: this.description,
            goods: this.goods ? this.goods?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            property: this.building ? new PropertyModel(this.building).miniResponseFormat : null
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            rent: this.rent,
            type: this.type,
            phone: this.phone,
            occupied: this.occupied,
            updatable: this.updatable,
            deletable: this.deletable,
            created_at: this.created_at,
            description: this.description,
            goods: this.goods ? this.goods?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            property: this.building ? new PropertyModel(this.building).miniResponseFormat : null
        };
    };
};
