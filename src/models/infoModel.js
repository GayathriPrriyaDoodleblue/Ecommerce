module.exports = (sequelize, Sequelize) => {

    const User = sequelize.define('users', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.ENUM('USER', 'ADMIN'),
            allowNull: false,
            defaultValue: 'USER'
        }
    });
    
    return User;
};
