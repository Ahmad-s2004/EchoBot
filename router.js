const express = require('express')
const router = express.Router()
const passport = require('passport');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {
    mainHome,
    error,
    registerPage,
    register,
    loginPage,
    loginDetails,
    logout,
    Auth
} = require('./controller')


router.get('/', Auth,mainHome)

router.get('/register', registerPage)

router.post('/register', register)

router.get('/login', loginPage)

router.post('/login', loginDetails)

router.get('/logout', logout)

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.cookie('connect', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.redirect('/');
  }
);

router.get('/*', error)


module.exports = router
