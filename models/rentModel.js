const UserModel = require('./userModel');
const LeaseModel = require("./leaseModel");
const ChamberModel = require("./chamberModel");
const PropertyModel = require("./propertyModel");

module.exports = class RentModel {
    constructor(rent) {
        Object.assign(this, rent);
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
            payed: this.payed,
            end_at: this.end_at,
            amount: this.amount,
            remain: this.remain,
            advance: this.advance,
            canceled: this.canceled,
            start_at: this.start_at,
            payed_at: this.payed_at,
            reference: this.reference,
            updatable: this.updatable,
            deletable: this.deletable,
            cancel_at: this.canceled_at,
            cancelable: this.cancelable,
            created_at: this.created_at,
            description: this.description,
            tenant: this.taker ? new UserModel(this.taker).miniResponseFormat : null,
            chamber: this.unit ? new ChamberModel(this.unit).miniResponseFormat : null,
            creator: this.creator ? new UserModel(this.creator).miniResponseFormat : null,
            lease: this.contract ? new LeaseModel(this.contract).miniResponseFormat : null,
            property: this.building ? new PropertyModel(this.building).miniResponseFormat : null
        };
    };
};
