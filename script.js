/* ===== Portfolio — script.js ===== */
(() => {
    'use strict';

    // ── GitHub Config ──
    const GITHUB_USERNAME = '12vicky08';

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
    function initRevealObserver() {
        const revealEls = document.querySelectorAll('.reveal:not(.visible)');
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => entry.target.classList.add('visible'), i * 80);
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    }
    initRevealObserver();

    // ── Navbar scroll state ──
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 50);
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
        { rootMargin: '-40% 0px -55% 0px' }
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
                const duration = 1600;
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
        { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));

    // ── Hero parallax ──
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
        }
    });

    // ── Tilt effect on skill & project cards (desktop only) ──
    function initTiltEffect() {
        if (!isTouchDevice) {
            const tiltCards = document.querySelectorAll('.skill-card, .project-card');
            tiltCards.forEach((card) => {
                if (card.dataset.tiltInit) return; // skip already initialized
                card.dataset.tiltInit = 'true';
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -4;
                    const rotateY = ((x - centerX) / centerX) * 4;
                    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                });
            });
        }
    }
    initTiltEffect();

    // ── Typing animation for hero title ──
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const roles = [
            'Computer Science Student',
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

            let speed = deleting ? 30 : 60;

            if (!deleting && charIdx === current.length) {
                speed = 2500;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                speed = 400;
            }

            setTimeout(typeLoop, speed);
        }

        // Start typing after reveal animation
        setTimeout(typeLoop, 1200);
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

    // ── Contact form with Formspree AJAX ──
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-submit');
            const span = btn.querySelector('span');
            const origText = span.textContent;

            const formData = new FormData(form);
            
            try {
                btn.disabled = true;
                span.textContent = 'Sending...';

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    span.textContent = 'Sent! ✓';
                    btn.style.opacity = '0.7';
                    form.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        span.textContent = data.errors.map(error => error.message).join(", ");
                    } else {
                        throw new Error('Form submission failed');
                    }
                }
            } catch (error) {
                console.error('Submission error:', error);
                span.textContent = 'Error! ✗';
            } finally {
                setTimeout(() => {
                    span.textContent = origText;
                    btn.style.opacity = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // ── Magnetic effect on social links (desktop only) ──
    if (!isTouchDevice) {
        document.querySelectorAll('.social-link').forEach((link) => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                link.style.transform = `translateY(-3px) translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }

    // ── Curated Projects + GitHub Repos ──
    const CURATED_PROJECTS = [
        {
            name: 'Net Duel — Puzzle Game',
            description: 'A Java Swing network puzzle game with DFS maze generation, BFS connectivity, greedy CPU AI, and a Human vs Computer duel mode.',
            tags: ['Java', 'Swing', 'Graph Algorithms', 'AI'],
            url: 'https://github.com/12vicky08/dSA'
        },
        {
            name: 'WSN Routing Optimizer',
            description: 'NS-3 simulation data pipeline analyzing wireless sensor network routing algorithms with Pandas, Seaborn visualization, and energy metrics.',
            tags: ['Python', 'NS-3', 'Pandas', 'Data Viz'],
            url: 'https://github.com/12vicky08/wsn-routing-optimizer'
        },
        {
            name: 'ZenHeal — Healthcare UI',
            description: 'A user interface design project for a healthcare website focused on accessibility, clean design, and patient-centric navigation.',
            tags: ['HTML', 'CSS', 'UI/UX'],
            url: 'https://github.com/12vicky08/ZenHeal-team11'
        },
        {
            name: 'Weather Analysis Dashboard',
            description: 'An algorithm-driven weather analysis dashboard built with segment trees for efficient range queries and data visualization.',
            tags: ['Python', 'Segment Trees', 'Algorithms'],
            url: 'https://github.com/12vicky08/weather-analysis-dashboard'
        },

        {
            name: 'Django Todo App',
            description: 'A full-stack Django to-do application with SQLite database, admin interface, Docker containerization, and Gunicorn/WhiteNoise serving.',
            tags: ['Python', 'Django', 'Docker', 'SQLite'],
            url: 'https://github.com/12vicky08/django'
        }
    ];

    function renderProjectCard(container, { name, description, tags, url }, index) {
        const card = document.createElement('article');
        card.className = 'project-card reveal';
        card.style.transitionDelay = `${0.05 + index * 0.07}s`;

        const tagsHtml = tags.map(t => `<span>${t}</span>`).join('');

        card.innerHTML = `
            <div class="project-scanline"></div>
            <div class="project-info">
                <h3>${name}</h3>
                <p>${description}</p>
                <div class="project-tags">
                    ${tagsHtml}
                </div>
                <a href="${url}" target="_blank" class="project-execute-btn">
                    [EXECUTE <span class="arrow">→</span>]
                </a>
            </div>
        `;

        container.appendChild(card);
    }

    async function loadProjects() {
        const container = document.getElementById('projects-container');
        const loading = document.getElementById('projects-loading');

        // Remove loading message
        if (loading) loading.remove();

        // 1. Render curated projects first
        CURATED_PROJECTS.forEach((proj, i) => renderProjectCard(container, proj, i));

        // 2. Fetch remaining GitHub repos and append any not already curated
        const curatedUrls = new Set(CURATED_PROJECTS.map(p => p.url.toLowerCase()));
        const HIDDEN_REPOS = new Set(['portfolio', '12vicky08', 'expos']);

        try {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
            );

            if (response.ok) {
                const repos = await response.json();

                repos.forEach((repo, idx) => {
                    // Skip if already in curated list or hidden
                    if (curatedUrls.has(repo.html_url.toLowerCase())) return;
                    if (HIDDEN_REPOS.has(repo.name.toLowerCase())) return;

                    const description = repo.description || 'No description available.';
                    const language = repo.language || '';
                    const topics = repo.topics || [];

                    const tags = [];
                    if (language) tags.push(language);
                    topics.forEach(t => {
                        if (t.toLowerCase() !== language.toLowerCase()) tags.push(t);
                    });

                    const displayName = repo.name
                        .replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());

                    renderProjectCard(container, {
                        name: displayName,
                        description,
                        tags: tags.slice(0, 4),
                        url: repo.html_url
                    }, CURATED_PROJECTS.length + idx);
                });
            }
        } catch (error) {
            console.error('Failed to fetch GitHub repos:', error);
        }

        // Update the "Projects" stat counter
        const totalCards = container.querySelectorAll('.project-card').length;
        const projectStat = document.querySelector('.stat-number[data-count]');
        if (projectStat && projectStat.closest('.stat')) {
            const label = projectStat.closest('.stat').querySelector('.stat-label');
            if (label && label.textContent.trim() === 'Projects') {
                projectStat.dataset.count = totalCards;
                projectStat.textContent = totalCards;
            }
        }

        // Re-init reveal observer & tilt for new cards
        initRevealObserver();
        initTiltEffect();
    }

    // Load projects on page load
    loadProjects();

})();