if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const nodemailer = require("nodemailer");

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
    },
    body: {
        type: String,
        trim: true,
        required: true,
        maxlength: 1000
    },
    ip: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

messageSchema.post('save', async function () {
    // nodemailer
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
