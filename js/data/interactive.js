// 🏆 ТРОФЕИ И ДОСТИЖЕНИЯ ПАРЫ (20 УНИКАЛЬНЫХ АЧИВОК)
export const achievementsData = [
    // 1. Дни и Стрики (Month Progress)
    { id: "first_step", title: "✨ Первый Шаг", desc: "Пройти первые 3 совместные карточки", req: 3, points: 50, icon: "✨", cat: "progress" },
    { id: "explorers", title: "🧘‍♀️ Исследователи Чувств", desc: "Пройти 10 совместных практик месяца", req: 10, points: 100, icon: "🧘‍♀️", cat: "progress" },
    { id: "fire_union", title: "🔥 Страстный Дуэт", desc: "Пройти 18 совместных практик", req: 18, points: 200, icon: "🔥", cat: "progress" },
    { id: "masters", title: "👑 Мастера Интимности", desc: "Завершить 25 карточек за текущий месяц", req: 25, points: 350, icon: "👑", cat: "progress" },
    { id: "full_month", title: "💎 Идеальный Месяц", desc: "Пройти абсолютно все 30 карточек месяца!", req: 30, points: 500, icon: "💎", cat: "progress" },

    // 2. Синхронность и Совпадения (Synergy & Favorites)
    { id: "first_fav", title: "⭐ Интимное Совпадение", desc: "Добавить 1 совместную любимую позу с партнером", req: 1, points: 50, icon: "⭐", cat: "synergy" },
    { id: "fav_collector", title: "🌟 Коллекционеры Желаний", desc: "Собрать 5 взаимных совпадений в избранном", req: 5, points: 150, icon: "🌟", cat: "synergy" },
    { id: "perfect_harmony", title: "💖 Идеальная Совместимость", desc: "Достигнуть Синергии Пары свыше 80%", req: 80, points: 300, icon: "💖", cat: "synergy" },
    { id: "feedback_note", title: "📝 Откровенный Дневник", desc: "Оставить 5 отзывов и оценок со звездами после дней", req: 5, points: 100, icon: "📝", cat: "synergy" },

    // 3. Локации и Авто-Камасутра (Extreme & Locations)
    { id: "auto_romance", title: "🏎️ Автомобильный Всплеск", desc: "Пройти карточку с сексом в машине или на выезде", req: 1, points: 100, icon: "🏎️", cat: "extreme" },
    { id: "mirror_magic", title: "🪞 Зеркальная Магия", desc: "Выполнить практку стоя перед большим зеркалом", req: 1, points: 100, icon: "🪞", cat: "extreme" },
    { id: "water_passion", title: "♨️ Водная Стихия", desc: "Пройти карточку в сауне, джакузи или горячей ванной", req: 1, points: 100, icon: "♨️", cat: "extreme" },
    { id: "public_edging", title: "☕ Тыл и Интрига", desc: "Выполнить экстрим-карточку ласк вне спальни", req: 1, points: 150, icon: "☕", cat: "extreme" },

    // 4. Мастерство и Камасутра (Mastery & Oral & BDSM)
    { id: "oral_master", title: "🌹 Мастера Оральных Ласк", desc: "Пройти 5 карточек орального секса (Куни / Минет)", req: 5, points: 150, icon: "🌹", cat: "mastery" },
    { id: "kamasutra_guru", title: "🪷 Гуру Камасутры", desc: "Пройти 5 сложных геометрических поз Камасутры", req: 5, points: 150, icon: "🪷", cat: "mastery" },
    { id: "bdsm_sub", title: "😈 Искусство Искушения (BDSM)", desc: "Выполнить 3 карточки с элементами доминирования", req: 3, points: 200, icon: "😈", cat: "mastery" },
    { id: "point_g_touch", title: "🎯 Точный Прицел (Точка G)", desc: "Выполнить карточку с акцентом на стимуляцию Точки G/A", req: 1, points: 100, icon: "🎯", cat: "mastery" },

    // 5. Игровые Механики (Gamification & Roulette)
    { id: "wheel_spinner", title: "🎰 Повелители Фортуны", desc: "Скрутить 3D-рулетку генератора вечера 5 раз", req: 5, points: 50, icon: "🎰", cat: "progress" },
    { id: "first_coupon", title: "🛍️ Исполнители Желаний", desc: "Активировать первый купон в Магазине Желаний", req: 1, points: 100, icon: "🛍️", cat: "synergy" },
    { id: "challenge_sent", title: "💌 Горячий Конверт", desc: "Отправить 3 секретных вызова партнеру", req: 3, points: 100, icon: "💌", cat: "synergy" }
];

// ЭЛЕМЕНТЫ ДЛЯ КОЛЕСА ФОРТУНЫ
export const wheelLocations = [
    "На мягком ковре при свечах",
    "На кухне у стола",
    "В горячей ванной с пеной",
    "Перед большим зеркалом",
    "На заднем сиденье машины",
    "В спальне под шелковым покрывалом"
];

export const wheelLingeries = [
    "Белье с открытым доступом (Ouvert)",
    "Кружевное или кожаное боди",
    "Шелковый пеньюар / кимоно",
    "Страппинг / Кожаная портупея",
    "Корсет со шнуровкой",
    "Без белья / Максимальный обнаженный контакт"
];

export const wheelStyles = [
    "Медленно и только с поцелуями",
    "С закрытыми глазами (маска на глаза)",
    "С фиксацией рук шелковым шарфом",
    "С использованием вакуумного стимулятора",
    "С изменением темпа каждые 60 секунд",
    "С задержкой разрядки (Edging)"
];

// АУДИОГИД (Синтез речи браузера)
export function speakTaskTip(title, text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Ваш браузер не поддерживает голосовое озвучивание.");
    }
}
