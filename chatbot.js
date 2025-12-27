// chatbot.js
document.addEventListener('DOMContentLoaded', function () {
    console.log('Chatbot script loaded');

    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');

    // --- Dynamic Viewport Height for Mobile ---
    function updateVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // Debug option (set localStorage.getItem('chatbot_debug') === 'true' to enable)
        if (localStorage.getItem('chatbot_debug') === 'true') {
            console.log('--- Chatbot Debug Info ---');
            console.log('window.innerHeight:', window.innerHeight);
            if (window.visualViewport) {
                console.log('visualViewport.height:', window.visualViewport.height);
                console.log('visualViewport.offsetTop:', window.visualViewport.offsetTop);
            }
            console.log('--vh (px):', `${vh}px`);
            console.log('Computed Overlay Height:', vh * 100);
            console.log('--------------------------');
        }
    }

    updateVH();
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVH);
    }

    if (!chatbotToggleBtn || !chatbotContainer) {
        console.error('Chatbot elements not found');
        return;
    }

    const isMobile = () => window.innerWidth < 768;

    // Toggle Chatbot
    chatbotToggleBtn.addEventListener('click', function (e) {
        console.log('Chatbot toggle clicked');
        e.preventDefault();
        chatbotContainer.classList.toggle('active');

        // Body scroll lock on mobile
        if (chatbotContainer.classList.contains('active')) {
            if (isMobile()) {
                document.body.style.overflow = 'hidden';
                document.body.style.touchAction = 'none';
            }
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        // Accessibility
        const isVisible = chatbotContainer.classList.contains('active');
        chatbotToggleBtn.setAttribute('aria-expanded', isVisible);
    });

    // Close Chatbot
    if (chatbotCloseBtn) {
        chatbotCloseBtn.addEventListener('click', function (e) {
            console.log('Chatbot close clicked');
            e.preventDefault();
            chatbotContainer.classList.remove('active');
            chatbotToggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        });
    }

    // Close on click outside (Desktop only)
    document.addEventListener('click', function (e) {
        if (!isMobile() &&
            chatbotContainer.classList.contains('active') &&
            !chatbotContainer.contains(e.target) &&
            !chatbotToggleBtn.contains(e.target)) {
            chatbotContainer.classList.remove('active');
            chatbotToggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
    });
});
