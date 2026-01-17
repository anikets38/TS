// ================================
// HEALTH AWARENESS SCRIPT
// ================================

const HEALTH_CONDITIONS = [
    {
        id: 1,
        title: "Fever",
        icon: "🌡️",
        severity: "moderate",
        description: "Elevated body temperature, usually above 100.4°F (38°C)",
        symptoms: ["Temperature above 100.4°F", "Fussiness", "Poor feeding", "Sleepiness"],
        causes: ["Viral infection", "Bacterial infection", "Vaccination reaction", "Teething"],
        treatment: [
            "Keep baby hydrated",
            "Dress in light clothing",
            "Give fever reducer if recommended by doctor",
            "Monitor temperature regularly",
            "Sponge bath with lukewarm water"
        ],
        whenToSeek: [
            "Baby under 3 months with any fever",
            "Fever above 104°F (40°C)",
            "Fever lasting more than 3 days",
            "Accompanied by rash, difficulty breathing, or seizures",
            "Baby appears very ill or lethargic"
        ]
    },
    {
        id: 2,
        title: "Common Cold",
        icon: "🤧",
        severity: "mild",
        description: "Viral infection affecting the nose and throat",
        symptoms: ["Runny or stuffy nose", "Sneezing", "Cough", "Mild fever", "Fussiness"],
        causes: ["Rhinovirus", "Other respiratory viruses", "Exposure to sick individuals"],
        treatment: [
            "Ensure adequate rest",
            "Keep baby well hydrated",
            "Use saline drops for stuffy nose",
            "Use humidifier in room",
            "Elevate head slightly during sleep"
        ],
        whenToSeek: [
            "Difficulty breathing",
            "Refusing to eat or drink",
            "Symptoms worsen after 7 days",
            "High fever (see fever guidelines)",
            "Ear pain or discharge"
        ]
    },
    {
        id: 3,
        title: "Diarrhea",
        icon: "💩",
        severity: "moderate",
        description: "Loose, watery stools occurring more frequently than normal",
        symptoms: ["Frequent watery stools", "Stomach cramps", "Fever", "Loss of appetite"],
        causes: ["Viral gastroenteritis", "Bacterial infection", "Food sensitivity", "Antibiotics"],
        treatment: [
            "Continue breastfeeding or formula",
            "Offer small, frequent feeds",
            "Watch for dehydration signs",
            "Avoid juice and sugary drinks",
            "Change diapers frequently to prevent rash"
        ],
        whenToSeek: [
            "Signs of dehydration (dry mouth, no tears, decreased urination)",
            "Blood in stool",
            "Severe abdominal pain",
            "High fever",
            "Diarrhea lasting more than 2 days in infants"
        ]
    },
    {
        id: 4,
        title: "Dehydration",
        icon: "💧",
        severity: "urgent",
        description: "Loss of too much fluid from the body",
        symptoms: ["Dry mouth and lips", "No tears when crying", "Sunken fontanelle", "Decreased urination", "Lethargy"],
        causes: ["Diarrhea", "Vomiting", "Fever", "Not drinking enough fluids"],
        treatment: [
            "Offer frequent small amounts of fluids",
            "Continue breastfeeding",
            "Use oral rehydration solution if recommended",
            "Seek medical attention promptly"
        ],
        whenToSeek: [
            "Any signs of dehydration in infants",
            "No wet diaper for 6-8 hours",
            "Sunken soft spot on head",
            "Extreme drowsiness",
            "Rapid breathing or heart rate"
        ]
    },
    {
        id: 5,
        title: "Diaper Rash",
        icon: "🧷",
        severity: "mild",
        description: "Red, irritated skin in the diaper area",
        symptoms: ["Red, inflamed skin", "Discomfort during diaper changes", "Small bumps or pimples"],
        causes: ["Prolonged wetness", "Friction", "Yeast infection", "Food sensitivity", "New products"],
        treatment: [
            "Change diapers frequently",
            "Clean gently with water",
            "Allow diaper-free time",
            "Apply barrier cream (zinc oxide)",
            "Avoid tight diapers"
        ],
        whenToSeek: [
            "Rash worsens after 3 days of treatment",
            "Pus-filled blisters",
            "Fever",
            "Rash spreads beyond diaper area",
            "Baby seems in severe pain"
        ]
    },
    {
        id: 6,
        title: "Colic",
        icon: "😭",
        severity: "mild",
        description: "Excessive crying in otherwise healthy baby",
        symptoms: ["Crying for 3+ hours/day, 3+ days/week", "Clenched fists", "Arched back", "Drawn-up legs"],
        causes: ["Unknown exact cause", "Digestive system immaturity", "Gas", "Overstimulation"],
        treatment: [
            "Try different soothing techniques",
            "Gentle rocking or swaying",
            "White noise or soft music",
            "Warm bath",
            "Burp frequently during feeding",
            "Consider formula change if recommended"
        ],
        whenToSeek: [
            "Baby has fever",
            "Vomiting or diarrhea",
            "Blood in stool",
            "Poor weight gain",
            "Crying pattern suddenly changes"
        ]
    },
    {
        id: 7,
        title: "Ear Infection",
        icon: "👂",
        severity: "moderate",
        description: "Infection of the middle ear, common after colds",
        symptoms: ["Ear pulling or tugging", "Fussiness", "Fever", "Difficulty sleeping", "Fluid drainage"],
        causes: ["Bacterial infection", "Viral infection", "Following upper respiratory infection"],
        treatment: [
            "See doctor for diagnosis",
            "Antibiotics if prescribed",
            "Pain relief as recommended",
            "Keep head elevated",
            "Warm compress on ear"
        ],
        whenToSeek: [
            "Suspected ear infection",
            "High fever",
            "Severe pain",
            "Fluid or pus draining",
            "Symptoms don't improve in 2-3 days"
        ]
    },
    {
        id: 8,
        title: "Cradle Cap",
        icon: "👶",
        severity: "mild",
        description: "Crusty, scaly patches on baby's scalp",
        symptoms: ["Yellow or white scales", "Flaky patches", "Mild redness", "May extend to face or ears"],
        causes: ["Excess oil production", "Yeast growth", "Hormonal factors"],
        treatment: [
            "Gently wash scalp daily",
            "Brush with soft brush",
            "Apply baby oil before washing",
            "Use mild baby shampoo",
            "Don't pick at scales"
        ],
        whenToSeek: [
            "Rash spreads to other body areas",
            "Looks infected (red, swollen, oozing)",
            "Not improving with home treatment",
            "Baby seems uncomfortable"
        ]
    }
];

