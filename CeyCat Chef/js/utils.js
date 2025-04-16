    // js/utils.js
    const Utils = {
        // Yerel Depolamaya Veri Kaydetme
        saveData: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.error("Error saving data to localStorage:", key, e);
            }
        },

        // Yerel Depolamadan Veri Yükleme
        loadData: (key, defaultValue = null) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.error("Error loading data from localStorage:", key, e);
                return defaultValue;
            }
        },

        // Veriyi Yerel Depolamadan Silme
        removeData: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error("Error removing data from localStorage:", key, e);
            }
        },

        // Rastgele Tamsayı Üretme (min dahil, max dahil)
        getRandomInt: (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        // Bir Diziyi Karıştırma (Fisher-Yates Algoritması)
        shuffleArray: (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Swap
            }
            return array;
        },

        // Basit ID Üretici
        generateId: (prefix = 'id') => {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        // Zamanı saniye cinsinden formatlama (örn: 125 -> 2:05)
        formatTime: (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`; // 2:05 gibi
        }
    };