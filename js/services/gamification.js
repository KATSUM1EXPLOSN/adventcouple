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
    { id: "s1", title: "🥐 Завтрак в постель", cost: 200, desc: "Партнер готовит и красиво подает любимый вкусный завтрак у кровати." },
    { id: "s2", title: "🍹 Коктейль / Напиток Страсти", cost: 250, desc: "Партнер смешивает изысканный коктейль или подает бокал вина у кровати." },
    { id: "s3", title: "🦶 Массаж стоп и пальчиков (20 мин)", cost: 300, desc: "Нежный расслабляющий массаж ступней с согревающим маслом." },
    { id: "s4", title: "💆‍♀️ Массаж головы и плеч (25 мин)", cost: 350, desc: "Сенсорный массаж кожи головы и плеч подушечками пальцев." },
    { id: "s5", title: "📵 Вечер без гаджетов и соцсетей", cost: 400, desc: "Полное отключение телефонов и сотовых после 19:00 для совместного вечера." },
    { id: "s6", title: "👙 Право выбора наряда / белья", cost: 450, desc: "Покупатель купона лично выбирает белье или наряд, в котором приходит партнер." },
    { id: "s7", title: "🎵 Сенсорный DJ спальни", cost: 500, desc: "Покупатель полностью управляет музыкой, освещением и духами в спальне весь вечер." },
    { id: "s8", title: "🧊 Шоковый Контраст (Лед & Масло)", cost: 600, desc: "20-минутный массаж кубиками льда и согретым ароматным маслом." },
    { id: "s9", title: "🎲 Внеочередной Бросок 3D-Рулетки", cost: 650, desc: "Генерация случайной локации, белья и стиля с обязательным исполнением." },
    { id: "s10", title: "🌹 Королевский Оральный Прием", cost: 800, desc: "15 минут глубоких непрерывных оральных ласк без спешки в выбранной технике." },
    { id: "s11", title: "🙈 Слепой Подчинительный Сеанс", cost: 950, desc: "Партнер надевает маску на глаза и полностью отдается вашим прикосновениям." },
    { id: "s12", title: "⏳ Сеанс Edging (Запрет разрядки)", cost: 1100, desc: "Доведение до пика 3 раза подряд с запретом на разрядку без разрешения." },
    { id: "s13", title: "🏨 Спонтанный Номер в Отеле", cost: 1300, desc: "Заказ номера в отеле на сутки для полного отключения от реальности." },
    { id: "s14", title: "👑 Абсолютный Каприз без Отказа", cost: 1500, desc: "Безоговорочное исполнение абсолютно любого пикантного каприза без права отказа!" }
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
