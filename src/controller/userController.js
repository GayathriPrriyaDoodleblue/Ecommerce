const STATUS = require('../validation/status');
const MESSAGE = require('../validation/message');
const { logger } = require('../winston/logger');
const userService = require('../service/userService');

class userController{ }

userController.prototype.createUser = async function (req, res) {
  try {
    const { name, email, password, role } = req.body;
    const { user, error } = await userService.createUser(name, email, password, role);
    if (error) {
      return res.status(STATUS.badRequest).json({ success:STATUS.false, error: error , data: null});
    }

    logger.info('user registered', { user });
    res.status(STATUS.success).json({ status: STATUS.true, data: user });

  } catch (error) {
    logger.error('unable to register', { error });
    return res.status(STATUS.internalServerError).json({ status:STATUS.false, error: MESSAGE.internalServerError });
  }
}

userController.prototype.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    const { user, error } = await userService.login(email, password);

    if (error) {
      return res.status(STATUS.badRequest).json({ status:STATUS.false, error: error });
    }

    logger.info('login successfully', { user });
    res.status(STATUS.success).json({ status:STATUS.true, data: { id: user.id, name: user.name, email: user.email, token: user.token } });

  } catch (error) {
    logger.error('unable to login', { error });
    return res.status(STATUS.internalServerError).json({ status:STATUS.false, error: MESSAGE.internalServerError });
  }
};
userController.prototype.uploadProduct = async function (req, res) {
  try {
    const { createdProducts, error } = await userService.uploadProduct(req.files.file);
    if (error) {
      return res.status(STATUS.badRequest).json({ status: STATUS.false, error: error });
    }
    logger.info('uploaded', { createdProducts });
    res.status(STATUS.success).json({ status: STATUS.true, data: createdProducts });

  } catch (error) {
    console.error(error);
    logger.info('not uploaded', { error });
    return res.status(STATUS.internalServerError).json({ status: STATUS.false, error: MESSAGE.internalServerError });
  }
};
userController.prototype.editProducts = async function (req, res) {
  const { id } = req.params;
  const { productName, productDescription, productSize, productColor, productBrand, productPrice, productQuantity } = req.body;

  try {
    const { updatedProduct, error } = await userService.editProducts(id, {
      productName,
      productDescription,
      productSize,
      productColor,
      productBrand,
      productPrice,
      productQuantity,
    });

    if (error) {
      logger.error('Product not found');
      return res.status(STATUS.badRequest).json({ status:STATUS.false, error: error, data: null });
    }
    if (!updatedProduct) {
      logger.error('Item not found', { error });
      return res.status(STATUS.success).json({ status: STATUS.false, message: MESSAGE.Not_Found, data: null });
    }

    logger.info('Item edited successfully', { updatedProduct });
    return res.status(STATUS.created).json({ status: STATUS.true, data: updatedProduct });
  } catch (error) {
    logger.error('Unable to update item', { error });
    return res.status(STATUS.internalServerError).json({ status: STATUS.false, message: MESSAGE.Unable_To_Update_Items, error: error.message });
  }
};
userController.prototype.getProductById = async function (req, res) {
  try {
    const { id } = req.params;
    const { product, error } = await userService.getProductById(id);
    if (error) {
      logger.error('Data not found')
      return res.status(STATUS.badRequest).json({ status: STATUS.false, error: error, data: null });
    }
    if (!product || product.length === 0) {
      logger.error('Data not found')
      res.status(STATUS.success).json({ status: STATUS.false, message: MESSAGE.Not_Found, data: null });
    } else {
      logger.info('Data fetched successfully', product)
      return res.status(STATUS.success).json({ status: STATUS.true, data: product });
    }
  } catch (error) {
    logger.error('Data not found', error)
    res.status(STATUS.internalServerError).json({ status: STATUS.false, message: MESSAGE.Unable_To_fetch_items, data: null });
  }
};

