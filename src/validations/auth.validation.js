import Joi from "joi";

const register = {
    body: Joi.object().keys({
        email: Joi.string().optional().email(),
        userName: Joi.string().optional(),
        fullName: Joi.object().keys({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        }),
        password: Joi.string().required().min(8),
        contactNumber: Joi.object().keys({
            countryCode: Joi.string().required(),
            number: Joi.string().required(),
        }),
        mpin: Joi.string()
            .optional()
            .length(4)
            .pattern(/^\d{4}$/),
    }),
};

const login = {
    body: Joi.object()
        .keys({
            email: Joi.string().optional().email(),
            contactNumber: Joi.object()
                .keys({
                    countryCode: Joi.string().required(),
                    number: Joi.string().required(),
                })
                .optional(),
            password: Joi.string().required(),
        })
        .or("email", "contactNumber"), // Ensures that at least one of email or contactNumber is provided
};

const setMpin = {
    body: Joi.object().keys({
        mpin: Joi.string()
            .required()
            .length(4)
            .pattern(/^\d{4}$/),
    }),
};

const updateMpin = {
    body: Joi.object().keys({
        oldMpin: Joi.string()
            .required()
            .length(4)
            .pattern(/^\d{4}$/),
        newMpin: Joi.string()
            .required()
            .length(4)
            .pattern(/^\d{4}$/),
    }),
};

const authValidations = { register, login, setMpin, updateMpin };

export default authValidations;
