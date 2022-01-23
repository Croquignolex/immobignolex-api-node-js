const UserModel = require('./userModel');
const generalHelpers = require('../helpers/generalHelpers');

module.exports = class PropertyModel {
    constructor(property) {
        Object.assign(this, property);
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
            phone: this.phone,
            address: this.address,
            updatable: this.updatable,
            deletable: this.deletable,
            created_at: this.created_at,
            description: this.description,
            occupied_chambers: this.occupied_chambers,
            occupied_percentage: this.occupied_percentage,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null
        };
    };
};
