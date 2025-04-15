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
            // Daha fazla başarı eklenebilir
        },
        playerProgress: {}, // { pizza_lover: true, soup_master: 1, ... }

        init() {
            console.log("Initializing Achievements...");
            const savedProgress = Utils.loadData('achievementsProgress', {});
            this.playerProgress = savedProgress;

            // Kayıtlı ilerlemeye göre listeyi güncelle
            for (const id in this.list) {
                if (this.playerProgress[id]) {
                    if (typeof this.playerProgress[id] === 'boolean') { // Basit unlock
                         this.list[id].unlocked = this.playerProgress[id];
                    } else if (typeof this.playerProgress[id] === 'number' && this.list[id].requiredCount) { // Sayaca bağlı unlock
                         this.list[id].unlocked = this.playerProgress[id] >= this.list[id].requiredCount;
                    }
                } else {
                    this.list[id].unlocked = false; // Kayıt yoksa kilitli
                }
            }
             console.log("Achievements Initialized. Progress:", this.playerProgress);
        },

        // Başarıları kontrol et ve gerekiyorsa kilidini aç
        checkAchievements(eventData) {
            // eventData: { type: 'recipe_complete', id: 'pizza_margherita', score: 1200, time: 280, scorePercent: 98, category: 'italian', isDessert: false }
            // eventData: { type: 'accessory_unlocked', id: 'chef_hat' }
            console.log("Checking achievements for event:", eventData);
            let newlyUnlocked = [];

            for (const id in this.list) {
                if (!this.list[id].unlocked) { // Sadece kilitli olanları kontrol et
                    let shouldUnlock = false;
                    const achievement = this.list[id];

                    if (eventData.type === 'recipe_complete') {
                        // Tarifi tamamlama temelli başarılar
                        if (id === 'first_step' && !this.playerProgress.first_step) shouldUnlock = true;
                        if (id === 'pizza_lover' && eventData.id.includes('pizza')) shouldUnlock = true;
                        if (achievement.category === 'soup' && Recipes[eventData.id]?.category === 'soup') {
                             this.playerProgress[id] = (this.playerProgress[id] || 0) + 1;
                             if (this.playerProgress[id] >= achievement.requiredCount) shouldUnlock = true;
                        }
                         if (achievement.category === 'dessert' && Recipes[eventData.id]?.isDessert) {
                             this.playerProgress[id] = (this.playerProgress[id] || 0) + 1;
                             if (!achievement.requiredCount || this.playerProgress[id] >= achievement.requiredCount) shouldUnlock = true; // İlk tatlı veya X. tatlı
                         }
                        if (achievement.condition === 'time' && eventData.time < 300) shouldUnlock = true; // 5 dakika = 300 saniye
                        if (achievement.condition === 'scorePercent' && eventData.scorePercent >= 95) shouldUnlock = true;
                        if (achievement.condition === 'cuisine' && Recipes[eventData.id]?.cuisine) {
                             // Farklı mutfakları saymak için daha karmaşık bir yapı lazım
                             // Şimdilik basitçe: Eğer bu mutfak daha önce sayılmadıysa sayacı artır.
                             if (!this.playerProgress.cuisines) this.playerProgress.cuisines = {};
                             if (!this.playerProgress.cuisines[Recipes[eventData.id].cuisine]) {
                                 this.playerProgress.cuisines[Recipes[eventData.id].cuisine] = true;
                                 this.playerProgress[id] = (this.playerProgress[id] || 0) + 1;
                                 if (this.playerProgress[id] >= achievement.requiredCount) shouldUnlock = true;
                             }
                        }

                    } else if (eventData.type === 'accessory_unlocked') {
                        // Aksesuar kazanma temelli başarılar
                         if (achievement.condition === 'accessory' && !this.playerProgress.cat_friend) { // Sadece ilk aksesuar için
                             shouldUnlock = true;
                         }
                    }


                    if (shouldUnlock) {
                        this.unlockAchievement(id);
                        newlyUnlocked.push(this.list[id]);
                    }
                }
            }
             // İlerleme sayaçlarını kaydet (kilit açılmasa bile)
             Utils.saveData('achievementsProgress', this.playerProgress);

            if (newlyUnlocked.length > 0) {
                 console.log("Newly unlocked achievements:", newlyUnlocked.map(a => a.name));
                 // UI'da bildirim gösterilebilir
                 UI.showAchievementNotification(newlyUnlocked);
            }
        },

        unlockAchievement(id) {
            if (this.list[id] && !this.list[id].unlocked) {
                this.list[id].unlocked = true;
                // playerProgress'i de güncelle (sayaca bağlı değilse boolean yap)
                 if (!this.list[id].requiredCount) {
                     this.playerProgress[id] = true;
                 }
                 // Sayaca bağlıysa zaten checkAchievements içinde güncellendi.
                console.log(`Achievement Unlocked: ${this.list[id].name}`);
                 Audio.playSound('achievement_unlocked'); // Özel başarı sesi

                 // İlerlemeyi hemen kaydet
                 Utils.saveData('achievementsProgress', this.playerProgress);
            }
        },

        getAchievementStatus(id) {
            return this.list[id] ? this.list[id].unlocked : false;
        },

        getAllAchievements() {
            // UI'da göstermek için listeyi döndür
            return Object.entries(this.list).map(([id, data]) => ({ id, ...data }));
        },

         resetProgress() {
             this.playerProgress = {};
             for (const id in this.list) {
                 this.list[id].unlocked = false;
             }
             Utils.removeData('achievementsProgress');
             Utils.removeData('unlockedRecipes'); // İlgili diğer verileri de silmek iyi olur
             Utils.removeData('playerScore');
             Utils.removeData('catAccessories');
             console.log("Achievements progress reset.");
             // Sayfayı yenilemek veya ana menüye dönmek gerekebilir
         }
    };