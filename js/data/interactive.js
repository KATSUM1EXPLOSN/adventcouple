// АЧИВКИ
export const achievementsData = [
    { id: "first_step", title: "✨ Первый Шаг", desc: "Пройти первые 3 совместные карточки", req: 3, icon: "✨" },
    { id: "explorers", title: "🧘‍♀️ Исследователи", desc: "Пройти 10 совместных практик", req: 10, icon: "🧘‍♀️" },
    { id: "fire_union", title: "🔥 Огненный Союз", desc: "Пройти 18 совместных практик", req: 18, icon: "🔥" },
    { id: "masters", title: "👑 Мастера Интимности", desc: "Завершить 25 карточек за месяц", req: 25, icon: "👑" },
    { id: "full_month", title: "💎 Идеальный Месяц", desc: "Пройти абсолютно все карточки месяца!", req: 30, icon: "💎" }
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
        window.speechSynthesis.cancel(); // Остановка предыдущей речи
        const cleanText = text.replace(/<[^>]*>?/gm, ''); // Очистка от HTML
        const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9; // Слегка замедленный и нежный темп
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Ваш браузер не поддерживает голосовое озвучивание.");
    }
}
