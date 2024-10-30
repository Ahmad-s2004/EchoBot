const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const { User } = require('./db'); 

let passportFunction = () => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4040/auth/google/callback",
      scope: ['profile', 'email'],
      prompt: 'select_account' 
  },
  async function(accessToken, refreshToken, profile, cb) {
      try {
          const email = profile.emails && profile.emails.length > 0 
              ? profile.emails[0].value 
              : null;

          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
              user = new User({
                  googleId: profile.id,
                  name: profile.displayName,
                  email
              });
              await user.save();
          }

          const token = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET_KEY,
              { expiresIn: '24h' }
          );

          return cb(null, { user, token });
      } catch (err) {
          return cb(err, null);
      }
  }));

  passport.serializeUser((data, done) => {
    if (!data || !data.user || !data.user.id) {
        return done(new Error("User data is missing or incomplete"));
    }
    done(null, { id: data.user.id, token: data.token });
});


  passport.deserializeUser(async (data, done) => {
      try {
          const user = await User.findById(data.id); 
          done(null, { user, token: data.token });
      } catch (err) {
          done(err, null); 
      }
  });
};

module.exports = passportFunction;
