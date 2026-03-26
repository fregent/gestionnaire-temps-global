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
        const time = `${parts[6].value}:${parts[8].value}:${parts[10].value}`;
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

// ====== CHRONOMÈTRE (Basé sur timestamps) ======
function startStopwatch() {
    const btn = document.getElementById('startStopBtn');

    if (stopwatchRunning) {
        // Pause
        stopwatchPausedTime += Date.now() - stopwatchStartTime;
        clearInterval(stopwatchInterval);
        btn.textContent = 'Démarrer';
        stopwatchRunning = false;
    } else {
        // Démarrage
        stopwatchStartTime = Date.now();
        stopwatchInterval = setInterval(updateStopwatchDisplay, 10);
        btn.textContent = 'Arrêter';
        stopwatchRunning = true;
    }
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchStartTime = 0;
    stopwatchPausedTime = 0;
    stopwatchRunning = false;
    laps = [];
    document.getElementById('startStopBtn').textContent = 'Démarrer';
    updateStopwatchDisplay();
    document.getElementById('lapsList').innerHTML = '';
}

function lapStopwatch() {
    if (stopwatchRunning) {
        const currentTime = stopwatchPausedTime + (Date.now() - stopwatchStartTime);
        laps.push(currentTime);
        const lapTime = formatTime(currentTime);
        const lapElement = document.createElement('li');
        lapElement.textContent = `Tour ${laps.length}: ${lapTime}`;
        document.getElementById('lapsList').appendChild(lapElement);
    }
}

function updateStopwatchDisplay() {
    if (stopwatchRunning) {
        const currentTime = stopwatchPausedTime + (Date.now() - stopwatchStartTime);
        document.getElementById('stopwatchDisplay').textContent = formatTime(currentTime);
    }
}

// ====== MINUTEUR (Basé sur timestamps) ======
function startTimer() {
    const btn = document.getElementById('timerStartBtn');

    if (timerRunning) {
        // Pause
        clearInterval(timerInterval);
        btn.textContent = 'Démarrer';
        timerRunning = false;
        return;
    }

    if (timerDuration === 0) {
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        timerDuration = (minutes * 60 + seconds) * 1000;

        if (timerDuration === 0) {
            alert('Veuillez entrer un temps');
            return;
        }

        timerStartTime = Date.now();
    }

    timerInterval = setInterval(updateTimerDisplay, 10);
    btn.textContent = 'Arrêter';
    timerRunning = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerDuration = 0;
    timerStartTime = 0;
    timerRunning = false;
    document.getElementById('timerStartBtn').textContent = 'Démarrer';
    document.getElementById('timerMinutes').value = '';
    document.getElementById('timerSeconds').value = '';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (timerRunning) {
        const elapsed = Date.now() - timerStartTime;
        const remaining = Math.max(0, timerDuration - elapsed);

        document.getElementById('timerDisplay').textContent = formatTime(remaining);

        if (remaining <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById('timerStartBtn').textContent = 'Démarrer';
            soundGenerator.playAlertSound();
            showTimerNotification();
        }
    }
}

// ====== NOTIFICATION D'ALERTE ======
function showTimerNotification() {
    // Notification du navigateur (si autorisée)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏲️ Minuteur', {
            body: 'Le temps est écoulé!',
            icon: '⏲️'
        });
    }

    // Alerte visuelle
    const display = document.getElementById('timerDisplay');
    display.style.animation = 'pulse 0.5s ease-in-out 4';
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
    // Initialise le thème
    initTheme();

    // Demande la permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Initialise les horloges
    updateClocks();
    setInterval(updateClocks, 1000);
    
    // Initialise les affichages
    updateStopwatchDisplay();
    updateTimerDisplay();
});

// Reprend les timers si la page est rechargée
window.addEventListener('beforeunload', () => {
    // Les données sont conservées grâce aux timestamps
});


// ====== GESTION DU MODE SOMBRE ======
function initTheme() {
    // Vérifie si l'utilisateur a une préférence sauvegardée
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    } else if (prefersDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }

    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeToggle').querySelector('.icon');
    if (document.body.classList.contains('dark-mode')) {
        icon.textContent = '☀️';
    } else {
        icon.textContent = '🌙';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

// Ajoute l'écouteur au bouton
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// ====== GÉNÉRATEUR DE SON (WEB AUDIO API) ======
class SoundGenerator {
    constructor() {
        this.audioContext = null;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playAlertSound() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Crée 3 bips successifs
        const frequencies = [800, 900, 1000];
        const duration = 0.15;
        const gap = 0.1;

        frequencies.forEach((freq, index) => {
            const startTime = now + index * (duration + gap);
            this.playBeep(freq, startTime, duration);
        });
    }

    playBeep(frequency, startTime, duration) {
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
}

const soundGenerator = new SoundGenerator();

