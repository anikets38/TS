// ================================
// VACCINATION PAGE SCRIPT
// ================================

let currentBabyId = null;
let vaccinations = [];

document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    loadBabies();
    
    // Set max date to today
    document.getElementById('dateGiven').max = new Date().toISOString().split('T')[0];
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
            loadVaccinations();
        }
    } catch (error) {
        console.error('Error loading babies:', error);
    }
}

// Load vaccinations
async function loadVaccinations() {
    const select = document.getElementById('babySelect');
    currentBabyId = select.value;
    
    if (!currentBabyId) {
        document.getElementById('progressCard').style.display = 'none';
        document.getElementById('initializeBtn').style.display = 'none';
        return;
    }
    
    try {
        const response = await apiCall(`/vaccination/${currentBabyId}`, 'GET');
        
        if (response.success && response.data.length > 0) {
            vaccinations = response.data;
            document.getElementById('progressCard').style.display = 'block';
            document.getElementById('initializeBtn').style.display = 'none';
            displayVaccinations();
            updateProgress();
        } else {
            // No vaccinations found - show initialize button
            document.getElementById('progressCard').style.display = 'none';
            document.getElementById('initializeBtn').style.display = 'block';
            displayEmptyState();
        }
    } catch (error) {
        console.error('Error loading vaccinations:', error);
    }
}

// Initialize schedule
async function initializeSchedule() {
    if (!currentBabyId) {
        showToast('Please select a baby first', 'error');
        return;
    }
    
    const btn = document.getElementById('initializeBtn');
    showLoading(btn);
    
    try {
        const response = await apiCall(`/vaccination/initialize/${currentBabyId}`, 'POST');
        
        if (response.success) {
            showToast('Vaccination schedule initialized!', 'success');
            loadVaccinations();
        }
    } catch (error) {
        showToast(error.message || 'Error initializing schedule', 'error');
        hideLoading(btn);
    }
}

// Display vaccinations
function displayVaccinations() {
    const tbody = document.getElementById('vaccineTableBody');
    tbody.innerHTML = '';
    
    vaccinations.forEach(vac => {
        const row = document.createElement('tr');
        const status = getVaccineStatus(vac);
        
        row.innerHTML = `
            <td>
                <div class="vaccine-name">${vac.name}</div>
                <div class="vaccine-details">${vac.description || ''}</div>
            </td>
            <td>${vac.recommendedAge}</td>
            <td><span class="status-badge ${status}">${status}</span></td>
            <td>${vac.dateGiven ? formatDate(vac.dateGiven) : '-'}</td>
            <td>
                ${status !== 'completed' ? 
                    `<button class="btn btn-sm btn-primary" onclick="openMarkModal('${vac._id}')">Mark Complete</button>` : 
                    `<button class="btn btn-sm btn-outline" onclick="viewDetails('${vac._id}')">View Details</button>`
                }
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get vaccine status
function getVaccineStatus(vac) {
    if (vac.status === 'completed') return 'completed';
    
    const recommendedDate = new Date(vac.recommendedDate);
    const today = new Date();
    
    if (today > recommendedDate) return 'overdue';
    return 'upcoming';
}

// Update progress
function updateProgress() {
    const completed = vaccinations.filter(v => v.status === 'completed').length;
    const overdue = vaccinations.filter(v => getVaccineStatus(v) === 'overdue').length;
    const upcoming = vaccinations.length - completed - overdue;
    const percentage = Math.round((completed / vaccinations.length) * 100);
    
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${percentage}% complete`;
}

// Display empty state
function displayEmptyState() {
    const tbody = document.getElementById('vaccineTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-message">
                No vaccination schedule found. Click "Initialize Schedule" to create one.
            </td>
        </tr>
    `;
}

// Open mark complete modal
function openMarkModal(vaccineId) {
    const vaccine = vaccinations.find(v => v._id === vaccineId);
    
    if (!vaccine) {
        console.error('Vaccine not found:', vaccineId);
        return;
    }
    
    const vaccineIdInput = document.getElementById('vaccineId');
    const vaccineNameElement = document.getElementById('modalVaccineName');
    const dateGivenInput = document.getElementById('dateGiven');
    const modal = document.getElementById('markCompleteModal');
    
    if (!vaccineIdInput || !vaccineNameElement || !dateGivenInput || !modal) {
        console.error('Modal elements not found');
        return;
    }
    
    vaccineIdInput.value = vaccineId;
    vaccineNameElement.textContent = vaccine.name;
    dateGivenInput.value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('markCompleteModal');
    const form = document.getElementById('markCompleteForm');
    
    if (modal) {
        modal.classList.remove('active');
    }
    if (form) {
        form.reset();
    }
}

// Mark complete form submission
const markCompleteForm = document.getElementById('markCompleteForm');
if (markCompleteForm) {
    markCompleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const vaccineId = document.getElementById('vaccineId').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        showLoading(submitBtn);
        
        const data = {
            status: 'completed',
            dateGiven: document.getElementById('dateGiven').value,
            administeredBy: document.getElementById('administeredBy').value,
            batchNumber: document.getElementById('batchNumber').value,
            location: document.getElementById('location').value,
            notes: document.getElementById('notes').value
        };
        
        try {
            const response = await apiCall(`/vaccination/${vaccineId}`, 'PUT', data);
            
            if (response.success) {
                showToast('Vaccination marked as completed!', 'success');
                closeModal();
                loadVaccinations();
            }
        } catch (error) {
            showToast(error.message || 'Error updating vaccination', 'error');
            hideLoading(submitBtn);
        }
    });
}

// View details (future enhancement)
function viewDetails(vaccineId) {
    const vaccine = vaccinations.find(v => v._id === vaccineId);
    if (!vaccine) return;
    
    const details = `
Vaccine: ${vaccine.name}
Date Given: ${formatDate(vaccine.dateGiven)}
Administered By: ${vaccine.administeredBy || 'N/A'}
Batch Number: ${vaccine.batchNumber || 'N/A'}
Location: ${vaccine.location || 'N/A'}
Notes: ${vaccine.notes || 'N/A'}
    `;
    
    alert(details);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('markCompleteModal');
    if (modal && event.target === modal) {
        closeModal();
    }
}
