export function renderAnalyticsCharts(p1Completed = [], p2Completed = [], p1Fav = [], p2Fav = [], monthTasks = []) {
    const safeTasks = Array.isArray(monthTasks) ? monthTasks : [];
    const safeP1Comp = Array.isArray(p1Completed) ? p1Completed : [];
    const safeP2Comp = Array.isArray(p2Completed) ? p2Completed : [];
    const safeP1Fav = Array.isArray(p1Fav) ? p1Fav : [];
    const safeP2Fav = Array.isArray(p2Fav) ? p2Fav : [];

    const totalDays = safeTasks.length || 30;

    try { renderSynergyCircle(safeP1Comp, safeP2Comp, totalDays); } catch (e) { console.error('Synergy circle error:', e); }
    try { renderCoupleArchetype(safeP1Comp, safeP2Comp, safeTasks); } catch (e) { console.error('Couple archetype error:', e); }
    try { renderHeatmap(safeP1Comp, safeP2Comp, safeP1Fav, safeP2Fav, totalDays); } catch (e) { console.error('Heatmap error:', e); }
    try { renderWeekdayChart(safeP1Comp, safeP2Comp, safeTasks); } catch (e) { console.error('Weekday chart error:', e); }
    try { renderTopPoses(safeP1Comp, safeP2Comp, safeP1Fav, safeP2Fav, safeTasks); } catch (e) { console.error('Top poses error:', e); }
    try { renderCoupleForecast(safeP1Comp, safeP2Comp, safeTasks); } catch (e) { console.error('Couple forecast error:', e); }
}

function renderSynergyCircle(p1Completed, p2Completed, totalDays) {
    const bothDays = p1Completed.filter(d => p2Completed.includes(d));
    const score = Math.round((bothDays.length / (totalDays || 1)) * 100);

    const circle = document.getElementById('synergyCircle');
    const label = document.getElementById('synergyScoreText');

    if (label) label.innerText = `${score}%`;
    if (circle) {
        const circumference = 2 * Math.PI * 36; // ~226.19
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
    }
}

