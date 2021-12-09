const generalHelpers = require('../helpers/generalHelpers');

module.exports = class PropertyModel {
    constructor(property) {
        Object.assign(this, property);
    };

    get authResponse() {
        return {
            name: this.name,
            phones: this.phones,
            address: this.address,
            manager: this.manager,
            location: this.location,
            description: this.description,
            pictures: generalHelpers.picturesPublicUrl(this.pictures)
        };
    };
};
