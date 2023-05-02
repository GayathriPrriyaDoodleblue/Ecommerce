const router = require('express').Router();
const {
    login,
    createUser,
    uploadProduct,
    editProducts,
    getProductById,
    searchProducts,
    createOrder,
    editOrder,
    showOrder,
    deleteOrder
} = require('../controller/userController');
const { joiLogin, joiRegister, joiBody, joiQuery } = require('../validation/joi');
const { authenticate } = require('../middleware/auth');

router
    .post('/login', joiLogin, login)
    .post('/register', joiRegister, createUser)
    .post('/uploadProduct', uploadProduct)
    .put('/editProducts/:id', authenticate(['ADMIN']), joiBody, editProducts)
    .get('/getProductById/:id', authenticate(['ADMIN']), getProductById)
    .get('/search', authenticate(['ADMIN', 'USER']), joiQuery, searchProducts)
    .post('/order', authenticate(['USER']), joiBody, createOrder)
    .put('/editOrder/:id', authenticate(['USER']), joiBody, editOrder)
    .get('/showOrder', authenticate(['ADMIN']), joiQuery, showOrder)
    .delete('/deleteOrder/:id', authenticate(['USER']), deleteOrder);

module.exports = router;
