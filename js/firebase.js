// js/firebase.js

// Безопасное получение ссылки на базу данных, инициализированную в index.html
let db = null;
try {
    if (typeof firebase !== 'undefined' && firebase.database) {
        db = firebase.database();
    }
} catch (e) {
    console.error("Firebase initialization error:", e);
}

// Синхронизация отметок прохождения и избранного
export function initSync(pairCode, selectedCategory, monthKey, callbacks) {
    if (!db || !pairCode) return;

    db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p1`).on('value', (snapshot) => {
        if (callbacks.onP1Completed) callbacks.onP1Completed(snapshot.val() || []);
    });
    db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p2`).on('value', (snapshot) => {
        if (callbacks.onP2Completed) callbacks.onP2Completed(snapshot.val() || []);
    });
    db.ref(`pairs/${pairCode}/fav/p1`).on('value', (snapshot) => {
        if (callbacks.onP1Fav) callbacks.onP1Fav(snapshot.val() || []);
    });
    db.ref(`pairs/${pairCode}/fav/p2`).on('value', (snapshot) => {
        if (callbacks.onP2Fav) callbacks.onP2Fav(snapshot.val() || []);
    });
}

// Исправлено: Фильтрация undefined перед отправкой
export function saveCompletedToDb(pairCode, selectedCategory, monthKey, userRole, completedArray) {
    if (db && pairCode) {
        const cleanArray = (completedArray || []).filter(item => item !== undefined && item !== null);
        db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/${userRole}`).set(cleanArray);
    }
}

export function saveFavToDb(pairCode, userRole, favArray) {
    if (db && pairCode) {
        const cleanArray = (favArray || []).filter(item => item !== undefined && item !== null);
        db.ref(`pairs/${pairCode}/fav/${userRole}`).set(cleanArray);
    }
}

// Статус партнера
export function saveStatusToDb(pairCode, userRole, statusText) {
    if (db && pairCode && statusText !== undefined) {
        db.ref(`pairs/${pairCode}/status/${userRole}`).set(statusText);
    }
}

export function listenPartnerStatus(pairCode, partnerRole, callback) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/status/${partnerRole}`).on('value', (snapshot) => {
            callback(snapshot.val() || 'Статус не установлен');
        });
    }
}

// Дневник впечатлений
export function saveFeedbackToDb(pairCode, selectedCategory, day, userRole, rating, text) {
    if (db && pairCode && day !== undefined) {
        db.ref(`pairs/${pairCode}/${selectedCategory}/feedback/${day}/${userRole}`).set({ 
            rating: rating || 0, 
            text: text || "" 
        });
    }
}

export function listenFeedbackFromDb(pairCode, selectedCategory, day, partnerRole, callback) {
    if (db && pairCode && day !== undefined) {
        db.ref(`pairs/${pairCode}/${selectedCategory}/feedback/${day}/${partnerRole}`).on('value', (snapshot) => {
            callback(snapshot.val() || null);
        });
    }
}

// Баллы и магазин
export function savePointsToDb(pairCode, userRole, points) {
    if (db && pairCode && points !== undefined) {
        db.ref(`pairs/${pairCode}/points/${userRole}`).set(points);
    }
}

export function saveShopRedemptionToDb(pairCode, userRole, itemTitle) {
    if (db && pairCode && itemTitle !== undefined) {
        db.ref(`pairs/${pairCode}/redemptions`).push({ 
            user: userRole, 
            item: itemTitle, 
            time: new Date().toISOString() 
        });
    }
}

// Дуэли / Вызовы
export function sendChallengeToDb(pairCode, userRole, challengeText) {
    if (db && pairCode && challengeText !== undefined) {
        db.ref(`pairs/${pairCode}/challenge/${userRole}`).set(challengeText);
    }
}

export function listenChallengeFromDb(pairCode, partnerRole, callback) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/challenge/${partnerRole}`).on('value', (snapshot) => {
            callback(snapshot.val() || '');
        });
    }
}

// Сохранение голосов генератора совпадений
export function saveVotesToDb(pairCode, userRole, votesObj) {
    if (db && pairCode && votesObj !== undefined) {
        db.ref(`votes/${pairCode}/${userRole}`).set(votesObj);
    }
}

// Получение голосов партнера для генератора совпадений
export function fetchPartnerVotes(pairCode, partnerRole, callback) {
    if (db && pairCode) {
        db.ref(`votes/${pairCode}/${partnerRole}`).on('value', (snapshot) => {
            callback(snapshot.val() || {});
        });
    }
}
