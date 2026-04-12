const joi = require("joi");

const CreateBannerDTO = joi.object({
    title: joi.string().max(100).required(),
    description: joi.string().max(500).allow(null,"").default(null),
    // image: joi.string().required(),
    link: joi.string().uri().allow(null,"").default(null),
    isActive:joi.string().regex(/^(active|inactive)$/).default('inactive')
})


module.exports = {
    CreateBannerDTO
}