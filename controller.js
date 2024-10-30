const {User} = require('./db');
const jwt = require('jsonwebtoken')
require('dotenv').config()


let Auth = async (req, res, next) => {
    try {
        let token = req.cookies['connect'];
        if (!token) {
            res.redirect('login')
        }
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        if (!res.headersSent) {
            res.status(401).send("Unauthorized");
        }
    }
};



let mainHome = (req, res) => {
    res.render('home');
};

let error = (req, res) => {
    res.render('error');
};

let registerPage = (req, res) => {
    res.render('register', { successMessage: '' });
};

let register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.render('register', { successMessage: "Please fill all fields" });
    }

    try {
        let ExUser = await User.findOne({ email });
        if (ExUser) {
            return res.render('register', { successMessage: "User Already Exists. Login Instead" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.render('register', {
            successMessage: 'User Registered Successfully',
            name,
            email,
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

let loginPage = (req, res) => {
    res.render('login', { successMessage: '' });
};


let loginDetails = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { successMessage: "Please fill all fields" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { successMessage: "No User Found" });
        }

        if (user.password !== password) {
            return res.render('login', { successMessage: "Incorrect Password" });
        }

        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY , {
            expiresIn: '24h'
        });

        res.cookie('connect', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        req.login({ user: user, token: token }, (err) => {
            if (err) {
                console.log(err);
                return res.redirect('/login');
            }
            return res.redirect('/');
        });

    } catch (error) {
        console.error("Error in login route:", error);
        res.status(500).send("Server Error");
    }
};

const logout = (req, res, next) => {
    res.clearCookie('connect');
    res.clearCookie('connect.sid');
    res.clearCookie('mp_844407e91b119d6a00359efeff26eaa4_mixpanel');

    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); 
        }

        res.redirect('/login');
    });
};

module.exports = {
    mainHome,
    error,
    registerPage,
    register,
    loginPage,
    loginDetails,
    logout,
    Auth
};