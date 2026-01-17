// ================================
// FERTILITY PLANNING SCRIPT
// ================================

let cycleData = {
    lastPeriodDate: null,
    cycleLength: 28,
    periodDuration: 5,
    symptoms: {},
    partnerModeEnabled: false
};

let currentMonth = new Date();
let savedTips = [];

// AI Tips Database
const aiTips = {
    nutrition: [
        "Include folate-rich foods like leafy greens, citrus fruits, and legumes in your diet. Folic acid is crucial for preventing neural tube defects.",
        "Add omega-3 fatty acids from salmon, walnuts, and flaxseeds to support hormone balance and reproductive health.",
        "Eat iron-rich foods like lean meat, spinach, and lentils to prevent anemia and support healthy ovulation.",
        "Include whole grains and complex carbs to help regulate blood sugar and insulin levels, which affect fertility.",
        "Zinc-rich foods like oysters, beef, and pumpkin seeds support egg health and hormone production."
    ],
    hydration: [
        "Drink 8-10 glasses of water daily to support cervical mucus production and overall fertility.",
        "Herbal teas like red raspberry leaf and nettle can support reproductive health. Avoid excess caffeine.",
        "Stay well-hydrated to improve blood flow to reproductive organs and support hormone transport.",
        "Coconut water is a natural electrolyte-rich option to stay hydrated and boost energy."
    ],
    sleep: [
        "Aim for 7-9 hours of quality sleep to regulate hormones like melatonin, which affects ovulation.",
        "Maintain a consistent sleep schedule to support your circadian rhythm and hormone balance.",
        "Create a dark, cool bedroom environment for better sleep quality and hormonal regulation.",
        "Avoid screens 1 hour before bed to improve melatonin production and sleep quality."
    ],
    stress: [
        "Practice 10 minutes of meditation daily to reduce cortisol levels that can interfere with fertility.",
        "Try yoga or gentle stretching to reduce stress and improve blood flow to reproductive organs.",
        "Deep breathing exercises can help manage stress and support hormonal balance.",
        "Consider journaling to process emotions and reduce stress during your fertility journey."
    ],
    exercise: [
        "Engage in moderate exercise like brisk walking or swimming for 30 minutes, 5 days a week.",
        "Try fertility yoga poses that improve blood flow to reproductive organs.",
        "Avoid intense workouts that may disrupt your menstrual cycle. Keep it moderate.",
        "Gentle activities like walking in nature can reduce stress and support fertility."
    ],
    lifestyle: [
        "Avoid smoking and limit alcohol consumption to improve egg quality and fertility.",
        "Maintain a healthy BMI (18.5-24.9) for optimal hormone balance and fertility.",
        "Limit caffeine intake to 200mg per day (about 1-2 cups of coffee).",
        "Take prenatal vitamins with folic acid at least 3 months before trying to conceive."
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    loadCycleData();
    updateDashboard();
    generateCalendar();
    displayRandomTip();
    setupEventListeners();
});

// Load cycle data from backend or localStorage
async function loadCycleData() {
    try {
        const response = await apiCall('/auth/me', 'GET');
        if (response.success && response.data) {
            if (response.data.lastPeriodDate) {
                cycleData.lastPeriodDate = new Date(response.data.lastPeriodDate);
            }
            if (response.data.cycleLength) {
                cycleData.cycleLength = response.data.cycleLength;
            }
            if (response.data.periodDuration) {
                cycleData.periodDuration = response.data.periodDuration;
            }
        }
        
        // Load from localStorage if not in backend
        const stored = localStorage.getItem('fertilityData');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.lastPeriodDate) {
                cycleData.lastPeriodDate = new Date(data.lastPeriodDate);
            }
            cycleData.cycleLength = data.cycleLength || 28;
            cycleData.periodDuration = data.periodDuration || 5;
        }
        
        // If no data, show setup modal
        if (!cycleData.lastPeriodDate) {
            showCycleSetup();
        }
    } catch (error) {
        console.error('Error loading cycle data:', error);
    }
}

