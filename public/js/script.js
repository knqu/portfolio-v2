// section selectors

const about = document.querySelector('#about');
const works = document.querySelector('#works');
const contact = document.querySelector('#contact');

// gsap animations and preloader
// gsap-related css set in javascript so website will be unaffected if js were to be disabled

const preloader = document.querySelector('#preloader');
const preloaderWrapper = document.querySelector('#preloaderWrapper');
const subPreloaderText = document.querySelector('#subPreloaderText');

const body = document.querySelector('body');
body.style.height = '100vh';
body.style.overflow = 'hidden';

const main = document.querySelector('main');
main.style.opacity = '0';

const landingText = document.querySelector('#landingText');
landingText.style.clipPath = 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)';
landingText.style.transform = 'translateY(25%)';

window.scrollTo({ top: 0, behavior: 'auto' });
// all gsap and particles.js utilities must be executed after page has loaded due to scripts being deferred
window.addEventListener('load', function () {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { duration: 2 } });
    tl
        .to(preloaderWrapper, {
            opacity: 0
        })
        .to(main, {
            opacity: 1
        })
        .to(landingText, {
            'clip-path': 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
            y: 0,
            ease: 'back'
        }, '<');

    setTimeout(function () {
        body.style.height = '100%';
        body.style.overflow = 'auto';
        preloader.remove();
        preloaderWrapper.remove();
    }, 2000);

    particlesJS.load('particles', '/js/json/particles.json');
});

setTimeout(function () {
    if (main.style.opacity == 0) {
        subPreloaderText.innerText = 'Please check your connection and that your antivirus is not blocking any site assets.';
    }
}, 4000);

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
