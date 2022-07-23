const escape = require('escape-html');

module.exports.check = function (reqbody) {
    if (!reqbody.hasOwnProperty('name') || !reqbody.hasOwnProperty('email') || !reqbody.hasOwnProperty('body')) {
        return false;
    }

    let { name, email, body } = reqbody;
    name = name.trim();
    email = email.trim();
    body = body.trim();

    if (name.length < 2 || name.length > 100) {
        return false;
    } else if (email.length < 5 || email.length > 100) {
        return false;
    } else if (body.length < 2 || body.length > 1000) {
        return false;
    }

    return true;
};

module.exports.sanitize = function (str) {
    return escape(str.trim().replace(/\$/g, '&#36;'));
};
