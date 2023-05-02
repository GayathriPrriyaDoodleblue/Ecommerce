  module.exports = (sequelize, Sequelize) => {

    const Order = sequelize.define('orders', {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        productPrice: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        productQuantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        totalCost: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        orderDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
    });
  
    Order.associate = (models) => {
        Order.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product',
        });
        Order.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };
  
    return Order;
  };