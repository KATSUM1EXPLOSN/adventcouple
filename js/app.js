import { monthNames, daysInCurrentMonth, currentYear, currentMonth } from './config.js';
import { getTasksForMonth } from './data/database.js';
import { lingerieItems, toysItems, cheatKunItems, cheatMinItems } from './data/extras.js';
import { wheelLocations, wheelLingeries, wheelStyles, speakTaskTip, achievementsData } from './data/interactive.js';
import { initSync, saveCompletedToDb, saveFavToDb, saveVotesToDb, fetchPartnerVotes, saveStatusToDb, listenPartnerStatus, saveFeedbackToDb, listenFeedbackFromDb } from './firebase.js';
import { checkBiometricSupport, registerBiometrics, authenticateBiometrics } from './auth.js';
import { getCouplePoints, addCouplePoints, triggerConfetti, shareAchievement, shopItems, redeemShopItem, sendChallenge, initChallengeListener } from './services/gamification.js';
import { renderAnalyticsCharts } from './services/analytics.js';
import { initStealthAndSecurity, toggleStealthMode, exportEncryptedData, importEncryptedData } from './services/security.js';

let pairCode = localStorage.getItem('pairCode') || '';
let userRole = localStorage.getItem('userRole') || 'p1';
let selectedCategory = localStorage.getItem('userCat') || 'balanced';
let monthTasks = [];
let activeMonthOffset = 0; // Для листания архива месяцев

let p1Completed = [];
let p2Completed = [];
let p1Fav = [];
let p2Fav = [];
let currentDay = null;
let currentRating = 0;
let onlyFavFilter = false;
let myVotes = {};

if (localStorage.getItem('hideScrollbars') !== 'false') {
    document.body.classList.add('no-scrollbars-all');
}


