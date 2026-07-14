import models from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Sets up or updates the monthly savings deposit amount for a bachatgat
 *
 * @param {string} bachatGatId - The ID of the bachatgat
 * @param {number} monthlyAmount - The monthly deposit amount in smallest currency unit
 * @param {string} userId - The ID of the user creating this configuration
 * @returns {Promise<Object>} - The savings deposit configuration
 */
const setSavingsDepositForBachatGat = async (
    bachatGatId,
    monthlyAmount,
    userId
) => {
    const bachatGat = await models.BachatGat.findById(bachatGatId);
    if (!bachatGat) {
        throw new ApiError(httpStatus.NOT_FOUND, "Bachatgat not found");
    }

    // Check if deposit configuration already exists
    let deposit = await models.SavingsDeposit.findOne({
        bachatGat: bachatGatId,
        deleted: { $ne: true },
    });

    if (deposit) {
        // Update existing
        deposit.monthlyAmount = monthlyAmount;
        deposit.status = "active";
        await deposit.save();
    } else {
        // Create new
        deposit = await models.SavingsDeposit.create({
            bachatGat: bachatGatId,
            monthlyAmount,
            createdBy: userId,
        });
    }

    return deposit;
};

/**
 * Sets up or updates the monthly savings deposit amount for a gramsangh
 *
 * @param {string} gramsanghId - The ID of the gramsangh
 * @param {number} monthlyAmount - The monthly deposit amount
 * @param {string} userId - The ID of the user creating this configuration
 * @returns {Promise<Object>} - The savings deposit configuration
 */
const setSavingsDepositForGramsangh = async (
    gramsanghId,
    monthlyAmount,
    userId
) => {
    const gramsangh = await models.Gramsangh.findById(gramsanghId);
    if (!gramsangh) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gramsangh not found");
    }

    let deposit = await models.SavingsDeposit.findOne({
        gramsangh: gramsanghId,
        deleted: { $ne: true },
    });

    if (deposit) {
        deposit.monthlyAmount = monthlyAmount;
        deposit.status = "active";
        await deposit.save();
    } else {
        deposit = await models.SavingsDeposit.create({
            gramsangh: gramsanghId,
            monthlyAmount,
            createdBy: userId,
        });
    }

    return deposit;
};

/**
 * Creates a new loan for a member
 *
 * @param {string} memberId - The ID of the member borrowing
 * @param {number} principalAmount - The loan amount
 * @param {number} interestRate - Annual interest rate (e.g., 1 for 1%)
 * @param {string} bachatGatId - The bachatgat ID (if applicable)
 * @param {string} gramsanghId - The gramsangh ID (if applicable)
 * @returns {Promise<Object>} - The created loan
 */
const createLoan = async (
    memberId,
    principalAmount,
    interestRate,
    bachatGatId,
    gramsanghId
) => {
    // Validate member exists
    const member = await models.User.findById(memberId);
    if (!member) {
        throw new ApiError(httpStatus.NOT_FOUND, "Member not found");
    }

    // Either bachatGatId or gramsanghId must be provided
    if (!bachatGatId && !gramsanghId) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Either bachatGatId or gramsanghId must be provided"
        );
    }

    if (bachatGatId) {
        const bachatGat = await models.BachatGat.findById(bachatGatId);
        if (!bachatGat) {
            throw new ApiError(httpStatus.NOT_FOUND, "Bachatgat not found");
        }
    }

    if (gramsanghId) {
        const gramsangh = await models.Gramsangh.findById(gramsanghId);
        if (!gramsangh) {
            throw new ApiError(httpStatus.NOT_FOUND, "Gramsangh not found");
        }
    }

    const loan = await models.Loan.create({
        member: memberId,
        bachatGat: bachatGatId || null,
        gramsangh: gramsanghId || null,
        principalAmount,
        interestRate,
        remainingBalance: principalAmount,
    });

    // Update member financial record
    await updateMemberFinancialOnLoan(
        memberId,
        bachatGatId,
        gramsanghId,
        principalAmount,
        0
    );

    return loan;
};

