    // js/ui.js
    const UI = {
        // Gerekli DOM elementlerini başta alabiliriz (performans için)
        elements: {
            loadingScreen: null,
            mainMenu: null,
            gameContainer: null,
            pauseMenu: null,
            recipeCompleteScreen: null,
            recipeBookScreen: null,
            achievementsScreen: null,
            optionsScreen: null,
            score: null,
            currentRecipeName: null,
            timer: null,
            chefCat: null,
            speechBubble: null,
            catMessage: null,
            stepArea: null,
            stepTitle: null,
            stepDescription: null,
            ingredientsToolsContainer: null,
            feedbackArea: null,
            minigameArea: null,
            minigameTitle: null,
            minigameCanvas: null,
            minigameInstructions: null,
            nextStepButton: null,
            finalDishImage: null,
            completionTitle: null,
            completionMessage: null,
            finalScore: null,
            recipeList: null,
            achievementList: null,
            // Ayarlar
            bgmVolumeSlider: null,
            sfxVolumeSlider: null,
        },

        init() {
             console.log("Initializing UI...");
             // Elementleri DOM'dan al
             for (const key in this.elements) {
                 const id = key.replace(/([A-Z])/g, '-$1').toLowerCase(); // camelCase'i kebab-case'e çevir (örn: loadingScreen -> loading-screen)
                 this.elements[key] = document.getElementById(id);
                 // if (!this.elements[key]) console.warn(`UI Element not found: #${id}`); // Hata ayıklama için
             }
             this.addEventListeners();
             console.log("UI Initialized.");
        },

        // Genel UI olay dinleyicileri (butonlar vb.)
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
             this.elements.optionsPauseBtn?.addEventListener('click', () => this.showScreen('options-screen'));
             this.elements.quitToMenuBtn?.addEventListener('click', () => Game.quitToMenu());

             // Tamamlama Ekranı Butonları
             this.elements.nextRecipeBtn?.addEventListener('click', () => Game.startNextRecipe());
             this.elements.replayRecipeBtn?.addEventListener('click', () => Game.replayCurrentRecipe());
             this.elements.backToMenuBtnComplete?.addEventListener('click', () => Game.quitToMenu());

             // Overlay Kapatma Butonları
             document.querySelectorAll('.close-overlay-btn').forEach(button => {
                 button.addEventListener('click', (e) => this.hideScreen(e.target.dataset.target));
             });

             // Ayarlar Butonları/Sliderları
             this.elements.bgmVolumeSlider?.addEventListener('input', (e) => Audio.setBgmVolume(e.target.value));
             this.elements.sfxVolumeSlider?.addEventListener('input', (e) => Audio.setSfxVolume(e.target.value));
             // Ses ayarlarını yüklerken slider değerlerini de ayarla
             this.elements.bgmVolumeSlider.value = Audio.bgmVolume;
             this.elements.sfxVolumeSlider.value = Audio.sfxVolume;

             this.elements.resetProgressBtn?.addEventListener('click', () => {
                  if (confirm("Tüm ilerlemen (puanlar, açılan tarifler, başarılar) silinecek! Emin misin Ceyda?")) {
                      Game.resetProgress();
                  }
              });

             // Kediye tıklama (isteğe bağlı)
             this.elements.chefCat?.addEventListener('click', () => ChefKedi.handleCatClick());
        },


        // --- Ekran Yönetimi ---
        showScreen(screenId) {
            // Önce tüm ekranları gizle (isteğe bağlı, sadece aktif olanı gizlemek daha performanslı olabilir)
            // document.querySelectorAll('.screen, .overlay').forEach(el => el.classList.remove('active'));

            const screen = document.getElementById(screenId);
            if (screen) {
                 // Eğer overlay ise diğer overlay'leri kapat
                 if (screen.classList.contains('overlay') && screenId !== 'loading-screen') {
                    document.querySelectorAll('.overlay.active').forEach(activeOverlay => {
                        if (activeOverlay.id !== screenId) activeOverlay.classList.remove('active');
                    });
                 }
                screen.classList.remove('hidden'); // Önce hidden'ı kaldır
                screen.classList.add('active'); // Sonra active yap (geçişler için)
                 console.log(`Screen shown: ${screenId}`);
            } else {
                console.error(`Screen not found: ${screenId}`);
            }
        },

        hideScreen(screenId) {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('active');
                 // Geçiş tamamlandıktan sonra hidden ekle (performans için)
                 // screen.addEventListener('transitionend', () => screen.classList.add('hidden'), { once: true });
                 // Şimdilik basit tutalım:
                 // setTimeout(() => screen.classList.add('hidden'), 500); // Geçiş süresi kadar
            } else {
                 console.error(`Screen not found: ${screenId}`);
            }
        },

        // --- Oyun İçi UI Güncellemeleri ---
        updateScore(score) {
            if (this.elements.score) {
                 // Puan artışını görsel olarak belirginleştirebiliriz
                 const oldScore = parseInt(this.elements.score.textContent) || 0;
                 this.elements.score.textContent = score;
                 if (score > oldScore) {
                     this.elements.score.classList.add('score-increase');
                     setTimeout(() => this.elements.score.classList.remove('score-increase'), 500); // CSS'te animasyon tanımla
                 }
            }
        },

        setRecipeTitle(title) {
            if (this.elements.currentRecipeName) this.elements.currentRecipeName.textContent = title;
        },

        showTimer(time) {
             if (this.elements.timerArea) {
                 this.elements.timerArea.classList.remove('hidden');
                 this.updateTimer(time);
             }
        },
        updateTimer(time) {
             if (this.elements.timer) this.elements.timer.textContent = `${time}s`;
             // Süre azaldıkça rengi değiştirebiliriz
             if (time <= 5 && time > 0) {
                 this.elements.timer?.classList.add('timer-warning');
             } else {
                  this.elements.timer?.classList.remove('timer-warning');
             }
        },
        hideTimer() {
             if (this.elements.timerArea) this.elements.timerArea.classList.add('hidden');
             this.elements.timer?.classList.remove('timer-warning');
        },

        // Kedi Mesajı (ChefKedi.speak kullanıldığı için bu direkt çağrılmayabilir)
        // setCatMessage(message, mood) {
        //     ChefKedi.speak(message, mood);
        // }

         // Adım Bilgilerini Göster
         displayStepInfo(title, description) {
             if (this.elements.stepTitle) this.elements.stepTitle.textContent = title || '';
             if (this.elements.stepDescription) this.elements.stepDescription.textContent = description || '';
             // Mini oyun alanını gizle, normal adım alanını göster
             this.elements.minigameArea?.classList.add('hidden');
             this.elements.stepArea?.classList.remove('hidden');
         },

         // Malzemeleri/Araçları Göster (Seçim Adımları İçin)
         displayItems(items, stepType, correctIdOrSequence, clickHandler) {
             const container = this.elements.ingredientsToolsContainer;
             if (!container) return;
             container.innerHTML = ''; // Temizle

             items.forEach((item, index) => {
                 const div = document.createElement('div');
                 const isTool = stepType === 'click_tool' || item.isTool;
                 div.classList.add(isTool ? 'tool' : 'ingredient');
                 div.dataset.id = item.id;

                 const img = document.createElement('img');
                 img.src = item.img || 'images/ui/placeholder.png'; // Varsayılan görsel
                 img.alt = item.name;

                 const span = document.createElement('span');
                 span.textContent = item.name;

                 div.appendChild(img);
                 div.appendChild(span);

                 // Tıklama olayını ekle (clickHandler Game.js'den gelecek)
                 div.addEventListener('click', clickHandler);

                 container.appendChild(div);
             });
             // Gerekirse container'ı göster/gizle
             container.classList.remove('hidden');
         },

         // Seçim Adımlarında Item Geri Bildirimi
         setItemFeedback(itemId, isCorrect) {
              const itemElement = this.elements.ingredientsToolsContainer?.querySelector(`[data-id="${itemId}"]`);
              if (itemElement) {
                  itemElement.classList.remove('correct-choice', 'incorrect-choice'); // Öncekileri temizle
                  itemElement.classList.add(isCorrect ? 'correct-choice' : 'incorrect-choice');
                  // Yanlış seçimde kısa bir süre sonra efekti kaldırabiliriz
                  if (!isCorrect) {
                      setTimeout(() => itemElement.classList.remove('incorrect-choice'), 600);
                  }
              }
         },

         // Tüm Item Tıklamalarını Devre Dışı Bırak/Etkinleştir
         disableItemClicks(disable = true) {
             this.elements.ingredientsToolsContainer?.querySelectorAll('.ingredient, .tool').forEach(item => {
                 item.classList.toggle('disabled', disable);
                 // Eğer doğru seçilen varsa onu farklı gösterebiliriz
                 if (disable && !item.classList.contains('correct-choice') && !item.classList.contains('incorrect-choice')) {
                    // item.style.opacity = '0.5'; // Alternatif stil
                 } else {
                    // item.style.opacity = '1';
                 }
             });
         },

         // Geri Bildirim Mesajını Göster
         showFeedback(message, type = 'info') { // type: 'success', 'warning', 'error', 'info'
             if (this.elements.feedbackArea) {
                 this.elements.feedbackArea.textContent = message;
                 this.elements.feedbackArea.className = 'feedback'; // Önceki sınıfları temizle
                 if (type !== 'info') {
                     this.elements.feedbackArea.classList.add(type);
                 }
                 // Mesajı bir süre sonra temizleyebiliriz
                 // setTimeout(() => this.elements.feedbackArea.textContent = '', 4000);
             }
         },
         clearFeedback() {
             if (this.elements.feedbackArea) {
                 this.elements.feedbackArea.textContent = '';
                 this.elements.feedbackArea.className = 'feedback';
             }
         },


         // Sonraki Adım Butonunu Güncelle
         updateNextButton(text, action = null, visible = true) {
             if (this.elements.nextStepButton) {
                 this.elements.nextStepButton.textContent = text;
                 // Eğer özel bir action varsa, onu ata (şimdilik sadece Game.nextStep kullanılıyor)
                 // this.elements.nextStepButton.onclick = action || (() => Game.nextStep());
                 this.elements.nextStepButton.classList.toggle('hidden', !visible);
                 this.elements.nextStepButton.disabled = false; // Her zaman etkin başlasın
             }
         },
          disableNextButton(disable = true) {
             if(this.elements.nextStepButton) this.elements.nextStepButton.disabled = disable;
         },

        // --- Overlay Ekranları Doldurma ---
        showCompletionScreen(recipe, finalScore, totalScore) {
             if (this.elements.completionTitle) this.elements.completionTitle.textContent = recipe.completionTitle || "Harika İş!";
             if (this.elements.finalDishImage) {
                 this.elements.finalDishImage.src = recipe.completionImage || 'images/ui/placeholder_dish.png';
                 this.elements.finalDishImage.alt = recipe.name;
             }
             if (this.elements.completionMessage) this.elements.completionMessage.textContent = `${recipe.completionMessageBase} Bu tariften ${finalScore} puan kazandın! Toplam puanın: ${totalScore}.`;
             if (this.elements.finalScore) this.elements.finalScore.textContent = finalScore;

             // Sonraki tarif var mı kontrol et
             const nextRecipeAvailable = Game.getNextRecipe() !== null;
             this.elements.nextRecipeBtn.classList.toggle('hidden', !nextRecipeAvailable);
             // Eğer challenge ise veya sonraki tarif yoksa "Sıradaki Tarif" butonunu gizle/değiştir

             this.showScreen('recipe-complete-screen');
         },

        showRecipeBook() {
             const container = this.elements.recipeList;
             if (!container) return;
             container.innerHTML = ''; // Temizle

             const allRecipes = Recipes; // recipes.js'den al
             const unlockedRecipes = Game.state.unlockedRecipes; // game.js'den al

             // Zorluğa veya kategoriye göre sıralayabiliriz
             const sortedRecipeIds = Object.keys(allRecipes).sort((a, b) => {
                 const diffA = allRecipes[a].difficulty || 0;
                 const diffB = allRecipes[b].difficulty || 0;
                 if (diffA !== diffB) return diffA - diffB;
                 return (allRecipes[a].name || '').localeCompare(allRecipes[b].name || ''); // Aynı zorlukta isme göre
             });


             sortedRecipeIds.forEach(id => {
                if (id === 'final_challenge' && !Game.state.finalChallengeUnlocked) return; // Özel kontrol

                 const recipe = allRecipes[id];
                 const isUnlocked = unlockedRecipes.includes(id) || recipe.unlockScore === 0;

                 const card = document.createElement('div');
                 card.classList.add('recipe-card');
                 card.classList.toggle('locked', !isUnlocked);
                 card.dataset.recipeId = id;

                 const img = document.createElement('img');
                 img.src = recipe.completionImage || 'images/ui/placeholder_dish.png';
                 img.alt = recipe.name;

                 const title = document.createElement('h3');
                 title.textContent = recipe.name;

                 const desc = document.createElement('p');
                 desc.textContent = `Zorluk: ${'★'.repeat(recipe.difficulty || 1)}${'☆'.repeat(5 - (recipe.difficulty || 1))}`; // Yıldızlı zorluk

                 const status = document.createElement('p');
                  if (isUnlocked) {
                     status.textContent = "Hazır!";
                     status.style.color = 'var(--success-color)';
                      card.onclick = () => {
                          Game.startSpecificRecipe(id);
                          this.hideScreen('recipe-book-screen');
                      };
                 } else {
                     status.textContent = `Kilidi Açmak İçin: ${recipe.unlockScore} Puan`;
                     status.style.color = 'var(--error-color)';
                 }


                 card.appendChild(img);
                 card.appendChild(title);
                 card.appendChild(desc);
                 card.appendChild(status);
                 container.appendChild(card);
             });

             this.showScreen('recipe-book-screen');
        },

         showAchievements() {
             const container = this.elements.achievementList;
             if (!container) return;
             container.innerHTML = ''; // Temizle

             const allAchievements = Achievements.getAllAchievements(); // achievements.js'den al

             allAchievements.forEach(ach => {
                 const item = document.createElement('div');
                 item.classList.add('achievement-item');
                 item.classList.toggle('unlocked', ach.unlocked);

                 const img = document.createElement('img');
                 img.src = ach.icon || 'images/ui/placeholder_achievement.png';
                 img.alt = ach.name;

                 const details = document.createElement('div');
                 details.classList.add('achievement-details');

                 const title = document.createElement('h4');
                 title.textContent = ach.name;

                 const desc = document.createElement('p');
                 desc.textContent = ach.description;

                 details.appendChild(title);
                 details.appendChild(desc);

                 item.appendChild(img);
                 item.appendChild(details);
                 container.appendChild(item);
             });

             this.showScreen('achievements-screen');
         },

        // Başarı kilidi açıldığında bildirim (isteğe bağlı)
        showAchievementNotification(unlockedAchievements) {
            // Basit bir alert veya daha şık bir toast mesajı olabilir
            if (!unlockedAchievements || unlockedAchievements.length === 0) return;

            const names = unlockedAchievements.map(a => a.name).join(', ');
            // Küçük bir bildirim kutusu oluşturup ekrana ekleyebiliriz
             const notification = document.createElement('div');
             notification.classList.add('achievement-toast');
             notification.innerHTML = `
                 <img src="images/ui/achievement_icon.png" alt="Başarı">
                 <span>Yeni Başarı${unlockedAchievements.length > 1 ? 'lar' : ''}: ${names}!</span>
             `;
             document.body.appendChild(notification);
              Audio.playSound('achievement_unlocked'); // Bildirim sesi

             // Birkaç saniye sonra kaldır
             setTimeout(() => {
                 notification.classList.add('fade-out');
                 setTimeout(() => notification.remove(), 500); // Fade out süresi
             }, 4000); // 4 saniye göster
        }

    };

    // CSS'e .achievement-toast ve .fade-out stillerini eklemeyi unutma!
    /* Örnek CSS:
    .achievement-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: var(--success-color); color: white; padding: 10px 20px; border-radius: 20px; box-shadow: var(--box-shadow-medium); display: flex; align-items: center; gap: 10px; z-index: 1500; opacity: 1; transition: opacity 0.5s ease; }
    .achievement-toast img { width: 30px; height: 30px; }
    .achievement-toast.fade-out { opacity: 0; }
    */