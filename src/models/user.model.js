import mongoose from "mongoose";
import validator from "validator";
import plugins from "./plugins/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
import constants from "../constants/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/env.config.js";
import dbLogger from "../middlewares/dbLogger.middleware.js";
import reusableSchemas from "./reusableSchemas/index.js";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";
import getIpDetails from "../utils/getIpDetails.js";

const fullNameSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        index: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        index: true,
        trim: true,
    },
});

const sessionSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: [true, "Token ID is required"],
    },
    refreshTokenHash: {
        type: String,
        required: [true, "Refresh token hash is required"],
        private: true,
    },
    deviceInfo: {
        browser: { type: String, trim: true },
        os: { type: String, trim: true },
        device: { type: String, trim: true },
    },
    ipAddress: {
        type: String,
        trim: true,
        validate: {
            validator: (value) => !value || validator.isIP(value),
            message: "Invalid IP address",
        },
    },
    loginAt: {
        type: Date,
        default: Date.now,
        required: [true, "Login timestamp is required"],
    },
    expiresAt: {
        type: Date,
        required: [true, "Expiration timestamp is required"],
    },
    refreshTokenExpiresAt: {
        type: Date,
        required: [true, "Refresh token expiration timestamp is required"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    _id: false,
});

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: fullNameSchema,
            required: [true, "fullName is required"],
        },
        email: {
            type: String,
            required: false,
            index: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (
                    !validator.isEmail(value, { allow_utf8_local_part: false })
                ) {
                    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email");
                }
            },
        },
        userName: {
            type: String,
            required: false,
            index: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-z0-9_-]+$/,
                "Only lowercase alphabets, numbers, -, _ are allowed in user name",
            ],
        },
        contactNumber: {
            type: reusableSchemas.contactNumberSchema,
            required: [true, "Contact number is required"],
        },
        password: {
            type: String,
            required: false,
            trim: true,
            minlength: 8,
            private: true,
        },
        mpin: {
            type: String,
            required: false,
            trim: true,
            // A plaintext MPIN is validated before the pre-save hook hashes it.
            // Later saves (for example, when a login creates a session) validate
            // the stored 60-character bcrypt digest, so that value must be valid too.
            validate: {
                validator: (value) =>
                    !value ||
                    /^\d{4,6}$/.test(value) ||
                    /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value),
                message: "MPIN must be a 4 to 6 digit number",
            },
            private: true,
        },
        role: {
            type: String,
            enum: Object.values(constants.UserRoles),
            default: constants.UserRoles.USER,
        },
        status: {
            type: String,
            enum: Object.values(constants.UserStatus),
            default: constants.UserStatus.Active,
        },
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserProfile",
            required: false,
            index: true,
        },
        sessions: { type: [sessionSchema], required: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for full name string
userSchema.virtual("fullNameString").get(function () {
    return `${this.fullName?.firstName} ${this.fullName?.lastName}`;
});

userSchema.plugin(plugins.softDelete);
userSchema.plugin(plugins.paginate);
userSchema.plugin(plugins.privatePlugin);

// Indexes for performance
// userSchema.index({ "sessions.tokenId": 1 }, { unique: true, sparse: true });

// Check if email is taken
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({
        email,
        _id: { $ne: excludeUserId },
        deleted: { $ne: true },
    });
    return !!user;
};

// Check if userName is taken
userSchema.statics.isUserNameTaken = async function (userName, excludeUserId) {
    const user = await this.findOne({
        userName,
        _id: { $ne: excludeUserId },
        deleted: { $ne: true },
    });
    return !!user;
};

// Check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Check if MPIN is correct
userSchema.methods.isMpinCorrect = async function (mpin) {
    if (!this.mpin || !mpin) return false;
    return await bcrypt.compare(String(mpin), this.mpin);
};

const getTokenExpiration = (token) => {
    const { exp } = jwt.decode(token);
    return new Date(exp * 1000);
};

const getDeviceInfo = (req) => {
    try {
        const parser = new UAParser(req.headers["user-agent"] || "");
        const ua = parser.getResult();
        return {
            browser: ua.browser.name,
            os: ua.os.name,
            device: ua.device.type || "desktop",
        };
    } catch {
        return {};
    }
};

// Generate an access/refresh token pair and add a session.
userSchema.methods.generateAuthTokens = async function (req) {
    const tokenId = uuidv4();
    const token = jwt.sign(
        {
            id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
            jti: tokenId,
            type: "access",
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiry }
    );
    const refreshToken = jwt.sign(
        { id: this._id, jti: tokenId, type: "refresh" },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiry }
    );
    const expiresAt = getTokenExpiration(token);
    const refreshTokenExpiresAt = getTokenExpiration(refreshToken);

    const session = {
        tokenId,
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiresAt,
        deviceInfo: getDeviceInfo(req),
        ipAddress: getIpDetails(req).clientIp,
        loginAt: new Date(),
        expiresAt,
        isActive: true,
    };

    this.sessions.push(session);
    await this.save();

    return {
        token,
        refreshToken,
        expiryTime: expiresAt.toISOString(),
    };
};

// Retained for existing callers.
userSchema.methods.generateAccessToken = function (req) {
    return this.generateAuthTokens(req);
};

userSchema.methods.rotateAuthTokens = async function (req, tokenId) {
    this.sessions = this.sessions.filter((session) => session.tokenId !== tokenId);
    return this.generateAuthTokens(req);
};

// Revoke a session
userSchema.statics.revokeSession = async function (userId, tokenId) {
    return this.updateOne(
        { _id: userId },
        { $pull: { sessions: { tokenId, isActive: true } } }
    );
};

// List active sessions
userSchema.statics.getActiveSessions = async function (userId) {
    const user = await this.findById(userId).select("sessions");
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    return user.sessions.filter(
        (session) => session.isActive && session.expiresAt > new Date()
    );
};

// Clean up expired sessions
userSchema.pre(/^find/, async function () {
    const queryId = this.getQuery()._id;
    let userId = queryId;

    if (
        queryId &&
        typeof queryId === "object" &&
        !(queryId instanceof mongoose.Types.ObjectId)
    ) {
        userId = queryId.$eq;
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return;
    }

    await this.model.updateOne(
        { _id: userId },
        { $pull: { sessions: { expiresAt: { $lt: new Date() } } } }
    );
});

// Pre-save hook for registration token
userSchema.pre("save", function () {
    if (!this.isNew) {
        return;
    }
    const token = jwt.sign(
        {
            id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName,
        },
        config.jwt.secret
    );
    this.registrationToken = bcrypt.hashSync(token, 10);
});

// Pre-save hook for password hashing
userSchema.pre("save", function () {
    if (!this.isModified("password") || !this.password) return;
    this.password = bcrypt.hashSync(this.password, 10);
});

// Pre-save hook for MPIN hashing
userSchema.pre("save", function () {
    if (!this.isModified("mpin") || !this.mpin) return;
    this.mpin = bcrypt.hashSync(String(this.mpin), 10);
});

// Pre-save hook for logging
userSchema.pre("save", dbLogger("User"));

const User = mongoose.model("User", userSchema);
export default User;
