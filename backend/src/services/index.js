import authService from "./auth.service.js";
import notificationService from "./notification.service.js";
import userService from "./user.service.js";
import userProfileService from "./userProfile.service.js";
import communityService from "./community.service.js";

const services = {
    userService,
    authService,
    userProfileService,
    notificationService,
    communityService,
};

export default services;
