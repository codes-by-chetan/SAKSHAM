import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const bachatGatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Bachatgat name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            required: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
            index: true,
        },
        gramsangh: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gramsangh",
            required: false,
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

bachatGatSchema.plugin(plugins.softDelete);
bachatGatSchema.plugin(plugins.paginate);

const BachatGat = mongoose.model("BachatGat", bachatGatSchema);
export default BachatGat;
