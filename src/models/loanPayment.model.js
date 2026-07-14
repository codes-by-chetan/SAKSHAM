import mongoose from "mongoose";

const loanPaymentSchema = new mongoose.Schema(
    {
        // The loan this payment is for
        loan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Loan",
            required: true,
            index: true,
        },
        // The member making the payment
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Principal amount paid in this installment
        principalPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        // Interest amount paid in this installment
        // Interest is calculated as: (remainingBalance * annualRate / 100 / 12) for monthly
        // But for reducing method: interest on outstanding balance at time of payment
        interestPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        // Remaining balance after this payment
        remainingBalanceAfterPayment: {
            type: Number,
            required: true,
            min: 0,
        },
        // Payment date
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        // Payment method (cash, transfer, etc.)
        paymentMethod: {
            type: String,
            enum: ["cash", "transfer", "check", "other"],
            default: "cash",
        },
        // Notes/remarks
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

// Index for querying payments for a member
loanPaymentSchema.index({ member: 1, paymentDate: -1 });

const LoanPayment = mongoose.model("LoanPayment", loanPaymentSchema);

export default LoanPayment;