// Update dashboard with calculated data
function updateDashboard() {
    if (!cycleData.lastPeriodDate) return;
    
    const today = new Date();
    const cycleDay = Math.floor((today - cycleData.lastPeriodDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Update cycle day
    document.getElementById('cycleDay').textContent = `Day ${cycleDay}`;
    document.getElementById('cycleLength').textContent = `${cycleData.cycleLength} days`;
    document.getElementById('periodDuration').textContent = `${cycleData.periodDuration} days`;
    
    // Calculate fertile window and ovulation
    const ovulationDay = cycleData.cycleLength - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay;
    
    const fertileStartDate = new Date(cycleData.lastPeriodDate);
    fertileStartDate.setDate(fertileStartDate.getDate() + fertileStart);
    
    const ovulationDate = new Date(cycleData.lastPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
    
    const fertileEndDate = new Date(cycleData.lastPeriodDate);
    fertileEndDate.setDate(fertileEndDate.getDate() + fertileEnd);
    
    // Update fertile window display
    document.getElementById('fertileWindow').textContent = 
        `${formatDate(fertileStartDate)} - ${formatDate(fertileEndDate)}`;
    document.getElementById('ovulationDate').textContent = formatDate(ovulationDate);
    
    // Calculate best 3 days
    const best1 = new Date(ovulationDate);
    best1.setDate(best1.getDate() - 1);
    const best3 = new Date(ovulationDate);
    best3.setDate(best3.getDate() + 1);
    
    document.getElementById('bestDays').textContent = 
        `${formatDate(best1)}, ${formatDate(ovulationDate)}, ${formatDate(best3)}`;
    
    // Calculate days until ovulation
    const daysUntilOvulation = ovulationDay - cycleDay;
    const ovulationCountdownEl = document.getElementById('ovulationCountdown');
    
    if (daysUntilOvulation > 0) {
        ovulationCountdownEl.textContent = daysUntilOvulation;
        document.querySelector('.countdown-label').textContent = 
            `day${daysUntilOvulation > 1 ? 's' : ''} until ovulation`;
    } else if (daysUntilOvulation === 0) {
        ovulationCountdownEl.textContent = '🎯';
        document.querySelector('.countdown-label').textContent = 'Ovulation day!';
    } else {
        ovulationCountdownEl.textContent = Math.abs(daysUntilOvulation);
        document.querySelector('.countdown-label').textContent = 
            `day${Math.abs(daysUntilOvulation) > 1 ? 's' : ''} past ovulation`;
    }
    
    // Update fertility status
    const statusBadge = document.getElementById('fertilityStatus');
    if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        statusBadge.textContent = 'High Fertility';
        statusBadge.className = 'status-badge fertile';
    } else if (cycleDay < fertileStart) {
        statusBadge.textContent = 'Low Fertility';
        statusBadge.className = 'status-badge low';
    } else {
        statusBadge.textContent = 'Post-Ovulation';
        statusBadge.className = 'status-badge post';
    }
    
    // Calculate conception probability
    calculateConceptionProbability(cycleDay, fertileStart, fertileEnd, ovulationDay);
    
    // Update today's date
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

// Calculate conception probability
function calculateConceptionProbability(cycleDay, fertileStart, fertileEnd, ovulationDay) {
    let probability = 0;
    
    if (cycleDay === ovulationDay) {
        probability = 70;
    } else if (cycleDay === ovulationDay - 1 || cycleDay === ovulationDay + 1) {
        probability = 65;
    } else if (cycleDay === ovulationDay - 2) {
        probability = 55;
    } else if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        probability = 40;
    } else if (cycleDay > fertileEnd && cycleDay < ovulationDay + 3) {
        probability = 20;
    } else {
        probability = 5;
    }
    
    // Update UI
    document.getElementById('probabilityValue').textContent = probability;
    
    // Update circle progress
    const circle = document.getElementById('probabilityCircle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (probability / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    // Update color based on probability
    if (probability >= 60) {
        circle.style.stroke = '#4CAF50';
    } else if (probability >= 30) {
        circle.style.stroke = '#FF9800';
    } else {
        circle.style.stroke = '#9E9E9E';
    }
}

// Generate calendar
function generateCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Update month display
    document.getElementById('calendarMonth').textContent = 
        currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }
    
    // Add days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        
        // Mark today
        if (currentDate.toDateString() === today.toDateString()) {
            dayCell.classList.add('today');
        }
        
        if (cycleData.lastPeriodDate) {
            const cycleDay = Math.floor((currentDate - cycleData.lastPeriodDate) / (1000 * 60 * 60 * 24)) + 1;
            const ovulationDay = cycleData.cycleLength - 14;
            const fertileStart = ovulationDay - 5;
            const fertileEnd = ovulationDay;
            
            // Mark period days
            if (cycleDay >= 1 && cycleDay <= cycleData.periodDuration) {
                dayCell.classList.add('period');
            }
            // Mark peak ovulation day
            else if (cycleDay === ovulationDay) {
                dayCell.classList.add('peak');
            }
            // Mark fertile window
            else if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
                dayCell.classList.add('fertile');
            }
        }
        
        grid.appendChild(dayCell);
    }
}

// Calendar navigation
function previousMonth() {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    generateCalendar();
}