function applyTheme(themeName) {
    if (!themeName) themeName = localStorage.getItem('userTheme') || 'gold';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('userTheme', themeName);

    document.querySelectorAll('.theme-option-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.getElementById('monthTitle').innerText = `${monthNames[currentMonth]} ${currentYear} (${daysInCurrentMonth} дней)`;

    setupUIElements();
    setupEventListeners();
    initStealthAndSecurity();

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


function getActiveMonthKey() {
    const targetDate = new Date(currentYear, currentMonth + activeMonthOffset, 1);
    return `${targetDate.getFullYear()}_${targetDate.getMonth()}`;
}

function showLandingScreen() {
    document.getElementById('landingScreen').style.display = 'flex';
    document.getElementById('calendarScreen').style.display = 'none';
}

function updateMonthDisplayAndTasks() {
    const targetDate = new Date(currentYear, currentMonth + activeMonthOffset, 1);
    const monthName = monthNames[targetDate.getMonth()];
    const yearNum = targetDate.getFullYear();
    const label = document.getElementById('currentMonthLabel');
    if (label) {
        label.innerText = (activeMonthOffset === 0) ? `${monthName} ${yearNum} (Текущий)` : `${monthName} ${yearNum}`;
    }
    monthTasks = getTasksForMonth(selectedCategory, pairCode, activeMonthOffset);
    startSync();
    renderGrid();
}

function showCalendarScreen() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('calendarScreen').style.display = 'flex';
    updateMonthDisplayAndTasks();
    updatePointsDisplay();
}


function updatePointsDisplay() {
    document.getElementById('pointsDisplay').innerText = `🔥 ${getCouplePoints()} CP`;
}

function startSync() {
    const currentMKey = getActiveMonthKey();
    initSync(pairCode, selectedCategory, currentMKey, {
        onP1Completed: (val) => { p1Completed = val || []; renderGrid(); },
        onP2Completed: (val) => { p2Completed = val || []; renderGrid(); },
        onP1Fav: (val) => { p1Fav = val || []; renderGrid(); },
        onP2Fav: (val) => { p2Fav = val || []; renderGrid(); }
    });

    const partnerRole = userRole === 'p1' ? 'p2' : 'p1';
    listenPartnerStatus(pairCode, partnerRole, (partnerStatus) => {
        if (partnerStatus && partnerStatus !== 'Статус не установлен') {
            document.getElementById('syncBadgeText').innerText = `💬 Партнер: ${partnerStatus}`;
        }
    });

    initChallengeListener(pairCode, partnerRole, (text) => {
        if (text) {
            document.getElementById('incomingChallengeBox').style.display = 'block';
            document.getElementById('incomingChallengeText').innerText = text;
        }
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
        let statusBadgeHTML = '';

        if (hasP1 && hasP2) {
            statusClass = 'completed-both';
            statusBadgeHTML = `<div class="status-badge status-both">✓✓ Оба</div>`;
        } else if (hasP1) {
            statusClass = 'completed-p1';
            statusBadgeHTML = `<div class="status-badge status-p1">✓ Он</div>`;
        } else if (hasP2) {
            statusClass = 'completed-p2';
            statusBadgeHTML = `<div class="status-badge status-p2">✓ Она</div>`;
        }

        card.className = `day-card ${statusClass}`;
        
        let favTagHTML = '';
        if (isFavP1 && isFavP2) favTagHTML = `<div class="fav-tag fav-both">⭐ М+Ж</div>`;
        else if (isFavP1) favTagHTML = `<div class="fav-tag fav-p1">⭐ М</div>`;
        else if (isFavP2) favTagHTML = `<div class="fav-tag fav-p2">⭐ Ж</div>`;

        card.innerHTML = `
            ${favTagHTML}
            ${statusBadgeHTML}
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
    currentRating = 0;
    document.getElementById('feedbackInput').value = '';
    document.querySelectorAll('#ratingStars span').forEach(s => s.innerText = '☆');

    document.getElementById('modalTitle').innerText = task.title;
    document.getElementById('modalRole').innerText = task.lead;
    document.getElementById('modalImg').src = task.img;
    document.getElementById('modalTask').innerText = task.task;
    
    document.getElementById('modalTip').innerHTML = `
        ${task.tip}
        <br><br>
        <button class="btn-secondary" id="audioGuideBtn" style="margin-top:5px; width:100%;">🔊 Озвучить подсказку</button>
    `;
    document.getElementById('audioGuideBtn').onclick = () => speakTaskTip(task.title, task.task);

    const myCompleted = (userRole === 'p1') ? p1Completed : p2Completed;
    const isDone = myCompleted.includes(task.day);
    document.getElementById('completeBtn').innerText = isDone ? 'Отменить отметку ✖' : 'Отметить пройденным (+50 CP) ✓';

    const myFav = (userRole === 'p1') ? p1Fav : p2Fav;
    const isFav = myFav.includes(task.day);
    document.getElementById('modalFavBtn').innerText = isFav ? '⭐' : '☆';

    // Загрузка мнений партнера в дневник впечатлений
    const partnerRole = userRole === 'p1' ? 'p2' : 'p1';
    const currentMKey = getActiveMonthKey();
    listenFeedbackFromDb(pairCode, selectedCategory, currentMKey, currentDay, partnerRole, (fb) => {
        if (fb) {
            const stars = fb.rating > 0 ? '★'.repeat(fb.rating) + ' ' : '';
            document.getElementById('partnerFeedbackBox').innerText = `💬 Партнер: ${stars}"${fb.text || ''}"`;
        } else {
            document.getElementById('partnerFeedbackBox').innerText = `Партнер еще не оставил отзыв.`;
        }
    });

    document.getElementById('modal').style.display = 'flex';
}

function updateProgress() {
    const totalDays = monthTasks.length || daysInCurrentMonth;
    const bothCount = monthTasks.filter(t => p1Completed.includes(t.day) && p2Completed.includes(t.day)).length;
    const percent = Math.round((bothCount / totalDays) * 100) || 0;
    
    document.getElementById('progressText').innerText = `Совместный прогресс: ${bothCount} / ${totalDays} дней`;
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
    document.getElementById('lingerieContent').innerHTML = lingerieItems.map(item => `<div class="cheat-item"><h4>${item.title}</h4><p>${item.text}</p></div>`).join('');
    document.getElementById('toysContent').innerHTML = toysItems.map(item => `<div class="cheat-item"><h4>${item.title}</h4><p>${item.text}</p></div>`).join('');

    renderCheatSheets();
}

function renderCheatSheets() {
    document.getElementById('cheatKunBlock').innerHTML = `
        <details class="anatomy-spoiler">
            <summary>🗺️ Анатомическая схема клитора и вульвы (Спойлер)</summary>
            <div class="anatomy-content">
                <img class="anatomy-img" src="./img/clitoris_anatomy.jpg" alt="Анатомия Клитора">
                <b>Ключевые точки стимуляции:</b><br>
                • <b>Головка клитора:</b> Содержит >10 000 нервных окончаний.<br>
                • <b>Точка G:</b> Находится на передней стенке влагалища на глубине 3-5 см.
            </div>
        </details>
    ` + cheatKunItems.map(item => `<div class="cheat-item"><h4>${item.title}</h4><p>${item.text}</p><div class="cheat-links"><a class="cheat-link" href="${item.link}" target="_blank">▶️ YouTube</a></div></div>`).join('');

    document.getElementById('cheatMinBlock').innerHTML = `
        <details class="anatomy-spoiler">
            <summary>🗺️ Анатомическая схема пениса и уздечки (Спойлер)</summary>
            <div class="anatomy-content">
                <img class="anatomy-img" src="./img/penis_anatomy.png" alt="Анатомия Пениса">
                <b>Ключевые точки стимуляции:</b><br>
                • <b>Уздечка:</b> Треугольная зона снизу под головкой.<br>
                • <b>Промежность (Шов):</b> Зона между мошонкой и анусом.
            </div>
        </details>
    ` + cheatMinItems.map(item => `<div class="cheat-item"><h4>${item.title}</h4><p>${item.text}</p><div class="cheat-links"><a class="cheat-link" href="${item.link}" target="_blank">▶️ YouTube</a></div></div>`).join('');
}


function setupEventListeners() {
    document.getElementById('saveEnterBtn').onclick = () => {
        const rawCode = document.getElementById('pairCodeInput').value.trim().toUpperCase();
        if (!rawCode || rawCode.length < 4) {
            alert("❌ Код пары слишком короткий!");
            return;
        }

        pairCode = rawCode.replace(/[^A-Z0-9_А-Я]/g, '');
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

    // Отметка прохождения + Начисление Couple Points + Дневник
    document.getElementById('completeBtn').onclick = () => {
        let myCompleted = (userRole === 'p1') ? [...p1Completed] : [...p2Completed];
        const feedbackText = document.getElementById('feedbackInput').value.trim();

        if (!myCompleted.includes(currentDay)) {
            myCompleted.push(currentDay);
            addCouplePoints(50, pairCode, userRole);
            triggerConfetti();
        } else {
            myCompleted = myCompleted.filter(d => d !== currentDay);
        }

        if (userRole === 'p1') p1Completed = myCompleted;
        else p2Completed = myCompleted;

        const currentMKey = getActiveMonthKey();
        saveCompletedToDb(pairCode, selectedCategory, currentMKey, userRole, myCompleted);
        if (currentRating > 0 || feedbackText) {
            saveFeedbackToDb(pairCode, selectedCategory, currentMKey, currentDay, userRole, currentRating, feedbackText);
        }

        renderGrid();
        updatePointsDisplay();
        document.getElementById('modal').style.display = 'none';
    };


    // Переключатель Избранного (⭐)
    document.getElementById('modalFavBtn').onclick = () => {
        let myFav = (userRole === 'p1') ? [...p1Fav] : [...p2Fav];
        
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

    // Звезды рейтинга в карточке
    document.querySelectorAll('#ratingStars span').forEach(star => {
        star.onclick = (e) => {
            currentRating = parseInt(e.target.getAttribute('data-star'));
            document.querySelectorAll('#ratingStars span').forEach((s, idx) => {
                s.innerText = idx < currentRating ? '★' : '☆';
            });
        };
    });

    // Кнопка Ачивки
    document.getElementById('openAchievementsBtn').onclick = () => {
        const list = document.getElementById('achievementsList');
        list.innerHTML = achievementsData.map(a => `
            <div class="cheat-item">
                <h4>${a.icon} ${a.title}</h4>
                <p>${a.desc}</p>
            </div>
        `).join('');
        document.getElementById('achievementsModal').style.display = 'flex';
    };
    document.getElementById('closeAchievementsBtn').onclick = () => document.getElementById('achievementsModal').style.display = 'none';
    document.getElementById('closeAchievementsBtnMain').onclick = () => document.getElementById('achievementsModal').style.display = 'none';

    // Магазин Желаний
    document.getElementById('openShopBtn').onclick = () => {
        const shopList = document.getElementById('shopList');
        shopList.innerHTML = shopItems.map(item => `
            <div class="cheat-item">
                <h4>${item.title} (${item.cost} CP)</h4>
                <p>${item.desc}</p>
                <button class="btn-primary buy-shop-btn" data-id="${item.id}" style="padding:8px; font-size:0.8rem; margin-top:5px;">Купить за ${item.cost} CP 🔥</button>
            </div>
        `).join('');

        document.querySelectorAll('.buy-shop-btn').forEach(btn => {
            btn.onclick = (e) => {
                const itemId = e.target.getAttribute('data-id');
                if (redeemShopItem(itemId, pairCode, userRole)) {
                    updatePointsDisplay();
                    document.getElementById('shopModal').style.display = 'none';
                }
            };
        });

        document.getElementById('shopModal').style.display = 'flex';
    };
    document.getElementById('closeShopBtn').onclick = () => document.getElementById('shopModal').style.display = 'none';

    // Вызовы (Дуэли)
    document.getElementById('openChallengeBtn').onclick = () => document.getElementById('challengeModal').style.display = 'flex';
    document.getElementById('closeChallengeBtn').onclick = () => document.getElementById('challengeModal').style.display = 'none';
    document.getElementById('sendChallengeBtn').onclick = () => {
        const val = document.getElementById('challengeInput').value;
        sendChallenge(pairCode, userRole, val);
        document.getElementById('challengeModal').style.display = 'none';
    };
    document.getElementById('revealChallengeBtn').onclick = () => {
        document.getElementById('incomingChallengeText').style.filter = 'none';
    };

    // 3D-Слот Рулетка
    document.getElementById('openWheelBtn').onclick = () => document.getElementById('wheelModal').style.display = 'flex';
    document.getElementById('closeWheelBtn').onclick = () => document.getElementById('wheelModal').style.display = 'none';
    document.getElementById('spinSlotsBtn').onclick = () => {
        let count = 0;
        const interval = setInterval(() => {
            document.getElementById('slotLoc').innerText = wheelLocations[Math.floor(Math.random() * wheelLocations.length)];
            document.getElementById('slotLing').innerText = wheelLingeries[Math.floor(Math.random() * wheelLingeries.length)];
            document.getElementById('slotStyle').innerText = wheelStyles[Math.floor(Math.random() * wheelStyles.length)];
            count++;
            if (count > 15) {
                clearInterval(interval);
                triggerConfetti();
            }
        }, 100);
    };

    // Аналитика
    document.getElementById('openAnalyticsBtn').onclick = () => {
        document.getElementById('analyticsModal').style.display = 'flex';
        renderAnalyticsCharts(p1Completed, p2Completed, monthTasks);
    };
    document.getElementById('closeAnalyticsBtn').onclick = () => document.getElementById('analyticsModal').style.display = 'none';

    // Листание Архива Месяцев
    document.getElementById('prevMonthBtn').onclick = () => {
        activeMonthOffset--;
        updateMonthLabel();
        monthTasks = getTasksForMonth(selectedCategory, pairCode, activeMonthOffset);
        startSync();
        renderGrid();
    };
    document.getElementById('nextMonthBtn').onclick = () => {
        activeMonthOffset++;
        updateMonthLabel();
        monthTasks = getTasksForMonth(selectedCategory, pairCode, activeMonthOffset);
        startSync();
        renderGrid();
    };

    function updateMonthLabel() {
        const targetDate = new Date(currentYear, currentMonth + activeMonthOffset, 1);
        document.getElementById('currentMonthLabel').innerText = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
    }


    // Stealth Mode & Экспорт/Импорт
    document.getElementById('panicBtn').onclick = toggleStealthMode;
    document.getElementById('unpanicBtn').onclick = toggleStealthMode;

    document.getElementById('openSettingsBtn').onclick = () => document.getElementById('settingsModal').style.display = 'flex';
    document.getElementById('closeSettingsBtn').onclick = () => document.getElementById('settingsModal').style.display = 'none';
    document.getElementById('changeSettingsBtn').onclick = () => {
        document.getElementById('settingsModal').style.display = 'none';
        document.getElementById('formSetupBlock').style.display = 'block';
        showLandingScreen();
    };

    document.getElementById('exportDataBtn').onclick = () => exportEncryptedData(pairCode);
    document.getElementById('importDataBtn').onclick = () => document.getElementById('importFileInput').click();
    document.getElementById('importFileInput').onchange = (e) => {
        if (e.target.files.length > 0) {
            importEncryptedData(e.target.files[0], () => showCalendarScreen());
        }
    };

    // Вспомогательные окна
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

    // Кнопка Гайд (Мастер-Гайд) и табы внутри него
    document.getElementById('openCheatBtn').onclick = () => document.getElementById('cheatSheetModal').style.display = 'flex';
    document.getElementById('closeCheatSheetBtn').onclick = () => document.getElementById('cheatSheetModal').style.display = 'none';
    document.getElementById('closeCheatSheetBtnMain').onclick = () => document.getElementById('cheatSheetModal').style.display = 'none';

    document.getElementById('btnKun').onclick = () => {
        document.getElementById('btnKun').classList.add('active');
        document.getElementById('btnMin').classList.remove('active');
        document.getElementById('cheatKunBlock').style.display = 'block';
        document.getElementById('cheatMinBlock').style.display = 'none';
    };
    document.getElementById('btnMin').onclick = () => {
        document.getElementById('btnMin').classList.add('active');
        document.getElementById('btnKun').classList.remove('active');
        document.getElementById('cheatKunBlock').style.display = 'none';
        document.getElementById('cheatMinBlock').style.display = 'block';
    };

    document.getElementById('openStatusBtn').onclick = () => document.getElementById('statusModal').style.display = 'flex';
    document.getElementById('closeStatusBtn').onclick = () => document.getElementById('statusModal').style.display = 'none';
    document.getElementById('saveStatusBtn').onclick = () => {
        saveStatusToDb(pairCode, userRole, document.getElementById('statusSelect').value);
        alert("Статус отправлен партнеру!");
        document.getElementById('statusModal').style.display = 'none';
    };

    document.getElementById('openMusicBtn').onclick = () => document.getElementById('musicModal').style.display = 'flex';
    document.getElementById('closeMusicBtn').onclick = () => document.getElementById('musicModal').style.display = 'none';
    document.getElementById('closeMusicBtnMain').onclick = () => document.getElementById('musicModal').style.display = 'none';

    // Генератор Совпадений
    document.getElementById('openGeneratorBtn').onclick = () => {
        const surveyContainer = document.getElementById('surveyContainer');
        const partnerRole = userRole === 'p1' ? 'p2' : 'p1';
        let partnerVotes = {};

        fetchPartnerVotes(pairCode, partnerRole, (pv) => {
            partnerVotes = pv || {};
        });

        surveyContainer.innerHTML = monthTasks.map(t => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">
                <span>${t.title}</span>
                <input type="checkbox" class="vote-checkbox" data-day="${t.day}" ${myVotes[t.day] ? 'checked' : ''}>
            </div>
        `).join('');

        document.querySelectorAll('.vote-checkbox').forEach(cb => {
            cb.onchange = (e) => {
                const day = e.target.getAttribute('data-day');
                myVotes[day] = e.target.checked;
                saveVotesToDb(pairCode, userRole, myVotes);
            };
        });

        document.getElementById('checkMatchesBtn').onclick = () => {
            const matches = monthTasks.filter(t => myVotes[t.day] && partnerVotes[t.day]);
            if (matches.length > 0) {
                triggerConfetti();
                alert(`🎉 Совпадения найдены! (${matches.length})\n\n` + matches.map(m => `• ${m.title}`).join('\n'));
            } else {
                alert("Пока совпадений не найдено. Отметьте больше карточек и попросите партнера заполнить опрос!");
            }
        };

        document.getElementById('generatorModal').style.display = 'flex';
    };
    document.getElementById('closeGeneratorBtn').onclick = () => document.getElementById('generatorModal').style.display = 'none';


    document.getElementById('refreshBtn').onclick = () => {
        monthTasks = getTasksForMonth(selectedCategory, pairCode, activeMonthOffset);
        startSync();
        renderGrid();
    };

    // Выбор темы оформления
    const themesList = ['gold', 'orchid', 'ruby'];
    document.getElementById('themeQuickBtn').onclick = () => {
        const currentTheme = localStorage.getItem('userTheme') || 'gold';
        const nextIndex = (themesList.indexOf(currentTheme) + 1) % themesList.length;
        applyTheme(themesList[nextIndex]);
    };

    document.querySelectorAll('.theme-option-btn').forEach(btn => {
        btn.onclick = (e) => {
            const theme = e.target.getAttribute('data-theme');
            applyTheme(theme);
        };
    });

    document.getElementById('favFilterBtn').onclick = () => {
        onlyFavFilter = !onlyFavFilter;
        const btn = document.getElementById('favFilterBtn');
        btn.style.background = onlyFavFilter ? 'var(--accent-gold)' : 'rgba(226, 176, 126, 0.15)';
        btn.style.color = onlyFavFilter ? '#0f0d13' : 'var(--accent-gold)';
        renderGrid();
    };

    // Управление отображением полос прокрутки
    const hideScrollbarCheckbox = document.getElementById('hideScrollbarsCheckbox');
    const isHideScrollbars = localStorage.getItem('hideScrollbars') !== 'false';
    if (isHideScrollbars) {
        document.body.classList.add('no-scrollbars-all');
        if (hideScrollbarCheckbox) hideScrollbarCheckbox.checked = true;
    } else {
        document.body.classList.remove('no-scrollbars-all');
        if (hideScrollbarCheckbox) hideScrollbarCheckbox.checked = false;
    }

    if (hideScrollbarCheckbox) {
        hideScrollbarCheckbox.onchange = (e) => {
            if (e.target.checked) {
                document.body.classList.add('no-scrollbars-all');
                localStorage.setItem('hideScrollbars', 'true');
            } else {
                document.body.classList.remove('no-scrollbars-all');
                localStorage.setItem('hideScrollbars', 'false');
            }
        };
    }

    // Переключение месяца (Пред. / След.)
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    if (prevMonthBtn) {
        prevMonthBtn.onclick = () => {
            activeMonthOffset--;
            updateMonthDisplayAndTasks();
        };
    }
    if (nextMonthBtn) {
        nextMonthBtn.onclick = () => {
            activeMonthOffset++;
            updateMonthDisplayAndTasks();
        };
    }
}



