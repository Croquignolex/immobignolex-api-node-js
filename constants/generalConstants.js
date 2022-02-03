// Permissions
module.exports.PERMISSIONS = {
    BASIC: "basic"
};

// Mongo db loop directive
module.exports.LOOP_DIRECTIVE = {
    CREATOR: {
        $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "username",
            as: "creator"
        },
    },
    TAKER: {
        $lookup: {
            from: "users",
            localField: "tenant",
            foreignField: "username",
            as: "taker"
        },
    },
    BUILDING: {
        $lookup: {
            from: "properties",
            localField: "property",
            foreignField: "_id",
            as: "building"
        }
    },
    UNIT: {
        $lookup: {
            from: "chambers",
            localField: "chamber",
            foreignField: "_id",
            as: "unit"
        }
    },
    CONTRACT: {
        $lookup: {
            from: "leases",
            localField: "lease",
            foreignField: "_id",
            as: "contract"
        }
    },
    RENTAL: {
        $lookup: {
            from: "rents",
            localField: "rent",
            foreignField: "_id",
            as: "rental"
        }
    }
};

// Types
module.exports.TYPES = {
    PAYMENTS: {
        RENT: "rent",
        SURETY: "surety",
        DEPOSIT: "deposit",
    },
    PERIODS: [
        {rank: 1, value: "day"},
        {rank: 2, value: "week"},
        {rank: 3, value: "month"},
        {rank: 4,  value: "year"},
    ],
    CHAMBERS: ["Villa", "Studio", "Duplex", "Chambre", "Appartement"],
    GOOD_COLORS: ["dark", "info", "success", "danger", "warning", "secondary", "primary"],
};
