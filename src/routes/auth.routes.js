import express from "express";
import controllers from "../controllers/index.js";
import validations from "../validations/index.js";
import validate from "../middlewares/validate.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
    "/register",
    validate(validations.authValidations.register),
    controllers.authController.register
);

router.post(
    "/login",
    validate(validations.authValidations.login),
    controllers.authController.login
);

router.post("/refresh", controllers.authController.refresh);


// Verify social token endpoint
router.post(
    "/verify-social-token",
    controllers.authController.verifySocialToken
);

router.use(authMiddleware);
router.get("/validate", controllers.authController.verifyUser);
// Change password endpoint
router.post(
    "/change-password",
    controllers.authController.changePassword
);
router.post(
    "/set-mpin",
    validate(validations.authValidations.setMpin),
    controllers.authController.setMpin
);
router.post(
    "/update-mpin",
    validate(validations.authValidations.updateMpin),
    controllers.authController.updateMpin
);
router.get("/refresh-user", controllers.authController.getUserDetails);
router.post("/logout", controllers.authController.logout);

const authRouter = router;
export default authRouter;
