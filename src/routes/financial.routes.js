import express from "express";
import controllers from "../controllers/index.js";
import validations from "../validations/index.js";
import validate from "../middlewares/validate.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Savings Deposit configuration routes
router.post(
    "/savings-deposit/bachatgat/:bachatGatId",
    validate(validations.financialValidations.setSavingsDepositForBachatGat),
    controllers.financialController.setSavingsDepositForBachatGat
);

router.post(
    "/savings-deposit/gramsangh/:gramsanghId",
    validate(validations.financialValidations.setSavingsDepositForGramsangh),
    controllers.financialController.setSavingsDepositForGramsangh
);

// Loan routes
router.post(
    "/loan/create",
    validate(validations.financialValidations.createLoan),
    controllers.financialController.createLoan
);

router.post(
    "/loan/:loanId/payment",
    validate(validations.financialValidations.makeLoanPayment),
    controllers.financialController.makeLoanPayment
);

// Deposit Payment routes
router.post(
    "/deposit/payment",
    validate(validations.financialValidations.makeDepositPayment),
    controllers.financialController.makeDepositPayment
);

// Query routes
router.post(
    "/member/next-installment",
    validate(validations.financialValidations.getNextInstallmentDetails),
    controllers.financialController.getNextInstallmentDetails
);

router.post(
    "/member/financial-statement",
    validate(validations.financialValidations.getMemberFinancialStatement),
    controllers.financialController.getMemberFinancialStatement
);

router.post(
    "/member/payment-history",
    validate(validations.financialValidations.getMemberPaymentHistory),
    controllers.financialController.getMemberPaymentHistory
);

const financialRouter = router;
export default financialRouter;
