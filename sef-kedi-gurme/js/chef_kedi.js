    // js/chef_kedi.js
    const ChefKedi = {
        element: null,
        bubbleElement: null,
        messageElement: null,
        accessoriesElement: null,
        hatElement: null,
        apronElement: null,

        // Kedi ruh halleri ve karşılık gelen görseller
        moods: {
            idle: "images/chef_cat/idle.png",
            happy: "images/chef_cat/happy.png",
            excited: "images/chef_cat/excited.png",
            thinking: "images/chef_cat/thinking.png",
            working: "images/chef_cat/working.png", // Yemek yaparken
            chopping: "images/chef_cat/chopping.png", // Doğrarken
            proud: "images/chef_cat/proud.png", // Başarılı bitiş
            pointing: "images/chef_cat/pointing.png", // İşaret ederken
            waiting: "images/chef_cat/waiting.png", // Beklerken
            sad: "images/chef_cat/sad.png", // Hata durumunda (nazikçe)
            surprised: "images/chef_cat/surprised.png",
            wave: "images/chef_cat/wave.png", // Ana menü
            celebrate: "images/chef_cat/celebrate.png", // Büyük başarı
            encourage: "images/chef_cat/encourage.png" // Teşvik edici
        },
        currentMood: 'idle',
        accessories: {
            hat: false,
            apron: false
        },
        speechTimeout: null,

        init() {
            console.log("Initializing Chef Kedi...");
            this.element = document.getElementById('chef-cat');
            this.bubbleElement = document.getElementById('speech-bubble');
            this.messageElement = document.getElementById('cat-message');
            this.accessoriesElement = document.getElementById('cat-accessories');
            this.hatElement = document.getElementById('cat-hat');
            this.apronElement = document.getElementById('cat-apron');

             // Kayıtlı aksesuarları yükle
             const savedAccessories = Utils.loadData('catAccessories', { hat: false, apron: false });
             this.accessories = savedAccessories;
             this.updateAccessoriesVisual();

             if (!this.element || !this.bubbleElement || !this.messageElement) {
                 console.error("Chef Kedi DOM elements not found!");
                 return;
             }
             console.log("Chef Kedi Initialized.");
        },

        // Kedinin konuşmasını ve ruh halini ayarla
        speak(message, mood = 'idle', duration = 5000) { // duration: mesajın ne kadar ekranda kalacağı (ms)
            if (!this.element || !this.bubbleElement || !this.messageElement) return;

            // Ruh halini ve görseli güncelle
            if (this.moods[mood]) {
                this.currentMood = mood;
                this.element.src = this.moods[mood];
                this.element.alt = `Şef Kedi - ${mood}`; // Erişilebilirlik
            } else {
                 console.warn(`Unknown cat mood: ${mood}. Using idle.`);
                 this.currentMood = 'idle';
                 this.element.src = this.moods['idle'];
                 this.element.alt = `Şef Kedi - idle`;
            }

            // Mesajı güncelle ve balonu göster
            this.messageElement.textContent = message;
            this.bubbleElement.classList.add('active');

            // Belirli bir süre sonra balonu otomatik gizle (isteğe bağlı)
            clearTimeout(this.speechTimeout); // Önceki zamanlayıcıyı temizle
            if (duration > 0) {
                this.speechTimeout = setTimeout(() => {
                    this.hideSpeechBubble();
                }, duration);
            }

            // Kedi konuşurken miyavlama efekti (rastgele)
            if (Math.random() < 0.3) { // %30 ihtimalle
                 Audio.playSound(mood === 'happy' || mood === 'excited' ? 'meow_happy' : 'meow_neutral'); // Farklı miyavlamalar olabilir
            }
        },

        // Konuşma balonunu gizle
        hideSpeechBubble() {
            if (this.bubbleElement) {
                this.bubbleElement.classList.remove('active');
                 // Gizlendikten sonra mesajı temizleyebiliriz
                 // setTimeout(() => { this.messageElement.textContent = ''; }, 400); // CSS transition süresi kadar sonra
            }
             clearTimeout(this.speechTimeout); // Zamanlayıcıyı temizle
        },

         // Sadece ruh halini/görseli değiştir
         changeMood(mood = 'idle') {
              if (this.moods[mood]) {
                 this.currentMood = mood;
                 this.element.src = this.moods[mood];
                 this.element.alt = `Şef Kedi - ${mood}`;
             } else {
                 console.warn(`Unknown cat mood: ${mood}. Using idle.`);
                 this.currentMood = 'idle';
                 this.element.src = this.moods['idle'];
                 this.element.alt = `Şef Kedi - idle`;
             }
         },

         // Aksesuar kilidini aç
         unlockAccessory(accessoryId) {
             if (this.accessories.hasOwnProperty(accessoryId)) {
                 if (!this.accessories[accessoryId]) {
                     this.accessories[accessoryId] = true;
                     console.log(`Accessory unlocked: ${accessoryId}`);
                     this.updateAccessoriesVisual();
                     Utils.saveData('catAccessories', this.accessories);
                     // Başarı kontrolünü tetikle
                     Achievements.checkAchievements({ type: 'accessory_unlocked', id: accessoryId });
                     this.speak(`Vay! Bana yeni bir ${accessoryId === 'hat' ? 'şapka' : 'önlük'} mü aldın? Teşekkürler Ceyda!`, 'excited', 6000);
                 }
             } else {
                 console.warn(`Unknown accessory: ${accessoryId}`);
             }
         },

         // Aksesuarların görünürlüğünü güncelle
         updateAccessoriesVisual() {
             if (this.hatElement) {
                 this.hatElement.classList.toggle('hidden', !this.accessories.hat);
             }
             if (this.apronElement) {
                 this.apronElement.classList.toggle('hidden', !this.accessories.apron);
             }
         },

          // Kediye tıklanınca rastgele bir şey söylesin (isteğe bağlı)
         handleCatClick() {
             const randomMessages = [
                 "Miyav?",
                 "Acıktın mı Ceyda?",
                 "Harika gidiyorsun!",
                 "Mutfak sihirli bir yerdir.",
                 "Bir sonraki adım neydi?",
                 "Bu tarif çok lezzetli olacak!",
                 "Patilerimle bile daha hızlı yapardım... Şaka şaka!",
                 "Kendine iyi bakmayı unutma ❤️"
             ];
             const randomMoods = ['idle', 'happy', 'thinking', 'pointing'];
             this.speak(
                 randomMessages[Utils.getRandomInt(0, randomMessages.length - 1)],
                 randomMoods[Utils.getRandomInt(0, randomMoods.length - 1)],
                 4000 // Kısa süre
             );
         }
    };