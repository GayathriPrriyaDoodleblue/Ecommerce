const db = require("../models");
const User = db.user;
const Product = db.product;
const Order = db.order;
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const message = require('../validation/message');
const moment = require('moment-timezone');
const xlsx = require('xlsx');
const Sequelize = require('sequelize');
const { sendMail } = require('../middleware/sendMail');
const Op = require('sequelize').Op;

class userService { }

userService.prototype.createUser = async function (name, email, password, role) {
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return { error: message.User_Already_Exists };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    console.log(user)

    return { user };
  }
  catch (error) {
    return { error };
  }
}
userService.prototype.login = async function (email, password) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { error: message.Invalid_email };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: message.Invalid_password };
    }

    const token = generateToken(user);
    user.token = token.token;
    return { user };

  } catch (error) {
    return { error };
  }
};
userService.prototype.uploadProduct = async function (file) {
  try {
    if (!file) {
      return { error: message.No_file_uploaded };
    }

    const workbook = xlsx.read(file.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const products = data.map(row => ({
      productName: row.productName,
      productDescription: row.productDescription,
      productSize: row.productSize,
      productColor: row.productColor,
      productBrand: row.productBrand,
      productPrice: row.productPrice,
      productQuantity: row.productQuantity
    }));
    const createdProducts = await Product.bulkCreate(products)
    return { createdProducts };
  } catch (error) {
    return { error };
  }
};

userService.prototype.editProducts = async function (id, productData) {
  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return { error: message.Not_Found };
    }

    const updatedProduct = await product.update(productData, { where: { id } });

    return { updatedProduct };
  } catch (error) {
    return { error };
  }
};

userService.prototype.getProductById = async function (id) {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return { error: message.Not_Found };
    }
    return { product };
  } catch (error) {
    console.error(error);
    return error;
  }
};

userService.prototype.searchProducts = async function (id, productName, productBrand, productSize, productColor, productPrice, page, limit) {
  try {
    let offset = 0;
    if (limit && page) {
      offset = (page - 1) * limit;
    }

    let where = {};
    if (id) {
      where.id = id;
    }
    if (productName) {
      where.productName = { [Op.like]: `%${productName}%` };
    }
    if (productBrand) {
      where.productBrand = { [Op.like]: `%${productBrand}% ` };
    }
    if (productSize) {
      where.productSize = { [Op.like]: `%${productSize}%` };
    }
    if (productColor) {
      where.productColor = { [Op.like]: `%${productColor}%` };
    }
    if (productPrice) {
      where.productBrand = { [Op.like]: `%${productPrice}%` };
    }


    const totalItems = await Product.count({ where });

    const totalPages = Math.ceil(totalItems / limit);

    const items = await Product.findAll({
      where,
      limit,
      offset
    });
    return {
      items,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: page,
    };

  } catch (error) {
    return { error }
  }
};
userService.prototype.createOrder = async function (productId, productQuantity, userId) {
  try {
    const product = await Product.findOne({
      where: {
        id: productId
      },
      attributes: ['id', 'productName', 'productPrice', 'productQuantity']
    });

    if (!product) {
      return { error: message.Not_Found };
    }

    if (product.productQuantity < productQuantity) {
      return { error: message.Insufficient_Quantity };
    }

    const totalCost = product.productPrice * productQuantity;

    await Product.update(
      { productQuantity: Sequelize.literal(`productQuantity - ${productQuantity}`) },
      { where: { id: productId } }
    );

    const order = await Order.create({
      userId,
      productId,
      productPrice: product.productPrice,
      productQuantity,
      totalCost,
      orderDate: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),

    });

    if (!order) {
      return { error: message.Unable_To_Create_Order };
    }

    const user = await User.findOne({ where: { id: userId } });

    const date = new Date().toLocaleDateString();

    const emailBody = `
      <html>
        <body>
          <p>Dear ${user.name},</p>
          <p>Your order with ID ${order.id} has been created on ${date}.</p>
          <p>The order details are:</p>
          <ul>
            <li>Product ID: ${order.productId}</li>
            <li>Product Price: ${order.productPrice}</li>
            <li>Product Quantity: ${order.productQuantity}</li>
            <li>Total Cost: ${order.totalCost}</li>
            <li>Order Date: ${order.orderDate}</li>
          </ul>
        </body>
      </html>
    `;
    await sendMail(user.email, 'Order Created', emailBody);

    return { order };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

userService.prototype.editOrder = async function (id, { productId, productQuantity, userId }) {
  try {
    const order = await Order.findOne({ where: { id } });

    if (!order) {
      return { error: message.Not_Found };
    }

    const product = await Product.findOne({
      where: { id: productId },
      attributes: ['productPrice', 'productQuantity']
    });

    if (!product) {
      return { error: message.Not_Found };
    }

    if (productQuantity > product.productQuantity) {
      return { error: message.Insufficient_Quantity };
    }

    const totalCost = product.productPrice * productQuantity;

    const updatedOrder = await order.update({
      userId,
      productId,
      productPrice: product.productPrice,
      productQuantity,
      totalCost,
      orderDate: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
    });

    if (!updatedOrder) {
      return { error: message.Unable_To_Update_Order };
    }

    return { updatedOrder };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

userService.prototype.deleteOrder = async function (id, userId) {
  try {
    const order = await Order.findOne({ where: { id } });
    if (!order) {
      return { error: message.Not_Found };
    }
    const deletedRows = await Order.destroy({ where: { id } });
    const user = await User.findOne({ where: { id: userId } });
    const date = new Date().toLocaleDateString();

    await sendMail(
      user.email,
      'Order Deleted',
      `<p>Dear ${user.name},</p><p>Your order with ID ${order.id} has been deleted on ${date}</p>`
    );

    return { deletedRows };
  } catch (error) {
    console.error(error);
    return { error };
  }
};


userService.prototype.showOrder = async function (id, userId, page, limit) {
  try {
    let offset = 0;
    if (limit && page) {
      offset = (page - 1) * limit;
    }

    let where = {};
    if (id) {
      where.id = id;
    }
    if (userId) {
      where.userId = userId;
    }

    const totalItems = await Order.count({ where });

    const totalPages = Math.ceil(totalItems / limit);

    const orderList = await Order.findAll({
      where,
      limit,
      offset,
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email']

      },

    });
    return {
      orderList,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

module.exports = new userService();
