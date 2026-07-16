import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const bachatGatMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },
        invitedContactNumber: {
            countryCode: {
                type: String,
                required: false,
                trim: true,
            },
            number: {
                type: String,
                required: false,
                trim: true,
            },
        },
        invitedFullName: {
            type: String,
            required: false,
            trim: true,
        },
        bachatGat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BachatGat",
            required: [true, "Bachatgat is required"],
            index: true,
        },
        position: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BachatGatPosition",
            required: [true, "Position is required"],
            index: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["pending", "active", "inactive"],
            default: "pending",
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

bachatGatMemberSchema.pre("validate", function (next) {
    if (!this.user && !this.invitedContactNumber?.number) {
        this.invalidate("user", "User or invited contact number is required");
    }
    next();
});

bachatGatMemberSchema.plugin(plugins.softDelete);
bachatGatMemberSchema.plugin(plugins.paginate);

// Ensure one user can have only one position per bachatgat
bachatGatMemberSchema.index(
    { user: 1, bachatGat: 1 },
    { unique: true, sparse: true }
);
bachatGatMemberSchema.index(
    {
        "invitedContactNumber.countryCode": 1,
        "invitedContactNumber.number": 1,
        bachatGat: 1,
    },
    { unique: true, sparse: true }
);

const BachatGatMember = mongoose.model(
    "BachatGatMember",
    bachatGatMemberSchema
);
export default BachatGatMember;
