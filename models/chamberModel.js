const UserModel = require("./userModel");
const PropertyModel = require("./propertyModel");
const generalHelpers = require('../helpers/generalHelpers');

module.exports = class ChamberModel {
    constructor(chamber) {
        Object.assign(this, chamber);
    };

    get simpleResponseFormat() {
        return {
            id: this._id,
            name: this.name,
            free: this.free,
            rent: this.rent,
            type: this.type,
            phone: this.phone,
            goods: this.goods ? this.goods?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            property: this.container ? new PropertyModel(this.container).miniResponseFormat : null
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            rent: this.rent,
            free: this.free,
            type: this.type,
            phone: this.phone,
            created_at: this.created_at,
            goods: this.goods ? this.goods?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            property: this.container ? new PropertyModel(this.container).miniResponseFormat : null
        };
    };
};
