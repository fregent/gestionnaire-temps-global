// ====== DONNÉES GLOBALES ======
let timezones = [
    { city: 'Paris', timezone: 'Europe/Paris' },
    { city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { city: 'New York', timezone: 'America/New_York' }
];

let stopwatchInterval = null;
let stopwatchStartTime = 0;
let stopwatchPausedTime = 0;
let stopwatchRunning = false;
let laps = [];

let timerInterval = null;
let timerStartTime = 0;
let timerDuration = 0;
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
            
            // Déclenche l'alarme
            triggerAlarm('timer');
        }
    }
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

// ====== GÉNÉRATEUR DE SON CONTINU (WEB AUDIO API) ======
class SoundGenerator {
    constructor() {
        this.audioContext = null;
        this.oscillators = [];
        this.gainNodes = [];
        this.isPlaying = false;
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

        // Crée 3 bips successifs (son court)
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

    // ====== ALARME CONTINUE ======
    startAlarmSound() {
        this.init();
        if (this.isPlaying) return;

        this.isPlaying = true;
        const ctx = this.audioContext;

        // Crée une alarme qui alterne entre deux fréquences
        const playAlarmPattern = () => {
            if (!this.isPlaying) return;

            const now = ctx.currentTime;
            const frequencies = [600, 800];
            const duration = 0.3;
            const gap = 0.1;

            frequencies.forEach((freq, index) => {
                const startTime = now + index * (duration + gap);
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.4, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                osc.start(startTime);
                osc.stop(startTime + duration);

                this.oscillators.push(osc);
                this.gainNodes.push(gain);
            });

            // Répète le pattern toutes les 0.7 secondes
            setTimeout(playAlarmPattern, 700);
        };

        playAlarmPattern();
    }

    stopAlarmSound() {
        this.isPlaying = false;
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // L'oscillateur s'est déjà arrêté
            }
        });
        this.oscillators = [];
        this.gainNodes = [];
    }
}

const soundGenerator = new SoundGenerator();

// ====== GESTION DE L'ALARME ======
let alarmType = null; // 'stopwatch' ou 'timer'

function triggerAlarm(type) {
    alarmType = type;
    const modal = document.getElementById('alarmModal');
    const message = document.getElementById('alarmMessage');

    if (type === 'stopwatch') {
        message.textContent = 'Le chronomètre a atteint son objectif!';
    } else {
        message.textContent = 'Le minuteur est écoulé!';
    }

    modal.classList.add('active');
    soundGenerator.startAlarmSound();
    
    // Vibre le téléphone si possible
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
}

function stopAlarm() {
    const modal = document.getElementById('alarmModal');
    modal.classList.remove('active');
    soundGenerator.stopAlarmSound();
    alarmType = null;
}

// Ferme l'alarme si on clique en dehors de la modal
document.addEventListener('click', (e) => {
    const modal = document.getElementById('alarmModal');
    if (e.target === modal) {
        stopAlarm();
    }
});

// Ferme l'alarme avec la touche Échap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        stopAlarm();
    }
});
