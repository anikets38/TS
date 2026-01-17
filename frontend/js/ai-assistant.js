// ================================
// AI ASSISTANT PAGE SCRIPT
// ================================

let currentBabyId = null;
let conversationHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    loadBabies();
    
    // Auto-resize textarea
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    // Send on Enter (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

// Load babies
async function loadBabies() {
    try {
        const response = await apiCall('/baby', 'GET');
        
        if (response.success && response.data.length > 0) {
            const select = document.getElementById('babySelect');
            select.innerHTML = '<option value="">Select a baby...</option>';
            
            response.data.forEach(baby => {
                const option = document.createElement('option');
                option.value = baby._id;
                option.textContent = baby.name;
                select.appendChild(option);
            });
            
            currentBabyId = response.data[0]._id;
            select.value = currentBabyId;
        }
    } catch (error) {
        console.error('Error loading babies:', error);
    }
}

// Handle baby change
function handleBabyChange() {
    const select = document.getElementById('babySelect');
    currentBabyId = select.value;
    
    // Clear conversation when baby changes
    conversationHistory = [];
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="assistant-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>Baby switched! How can I help you with ${select.options[select.selectedIndex].text}?</p>
            </div>
        </div>
    `;
}

// Send message
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!currentBabyId) {
        showToast('Please select a baby first', 'error');
        return;
    }
    
    // Add user message to UI
    addMessageToUI('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    showTyping();
    
    // Send to API
    try {
        const response = await apiCall('/ai/chat', 'POST', {
            babyId: currentBabyId,
            message: message,
            conversationHistory: conversationHistory
        });
        
        if (response.success) {
            // Add assistant response
            hideTyping();
            addMessageToUI('assistant', response.data.response);
            
            // Update conversation history
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response.data.response }
            );
            
            // Keep only last 10 messages
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }
        }
    } catch (error) {
        hideTyping();
        addMessageToUI('assistant', 'Sorry, I encountered an error. Please try again.');
        console.error('Error sending message:', error);
    }
}

// Send quick message
function sendQuickMessage(message) {
    const input = document.getElementById('chatInput');
    input.value = message;
    sendMessage();
}

// Add message to UI
function addMessageToUI(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            ${formatMessageContent(content)}
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format message content (convert markdown-like syntax)
function formatMessageContent(content) {
    // Convert newlines to <br>
    content = content.replace(/\n/g, '<br>');
    
    // Convert **bold**
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic*
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert bullet points
    content = content.replace(/^- (.*?)(<br>|$)/gm, '<li>$1</li>');
    if (content.includes('<li>')) {
        content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    
    return `<p>${content}</p>`;
}

// Show typing indicator
function showTyping() {
    document.getElementById('typingIndicator').style.display = 'flex';
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
    document.getElementById('typingIndicator').style.display = 'none';
}
