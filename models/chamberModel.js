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
            rent: this.rent,
            type: this.type,
            phone: this.phone,
            tenants: this.tenants ? this.tenants?.length : 0,
            furniture: this.furniture ? this.furniture?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            property: this.container ? new PropertyModel(this.container).simpleResponseFormat : null
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            rent: this.rent,
            type: this.type,
            phone: this.phone,
            created_at: this.created_at,
            tenants: this.tenants ? this.tenants?.length : 0,
            furniture: this.furniture ? this.furniture?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            property: this.container ? new PropertyModel(this.container).simpleResponseFormat : null
        };
    };
};
