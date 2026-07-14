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

/**
 * Adds a member to a bachatgat with a specific position.
 *
 * @param {string} bachatGatId - The ID of the bachatgat.
 * @param {string} userId - The ID of the user to add.
 * @param {string} positionId - The ID of the position to assign.
 * @returns {Promise<Object>} - A promise that resolves to the created member record.
 * @throws {ApiError} - Throws an error if the bachatgat is not found or user is already a member.
 */
const addBachatGatMember = async (bachatGatId, userId, positionId) => {
    const bachatGat = await models.BachatGat.findById(bachatGatId);
    if (!bachatGat) {
        throw new ApiError(httpStatus.NOT_FOUND, "Bachatgat not found");
    }

    const position = await models.BachatGatPosition.findById(positionId);
    if (!position) {
        throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
    }

    const existingMember = await models.BachatGatMember.findOne({
        bachatGat: bachatGatId,
        user: userId,
        deleted: { $ne: true },
    });

    if (existingMember) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "User is already a member of this bachatgat"
        );
    }

    return models.BachatGatMember.create({
        bachatGat: bachatGatId,
        user: userId,
        position: positionId,
    });
};

/**
 * Removes a member from a bachatgat.
 *
 * @param {string} bachatGatId - The ID of the bachatgat.
 * @param {string} userId - The ID of the user to remove.
 * @returns {Promise<Object>} - A promise that resolves to the soft-deleted member record.
 * @throws {ApiError} - Throws an error if the member is not found.
 */
const removeBachatGatMember = async (bachatGatId, userId) => {
    const member = await models.BachatGatMember.findOne({
        bachatGat: bachatGatId,
        user: userId,
        deleted: { $ne: true },
    });

    if (!member) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Member not found in this bachatgat"
        );
    }

    member.deleted = true;
    await member.save();
    return member;
};

/**
 * Updates a member's position in a bachatgat.
 *
 * @param {string} bachatGatId - The ID of the bachatgat.
 * @param {string} userId - The ID of the user.
 * @param {string} newPositionId - The ID of the new position to assign.
 * @returns {Promise<Object>} - A promise that resolves to the updated member record.
 * @throws {ApiError} - Throws an error if the member is not found.
 */
const updateBachatGatMemberPosition = async (
    bachatGatId,
    userId,
    newPositionId
) => {
    const position = await models.BachatGatPosition.findById(newPositionId);
    if (!position) {
        throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
    }

    const member = await models.BachatGatMember.findOne({
        bachatGat: bachatGatId,
        user: userId,
        deleted: { $ne: true },
    });

    if (!member) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Member not found in this bachatgat"
        );
    }

    member.position = newPositionId;
    await member.save();
    return member;
};

/**
 * Adds a member to a gramsangh with a specific position.
 *
 * @param {string} gramsanghId - The ID of the gramsangh.
 * @param {string} userId - The ID of the user to add.
 * @param {string} positionId - The ID of the position to assign.
 * @returns {Promise<Object>} - A promise that resolves to the created member record.
 * @throws {ApiError} - Throws an error if the gramsangh is not found or user is already a member.
 */
const addGramsanghMember = async (gramsanghId, userId, positionId) => {
    const gramsangh = await models.Gramsangh.findById(gramsanghId);
    if (!gramsangh) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gramsangh not found");
    }

    const position = await models.GramsanghPosition.findById(positionId);
    if (!position) {
        throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
    }

    const existingMember = await models.GramsanghMember.findOne({
        gramsangh: gramsanghId,
        user: userId,
        deleted: { $ne: true },
    });

    if (existingMember) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "User is already a member of this gramsangh"
        );
    }

    return models.GramsanghMember.create({
        gramsangh: gramsanghId,
        user: userId,
        position: positionId,
    });
};

/**
 * Removes a member from a gramsangh.
 *
 * @param {string} gramsanghId - The ID of the gramsangh.
 * @param {string} userId - The ID of the user to remove.
 * @returns {Promise<Object>} - A promise that resolves to the soft-deleted member record.
 * @throws {ApiError} - Throws an error if the member is not found.
 */
const removeGramsanghMember = async (gramsanghId, userId) => {
    const member = await models.GramsanghMember.findOne({
        gramsangh: gramsanghId,
        user: userId,
        deleted: { $ne: true },
    });

    if (!member) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Member not found in this gramsangh"
        );
    }

    member.deleted = true;
    await member.save();
    return member;
};

/**
 * Updates a member's position in a gramsangh.
 *
 * @param {string} gramsanghId - The ID of the gramsangh.
 * @param {string} userId - The ID of the user.
 * @param {string} newPositionId - The ID of the new position to assign.
 * @returns {Promise<Object>} - A promise that resolves to the updated member record.
 * @throws {ApiError} - Throws an error if the member is not found.
 */
const updateGramsanghMemberPosition = async (
    gramsanghId,
    userId,
    newPositionId
) => {
    const position = await models.GramsanghPosition.findById(newPositionId);
    if (!position) {
        throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
    }

    const member = await models.GramsanghMember.findOne({
        gramsangh: gramsanghId,
        user: userId,
        deleted: { $ne: true },
    });

    if (!member) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Member not found in this gramsangh"
        );
    }

    member.position = newPositionId;
    await member.save();
    return member;
};

/**
 * Gets all bachatgats under a specific gramsangh.
 *
 * @param {string} gramsanghId - The ID of the gramsangh.
 * @returns {Promise<Array>} - A promise that resolves to an array of bachatgats.
 * @throws {ApiError} - Throws an error if the gramsangh is not found.
 */
const getBachatGatsUnderGramsangh = async (gramsanghId) => {
    const gramsangh = await models.Gramsangh.findById(gramsanghId);
    if (!gramsangh) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gramsangh not found");
    }

    return models.BachatGat.find({
        gramsangh: gramsanghId,
        deleted: { $ne: true },
    }).select("name description status createdBy createdAt");
};

/**
 * Gets all members of a specific bachatgat with their details.
 *
 * @param {string} bachatGatId - The ID of the bachatgat.
 * @returns {Promise<Array>} - A promise that resolves to an array of members with their position details.
 * @throws {ApiError} - Throws an error if the bachatgat is not found.
 */
const getBachatGatMembers = async (bachatGatId) => {
    const bachatGat = await models.BachatGat.findById(bachatGatId);
    if (!bachatGat) {
        throw new ApiError(httpStatus.NOT_FOUND, "Bachatgat not found");
    }

    return models.BachatGatMember.find({
        bachatGat: bachatGatId,
        deleted: { $ne: true },
    })
        .populate({
            path: "user",
            select: "firstName lastName email contactNumber",
        })
        .populate({
            path: "position",
            select: "name displayName description level",
        })
        .select("user position status joinedAt")
        .exec();
};

const communityService = {
    createGramsangh,
    createBachatGat,
    addBachatGatMember,
    removeBachatGatMember,
    updateBachatGatMemberPosition,
    addGramsanghMember,
    removeGramsanghMember,
    updateGramsanghMemberPosition,
    getBachatGatsUnderGramsangh,
    getBachatGatMembers,
};

export default communityService;
