import { monthNames, daysInCurrentMonth, currentYear, currentMonth } from './config.js';
import { getTasksForMonth } from './data/database.js';
import { lingerieItems, toysItems, cheatKunItems, cheatMinItems } from './data/extras.js';
import { initSync, saveCompletedToDb, saveFavToDb, saveVotesToDb, fetchPartnerVotes } from './firebase.js';
import { checkBiometricSupport, registerBiometrics, authenticateBiometrics } from './auth.js';

let pairCode = localStorage.getItem('pairCode') || '';
let userRole = localStorage.getItem('userRole') || 'p1';
let selectedCategory = localStorage.getItem('userCat') || 'balanced';
let monthTasks = [];

let p1Completed = [];
let p2Completed = [];
let p1Fav = [];
let p2Fav = [];
let currentDay = null;
let onlyFavFilter = false;
let myVotes = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('monthTitle').innerText = `${monthNames[currentMonth]} ${currentYear} (${daysInCurrentMonth} дней)`;

    setupUIElements();
    setupEventListeners();

    checkBiometricSupport(pairCode, {
        onBiometricsActive: () => {
            document.getElementById('biometricLockBlock').style.display = 'block';
            document.getElementById('formSetupBlock').style.display = 'none';
        },
        onBiometricsAvailable: () => {
            document.getElementById('enableBiometricBtn').style.display = 'block';
        }
    });

    if (pairCode) {
        document.getElementById('pairCodeInput').value = pairCode;
        document.getElementById('userRoleSelect').value = userRole;
        document.getElementById('preferenceSelect').value = selectedCategory;

        if (localStorage.getItem('biometricsEnabled') === 'true') {
            showLandingScreen();
            authenticateBiometrics(showCalendarScreen);
        } else {
            showCalendarScreen();
        }
    } else {
        showLandingScreen();
    }
});

function showLandingScreen() {
    document.getElementById('landingScreen').style.display = 'flex';
    document.getElementById('calendarScreen').style.display = 'none';
}

function showCalendarScreen() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('calendarScreen').style.display = 'flex';
    monthTasks = getTasksForMonth(selectedCategory, pairCode);
    startSync();
    renderGrid();
}

function startSync() {
    initSync(pairCode, selectedCategory, userRole, {
        onP1Completed: (val) => { p1Completed = val; renderGrid(); },
        onP2Completed: (val) => { p2Completed = val; renderGrid(); },
        onP1Fav: (val) => { p1Fav = val; renderGrid(); },
        onP2Fav: (val) => { p2Fav = val; renderGrid(); }
    });
}

function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    const allFavDays = [...new Set([...p1Fav, ...p2Fav])];
    const tasksToRender = onlyFavFilter 
        ? monthTasks.filter(t => allFavDays.includes(t.day)) 
        : monthTasks;

    tasksToRender.forEach(task => {
        const hasP1 = p1Completed.includes(task.day);
        const hasP2 = p2Completed.includes(task.day);
        
        const isFavP1 = p1Fav.includes(task.day);
        const isFavP2 = p2Fav.includes(task.day);
        
        const card = document.createElement('div');
        card.id = `card-day-${task.day}`;
        
        let statusClass = '';
        if (hasP1 && hasP2) statusClass = 'completed-both';
        else if (hasP1) statusClass = 'completed-p1';
        else if (hasP2) statusClass = 'completed-p2';

        card.className = `day-card ${statusClass}`;
        
        let favTagHTML = '';
        if (isFavP1 && isFavP2) favTagHTML = `<div class="fav-tag fav-both">⭐ М+Ж</div>`;
        else if (isFavP1) favTagHTML = `<div class="fav-tag fav-p1">⭐ М</div>`;
        else if (isFavP2) favTagHTML = `<div class="fav-tag fav-p2">⭐ Ж</div>`;

        card.innerHTML = `
            ${favTagHTML}
            <div class="day-number">${task.day < 10 ? '0' + task.day : task.day}</div>
            <div class="day-category">${task.isGold ? '✨ СЮРПРИЗ' : task.category}</div>
            <div class="day-role ${task.roleClass}">${task.lead.split(' ')[1]}</div>
        `;
        card.onclick = () => openModal(task);
        grid.appendChild(card);
    });
    updateProgress();
}

