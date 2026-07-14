import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const bachatGatPositionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Position name is required"],
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
        },
        displayName: {
            type: String,
            required: [true, "Display name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            required: false,
        },
        level: {
            type: Number,
            default: 0,
            index: true,
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

bachatGatPositionSchema.plugin(plugins.softDelete);
bachatGatPositionSchema.plugin(plugins.paginate);

const BachatGatPosition = mongoose.model(
    "BachatGatPosition",
    bachatGatPositionSchema
);
export default BachatGatPosition;
