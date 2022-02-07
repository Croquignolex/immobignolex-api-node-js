const generalHelpers = require('../helpers/generalHelpers');

module.exports = class CompanyModel {
    constructor(company) {
        Object.assign(this, company);
    };

    get responseFormat() {
        return {
            id: this._id,
            name: this.name,
            owner: this.owner,
            phone: this.phone,
            email: this.email,
            address: this.address,
            accountBank: this.accountBank,
            accountName: this.accountName,
            accountIban: this.accountIban,
            accountNumber: this.accountNumber,
            logo: generalHelpers.filePublicUrl(this.logo),
        };
    };
};
