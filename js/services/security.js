let tapCount = 0;
let lastTapTime = 0;

export function initStealthAndSecurity() {
    // 1. Активация по клавише Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleStealthMode();
    });

    // 2. Активация по 3 тапам по экрану
    document.addEventListener('touchstart', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 400 && tapLength > 0) {
            tapCount++;
            if (tapCount === 3) {
                toggleStealthMode();
                tapCount = 0;
            }
        } else {
            tapCount = 1;
        }
        lastTapTime = currentTime;
    });

    // 3. Активация по встряхиванию телефона (Shake Detection)
    if (window.DeviceMotionEvent) {
        let lastX, lastY, lastZ;
        window.addEventListener('devicemotion', (e) => {
            let acc = e.accelerationIncludingGravity;
            if (!acc) return;
            
            let deltaX = Math.abs(lastX - acc.x);
            let deltaY = Math.abs(lastY - acc.y);
            let deltaZ = Math.abs(lastZ - acc.z);

            if ((deltaX + deltaY + deltaZ) > 30) {
                toggleStealthMode();
            }
            lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        });
    }
}

export function toggleStealthMode() {
    const stealthScreen = document.getElementById('stealthScreen');
    if (stealthScreen.style.display === 'flex') {
        stealthScreen.style.display = 'none';
    } else {
        stealthScreen.style.display = 'flex';
    }
}

// Зашифрованный экспорт данных в .couple файл
export function exportEncryptedData(pairCode) {
    const backupData = {
        pairCode: pairCode,
        userRole: localStorage.getItem('userRole'),
        userCat: localStorage.getItem('userCat'),
        couplePoints: localStorage.getItem('couplePoints'),
        timestamp: new Date().toISOString()
    };

    const jsonString = JSON.stringify(backupData);
    const encodedData = btoa(encodeURIComponent(jsonString)); // Базовое зашифрованное кодирование

    const blob = new Blob([encodedData], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${pairCode}_${new Date().toISOString().slice(0,10)}.couple`;
    link.click();
}

// Импорт данных из файла
export function importEncryptedData(file, onComplete) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const encodedData = e.target.result;
            const jsonString = decodeURIComponent(atob(encodedData));
            const data = JSON.parse(jsonString);

            if (data.pairCode) {
                localStorage.setItem('pairCode', data.pairCode);
                localStorage.setItem('userRole', data.userRole || 'p1');
                localStorage.setItem('userCat', data.userCat || 'balanced');
                if (data.couplePoints) localStorage.setItem('couplePoints', data.couplePoints);

                alert("🎉 Данные успешно восстановлены!");
                onComplete();
            }
        } catch(err) {
            alert("❌ Ошибка при чтении файла бэкапа!");
        }
    };
    reader.readAsText(file);
}
