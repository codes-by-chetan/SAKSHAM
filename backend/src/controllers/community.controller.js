import services from "../services/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import httpStatus from "http-status";

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

const communityController = {
    registerGramsangh,
    registerBachatGat,
};

export default communityController;