function renderCoupleArchetype(p1Completed, p2Completed, monthTasks) {
    const titleEl = document.getElementById('coupleArchetypeTitle');
    const descEl = document.getElementById('coupleArchetypeDesc');
    if (!titleEl || !descEl) return;

    const bothDays = p1Completed.filter(d => p2Completed.includes(d));
    const completedTasks = monthTasks.filter(t => t && (bothDays.includes(t.day) || p1Completed.includes(t.day) || p2Completed.includes(t.day)));

    if (completedTasks.length === 0) {
        titleEl.innerText = "✨ Чувственный Старт";
        descEl.innerText = "Вы только начинаете исследование вашего совместного календаря страсти!";
        return;
    }

    const categoriesCount = {};
    completedTasks.forEach(t => {
        const cat = (t && t.category) ? t.category : 'Классика';
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    const topCategory = Object.keys(categoriesCount).sort((a, b) => categoriesCount[b] - categoriesCount[a])[0] || '';

    if (topCategory.includes('Оральный') || topCategory.includes('Кунилингус') || topCategory.includes('Минет')) {
        titleEl.innerText = "🌹 Мастера Нежных Ласк";
        descEl.innerText = "Ваша пара ставит во главу угла абсолютное оральное удовольствие и трепетные прикосновения.";
    } else if (topCategory.includes('Наездница') || topCategory.includes('Доминирование')) {
        titleEl.innerText = "👑 Короли Инициативы (FemDom)";
        descEl.innerText = "В вашей спальне царит женский магнетизм, чуткое руководство и полная отдача страсти.";
    } else if (topCategory.includes('Камасутра') || topCategory.includes('Догги')) {
        titleEl.innerText = "🪷 Покорители Камасутры";
        descEl.innerText = "Вы любите геометрическое разнообразие, смелые углы проникновения и новые позы.";
    } else if (topCategory.includes('Локации') || topCategory.includes('Экстрим')) {
        titleEl.innerText = "🚗 Охотники за Адреналином";
        descEl.innerText = "Столы, фитнес-мяч, машина и нежданные места — вы обожаете остроту впечатлений!";
    } else if (topCategory.includes('BDSM') || topCategory.includes('Анальный')) {
        titleEl.innerText = "😈 Повелители Искушений";
        descEl.innerText = "Вы доверяете друг другу на 100%, смело исследуя границы бондажа и острых ощущений.";
    } else {
        titleEl.innerText = "💖 Идеальная Гармония";
        descEl.innerText = "Вы сбалансированно миксуете романтическую классику, чувственные прикосновения и страстные финиши.";
    }
}

function renderHeatmap(p1Completed, p2Completed, p1Fav, p2Fav, totalDays) {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let day = 1; day <= totalDays; day++) {
        const tile = document.createElement('div');
        const hasP1 = p1Completed.includes(day);
        const hasP2 = p2Completed.includes(day);
        const isBoth = hasP1 && hasP2;
        const isFav = p1Fav.includes(day) && p2Fav.includes(day);

        let statusClass = '';
        if (isBoth) statusClass = 'tile-both';
        else if (hasP1) statusClass = 'tile-p1';
        else if (hasP2) statusClass = 'tile-p2';

        if (isFav) statusClass += ' tile-fav';

        tile.className = `heatmap-tile ${statusClass}`;
        tile.innerText = day < 10 ? '0' + day : day;
        tile.title = `День ${day}: ${isBoth ? 'Взаимно заполнено!' : (hasP1 ? 'Выполнено Парнем' : (hasP2 ? 'Выполнено Девушкой' : 'Не выполнено'))}`;

        grid.appendChild(tile);
    }
}

function renderWeekdayChart(p1Completed, p2Completed, monthTasks) {
    const canvas = document.getElementById('weekdayChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const daysName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    const completedDays = [...new Set([...p1Completed, ...p2Completed])];
    
    const now = new Date();
    completedDays.forEach(day => {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        let dayIdx = d.getDay() - 1; // 0 - Sun, 1 - Mon
        if (dayIdx < 0) dayIdx = 6; // Вс -> 6
        weekdayCounts[dayIdx]++;
    });

    const maxVal = Math.max(...weekdayCounts, 3);
    const width = canvas.width;
    const height = canvas.height;
    const paddingLeft = 20;
    const barGap = 16;
    const barWidth = Math.floor((width - paddingLeft * 2 - (7 - 1) * barGap) / 7);

    weekdayCounts.forEach((count, i) => {
        const barH = Math.max(10, Math.floor((count / maxVal) * (height - 45)));
        const x = paddingLeft + i * (barWidth + barGap);
        const y = height - 25 - barH;

        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        if (count === Math.max(...weekdayCounts) && count > 0) {
            grad.addColorStop(0, '#e67e90');
            grad.addColorStop(1, '#e2b07e');
        } else {
            grad.addColorStop(0, '#a374db');
            grad.addColorStop(1, 'rgba(163, 116, 219, 0.3)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        ctx.fillStyle = '#f5f0fa';
        ctx.font = 'bold 11px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count > 0 ? count : '0', x + barWidth / 2, y - 5);

        ctx.fillStyle = '#a89fbe';
        ctx.font = '10px Montserrat, sans-serif';
        ctx.fillText(daysName[i], x + barWidth / 2, height - 8);
    });
}

function renderTopPoses(p1Completed, p2Completed, p1Fav, p2Fav, monthTasks) {
    const container = document.getElementById('topPosesList');
    if (!container) return;
    container.innerHTML = '';

    const bothFav = p1Fav.filter(d => p2Fav.includes(d));
    const bothComp = p1Completed.filter(d => p2Completed.includes(d));
    const priorityDays = [...new Set([...bothFav, ...bothComp])];

    let topTasks = monthTasks.filter(t => t && priorityDays.includes(t.day));
    if (topTasks.length < 3) {
        const otherFavs = [...new Set([...p1Fav, ...p2Fav, ...p1Completed, ...p2Completed])];
        const extraTasks = monthTasks.filter(t => t && otherFavs.includes(t.day) && !priorityDays.includes(t.day));
        topTasks = [...topTasks, ...extraTasks];
    }

    if (topTasks.length === 0) {
        topTasks = monthTasks.slice(0, 3);
    } else {
        topTasks = topTasks.slice(0, 3);
    }

    topTasks.forEach((task, idx) => {
        if (!task) return;
        const row = document.createElement('div');
        row.className = 'top-pose-row';
        row.innerHTML = `
            <div style="font-weight:800; font-size:1.1rem; color:var(--accent-gold); width:20px;">#${idx + 1}</div>
            <img class="top-pose-thumb" src="${task.img || ''}" alt="${task.title || 'Поза'}">
            <div class="top-pose-info">
                <div class="top-pose-title">${task.title || 'Поза'}</div>
                <div class="top-pose-sub">${task.category || 'Комбо'} • ${task.lead || 'Вместе'}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

function renderCoupleForecast(p1Completed, p2Completed, monthTasks) {
    const textEl = document.getElementById('coupleForecastText');
    if (!textEl) return;

    const totalCompleted = [...new Set([...p1Completed, ...p2Completed])].length;

    if (totalCompleted > 20) {
        textEl.innerText = "🔥 Ваша пара находится на пике страсти и откровения! В следующем месяце рекомендуется погрузиться в Экстрим-локации и BDSM-эксперименты.";
    } else if (totalCompleted > 10) {
        textEl.innerText = "💖 Отличный уверенный ритм! На следующий месяц добавьте чуть больше поз Камасутры под разными углами и оральных ласк.";
    } else {
        textEl.innerText = "🕯️ Спокойный романтический период. В следующем месяце попробуйте уделять больше времени 20-минутным поцелуям и расслабляющему массажу.";
    }
}
