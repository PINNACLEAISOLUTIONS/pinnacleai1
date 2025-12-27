// chatbot.js - Phase 9: Strict mobile-only styles, desktop untouched
document.addEventListener('DOMContentLoaded', function () {
    console.log('Chatbot script loaded');

    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotHeader = chatbotContainer ? chatbotContainer.querySelector('.chatbot-header') : null;
    const chatbotIframe = chatbotContainer ? chatbotContainer.querySelector('iframe') : null;

    if (!chatbotToggleBtn || !chatbotContainer) {
        console.error('Chatbot elements not found');
        return;
    }

    const isMobile = () => window.innerWidth < 768;

    // --- Viewport Height for Mobile ---
    function getTrueViewportHeightPx() {
        if (window.visualViewport) {
            return Math.round(window.visualViewport.height);
        }
        return Math.round(window.innerHeight);
    }

    function updateVH() {
        const h = getTrueViewportHeightPx();
        document.documentElement.style.setProperty('--vhpx', `${h}px`);

        // ONLY update inline height if chatbot is open AND we're on mobile
        if (isMobile() && chatbotContainer.classList.contains('active')) {
            chatbotContainer.style.height = h + 'px';
            chatbotContainer.style.maxHeight = h + 'px';
        }
    }

    // Initialize Debug Overlay on Mobile only
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

    // --- Apply Mobile Fullscreen Inline Styles (ONLY on mobile) ---
    function applyMobileFullscreenStyles() {
        if (!isMobile()) return; // Safety check

        const h = getTrueViewportHeightPx();

        // Container styles for true fullscreen
        chatbotContainer.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: ${h}px !important;
            max-height: ${h}px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            padding-top: env(safe-area-inset-top) !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
            transform: none !important;
            border: none !important;
        `;

        // Header styles
        if (chatbotHeader) {
            chatbotHeader.style.cssText = `
                flex: 0 0 auto !important;
                min-height: 56px !important;
            `;
        }

        // Iframe styles - override inline height="100%"
        if (chatbotIframe) {
            chatbotIframe.style.cssText = `
                flex: 1 1 auto !important;
                width: 100% !important;
                height: 100% !important;
                min-height: 0 !important;
                border: none !important;
                display: block !important;
            `;
        }
    }

    // --- Remove ALL inline styles (let CSS take over for desktop) ---
    function removeAllInlineStyles() {
        chatbotContainer.style.cssText = '';
        if (chatbotHeader) {
            chatbotHeader.style.cssText = '';
        }
        if (chatbotIframe) {
            chatbotIframe.style.cssText = '';
        }
    }

    // Toggle Chatbot
    chatbotToggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const becomingActive = !chatbotContainer.classList.contains('active');

        if (becomingActive) {
            chatbotContainer.classList.add('active');

            if (isMobile()) {
                // Move to body on mobile to escape clipping
                if (chatbotContainer.parentElement !== document.body) {
                    document.body.appendChild(chatbotContainer);
                }

                // Add chatbot-open class to html and body
                document.documentElement.classList.add('chatbot-open');
                document.body.classList.add('chatbot-open');

                // Apply inline styles for guaranteed fullscreen
                applyMobileFullscreenStyles();

                // Safari keyboard fix: scroll to top
                window.scrollTo(0, 0);
            }
            // Desktop: No inline styles applied, CSS handles it
        } else {
            closeChatbot();
        }

        chatbotToggleBtn.setAttribute('aria-expanded', becomingActive);
    });

    function closeChatbot() {
        chatbotContainer.classList.remove('active');

        // Remove chatbot-open class from html and body
        document.documentElement.classList.remove('chatbot-open');
        document.body.classList.remove('chatbot-open');

        // Remove ALL inline styles so CSS takes full control
        removeAllInlineStyles();

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
