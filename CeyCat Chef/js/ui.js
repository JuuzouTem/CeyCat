// js/ui.js
const UI = {
    elements: { // DOM elementlerini toplu olarak sakla
        loadingScreen: null, mainMenu: null, gameContainer: null, pauseMenu: null,
        recipeCompleteScreen: null, recipeBookScreen: null, achievementsScreen: null, optionsScreen: null,
        scoreArea: null, score: null, currentRecipeName: null, timerArea: null, timer: null, pauseButton: null,
        startGameBtn: null, recipeBookBtn: null, achievementsBtn: null, optionsBtn: null,
        resumeGameBtn: null, optionsPauseBtn: null, quitToMenuBtn: null,
        nextRecipeBtn: null, replayRecipeBtn: null, backToMenuBtnComplete: null,
        resetProgressBtn: null, chefCat: null, speechBubble: null, catMessage: null,
        stepArea: null, stepTitle: null, stepDescription: null, ingredientsToolsContainer: null,
        feedbackArea: null, minigameArea: null, minigameTitle: null, minigameCanvas: null,
        minigameInstructions: null, nextStepButton: null,
        completionContent: null, completionTitle: null, finalDishImage: null,
        completionMessage: null, completionScoreDisplay: null, finalScore: null,
        recipeList: null, achievementList: null,
        bgmVolumeSlider: null, sfxVolumeSlider: null,
    },

    init() {
         console.log("Initializing UI...");
         // Elementleri ID'lerine göre bul ve sakla
         this.elements.loadingScreen = document.getElementById('loading-screen');
         this.elements.mainMenu = document.getElementById('main-menu');
         this.elements.gameContainer = document.getElementById('game-container');
         this.elements.pauseMenu = document.getElementById('pause-menu');
         this.elements.recipeCompleteScreen = document.getElementById('recipe-complete-screen');
         this.elements.recipeBookScreen = document.getElementById('recipe-book-screen');
         this.elements.achievementsScreen = document.getElementById('achievements-screen');
         this.elements.optionsScreen = document.getElementById('options-screen');
         this.elements.scoreArea = document.getElementById('score-area'); // Puan alanı eklendi
         this.elements.score = document.getElementById('score');
         this.elements.currentRecipeName = document.getElementById('current-recipe-name');
         this.elements.timerArea = document.getElementById('timer-area');
         this.elements.timer = document.getElementById('timer');
         this.elements.pauseButton = document.getElementById('pause-button');
         this.elements.startGameBtn = document.getElementById('start-game-btn');
         this.elements.recipeBookBtn = document.getElementById('recipe-book-btn');
         this.elements.achievementsBtn = document.getElementById('achievements-btn');
         this.elements.optionsBtn = document.getElementById('options-btn');
         this.elements.resumeGameBtn = document.getElementById('resume-game-btn');
         this.elements.optionsPauseBtn = document.getElementById('options-pause-btn');
         this.elements.quitToMenuBtn = document.getElementById('quit-to-menu-btn');
         this.elements.nextRecipeBtn = document.getElementById('next-recipe-btn');
         this.elements.replayRecipeBtn = document.getElementById('replay-recipe-btn');
         this.elements.backToMenuBtnComplete = document.getElementById('back-to-menu-btn-complete');
         this.elements.resetProgressBtn = document.getElementById('reset-progress-btn');
         this.elements.chefCat = document.getElementById('chef-cat');
         this.elements.speechBubble = document.getElementById('speech-bubble');
         this.elements.catMessage = document.getElementById('cat-message');
         this.elements.stepArea = document.getElementById('step-area');
         this.elements.stepTitle = document.getElementById('step-title');
         this.elements.stepDescription = document.getElementById('step-description');
         this.elements.ingredientsToolsContainer = document.getElementById('ingredients-tools-container');
         this.elements.feedbackArea = document.getElementById('feedback-area');
         this.elements.minigameArea = document.getElementById('minigame-area');
         this.elements.minigameTitle = document.getElementById('minigame-title');
         this.elements.minigameCanvas = document.getElementById('minigame-canvas');
         this.elements.minigameInstructions = document.getElementById('minigame-instructions');
         this.elements.nextStepButton = document.getElementById('next-step-button');
         this.elements.completionContent = document.getElementById('completion-content'); // İçerik alanı
         this.elements.completionTitle = document.getElementById('completion-title');
         this.elements.finalDishImage = document.getElementById('final-dish-image');
         this.elements.completionMessage = document.getElementById('completion-message');
         this.elements.completionScoreDisplay = document.getElementById('completion-score'); // Skor alanı
         this.elements.finalScore = document.getElementById('final-score'); // Skor değeri
         this.elements.recipeList = document.getElementById('recipe-list');
         this.elements.achievementList = document.getElementById('achievement-list');
         this.elements.bgmVolumeSlider = document.getElementById('bgm-volume');
         this.elements.sfxVolumeSlider = document.getElementById('sfx-volume');

         // Eksik elemanları kontrol et (opsiyonel ama faydalı)
         for (const key in this.elements) {
             if (!this.elements[key]) {
                 console.warn(`UI Element not found: ID expected for '${key}'`);
             }
         }
         this.addEventListeners(); // Olay dinleyicilerini ekle
         console.log("UI Initialized.");
    },

    addEventListeners() {
        // Ana Menü Butonları
        this.elements.startGameBtn?.addEventListener('click', () => Game.startGame());
        this.elements.recipeBookBtn?.addEventListener('click', () => this.showRecipeBook());
        this.elements.achievementsBtn?.addEventListener('click', () => this.showAchievements());
        this.elements.optionsBtn?.addEventListener('click', () => this.showScreen('options-screen'));

        // Oyun İçi Butonlar
        this.elements.pauseButton?.addEventListener('click', () => Game.pauseGame());
        this.elements.nextStepButton?.addEventListener('click', () => Game.nextStep());

        // Duraklatma Menüsü Butonları
        this.elements.resumeGameBtn?.addEventListener('click', () => Game.resumeGame());
        this.elements.optionsPauseBtn?.addEventListener('click', () => this.showScreen('options-screen')); // Ayarları aç
        this.elements.quitToMenuBtn?.addEventListener('click', () => Game.quitToMenu());

        // Tamamlama Ekranı Butonları
        this.elements.nextRecipeBtn?.addEventListener('click', () => Game.startNextRecipe());
        this.elements.replayRecipeBtn?.addEventListener('click', () => Game.replayCurrentRecipe());
        this.elements.backToMenuBtnComplete?.addEventListener('click', () => Game.quitToMenu());

        // Ayarlar
        this.elements.bgmVolumeSlider?.addEventListener('input', (e) => {
            if (e.target && typeof GameAudio !== 'undefined') GameAudio.setBgmVolume(e.target.value);
        });
        this.elements.sfxVolumeSlider?.addEventListener('input', (e) => {
            if (e.target && typeof GameAudio !== 'undefined') GameAudio.setSfxVolume(e.target.value);
        });
        this.elements.resetProgressBtn?.addEventListener('click', () => {
            if (confirm("Tüm ilerlemen (puanlar, açılan tarifler, başarılar, aksesuarlar) kalıcı olarak silinecek! Emin misin Ceyda?")) {
                Game.resetProgress();
            }
        });

        // Genel Overlay Kapatma Butonları
        document.querySelectorAll('.close-overlay-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetOverlayId = e.target.dataset.target;
                if (targetOverlayId) {
                    this.hideScreen(targetOverlayId);
                } else {
                    console.warn("Close button missing data-target attribute:", e.target);
                     // Genel fallback: en yakın overlay'i kapatmayı dene
                     const parentOverlay = e.target.closest('.overlay');
                     if (parentOverlay) this.hideScreen(parentOverlay.id);
                }
            });
        });

        // Kediye Tıklama
        this.elements.chefCat?.parentElement.addEventListener('click', () => ChefKedi.handleCatClick()); // cat-container'a eklemek daha iyi
    },

    // Ekran Gösterme/Gizleme
    showScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (!screen) {
            console.error(`Screen not found: ${screenId}`);
            return;
        }

        // Eğer açılacak ekran bir overlay ise ve pause/loading değilse, diğer aktif overlay'leri kapat
        if (screen.classList.contains('overlay') && screenId !== 'pause-menu' && screenId !== 'loading-screen') {
            document.querySelectorAll('.overlay.active').forEach(activeOverlay => {
                if (activeOverlay.id !== screenId && activeOverlay.id !== 'loading-screen') {
                    this.hideScreen(activeOverlay.id); // Önce diğerlerini gizle
                }
            });
        }
        // Eğer açılacak ekran ana bir ekran ise (overlay değil), tüm aktif overlay'leri kapat
        else if (screen.classList.contains('screen') && !screen.classList.contains('overlay')) {
             // Önce diğer ana ekranları gizle
             document.querySelectorAll('.screen.active').forEach(activeScreen => {
                 if (activeScreen.id !== screenId && activeScreen.id !== 'loading-screen') { // loading-screen'i elleme
                      this.hideScreen(activeScreen.id);
                 }
             });
             // Sonra aktif overlay'leri gizle (loading hariç)
             document.querySelectorAll('.overlay.active').forEach(activeOverlay => {
                if (activeOverlay.id !== 'loading-screen') {
                    this.hideScreen(activeOverlay.id);
                }
             });
        }

        // Hedef ekranı göster (transition için requestAnimationFrame kullanımı)
        screen.classList.remove('hidden'); // Önce display: none kaldırılır
        requestAnimationFrame(() => { // Tarayıcının bunu işlemesini bekle
            requestAnimationFrame(() => { // Sonra active sınıfını ekle (opacity/transform transition'ı başlar)
                screen.classList.add('active');
                console.log(`Screen shown: ${screenId}`);
            });
        });
    },

    hideScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('active'); // Önce opacity/transform transition'ı başlar
            // Transition bittikten sonra 'hidden' eklenmesi daha pürüzsüz olabilir,
            // ama CSS transition'ı zaten visibility'yi geciktiriyor.
            // screen.addEventListener('transitionend', () => screen.classList.add('hidden'), { once: true }); // Alternatif
            console.log(`Screen hidden: ${screenId}`);
        } else {
            // console.warn(`Screen not found during hide: ${screenId}`); // Gizlerken hata göstermeyebiliriz
        }
    },

    // Oyun İçi UI Güncellemeleri
    updateScore(score) {
        if (this.elements.score && this.elements.scoreArea) {
             const oldScore = parseInt(this.elements.score.textContent) || 0;
             this.elements.score.textContent = score;
             // Puan artışında görsel efekt
             if (score > oldScore) {
                 this.elements.scoreArea.classList.add('score-increase');
                 // Efektin bitiminde sınıfı kaldır
                 setTimeout(() => this.elements.scoreArea?.classList.remove('score-increase'), 500);
             }
        }
    },

    setRecipeTitle(title) {
        if (this.elements.currentRecipeName) this.elements.currentRecipeName.textContent = title;
    },

    showTimer(time) {
         if (this.elements.timerArea) {
             this.elements.timerArea.classList.remove('hidden');
             this.updateTimer(time); // Başlangıç değerini ayarla
         }
    },
    updateTimer(time) {
         if (this.elements.timer && this.elements.timerArea) {
             this.elements.timer.textContent = `${Math.max(0, time)}s`; // Negatif gösterme
             // Uyarı sınıfını yönet
             this.elements.timerArea.classList.toggle('timer-warning', time <= 5 && time > 0);
         }
    },
    hideTimer() {
         if (this.elements.timerArea) {
             this.elements.timerArea.classList.add('hidden');
             this.elements.timerArea.classList.remove('timer-warning'); // Uyarıyı kaldır
         }
    },

     displayStepInfo(title, description) {
         if (this.elements.stepTitle) this.elements.stepTitle.textContent = title || '';
         // innerHTML yerine textContent kullanmak daha güvenli olabilir, ama basit HTML (örn. <br>) için innerHTML kalabilir.
         if (this.elements.stepDescription) this.elements.stepDescription.innerHTML = description || '';
     },

     displayItems(items, stepType, correctIdOrSequence, clickHandler) {
         const container = this.elements.ingredientsToolsContainer;
         if (!container) return;
         container.innerHTML = ''; // Önceki itemları temizle
         container.classList.remove('hidden'); // Görünür yap

         if (!items || items.length === 0) {
             container.classList.add('hidden'); // Item yoksa gizle
             return;
         }

         items.forEach((item) => {
             const button = document.createElement('button'); // Buton olarak oluşturmak daha erişilebilir
             button.type = 'button'; // Tipini belirt
             const isTool = stepType === 'click_tool' || item.isTool; // Araç mı malzeme mi?
             button.classList.add(isTool ? 'tool' : 'ingredient');
             button.dataset.id = item.id; // Veri ID'si
             // Güvenli HTML oluşturma (template literals)
             button.innerHTML = `
                 <img src="${item.img || 'images/ui/placeholder.png'}" alt="${item.name}" loading="lazy">
                 <span>${item.name}</span>
             `;
             button.addEventListener('click', clickHandler); // Tıklama olayını ekle
             container.appendChild(button);
         });
     },

     // Item üzerinde görsel geri bildirim (Doğru/Yanlış)
     setItemFeedback(itemId, isCorrect) {
          const itemElement = this.elements.ingredientsToolsContainer?.querySelector(`button[data-id="${itemId}"]`);
          if (itemElement) {
              // Önceki feedback sınıflarını temizle
              itemElement.classList.remove('correct-choice', 'incorrect-choice', 'selected');
              // Yeni sınıfı ekle
              itemElement.classList.add(isCorrect ? 'correct-choice' : 'incorrect-choice');
              // Yanlışsa bir süre sonra sınıfı kaldır (animasyon biter)
              if (!isCorrect) {
                  setTimeout(() => itemElement.classList.remove('incorrect-choice'), 600);
              }
          }
     },
      // Item seçili durumunu ayarla (Multi-select / Sequence)
      setItemSelected(itemId, isSelected) {
          const itemElement = this.elements.ingredientsToolsContainer?.querySelector(`button[data-id="${itemId}"]`);
          if (itemElement) {
              itemElement.classList.toggle('selected', isSelected);
          }
      },

      // Tüm item tıklamalarını etkinleştir/devre dışı bırak
     disableItemClicks(disable = true) {
         this.elements.ingredientsToolsContainer?.querySelectorAll('button.ingredient, button.tool').forEach(item => {
             item.disabled = disable; // Butonun disabled özelliğini ayarla
             item.classList.toggle('disabled', disable); // Görsel stil için sınıf ekle/kaldır
             // Devre dışı bırakırken seçim/feedback sınıflarını temizle
             if(disable) {
                 item.classList.remove('selected', 'correct-choice', 'incorrect-choice');
             }
         });
     },

     // Alt geri bildirim alanını güncelle
     showFeedback(message, type = 'info') { // type: 'info', 'success', 'warning', 'error'
         if (this.elements.feedbackArea) {
             this.elements.feedbackArea.textContent = message; // textContent daha güvenli
             this.elements.feedbackArea.className = 'feedback'; // Temel sınıfı ayarla
             if (type !== 'info') {
                 this.elements.feedbackArea.classList.add(type); // Özel tür sınıfını ekle
             }
         }
     },
     clearFeedback() {
         if (this.elements.feedbackArea) {
             this.elements.feedbackArea.textContent = '';
             this.elements.feedbackArea.className = 'feedback'; // Sadece temel sınıf kalsın
         }
     },

     // Sonraki Adım / Devam Et butonunu güncelle
     updateNextButton(text, action = null, visible = true) {
         if (this.elements.nextStepButton) {
             this.elements.nextStepButton.textContent = text;
             this.elements.nextStepButton.classList.toggle('hidden', !visible); // CSS'de .hidden { display: none; } olmalı
             this.elements.nextStepButton.disabled = false; // Varsayılan olarak etkin
             // Eğer özel bir action varsa (nadiren kullanılır, genellikle Game.nextStep çağrılır)
             // this.elements.nextStepButton.onclick = action || (() => Game.nextStep());
         }
     },
      disableNextButton(disable = true) {
         if(this.elements.nextStepButton) {
            this.elements.nextStepButton.disabled = disable;
         }
     },

    // Tarif Tamamlama Ekranını Göster
    showCompletionScreen(recipe, recipeScore, totalScore) {
        if (!recipe) return;

         if (this.elements.completionTitle) this.elements.completionTitle.textContent = recipe.completionTitle || "Harika İş!";
         if (this.elements.finalDishImage) {
             this.elements.finalDishImage.src = recipe.completionImage || 'images/ui/placeholder_dish.png';
             this.elements.finalDishImage.alt = recipe.name;
         }
         // Mesajı oluştur
         let messageHtml = `${recipe.completionMessageBase || 'Tarifi başarıyla tamamladın!'}`;
         if (recipeScore !== undefined) {
             messageHtml += `<br>Bu tariften <strong>${recipeScore}</strong> puan kazandın!`;
         }
         if (totalScore !== undefined) {
              messageHtml += `<br>Toplam puanın: <strong>${totalScore}</strong>.`;
         }
         if (this.elements.completionMessage) this.elements.completionMessage.innerHTML = messageHtml;

         // Skoru göster
         if (this.elements.completionScoreDisplay) {
             if (this.elements.finalScore) this.elements.finalScore.textContent = recipeScore;
             this.elements.completionScoreDisplay.classList.toggle('hidden', recipeScore === undefined);
         }


         // Butonları ayarla
         const nextRecipe = Game.getNextRecipe(); // Sonraki tarifi al
         const nextRecipeAvailable = nextRecipe !== null;
         if(this.elements.nextRecipeBtn) {
             this.elements.nextRecipeBtn.classList.toggle('hidden', !nextRecipeAvailable);
             this.elements.nextRecipeBtn.disabled = !nextRecipeAvailable;
         }
         // Challenge tamamlandıysa "Sıradaki Tarif" butonunu gizle
         if (recipe.isChallenge && this.elements.nextRecipeBtn) {
              this.elements.nextRecipeBtn.classList.add('hidden');
         }
         // Tekrar Oyna butonu her zaman görünür olsun (challenge dahil)
         if(this.elements.replayRecipeBtn) {
             this.elements.replayRecipeBtn.classList.remove('hidden');
         }

         this.showScreen('recipe-complete-screen');
     },

    // Tarif Kitabını Göster
    showRecipeBook() {
         const container = this.elements.recipeList;
         if (!container) return;
         container.innerHTML = ''; // Temizle

         const allRecipes = Recipes;
         const unlockedRecipes = Game.state.unlockedRecipes || [];
         const finalChallengeUnlocked = Game.state.finalChallengeUnlocked;

         // Tarifleri zorluğa ve isme göre sırala
         const sortedRecipeIds = Object.keys(allRecipes).sort((a, b) => {
             const recipeA = allRecipes[a];
             const recipeB = allRecipes[b];
             const diffA = recipeA.difficulty || 0;
             const diffB = recipeB.difficulty || 0;
             // Challenge en sona gelsin
             if (recipeA.isChallenge && !recipeB.isChallenge) return 1;
             if (!recipeA.isChallenge && recipeB.isChallenge) return -1;
             // Zorluğa göre sırala
             if (diffA !== diffB) return diffA - diffB;
             // Aynı zorlukta isme göre sırala
             return (recipeA.name || '').localeCompare(recipeB.name || '');
         });

         sortedRecipeIds.forEach(id => {
            const recipe = allRecipes[id];
            // Final challenge kilidi kapalıysa gösterme
            if (id === 'final_challenge' && !finalChallengeUnlocked) return;

             const isUnlocked = unlockedRecipes.includes(id) || recipe.unlockScore === 0;
             const card = document.createElement('div');
             card.className = `recipe-card ${isUnlocked ? '' : 'locked'}`;
             card.dataset.recipeId = id;

             // Zorluk yıldızları
             const difficultyStars = recipe.difficulty
                 ? '<span class="difficulty-stars">' + '★'.repeat(recipe.difficulty) + '☆'.repeat(Math.max(0, 5 - recipe.difficulty)) + '</span>'
                 : '<span class="difficulty-stars">☆☆☆☆☆</span>';

             // Durum metni
             const statusText = isUnlocked
                 ? `<span class="recipe-status unlocked">${recipe.isChallenge ? 'Meydan Oku!' : 'Başla!'}</span>`
                 : `<span class="recipe-status locked">Kilitli<br><small>(Gerekli Puan: ${recipe.unlockScore})</small></span>`;

             card.innerHTML = `
                 <img src="${recipe.completionImage || 'images/ui/placeholder_dish.png'}" alt="${recipe.name}" loading="lazy">
                 <h3>${recipe.name || 'İsimsiz Tarif'}</h3>
                 <p>Zorluk: ${difficultyStars}</p>
                 ${statusText}
             `;

             // Kilidi açıksa tıklanabilir yap
             if (isUnlocked) {
                  card.onclick = () => {
                      Game.startSpecificRecipe(id);
                      // this.hideScreen('recipe-book-screen'); // Oyun başlatma zaten kapatıyor
                  };
             }
             container.appendChild(card);
         });

         this.showScreen('recipe-book-screen'); // Ekranı göster
    },

     // Başarılar Ekranını Göster
     showAchievements() {
         const container = this.elements.achievementList;
         if (!container) return;
         container.innerHTML = ''; // Temizle

         const allAchievements = Achievements.getAllAchievements(); // Tüm başarıları al

         allAchievements.forEach(ach => {
             const item = document.createElement('div');
             item.className = `achievement-item ${ach.unlocked ? 'unlocked' : ''}`;

             // İlerleme metni (eğer varsa ve kilitliyse)
             let progressText = '';
             if (ach.requiredCount && !ach.unlocked) {
                 const progress = Achievements.playerProgress[ach.id] || 0;
                 // İlerleme sayısını playerProgress'ten al
                 const currentProgressCount = typeof progress === 'number' ? progress : 0; // Eğer sayı değilse 0 al
                 progressText = ` <small>(${currentProgressCount}/${ach.requiredCount})</small>`;
             }

             item.innerHTML = `
                 <img src="${ach.icon || 'images/ui/placeholder_achievement.png'}" alt="${ach.name}" loading="lazy">
                 <div class="achievement-details">
                     <h4>${ach.name}</h4>
                     <p>${ach.description}${progressText}</p>
                 </div>
             `;
             container.appendChild(item);
         });

         this.showScreen('achievements-screen'); // Ekranı göster
     },

    // Bildirim (Toast) Göster
    showToastNotification(message, type = 'success', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`; // Tipe göre sınıf
        let iconHtml = ''; // İkonlar
         if (type === 'success') iconHtml = '✓ ';
         else if (type === 'achievement') iconHtml = '🏆 ';
         else if (type === 'unlock') iconHtml = '🔑 ';
         else if (type === 'error') iconHtml = '⚠️ ';
         else if (type === 'warning') iconHtml = '🔔 ';

        toast.innerHTML = `${iconHtml}<span>${message}</span>`;
        document.body.appendChild(toast); // Body'ye ekle

        // Ses çal (varsa)
        if (typeof GameAudio !== 'undefined') {
            if (type === 'achievement') GameAudio.playSound('achievement_unlocked');
            else if (type === 'unlock' || type === 'success') GameAudio.playSound('success_ping');
            else if (type === 'error') GameAudio.playSound('failure_buzz');
            // 'warning' için özel ses eklenebilir
        }

        // Belirli süre sonra kaldır
        setTimeout(() => {
            toast.classList.add('fade-out'); // CSS ile solma animasyonu
            // Animasyon bittikten sonra DOM'dan kaldır
            toast.addEventListener('transitionend', () => toast.remove());
            // Fallback: Animasyon olmazsa veya takılırsa diye garanti kaldırma
            setTimeout(() => toast.remove(), 500);
        }, duration);
    }
};