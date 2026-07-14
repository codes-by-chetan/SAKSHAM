import mongoose from "mongoose";

const depositPaymentSchema = new mongoose.Schema(
    {
        // The member paying the deposit
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // The bachatgat this deposit belongs to
        bachatGat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BachatGat",
            required: false,
            index: true,
        },
        // The gramsangh this deposit belongs to
        gramsangh: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gramsangh",
            required: false,
            index: true,
        },
        // The month and year for this deposit (e.g., "2026-07" for July 2026)
        month: {
            type: String,
            required: true,
            // Format: YYYY-MM
        },
        // Regular monthly deposit amount
        depositAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        // Any previous unpaid dues from earlier months
        previousDue: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Total to be paid = depositAmount + previousDue
        totalDue: {
            type: Number,
            required: true,
            min: 0,
        },
        // Amount actually paid in this payment
        amountPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        // Outstanding balance after this payment (if partial payment)
        outstandingBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Payment date
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        // Payment status: full, partial, pending
        paymentStatus: {
            type: String,
            enum: ["full", "partial", "pending"],
            default: "pending",
        },
        // Payment method
        paymentMethod: {
            type: String,
            enum: ["cash", "transfer", "check", "other"],
            default: "cash",
        },
        // Notes
        notes: {
            type: String,
            optional: true,
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

// Index for querying deposits for a member
depositPaymentSchema.index({ member: 1, month: -1 });
depositPaymentSchema.index({ bachatGat: 1, month: 1 });
depositPaymentSchema.index({ gramsangh: 1, month: 1 });

const DepositPayment = mongoose.model("DepositPayment", depositPaymentSchema);

export default DepositPayment;