/**
 * Processes a loan payment with reducing interest calculation
 *
 * @param {string} loanId - The ID of the loan
 * @param {number} principalToPayAmount - The principal amount to pay
 * @param {string} paymentMethod - Payment method (cash, transfer, etc.)
 * @returns {Promise<Object>} - The loan payment record with calculated interest
 */
const makeLoanPayment = async (
    loanId,
    principalToPayAmount,
    paymentMethod = "cash"
) => {
    const loan = await models.Loan.findById(loanId);
    if (!loan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Loan not found");
    }

    if (loan.status !== "active") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Loan is not active");
    }

    if (principalToPayAmount > loan.remainingBalance) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Cannot pay more than remaining balance. Remaining: ${loan.remainingBalance}`
        );
    }

    // Calculate interest on remaining balance using reducing method
    // Interest for this installment = (remainingBalance * annualRate / 100 / 12) for monthly
    // But we'll use the interest rate directly as monthly interest
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const interestForThisPayment =
        Math.round(loan.remainingBalance * monthlyInterestRate * 100) / 100;

    // Calculate new remaining balance
    const newRemainingBalance = loan.remainingBalance - principalToPayAmount;

    // Update loan record
    loan.totalAmountPaid += principalToPayAmount;
    loan.totalInterestPaid += interestForThisPayment;
    loan.remainingBalance = newRemainingBalance;

    // Mark as repaid if fully paid
    if (newRemainingBalance === 0) {
        loan.status = "repaid";
    }

    await loan.save();

    // Create payment record
    const payment = await models.LoanPayment.create({
        loan: loanId,
        member: loan.member,
        principalPaid: principalToPayAmount,
        interestPaid: interestForThisPayment,
        remainingBalanceAfterPayment: newRemainingBalance,
        paymentMethod,
    });

    // Update member financial record
    await updateMemberFinancialOnLoanPayment(
        loan.member,
        loan.bachatGat,
        loan.gramsangh,
        principalToPayAmount,
        interestForThisPayment
    );

    return {
        payment: await payment.populate("loan"),
        remainingBalance: newRemainingBalance,
        interestCalculated: interestForThisPayment,
    };
};

/**
 * Processes a monthly savings deposit payment
 *
 * @param {string} memberId - The ID of the member
 * @param {string} bachatGatId - The bachatgat ID (if applicable)
 * @param {string} gramsanghId - The gramsangh ID (if applicable)
 * @param {number} amountPaid - The amount the member is paying
 * @param {string} month - The month for this deposit (format: YYYY-MM)
 * @param {string} paymentMethod - Payment method
 * @returns {Promise<Object>} - Deposit payment record with calculated totals
 */
const makeDepositPayment = async (
    memberId,
    bachatGatId,
    gramsanghId,
    amountPaid,
    month,
    paymentMethod = "cash"
) => {
    // Get savings deposit configuration
    let savingsDeposit;
    if (bachatGatId) {
        savingsDeposit = await models.SavingsDeposit.findOne({
            bachatGat: bachatGatId,
            deleted: { $ne: true },
        });
    } else {
        savingsDeposit = await models.SavingsDeposit.findOne({
            gramsangh: gramsanghId,
            deleted: { $ne: true },
        });
    }

    if (!savingsDeposit) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Savings deposit configuration not found"
        );
    }

    // Check if payment already exists for this month
    let depositPayment = await models.DepositPayment.findOne({
        member: memberId,
        bachatGat: bachatGatId || null,
        gramsangh: gramsanghId || null,
        month,
        deleted: { $ne: true },
    });

    // Calculate previous unpaid dues
    let previousDue = 0;
    if (!depositPayment) {
        // Get last unpaid month's outstanding balance
        const lastPayment = await models.DepositPayment.findOne({
            member: memberId,
            bachatGat: bachatGatId || null,
            gramsangh: gramsanghId || null,
            deleted: { $ne: true },
        }).sort({ month: -1 });

        if (lastPayment && lastPayment.outstandingBalance > 0) {
            previousDue = lastPayment.outstandingBalance;
        }
    }

    const totalDue = savingsDeposit.monthlyAmount + previousDue;
    const outstandingBalance = Math.max(0, totalDue - amountPaid);
    const paymentStatus =
        amountPaid >= totalDue
            ? "full"
            : amountPaid > 0
              ? "partial"
              : "pending";

    if (!depositPayment) {
        depositPayment = await models.DepositPayment.create({
            member: memberId,
            bachatGat: bachatGatId || null,
            gramsangh: gramsanghId || null,
            month,
            depositAmount: savingsDeposit.monthlyAmount,
            previousDue,
            totalDue,
            amountPaid,
            outstandingBalance,
            paymentStatus,
            paymentMethod,
        });
    } else {
        // Update existing payment
        depositPayment.amountPaid += amountPaid;
        depositPayment.outstandingBalance = Math.max(
            0,
            totalDue - depositPayment.amountPaid
        );
        depositPayment.paymentStatus =
            depositPayment.amountPaid >= totalDue
                ? "full"
                : depositPayment.amountPaid > 0
                  ? "partial"
                  : "pending";
        await depositPayment.save();
    }

    // Update member financial record
    await updateMemberFinancialOnDepositPayment(
        memberId,
        bachatGatId,
        gramsanghId,
        amountPaid,
        outstandingBalance
    );

    return {
        depositPayment,
        totalDue,
        amountPaid,
        outstandingBalance,
        paymentStatus,
    };
};

/**
 * Calculates next month's installment details (deposit due, loan interest, unpaid dues)
 *
 * @param {string} memberId - The ID of the member
 * @param {string} bachatGatId - The bachatgat ID (if applicable)
 * @param {string} gramsanghId - The gramsangh ID (if applicable)
 * @param {string} nextMonth - The month to calculate for (format: YYYY-MM)
 * @returns {Promise<Object>} - Detailed breakdown of next installment
 */
const getNextInstallmentDetails = async (
    memberId,
    bachatGatId,
    gramsanghId,
    nextMonth
) => {
    // Get savings deposit configuration
    let savingsDeposit;
    if (bachatGatId) {
        savingsDeposit = await models.SavingsDeposit.findOne({
            bachatGat: bachatGatId,
            deleted: { $ne: true },
        });
    } else {
        savingsDeposit = await models.SavingsDeposit.findOne({
            gramsangh: gramsanghId,
            deleted: { $ne: true },
        });
    }

    if (!savingsDeposit) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Savings deposit configuration not found"
        );
    }

    // Get current month's outstanding balance
    const currentMonth = new Date().toISOString().split("T")[0].slice(0, 7);
    const lastPayment = await models.DepositPayment.findOne({
        member: memberId,
        bachatGat: bachatGatId || null,
        gramsangh: gramsanghId || null,
        deleted: { $ne: true },
    })
        .sort({ month: -1 })
        .limit(1);

    const previousDue = lastPayment?.outstandingBalance || 0;

    // Get all active loans and calculate total interest due
    let totalLoanInterestDue = 0;
    const activeLoans = await models.Loan.find({
        member: memberId,
        bachatGat: bachatGatId || null,
        gramsangh: gramsanghId || null,
        status: "active",
        deleted: { $ne: true },
    });

    activeLoans.forEach((loan) => {
        const monthlyInterestRate = loan.interestRate / 100 / 12;
        const interestDue =
            Math.round(loan.remainingBalance * monthlyInterestRate * 100) / 100;
        totalLoanInterestDue += interestDue;
    });

    return {
        month: nextMonth,
        depositDue: savingsDeposit.monthlyAmount,
        previousMonthDue: previousDue,
        totalLoanInterestDue,
        totalAmountDue:
            savingsDeposit.monthlyAmount + previousDue + totalLoanInterestDue,
        breakdown: {
            monthlyDeposit: savingsDeposit.monthlyAmount,
            unpaidDues: previousDue,
            estimatedLoanInterest: totalLoanInterestDue,
        },
        activeLoans: activeLoans.map((loan) => ({
            loanId: loan._id,
            borrowed: loan.principalAmount,
            remainingBalance: loan.remainingBalance,
            interestRate: loan.interestRate,
        })),
    };
};

/**
 * Gets member's complete financial statement
 *
 * @param {string} memberId - The ID of the member
 * @param {string} bachatGatId - The bachatgat ID (if applicable)
 * @param {string} gramsanghId - The gramsangh ID (if applicable)
 * @returns {Promise<Object>} - Complete financial summary
 */
const getMemberFinancialStatement = async (
    memberId,
    bachatGatId,
    gramsanghId
) => {
    let memberFinancial;
    if (bachatGatId) {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            bachatGat: bachatGatId,
        });
    } else {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            gramsangh: gramsanghId,
        });
    }

    const member = await models.User.findById(memberId).select(
        "firstName lastName email"
    );

    return {
        member,
        ...memberFinancial?.toObject(),
    };
};

/**
 * Gets payment history for a member
 *
 * @param {string} memberId - The ID of the member
 * @param {string} bachatGatId - The bachatgat ID (if applicable)
 * @param {string} gramsanghId - The gramsangh ID (if applicable)
 * @param {number} limit - Number of records to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} - Payment history
 */
const getMemberPaymentHistory = async (
    memberId,
    bachatGatId,
    gramsanghId,
    limit = 10,
    offset = 0
) => {
    // Get deposit payments
    const depositPayments = await models.DepositPayment.find({
        member: memberId,
        bachatGat: bachatGatId || null,
        gramsangh: gramsanghId || null,
        deleted: { $ne: true },
    })
        .sort({ month: -1 })
        .limit(limit)
        .skip(offset);

    // Get loan payments
    const loans = await models.Loan.find({
        member: memberId,
        bachatGat: bachatGatId || null,
        gramsangh: gramsanghId || null,
        deleted: { $ne: true },
    });

    const loanIds = loans.map((l) => l._id);
    const loanPayments = await models.LoanPayment.find({
        loan: { $in: loanIds },
        deleted: { $ne: true },
    })
        .sort({ paymentDate: -1 })
        .limit(limit)
        .skip(offset)
        .populate("loan");

    return {
        deposits: depositPayments,
        loans: loanPayments,
    };
};

/**
 * Internal: Updates member financial record when loan is created
 */
const updateMemberFinancialOnLoan = async (
    memberId,
    bachatGatId,
    gramsanghId,
    amount
) => {
    let memberFinancial;
    if (bachatGatId) {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            bachatGat: bachatGatId,
        });
    } else {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            gramsangh: gramsanghId,
        });
    }

    if (!memberFinancial) {
        memberFinancial = await models.MemberFinancial.create({
            member: memberId,
            bachatGat: bachatGatId || null,
            gramsangh: gramsanghId || null,
            totalBorrowed: amount,
            currentLoanBalance: amount,
        });
    } else {
        memberFinancial.totalBorrowed += amount;
        memberFinancial.currentLoanBalance += amount;
        await memberFinancial.save();
    }
};

/**
 * Internal: Updates member financial record when loan payment is made
 */
const updateMemberFinancialOnLoanPayment = async (
    memberId,
    bachatGatId,
    gramsanghId,
    principalPaid,
    interestPaid
) => {
    let memberFinancial;
    if (bachatGatId) {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            bachatGat: bachatGatId,
        });
    } else {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            gramsangh: gramsanghId,
        });
    }

    if (memberFinancial) {
        memberFinancial.totalLoanRepaid += principalPaid;
        memberFinancial.totalInterestPaid += interestPaid;
        memberFinancial.currentLoanBalance = Math.max(
            0,
            memberFinancial.currentLoanBalance - principalPaid
        );
        await memberFinancial.save();
    }
};

/**
 * Internal: Updates member financial record when deposit payment is made
 */
const updateMemberFinancialOnDepositPayment = async (
    memberId,
    bachatGatId,
    gramsanghId,
    amountPaid,
    outstandingBalance
) => {
    let memberFinancial;
    if (bachatGatId) {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            bachatGat: bachatGatId,
        });
    } else {
        memberFinancial = await models.MemberFinancial.findOne({
            member: memberId,
            gramsangh: gramsanghId,
        });
    }

    if (memberFinancial) {
        memberFinancial.totalSavingsDeposited += amountPaid;
        memberFinancial.outstandingDepositDue = outstandingBalance;
        await memberFinancial.save();
    }
};

const financialService = {
    setSavingsDepositForBachatGat,
    setSavingsDepositForGramsangh,
    createLoan,
    makeLoanPayment,
    makeDepositPayment,
    getNextInstallmentDetails,
    getMemberFinancialStatement,
    getMemberPaymentHistory,
};

export default financialService;
