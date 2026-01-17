// ================================
// NUTRITION GUIDE SCRIPT
// ================================

// Nutrition data cache
let NUTRITION_GUIDE = null;

let currentAgeGroup = '0-6';

document.addEventListener('DOMContentLoaded', async () => {
    redirectIfNotAuthenticated();
    
    // Load nutrition data from API
    await loadNutritionGuideFromAPI();
    
    // Initialize with default age group
    switchAgeGroup('0-6');
});

// Load nutrition guide from backend API
async function loadNutritionGuideFromAPI() {
    try {
        const response = await apiCall('/nutrition/guide', 'GET');
        
        if (response.success) {
            NUTRITION_GUIDE = response.data;
            console.log('Nutrition guide loaded from API');
        } else {
            console.error('Failed to load nutrition guide:', response.message);
            showToast('Failed to load nutrition guide', 'error');
        }
    } catch (error) {
        console.error('Error loading nutrition guide:', error);
        showToast('Error loading nutrition data', 'error');
        
        // Fallback to local data if API fails
        loadFallbackData();
    }
}

// Fallback nutrition data in case API is unavailable
function loadFallbackData() {
    NUTRITION_GUIDE = {
        '0-6': {
            title: '0-6 Months: Exclusive Milk Feeding',
            description: 'Breast milk or formula provides all necessary nutrients.',
            foods: [
                {
                    category: 'Primary Nutrition',
                    icon: '🍼',
                    items: [
                        { emoji: '🤱', name: 'Breast Milk', benefit: 'Best source of nutrition' },
                        { emoji: '🍼', name: 'Formula', benefit: 'Complete nutrition alternative' }
                    ]
                }
            ],
            avoid: ['Solid foods', 'Honey', 'Cow\'s milk'],
            tips: [
                { title: 'Frequency', description: 'Feed 8-12 times per day' }
            ],
            sampleMealPlan: [
                { time: 'Every 2-3 hours', items: 'Breast milk or formula' }
            ]
        }
    };
    console.log('Using fallback nutrition data');
}

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    switchAgeGroup('0-6');
});

// Switch age group
function switchAgeGroup(ageGroup, clickedBtn) {
    currentAgeGroup = ageGroup;
    
    // Update tab states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button or find by data-age attribute
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    } else {
        // Find button by age group when called programmatically
        const targetBtn = document.querySelector(`.tab-btn[data-age="${ageGroup}"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    // Load nutrition data
    loadNutritionData(ageGroup);
}

// Load nutrition data
function loadNutritionData(ageGroup) {
    if (!NUTRITION_GUIDE) {
        console.error('Nutrition guide not loaded yet');
        showToast('Loading nutrition data...', 'info');
        return;
    }
    
    const data = NUTRITION_GUIDE[ageGroup];
    
    if (!data) {
        console.error('No data for age group', ageGroup);
        return;
    }
    
    const container = document.getElementById('nutritionContent');
    
    let html = `
        <div class="card">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>
        
        <div class="nutrition-grid">
    `;
    
    // Food categories
    data.foods.forEach(category => {
        html += `
            <div class="food-category">
                <div class="category-header">
                    <span class="category-icon">${category.icon}</span>
                    <h3>${category.category}</h3>
                </div>
                <ul class="food-list">
        `;
        
        category.items.forEach(item => {
            html += `
                <li class="food-item">
                    <span class="food-emoji">${item.emoji}</span>
                    <div>
                        <div class="food-name">${item.name}</div>
                        <div class="food-benefit">${item.benefit}</div>
                    </div>
                </li>
            `;
        });
        
        html += `
                </ul>
            </div>
        `;
    });
    
    html += `</div>`;
    
    // Foods to avoid
    if (data.avoid && data.avoid.length > 0) {
        html += `
            <div class="warning-section">
                <h3>⚠️ Foods to Avoid</h3>
                <ul class="warning-list">
        `;
        
        data.avoid.forEach(item => {
            html += `<li>${item}</li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    // Tips
    if (data.tips && data.tips.length > 0) {
        html += `
            <div class="tips-section">
                <h3>💡 Feeding Tips</h3>
        `;
        
        data.tips.forEach(tip => {
            html += `
                <div class="tip-card">
                    <div class="tip-title">${tip.title}</div>
                    <p class="tip-description">${tip.description}</p>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // Sample meal plan
    if (data.sampleMealPlan) {
        html += `
            <div class="meal-plan">
                <h3>📅 Sample Daily Meal Plan</h3>
        `;
        
        data.sampleMealPlan.forEach(meal => {
            html += `
                <div class="meal-time">
                    <div class="meal-label">${meal.time}</div>
                    <div class="meal-items">${meal.items}</div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
}
