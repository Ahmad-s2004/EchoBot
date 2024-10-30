const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected');
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
    }
};

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: false },
});

const User = mongoose.model('User', userSchema);

module.exports = { connectDB, User };
