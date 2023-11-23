require('dotenv').config();
const appEnv = process.env.NODE_ENV;

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

mongoose.connect(process.env.MONGODB_URL)
    .then(function () {
        console.log('Connected to MongoDB');
    })
    .catch(function (err) {
        console.log(err);
    });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

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
    standardHeaders: true,
    legacyHeaders: false,
    message: 'To discourage spam, there is a message cooldown of 1 minute.',
    skipFailedRequests: true,
    requestWasSuccessful: function (req, res) {
        const { contactStatus } = req.signedCookies;
        return contactStatus !== 'error' && contactStatus !== 'invalid';
    },
    handler: function (req, res) {
        res.cookie('rateLimited', 'true', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
        res.redirect('/contact');
    }
});

function getIP(req) {
    return req.headers['x-real-ip'] || req.socket.remoteAddress;
}

app.get('/', function (req, res) {
    res.render('index', { appEnv, year: new Date().getFullYear() });
});

app.post('/contact', contactLimiter, async function (req, res) {
    try {
        if (!format.check(req.body)) {
            res.cookie('contactStatus', 'invalid', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
            return res.redirect('/contact');
        }

        for (let key in req.body) {
            req.body[key] = format.sanitize(req.body[key]);
        }

        const { name, email, body, token } = req.body;

        const recaptcha = await axios.post('https://www.google.com/recaptcha/api/siteverify', `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}&remoteip=${getIP(req)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const success = recaptcha.data.success;
        const score = recaptcha.data.score;

        if (!success || score < 0.5) {
            res.cookie('contactStatus', 'recaptchaFailed', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
            return res.redirect('/contact');
        }

        let newMessage = new Message({ name: name, email: email, body: body, meta: { ip: getIP(req), date: new Date(), recaptcha: { success: success, score: score } } });
        await newMessage.save();

        notify.message(name, email, body, getIP(req));
        res.cookie('contactStatus', 'success', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
        res.redirect('/contact');
    } catch (err) {
        console.log(err);
        notify.alert(err, getIP(req)).catch();
        res.cookie('contactStatus', 'error', { signed: true, secure: true, httpOnly: true, maxAge: 60000 });
        res.redirect('/contact');
    }
});

app.get('/contact', function (req, res) {
    const { contactStatus = null, rateLimited = false } = req.signedCookies;

    if (!contactStatus && !rateLimited) {
        res.status(400);
        res.redirect('/');
    } else {
        if (rateLimited === 'true') {
            res.clearCookie('rateLimited', { signed: true, secure: true, httpOnly: true });
            res.status(429);
            res.render('status', { status: '429', title: 'Error' });
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

app.get('/cybersentinel', function (req, res) {
    res.render('cybersentinel');
});

app.use(function (req, res) {
    res.status(404);
    res.render('status', { status: '404', title: 'Error' });
});

app.use(function (err, req, res, next) {
    console.log(err);
    notify.alert(err, getIP(req)).catch();
    res.status(500);
    res.render('status', { status: '500', title: 'Error' });
});

app.listen(process.env.EXPRESS_PORT, function () {
    console.log(`Listening on port ${process.env.EXPRESS_PORT}`);
});
