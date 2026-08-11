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

let p1CompRef = null;
let p2CompRef = null;
let p1FavRef = null;
let p2FavRef = null;
let statusRef = null;
let challengeRef = null;
let feedbackRef = null;

function normalizeArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) {
        return val.filter(item => item !== null && item !== undefined);
    }
    if (typeof val === 'object') {
        return Object.values(val).filter(item => item !== null && item !== undefined);
    }
    return [];
}

// Синхронизация отметок прохождения и избранного
export function initSync(pairCode, selectedCategory, monthKey, callbacks) {
    if (!db || !pairCode) return;

    // Отписка от прошлых слушателей
    if (p1CompRef) p1CompRef.off();
    if (p2CompRef) p2CompRef.off();
    if (p1FavRef) p1FavRef.off();
    if (p2FavRef) p2FavRef.off();

    p1CompRef = db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p1`);
    p2CompRef = db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p2`);
    p1FavRef = db.ref(`pairs/${pairCode}/fav/p1`);
    p2FavRef = db.ref(`pairs/${pairCode}/fav/p2`);

    p1CompRef.on('value', (snapshot) => {
        if (callbacks.onP1Completed) callbacks.onP1Completed(normalizeArray(snapshot.val()));
    });
    p2CompRef.on('value', (snapshot) => {
        if (callbacks.onP2Completed) callbacks.onP2Completed(normalizeArray(snapshot.val()));
    });
    p1FavRef.on('value', (snapshot) => {
        if (callbacks.onP1Fav) callbacks.onP1Fav(normalizeArray(snapshot.val()));
    });
    p2FavRef.on('value', (snapshot) => {
        if (callbacks.onP2Fav) callbacks.onP2Fav(normalizeArray(snapshot.val()));
    });
}

// Сохранение пройденных дней
export function saveCompletedToDb(pairCode, selectedCategory, monthKey, userRole, completedArray) {
    if (db && pairCode) {
        const cleanArray = (completedArray || []).filter(item => item !== undefined && item !== null);
        db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/${userRole}`).set(cleanArray);
    }
}

// Сохранение избранного
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
        if (statusRef) statusRef.off();
        statusRef = db.ref(`pairs/${pairCode}/status/${partnerRole}`);
        statusRef.on('value', (snapshot) => {
            callback(snapshot.val() || 'Статус не установлен');
        });
    }
}

// Дневник впечатлений
export function saveFeedbackToDb(pairCode, selectedCategory, monthKey, day, userRole, rating, text) {
    if (db && pairCode && day !== undefined) {
        db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/feedback/${day}/${userRole}`).set({ 
            rating: rating || 0, 
            text: text || "" 
        });
    }
}

export function listenFeedbackFromDb(pairCode, selectedCategory, monthKey, day, partnerRole, callback) {
    if (db && pairCode && day !== undefined) {
        if (feedbackRef) feedbackRef.off();
        feedbackRef = db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/feedback/${day}/${partnerRole}`);
        feedbackRef.on('value', (snapshot) => {
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

// Дуэли / Секретные вызовы с медиа и авто-удалением
export function sendChallengeToDb(pairCode, userRole, challengeData) {
    if (db && pairCode && challengeData !== undefined) {
        db.ref(`pairs/${pairCode}/challenge/${userRole}`).set(challengeData);
    }
}

export function listenChallengeFromDb(pairCode, partnerRole, callback) {
    if (db && pairCode) {
        if (challengeRef) challengeRef.off();
        challengeRef = db.ref(`pairs/${pairCode}/challenge/${partnerRole}`);
        challengeRef.on('value', (snapshot) => {
            callback(snapshot.val() || null);
        });
    }
}

export function deleteChallengeFromDb(pairCode, partnerRole) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/challenge/${partnerRole}`).remove();
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