userController.prototype.searchProducts = async function (req, res) {
  try {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const { id, productName, productBrand, productSize, productColor, productPrice } = req.query;
    const result = await userService.searchProducts(id, productName, productBrand, productSize, productColor, productPrice, page, limit);
    const { items, totalItems, totalPages } = result;
    if (!items || items.length === 0) {
      logger.error('No data found');
      return res.status(STATUS.success).json({ status: STATUS.true, message: MESSAGE.Not_Found, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
    } else {
      logger.info('Data fetched successfully', items);
      return res.status(STATUS.success).json({ status: STATUS.true,totalItems, data: {items}, totalPages, currentPage: parseInt(page) });
    }
  } catch (error) {
    logger.error('Data not found', error);
    res.status(STATUS.internalServerError).json({ status: STATUS.false, message: MESSAGE.Unable_To_fetch_items, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
  }
};

userController.prototype.createOrder = async function (req, res) {
  try {
    const { productId, productQuantity } = req.body;
    const userId = req.user.id;

    if (!productId || !productQuantity) {
      return res.status(STATUS.badRequest).json({status:STATUS.false, error: MESSAGE.RequiredFields, data: null });
  }
    
    const { order, error } = await userService.createOrder(productId, productQuantity, userId);

    if (error) {
      logger.error('No data found');
      return res.status(STATUS.badRequest).json({ status:STATUS.false, error: error, data: null });
    }

    logger.info('Data fetched successfully', order);
    return res.status(STATUS.success).json({ status: STATUS.true, data: order});
  } catch (error) {
    logger.error('Data not found', error);
    return res.status(STATUS.internalServerError).json({ status: STATUS.false, error: MESSAGE.Unable_To_Create_Order, data: null });
  }
};
userController.prototype.editOrder = async function (req, res) {
  try {
    const { id } = req.params;
    const { productId, productQuantity } = req.body;
    const userId = req.user.id;

    const { updatedOrder, error } = await userService.editOrder(id,
      {
        productId,
        productQuantity,
        userId
      });

    if (error) {
      logger.error('No data found');
      res.status(STATUS.badRequest).json({ status: STATUS.false, error: error, data: null });
    }
    logger.info('Data fetched successfully', updatedOrder);
    return res.status(STATUS.success).json({ status: STATUS.true, data: updatedOrder });
  } catch (error) {
    logger.error('Data not found', error);
    return res.status(STATUS.internalServerError).json({ status: STATUS.false, error: MESSAGE.Unable_To_Update_Order, data: null });
  }
};
userController.prototype.deleteOrder = async function (req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { deletedRows, error } = await userService.deleteOrder(id, userId);
    if (error) {
      logger.error('order not found');
      return res.status(STATUS.badRequest).json({ status: STATUS.false, error: error, data: null });
    }
    if (!deletedRows || deletedRows.error) {
      return res.status(STATUS.badRequest).json({ status: STATUS.false, message: MESSAGE.Not_Found, data: null });
    }

    logger.info('order deleted successfully', { deletedRows });
    return res.status(STATUS.success).json({ status: STATUS.true, message: MESSAGE.Successfully_deleted ,email:MESSAGE.Mail_Sent_Successfully});

  } catch (error) {
    console.error(error);
    logger.error('Unable to delete', { error });
    return res.status(STATUS.internalServerError).json({ status: STATUS.false, error: MESSAGE.internalServerError });
  }
};

userController.prototype.showOrder = async function (req, res) {
  try {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const { id, userId } = req.query;

    const result = await userService.showOrder(id, userId, page, limit);

    if (!result || result.orderList.length === 0) {
      logger.error('No data found');
      return res.status(STATUS.success).json({ status: STATUS.true, message: MESSAGE.Not_Found, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
    } else {
      const { orderList, totalItems, totalPages, currentPage } = result;
      logger.info('Data fetched successfully', orderList);
  
      return res.status(STATUS.success).json({ status: STATUS.true,totalItems, data: {orderList}, totalPages, currentPage });
    }
  } catch (error) {
    console.error(error);
    logger.error('unable to fetch', { error });
    return res.status(STATUS.internalServerError).json({ status: STATUS.false, error: MESSAGE.internalServerError });
  }
};

module.exports = new userController();