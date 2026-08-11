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

export const imgPool = [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80"
];
