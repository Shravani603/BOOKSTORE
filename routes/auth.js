const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');


// SIGNUP
router.get('/signup', (req, res) => {
    res.render('signup', { error: req.query.error });
});

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        email,
        password: hashed
    });

    await user.save();
    res.redirect('/login');
});


// LOGIN
router.get('/login', (req, res) => {
    res.render('login', { error: req.query.error });
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.redirect('/signup?error=usernotfound');
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
        return res.redirect('/login?error=wrongpassword');
    }

    req.session.user = user;

    res.redirect('/');
});


// LOGOUT
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;