/* ===== Portfolio — script.js ===== */
(() => {
    'use strict';

    const CONFIG = {
        REVEAL_STAGGER_MS: 80,
        REVEAL_THRESHOLD: 0.15,
        NAVBAR_SCROLL_THRESHOLD: 50,
        NAV_HIGHLIGHT_MARGIN: '-40% 0px -55% 0px',
        STATS_DURATION_MS: 1600,
        STATS_THRESHOLD: 0.5,
        PARALLAX_FACTOR: 0.35,
        TILT_ROTATION_X: -4,
        TILT_ROTATION_Y: 4,
        TILT_OFFSET_Y: -6,
        TILT_PERSPECTIVE: 800,
        TYPING_SPEED_DELETING: 30,
        TYPING_SPEED_NORMAL: 60,
        TYPING_PAUSE_END: 2500,
        TYPING_PAUSE_START: 400,
        TYPING_INIT_DELAY: 1200,
        FORM_RESET_DELAY_MS: 3000,
        MAGNETIC_OFFSET_Y: -3,
        MAGNETIC_FACTOR: 0.2
    };

    // ── Touch device detection ──
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ── Cursor glow that follows mouse (desktop only) ──
    if (!isTouchDevice) {
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);

        let mx = 0, my = 0;
        document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

        (function updateGlow() {
            cursorGlow.style.left = mx + 'px';
            cursorGlow.style.top = my + 'px';
            requestAnimationFrame(updateGlow);
        })();
    }

    // ── Scroll-reveal via Intersection Observer ──
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), i * CONFIG.REVEAL_STAGGER_MS);
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: CONFIG.REVEAL_THRESHOLD }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // ── Navbar scroll state ──
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > CONFIG.NAVBAR_SCROLL_THRESHOLD);
        lastScroll = y;
    });

    // ── Mobile menu toggle ──
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // ── Active nav highlight on scroll ──
    const sections = document.querySelectorAll('section[id]');
    const linkMap = {};
    document.querySelectorAll('.nav-link').forEach((l) => {
        linkMap[l.getAttribute('href')] = l;
    });

    const highlightObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const id = '#' + entry.target.id;
                if (linkMap[id]) {
                    if (entry.isIntersecting) {
                        Object.values(linkMap).forEach((l) => l.classList.remove('active'));
                        linkMap[id].classList.add('active');
                    }
                }
            });
        },
        { rootMargin: CONFIG.NAV_HIGHLIGHT_MARGIN }
    );
    sections.forEach((s) => highlightObserver.observe(s));

    // ── Count-up animation for stats ──
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = +el.dataset.count;
                const duration = CONFIG.STATS_DURATION_MS;
                const start = performance.now();
                const step = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                    el.textContent = Math.floor(ease * target);
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                counterObserver.unobserve(el);
            });
        },
        { threshold: CONFIG.STATS_THRESHOLD }
    );
    counters.forEach((c) => counterObserver.observe(c));

    // ── Hero parallax ──
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${window.scrollY * CONFIG.PARALLAX_FACTOR}px)`;
        }
    });

    // ── Tilt effect on skill & project cards (desktop only) ──
    if (!isTouchDevice) {
        const tiltCards = document.querySelectorAll('.skill-card, .project-card');
        tiltCards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * CONFIG.TILT_ROTATION_X;
                const rotateY = ((x - centerX) / centerX) * CONFIG.TILT_ROTATION_Y;
                card.style.transform = `translateY(${CONFIG.TILT_OFFSET_Y}px) perspective(${CONFIG.TILT_PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ── Typing animation for hero title ──
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const roles = [
            'CSE Student & Aspiring Developer',
            'Python & Java Enthusiast',
            'Building Clean Digital Experiences',
            'Algorithms · Web Dev · Problem Solving'
        ];
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;

        function typeLoop() {
            const current = roles[roleIdx];
            if (deleting) {
                heroTitle.textContent = current.substring(0, charIdx - 1);
                charIdx--;
            } else {
                heroTitle.textContent = current.substring(0, charIdx + 1);
                charIdx++;
            }

            let speed = deleting ? CONFIG.TYPING_SPEED_DELETING : CONFIG.TYPING_SPEED_NORMAL;

            if (!deleting && charIdx === current.length) {
                speed = CONFIG.TYPING_PAUSE_END;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                speed = CONFIG.TYPING_PAUSE_START;
            }

            setTimeout(typeLoop, speed);
        }

        // Start typing after reveal animation
        setTimeout(typeLoop, CONFIG.TYPING_INIT_DELAY);
    }

    // ── Smooth scroll for all anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Contact form ──
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn-submit');
        const span = btn.querySelector('span');
        const origText = span.textContent;

        span.textContent = 'Sent! 🎉';
        btn.style.background = 'linear-gradient(135deg, #28c840, #2ecc71)';
        btn.style.boxShadow = '0 4px 20px rgba(40, 200, 64, 0.3)';

        setTimeout(() => {
            span.textContent = origText;
            btn.style.background = '';
            btn.style.boxShadow = '';
            form.reset();
        }, CONFIG.FORM_RESET_DELAY_MS);
    });

    // ── Magnetic effect on social links (desktop only) ──
    if (!isTouchDevice) {
        document.querySelectorAll('.social-link').forEach((link) => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                link.style.transform = `translateY(${CONFIG.MAGNETIC_OFFSET_Y}px) translate(${x * CONFIG.MAGNETIC_FACTOR}px, ${y * CONFIG.MAGNETIC_FACTOR}px)`;
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }

})();