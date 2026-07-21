import constants from "../constants/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
import services from "./index.js";
import userService from "./user.service.js";
import jwt from "jsonwebtoken";
import config from "../config/env.config.js";
import models from "../models/index.js";
import axios from "axios";
import bcrypt from "bcrypt";

const toSessionUser = (user) => ({
    id: user._id,
    fullName: user.fullName,
    fullNameString: user.fullNameString,
    email: user.email,
    contactNumber: user.contactNumber,
    role: user.role,
    hasMpin: Boolean(user.mpin),
});

/**
 * Authenticates a user using their email or contact number and password.
 *
 * @param {Object} credentials - The login credentials.
 * @param {string} [credentials.email] - The email of the user.
 * @param {Object} [credentials.contactNumber] - The contact number of the user.
 * @param {string} credentials.password - The password of the user.
 * @returns {Promise<string>} - A promise that resolves to the access token if authentication is successful.
 * @throws {ApiError} - Throws an error if the email or contact number is not provided, user is not found, user is inactive, or password is incorrect.
 */
const loginWithEmailAndPassword = async (req) => {
    const credentials = req.body;
    console.log(credentials);

    if (!credentials.email && !credentials.contactNumber) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Email or Contact Number is not provided!!!"
        );
    }

    let user;
    if (credentials.email) {
        user = await userService.findOneUser(credentials.email, null);
    } else if (credentials.contactNumber) {
        user = await models.User.findOne({
            "contactNumber.number": credentials.contactNumber.number,
            "contactNumber.countryCode": credentials.contactNumber.countryCode,
            deleted: { $ne: true },
        });
    }

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!!!");
    }

    if (user.status === constants.UserStatus.Inactive) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User is inactive!!!");
    }

    const isPasswordValid = await user.isPasswordCorrect(credentials.password);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect!!!");
    }

    const token = await user.generateAuthTokens(req);

    return { ...token, user: toSessionUser(user) };
};

const refreshAuthTokens = async (req, refreshToken) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    if (decoded.type !== "refresh") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    const user = await models.User.findById(decoded.id);
    if (
        !user ||
        user.status === constants.UserStatus.Inactive ||
        user.deleted
    ) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User session is no longer active");
    }
    const session = user?.sessions.find(
        (item) =>
            item.tokenId === decoded.jti &&
            item.isActive &&
            item.refreshTokenExpiresAt > new Date()
    );

    if (!session || !(await bcrypt.compare(refreshToken, session.refreshTokenHash))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    const tokens = await user.rotateAuthTokens(req, session.tokenId);
    return { ...tokens, user: toSessionUser(user) };
};

/**
 * Registers a new user.
 *
 * @param {Object} userDetails - The details of the user to register.
 * @returns {Promise<Object>} - A promise that resolves to the registered user.
 */
const registerUser = async (userDetails) => {
    const user = await services.userService.createUser(userDetails);
    return user.populate("profile");
};

/**
 * Registers a new organisation and associates it with a user.
 *
 * @param {Object} orgDetails - The details of the organisation to register.
 * @param {Object} user - The user to associate with the organisation.
 * @returns {Promise<Object>} - A promise that resolves to the registered organisation.
 */
const registerOrganisation = async (orgDetails, user) => {
    const organisation = await services.organisationService.createOrgnisation(
        orgDetails,
        user
    );
    user.organisation = organisation._id;
    await user.save();
    return organisation;
};

/**
 * Changes the password of a user.
 *
 * @param {string} oldPassword - The current password of the user.
 * @param {string} newPassword - The new password to set.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<void>} - A promise that resolves when the password is changed.
 * @throws {ApiError} - Throws an error if the user is not found or the old password is incorrect.
 */
const changeUserPassword = async (oldPassword, newPassword, userId) => {
    const user = await userService.findUserById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();
};

/**
 * Sets an MPIN for a user for the first time.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} mpin - The 4-digit MPIN to set.
 * @returns {Promise<Object>} - A promise that resolves to the updated user.
 * @throws {ApiError} - Throws an error if the user is not found or the MPIN is already set.
 */
const setUserMpin = async (userId, mpin) => {
    const user = await userService.findUserById(userId);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.mpin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "MPIN is already set");
    }

    user.mpin = mpin;
    await user.save();
    return user;
};

/**
 * Updates an existing MPIN for a user after verifying the current one.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} oldMpin - The current MPIN to verify.
 * @param {string} newMpin - The new MPIN to set.
 * @returns {Promise<Object>} - A promise that resolves to the updated user.
 * @throws {ApiError} - Throws an error if the user is not found, no MPIN exists, or the current MPIN is incorrect.
 */
const updateUserMpin = async (userId, oldMpin, newMpin) => {
    const user = await userService.findUserById(userId);

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.mpin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "MPIN is not set yet");
    }

    const isMpinCorrect = await user.isMpinCorrect(oldMpin);
    if (!isMpinCorrect) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Current MPIN is incorrect"
        );
    }

    user.mpin = newMpin;
    await user.save();
    return user;
};

/**
 * Logs out a user by revoking the specified session.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} token - The JWT token to revoke.
 * @returns {Promise<void>} - A promise that resolves when the session is revoked.
 * @throws {ApiError} - Throws an error if the token is invalid or the session is not found.
 */
const logout = async (userId, token) => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const tokenId = decoded.jti;
        const sessions = await models.User.getActiveSessions(userId);
        console.log("sessions===>", sessions);

        const result = await models.User.revokeSession(userId, tokenId);
        if (result.modifiedCount === 0) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Session not found or already revoked"
            );
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
        }
        throw error;
    }
};

const authService = {
    loginWithEmailAndPassword,
    refreshAuthTokens,
    registerOrganisation,
    registerUser,
    changeUserPassword,
    setUserMpin,
    updateUserMpin,
    logout,
};

export default authService;
