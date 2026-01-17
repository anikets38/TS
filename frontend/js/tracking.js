// ================================
// TRACKING PAGE SCRIPT
// ================================

let currentBabyId = null;
let trackingUpdateInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    loadBabies();
    setDefaultTimes();
    
    // Start live time updates
    startLiveTimeUpdates();
});

// Start interval for live time updates
function startLiveTimeUpdates() {
    // Update every minute
    trackingUpdateInterval = setInterval(() => {
        updateLogTimes();
    }, 60000);
}

// Update all log times in real-time
function updateLogTimes() {
    const logTimes = document.querySelectorAll('.log-time');
    logTimes.forEach(timeElement => {
        const timestamp = timeElement.dataset.timestamp;
        if (timestamp) {
            timeElement.textContent = formatTimeAgo(timestamp);
        }
    });
}

// Format time ago helper for tracking page
function formatTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

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
            loadTrackingData();
        }
    } catch (error) {
        console.error('Error loading babies:', error);
    }
}

// Set default times to now
function setDefaultTimes() {
    const now = new Date();
    const datetime = now.toISOString().slice(0, 16);
    
    document.getElementById('feedingTime').value = datetime;
    document.getElementById('sleepStart').value = datetime;
    document.getElementById('sleepEnd').value = datetime;
}

// Switch tab
function switchTab(tab) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab button
    const tabButton = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }
    
    // Add active class to selected tab content
    const tabContent = document.getElementById(`${tab}Tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    } else {
        console.error(`Tab content element not found: ${tab}Tab`);
    }
}

// Load tracking data
async function loadTrackingData() {
    const select = document.getElementById('babySelect');
    currentBabyId = select.value;
    
    if (!currentBabyId) return;
    
    loadFeedingLogs();
    loadSleepLogs();
}

// Load feeding logs
async function loadFeedingLogs() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await apiCall(
            `/tracking/feeding/${currentBabyId}?startDate=${today}&endDate=${today}`, 
            'GET'
        );
        
        const list = document.getElementById('feedingLogsList');
        const countBadge = document.getElementById('feedingCount');
        
        if (response.success && response.data.length > 0) {
            countBadge.textContent = response.data.length;
            list.innerHTML = '';
            
            response.data.forEach(log => {
                const item = document.createElement('div');
                item.className = 'log-item';
                item.innerHTML = `
                    <div class="log-info">
                        <div class="log-type">${log.type}</div>
                        <div class="log-time" data-timestamp="${log.time}">${formatTimeAgo(log.time)}</div>
                        <div class="log-details">
                            ${log.quantity ? `${log.quantity}ml` : ''}
                            ${log.duration ? `• ${log.duration} min` : ''}
                            ${log.notes ? `<br><small>${log.notes}</small>` : ''}
                        </div>
                    </div>
                    <div class="log-actions">
                        <button onclick="deleteLog('feeding', '${log._id}')">Delete</button>
                    </div>
                `;
                list.appendChild(item);
            });
        } else {
            countBadge.textContent = '0';
            list.innerHTML = '<p class="empty-message">No feeding logs yet</p>';
        }
    } catch (error) {
        console.error('Error loading feeding logs:', error);
    }
}

// Load sleep logs
async function loadSleepLogs() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await apiCall(
            `/tracking/sleep/${currentBabyId}?startDate=${today}&endDate=${today}`, 
            'GET'
        );
        
        const list = document.getElementById('sleepLogsList');
        const hoursBadge = document.getElementById('sleepHours');
        
        if (response.success && response.data.length > 0) {
            const totalHours = response.data.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;
            hoursBadge.textContent = `${totalHours.toFixed(1)}h`;
            list.innerHTML = '';
            
            response.data.forEach(log => {
                const duration = Math.round((log.duration || 0) / 60 * 10) / 10;
                const item = document.createElement('div');
                item.className = 'log-item';
                item.innerHTML = `
                    <div class="log-info">
                        <div class="log-type">Sleep Session</div>
                        <div class="log-time" data-timestamp="${log.startTime}">${formatTimeAgo(log.startTime)}</div>
                        <div class="log-details">
                            Duration: ${duration}h
                            ${log.quality ? `• Quality: ${log.quality}` : ''}
                            ${log.notes ? `<br><small>${log.notes}</small>` : ''}
                        </div>
                    </div>
                    <div class="log-actions">
                        <button onclick="deleteLog('sleep', '${log._id}')">Delete</button>
                    </div>
                `;
                list.appendChild(item);
            });
        } else {
            hoursBadge.textContent = '0h';
            list.innerHTML = '<p class="empty-message">No sleep logs yet</p>';
        }
    } catch (error) {
        console.error('Error loading sleep logs:', error);
    }
}

// Feeding form submission
const feedingForm = document.getElementById('feedingForm');
if (feedingForm) {
    feedingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentBabyId) {
            showToast('Please select a baby first', 'error');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        showLoading(submitBtn);
        
        const data = {
            baby: currentBabyId,
            type: document.getElementById('feedingType').value,
            time: document.getElementById('feedingTime').value,
            quantity: parseInt(document.getElementById('feedingQuantity').value) || null,
            duration: parseInt(document.getElementById('feedingDuration').value) || null,
            notes: document.getElementById('feedingNotes').value
        };
        
        try {
            const response = await apiCall('/tracking/feeding', 'POST', data);
            
            if (response.success) {
                showToast('Feeding logged successfully!', 'success');
                e.target.reset();
                setDefaultTimes();
                loadFeedingLogs();
            }
        } catch (error) {
            showToast(error.message || 'Error logging feeding', 'error');
        } finally {
            hideLoading(submitBtn);
        }
    });
}

// Sleep form submission
const sleepForm = document.getElementById('sleepForm');
if (sleepForm) {
    sleepForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentBabyId) {
            showToast('Please select a baby first', 'error');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        showLoading(submitBtn);
        
        const data = {
            baby: currentBabyId,
            startTime: document.getElementById('sleepStart').value,
            endTime: document.getElementById('sleepEnd').value,
            quality: document.getElementById('sleepQuality').value,
            notes: document.getElementById('sleepNotes').value
        };
        
        try {
            const response = await apiCall('/tracking/sleep', 'POST', data);
            
            if (response.success) {
                showToast('Sleep logged successfully!', 'success');
                e.target.reset();
                setDefaultTimes();
                loadSleepLogs();
            }
        } catch (error) {
            showToast(error.message || 'Error logging sleep', 'error');
        } finally {
            hideLoading(submitBtn);
        }
    });
}

// Delete log
async function deleteLog(type, logId) {
    if (!confirm('Are you sure you want to delete this log?')) return;
    
    try {
        const response = await apiCall(`/tracking/${type}/${logId}`, 'DELETE');
        
        if (response.success) {
            showToast('Log deleted successfully', 'success');
            if (type === 'feeding') {
                loadFeedingLogs();
            } else {
                loadSleepLogs();
            }
        }
    } catch (error) {
        showToast('Error deleting log', 'error');
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (trackingUpdateInterval) {
        clearInterval(trackingUpdateInterval);
    }
});

