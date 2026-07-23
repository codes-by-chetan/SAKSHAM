import services from "../services/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import httpStatus from "http-status";

const toMembership = (group, type) => ({
    id: group._id.toString(),
    name: group.name,
    type,
    status: "active",
});

const createWorkspaceGramsangh = asyncHandler(async (req, res) => {
    const gramsangh = await services.communityService.createGramsangh(
        req.body,
        req.user._id
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        toMembership(gramsangh, "gramsangh"),
        "Gramsangh created successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const createWorkspaceBachatGat = asyncHandler(async (req, res) => {
    const bachatGat = await services.communityService.createBachatGat(
        req.body,
        req.user._id
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        toMembership(bachatGat, "bachatgat"),
        "Bachatgat created successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const getWorkspacePositions = asyncHandler(async (req, res) => {
    const positions = await services.communityService.listPositions(
        req.params.type
    );
    res.status(httpStatus.OK).json(
        new ApiResponse(
            httpStatus.OK,
            positions,
            "Positions retrieved successfully"
        )
    );
});

const addSelfToWorkspace = asyncHandler(async (req, res) => {
    const member = await services.communityService.addSelfAsMember(
        req.params.type,
        req.params.groupId,
        req.user._id,
        req.body.positionId
    );
    res.status(httpStatus.CREATED).json(
        new ApiResponse(
            httpStatus.CREATED,
            member,
            "Membership created successfully"
        )
    );
});

const inviteWorkspaceMember = asyncHandler(async (req, res) => {
    const member = await services.communityService.inviteMember(
        req.params.type,
        req.params.groupId,
        req.user._id,
        req.body
    );
    res.status(httpStatus.CREATED).json(
        new ApiResponse(
            httpStatus.CREATED,
            member,
            "Invitation created successfully"
        )
    );
});

const registerGramsangh = asyncHandler(async (req, res) => {
    const gramsangh = await services.communityService.createGramsangh(
        req.body,
        req.user._id
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        gramsangh,
        "Gramsangh registered successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const registerBachatGat = asyncHandler(async (req, res) => {
    const bachatGat = await services.communityService.createBachatGat(
        req.body,
        req.user._id
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        bachatGat,
        "Bachatgat registered successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const addBachatGatMember = asyncHandler(async (req, res) => {
    const { bachatGatId, userId, positionId } = req.body;
    const member = await services.communityService.addBachatGatMember(
        bachatGatId,
        userId,
        positionId
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        member,
        "Member added to bachatgat successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const removeBachatGatMember = asyncHandler(async (req, res) => {
    const { bachatGatId, userId } = req.body;
    await services.communityService.removeBachatGatMember(bachatGatId, userId);

    const response = new ApiResponse(
        httpStatus.OK,
        null,
        "Member removed from bachatgat successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const updateBachatGatMemberPosition = asyncHandler(async (req, res) => {
    const { bachatGatId, userId, newPositionId } = req.body;
    const member =
        await services.communityService.updateBachatGatMemberPosition(
            bachatGatId,
            userId,
            newPositionId
        );

    const response = new ApiResponse(
        httpStatus.OK,
        member,
        "Member position updated successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const addGramsanghMember = asyncHandler(async (req, res) => {
    const { gramsanghId, userId, positionId } = req.body;
    const member = await services.communityService.addGramsanghMember(
        gramsanghId,
        userId,
        positionId
    );

    const response = new ApiResponse(
        httpStatus.CREATED,
        member,
        "Member added to gramsangh successfully"
    );
    res.status(httpStatus.CREATED).json(response);
});

const removeGramsanghMember = asyncHandler(async (req, res) => {
    const { gramsanghId, userId } = req.body;
    await services.communityService.removeGramsanghMember(gramsanghId, userId);

    const response = new ApiResponse(
        httpStatus.OK,
        null,
        "Member removed from gramsangh successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const updateGramsanghMemberPosition = asyncHandler(async (req, res) => {
    const { gramsanghId, userId, newPositionId } = req.body;
    const member =
        await services.communityService.updateGramsanghMemberPosition(
            gramsanghId,
            userId,
            newPositionId
        );

    const response = new ApiResponse(
        httpStatus.OK,
        member,
        "Member position updated successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const getBachatGatsUnderGramsangh = asyncHandler(async (req, res) => {
    const { gramsanghId } = req.params;
    const bachatGats =
        await services.communityService.getBachatGatsUnderGramsangh(
            gramsanghId
        );

    const response = new ApiResponse(
        httpStatus.OK,
        bachatGats,
        "Bachatgats retrieved successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const getBachatGatMembers = asyncHandler(async (req, res) => {
    const { bachatGatId } = req.params;
    const members =
        await services.communityService.getBachatGatMembers(bachatGatId);

    const response = new ApiResponse(
        httpStatus.OK,
        members,
        "Members retrieved successfully"
    );
    res.status(httpStatus.OK).json(response);
});

const communityController = {
    createWorkspaceGramsangh,
    createWorkspaceBachatGat,
    getWorkspacePositions,
    addSelfToWorkspace,
    inviteWorkspaceMember,
    registerGramsangh,
    registerBachatGat,
    addBachatGatMember,
    removeBachatGatMember,
    updateBachatGatMemberPosition,
    addGramsanghMember,
    removeGramsanghMember,
    updateGramsanghMemberPosition,
    getBachatGatsUnderGramsangh,
    getBachatGatMembers,
};

export default communityController;
