// chatbot.js
document.addEventListener('DOMContentLoaded', function () {
    console.log('Chatbot script loaded');

    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');

    if (!chatbotToggleBtn) {
        console.error('Chatbot toggle button not found');
        return;
    }

    if (!chatbotContainer) {
        console.error('Chatbot container not found');
        return;
    }

    // Toggle Chatbot
    chatbotToggleBtn.addEventListener('click', function (e) {
        console.log('Chatbot toggle clicked');
        e.preventDefault();
        chatbotContainer.classList.toggle('active');

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
        });
    }

    // Close on click outside (optional but good UX)
    document.addEventListener('click', function (e) {
        if (chatbotContainer.classList.contains('active') &&
            !chatbotContainer.contains(e.target) &&
            !chatbotToggleBtn.contains(e.target)) {
            chatbotContainer.classList.remove('active');
            chatbotToggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
});
