module.exports=(sequelize,Sequelize)=>{

const Product = sequelize.define('products', {
    productName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productDescription: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productSize: {
        type: Sequelize.ENUM('SMALL','MEDIUM','LARGE'),
        allowNull: false,
        defaultValue: 'SMALL'
    },
    productColor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productBrand: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productPrice: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    productQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    }

})
return Product;
};