if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');

const Message = require('./models/message');
const notify = require('./controllers/notify');

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

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net/', 'https://cdnjs.cloudflare.com/'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'],
    }
}));

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
            notify.message(name, email, body, ip);
        })
        .then(function () {
            res.cookie('contactStatus', 'success', { signed: true });
        })
        .catch(function (err) {
            res.cookie('contactStatus', 'error', { signed: true });
            notify.alert(err, ip).catch();
        });

    res.redirect('contact');
});

app.get('/contact', function (req, res) {
    const { contactStatus = null } = req.signedCookies;

    if (!contactStatus) {
        res.redirect('/');
    } else {
        res.render('status', { status: contactStatus });
    }
});

app.use(function (req, res) {
    res.status(404).render('status', { status: '404' });
});

app.use(function (err, req, res, next) {
    notify.alert(err, req.socket.remoteAddress).catch();
    res.status(500).render('status', { status: '500' });
});

app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);
});
