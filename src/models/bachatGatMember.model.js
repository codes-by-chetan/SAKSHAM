import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const bachatGatMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
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

bachatGatMemberSchema.plugin(plugins.softDelete);
bachatGatMemberSchema.plugin(plugins.paginate);

// Ensure one user can have only one position per bachatgat
bachatGatMemberSchema.index(
    { user: 1, bachatGat: 1 },
    { unique: true, sparse: true }
);

const BachatGatMember = mongoose.model(
    "BachatGatMember",
    bachatGatMemberSchema
);
export default BachatGatMember;
