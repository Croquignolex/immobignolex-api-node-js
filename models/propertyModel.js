const generalHelpers = require('../helpers/generalHelpers');

module.exports = class PropertyModel {
    constructor(property) {
        Object.assign(this, property);
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            phone: this.phone,
            address: this.address,
            caretaker: this.caretaker,
            description: this.description,
            chambers: (this.chambers) ? 0 : this.chambers?.length,
            pictures: generalHelpers.picturesPublicUrl(this.pictures)
        };
    };
};
