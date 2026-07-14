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

const addBachatGatMember = {
    body: Joi.object().keys({
        bachatGatId: Joi.string().required(),
        userId: Joi.string().required(),
        positionId: Joi.string().required(),
    }),
};

const removeBachatGatMember = {
    body: Joi.object().keys({
        bachatGatId: Joi.string().required(),
        userId: Joi.string().required(),
    }),
};

const updateBachatGatMemberPosition = {
    body: Joi.object().keys({
        bachatGatId: Joi.string().required(),
        userId: Joi.string().required(),
        newPositionId: Joi.string().required(),
    }),
};

const addGramsanghMember = {
    body: Joi.object().keys({
        gramsanghId: Joi.string().required(),
        userId: Joi.string().required(),
        positionId: Joi.string().required(),
    }),
};

const removeGramsanghMember = {
    body: Joi.object().keys({
        gramsanghId: Joi.string().required(),
        userId: Joi.string().required(),
    }),
};

const updateGramsanghMemberPosition = {
    body: Joi.object().keys({
        gramsanghId: Joi.string().required(),
        userId: Joi.string().required(),
        newPositionId: Joi.string().required(),
    }),
};

const getBachatGatsUnderGramsangh = {
    params: Joi.object().keys({
        gramsanghId: Joi.string().required(),
    }),
};

const getBachatGatMembers = {
    params: Joi.object().keys({
        bachatGatId: Joi.string().required(),
    }),
};

const communityValidations = {
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

export default communityValidations;
