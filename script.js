// ====== DONNÉES GLOBALES ======
let timezones = [
    { city: 'Paris', timezone: 'Europe/Paris' },
    { city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { city: 'New York', timezone: 'America/New_York' }
];

let stopwatchInterval = null;
let stopwatchTime = 0;
let stopwatchRunning = false;
let laps = [];

let timerInterval = null;
let timerTime = 0;
let timerRunning = false;

// ====== HORLOGE MULTI-FUSEAUX ======
function updateClocks() {
    const grid = document.getElementById('timezoneGrid');
    grid.innerHTML = '';

    timezones.forEach((tz, index) => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('fr-FR', {
            timeZone: tz.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const parts = formatter.formatToParts(now);
        const time = `${parts[6].value}:${parts[4].value}:${parts[2].value}`;
        const date = `${parts[0].value}/${parts[2].value}/${parts[4].value}`;

        const card = document.createElement('div');
        card.className = 'timezone-card';
        card.innerHTML = `
            <div class="city">${tz.city}</div>
            <div class="time">${time}</div>
            <div class="date">${date}</div>
            <button class="delete-btn" onclick="removeTimezone(${index})">Supprimer</button>
        `;
        grid.appendChild(card);
    });
}

function addTimezone() {
    const input = document.getElementById('cityInput');
    const city = input.value.trim();

    if (!city) {
        alert('Veuillez entrer un nom de ville');
        return;
    }

    // Mapping simplifié de villes vers fuseaux horaires
    const cityToTimezone = {
        'paris': 'Europe/Paris',
        'london': 'Europe/London',
        'tokyo': 'Asia/Tokyo',
        'new york': 'America/New_York',
        'sydney': 'Australia/Sydney',
        'dubai': 'Asia/Dubai',
        'bangkok': 'Asia/Bangkok',
        'mumbai': 'Asia/Kolkata',
        'los angeles': 'America/Los_Angeles',
        'toronto': 'America/Toronto',
        'mexico city': 'America/Mexico_City',
        'buenos aires': 'America/Argentina/Buenos_Aires',
        'moscow': 'Europe/Moscow',
        'istanbul': 'Europe/Istanbul',
        'hong kong': 'Asia/Hong_Kong',
        'singapore': 'Asia/Singapore',
        'auckland': 'Pacific/Auckland'
    };

    const timezone = cityToTimezone[city.toLowerCase()];

    if (!timezone) {
        alert('Ville non trouvée. Essayez: Paris, Tokyo, New York, Londres, Sydney, etc.');
        return;
    }

    if (timezones.some(tz => tz.city.toLowerCase() === city.toLowerCase())) {
        alert('Cette ville est déjà ajoutée');
        return;
    }

    timezones.push({ city: city.charAt(0).toUpperCase() + city.slice(1), timezone });
    input.value = '';
    updateClocks();
}

function removeTimezone(index) {
    timezones.splice(index, 1);
    updateClocks();
}

// ====== CHRONOMÈTRE ======
function startStopwatch() {
    const btn = document.getElementById('startStopBtn');

    if (stopwatchRunning) {
        clearInterval(stopwatchInterval);
        btn.textContent = 'Démarrer';
        stopwatchRunning = false;
    } else {
        stopwatchInterval = setInterval(() => {
            stopwatchTime += 10;
            updateStopwatchDisplay();
        }, 10);
        btn.textContent = 'Arrêter';
        stopwatchRunning = true;
    }
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    stopwatchRunning = false;
    laps = [];
    document.getElementById('startStopBtn').textContent = 'Démarrer';
    updateStopwatchDisplay();
    document.getElementById('lapsList').innerHTML = '';
}

function lapStopwatch() {
    if (stopwatchRunning) {
        laps.push(stopwatchTime);
        const lapTime = formatTime(stopwatchTime);
        const lapElement = document.createElement('li');
        lapElement.textContent = `Tour ${laps.length}: ${lapTime}`;
        document.getElementById('lapsList').appendChild(lapElement);
    }
}

function updateStopwatchDisplay() {
    document.getElementById('stopwatchDisplay').textContent = formatTime(stopwatchTime);
}

// ====== MINUTEUR ======
function startTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        document.getElementById('timerStartBtn').textContent = 'Démarrer';
        timerRunning = false;
        return;
    }

    if (timerTime === 0) {
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        timerTime = (minutes * 60 + seconds) * 1000;

        if (timerTime === 0) {
            alert('Veuillez entrer un temps');
            return;
        }
    }

    timerInterval = setInterval(() => {
        timerTime -= 10;
        if (timerTime <= 0) {
            timerTime = 0;
            clearInterval(timerInterval);
            document.getElementById('timerStartBtn').textContent = 'Démarrer';
            timerRunning = false;
            alert('Temps écoulé!');
        }
        updateTimerDisplay();
    }, 10);

    document.getElementById('timerStartBtn').textContent = 'Arrêter';
    timerRunning = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerTime = 0;
    timerRunning = false;
    document.getElementById('timerStartBtn').textContent = 'Démarrer';
    document.getElementById('timerMinutes').value = '';
    document.getElementById('timerSeconds').value = '';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = formatTime(timerTime);
}

// ====== UTILITAIRES ======
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ====== INITIALISATION ======
window.addEventListener('load', () => {
    updateClocks();
    setInterval(updateClocks, 1000);
    updateStopwatchDisplay();
    updateTimerDisplay();
});
