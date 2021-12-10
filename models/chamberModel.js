const generalHelpers = require('../helpers/generalHelpers');

module.exports = class ChamberModel {
    constructor(chamber) {
        Object.assign(this, chamber);
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            type: this.type,
            description: this.description,
            tenants: (!this.tenants) ? 0 : this.tenants?.length,
            furniture: (!this.furniture) ? 0 : this.furniture?.length,
            pictures: generalHelpers.picturesPublicUrl(this.pictures)
        };
    };
};
