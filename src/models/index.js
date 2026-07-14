import DbLogs from "./dbLogs.model.js";
import Notification from "./notification.model.js";
import RequestLog from "./requestLogs.model.js";
import User from "./user.model.js";
import userKeyModel from "./userKey.model.js";
import UserProfile from "./userProfile.model.js";
import BachatGat from "./bachatGat.model.js";
import BachatGatMember from "./bachatGatMember.model.js";
import BachatGatPosition from "./bachatGatPosition.model.js";
import Gramsangh from "./gramsangh.model.js";
import GramsanghMember from "./gramsanghMember.model.js";
import GramsanghPosition from "./gramsanghPosition.model.js";
import SavingsDeposit from "./savingsDeposit.model.js";
import Loan from "./loan.model.js";
import LoanPayment from "./loanPayment.model.js";
import DepositPayment from "./depositPayment.model.js";
import MemberFinancial from "./memberFinancial.model.js";

const models = {
    User,
    RequestLog,
    DbLogs,
    UserProfile,
    Notification,
    userKeyModel,
    BachatGat,
    BachatGatMember,
    BachatGatPosition,
    Gramsangh,
    GramsanghMember,
    GramsanghPosition,
    SavingsDeposit,
    Loan,
    LoanPayment,
    DepositPayment,
    MemberFinancial,
};

export default models;
