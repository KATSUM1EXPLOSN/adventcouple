import { currentYear, currentMonth, daysInCurrentMonth, imgPool } from '../config.js';

export const goldCardsList = [
    { day: 3, title: "🏎️ Автомобильный Экстрим", task: "Секс или оральные ласки на заднем сиденье вашей машины в тихом месте с запотевшими стеклами.", tip: "Совет: Подготовьте удобную подушку заранее." },
    { day: 6, title: "🌲 Ночная Природа", task: "Быстрый страстный контакт на свежем воздухе во время вечерней прогулки в парке или лесу.", tip: "Совет: Используйте одежду с быстрым доступом." },
    { day: 9, title: "♨️ Панорамное Джакузи / Сауна", task: "Романтический вечер в приватной сауне или джакузи с панорамным видом и бокалами напитка.", tip: "Совет: Используйте силиконовую смазку под водой." },
    { day: 12, title: "☕ Эдджинг в Общественном Месте", task: "Мужчина ласкает партнершу под столом в кафе или она анонимно управляет виброяйцом у нее с пульта.", tip: "Совет: Удерживайте невозмутимый вид." },
    { day: 15, title: "🏨 Отель на Час", task: "Спонтанный побег среди дня в номер отеля для быстрой разрядки без домашних забот.", tip: "Совет: Внезапность удваивает страсть." },
    { day: 18, title: "🪞 Секс перед Зеркалом в Прихожей", task: "Контакт прямо стоя перед большим зеркалом при входе сразу по возвращении домой.", tip: "Совет: Не разувайтесь до конца." },
    { day: 21, title: "🛁 Подводный Эксперимент", task: "Интим в горячей ванной с пеной или под струями душа при свечах.", tip: "Совет: Используйте водостойкие игрушки." },
    { day: 24, title: "🚪 Быстрый Экспресс на Кухне", task: "Страстный спонтанный секс на кухонном столе во время приготовления ужина.", tip: "Совет: Смахните все лишнее со стола." },
    { day: 27, title: "🌅 Утренний Нежданчик", task: "Пробуждение партнера оральными ласками до полного его/ее пробуждения.", tip: "Совет: Действуйте максимально нежно." },
    { day: 30, title: "👑 Королевский Номер (Финал)", task: "Полная ролевая игра с переодеванием в белье и подготовленными игрушками на всю ночь.", tip: "Совет: Заранее отключите телефоны." }
];

export const database = {
    classic: Array.from({length: 200}, (_, i) => ({
        id: `c_${i+1}`,
        title: `Классическая техника №${i+1}: ${['Миссионерская со смещением', 'Правило 20 минут поцелуев', 'Техника CAT', 'Замедленный финиш', 'Зеркальный контакт', 'Массаж бедер и шеи', 'Нежные Ложки'][i % 7]}`,
        lead: i % 2 === 0 ? "👑 Он — Ведущий | 🌹 Она — Ведомая" : "🤝 Оба на равных",
        task: `Уникальная нежная практика №${i+1}. Задействуйте медленное дыхание, глубокий зрительный контакт и романтические касания.`,
        tip: `Совет: Фокусируйтесь на ощущениях и чувственности.`
    })),
    female_lead: Array.from({length: 200}, (_, i) => ({
        id: `f_${i+1}`,
        title: `Женское доминирование №${i+1}: ${['Обратная наездница', 'Запрет на финиш (Denial)', 'Управление его руками', 'Королева стола', 'Контроль дыхания', 'Приказы FemDom'][i % 6]}`,
        lead: "👑 Она — Ведущая | 🗝️ Он — Ведомый",
        task: `Она полностью берет контроль над процессом №${i+1}. Мужчина выполняет ее команды и сдерживает разрядку.`,
        tip: `Совет: Наслаждайтесь полной отдачей инициативы.`
    })),
    kamasutra: Array.from({length: 200}, (_, i) => ({
        id: `k_${i+1}`,
        title: `Поза Камасутры №${i+1}: ${['Цветок Лотоса', 'Раковина (Sankha)', 'Бабочка на краю', 'Углубленный Тигр', 'Вараха у стены', 'Сплит', 'Мостик'][i % 7]}`,
        lead: i % 3 === 0 ? "👑 Он — Ведущий | 🌹 Она — Ведомая" : "🤝 Оба на равных",
        task: `Освойте уникальную конфигурацию тела и угол проникновения №${i+1} для стимулирования новых зон.`,
        tip: `Совет: Используйте подушки для идеального упора.`
    })),
    bdsm: Array.from({length: 200}, (_, i) => ({
        id: `b_${i+1}`,
        title: `BDSM и Контроль №${i+1}: ${['Шелковая фиксация', 'Изоляция чувств маской', 'Легкий спанкинг', 'Дразнение и паузы', 'Запрет на звуки', 'Замок на ноги'][i % 6]}`,
        lead: i % 2 === 0 ? "👑 Он — Ведущий | 🌹 Она — Ведомая" : "👑 Она — Ведущая | 🗝️ Он — Ведомый",
        task: `Эксперимент с ограничением движений или чувств №${i+1}. Используйте маску, ленты и стоп-слово.`,
        tip: `Совет: Главное в BDSM — безопасность и доверие.`
    }))
};

export function getTasksForMonth(category, code) {
    let pool = [];
    if (category === 'balanced') {
        pool = [
            ...database.classic.slice(0, 50),
            ...database.female_lead.slice(0, 50),
            ...database.kamasutra.slice(0, 50),
            ...database.bdsm.slice(0, 50)
        ];
    } else {
        pool = [...(database[category] || database.classic)];
    }

    let seed = 0;
    for (let i = 0; i < code.length; i++) seed += code.charCodeAt(i);
    seed = seed * 31 + currentYear * 12 + currentMonth;

    const shuffledPool = [...pool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = Math.abs((seed * (i + 1) * 17) % (i + 1));
        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    const result = [];
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        const goldSecret = goldCardsList.find(g => g.day === day);
        
        if (goldSecret) {
            result.push({
                day: day,
                id: `gold_${day}`,
                title: `${day < 10 ? '0' + day : day}. ${goldSecret.title}`,
                category: "✨ ЗОЛОТАЯ КАРТОЧКА",
                lead: "🎉 СЕКРЕТНЫЙ СЮРПРИЗ",
                roleClass: "role-both",
                img: imgPool[day % imgPool.length],
                task: goldSecret.task,
                tip: goldSecret.tip,
                isGold: true
            });
        } else {
            const base = shuffledPool[(day - 1) % shuffledPool.length];
            
            let catLabel = 'Классика';
            if (base.id.startsWith('f')) catLabel = 'Доминирование';
            else if (base.id.startsWith('k')) catLabel = 'Камасутра';
            else if (base.id.startsWith('b')) catLabel = 'BDSM';

            result.push({
                day: day,
                id: base.id,
                title: `${day < 10 ? '0' + day : day}. ${base.title}`,
                category: catLabel,
                lead: base.lead,
                roleClass: base.lead.includes("Она — Ведущая") ? "role-f" : (base.lead.includes("Он — Ведущий") ? "role-m" : "role-both"),
                img: imgPool[(day - 1) % imgPool.length],
                task: base.task,
                tip: base.tip,
                isGold: false
            });
        }
    }
    return result;
}
