const jwt = require('jsonwebtoken');
const STATUS = require('../validation/status');
const message = require('../validation/message');
const db = require("../models/index");
const Info = db.user;

const generateToken = (user) => {
    const tokenPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '2h' });
    return { token, role: user.role };
};

const authenticate = (roles) => async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.tokenMissing, token: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;
        if (decoded.role === 'ADMIN' && roles.includes('ADMIN')) {
            user = await Info.findOne({ where: { id: decoded.id, role: 'ADMIN' } });
        } else if (decoded.role === 'USER' && roles.includes('USER')) {
            user = await Info.findOne({ where: { id: decoded.id, role: 'USER' } });
        } else {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.Invalid_Role });
        }

        if (!user) {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.unauthorized });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        if (roles.length && !roles.includes(user.role)) {
            return res.status(STATUS.badRequest).json({ status: message.false, error:` Access denied. You do not have ${user.role} privileges.` });
        }
        next();

    } catch (error) {
        console.error(error);
        return res.status(STATUS.unauthorized).json({ status: message.false, error: message.unauthorized });
    }
};

module.exports = {
    generateToken,
    authenticate
};