function openModal(task) {
    currentDay = task.day;
    document.getElementById('modalTitle').innerText = task.title;
    document.getElementById('modalRole').innerText = task.lead;
    document.getElementById('modalImg').src = task.img;
    document.getElementById('modalTask').innerText = task.task;
    document.getElementById('modalTip').innerText = task.tip;
    
    const myCompleted = (userRole === 'p1') ? p1Completed : p2Completed;
    const isDone = myCompleted.includes(task.day);
    document.getElementById('completeBtn').innerText = isDone ? 'Отменить отметку ✖' : 'Отметить пройденным ✓';

    const myFav = (userRole === 'p1') ? p1Fav : p2Fav;
    const isFav = myFav.includes(task.day);
    document.getElementById('modalFavBtn').innerText = isFav ? '⭐' : '☆';
    document.getElementById('modal').style.display = 'flex';
}

function updateProgress() {
    const bothCount = monthTasks.filter(t => p1Completed.includes(t.day) && p2Completed.includes(t.day)).length;
    const percent = Math.round((bothCount / daysInCurrentMonth) * 100);
    
    document.getElementById('progressText').innerText = `Совместный прогресс: ${bothCount} / ${daysInCurrentMonth} дней`;
    document.getElementById('progressPercent').innerText = `${percent}%`;
    document.getElementById('progressFill').style.width = `${percent}%`;

    let badge = "🏆 Статус: Новички";
    if (bothCount >= 25) badge = "👑 Статус: Мастера Интимности";
    else if (bothCount >= 18) badge = "🔥 Статус: Огненный Союз";
    else if (bothCount >= 10) badge = "🧘‍♀️ Статус: Исследователи";
    else if (bothCount >= 3) badge = "✨ Статус: Первый Шаг";

    document.getElementById('achievement').innerText = badge;
}

function setupUIElements() {
    const lingerieContainer = document.getElementById('lingerieContent');
    lingerieContainer.innerHTML = lingerieItems.map(item => `
        <div class="cheat-item">
            <h4>${item.title}</h4>
            <p>${item.text}</p>
        </div>
    `).join('');

    const toysContainer = document.getElementById('toysContent');
    toysContainer.innerHTML = toysItems.map(item => `
        <div class="cheat-item">
            <h4>${item.title}</h4>
            <p>${item.text}</p>
        </div>
    `).join('');

    renderCheatSheets();
}

