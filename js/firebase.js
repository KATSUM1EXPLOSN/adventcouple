import { firebaseConfig, monthKey } from './config.js';

let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
} catch(e) {
    console.error("Firebase init error:", e);
}

export function initSync(pairCode, selectedCategory, userRole, callbacks) {
    if (!db || !pairCode) return;
    
    document.getElementById('syncBadgeText').innerText = `🟢 Код: [ ${pairCode} ] (${userRole === 'p1' ? 'Мужчина' : 'Женщина'})`;
    
    db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p1`).off();
    db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p1`).on('value', (snapshot) => {
        callbacks.onP1Completed(snapshot.val() || []);
    });

    db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p2`).off();
    db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/p2`).on('value', (snapshot) => {
        callbacks.onP2Completed(snapshot.val() || []);
    });

    db.ref(`pairs/${pairCode}/fav/p1`).off();
    db.ref(`pairs/${pairCode}/fav/p1`).on('value', (snapshot) => {
        callbacks.onP1Fav(snapshot.val() || []);
    });

    db.ref(`pairs/${pairCode}/fav/p2`).off();
    db.ref(`pairs/${pairCode}/fav/p2`).on('value', (snapshot) => {
        callbacks.onP2Fav(snapshot.val() || []);
    });
}

export function saveCompletedToDb(pairCode, selectedCategory, userRole, data) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/${selectedCategory}/${monthKey}/${userRole}`).set(data);
    }
}

export function saveFavToDb(pairCode, userRole, data) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/fav/${userRole}`).set(data);
    }
}

export function saveVotesToDb(pairCode, userRole, votes) {
    if (db && pairCode) {
        db.ref(`votes/${pairCode}/${userRole}`).set(votes);
    }
}

export function fetchPartnerVotes(pairCode, partnerRole, callback) {
    if (db && pairCode) {
        db.ref(`votes/${pairCode}/${partnerRole}`).once('value', (snapshot) => {
            callback(snapshot.val() || {});
        });
    }
}
// Сохранение баллов
export function savePointsToDb(pairCode, userRole, points) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/points/${userRole}`).set(points);
    }
}

// Покупка в магазине
export function saveShopRedemptionToDb(pairCode, userRole, itemTitle) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/redemptions`).push({
            user: userRole,
            item: itemTitle,
            time: new Date().toISOString()
        });
    }
}

// Отправка вызова (дуэли)
export function sendChallengeToDb(pairCode, userRole, challengeText) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/challenge/${userRole}`).set(challengeText);
    }
}

// Прослушивание вызова
export function listenChallengeFromDb(pairCode, partnerRole, callback) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/challenge/${partnerRole}`).on('value', (snapshot) => {
            callback(snapshot.val() || '');
        });
    }
}

// Дневник впечатлений
export function saveFeedbackToDb(pairCode, selectedCategory, userRole, day, rating, feedbackText) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/${selectedCategory}/feedback/${day}/${userRole}`).set({
            rating: rating,
            text: feedbackText
        });
    }
}

export function listenFeedbackFromDb(pairCode, selectedCategory, partnerRole, day, callback) {
    if (db && pairCode) {
        db.ref(`pairs/${pairCode}/${selectedCategory}/feedback/${day}/${partnerRole}`).on('value', (snapshot) => {
            callback(snapshot.val() || null);
        });
    }
}
