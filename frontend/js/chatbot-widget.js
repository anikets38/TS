// ================================
// AI CHATBOT WIDGET
// ================================

let chatbotOpen = false;
let chatbotHistory = [];
let userCareMode = null;

// Initialize chatbot widget
function initChatbotWidget() {
    // Create chatbot HTML
    const chatbotHTML = `
        <!-- Chatbot Button -->
        <div class="chatbot-button" id="chatbotButton" onclick="toggleChatbot()">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 13.83 2.58 15.52 3.58 16.92L2.05 21.95L7.08 20.42C8.48 21.42 10.17 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
                <circle cx="8" cy="12" r="1.5" fill="white"/>
                <circle cx="12" cy="12" r="1.5" fill="white"/>
                <circle cx="16" cy="12" r="1.5" fill="white"/>
            </svg>
            <span class="chatbot-badge" id="chatbotBadge">AI</span>
        </div>

        <!-- Chatbot Window -->
        <div class="chatbot-window" id="chatbotWindow">
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">🤖</div>
                    <div class="chatbot-title">
                        <h4>TinyStep AI Assistant</h4>
                        <p class="chatbot-status">
                            <span class="status-dot"></span>
                            <span id="chatbotMode">Ready to help</span>
                        </p>
                    </div>
                </div>
                <button class="chatbot-close" onclick="toggleChatbot()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>

            <div class="chatbot-messages" id="chatbotMessages">
                <div class="chatbot-welcome">
                    <div class="welcome-icon">👋</div>
                    <h3>Hello! I'm your AI assistant</h3>
                    <p>I can help you with questions about your current stage and provide personalized guidance.</p>
                    <div class="quick-questions">
                        <button class="quick-btn" onclick="sendQuickQuestion('What should I know about my current stage?')">
                            📚 Current Stage Info
                        </button>
                        <button class="quick-btn" onclick="sendQuickQuestion('What are the important milestones?')">
                            🎯 Milestones
                        </button>
                        <button class="quick-btn" onclick="sendQuickQuestion('Give me health tips')">
                            💚 Health Tips
                        </button>
                    </div>
                </div>
            </div>

            <div class="chatbot-input-container">
                <textarea 
                    class="chatbot-input" 
                    id="chatbotInput" 
                    placeholder="Ask me anything..."
                    rows="1"
                ></textarea>
                <button class="chatbot-send" id="chatbotSend" onclick="sendChatbotMessage()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Setup event listeners
    setupChatbotListeners();
    
    // Load user care mode
    loadUserCareMode();
}

// Setup event listeners
function setupChatbotListeners() {
    const input = document.getElementById('chatbotInput');
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    
    // Send on Enter (Shift+Enter for new line)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatbotMessage();
        }
    });
}

// Load user care mode for context
async function loadUserCareMode() {
    try {
        const response = await apiCall('/auth/me', 'GET');
        if (response.success) {
            userCareMode = response.data.careMode;
            updateChatbotMode(userCareMode);
        }
    } catch (error) {
        console.error('Error loading care mode:', error);
    }
}

// Update chatbot mode display
function updateChatbotMode(mode) {
    const modeText = {
        'planning': '🌸 Planning Mode',
        'pregnancy': '🤰 Pregnancy Mode',
        'baby-care': '👶 Baby Care Mode'
    };
    
    const modeElement = document.getElementById('chatbotMode');
    if (modeElement) {
        modeElement.textContent = modeText[mode] || 'General Mode';
    }
}

// Toggle chatbot
function toggleChatbot() {
    chatbotOpen = !chatbotOpen;
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotButton = document.getElementById('chatbotButton');
    
    if (chatbotOpen) {
        chatbotWindow.classList.add('open');
        chatbotButton.classList.add('active');
    } else {
        chatbotWindow.classList.remove('open');
        chatbotButton.classList.remove('active');
    }
}

// Send quick question
function sendQuickQuestion(question) {
    document.getElementById('chatbotInput').value = question;
    sendChatbotMessage();
}

// Send message
async function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to UI
    addChatbotMessage('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    showChatbotTyping();
    
    try {
        // Prepare context
        const context = {
            careMode: userCareMode,
            timestamp: new Date().toISOString()
        };
        
        // Call AI API
        const response = await apiCall('/ai/chat', 'POST', {
            message: message,
            context: context,
            conversationHistory: chatbotHistory.slice(-10) // Last 10 messages for context
        });
        
        // Remove typing indicator
        removeChatbotTyping();
        
        if (response.success && response.data.response) {
            addChatbotMessage('assistant', response.data.response);
            
            // Update conversation history
            chatbotHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response.data.response }
            );
        } else {
            addChatbotMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
        }
        
    } catch (error) {
        console.error('Chatbot error:', error);
        removeChatbotTyping();
        addChatbotMessage('assistant', 'I\'m having trouble connecting right now. Please try again in a moment.');
    }
}

// Add message to UI
function addChatbotMessage(role, content) {
    const messagesContainer = document.getElementById('chatbotMessages');
    
    // Remove welcome message if exists
    const welcome = messagesContainer.querySelector('.chatbot-welcome');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${role}-message`;
    
    if (role === 'assistant') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">${content}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-bubble">${content}</div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showChatbotTyping() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message assistant-message typing-indicator';
    typingDiv.id = 'chatbotTyping';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeChatbotTyping() {
    const typing = document.getElementById('chatbotTyping');
    if (typing) typing.remove();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotWidget);
} else {
    initChatbotWidget();
}
