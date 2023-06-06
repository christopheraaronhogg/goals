// Variables
const goalList = document.getElementById('goal-list');
const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const downloadButton = document.getElementById('download-goals');
const uploadInput = document.getElementById('upload-goals');
const uploadLabel = document.querySelector('.upload-label');

// Functions
function addGoal(goalText) {
    const goalItem = document.createElement('li');
    goalItem.textContent = goalText;
    goalItem.setAttribute('draggable', 'true');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    goalItem.appendChild(deleteButton);

    goalList.appendChild(goalItem);
}

function saveGoals() {
    const goals = Array.from(goalList.children).map((item) => item.firstChild.textContent);
    localStorage.setItem('goals', JSON.stringify(goals));
}

function loadGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    goals.forEach((goal) => addGoal(goal));
}

function downloadGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const data = JSON.stringify(goals, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'goals.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadGoals(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            try {
                const goals = JSON.parse(data);
                console.log('Parsed goals:', goals);
                if (Array.isArray(goals)) {
                    goalList.innerHTML = '';
                    goals.forEach((goal) => addGoal(goal));
                    saveGoals();
                } else {
                    alert('Invalid JSON file. Please upload a valid goals JSON file.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error parsing JSON file. Please upload a valid goals JSON file.');
            }
        };
        reader.readAsText(file);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Event Listeners
goalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const goalText = goalInput.value.trim();
    if (goalText) {
        addGoal(goalText);
        goalInput.value = '';
        saveGoals();
    }
});

goalList.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const goalItem = event.target.parentNode;
        goalList.removeChild(goalItem);
        saveGoals();
    }
});

goalList.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', event.target.id);
    event.target.classList.add('dragging');
});

goalList.addEventListener('dragover', (event) => {
    event.preventDefault();
    const draggable = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(goalList, event.clientY);
    if (afterElement == null) {
        goalList.appendChild(draggable);
    } else {
        goalList.insertBefore(draggable, afterElement);
    }
});

goalList.addEventListener('dragend', (event) => {
    event.target.classList.remove('dragging');
    saveGoals();
});

downloadButton.addEventListener('click', downloadGoals);
uploadInput.addEventListener('change', uploadGoals);
uploadLabel.addEventListener('click', () => uploadInput.click());

// Initialize
document.addEventListener('DOMContentLoaded', loadGoals);