// ================================
// PREGNANCY MODE SCRIPT
// ================================

let pregnancyData = null;
let currentWeek = 0;
let currentMonth = 0;

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    updateNavigation(); // Update navigation based on user's stage
    initializePregnancyMode();
});

// Initialize pregnancy mode - show setup or dashboard
async function initializePregnancyMode() {
    try {
        const response = await apiCall('/auth/me', 'GET');
        if (response.success && response.data.lmpDate) {
            // Has pregnancy data - show dashboard
            pregnancyData = response.data;
            showDashboard();
        } else {
            // No pregnancy data - show setup
            showSetup();
        }
    } catch (error) {
        console.error('Error loading pregnancy data:', error);
        showSetup();
    }
}

// Show setup form
function showSetup() {
    document.getElementById('setupView').style.display = 'block';
    document.getElementById('dashboardView').style.display = 'none';
    
    // Setup form handlers
    document.getElementById('pregnancySetupForm').addEventListener('submit', handleSetupSubmit);
    
    // Auto-calculate due date when LMP changes
    document.getElementById('lmpDate').addEventListener('change', function() {
        if (this.value && !document.getElementById('expectedDueDate').value) {
            const lmp = new Date(this.value);
            const dueDate = new Date(lmp);
            dueDate.setDate(dueDate.getDate() + 280);
            document.getElementById('expectedDueDate').value = dueDate.toISOString().split('T')[0];
        }
    });

    // Clear LMP when conception date is entered
    document.getElementById('conceptionDate').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('lmpDate').value = '';
        }
    });

    // Clear conception when LMP is entered
    document.getElementById('lmpDate').addEventListener('input', function() {
        if (this.value) {
            document.getElementById('conceptionDate').value = '';
        }
    });
}

