import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const gramsanghMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
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
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

gramsanghMemberSchema.plugin(plugins.softDelete);
gramsanghMemberSchema.plugin(plugins.paginate);

// Ensure one user can have only one position per gramsangh
gramsanghMemberSchema.index(
    { user: 1, gramsangh: 1 },
    { unique: true, sparse: true }
);

const GramsanghMember = mongoose.model(
    "GramsanghMember",
    gramsanghMemberSchema
);
export default GramsanghMember;
