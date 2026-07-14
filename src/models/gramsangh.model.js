import mongoose from "mongoose";
import plugins from "./plugins/index.js";

const gramsanghSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Gramsangh name is required"],
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

gramsanghSchema.plugin(plugins.softDelete);
gramsanghSchema.plugin(plugins.paginate);

const Gramsangh = mongoose.model("Gramsangh", gramsanghSchema);
export default Gramsangh;
