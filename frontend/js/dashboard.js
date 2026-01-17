// ================================
// DASHBOARD PAGE SCRIPT
// ================================

let currentBaby = null;

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    updateNavigation(); // Update navigation based on user's stage
    loadUserData();
    loadBabies();
    setTodayDate();
});

// Refresh dashboard when page becomes visible (user navigates back)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentBaby) {
        console.log('Page visible - refreshing dashboard data');
        loadBabyData();
    }
});

// Also refresh when window gains focus
window.addEventListener('focus', () => {
    if (currentBaby) {
        console.log('Window focused - refreshing dashboard data');
        loadBabyData();
    }
});

// Load user data
async function loadUserData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('userName').textContent = user.name.split(' ')[0];
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Set today's date
function setTodayDate() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    const dateElement = document.getElementById('todayDate');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }
}

// Load babies list
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
            
            // Auto-select first baby
            currentBaby = response.data[0];
            select.value = currentBaby._id;
            loadBabyData();
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading babies:', error);
        showToast('Error loading baby profiles', 'error');
    }
}

// Load baby data and stats
async function loadBabyData() {
    const select = document.getElementById('babySelect');
    const babyId = select.value;
    
    if (!babyId) {
        showEmptyState();
        return;
    }
    
    console.log('Loading baby data for ID:', babyId);
    
    try {
        // Try to load comprehensive analytics first
        console.log('Fetching analytics from:', `/analytics/dashboard/${babyId}`);
        const analyticsResponse = await apiCall(`/analytics/dashboard/${babyId}`, 'GET');
        
        console.log('Analytics response:', analyticsResponse);
        
        if (analyticsResponse.success && analyticsResponse.data) {
            currentBaby = { _id: babyId, ...analyticsResponse.data.baby };
            displayBabyInfo(currentBaby);
            displayAnalytics(analyticsResponse.data);
            
            // Show dashboard content
            document.getElementById('dashboardContent').style.display = 'grid';
            document.getElementById('emptyState').style.display = 'none';
            return;
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Using fallback data loading...', 'info');
    }
    
    // Fallback to old method
    try {
        // Load baby details
        const babyResponse = await apiCall(`/baby/${babyId}`, 'GET');
        if (babyResponse.success) {
            currentBaby = babyResponse.data;
            displayBabyInfo(currentBaby);
        }
        
        // Load today's summary
        const summaryResponse = await apiCall(`/tracking/summary/${babyId}`, 'GET');
        if (summaryResponse.success) {
            displaySummary(summaryResponse.data);
        }
        
        // Load vaccinations
        loadNextVaccination(babyId);
        
        // Show dashboard content
        document.getElementById('dashboardContent').style.display = 'grid';
        document.getElementById('emptyState').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading baby data:', error);
        showToast('Error loading data', 'error');
    }
}

// Display analytics data from new endpoint
function displayAnalytics(data) {
    console.log('Displaying analytics data:', data);
    
    // Update feeding summary
    const feedingTotal = document.getElementById('feedingTotal');
    const nextFeeding = document.getElementById('nextFeeding');
    
    if (feedingTotal) {
        feedingTotal.textContent = data.feeding.totalToday || 0;
    }
    
    if (nextFeeding) {
        if (data.feeding.nextSuggestion) {
            const nextTime = new Date(data.feeding.nextSuggestion);
            nextFeeding.textContent = nextTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            nextFeeding.textContent = '--';
        }
    }
    
    // Update sleep summary
    const sleepTotal = document.getElementById('sleepTotal');
    const sleepSessions = document.getElementById('sleepSessions');
    
    if (sleepTotal) {
        sleepTotal.textContent = `${data.sleep.totalHoursToday || 0}h`;
    }
    
    if (sleepSessions) {
        sleepSessions.textContent = data.sleep.sessionsToday || 0;
    }
    
    // Update weekly insights
    const avgFeeds = document.getElementById('avgFeeds');
    const avgFeedsDetail = document.getElementById('avgFeedsDetail');
    const peakFeedingTime = document.getElementById('peakFeedingTime');
    const peakFeedingDetail = document.getElementById('peakFeedingDetail');
    const avgSleep = document.getElementById('avgSleep');
    const avgSleepDetail = document.getElementById('avgSleepDetail');
    
    if (avgFeeds) {
        avgFeeds.textContent = (data.feeding.avgPerDay || 0).toFixed(1);
    }
    
    if (avgFeedsDetail) {
        avgFeedsDetail.textContent = `Average over the past week`;
    }
    
    if (peakFeedingTime) {
        peakFeedingTime.textContent = data.feeding.peakTime || '--';
    }
    
    if (peakFeedingDetail) {
        peakFeedingDetail.textContent = 'Most common feeding time';
    }
    
    if (avgSleep) {
        avgSleep.textContent = `${(data.sleep.avgPerDay || 0).toFixed(1)}h`;
    }
    
    if (avgSleepDetail) {
        avgSleepDetail.textContent = `Average daily sleep`;
    }
    
    // Update vaccination info
    const nextVaccine = document.getElementById('nextVaccine');
    const nextVaccineDetail = document.getElementById('nextVaccineDetail');
    
    if (nextVaccine) {
        nextVaccine.textContent = data.vaccination.nextVaccine || 'All done!';
    }
    
    if (nextVaccineDetail) {
        if (data.vaccination.nextDueDate) {
            const dueDate = new Date(data.vaccination.nextDueDate);
            nextVaccineDetail.textContent = `Due: ${dueDate.toLocaleDateString()}`;
        } else {
            nextVaccineDetail.textContent = 'All vaccinations up to date';
        }
    }
    
    // Update AI suggestion
    const aiSuggestion = document.getElementById('aiSuggestion');
    if (aiSuggestion) {
        let suggestion = `Great job! ${currentBaby.name} `;
        
        // Generate intelligent suggestion based on data
        if (data.feeding.totalToday < 6) {
            suggestion += `has had ${data.feeding.totalToday} feeding${data.feeding.totalToday !== 1 ? 's' : ''} today. Consider checking if they're hungry.`;
        } else if (data.feeding.totalToday > 12) {
            suggestion += `has been very active with ${data.feeding.totalToday} feedings today! Make sure to stay hydrated too.`;
        } else {
            suggestion += `is on track with ${data.feeding.totalToday} feedings. `;
        }
        
        // Sleep insights
        if (data.sleep.totalHoursToday < 10) {
            suggestion += ` Sleep might be a bit low at ${data.sleep.totalHoursToday} hours.`;
        } else if (data.sleep.totalHoursToday > 15) {
            suggestion += ` Excellent sleep of ${data.sleep.totalHoursToday} hours!`;
        }
        
        // Vaccination reminder
        if (data.vaccination.nextDueDate) {
            const daysUntil = Math.ceil((new Date(data.vaccination.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntil < 7 && daysUntil > 0) {
                suggestion += ` 💉 Reminder: ${data.vaccination.nextVaccine} vaccination coming up in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!`;
            }
        }
        
        aiSuggestion.textContent = suggestion;
    }
}

// Display baby information
function displayBabyInfo(baby) {
    const nameElement = document.getElementById('babyName');
    const ageElement = document.getElementById('babyAge');
    const genderElement = document.getElementById('babyGender');
    
    if (nameElement) nameElement.textContent = baby.name;
    
    if (ageElement) {
        if (baby.ageFormatted) {
            ageElement.textContent = baby.ageFormatted;
        } else {
            const months = baby.ageInMonths || 0;
            const weeks = baby.ageInWeeks || 0;
            
            if (months < 1) {
                ageElement.textContent = `${weeks} weeks old`;
            } else if (months < 12) {
                ageElement.textContent = `${months} months old`;
            } else {
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                ageElement.textContent = `${years} year${years > 1 ? 's' : ''} ${remainingMonths} months old`;
            }
        }
    }
    
    if (genderElement) {
        const genderEmoji = baby.gender === 'male' ? '👦' : baby.gender === 'female' ? '👧' : '👶';
        genderElement.textContent = `${genderEmoji} ${baby.gender.charAt(0).toUpperCase() + baby.gender.slice(1)}`;
    }
}

// Legacy function for fallback - can be removed later
function displaySummary(data) {
    // Feeding stats
    const feedingElement = document.getElementById('todayFeeding');
    const sleepElement = document.getElementById('todaySleep');
    
    if (feedingElement) {
        feedingElement.textContent = data.feeding?.total || 0;
    }
    
    if (sleepElement) {
        sleepElement.textContent = `${data.sleep?.totalHours || 0}h`;
    }
}

// Load next vaccination
async function loadNextVaccination(babyId) {
    try {
        const response = await apiCall(`/vaccination/${babyId}`, 'GET');
        
        if (response.success && response.data.length > 0) {
            const nextVaccine = response.data.find(v => 
                v.status === 'pending' || v.status === 'scheduled'
            );
            
            const vaccineElement = document.getElementById('nextVaccine');
            if (vaccineElement) {
                if (nextVaccine) {
                    vaccineElement.textContent = nextVaccine.name.split(' ')[0];
                } else {
                    vaccineElement.textContent = 'All done!';
                }
            }
        }
    } catch (error) {
        console.error('Error loading vaccinations:', error);
    }
}

// Update activity list
function updateActivityList(data) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    const activities = [];
    
    // Add feeding logs
    if (data.feeding.logs && data.feeding.logs.length > 0) {
        data.feeding.logs.slice(0, 2).forEach(log => {
            activities.push({
                icon: '🍼',
                title: `${log.type.charAt(0).toUpperCase() + log.type.slice(1)} feeding`,
                time: formatTimeAgo(log.time)
            });
        });
    }
    
    // Add sleep logs
    if (data.sleep.logs && data.sleep.logs.length > 0) {
        data.sleep.logs.slice(0, 2).forEach(log => {
            const duration = Math.round((log.duration || 0) / 60);
            activities.push({
                icon: '😴',
                title: `Sleep session (${duration}h)`,
                time: formatTimeAgo(log.startTime)
            });
        });
    }
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: var(--gray-600);">No activity logged today</p>';
        return;
    }
    
    activities.slice(0, 3).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-details">
                <p class="activity-title">${activity.title}</p>
                <p class="activity-time">${activity.time}</p>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// Update AI suggestion
function updateAISuggestion(data) {
    const suggestionElement = document.getElementById('aiSuggestion');
    if (!suggestionElement) return;
    
    const feedingCount = data.feeding.total || 0;
    const sleepHours = data.sleep.totalHours || 0;
    
    let suggestion = '';
    
    if (feedingCount < 6 && currentBaby && currentBaby.ageInMonths < 6) {
        suggestion = 'Consider increasing feeding frequency. Newborns typically need 8-12 feedings per day.';
    } else if (sleepHours < 10 && currentBaby && currentBaby.ageInMonths < 12) {
        suggestion = 'Baby needs more sleep. Infants require 12-16 hours of sleep daily including naps.';
    } else if (feedingCount >= 8 && sleepHours >= 12) {
        suggestion = 'Excellent work! Your baby is getting great nutrition and rest. Keep up the routine! 🌟';
    } else {
        suggestion = 'Everything looks good! Keep maintaining the feeding and sleep schedule.';
    }
    
    suggestionElement.textContent = suggestion;
}

// Format time ago
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

// Show empty state
function showEmptyState() {
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
}
// ================================
// MILESTONE MANAGEMENT
// ================================
function showMilestoneModal() {
    document.getElementById('milestoneModal').style.display = 'flex';
    document.getElementById('milestoneDate').value = new Date().toISOString().split('T')[0];
}

function closeMilestoneModal() {
    document.getElementById('milestoneModal').style.display = 'none';
    document.getElementById('milestoneForm').reset();
}

// Handle milestone type change
document.addEventListener('DOMContentLoaded', () => {
    const milestoneType = document.getElementById('milestoneType');
    const customGroup = document.getElementById('customMilestoneGroup');
    
    if (milestoneType) {
        milestoneType.addEventListener('change', () => {
            if (milestoneType.value === 'custom') {
                customGroup.style.display = 'block';
            } else {
                customGroup.style.display = 'none';
            }
        });
    }
});

// Mark milestone as achieved
function markMilestone(milestoneId, checkbox) {
    if (!checkbox) {
        checkbox = event.target;
    }
    
    const item = checkbox.closest('.milestone-item');
    
    if (checkbox.checked) {
        item.classList.add('completed');
        showToast('Milestone marked as achieved! 🎉', 'success');
        
        // TODO: Save to backend
        // saveMilestoneToAPI(milestoneId, currentBaby._id);
    } else {
        item.classList.remove('completed');
        showToast('Milestone unmarked', 'info');
    }
}

// ================================
// NUTRITION GUIDANCE
// ================================
function updateNutritionGuidance(ageInMonths) {
    const nutritionAge = document.getElementById('nutritionAge');
    const nutritionRecommendations = document.getElementById('nutritionRecommendations');
    
    if (!nutritionAge || !nutritionRecommendations) return;
    
    let ageLabel = '';
    let recommendations = '';
    
    if (ageInMonths < 6) {
        ageLabel = '0-6 months';
        recommendations = `
            <div class="nutrition-item">
                <span class="nutrition-icon">🍼</span>
                <div class="nutrition-text">
                    <strong>Exclusive Breastfeeding</strong>
                    <p>Breast milk or formula only - No water or solid foods needed</p>
                </div>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-icon">⏰</span>
                <div class="nutrition-text">
                    <strong>Feeding Frequency</strong>
                    <p>8-12 times per day (every 2-3 hours)</p>
                </div>
            </div>
            <div class="nutrition-item warning">
                <span class="nutrition-icon">⚠️</span>
                <div class="nutrition-text">
                    <strong>Avoid</strong>
                    <p>Honey, cow's milk, solid foods before 6 months</p>
                </div>
            </div>
        `;
    } else if (ageInMonths < 12) {
        ageLabel = '6-12 months';
        recommendations = `
            <div class="nutrition-item">
                <span class="nutrition-icon">🥣</span>
                <div class="nutrition-text">
                    <strong>Introduce Solids</strong>
                    <p>Start with iron-rich cereals, pureed vegetables and fruits</p>
                </div>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-icon">🍼</span>
                <div class="nutrition-text">
                    <strong>Continue Milk</strong>
                    <p>Breast milk or formula remains primary nutrition source</p>
                </div>
            </div>
            <div class="nutrition-item warning">
                <span class="nutrition-icon">⚠️</span>
                <div class="nutrition-text">
                    <strong>Allergy Watch</strong>
                    <p>Introduce one new food at a time, wait 3-5 days</p>
                </div>
            </div>
        `;
    } else {
        ageLabel = '12+ months';
        recommendations = `
            <div class="nutrition-item">
                <span class="nutrition-icon">🍽️</span>
                <div class="nutrition-text">
                    <strong>Family Foods</strong>
                    <p>Variety of healthy foods - fruits, vegetables, proteins, grains</p>
                </div>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-icon">🥛</span>
                <div class="nutrition-text">
                    <strong>Whole Milk</strong>
                    <p>Can transition to whole cow's milk (16-24 oz per day)</p>
                </div>
            </div>
            <div class="nutrition-item warning">
                <span class="nutrition-icon">⚠️</span>
                <div class="nutrition-text">
                    <strong>Choking Hazards</strong>
                    <p>Cut foods into small pieces, avoid nuts, grapes, popcorn</p>
                </div>
            </div>
        `;
    }
    
    nutritionAge.textContent = ageLabel;
    nutritionRecommendations.innerHTML = recommendations;
}

// ================================
// SCHEDULE MANAGEMENT
// ================================
function showScheduleModal() {
    showToast('Schedule editor coming soon!', 'info');
}

function showGrowthChart() {
    showToast('Growth chart feature coming soon!', 'info');
}

function showDoctorVisits() {
    showToast('Doctor visits feature coming soon!', 'info');
}