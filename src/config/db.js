require('dotenv').config();

module.exports = {
    HOST: process.env.HOST,
    USER: process.env.USER,
    PASSWORD:process.env.PASSWORD,
    DB: process.env.DATABASE,
    dialect: "mysql",
    pool: {
      max:process.env.MAX,
      min: process.env.MIN,
      acquire:process.env.ACQUIRE,
      idle:process.env.IDLE,
    }
  };
  