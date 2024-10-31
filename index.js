const express = require('express');
const app = express();
const { connectDB, User } = require('./db');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
const path = require('path')
const router = require('./router.js')
const passportFunction = require('./passport.js')
const cookieParser = require('cookie-parser');


app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))


app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
connectDB();

app.use(express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.JWT_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
      name: 'token',
      maxAge: 1000 * 60 * 60,


  }
}));

app.use(passport.initialize());
app.use(passport.session());

passportFunction()

const setToken = () =>{

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, maxAge: 86400000 });
}



app.use(router)


const PORT = 4040;
app.listen(PORT, () => {
  console.log(`Server is started at port ${PORT}`);
});
