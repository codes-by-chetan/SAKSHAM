import DbLogs from "./dbLogs.model.js";
import Notification from "./notification.model.js";
import RequestLog from "./requestLogs.model.js";
import User from "./user.model.js";
import userKeyModel from "./userKey.model.js";
import UserProfile from "./userProfile.model.js";
import BachatGat from "./bachatGat.model.js";
import Gramsangh from "./gramsangh.model.js";

const models = {
    User,
    RequestLog,
    DbLogs,
    UserProfile,
    Notification,
    userKeyModel,
    BachatGat,
    Gramsangh,
};

export default models;
