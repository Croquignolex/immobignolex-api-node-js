const UserModel = require('./userModel');
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
            created_at: this.created_at,
            occupation: this.occupation,
            description: this.description,
            chambers: (!this.chambers) ? 0 : this.chambers?.length,
            caretaker: extractCaretaker(this.caretaker, this.manager),
            pictures: generalHelpers.picturesPublicUrl(this.pictures)
        };
    };
};

// Extract caretaker
const extractCaretaker = (caretaker, manager) => {
    if(manager && manager?.length > 0) {
        return (new UserModel(manager[0])).responseFormat
    }
    return caretaker;
};
