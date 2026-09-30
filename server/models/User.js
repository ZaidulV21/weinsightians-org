import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        // We never return the password in queries by default
        select: false,
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin',
    },
    // Bumped on logout. Tokens issued before the bump stop verifying, so a
    // logout really ends the session server-side instead of only asking the
    // browser to drop its cookie. Documents that predate this field are read as
    // version 0, which is also what older, already-issued tokens carry.
    tokenVersion: {
        type: Number,
        default: 0,
    },
});

const User = mongoose.model('User', UserSchema);

export default User;
