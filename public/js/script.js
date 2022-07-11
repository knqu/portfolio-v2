// section selectors

const about = document.querySelector('#about');
const works = document.querySelector('#works');
const contact = document.querySelector('#contact');

// gsap animations
// gsap-related css set in javascript so website will be unaffected if js were to be disabled

const landingText = document.querySelector('#landingText');
landingText.style.clipPath = 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)';
landingText.style.opacity = '0';
landingText.style.transform = 'translateY(25%)';

const tl = gsap.timeline({ defaults: { duration: 2, ease: 'back' } });
tl
    .to('#landingText', {
        'clip-path': 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
        opacity: 1,
        y: 0
    });

// links and buttons: uses js instead of <a> to circumvent url change

const navLinks = document.querySelectorAll('.nav-link');
const exploreBtn = document.querySelector('#exploreBtn');

for (let el of navLinks) {
    el.addEventListener('click', function () {
        let name = el.id.slice(0, -7);
        if (name === 'home') {
            window.location.href = '/';
        } else {
            window[name].scrollIntoView();
        }
    });
}

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
