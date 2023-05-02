require('dotenv').config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE,process.env.USER,process.env.PASSWORD,{
  HOST: process.env.HOST,
  USER: process.env.USER,
  dialect: "mysql",
  pool: {
    max:parseInt(process.env.MAX),
    min:parseInt(process.env.MIN),
    acquire:parseInt(process.env.ACQUIRE),
    idle:parseInt(process.env.IDLE),
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/infoModel")(sequelize, Sequelize);
db.product = require("../models/productModel")(sequelize, Sequelize);
db.order = require("../models/orderModel")(sequelize, Sequelize);

db.product.hasMany(db.order, {
  foreignKey: "productId",
  as: "orders"
});

db.user.hasMany(db.order, {
  foreignKey: "userId",
  as: "orders"
});

db.order.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user"
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = db;
