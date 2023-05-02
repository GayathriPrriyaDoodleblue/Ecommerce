const Joi = require('joi');
const status = require('../validation/status');

const joiRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
        role: Joi.string().valid('USER','ADMIN').required(),
    })
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};

const joiLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};


const joiBody=(req,res,next) => {
    const schema = Joi.object({
        productName: Joi.string().optional(),
        productDescription:Joi.string().optional(),
        productSize:Joi.string().valid('SMALL','MEDIUM','LARGE').optional(),
        productColor:Joi.string().optional(),
        productBrand:Joi.string().optional(),
        productPrice: Joi.number().positive().optional(),
        productQuantity:Joi.number().integer().positive().optional(),
        productId:Joi.number().integer().positive().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};

const joiQuery = (req, res, next) => {
    const schema = Joi.object({
        limit: Joi.number().integer().positive().optional(),
        page: Joi.number().integer().positive().optional(),
        id:Joi.number().integer().positive().optional(),
        userId:Joi.number().integer().positive().optional(),
        productName:Joi.string().optional(),
        productSize:Joi.string().valid('SMALL','MEDIUM','LARGE').optional(),
        productColor: Joi.string().optional(),
        productBrand:Joi.string().optional(),
        productPrice: Joi.number().positive().optional(),
    
    });
    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};
module.exports = { joiRegister, joiLogin, joiBody,joiQuery}