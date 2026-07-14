import Joi from "joi";

const setSavingsDepositForBachatGat = {
    params: Joi.object().keys({
        bachatGatId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        monthlyAmount: Joi.number().positive().required(),
    }),
};

const setSavingsDepositForGramsangh = {
    params: Joi.object().keys({
        gramsanghId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        monthlyAmount: Joi.number().positive().required(),
    }),
};

const createLoan = {
    body: Joi.object().keys({
        memberId: Joi.string().required(),
        principalAmount: Joi.number().positive().required(),
        interestRate: Joi.number().positive().required(), // percentage, e.g., 1 for 1%
        bachatGatId: Joi.string().optional(),
        gramsanghId: Joi.string().optional(),
    }),
};

const makeLoanPayment = {
    params: Joi.object().keys({
        loanId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        principalToPayAmount: Joi.number().positive().required(),
        paymentMethod: Joi.string()
            .valid("cash", "transfer", "check", "other")
            .optional(),
    }),
};

const makeDepositPayment = {
    body: Joi.object().keys({
        memberId: Joi.string().required(),
        bachatGatId: Joi.string().optional(),
        gramsanghId: Joi.string().optional(),
        amountPaid: Joi.number().min(0).required(),
        month: Joi.string()
            .pattern(/^\d{4}-\d{2}$/)
            .required(), // YYYY-MM format
        paymentMethod: Joi.string()
            .valid("cash", "transfer", "check", "other")
            .optional(),
    }),
};

const getNextInstallmentDetails = {
    body: Joi.object().keys({
        memberId: Joi.string().required(),
        bachatGatId: Joi.string().optional(),
        gramsanghId: Joi.string().optional(),
        nextMonth: Joi.string()
            .pattern(/^\d{4}-\d{2}$/)
            .required(), // YYYY-MM format
    }),
};

const getMemberFinancialStatement = {
    body: Joi.object().keys({
        memberId: Joi.string().required(),
        bachatGatId: Joi.string().optional(),
        gramsanghId: Joi.string().optional(),
    }),
};

const getMemberPaymentHistory = {
    body: Joi.object().keys({
        memberId: Joi.string().required(),
        bachatGatId: Joi.string().optional(),
        gramsanghId: Joi.string().optional(),
        limit: Joi.number().optional().default(10),
        offset: Joi.number().optional().default(0),
    }),
};

const financialValidations = {
    setSavingsDepositForBachatGat,
    setSavingsDepositForGramsangh,
    createLoan,
    makeLoanPayment,
    makeDepositPayment,
    getNextInstallmentDetails,
    getMemberFinancialStatement,
    getMemberPaymentHistory,
};

export default financialValidations;
