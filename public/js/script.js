// section selectors
const about = document.querySelector('#about');
const works = document.querySelector('#works');
const contact = document.querySelector('#contact');

// navbar link selectors
const homeNavLink = document.querySelector('#homeNavLink');
const aboutNavLink = document.querySelector('#aboutNavLink');
const worksNavLink = document.querySelector('#worksNavLink');
const contactNavLink = document.querySelector('#contactNavLink');

// button selectors
const exploreBtn = document.querySelector('#exploreBtn');

// links and buttons: uses js instead of <a> to circumvent url change

homeNavLink.addEventListener('click', function () {
    window.location.href = '/';
});

aboutNavLink.addEventListener('click', function () {
    about.scrollIntoView();
});

worksNavLink.addEventListener('click', function () {
    works.scrollIntoView();
});

contactNavLink.addEventListener('click', function () {
    contact.scrollIntoView();
});

exploreBtn.addEventListener('click', function () {
    about.scrollIntoView();
    exploreBtn.blur();
});

// bootstrap form validation

(function () {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            }, false);
        });
})();
