import mongoose from "mongoose";

const memberFinancialSchema = new mongoose.Schema(
    {
        // The member
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // The bachatgat this financial record belongs to
        bachatGat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BachatGat",
            required: false,
            index: true,
        },
        // The gramsangh this financial record belongs to
        gramsangh: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gramsangh",
            required: false,
            index: true,
        },
        // Total savings deposited so far
        totalSavingsDeposited: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Total outstanding deposit dues
        outstandingDepositDue: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Total amount borrowed from bachatgat/gramsangh
        totalBorrowed: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Total amount repaid towards loans
        totalLoanRepaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Total interest paid on loans
        totalInterestPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Current outstanding loan balance (all active loans combined)
        currentLoanBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Last updated timestamp
        lastUpdated: {
            type: Date,
            default: Date.now,
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

// Compound unique index: member + (bachatGat or gramsangh)
memberFinancialSchema.index({ member: 1, bachatGat: 1 }, { sparse: true });
memberFinancialSchema.index({ member: 1, gramsangh: 1 }, { sparse: true });

const MemberFinancial = mongoose.model(
    "MemberFinancial",
    memberFinancialSchema
);

export default MemberFinancial;