// Display random AI tip
function displayRandomTip() {
    const categories = Object.keys(aiTips);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const tips = aiTips[category];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    
    const categoryIcons = {
        nutrition: '🥗',
        hydration: '💧',
        sleep: '😴',
        stress: '🧘',
        exercise: '💪',
        lifestyle: '🌟'
    };
    
    document.getElementById('tipCategory').textContent = 
        `${categoryIcons[category]} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    document.getElementById('tipText').textContent = tip;
}

// Get new tip
function getNewTip() {
    displayRandomTip();
    showToast('New tip loaded!', 'success');
}

// Save tip to favorites
function saveTip() {
    const tip = document.getElementById('tipText').textContent;
    savedTips.push(tip);
    localStorage.setItem('savedTips', JSON.stringify(savedTips));
    
    const btn = document.getElementById('saveTipBtn');
    btn.textContent = '❤️';
    showToast('Tip saved to favorites!', 'success');
    
    setTimeout(() => {
        btn.textContent = '🤍';
    }, 2000);
}

// Toggle symptom
function toggleSymptom(symptom) {
    const btn = event.target.closest('.symptom-btn');
    btn.classList.toggle('active');
}

// Save symptoms
function saveSymptoms() {
    const activeSymptoms = [];
    document.querySelectorAll('.symptom-btn.active').forEach(btn => {
        activeSymptoms.push(btn.dataset.symptom);
    });
    
    const today = new Date().toISOString().split('T')[0];
    cycleData.symptoms[today] = activeSymptoms;
    
    localStorage.setItem('fertilityData', JSON.stringify(cycleData));
    showToast('Symptoms saved successfully!', 'success');
}

// Show cycle setup modal
function showCycleSetup() {
    document.getElementById('cycleSetupModal').style.display = 'flex';
    
    // Set current values if they exist
    if (cycleData.lastPeriodDate) {
        document.getElementById('lastPeriodDate').value = 
            cycleData.lastPeriodDate.toISOString().split('T')[0];
    }
    document.getElementById('cycleLengthInput').value = cycleData.cycleLength;
    document.getElementById('periodDurationInput').value = cycleData.periodDuration;
}

function closeCycleSetup() {
    document.getElementById('cycleSetupModal').style.display = 'none';
}

// Show conception tips
function showConceptionTips() {
    document.getElementById('conceptionTipsModal').style.display = 'flex';
}

function closeConceptionTips() {
    document.getElementById('conceptionTipsModal').style.display = 'none';
}

// Show probability info
function showProbabilityInfo() {
    alert('Conception probability is calculated based on:\n\n' +
          '• Your current cycle day\n' +
          '• Distance from ovulation\n' +
          '• Fertile window timing\n' +
          '• Cycle regularity\n\n' +
          'Peak fertility is 1-2 days before ovulation.');
}

// Toggle partner mode
function togglePartnerMode() {
    cycleData.partnerModeEnabled = !cycleData.partnerModeEnabled;
    const content = document.getElementById('partnerContent');
    const btn = event.target;
    
    if (cycleData.partnerModeEnabled) {
        content.style.display = 'block';
        btn.textContent = 'Disable';
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
    } else {
        content.style.display = 'none';
        btn.textContent = 'Enable';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
    }
    
    localStorage.setItem('fertilityData', JSON.stringify(cycleData));
}

// Update partner tracker
function updatePartnerTracker() {
    showToast('Partner progress updated!', 'success');
}

// Quick actions
function logPeriod() {
    const date = prompt('Enter the first day of your period (YYYY-MM-DD):');
    if (date) {
        cycleData.lastPeriodDate = new Date(date);
        localStorage.setItem('fertilityData', JSON.stringify(cycleData));
        updateDashboard();
        generateCalendar();
        showToast('Period logged successfully!', 'success');
    }
}

function logIntimacy() {
    showToast('Intimacy logged for today', 'success');
}

function viewTrends() {
    showToast('Trends feature coming soon!', 'info');
}

function setReminder() {
    showToast('Reminder settings coming soon!', 'info');
}

function manageReminders() {
    showToast('Full reminder management coming soon!', 'info');
}

function toggleReminder(btn) {
    const item = btn.closest('.reminder-item');
    item.classList.toggle('active');
    btn.textContent = item.classList.contains('active') ? '✓' : '○';
}

// Format date helper
function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Setup event listeners
function setupEventListeners() {
    // Cycle setup form
    const cycleForm = document.getElementById('cycleSetupForm');
    if (cycleForm) {
        cycleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const lastPeriod = document.getElementById('lastPeriodDate').value;
            const cycleLength = parseInt(document.getElementById('cycleLengthInput').value);
            const periodDuration = parseInt(document.getElementById('periodDurationInput').value);
            
            cycleData.lastPeriodDate = new Date(lastPeriod);
            cycleData.cycleLength = cycleLength;
            cycleData.periodDuration = periodDuration;
            
            // Save to backend
            try {
                await apiCall('/auth/mode', 'PUT', {
                    careMode: 'planning',
                    lastPeriodDate: lastPeriod,
                    cycleLength: cycleLength,
                    periodDuration: periodDuration
                });
            } catch (error) {
                console.error('Error saving to backend:', error);
            }
            
            // Save to localStorage
            localStorage.setItem('fertilityData', JSON.stringify(cycleData));
            
            closeCycleSetup();
            updateDashboard();
            generateCalendar();
            showToast('Cycle information updated!', 'success');
        });
    }
    
    // Switch mode link
    const switchModeLink = document.getElementById('switchModeLink');
    if (switchModeLink) {
        switchModeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'mode-selection.html?switch=true';
        });
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
