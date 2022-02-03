const UserModel = require('./userModel');
const RentModel = require("./rentModel");
const LeaseModel = require("./leaseModel");
const ChamberModel = require("./chamberModel");
const PropertyModel = require("./propertyModel");

module.exports = class PaymentModel {
    constructor(payment) {
        Object.assign(this, payment);
    };

    get miniResponseFormat() {
        return {
            id: this._id,
            name: this.reference
        };
    };

    get responseFormat() {
        return {
            id: this._id,
            type: this.type,
            amount: this.amount,
            canceled: this.canceled,
            deletable: this.deletable,
            updatable: this.updatable,
            reference: this.reference,
            cancelable: this.cancelable,
            created_at: this.created_at,
            cancel_at: this.canceled_at,
            description: this.description,
            rent: this.rental ? new RentModel(this.rental).miniResponseFormat : null,
            tenant: this.taker ? new UserModel(this.taker).miniResponseFormat : null,
            chamber: this.unit ? new ChamberModel(this.unit).miniResponseFormat : null,
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            lease: this.contract ? new LeaseModel(this.contract).miniResponseFormat : null,
            property: this.building ? new PropertyModel(this.building).miniResponseFormat : null
        };
    };
};
