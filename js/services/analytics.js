export function renderAnalyticsCharts(p1Completed, p2Completed, monthTasks) {
    renderWeekdayChart(p1Completed, p2Completed);
    renderCategoryChart(p1Completed, p2Completed, monthTasks);
}

function renderWeekdayChart(p1Completed, p2Completed) {
    const canvas = document.getElementById('weekdayChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const counts = [3, 5, 2, 8, 12, 15, 10]; // Пример распределения пройденных дней

    const barWidth = 30;
    const gap = 12;
    const maxVal = Math.max(...counts, 1);

    counts.forEach((count, i) => {
        const h = (count / maxVal) * 100;
        const x = 15 + i * (barWidth + gap);
        const y = 130 - h;

        ctx.fillStyle = '#e2b07e';
        ctx.fillRect(x, y, barWidth, h);

        ctx.fillStyle = '#a89fbe';
        ctx.font = '10px Montserrat';
        ctx.fillText(days[i], x + 8, 145);
    });
}

function renderCategoryChart(p1Completed, p2Completed, monthTasks) {
    const canvas = document.getElementById('categoriesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const categories = [
        { label: 'Классика', color: '#e2b07e', value: 40 },
        { label: 'Доминирование', color: '#a374db', value: 25 },
        { label: 'Камасутра', color: '#e67e90', value: 20 },
        { label: 'BDSM', color: '#4caf50', value: 15 }
    ];

    let total = categories.reduce((sum, c) => sum + c.value, 0);
    let startAngle = 0;

    categories.forEach(cat => {
        let sliceAngle = (cat.value / total) * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(150, 75, 60, startAngle, startAngle + sliceAngle);
        ctx.lineTo(150, 75);
        ctx.fillStyle = cat.color;
        ctx.fill();

        startAngle += sliceAngle;
    });
}
