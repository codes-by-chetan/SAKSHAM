import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
    {
        // The member who took the loan
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // The bachatgat this loan belongs to
        bachatGat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BachatGat",
            required: false,
            index: true,
        },
        // The gramsangh this loan belongs to
        gramsangh: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gramsangh",
            required: false,
            index: true,
        },
        // Principal amount borrowed
        principalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        // Annual interest rate (percentage, e.g., 1 for 1%)
        interestRate: {
            type: Number,
            required: true,
            min: 0,
        },
        // Total amount already paid towards this loan
        totalAmountPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Remaining balance (principal - paid principal)
        remainingBalance: {
            type: Number,
            required: true,
            min: 0,
        },
        // Total interest paid
        totalInterestPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Date loan was taken
        loanDate: {
            type: Date,
            default: Date.now,
        },
        // Status: active, repaid, or closed
        status: {
            type: String,
            enum: ["active", "repaid", "closed"],
            default: "active",
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

// Ensure either bachatGat or gramsangh is set
loanSchema.pre("save", function () {
    if (
        (!this.bachatGat && !this.gramsangh) ||
        (this.bachatGat && this.gramsangh)
    ) {
        throw new Error(
            "Either bachatGat or gramsangh must be set, but not both"
        );
    }
});

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
