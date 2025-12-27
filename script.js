// script.js
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.close-mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link'); // Desktop links
    const mobileLinks = document.querySelectorAll('.nav-link-mobile'); // Mobile links
    const sections = document.querySelectorAll('section'); // All sections for active link highlighting

    // --- Mobile Menu Toggle ---
    function openMenu() {
        if (mobileMenu && hamburger) {
            mobileMenu.classList.add('active');
            hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    function closeMenu() {
        if (mobileMenu && hamburger) {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (hamburger) hamburger.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                closeMenu();
            } else {
                closeMenu();
            }
        });
    });

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });
    }

    // --- ActiveNavbar Link Highlighting ---
    function updateActiveNavLink() {
        let currentActiveSectionId = '';
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 20;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentActiveSectionId = section.id;
            }
        });

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2 && sections.length > 0) {
             currentActiveSectionId = sections[sections.length - 1].id;
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.includes(currentActiveSectionId) && currentActiveSectionId !== '') {
                link.classList.add('active');
            }
        });

        if (currentActiveSectionId === '' && sections.length > 0 && window.scrollY < sections[0]?.offsetTop - navbarHeight - 20) {
            navLinks.forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('.nav-link[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        } else if (currentActiveSectionId === '' && sections.length === 0) {
            const homeLink = document.querySelector('.nav-link[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();

    // --- Scroll-Triggered Animations (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (typeof IntersectionObserver !== 'undefined') {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);
        animatedElements.forEach(element => observer.observe(element));
    } else {
        animatedElements.forEach(element => element.classList.add('is-visible'));
    }

    // --- Smooth Scroll for internal links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('btn-primary-hero') && !anchor.classList.contains('btn-outline-hero') && !anchor.closest('.mobile-menu-overlay')) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // --- Number Counter for Stats ---
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    if (counters.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const animateCount = () => {
                        const target = +counter.dataset.target;
                        let count = +counter.innerText.replace(/[+%]/g, '');
                        const increment = target / speed;

                        if (count < target) {
                            count += increment;
                            counter.innerText = Math.ceil(count) + (counter.dataset.suffix || '');
                            requestAnimationFrame(animateCount);
                        } else {
                            counter.innerText = target + (counter.dataset.suffix || '');
                        }
                    };

                    if (!counter.dataset.target) {
                        const text = counter.innerText;
                        if (text.includes('+')) {
                            counter.dataset.target = text.replace('+', '');
                            counter.dataset.suffix = '+';
                        } else if (text.includes('%')) {
                            counter.dataset.target = text.replace('%', '');
                            counter.dataset.suffix = '%';
                        } else {
                            counter.dataset.target = text;
                            counter.dataset.suffix = '';
                        }
                        counter.innerText = '0' + (counter.dataset.suffix || '');
                    }
                    animateCount();
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.7 });
        counters.forEach(counter => counterObserver.observe(counter));
    }

    // GSAP AI Logo Animation
    if (typeof gsap !== 'undefined' && document.getElementById('mainSVG')) {
        gsap.set("#mainSVG", { visibility: "visible" });
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, repeat: -1, yoyo: true });
        tl.to("#ai", { duration: 2, morphSVG: "M50 20 C20 20, 20 80, 50 80 S80 80, 80 20 Z" })
          .to(".ell", { duration: 1, scale: 1.2, transformOrigin: "50% 50%", stagger: 0.1 }, "-=1.5")
          .to("#ai", { duration: 1.5, strokeDasharray: "20 10", strokeDashoffset: 30 }, "-=1")
          .to("#mainSVG", { duration: 1, rotation: 360, transformOrigin: "50% 50%" }, "-=0.5");
    }

    // --- Initialize Contact Section CodePen Background ---
    if (typeof initContactBackgroundShader === 'function') {
        initContactBackgroundShader();
    } else {
        console.error("initContactBackgroundShader function not found. Ensure the CodePen JS is embedded in the HTML and loaded correctly before script.js.");
    }

    // --- Chatbot Toggle Logic ---
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');

    if (chatbotToggleBtn && chatbotContainer) {
        chatbotToggleBtn.addEventListener('click', () => {
            chatbotContainer.classList.toggle('active');
            // Optional: Toggle icon or animation
        });
    }

    if (chatbotCloseBtn && chatbotContainer) {
        chatbotCloseBtn.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
        });
    }
});
