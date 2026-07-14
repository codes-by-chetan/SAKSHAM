import services from "../services/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import httpStatus from "http-status";

const setSavingsDepositForBachatGat = asyncHandler(async (req, res) => {
    const { bachatGatId } = req.params;
    const { monthlyAmount } = req.body;

    const deposit =
        await services.financialService.setSavingsDepositForBachatGat(
            bachatGatId,
            monthlyAmount,
            req.user._id
        );

    const response = new ApiResponse(
        httpStatus.CREATED,
        deposit,
        "Savings deposit configuration set successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const setSavingsDepositForGramsangh = asyncHandler(async (req, res) => {
    const { gramsanghId } = req.params;
    const { monthlyAmount } = req.body;

    const deposit =
        await services.financialService.setSavingsDepositForGramsangh(
            gramsanghId,
            monthlyAmount,
            req.user._id
        );

    const response = new ApiResponse(
        httpStatus.CREATED,
        deposit,
        "Savings deposit configuration set successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const createLoan = asyncHandler(async (req, res) => {
    const {
        memberId,
        principalAmount,
        interestRate,
        bachatGatId,
        gramsanghId,
    } = req.body;

    const loan = await services.financialService.createLoan(
        memberId,
        principalAmount,
        interestRate,
        bachatGatId,
        gramsanghId
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        loan,
        "Loan created successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const makeLoanPayment = asyncHandler(async (req, res) => {
    const { loanId } = req.params;
    const { principalToPayAmount, paymentMethod } = req.body;

    const result = await services.financialService.makeLoanPayment(
        loanId,
        principalToPayAmount,
        paymentMethod
    );

    const response = new ApiResponse(
        httpStatus.OK,
        result,
        "Loan payment processed successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const makeDepositPayment = asyncHandler(async (req, res) => {
    const {
        memberId,
        bachatGatId,
        gramsanghId,
        amountPaid,
        month,
        paymentMethod,
    } = req.body;

    const result = await services.financialService.makeDepositPayment(
        memberId,
        bachatGatId,
        gramsanghId,
        amountPaid,
        month,
        paymentMethod
    );

    const response = new ApiResponse(
        httpStatus.OK,
        result,
        "Deposit payment recorded successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const getNextInstallmentDetails = asyncHandler(async (req, res) => {
    const { memberId, bachatGatId, gramsanghId, nextMonth } = req.body;

    const details = await services.financialService.getNextInstallmentDetails(
        memberId,
        bachatGatId,
        gramsanghId,
        nextMonth
    );

    const response = new ApiResponse(
        httpStatus.OK,
        details,
        "Next installment details retrieved successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const getMemberFinancialStatement = asyncHandler(async (req, res) => {
    const { memberId, bachatGatId, gramsanghId } = req.body;

    const statement =
        await services.financialService.getMemberFinancialStatement(
            memberId,
            bachatGatId,
            gramsanghId
        );

    const response = new ApiResponse(
        httpStatus.OK,
        statement,
        "Financial statement retrieved successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const getMemberPaymentHistory = asyncHandler(async (req, res) => {
    const { memberId, bachatGatId, gramsanghId, limit, offset } = req.body;

    const history = await services.financialService.getMemberPaymentHistory(
        memberId,
        bachatGatId,
        gramsanghId,
        limit,
        offset
    );

    const response = new ApiResponse(
        httpStatus.OK,
        history,
        "Payment history retrieved successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const financialController = {
    setSavingsDepositForBachatGat,
    setSavingsDepositForGramsangh,
    createLoan,
    makeLoanPayment,
    makeDepositPayment,
    getNextInstallmentDetails,
    getMemberFinancialStatement,
    getMemberPaymentHistory,
};

export default financialController;
