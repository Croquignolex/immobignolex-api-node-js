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

    get simpleResponseFormat() {
        return {
            id: this._id,
            name: this.name,
            phone: this.phone,
            address: this.address,
            occupied: this.occupied,
            occupation: this.occupation,
            chambers: this.chambers ? this.chambers?.length : 0,
            employees: this.employees ? this.employees?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures)
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            phone: this.phone,
            address: this.address,
            created_at: this.created_at,
            occupation: this.occupation,
            description: this.description,
            chambers: this.chambers ? this.chambers?.length : 0,
            pictures: generalHelpers.picturesPublicUrl(this.pictures),
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null
        };
    };
};
