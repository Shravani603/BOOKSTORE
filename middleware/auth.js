module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (req.session.user.role !== 'admin') {
        return res.send("Access Denied");
    }
    next();
};

module.exports.isOwner = (model) => {
    return async (req, res, next) => {
        const item = await model.findById(req.params.id);

        if (!item.createdBy.equals(req.session.user._id) &&
            req.session.user.role !== 'admin') {
            return res.send("Not allowed");
        }

        next();
    };
};