function renderCheatSheets() {
    const kunBlock = document.getElementById('cheatKunBlock');
    kunBlock.innerHTML = `
        <details class="anatomy-spoiler">
            <summary>🗺️ Анатомическая схема клитора и вульвы (Спойлер)</summary>
            <div class="anatomy-content">
                <img class="anatomy-img" src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80" alt="Анатомия Клитора">
                <b>Ключевые точки стимуляции:</b><br>
                • <b>Головка клитора:</b> Содержит >10 000 нервных окончаний.<br>
                • <b>Точка G:</b> Находится на передней стенке влагалища на глубине 3-5 см.
            </div>
        </details>
    ` + cheatKunItems.map(item => `
        <div class="cheat-item">
            <h4>${item.title}</h4>
            <p>${item.text}</p>
            <div class="cheat-links"><a class="cheat-link" href="${item.link}" target="_blank">▶️ YouTube</a></div>
        </div>
    `).join('');

    const minBlock = document.getElementById('cheatMinBlock');
    minBlock.innerHTML = `
        <details class="anatomy-spoiler">
            <summary>🗺️ Анатомическая схема пениса и уздечки (Спойлер)</summary>
            <div class="anatomy-content">
                <img class="anatomy-img" src="https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80" alt="Анатомия Пениса">
                <b>Ключевые точки стимуляции:</b><br>
                • <b>Уздечка:</b> Треугольная зона снизу под головкой.<br>
                • <b>Промежность (Шов):</b> Зона между мошонкой и анусом.
            </div>
        </details>
    ` + cheatMinItems.map(item => `
        <div class="cheat-item">
            <h4>${item.title}</h4>
            <p>${item.text}</p>
            <div class="cheat-links"><a class="cheat-link" href="${item.link}" target="_blank">▶️ YouTube</a></div>
        </div>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('saveEnterBtn').onclick = () => {
        const rawCode = document.getElementById('pairCodeInput').value.trim().toUpperCase();
        if (!rawCode || rawCode.length < 4) {
            alert("❌ Код пары слишком короткий! Введите уникальный код минимум из 4 символов.");
            document.getElementById('pairCodeInput').focus();
            return;
        }

        const sanitizedCode = rawCode.replace(/[^A-Z0-9_А-Я]/g, '');
        pairCode = sanitizedCode;
        userRole = document.getElementById('userRoleSelect').value;
        selectedCategory = document.getElementById('preferenceSelect').value;

        localStorage.setItem('pairCode', pairCode);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userCat', selectedCategory);

        showCalendarScreen();
    };

    document.getElementById('faceIdBtn').onclick = () => authenticateBiometrics(showCalendarScreen);
    document.getElementById('enableBiometricBtn').onclick = () => registerBiometrics(pairCode, userRole, () => {
        document.getElementById('enableBiometricBtn').style.display = 'none';
        document.getElementById('biometricLockBlock').style.display = 'block';
        document.getElementById('formSetupBlock').style.display = 'none';
    });

    document.getElementById('completeBtn').onclick = () => {
        let myCompleted = (userRole === 'p1') ? p1Completed : p2Completed;
        if (myCompleted.includes(currentDay)) {
            myCompleted = myCompleted.filter(d => d !== currentDay);
        } else {
            myCompleted.push(currentDay);
        }

        if (userRole === 'p1') p1Completed = myCompleted;
        else p2Completed = myCompleted;

        saveCompletedToDb(pairCode, selectedCategory, userRole, myCompleted);
        renderGrid();
        document.getElementById('modal').style.display = 'none';
    };

    document.getElementById('modalFavBtn').onclick = () => {
        let myFav = (userRole === 'p1') ? p1Fav : p2Fav;
        if (myFav.includes(currentDay)) {
            myFav = myFav.filter(d => d !== currentDay);
        } else {
            myFav.push(currentDay);
        }

        if (userRole === 'p1') p1Fav = myFav;
        else p2Fav = myFav;

        saveFavToDb(pairCode, userRole, myFav);
        document.getElementById('modalFavBtn').innerText = myFav.includes(currentDay) ? '⭐' : '☆';
        renderGrid();
    };

    document.getElementById('resetSettingsBtn').onclick = () => {
        document.getElementById('formSetupBlock').style.display = 'block';
        showLandingScreen();
    };

    document.getElementById('refreshBtn').onclick = () => {
        if (pairCode) {
            startSync();
            monthTasks = getTasksForMonth(selectedCategory, pairCode);
            renderGrid();
        }
    };

    document.getElementById('favFilterBtn').onclick = () => {
        onlyFavFilter = !onlyFavFilter;
        const btn = document.getElementById('favFilterBtn');
        btn.style.background = onlyFavFilter ? 'var(--accent-gold)' : 'rgba(226, 176, 126, 0.15)';
        btn.style.color = onlyFavFilter ? '#0f0d13' : 'var(--accent-gold)';
        renderGrid();
    };

    document.getElementById('spinRouletteBtn').onclick = () => {
        const bothCompleted = monthTasks.filter(t => p1Completed.includes(t.day) && p2Completed.includes(t.day)).map(t => t.day);
        const available = monthTasks.filter(t => !bothCompleted.includes(t.day));
        if (available.length === 0) {
            alert("Все дни пройдены обоими партнерами!");
            return;
        }
        let count = 0;
        const interval = setInterval(() => {
            const randomTask = available[Math.floor(Math.random() * available.length)];
            document.querySelectorAll('.day-card').forEach(c => c.classList.remove('highlight'));
            const el = document.getElementById(`card-day-${randomTask.day}`);
            if (el) el.classList.add('highlight');
            count++;
            if (count >= 12) {
                clearInterval(interval);
                setTimeout(() => openModal(randomTask), 300);
            }
        }, 100);
    };

    // Окна / Модалки
    document.getElementById('openPwaBtn').onclick = () => document.getElementById('pwaModal').style.display = 'flex';
    document.getElementById('closePwaBtn').onclick = () => document.getElementById('pwaModal').style.display = 'none';
    document.getElementById('closePwaBtnMain').onclick = () => document.getElementById('pwaModal').style.display = 'none';

    document.getElementById('closeTaskModalBtn').onclick = () => document.getElementById('modal').style.display = 'none';

    document.getElementById('openLingerieBtn').onclick = () => document.getElementById('lingerieModal').style.display = 'flex';
    document.getElementById('closeLingerieBtn').onclick = () => document.getElementById('lingerieModal').style.display = 'none';
    document.getElementById('closeLingerieBtnMain').onclick = () => document.getElementById('lingerieModal').style.display = 'none';

    document.getElementById('openToysBtn').onclick = () => document.getElementById('toysModal').style.display = 'flex';
    document.getElementById('closeToysBtn').onclick = () => document.getElementById('toysModal').style.display = 'none';
    document.getElementById('closeToysBtnMain').onclick = () => document.getElementById('toysModal').style.display = 'none';

    document.getElementById('openCheatBtn').onclick = () => document.getElementById('cheatSheetModal').style.display = 'flex';
    document.getElementById('closeCheatSheetBtn').onclick = () => document.getElementById('cheatSheetModal').style.display = 'none';
    document.getElementById('closeCheatSheetBtnMain').onclick = () => document.getElementById('cheatSheetModal').style.display = 'none';

    document.getElementById('btnKun').onclick = () => {
        document.getElementById('cheatKunBlock').style.display = 'block';
        document.getElementById('cheatMinBlock').style.display = 'none';
        document.getElementById('btnKun').classList.add('active');
        document.getElementById('btnMin').classList.remove('active');
    };

    document.getElementById('btnMin').onclick = () => {
        document.getElementById('cheatKunBlock').style.display = 'none';
        document.getElementById('cheatMinBlock').style.display = 'block';
        document.getElementById('btnMin').classList.add('active');
        document.getElementById('btnKun').classList.remove('active');
    };

    document.getElementById('openGeneratorBtn').onclick = () => {
        const container = document.getElementById('surveyContainer');
        container.innerHTML = '';
        monthTasks.forEach(task => {
            const div = document.createElement('div');
            div.style.marginBottom = "15px";
            div.style.background = "#120f1a";
            div.style.padding = "10px";
            div.style.borderRadius = "10px";
            div.innerHTML = `
                <div style="font-size:0.85rem; font-weight:bold; color:var(--accent-gold);">${task.title}</div>
                <div class="vote-options">
                    <button class="btn-vote" data-id="${task.id}" data-val="yes">Да 🔥</button>
                    <button class="btn-vote" data-id="${task.id}" data-val="maybe">Возможно 💭</button>
                    <button class="btn-vote" data-id="${task.id}" data-val="no">Нет ❌</button>
                </div>
            `;
            container.appendChild(div);
        });

        document.querySelectorAll('.btn-vote').forEach(btn => {
            btn.onclick = (e) => {
                const taskId = e.target.getAttribute('data-id');
                const val = e.target.getAttribute('data-val');
                myVotes[taskId] = val;

                const parent = e.target.parentElement;
                parent.querySelectorAll('.btn-vote').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            };
        });

        document.getElementById('generatorModal').style.display = 'flex';
    };

    document.getElementById('closeGeneratorBtn').onclick = () => document.getElementById('generatorModal').style.display = 'none';

    document.getElementById('checkMatchesBtn').onclick = () => {
        if (!pairCode) {
            alert("Укажите Код Пары в настройках!");
            return;
        }

        saveVotesToDb(pairCode, userRole, myVotes);

        const partnerRole = userRole === 'p1' ? 'p2' : 'p1';
        fetchPartnerVotes(pairCode, partnerRole, (partnerVotes) => {
            let matchesCount = 0;
            let myFav = (userRole === 'p1') ? p1Fav : p2Fav;

            monthTasks.forEach(task => {
                const myV = myVotes[task.id];
                const pV = partnerVotes[task.id];
                
                if ((myV === 'yes' && pV === 'yes') || (myV === 'yes' && pV === 'maybe') || (myV === 'maybe' && pV === 'yes')) {
                    if (!myFav.includes(task.day)) myFav.push(task.day);
                    matchesCount++;
                }
            });

            if (userRole === 'p1') p1Fav = myFav;
            else p2Fav = myFav;

            saveFavToDb(pairCode, userRole, myFav);
            renderGrid();
            document.getElementById('generatorModal').style.display = 'none';

            if (matchesCount > 0) {
                alert(`🔥 Найдено совпадений: ${matchesCount}! Они добавлены в ваше Избранное ⭐`);
            } else {
                alert("Партнер еще не прошел опрос. Данные обновятся, когда партнер сделает свой выбор!");
            }
        });
    };
}
