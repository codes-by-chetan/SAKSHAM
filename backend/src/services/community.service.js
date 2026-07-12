import models from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Creates a new gramsangh with the provided payload.
 *
 * @param {Object} payload - The gramsangh details.
 * @param {string} userId - The ID of the user creating the gramsangh.
 * @returns {Promise<Object>} - A promise that resolves to the created gramsangh.
 * @throws {ApiError} - Throws an error if a gramsangh with the same name already exists.
 */
const createGramsangh = async (payload, userId) => {
    const existing = await models.Gramsangh.findOne({
        name: payload.name,
        deleted: { $ne: true },
    });

    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Gramsangh already exists");
    }

    return models.Gramsangh.create({
        ...payload,
        createdBy: userId,
    });
};

/**
 * Creates a new bachatgat and optionally links it to an existing gramsangh.
 *
 * @param {Object} payload - The bachatgat details.
 * @param {string} userId - The ID of the user creating the bachatgat.
 * @returns {Promise<Object>} - A promise that resolves to the created bachatgat.
 * @throws {ApiError} - Throws an error if a bachatgat with the same name already exists.
 */
const createBachatGat = async (payload, userId) => {
    const existing = await models.BachatGat.findOne({
        name: payload.name,
        deleted: { $ne: true },
    });

    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Bachatgat already exists");
    }

    const bachatGat = await models.BachatGat.create({
        ...payload,
        createdBy: userId,
    });

    if (payload.gramsangh) {
        await models.Gramsangh.findByIdAndUpdate(payload.gramsangh, {
            $addToSet: { bachatGats: bachatGat._id },
        });
    }

    return bachatGat;
};

const communityService = {
    createGramsangh,
    createBachatGat,
};

export default communityService;