// Handle setup form submission
async function handleSetupSubmit(e) {
    e.preventDefault();
    
    const lmpDate = document.getElementById('lmpDate').value;
    const conceptionDate = document.getElementById('conceptionDate').value;
    const expectedDueDate = document.getElementById('expectedDueDate').value;

    let finalLMP = lmpDate;
    let finalDueDate = expectedDueDate;

    // If conception date is provided instead of LMP
    if (!lmpDate && conceptionDate) {
        const conception = new Date(conceptionDate);
        const lmp = new Date(conception);
        lmp.setDate(lmp.getDate() - 14);
        finalLMP = lmp.toISOString().split('T')[0];
    }

    // Calculate due date if not provided
    if (finalLMP && !finalDueDate) {
        const lmp = new Date(finalLMP);
        const dueDate = new Date(lmp);
        dueDate.setDate(dueDate.getDate() + 280);
        finalDueDate = dueDate.toISOString().split('T')[0];
    }

    if (!finalLMP) {
        showToast('Please provide either LMP or Conception date', 'error');
        return;
    }

    try {
        await apiCall('/auth/mode', 'PUT', {
            careMode: 'pregnancy',
            lmpDate: finalLMP,
            expectedDueDate: finalDueDate,
            conceptionDate: conceptionDate || null
        });

        showToast('Pregnancy journey started!', 'success');
        
        // Reload to show dashboard
        setTimeout(() => {
            location.reload();
        }, 1000);

    } catch (error) {
        console.error('Error saving pregnancy data:', error);
        showToast('Failed to save data. Please try again.', 'error');
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('setupView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    
    calculatePregnancyStats();
    renderDashboard();
}

// Calculate pregnancy statistics
function calculatePregnancyStats() {
    const lmpDate = new Date(pregnancyData.lmpDate);
    const today = new Date();
    
    // Calculate days pregnant
    const daysPregnant = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
    
    // Calculate current week (1-40)
    currentWeek = Math.floor(daysPregnant / 7) + 1;
    if (currentWeek > 40) currentWeek = 40;
    if (currentWeek < 1) currentWeek = 1;
    
    // Calculate current month (1-9)
    currentMonth = Math.ceil(currentWeek / 4.33);
    if (currentMonth > 9) currentMonth = 9;
    if (currentMonth < 1) currentMonth = 1;
    
    // Store in global
    pregnancyData.daysPregnant = daysPregnant;
    pregnancyData.currentWeek = currentWeek;
    pregnancyData.currentMonth = currentMonth;
    
    // Calculate due date if not provided
    if (!pregnancyData.expectedDueDate) {
        const dueDate = new Date(lmpDate);
        dueDate.setDate(dueDate.getDate() + 280);
        pregnancyData.expectedDueDate = dueDate.toISOString().split('T')[0];
    }
}

// Render dashboard
function renderDashboard() {
    renderSummaryHero();
    renderQuickStats();
    renderTodayFocus();
    renderNextTest();
    renderCareAdvice();
    renderBabyDevelopment();
    renderMonthlyChecklist();
    renderThingsToAvoid();
    renderReminders();
}

// Render summary hero section
function renderSummaryHero() {
    const dueDate = new Date(pregnancyData.expectedDueDate);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    document.getElementById('currentWeekText').textContent = `You are in Week ${currentWeek}`;
    document.getElementById('currentMonthText').textContent = `Month ${currentMonth}`;
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('dueDateDisplay').textContent = dueDate.toLocaleDateString('en-US', options);
    document.getElementById('daysRemaining').textContent = `${daysRemaining} days to go`;
    
    // Calculate progress percentage
    const progressPercent = Math.round((pregnancyData.daysPregnant / 280) * 100);
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    
    // Animate circular progress
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progressPercent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

// Render quick stats
function renderQuickStats() {
    document.getElementById('daysPregnant').textContent = pregnancyData.daysPregnant;
    
    let trimester = '1st';
    if (currentWeek > 27) trimester = '3rd';
    else if (currentWeek > 13) trimester = '2nd';
    document.getElementById('trimesterText').textContent = trimester;
    
    // Checklist progress - will be updated by checklist render
    updateChecklistProgress();
}

// Render today's focus
function renderTodayFocus() {
    const weekData = getWeekData(currentWeek);
    const monthData = PREGNANCY_DATA[currentMonth];
    
    let html = '<div class="today-list">';
    
    // Week-specific advice
    html += '<div class="today-item">';
    html += '<div class="today-icon">🌟</div>';
    html += '<div class="today-content">';
    html += `<div class="today-title">Week ${currentWeek} Focus</div>`;
    html += `<div class="today-desc">${weekData.focus}</div>`;
    html += '</div>';
    html += '</div>';
    
    // Care reminder
    if (monthData && monthData.checklist && monthData.checklist.length > 0) {
        html += '<div class="today-item">';
        html += '<div class="today-icon">✅</div>';
        html += '<div class="today-content">';
        html += '<div class="today-title">Today\'s Priority</div>';
        html += `<div class="today-desc">${monthData.checklist[0]}</div>`;
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    document.getElementById('todayContent').innerHTML = html;
}

// Render next test
function renderNextTest() {
    const nextTest = getNextTest(currentWeek);
    
    if (nextTest) {
        document.getElementById('testName').textContent = nextTest.name;
        document.getElementById('testWeek').textContent = `Week ${nextTest.week}`;
        
        const weeksAway = nextTest.week - currentWeek;
        if (weeksAway === 0) {
            document.getElementById('testTiming').textContent = 'Due this week!';
        } else if (weeksAway === 1) {
            document.getElementById('testTiming').textContent = 'Due next week';
        } else if (weeksAway > 0) {
            document.getElementById('testTiming').textContent = `In ${weeksAway} weeks`;
        } else {
            document.getElementById('testTiming').textContent = 'Overdue - schedule now';
        }
        
        document.getElementById('testDesc').textContent = nextTest.description;
    } else {
        document.getElementById('nextTestContent').innerHTML = '<p>All major tests completed. Continue regular checkups.</p>';
    }
}

// Render care advice
function renderCareAdvice() {
    const weekData = getWeekData(currentWeek);
    const monthData = PREGNANCY_DATA[currentMonth];
    
    let html = '';
    
    if (monthData && monthData.exercise) {
        monthData.exercise.slice(0, 4).forEach(item => {
            html += `<div class="care-item">${item}</div>`;
        });
    }
    
    document.getElementById('careAdvice').innerHTML = html || '<p>Loading care advice...</p>';
}

// Render baby development
function renderBabyDevelopment() {
    const monthData = PREGNANCY_DATA[currentMonth];
    
    if (monthData) {
        let html = '';
        html += `<div class="baby-size">👶 Size: ${monthData.babySize}</div>`;
        html += `<div class="baby-desc">${monthData.development}</div>`;
        document.getElementById('babyDevelopment').innerHTML = html;
    }
}

// Render monthly checklist
function renderMonthlyChecklist() {
    const monthData = PREGNANCY_DATA[currentMonth];
    
    if (monthData && monthData.checklist) {
        let html = '';
        monthData.checklist.forEach((item, index) => {
            const checkId = `check-m${currentMonth}-${index}`;
            const isChecked = localStorage.getItem(checkId) === 'true';
            html += `
                <label class="checklist-item-dash ${isChecked ? 'completed' : ''}">
                    <input type="checkbox" id="${checkId}" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem(this)">
                    <span>${item}</span>
                </label>
            `;
        });
        document.getElementById('checklistItems').innerHTML = html;
        updateChecklistProgress();
    }
}

// Toggle checklist item
function toggleChecklistItem(checkbox) {
    localStorage.setItem(checkbox.id, checkbox.checked);
    checkbox.parentElement.classList.toggle('completed', checkbox.checked);
    updateChecklistProgress();
}

// Update checklist progress
function updateChecklistProgress() {
    const monthData = PREGNANCY_DATA[currentMonth];
    if (monthData && monthData.checklist) {
        const total = monthData.checklist.length;
        let completed = 0;
        
        for (let i = 0; i < total; i++) {
            const checkId = `check-m${currentMonth}-${i}`;
            if (localStorage.getItem(checkId) === 'true') {
                completed++;
            }
        }
        
        const percentage = Math.round((completed / total) * 100);
        
        document.getElementById('checklistProgress').textContent = `${completed}/${total}`;
        document.getElementById('checklistPercentage').textContent = `${percentage}%`;
        document.getElementById('checklistProgressBar').style.width = `${percentage}%`;
    }
}

// Render things to avoid
function renderThingsToAvoid() {
    const monthData = PREGNANCY_DATA[currentMonth];
    
    if (monthData && monthData.avoid) {
        let html = '';
        monthData.avoid.slice(0, 5).forEach(item => {
            html += `<div class="avoid-item">${item}</div>`;
        });
        document.getElementById('avoidContent').innerHTML = html;
    }
}

// Render reminders
function renderReminders() {
    const reminders = generateReminders(currentWeek);
    
    let html = '';
    reminders.forEach(reminder => {
        html += `
            <div class="reminder-item">
                <div class="reminder-icon">${reminder.icon}</div>
                <div class="reminder-content">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-time">${reminder.time}</div>
                    <div class="reminder-desc">${reminder.description}</div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('remindersList').innerHTML = html || '<p>No upcoming reminders</p>';
}

// Get week data
function getWeekData(week) {
    const weekRanges = {
        '1-4': { focus: 'Early pregnancy care. Take folic acid, avoid alcohol and smoking.' },
        '5-8': { focus: 'First prenatal visit. Track morning sickness, stay hydrated.' },
        '9-13': { focus: 'First trimester ending. NT scan scheduled. Continue prenatal vitamins.' },
        '14-17': { focus: 'Second trimester begins! Energy may increase. Regular checkups.' },
        '18-22': { focus: 'Anomaly scan period. Feel baby movements. Balanced nutrition.' },
        '23-27': { focus: 'Mid-pregnancy. Glucose screening. Monitor weight gain.' },
        '28-32': { focus: 'Third trimester. More frequent checkups. Prepare for baby.' },
        '33-36': { focus: 'Late pregnancy. Weekly checkups may begin. Hospital bag preparation.' },
        '37-40': { focus: 'Full term! Baby can arrive any time. Watch for labor signs.' }
    };
    
    for (const [range, data] of Object.entries(weekRanges)) {
        const [min, max] = range.split('-').map(Number);
        if (week >= min && week <= max) return data;
    }
    
    return { focus: 'Continue regular prenatal care and healthy habits.' };
}

// Get next test
function getNextTest(currentWeek) {
    const tests = [
        { week: 8, name: 'First Prenatal Visit', description: 'Confirmation of pregnancy, blood tests, and initial checkup.' },
        { week: 12, name: 'NT Scan', description: 'Nuchal translucency scan to assess baby\'s development.' },
        { week: 16, name: 'Triple/Quad Screen', description: 'Blood test to screen for chromosomal abnormalities.' },
        { week: 20, name: 'Anomaly Scan', description: 'Detailed ultrasound to check baby\'s organs and development.' },
        { week: 24, name: 'Glucose Screening', description: 'Test for gestational diabetes.' },
        { week: 28, name: 'Third Trimester Checkup', description: 'Regular monitoring begins more frequently.' },
        { week: 32, name: 'Growth Scan', description: 'Check baby\'s growth and position.' },
        { week: 36, name: 'Group B Strep Test', description: 'Screening for Group B Streptococcus.' }
    ];
    
    return tests.find(test => test.week >= currentWeek) || null;
}

// Generate reminders
function generateReminders(week) {
    const reminders = [];
    
    // Test reminders
    const nextTest = getNextTest(week);
    if (nextTest && nextTest.week - week <= 2) {
        reminders.push({
            icon: '🧪',
            title: `Upcoming: ${nextTest.name}`,
            time: `Week ${nextTest.week}`,
            description: nextTest.description
        });
    }
    
    // Weekly summary
    reminders.push({
        icon: '📊',
        title: 'Weekly Progress Update',
        time: 'Every Monday',
        description: `You're entering week ${week + 1} soon. Check your checklist and appointments.`
    });
    
    // Doctor visit reminder
    if (week >= 28) {
        reminders.push({
            icon: '👨‍⚕️',
            title: 'Regular Checkup',
            time: 'Weekly visits recommended',
            description: 'Schedule weekly doctor visits as you approach due date.'
        });
    }
    
    return reminders;
}

// ================================
// PREGNANCY DATA
// ================================
const PREGNANCY_DATA = {
    1: {
        babySize: 'Poppy seed (0.2 cm)',
        development: 'The embryo begins to form. Cell division is rapid.',
        checklist: ['Take folic acid (400-800 mcg)', 'Schedule first prenatal appointment', 'Avoid alcohol and smoking', 'Start tracking symptoms'],
        nutrition: ['Folic acid rich foods', 'Whole grains', 'Lean proteins', 'Plenty of water'],
        tests: ['Home pregnancy test', 'Confirm with doctor'],
        avoid: ['Alcohol', 'Smoking', 'Raw fish/meat', 'Unpasteurized dairy', 'Excessive caffeine'],
        exercise: ['Light walking', 'Prenatal yoga', 'Stay active but avoid overexertion']
    },
    2: {
        babySize: 'Blueberry (1 cm)',
        development: 'Baby\'s brain and spinal cord are forming. Heart begins to beat.',
        checklist: ['Continue prenatal vitamins', 'Eat small frequent meals', 'Rest when tired', 'Track morning sickness'],
        nutrition: ['Vitamin B6 for nausea', 'Ginger tea', 'Crackers and bland foods', 'Stay hydrated'],
        tests: ['First prenatal visit scheduled', 'Blood tests may begin'],
        avoid: ['High-mercury fish', 'Deli meats', 'Raw eggs', 'Cat litter', 'Heavy lifting'],
        exercise: ['Swimming', 'Walking 30 minutes daily', 'Pelvic floor exercises']
    },
    3: {
        babySize: 'Grape (2.5 cm)',
        development: 'Facial features forming. Fingers and toes appear. Organs developing.',
        checklist: ['First ultrasound', 'Discuss genetic screening', 'Manage morning sickness', 'Sleep 7-8 hours'],
        nutrition: ['Calcium rich foods', 'Iron supplements', 'Vitamin C for absorption', 'Protein at every meal'],
        tests: ['NT scan (11-13 weeks)', 'First trimester screening'],
        avoid: ['Vitamin A supplements', 'Hot tubs/saunas', 'Contact sports', 'Cleaning chemicals'],
        exercise: ['Modified aerobics', 'Gentle stretching', 'Avoid supine position after 12 weeks']
    },
    4: {
        babySize: 'Lemon (6 cm)',
        development: 'All organs formed. Baby can make facial expressions. Gender may be visible.',
        checklist: ['Second trimester begins!', 'Schedule anomaly scan', 'Buy maternity clothes', 'Dental checkup'],
        nutrition: ['Increase calorie intake (300 extra)', 'Omega-3 fatty acids', 'Fiber for digestion', 'Vitamin D'],
        tests: ['Triple/Quad screen (15-20 weeks)', 'Regular checkups'],
        avoid: ['Ibuprofen', 'Retinol products', 'Artificial sweeteners in excess', 'Stress'],
        exercise: ['Prenatal swimming', 'Walking', 'Yoga', 'Kegel exercises']
    },
    5: {
        babySize: 'Bell pepper (16 cm)',
        development: 'Baby can hear sounds. Active movements. Hair and nails growing.',
        checklist: ['Feel baby movements', 'Anomaly scan completed', 'Iron levels checked', 'Hydration focus'],
        nutrition: ['Iron rich foods', 'Vitamin C with iron', 'Healthy fats', 'Colorful vegetables'],
        tests: ['Anomaly scan (18-22 weeks)', 'Blood pressure monitoring'],
        avoid: ['Lying flat on back', 'Prolonged standing', 'Dehydration', 'Secondhand smoke'],
        exercise: ['Low-impact cardio', 'Stretching', 'Balance exercises', 'Swimming']
    },
    6: {
        babySize: 'Papaya (28 cm)',
        development: 'Baby\'s eyes open. Brain developing rapidly. Regular sleep-wake cycles.',
        checklist: ['Glucose screening test', 'Monitor weight gain', 'Prepare nursery', 'Childbirth classes'],
        nutrition: ['Complex carbohydrates', 'Lean proteins', 'Calcium for bones', 'Magnesium'],
        tests: ['Glucose tolerance test (24-28 weeks)', 'Hemoglobin check'],
        avoid: ['Processed foods', 'Excessive sugar', 'Standing for long periods', 'Stress'],
        exercise: ['Walking', 'Prenatal yoga', 'Swimming', 'Pelvic tilts']
    },
    7: {
        babySize: 'Cauliflower (37 cm)',
        development: 'Baby can sense light. Lungs maturing. Regular hiccups and kicks.',
        checklist: ['Third trimester begins', 'Hospital tour', 'Birth plan draft', 'Weekly checkups may start'],
        nutrition: ['Protein increase', 'Iron and calcium', 'Healthy snacks', 'Small frequent meals'],
        tests: ['Weekly checkups may begin', 'Blood pressure monitoring', 'Urine tests'],
        avoid: ['Lying on back', 'Heavy meals before bed', 'Stress', 'Fatigue'],
        exercise: ['Gentle walking', 'Pelvic floor exercises', 'Breathing exercises', 'Light stretching']
    },
    8: {
        babySize: 'Honeydew (46 cm)',
        development: 'Baby gaining weight. Brain developing fast. Getting into position.',
        checklist: ['Pack hospital bag', 'Install car seat', 'Finalize birth plan', 'Rest frequently'],
        nutrition: ['High-protein meals', 'Calcium', 'Omega-3', 'Stay hydrated'],
        tests: ['Weekly doctor visits', 'Monitor baby\'s position', 'Non-stress tests may begin'],
        avoid: ['Stress', 'Travel restrictions', 'Heavy lifting', 'Overexertion'],
        exercise: ['Gentle walking only', 'Breathing exercises', 'Pelvic floor prep', 'Rest as needed']
    },
    9: {
        babySize: 'Watermelon (50 cm)',
        development: 'Baby is full term! Lungs mature. Ready for birth. Dropping into pelvis.',
        checklist: ['Watch for labor signs', 'Final checkups', 'Hospital bag ready', 'Support system in place'],
        nutrition: ['Energy foods', 'Dates for labor', 'Hydration critical', 'Light meals'],
        tests: ['Weekly/bi-weekly checkups', 'Cervical checks', 'Group B strep test'],
        avoid: ['Panic', 'Stress', 'Being alone', 'Ignoring contractions'],
        exercise: ['Short walks', 'Pelvic movements', 'Squats if approved', 'Labor preparation exercises']
    }
};
