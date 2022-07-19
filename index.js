if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const Message = require('./models/message');

mongoose.connect(process.env.DB_URL)
    .then(function () {
        console.log('Connected to MongoDB');
    })
    .catch(function (err) {
        console.log(err);
    });

const app = express();
let contactStatus = null;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', function (req, res) {
    res.render('index');
    contactStatus = null;
});

app.post('/contact', async function (req, res) {
    const { name, email, body } = req.body;
    const ip = req.socket.remoteAddress;

    let newMessage = new Message({ name: name, email: email, body: body, ip: ip });
    await newMessage.save()
        .then(function () {
            contactStatus = 'success';
        })
        .catch(function (err) {
            contactStatus = 'error';
            console.log(err);
        });
    res.redirect('contact');
});

app.get('/contact', function (req, res) {
    if (!contactStatus) {
        res.redirect('/');
    } else {
        res.render('contact', { status: contactStatus });
    }
});

app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);
});
