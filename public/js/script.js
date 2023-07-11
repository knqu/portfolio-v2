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

    // landing animation

    const landingTl = gsap.timeline();
    landingTl
        .to(preloaderWrapper, {
            opacity: 0,
            duration: 1
        })
        .to(main, {
            opacity: 1,
            duration: 1
        })
        .to(landingText, {
            'clip-path': 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
            y: 0,
            ease: 'back',
            duration: 2
        }, '<');

    setTimeout(function () {
        body.style.height = '100%';
        body.style.overflow = 'auto';
        preloader.remove();
        preloaderWrapper.remove();
    }, 1000);

    // particles.js load

    particlesJS.load('particles', '/js/json/particles.json');

    // body scroll animations

    const preset = {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: 'ease-in'
    };

    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: false
        }
    }).from('#aboutText', preset);

    const worksRow1Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#worksRow1',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: false
        }
    }).from('#worksRow1', preset);

    const worksRow2Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#worksRow2',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: false
        }
    }).from('#worksRow2', preset);


    const contactTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: false
        }
    }).from('#contactForm', preset);
});

setTimeout(function () {
    if (main.style.opacity == 0) {
        subPreloaderText.innerText = 'Please check your connection and that your antivirus is not blocking any site assets.';
    }
}, 8000);

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

// bootstrap and recaptcha validation

const contactForm = document.querySelector('#contactForm');
contactForm.addEventListener('submit', function (e) {
    if (!contactForm.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        contactForm.classList.add('was-validated');
    } else {
        e.preventDefault();
        contactForm.classList.add('was-validated');

        grecaptcha.ready(function () {
            grecaptcha.execute('6Ldgm5MhAAAAACgFWEbWO0tZxgAnZpz71lyyhb5g', { action: 'submit' })
                .then(function (token) {
                    contactForm.elements['token'].value = token;
                    contactForm.submit();
                })
                .catch(function (err) {
                    alert('reCAPTCHA verification failed. Please make sure you are not blocking any site assets, and try again.');
                });
        });
    }
}, false);

// open works card links on click

const worksCards = document.querySelectorAll('.cardInner');
const worksUrls = ['https://aftermath.kevinqu.com', '[Placeholder for Sentinel URL]', 'https://knqu.github.io/ap-european-history-trivia', 'https://github.com/knqu/gpacalc', 'https://ctf.kevinqu.com'];

for (let i = 0; i < worksCards.length; i++) {
    worksCards[i].addEventListener('click', function () {
        if (i === 1) {
            alert("Sentinel's source code is currently private, but will be published soon!");
        } else {
            window.open(worksUrls[i]);
        }
    });
}

// card hover effect

document.querySelector("#works").onmousemove = function (e) {
    for (const card of document.querySelectorAll(".cardInner")) {
        const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    };
};
