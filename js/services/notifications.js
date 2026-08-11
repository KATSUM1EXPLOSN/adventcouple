// Real-Time Notification & Web Push Service for AdventCouple

let isNotificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
let previousP2Completed = [];
let previousP2Fav = [];

let swRegistration = null;

export function initNotificationService() {
    createToastContainer();
    scheduleDailyEveningReminder();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                swRegistration = reg;
                console.log('PWA Service Worker registered:', reg);
            })
            .catch(err => {
                console.error('Service Worker registration failed:', err);
            });
    }
}

export function setNotificationsEnabled(enabled) {
    isNotificationsEnabled = enabled;
    localStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false');
}

export function requestBrowserNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToastNotification('🔔 Уведомления активированы!', 'Вы будете получать системные PUSH-напоминания на главный экран телефона.', 'success');
                setNotificationsEnabled(true);
            } else {
                showToastNotification('⚠️ Доступ ограничен', 'Разрешите уведомления в настройках вашего браузера/телефона.', 'warning');
            }
        });
    } else {
        alert('Ваш браузер или устройство не поддерживает системные Push-уведомления.');
    }
}

export function showToastNotification(title, message, type = 'info', onClickAction = null) {
    if (!isNotificationsEnabled && type !== 'system') return;

    playNotificationSound();

    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-banner toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').onclick = (e) => {
        e.stopPropagation();
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    };

    if (onClickAction) {
        toast.style.cursor = 'pointer';
        toast.onclick = (e) => {
            if (!e.target.classList.contains('toast-close')) {
                onClickAction();
                toast.classList.add('toast-fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        };
    }

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);

    // Системный PUSH браузера / PWA на главном экране смартфона
    if ('Notification' in window && Notification.permission === 'granted') {
        const notifOptions = {
            body: message,
            icon: './img/icon-192.png',
            badge: './img/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'adventcouple-notif',
            renotify: true,
            data: { url: window.location.href }
        };

        if (swRegistration && typeof swRegistration.showNotification === 'function') {
            swRegistration.showNotification(title, notifOptions).catch(() => {
                if (document.hidden) try { new Notification(title, notifOptions); } catch (e) {}
            });
        } else if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, notifOptions);
            }).catch(() => {
                if (document.hidden) try { new Notification(title, notifOptions); } catch (e) {}
            });
        } else if (document.hidden) {
            try { new Notification(title, notifOptions); } catch (e) {}
        }
    }
}


export function trackPartnerActivityNotifications(p2Completed, p2Fav, p1Fav) {
    // Check for newly completed days by partner
    if (previousP2Completed.length > 0) {
        const newlyCompleted = p2Completed.filter(d => !previousP2Completed.includes(d));
        if (newlyCompleted.length > 0) {
            const dayNum = newlyCompleted[0];
            showToastNotification('🔥 Партнер отреагировал!', `Партнер отметил прохождение Дня #${dayNum}!`, 'rose');
        }
    }
    previousP2Completed = [...p2Completed];

    // Check for newly favorited days by partner that match user's favorites
    if (previousP2Fav.length > 0) {
        const newlyFav = p2Fav.filter(d => !previousP2Fav.includes(d));
        if (newlyFav.length > 0) {
            const dayNum = newlyFav[0];
            if (p1Fav.includes(dayNum)) {
                showToastNotification('✨ Взаимное Совпадение!', `Партнер тоже добавил День #${dayNum} в Любимые позы!`, 'gold');
            } else {
                showToastNotification('⭐ Избранное Партнера', `Партнер добавил День #${dayNum} в свой список Желаний.`, 'info');
            }
        }
    }
    previousP2Fav = [...p2Fav];
}

function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

let audioCtx = null;

function getAudioContext() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    } catch (e) {
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('click', () => { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); });
    window.addEventListener('touchstart', () => { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); });
}

function playNotificationSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx || ctx.state !== 'running') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
}


function scheduleDailyEveningReminder() {
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 21 && now.getMinutes() === 0 && now.getSeconds() < 12) {
            const lastReminder = localStorage.getItem('lastEveningReminderDate');
            const todayStr = now.toDateString();
            if (lastReminder !== todayStr) {
                localStorage.setItem('lastEveningReminderDate', todayStr);
                showToastNotification('🕯️ Романтический Вечер!', 'Пора открыть карточку сегодняшнего дня и провести время вместе ❤️', 'rose');
            }
        }
    }, 10000);
}
