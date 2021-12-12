const generalHelpers = require('../helpers/generalHelpers');

module.exports = class TenantModel {
    constructor(tenant) {
        Object.assign(this, tenant);
    };

    get responseFormat() {
        return {
            id: this._id,
            cni: this.cni,
            sex: this.sex,
            name: this.name,
            phone: this.phone,
            email: this.email,
            avatar: generalHelpers.filePublicUrl(this.avatar)
        };
    };
};
