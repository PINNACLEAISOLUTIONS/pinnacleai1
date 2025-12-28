// chatbot.js - Phase 6: Inline styles for guaranteed mobile fullscreen
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

    // --- Dynamic Viewport Height ---
    function getViewportHeight() {
        return window.visualViewport ? window.visualViewport.height : window.innerHeight;
    }

    function updateVH() {
        const h = getViewportHeight();
        document.documentElement.style.setProperty('--vhpx', `${h}px`);

        // If chatbot is open on mobile, update the height inline
        if (isMobile() && chatbotContainer.classList.contains('active')) {
            chatbotContainer.style.height = h + 'px';
            chatbotContainer.style.maxHeight = h + 'px';
        }

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

    // --- Apply Mobile Fullscreen Inline Styles ---
    function applyMobileFullscreenStyles() {
        const h = getViewportHeight();

        // Container styles
        chatbotContainer.style.position = 'fixed';
        chatbotContainer.style.top = '0';
        chatbotContainer.style.left = '0';
        chatbotContainer.style.right = '0';
        chatbotContainer.style.bottom = '0';
        chatbotContainer.style.width = '100vw';
        chatbotContainer.style.height = h + 'px';
        chatbotContainer.style.maxHeight = h + 'px';
        chatbotContainer.style.margin = '0';
        chatbotContainer.style.borderRadius = '0';
        chatbotContainer.style.zIndex = '999999';
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.flexDirection = 'column';
        chatbotContainer.style.overflow = 'hidden';
        chatbotContainer.style.boxSizing = 'border-box';
        chatbotContainer.style.paddingTop = 'env(safe-area-inset-top)';
        chatbotContainer.style.paddingBottom = 'env(safe-area-inset-bottom)';
        chatbotContainer.style.transform = 'none';
        chatbotContainer.style.background = '#000';

        // Header styles
        if (chatbotHeader) {
            chatbotHeader.style.flex = '0 0 auto';
            chatbotHeader.style.width = '100%';
        }

        // Iframe styles - wider and shifted left to hide sidebar
        if (chatbotIframe) {
            const SIDEBAR_PX = 280; // typical left sidebar width in the chatbot app

            chatbotIframe.style.border = 'none';
            chatbotIframe.style.display = 'block';
            chatbotIframe.style.padding = '0';
            chatbotIframe.style.height = '100%';
            chatbotIframe.style.minHeight = '0';

            // Key mobile fix: hide the sidebar by shifting the iframe left
            chatbotIframe.style.width = `calc(100% + ${SIDEBAR_PX}px)`;
            chatbotIframe.style.marginLeft = `-${SIDEBAR_PX}px`;

            // Keep layout stable inside flex
            chatbotIframe.style.flex = '1 1 auto';
            chatbotIframe.style.maxWidth = 'none';
        }
    }

    // --- Remove Mobile Inline Styles (reset to CSS control) ---
    function removeMobileInlineStyles() {
        // Container styles
        chatbotContainer.style.position = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.left = '';
        chatbotContainer.style.right = '';
        chatbotContainer.style.bottom = '';
        chatbotContainer.style.width = '';
        chatbotContainer.style.height = '';
        chatbotContainer.style.maxHeight = '';
        chatbotContainer.style.margin = '';
        chatbotContainer.style.borderRadius = '';
        chatbotContainer.style.zIndex = '';
        chatbotContainer.style.display = '';
        chatbotContainer.style.flexDirection = '';
        chatbotContainer.style.overflow = '';
        chatbotContainer.style.boxSizing = '';
        chatbotContainer.style.paddingTop = '';
        chatbotContainer.style.paddingBottom = '';
        chatbotContainer.style.transform = '';
        chatbotContainer.style.background = '';

        // Header styles
        if (chatbotHeader) {
            chatbotHeader.style.flex = '';
            chatbotHeader.style.width = '';
        }

        // Iframe styles
        if (chatbotIframe) {
            chatbotIframe.style.flex = '';
            chatbotIframe.style.width = '';
            chatbotIframe.style.height = '';
            chatbotIframe.style.minHeight = '';
            chatbotIframe.style.border = '';
            chatbotIframe.style.display = '';
            chatbotIframe.style.margin = '';
            chatbotIframe.style.marginLeft = '';
            chatbotIframe.style.padding = '';
            chatbotIframe.style.maxWidth = '';
        }
    }

    // Toggle Chatbot
    chatbotToggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const becomingActive = !chatbotContainer.classList.contains('active');

        if (becomingActive) {
            // Move to body on mobile to escape clipping
            if (isMobile() && chatbotContainer.parentElement !== document.body) {
                document.body.appendChild(chatbotContainer);
            }

            chatbotContainer.classList.add('active');

            if (isMobile()) {
                // Add chatbot-open class to html and body
                document.documentElement.classList.add('chatbot-open');
                document.body.classList.add('chatbot-open');

                // Apply inline styles for guaranteed fullscreen
                applyMobileFullscreenStyles();

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

        // Remove chatbot-open class from html and body
        document.documentElement.classList.remove('chatbot-open');
        document.body.classList.remove('chatbot-open');

        // Remove inline styles so desktop CSS takes over
        removeMobileInlineStyles();

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
