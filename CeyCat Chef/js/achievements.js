// js/achievements.js
const Achievements = {
    list: {
        "first_step": { name: "İlk Adım", description: "İlk tarifini tamamladın!", icon: "images/achievements/first_step.png", unlocked: false },
        "pizza_lover": { name: "Pizza Aşkına!", description: "İlk pizzanı başarıyla yaptın.", icon: "images/achievements/pizza_lover.png", unlocked: false },
        "soup_master": { name: "Çorba Ustası", description: "3 farklı çorba tarifi tamamladın.", icon: "images/achievements/soup_master.png", unlocked: false, requiredCount: 3, category: 'soup' },
        "sweet_tooth": { name: "Tatlı Krizi", description: "İlk tatlı tarifini tamamladın.", icon: "images/achievements/sweet_tooth.png", unlocked: false, category: 'dessert' },
        "quick_chef": { name: "Hızlı Şef", description: "Bir tarifi 5 dakikadan kısa sürede tamamladın.", icon: "images/achievements/quick_chef.png", unlocked: false, condition: 'time' },
        "perfect_score": { name: "Mükemmeliyetçi", description: "Bir tarifte %95 üzeri başarı elde ettin.", icon: "images/achievements/perfect_score.png", unlocked: false, condition: 'scorePercent' },
         "world_explorer": { name: "Dünya Turu", description: "5 farklı ülke mutfağından tarif denedin.", icon: "images/achievements/world_explorer.png", unlocked: false, requiredCount: 5, condition: 'cuisine' },
         "cat_friend": { name: "Kedinin Dostu", description: "Şef Kedi için bir aksesuar kazandın.", icon: "images/achievements/cat_friend.png", unlocked: false, condition: 'accessory' }
    },
    playerProgress: {},

    init() {
        console.log("Initializing Achievements...");
        const savedProgress = Utils.loadData('achievementsProgress', {});
        this.playerProgress = savedProgress;

        for (const id in this.list) {
            if (this.playerProgress[id]) {
                if (typeof this.playerProgress[id] === 'boolean') {
                     this.list[id].unlocked = this.playerProgress[id];
                } else if (typeof this.playerProgress[id] === 'number' && this.list[id].requiredCount) {
                     this.list[id].unlocked = this.playerProgress[id] >= this.list[id].requiredCount;
                }
            } else {
                this.list[id].unlocked = false;
            }
        }
         console.log("Achievements Initialized. Progress:", this.playerProgress);
    },

    checkAchievements(eventData) {
        console.log("Checking achievements for event:", eventData);
        let newlyUnlocked = [];

        for (const id in this.list) {
            if (!this.list[id].unlocked) {
                let shouldUnlock = false;
                const achievement = this.list[id];

                if (eventData.type === 'recipe_complete') {
                    if (id === 'first_step' && !this.playerProgress.first_step) shouldUnlock = true;
                    if (id === 'pizza_lover' && eventData.id.includes('pizza')) shouldUnlock = true;
                    if (achievement.category === 'soup' && eventData.category === 'soup') { // Kategori kontrolü
                         this.playerProgress[id] = (this.playerProgress[id] || 0) + 1;
                         if (this.playerProgress[id] >= achievement.requiredCount) shouldUnlock = true;
                    }
                     if (achievement.category === 'dessert' && eventData.isDessert) { // Tatlı kontrolü
                         this.playerProgress[id] = (this.playerProgress[id] || 0) + 1;
                         if (!achievement.requiredCount || this.playerProgress[id] >= achievement.requiredCount) shouldUnlock = true;
                     }
                    if (achievement.condition === 'time' && eventData.time < 300) shouldUnlock = true;
                    if (achievement.condition === 'scorePercent' && eventData.scorePercent >= 95) shouldUnlock = true;
                    if (achievement.condition === 'cuisine' && eventData.cuisine) {
                         if (!this.playerProgress.cuisines) this.playerProgress.cuisines = {};
                         if (!this.playerProgress.cuisines[eventData.cuisine]) {
                             this.playerProgress.cuisines[eventData.cuisine] = true;
                             this.playerProgress[id] = (this.playerProgress[id] || 0) + 1;
                             if (this.playerProgress[id] >= achievement.requiredCount) shouldUnlock = true;
                         }
                    }

                } else if (eventData.type === 'accessory_unlocked') {
                     if (achievement.condition === 'accessory' && !this.playerProgress.cat_friend) {
                         shouldUnlock = true;
                     }
                }

                if (shouldUnlock) {
                    this.unlockAchievement(id);
                    newlyUnlocked.push(this.list[id]);
                }
            }
        }
         Utils.saveData('achievementsProgress', this.playerProgress);

        if (newlyUnlocked.length > 0) {
             console.log("Newly unlocked achievements:", newlyUnlocked.map(a => a.name));
             UI.showToastNotification(
                 `Yeni Başarı${newlyUnlocked.length > 1 ? 'lar' : ''}: ${newlyUnlocked.map(a => a.name).join(', ')}!`,
                 'achievement' // Özel tip
             );
        }
    },

    unlockAchievement(id) {
        if (this.list[id] && !this.list[id].unlocked) {
            this.list[id].unlocked = true;
             if (!this.list[id].requiredCount) {
                 this.playerProgress[id] = true;
             }
            console.log(`Achievement Unlocked: ${this.list[id].name}`);
            if(typeof GameAudio !== 'undefined') GameAudio.playSound('achievement_unlocked'); // <<< DEĞİŞTİ (ve kontrol eklendi)

             Utils.saveData('achievementsProgress', this.playerProgress);
        }
    },

    getAchievementStatus(id) {
        return this.list[id] ? this.list[id].unlocked : false;
    },

    getAllAchievements() {
        return Object.entries(this.list).map(([id, data]) => ({ id, ...data }));
    },

     resetProgress() {
         this.playerProgress = {};
         for (const id in this.list) {
             this.list[id].unlocked = false;
         }
         Utils.removeData('achievementsProgress');
         console.log("Achievements progress reset.");
     }
};