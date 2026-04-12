const joi = require("joi");

const SearchValidateDTO = joi.object({
    from:joi.string().required(),
    to:joi.string().required(),
    date:joi.date().required()
})

module.exports = {
    SearchValidateDTO
}