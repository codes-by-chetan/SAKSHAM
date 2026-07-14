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

// BachatGat Member routes
router.post(
    "/bachatgat/member/add",
    validate(validations.communityValidations.addBachatGatMember),
    controllers.communityController.addBachatGatMember
);

router.post(
    "/bachatgat/member/remove",
    validate(validations.communityValidations.removeBachatGatMember),
    controllers.communityController.removeBachatGatMember
);

router.post(
    "/bachatgat/member/update-position",
    validate(validations.communityValidations.updateBachatGatMemberPosition),
    controllers.communityController.updateBachatGatMemberPosition
);

// Gramsangh Member routes
router.post(
    "/gramsangh/member/add",
    validate(validations.communityValidations.addGramsanghMember),
    controllers.communityController.addGramsanghMember
);

router.post(
    "/gramsangh/member/remove",
    validate(validations.communityValidations.removeGramsanghMember),
    controllers.communityController.removeGramsanghMember
);

router.post(
    "/gramsangh/member/update-position",
    validate(validations.communityValidations.updateGramsanghMemberPosition),
    controllers.communityController.updateGramsanghMemberPosition
);

// Get bachatgats under a gramsangh
router.get(
    "/gramsangh/:gramsanghId/bachatgats",
    validate(validations.communityValidations.getBachatGatsUnderGramsangh),
    controllers.communityController.getBachatGatsUnderGramsangh
);

// Get members of a bachatgat
router.get(
    "/bachatgat/:bachatGatId/members",
    validate(validations.communityValidations.getBachatGatMembers),
    controllers.communityController.getBachatGatMembers
);

const communityRouter = router;
export default communityRouter;
