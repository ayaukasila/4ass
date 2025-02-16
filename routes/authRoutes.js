const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', {
        csrfToken: req.csrfToken(),
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
    });
});

router.get('/register', (req, res) => {
    res.render('register', {
        csrfToken: req.csrfToken(),
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
    });
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            req.flash('error', "Заполните все поля!");
            return res.redirect('/auth/register');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already exists. Please log in or use a different email.');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        req.flash('success', 'Registration successful. Please log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error("Registration Error:", error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/auth/register');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.flash('error', "Неправильные данные");
            return res.redirect('/auth/login');
        }

        req.session.user = user;
        req.flash('success', 'Login successful!');
        res.redirect('/');
    } catch (error) {
        console.error("Login Error:", error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;
