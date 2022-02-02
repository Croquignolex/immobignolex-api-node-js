const UserModel = require("./userModel");
const ChamberModel = require("./chamberModel");
const PropertyModel = require("./propertyModel");

module.exports = class LeaseModel {
    constructor(lease) {
        Object.assign(this, lease);
    };

    get miniResponseFormat() {
        return {
            id: this._id,
            reference: this.reference
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            rent: this.rent,
            enable: this.enable,
            end_at: this.end_at,
            surety: this.surety,
            deposit: this.deposit,
            history: this.history,
            canceled: this.canceled,
            start_at: this.start_at,
            reference: this.reference,
            updatable: this.updatable,
            deletable: this.deletable,
            rentPeriod: this.rentPeriod,
            commercial: this.commercial,
            cancelable: this.cancelable,
            created_at: this.created_at,
            description: this.description,
            leasePeriod: this.leasePeriod,
            tenant: this.taker ? new UserModel(this.taker).miniResponseFormat : null,
            chamber: this.unit ? new ChamberModel(this.unit).miniResponseFormat : null,
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            property: this.building ? new PropertyModel(this.building).miniResponseFormat : null
        };
    };
};
