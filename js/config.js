export const firebaseConfig = {
    apiKey: "AIzaSyCHsmF5VKef6zOmUft_pLRAHoSph4cIsUg",
    authDomain: "adventcouple-4fd17.firebaseapp.com",
    databaseURL: "https://adventcouple-4fd17-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "adventcouple-4fd17",
    storageBucket: "adventcouple-4fd17.firebasestorage.app",
    messagingSenderId: "546937107365",
    appId: "1:546937107365:web:281b443fee202d9d28ae4c"
};

export const now = new Date();
export const currentYear = now.getFullYear();
export const currentMonth = now.getMonth();
export const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
export const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
export const monthKey = `${currentYear}_${currentMonth}`;

export const imgPool = Array.from({length: 30}, (_, i) => `./img/medow/pose_${i + 1}.png`);

