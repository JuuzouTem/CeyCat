// js/chef_kedi.js
const ChefKedi = {
    element: null,
    bubbleElement: null,
    messageElement: null,
    accessoriesElement: null,
    hatElement: null,
    apronElement: null,

    moods: { // Ruh halleri ve görseller
        idle: "images/chef_cat/idle.png",
        happy: "images/chef_cat/happy.png",
        excited: "images/chef_cat/excited.png",
        thinking: "images/chef_cat/thinking.png",
        working: "images/chef_cat/working.png",
        chopping: "images/chef_cat/chopping.png",
        proud: "images/chef_cat/proud.png",
        pointing: "images/chef_cat/pointing.png",
        waiting: "images/chef_cat/waiting.png",
        sad: "images/chef_cat/sad.png",
        surprised: "images/chef_cat/surprised.png",
        wave: "images/chef_cat/wave.png",
        celebrate: "images/chef_cat/celebrate.png",
        encourage: "images/chef_cat/encourage.png",
        idea: "images/chef_cat/thinking.png"
    },
    currentMood: 'idle',
    accessories: { // Aksesuarların durumu
        hat: false,
        apron: false
    },
    speechTimeout: null, // Konuşma balonu zamanlayıcısı
    idleTimer: null, // Otomatik ruh hali değişimi zamanlayıcısı
    idleIntervalDuration: 7000, // Otomatik değişim aralığı (ms) - 7 saniye
    idleMoods: ['idle', 'thinking', 'pointing', 'happy', 'waiting'], // Otomatik değişim için sakin modlar
    activeMoods: ['working', 'chopping', 'celebrate', 'sad', 'excited', 'surprised'], // Otomatik değişimi engelleyecek aktif modlar

    init() {
        console.log("Initializing Chef Kedi...");
        this.element = document.getElementById('chef-cat');
        this.bubbleElement = document.getElementById('speech-bubble');
        this.messageElement = document.getElementById('cat-message');
        this.accessoriesElement = document.getElementById('cat-accessories');
        this.hatElement = document.getElementById('cat-hat');
        this.apronElement = document.getElementById('cat-apron');

        if (!this.element || !this.bubbleElement || !this.messageElement || !this.accessoriesElement || !this.hatElement || !this.apronElement) {
            console.error("Chef Kedi DOM elements not found!");
            return;
        }

        const savedAccessories = Utils.loadData('catAccessories', { hat: false, apron: false });
        this.accessories = savedAccessories;
        this.updateAccessoriesVisual();

        console.log("Chef Kedi Initialized.");
    },

    speak(message, mood = 'idle', duration = 5000) {
        if (!this.element || !this.bubbleElement || !this.messageElement) {
            console.error("Cannot speak, Chef Kedi elements missing.");
            return;
        }
        // Otomatik animasyonu durdur (konuşurken değişmesin)
        this.stopIdleAnimation();

        this.changeMood(mood);

        this.messageElement.textContent = message;
        this.bubbleElement.classList.add('active');

        clearTimeout(this.speechTimeout);
        this.speechTimeout = null;

        if (duration > 0) {
            this.speechTimeout = setTimeout(() => {
                this.hideSpeechBubble();
                // Konuşma bitince otomatik animasyonu tekrar başlatabiliriz
                this.startIdleAnimation();
            }, duration);
        } else {
             // Süresiz mesajlarda da animasyonu başlatma, elle gizlenince başlar
        }

        if (Math.random() < 0.25) {
            const meowSound = (mood === 'happy' || mood === 'excited' || mood === 'celebrate') ? 'meow_happy' : 'meow_neutral';
            GameAudio.playSound(meowSound);
        }
    },

    hideSpeechBubble() {
        if (this.bubbleElement) {
            this.bubbleElement.classList.remove('active');
        }
        clearTimeout(this.speechTimeout);
        this.speechTimeout = null;
        // Balon elle veya süreyle gizlenince, otomatik animasyonu tekrar başlat
        this.startIdleAnimation();
    },

    changeMood(mood = 'idle') {
         if (!this.element) return;
         const targetMood = this.moods[mood] ? mood : 'idle';
         if (targetMood !== this.currentMood || this.element.src.includes(this.moods[targetMood]) === false) { // src kontrolü daha güvenilir olabilir
            if (!this.moods[targetMood]) {
                 console.warn(`Unknown cat mood visual for: ${targetMood}. Using idle.`);
                 this.element.src = this.moods['idle'];
                 this.element.alt = `Şef Kedi - idle`;
                 this.currentMood = 'idle';
            } else {
                this.element.src = this.moods[targetMood];
                this.element.alt = `Şef Kedi - ${targetMood}`;
                this.currentMood = targetMood;
            }
         }
         // Eğer yeni mod aktif bir mod ise, idle animasyonunu durdur
         if (this.activeMoods.includes(this.currentMood)) {
             this.stopIdleAnimation();
         }
    },

    // --- Otomatik Idle Animasyonu ---
    startIdleAnimation() {
        // Sadece oyun ekranındaysa ve zamanlayıcı zaten çalışmıyorsa başlat
        if (Game.state.currentScreen === 'game' && !this.idleTimer) {
            console.log("Starting Kedi idle animation timer.");
            this.stopIdleAnimation(); // Önce varsa temizle (güvenlik için)
            this.idleTimer = setInterval(() => {
                // Koşulları tekrar kontrol et (oyun durmuş olabilir vb.)
                if (Game.state.currentScreen === 'game' &&
                    !Game.state.gamePaused &&
                    !this.bubbleElement.classList.contains('active') && // Konuşmuyorsa
                    !this.activeMoods.includes(this.currentMood)) // Aktif bir modda değilse
                {
                    // Mevcut olmayan rastgele bir sakin mod seç
                    let newMood = this.currentMood;
                    while (newMood === this.currentMood) {
                        newMood = this.idleMoods[Utils.getRandomInt(0, this.idleMoods.length - 1)];
                    }
                    // console.log("Kedi Auto Mood Change:", newMood);
                    this.changeMood(newMood);
                }
            }, this.idleIntervalDuration);
        }
    },

    stopIdleAnimation() {
        if (this.idleTimer) {
            console.log("Stopping Kedi idle animation timer.");
            clearInterval(this.idleTimer);
            this.idleTimer = null;
        }
    },
    // --- Aksesuar Yönetimi ---
    unlockAccessory(accessoryId) {
        if (this.accessories.hasOwnProperty(accessoryId)) {
            if (!this.accessories[accessoryId]) {
                this.accessories[accessoryId] = true;
                console.log(`Accessory unlocked: ${accessoryId}`);
                this.updateAccessoriesVisual();
                Utils.saveData('catAccessories', this.accessories);
                Achievements.checkAchievements({ type: 'accessory_unlocked', id: accessoryId });
                const accessoryName = accessoryId === 'hat' ? 'şapka' : 'önlük';
                this.speak(`Vay! Bana yeni bir ${accessoryName} mı aldın Ceyda? Çok yakıştı! Teşekkürler! ❤️`, 'excited', 6000);
            } else {
                console.log(`Accessory already unlocked: ${accessoryId}`);
            }
        } else {
            console.warn(`Unknown accessory ID: ${accessoryId}`);
        }
    },

    updateAccessoriesVisual() {
        if (this.hatElement) this.hatElement.classList.toggle('hidden', !this.accessories.hat);
        if (this.apronElement) this.apronElement.classList.toggle('hidden', !this.accessories.apron);
    },

    resetAccessories() {
        this.accessories = { hat: false, apron: false };
        this.updateAccessoriesVisual();
        Utils.removeData('catAccessories');
        console.log("Cat accessories reset.");
    },

    handleCatClick() {
        const randomMessages = [
            "Miyav?", "Acıktın mı Ceyda?", "Harika gidiyorsun!", "Mutfak sihirli bir yerdir.",
            "Bir sonraki adım neydi acaba?", "Bu tarif çok lezzetli olacak!",
            "Patilerimle bile daha hızlı yapardım... Şaka şaka! 😉", "Kendine iyi bakmayı unutma ❤️",
            "Yardıma ihtiyacın olursa söylemen yeterli.", "En sevdiğin yemek ne Ceyda?"
        ];
        const randomMoods = ['idle', 'happy', 'thinking', 'pointing', 'encourage'];
        // Konuşma başlarken idle animasyonunu durduracak (speak fonksiyonu içinde)
        this.speak(
            randomMessages[Utils.getRandomInt(0, randomMessages.length - 1)],
            randomMoods[Utils.getRandomInt(0, randomMoods.length - 1)],
            4000
        );
    }
};