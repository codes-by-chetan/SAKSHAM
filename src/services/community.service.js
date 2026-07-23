import models from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const DEFAULT_POSITIONS = {
    bachatgat: [
        { name: "adhyaksha", displayName: "Adhyaksha", level: 30 },
        { name: "sachiv", displayName: "Sachiv", level: 20 },
        { name: "member", displayName: "Member", level: 10 },
    ],
    gramsangh: [
        { name: "adhyaksha", displayName: "Adhyaksha", level: 30 },
        { name: "koshadhyaksha", displayName: "Koshadhyaksha", level: 25 },
        { name: "sachiv", displayName: "Sachiv", level: 20 },
        { name: "crp", displayName: "CRP", level: 10 },
    ],
};

const getGroupConfig = (type) => {
    if (type === "bachatgat") {
        return {
            Group: models.BachatGat,
            Member: models.BachatGatMember,
            Position: models.BachatGatPosition,
            groupField: "bachatGat",
        };
    }
    if (type === "gramsangh") {
        return {
            Group: models.Gramsangh,
            Member: models.GramsanghMember,
            Position: models.GramsanghPosition,
            groupField: "gramsangh",
        };
    }
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid group type");
};

const seedDefaultPositions = async () => {
    await Promise.all(
        Object.entries(DEFAULT_POSITIONS).flatMap(([type, positions]) => {
            const { Position } = getGroupConfig(type);
            return positions.map((position) =>
                Position.updateOne(
                    { name: position.name },
                    { $setOnInsert: position },
                    { upsert: true }
                )
            );
        })
    );
};

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

const getActiveMembership = async (userId) => {
    const activeMemberFilter = {
        user: userId,
        status: "active",
        deleted: { $ne: true },
    };

    const bachatGatMember = await models.BachatGatMember.findOne(
        activeMemberFilter
    )
        .sort({ createdAt: -1 })
        .populate("bachatGat", "name status");
    if (bachatGatMember?.bachatGat?.status === "active") {
        return {
            id: bachatGatMember.bachatGat._id.toString(),
            name: bachatGatMember.bachatGat.name,
            type: "bachatgat",
            status: "active",
        };
    }

    const createdBachatGat = await models.BachatGat.findOne({
        createdBy: userId,
        status: "active",
        deleted: { $ne: true },
    }).sort({ createdAt: -1 });
    if (createdBachatGat) {
        return {
            id: createdBachatGat._id.toString(),
            name: createdBachatGat.name,
            type: "bachatgat",
            status: "active",
        };
    }

    const gramsanghMember = await models.GramsanghMember.findOne(
        activeMemberFilter
    )
        .sort({ createdAt: -1 })
        .populate("gramsangh", "name status");
    if (gramsanghMember?.gramsangh?.status === "active") {
        return {
            id: gramsanghMember.gramsangh._id.toString(),
            name: gramsanghMember.gramsangh.name,
            type: "gramsangh",
            status: "active",
        };
    }

    const createdGramsangh = await models.Gramsangh.findOne({
        createdBy: userId,
        status: "active",
        deleted: { $ne: true },
    }).sort({ createdAt: -1 });
    if (createdGramsangh) {
        return {
            id: createdGramsangh._id.toString(),
            name: createdGramsangh.name,
            type: "gramsangh",
            status: "active",
        };
    }

    return null;
};

const listPositions = async (type) => {
    const { Position } = getGroupConfig(type);
    return Position.find({ status: "active", deleted: { $ne: true } })
        .sort({ level: -1, displayName: 1 })
        .select("name displayName description level");
};

const canManageGroup = async (type, groupId, userId) => {
    const { Group, Member, groupField } = getGroupConfig(type);
    const group = await Group.findOne({
        _id: groupId,
        status: "active",
        deleted: { $ne: true },
    });
    if (!group) {
        throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
    }

    const membership = await Member.findOne({
        [groupField]: groupId,
        user: userId,
        status: "active",
        deleted: { $ne: true },
    }).populate("position", "level");
    if (membership?.position?.level >= 20) {
        return group;
    }

    const assignedMembers = await Member.countDocuments({
        [groupField]: groupId,
        user: { $exists: true, $ne: null },
        status: "active",
        deleted: { $ne: true },
    });
    if (group.createdBy.equals(userId) && assignedMembers === 0) {
        return group;
    }

    throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only an authorised office bearer can manage this group"
    );
};

const addSelfAsMember = async (type, groupId, userId, positionId) => {
    const { Group, Member, Position, groupField } = getGroupConfig(type);
    const group = await Group.findOne({
        _id: groupId,
        status: "active",
        deleted: { $ne: true },
    });
    if (!group) {
        throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
    }
    if (!group.createdBy.equals(userId)) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Only the creator can set up their own initial membership"
        );
    }

    const position = await Position.findOne({
        _id: positionId,
        status: "active",
        deleted: { $ne: true },
    });
    if (!position) {
        throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
    }

    const existing = await Member.findOne({
        [groupField]: groupId,
        user: userId,
        deleted: { $ne: true },
    });
    if (existing) {
        existing.position = position._id;
        existing.status = "active";
        await existing.save();
        return existing;
    }

    return Member.create({
        [groupField]: groupId,
        user: userId,
        position: position._id,
        status: "active",
    });
};

const inviteMember = async (type, groupId, invitedBy, payload) => {
    const { Member, Position, groupField } = getGroupConfig(type);
    await canManageGroup(type, groupId, invitedBy);

    const position = await Position.findOne({
        _id: payload.positionId,
        status: "active",
        deleted: { $ne: true },
    });
    if (!position) {
        throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
    }

    const contactNumber = payload.contactNumber;
    const existing = await Member.findOne({
        [groupField]: groupId,
        "invitedContactNumber.countryCode": contactNumber.countryCode,
        "invitedContactNumber.number": contactNumber.number,
        deleted: { $ne: true },
    });
    if (existing) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "This person is already invited"
        );
    }

    return Member.create({
        [groupField]: groupId,
        invitedContactNumber: contactNumber,
        invitedFullName: payload.fullName?.trim(),
        position: position._id,
        status: "pending",
        invitedBy,
    });
};

const claimPendingInvitations = async (user) => {
    const contactNumber = user.contactNumber;
    const filter = {
        "invitedContactNumber.countryCode": contactNumber.countryCode,
        "invitedContactNumber.number": contactNumber.number,
        status: "pending",
        deleted: { $ne: true },
    };

    await Promise.all([
        models.BachatGatMember.updateMany(filter, {
            $set: { user: user._id, status: "active" },
        }),
        models.GramsanghMember.updateMany(filter, {
            $set: { user: user._id, status: "active" },
        }),
    ]);
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
        status: "active",
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
        status: "active",
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
    seedDefaultPositions,
    createGramsangh,
    createBachatGat,
    getActiveMembership,
    listPositions,
    addSelfAsMember,
    inviteMember,
    claimPendingInvitations,
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
