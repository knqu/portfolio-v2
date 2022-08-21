require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const axios = require('axios').default;

const Message = require('./models/message');
const notify = require('./controllers/notify');
const format = require('./controllers/format');

mongoose.connect(process.env.DB_URL)
    .then(function () {
        console.log('Connected to MongoDB');
    })
    .catch(function (err) {
        console.log(err);
    });

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        scriptSrc: ["'self'", "'unsafe-inline'", 'unsafe-eval', 'https://cdn.jsdelivr.net/', 'https://cdnjs.cloudflare.com/', 'https://*.googletagmanager.com/', 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'],
        imgSrc: ["'self'", 'https://*.google-analytics.com', 'https://*.googletagmanager.com/'],
        connectSrc: ["'self'", 'https://*.google-analytics.com/', 'https://*.analytics.google.com', 'https://*.googletagmanager.com/'],
        frameSrc: ["'self'", 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
    }
}));

app.use(mongoSanitize({
    allowDots: true,
    replaceWith: '_'
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

const contactLimiter = rateLimit({
    windowMs: 60000,
    max: 1,
    message: 'To discourage spam, there is a message cooldown of 1 minute.',
    skipFailedRequests: true,
    requestWasSuccessful: function (req, res) {
        const { contactStatus } = req.signedCookies;
        return contactStatus !== 'error' || contactStatus !== 'invalid';
    },
    handler: function (req, res) {
        res.cookie('rateLimited', 'true', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
        return res.redirect('/contact');
    }
});

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/contact', contactLimiter, async function (req, res, next) {
    try {
        if (!format.check(req.body)) {
            res.cookie('contactStatus', 'invalid', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
            return res.redirect('/contact');
        }

        for (let key in req.body) {
            req.body[key] = format.sanitize(req.body[key]);
        }

        const { name, email, body, token } = req.body;
        const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;

        axios.post('https://www.google.com/recaptcha/api/siteverify', `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}&remoteip=${ip}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(function (res) {
                let success = res.data.success;
                let score = res.data.score;

                if (!success || score < 0.5) {
                    res.cookie('contactStatus', 'recaptchaFailed', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
                    return res.redirect('/contact');
                }
            })
            .catch(function (err) {
                notify.alert(err, ip).catch();
                res.cookie('contactStatus', 'error', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
                return res.redirect('/contact');
            });


        let newMessage = new Message({ name: name, email: email, body: body, ip: ip });
        await newMessage.save()
            .then(function () {
                notify.message(name, email, body, ip);
            })
            .then(function () {
                res.cookie('contactStatus', 'success', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
            })
            .catch(function (err) {
                res.cookie('contactStatus', 'error', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
                notify.alert(err, ip).catch();
            });

        res.redirect('/contact');
    } catch (err) {
        next(err);
    }
});

app.get('/contact', function (req, res) {
    const { contactStatus = null, rateLimited = false } = req.signedCookies;

    if (!contactStatus && !rateLimited) {
        res.status(400).redirect('/');
    } else {
        if (rateLimited === 'true') {
            res.clearCookie('rateLimited', { signed: true, secure: true, httpOnly: true });
            res.status(429).render('status', { status: '429', title: 'Error' });
        } else {
            if (contactStatus === 'error') {
                res.status(500);
            }
            res.render('status', { status: contactStatus, title: 'Contact' });
        }
    }
});

app.get('/privacy', function (req, res) {
    res.render('privacy');
});

app.use(function (req, res) {
    res.status(404).render('status', { status: '404', title: 'Error' });
});

app.use(function (err, req, res, next) {
    notify.alert(err, req.socket.remoteAddress).catch();
    res.status(500).render('status', { status: '500', title: 'Error' });
});

app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);
});
