// ================================
// AI HELPER - SHARED FUNCTIONS
// ================================

let currentAIMode = 'general';
let currentBabyId = null;

// AI Mode Configurations
const AI_MODES = {
    tracking: {
        title: '🤖 Tracking AI Assistant',
        welcome: 'Hi! I can help you with feeding schedules, sleep patterns, and activity tracking. What would you like to know?',
        icon: '🤖'
    },
    vaccination: {
        title: '💉 Vaccination AI Assistant',
        welcome: 'Hi! I can help you with vaccination schedules, reminders, side effects, and vaccination records. What would you like to know?',
        icon: '💉'
    },
    nutrition: {
        title: '🍎 Nutrition AI Assistant',
        welcome: 'Hi! I can provide age-appropriate food recommendations, meal planning, and nutrition guidance. What would you like to know?',
        icon: '🍎'
    },
    health: {
        title: '🏥 Health AI Assistant',
        welcome: 'Hi! I can provide information about common infant health conditions. Remember: For medical emergencies or serious concerns, always consult your pediatrician. What would you like to know?',
        icon: '🏥'
    },
    general: {
        title: '🤖 AI Assistant',
        welcome: 'Hi! I\'m here to help with all your parenting questions. What would you like to know?',
        icon: '🤖'
    }
};

// Open AI Modal
function openAIModal(mode, babyId = null) {
    currentAIMode = mode || 'general';
    if (babyId) currentBabyId = babyId;
    
    const modal = document.getElementById('aiModal');
    if (!modal) {
        console.error('AI Modal not found');
        return;
    }
    
    const config = AI_MODES[currentAIMode] || AI_MODES.general;
    
    // Update modal title
    const title = modal.querySelector('.modal-header h3');
    if (title) title.textContent = config.title;
    
    // Reset chat messages
    const chatMessages = modal.querySelector('#aiChatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="ai-message assistant">
                <div class="ai-avatar">${config.icon}</div>
                <div class="ai-content">
                    <p>${config.welcome}</p>
                </div>
            </div>
        `;
    }
    
    modal.classList.add('active');
    const input = modal.querySelector('#aiInput');
    if (input) input.focus();
}

// Close AI Modal
function closeAIModal() {
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Ask AI (convenience function)
function askAI(mode) {
    // Get current baby ID from page
    const babySelect = document.getElementById('babySelect');
    const babyId = babySelect ? babySelect.value : null;
    
    if (!babyId) {
        showToast('Please select a baby first', 'error');
        return;
    }
    
    openAIModal(mode, babyId);
}

// Send AI Message
async function sendAIMessage() {
    const modal = document.getElementById('aiModal');
    const input = modal.querySelector('#aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!currentBabyId) {
        const babySelect = document.getElementById('babySelect');
        currentBabyId = babySelect ? babySelect.value : null;
        
        if (!currentBabyId) {
            showToast('Please select a baby first', 'error');
            return;
        }
    }
    
    // Add user message
    addAIMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    showAITyping();
    
    try {
        const response = await apiCall('/ai/chat', 'POST', {
            message: message,
            babyId: currentBabyId,
            mode: currentAIMode
        });
        
        removeAITyping();
        
        if (response.success) {
            addAIMessage('assistant', response.data.message);
        } else {
            addAIMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    } catch (error) {
        console.error('AI error:', error);
        removeAITyping();
        addAIMessage('assistant', 'Sorry, I\'m having trouble connecting. Please try again later.');
    }
}

// Add AI Message to Chat
function addAIMessage(type, message) {
    const chatMessages = document.getElementById('aiChatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type}`;
    
    const config = AI_MODES[currentAIMode] || AI_MODES.general;
    
    if (type === 'assistant') {
        messageDiv.innerHTML = `
            <div class="ai-avatar">${config.icon}</div>
            <div class="ai-content">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="ai-content">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show Typing Indicator
function showAITyping() {
    const chatMessages = document.getElementById('aiChatMessages');
    if (!chatMessages) return;
    
    const config = AI_MODES[currentAIMode] || AI_MODES.general;
    
    const typing = document.createElement('div');
    typing.id = 'aiTyping';
    typing.className = 'ai-message assistant';
    typing.innerHTML = `
        <div class="ai-avatar">${config.icon}</div>
        <div class="ai-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove Typing Indicator
function removeAITyping() {
    const typing = document.getElementById('aiTyping');
    if (typing) typing.remove();
}

// Initialize AI Modal Events
function initAIModal() {
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        // Auto-resize textarea
        aiInput.addEventListener('input', () => {
            aiInput.style.height = 'auto';
            aiInput.style.height = Math.min(aiInput.scrollHeight, 150) + 'px';
        });
        
        // Enter to send (Shift+Enter for new line)
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });
    }
    
    // Close modal on outside click
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAIModal();
            }
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initAIModal();
});
