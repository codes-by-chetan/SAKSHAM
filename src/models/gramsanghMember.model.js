import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const gramsanghMemberSchema = new mongoose.Schema(
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
        gramsangh: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gramsangh",
            required: [true, "Gramsangh is required"],
            index: true,
        },
        position: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GramsanghPosition",
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

gramsanghMemberSchema.pre("validate", function (next) {
    if (!this.user && !this.invitedContactNumber?.number) {
        this.invalidate("user", "User or invited contact number is required");
    }
    next();
});

gramsanghMemberSchema.plugin(plugins.softDelete);
gramsanghMemberSchema.plugin(plugins.paginate);

// Ensure one user can have only one position per gramsangh
gramsanghMemberSchema.index(
    { user: 1, gramsangh: 1 },
    { unique: true, sparse: true }
);
gramsanghMemberSchema.index(
    {
        "invitedContactNumber.countryCode": 1,
        "invitedContactNumber.number": 1,
        gramsangh: 1,
    },
    { unique: true, sparse: true }
);

const GramsanghMember = mongoose.model(
    "GramsanghMember",
    gramsanghMemberSchema
);
export default GramsanghMember;
