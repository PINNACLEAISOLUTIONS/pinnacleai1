/* ============================================
   PINNACLE AI SOLUTIONS — UI ENHANCEMENTS JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- 1. PAGE FADE-IN TRANSITION ----
    document.body.classList.add('loaded');

    // Fade out on internal navigation
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        // Only intercept internal page links (not anchors, external, or javascript:)
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
            href.startsWith('http') || href.startsWith('javascript:') || link.target === '_blank') return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 300);
        });
    });

    // ---- 2. SCROLL ANIMATIONS (Intersection Observer) ----
    const enhanceElements = document.querySelectorAll('.enhance-fade-up, .enhance-fade-left, .enhance-fade-right, .enhance-scale-in');
    if (enhanceElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        enhanceElements.forEach(el => scrollObserver.observe(el));
    }

    // ---- 3. BLOG CARD 3D TILT ----
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            // Dynamic glow
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(139,92,246,0.15), transparent 60%)`;
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // ---- 6. STICKY DESKTOP CTA ----
    const stickyCta = document.querySelector('.sticky-cta');
    if (stickyCta) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 600) {
                        stickyCta.classList.add('visible');
                    } else {
                        stickyCta.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ---- 7. MICRO-INTERACTIONS: Button Ripple ----
    document.querySelectorAll('.ripple-btn, .btn-primary, .btn-secondary, .btn-primary-hero, .btn-outline-hero, .sticky-cta-btn').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ---- 8. READING PROGRESS BAR ----
    const progressBar = document.querySelector('.reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / docHeight) * 100;
            progressBar.style.width = Math.min(scrolled, 100) + '%';
        });
    }

    // ---- 9. BACK-TO-TOP BUTTON ----
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---- 10. ANIMATED COUNTERS (enhancement) ----
    document.querySelectorAll('[data-count]').forEach(counter => {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    const suffix = entry.target.dataset.suffix || '';
                    let current = 0;
                    const step = target / 60;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        entry.target.textContent = Math.floor(current) + suffix;
                    }, 16);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        countObserver.observe(counter);
    });
});
