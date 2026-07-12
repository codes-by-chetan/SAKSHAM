import Joi from "joi";

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        userName: Joi.string().optional(),
        fullName: Joi.object().keys({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        }),
        password: Joi.string().required().min(8),
        contactNumber: Joi.object().keys({
            countryCode: Joi.string().optional(),
            number: Joi.string().required(),
        }),
        mpin: Joi.string().optional().length(4).pattern(/^\d{4}$/),
    }),
};

const login = {
    body: Joi.object()
        .keys({
            userName: Joi.string().optional(),
            email: Joi.string().optional().email(),
            password: Joi.string().required(),
        })
        .or("userName", "email"), // Ensures that at least one of userName or email is provided
};

const setMpin = {
    body: Joi.object().keys({
        mpin: Joi.string().required().length(4).pattern(/^\d{4}$/),
    }),
};

const updateMpin = {
    body: Joi.object().keys({
        oldMpin: Joi.string().required().length(4).pattern(/^\d{4}$/),
        newMpin: Joi.string().required().length(4).pattern(/^\d{4}$/),
    }),
};

const authValidations = { register, login, setMpin, updateMpin };

export default authValidations;
