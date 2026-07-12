import Joi from "joi";

const registerGramsangh = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        bachatGats: Joi.array().items(Joi.string()).optional(),
    }),
};

const registerBachatGat = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        gramsangh: Joi.string().optional(),
        members: Joi.array().items(Joi.string()).optional(),
    }),
};

const communityValidations = {
    registerGramsangh,
    registerBachatGat,
};

export default communityValidations;
