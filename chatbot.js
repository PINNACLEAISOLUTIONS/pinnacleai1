// chatbot.js
document.addEventListener('DOMContentLoaded', function () {
    console.log('Chatbot script loaded');

    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');

    if (!chatbotToggleBtn || !chatbotContainer) {
        console.error('Chatbot elements not found');
        return;
    }

    const isMobile = () => window.innerWidth < 768;

    // --- Dynamic Viewport Height (Phase 3: VisualViewport) ---
    function updateVH() {
        const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--vhpx', `${h}px`);

        // Update debug overlay if active
        const debugOverlay = document.getElementById('chatbot-mobile-debug');
        if (debugOverlay && localStorage.getItem('chatbot_debug') === 'true') {
            const overlayRect = chatbotContainer.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(chatbotContainer);
            debugOverlay.innerHTML = `
                win.size: ${window.innerWidth}x${window.innerHeight}<br>
                vv.size: ${window.visualViewport ? Math.round(window.visualViewport.width) + 'x' + Math.round(window.visualViewport.height) : 'N/A'}<br>
                --vhpx: ${h}px<br>
                container: ${Math.round(overlayRect.width)}x${Math.round(overlayRect.height)}<br>
                pos: ${computedStyle.position}, top: ${computedStyle.top}, bot: ${computedStyle.bottom}<br>
                transform: ${computedStyle.transform !== 'none' ? 'ACTIVE' : 'none'}
            `;
        }
    }

    // Initialize Debug Overlay on Mobile
    if (isMobile()) {
        let debugOverlay = document.getElementById('chatbot-mobile-debug');
        if (!debugOverlay) {
            debugOverlay = document.createElement('div');
            debugOverlay.id = 'chatbot-mobile-debug';
            document.body.appendChild(debugOverlay);
        }
        if (localStorage.getItem('chatbot_debug') === 'true') {
            document.body.classList.add('chatbot-debug-active');
        }
    }

    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVH);
        window.visualViewport.addEventListener('scroll', updateVH);
    }
    updateVH();

    // Toggle Chatbot
    chatbotToggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const becomingActive = !chatbotContainer.classList.contains('active');

        if (becomingActive) {
            // PHASE 3: Move to body on mobile to escape clipping
            if (isMobile() && chatbotContainer.parentElement !== document.body) {
                document.body.appendChild(chatbotContainer);
            }

            chatbotContainer.classList.add('active');

            if (isMobile()) {
                document.body.style.overflow = 'hidden';
                document.body.style.touchAction = 'none';
                updateVH();
                // Safari keyboard fix: scroll to top
                window.scrollTo(0, 0);
            }
        } else {
            closeChatbot();
        }

        chatbotToggleBtn.setAttribute('aria-expanded', becomingActive);
    });

    function closeChatbot() {
        chatbotContainer.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        chatbotToggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (chatbotCloseBtn) {
        chatbotCloseBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeChatbot();
        });
    }

    // Desktop: Close on click outside
    document.addEventListener('click', function (e) {
        if (!isMobile() &&
            chatbotContainer.classList.contains('active') &&
            !chatbotContainer.contains(e.target) &&
            !chatbotToggleBtn.contains(e.target)) {
            closeChatbot();
        }
    });
});
