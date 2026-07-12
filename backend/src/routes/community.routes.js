import express from "express";
import controllers from "../controllers/index.js";
import validations from "../validations/index.js";
import validate from "../middlewares/validate.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/gramsangh",
    validate(validations.communityValidations.registerGramsangh),
    controllers.communityController.registerGramsangh
);

router.post(
    "/bachatgat",
    validate(validations.communityValidations.registerBachatGat),
    controllers.communityController.registerBachatGat
);

const communityRouter = router;
export default communityRouter;
