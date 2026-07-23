import express from "express";
import controllers from "../controllers/index.js";
import validations from "../validations/index.js";
import validate from "../middlewares/validate.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/bachatgat",
    validate(validations.communityValidations.registerBachatGat),
    controllers.communityController.createWorkspaceBachatGat
);

router.post(
    "/gramsangh",
    validate(validations.communityValidations.registerGramsangh),
    controllers.communityController.createWorkspaceGramsangh
);

router.get(
    "/:type/:groupId/positions",
    validate(validations.communityValidations.groupParams),
    controllers.communityController.getWorkspacePositions
);

router.post(
    "/:type/:groupId/self-membership",
    validate(validations.communityValidations.selfMembership),
    controllers.communityController.addSelfToWorkspace
);

router.post(
    "/:type/:groupId/invitations",
    validate(validations.communityValidations.inviteMember),
    controllers.communityController.inviteWorkspaceMember
);

export default router;