let filteredConditions = [...HEALTH_CONDITIONS];

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    displayConditions();
});

// Display conditions
function displayConditions() {
    const grid = document.getElementById('conditionsGrid');
    grid.innerHTML = '';
    
    filteredConditions.forEach(condition => {
        const card = document.createElement('div');
        card.className = 'condition-card';
        card.onclick = () => showConditionDetail(condition.id);
        
        card.innerHTML = `
            <div class="condition-header">
                <div class="condition-icon">${condition.icon}</div>
                <div class="condition-title">
                    <h3>${condition.title}</h3>
                    <span class="condition-severity severity-${condition.severity}">${condition.severity}</span>
                </div>
            </div>
            <p class="condition-description">${condition.description}</p>
            <ul class="condition-symptoms">
                ${condition.symptoms.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                ${condition.symptoms.length > 3 ? '<li><em>Click to see more...</em></li>' : ''}
            </ul>
        `;
        
        grid.appendChild(card);
    });
    
    if (filteredConditions.length === 0) {
        grid.innerHTML = '<div class="card"><p>No conditions found matching your search.</p></div>';
    }
}

// Filter conditions
function filterConditions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredConditions = HEALTH_CONDITIONS.filter(condition => {
        return condition.title.toLowerCase().includes(searchTerm) ||
               condition.description.toLowerCase().includes(searchTerm) ||
               condition.symptoms.some(s => s.toLowerCase().includes(searchTerm));
    });
    
    displayConditions();
}

// Show condition detail
function showConditionDetail(conditionId) {
    const condition = HEALTH_CONDITIONS.find(c => c.id === conditionId);
    
    if (!condition) {
        console.error('Condition not found:', conditionId);
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modalTitle || !modalBody) {
        console.error('Modal elements not found');
        return;
    }
    
    modalTitle.textContent = `${condition.icon} ${condition.title}`;
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <p><strong>Description:</strong> ${condition.description}</p>
            <span class="condition-severity severity-${condition.severity}">${condition.severity.toUpperCase()}</span>
        </div>
        
        <div class="detail-section">
            <h4>Symptoms</h4>
            <ul>
                ${condition.symptoms.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        
        <div class="detail-section">
            <h4>Common Causes</h4>
            <ul>
                ${condition.causes.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
        
        <div class="detail-section">
            <h4>Home Treatment</h4>
            <ul>
                ${condition.treatment.map(t => `<li>${t}</li>`).join('')}
            </ul>
        </div>
        
        <div class="warning-box">
            <strong>⚠️ When to Seek Medical Help:</strong>
            <ul style="margin-top: 0.5rem;">
                ${condition.whenToSeek.map(w => `<li>${w}</li>`).join('')}
            </ul>
        </div>
        
        <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--gray-600);">
            <em>This information is for educational purposes only. Always consult your pediatrician for medical advice.</em>
        </p>
    `;
    
    const modal = document.getElementById('conditionModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('Modal element not found');
    }
}

// Close modal
function closeConditionModal() {
    const modal = document.getElementById('conditionModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('conditionModal');
    if (modal && event.target === modal) {
        closeConditionModal();
    }
}
