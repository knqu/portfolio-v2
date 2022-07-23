const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2
    },
    email: {
        type: String,
        trim: true,
        required: true,
        minlength: 5
    },
    body: {
        type: String,
        trim: true,
        required: true,
        minlength: 2
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

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
