const apiRoutes = (app) => {
    app.use('/admin', require('./commonRoutes'));
}

module.exports = apiRoutes