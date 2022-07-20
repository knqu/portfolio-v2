if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cookieParser = require('cookie-parser');
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

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', function (req, res) {
    res.clearCookie('contactStatus');
    res.render('index');
});

app.post('/contact', async function (req, res) {
    const { name, email, body } = req.body;
    const ip = req.socket.remoteAddress;

    let newMessage = new Message({ name: name, email: email, body: body, ip: ip });
    await newMessage.save()
        .then(function () {
            res.cookie('contactStatus', 'success', { signed: true });
        })
        .catch(function (err) {
            res.cookie('contactStatus', 'error', { signed: true });
        });
    res.redirect('contact');
});

app.get('/contact', function (req, res) {
    const { contactStatus = null } = req.signedCookies;

    if (!contactStatus) {
        res.redirect('/');
    } else {
        res.render('contact', { status: contactStatus });
    }
});

app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);
});
