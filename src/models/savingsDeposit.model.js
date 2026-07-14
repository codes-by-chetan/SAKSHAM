import mongoose from "mongoose";

const savingsDepositSchema = new mongoose.Schema(
    {
        // The group this savings deposit belongs to
        bachatGat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BachatGat",
            required: false,
            index: true,
        },
        gramsangh: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gramsangh",
            required: false,
            index: true,
        },
        monthlyAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency:{
            type: String,
            required: true,
            default: "INR",
        },
        // Effective date from which this deposit amount is applicable
        effectiveFromDate: {
            type: Date,
            default: Date.now,
        },
        // Status: active or inactive
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        // User who created this configuration
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Soft delete
        deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure either bachatGat or gramsangh is set, but not both
savingsDepositSchema.pre("save", function (next) {
    if (
        (!this.bachatGat && !this.gramsangh) ||
        (this.bachatGat && this.gramsangh)
    ) {
        throw new Error(
            "Either bachatGat or gramsangh must be set, but not both"
        );
    }
    next();
});

const SavingsDeposit = mongoose.model("SavingsDeposit", savingsDepositSchema);

export default SavingsDeposit;
