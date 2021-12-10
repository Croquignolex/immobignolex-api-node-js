const generalHelpers = require('../helpers/generalHelpers');

module.exports = class PropertyModel {
    constructor(property) {
        Object.assign(this, property);
    };

    get responseFormat() {
        return {
            name: this.name,
            phone: this.phones,
            address: this.address,
            description: this.description,
            caretaker: caretaker(this.manager),
            pictures: generalHelpers.picturesPublicUrl(this.pictures)
        };
    };
};

const caretaker = (manager) => {
    if(!manager || manager?.length === 0) return null;
    return manager[0].name;
};
