import { savePointsToDb, saveShopRedemptionToDb, sendChallengeToDb, listenChallengeFromDb } from '../firebase.js';

let points = parseInt(localStorage.getItem('couplePoints') || '0');

export function getCouplePoints() { return points; }

export function addCouplePoints(amount, pairCode, userRole) {
    points += amount;
    localStorage.setItem('couplePoints', points.toString());
    savePointsToDb(pairCode, userRole, points);
    return points;
}

export function triggerConfetti() {
    if (window.confetti) {
        window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

export function shareAchievement(title, desc) {
    if (navigator.share) {
        navigator.share({
            title: `Достижение в Чувственном Календаре!`,
            text: `Мы разблокировали ачивку: "${title}" - ${desc}! 🔥`,
            url: window.location.href
        }).catch(() => {});
    } else {
        alert(`🏆 Вы разблокировали: "${title}"!\n${desc}`);
    }
}

export const shopItems = [
    { id: "s1", title: "🥐 Завтрак в постель", cost: 200, desc: "Партнер готовит и подает любимый завтрак в постель." },
    { id: "s2", title: "💆‍♂️ Массаж стоп и спины (30 мин)", cost: 300, desc: "Полноценный расслабляющий массаж с маслом без отговорок." },
    { id: "s3", title: "📵 Вечер без гаджетов", cost: 400, desc: "Полное отключение телефонов и ТВ после 19:00 на весь вечер." },
    { id: "s4", title: "👑 Выполнение любого желания", cost: 1000, desc: "Исполнение одного пикантного желания без права отказа!" }
];

export function redeemShopItem(itemId, pairCode, userRole) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;

    if (points >= item.cost) {
        points -= item.cost;
        localStorage.setItem('couplePoints', points.toString());
        savePointsToDb(pairCode, userRole, points);
        saveShopRedemptionToDb(pairCode, userRole, item.title);
        triggerConfetti();
        return true;
    } else {
        alert("Недостаточно Couple Points! Проходите карточки для сбора баллов.");
        return false;
    }
}

export function sendChallenge(pairCode, userRole, text) {
    if (!text.trim()) return;
    sendChallengeToDb(pairCode, userRole, text.trim());
    alert("💌 Секретный вызов отправлен партнеру!");
}

export function initChallengeListener(pairCode, partnerRole, onChallengeReceived) {
    listenChallengeFromDb(pairCode, partnerRole, (challengeText) => {
        if (challengeText) {
            onChallengeReceived(challengeText);
        }
    });
}
