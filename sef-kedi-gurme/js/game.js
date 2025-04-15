    // js/game.js
    const Game = {
        state: {
            currentScreen: 'loading', // 'loading', 'main_menu', 'game', 'paused', 'recipe_complete'
            currentRecipeId: null,
            currentStepIndex: 0,
            currentScore: 0,
            currentRecipeScore: 0, // Sadece mevcut tariften kazanılan skor
            currentRecipeStartTime: 0, // Zaman takibi için
            maxPossibleRecipeScore: 1, // 0'a bölme hatasını önle
            unlockedRecipes: [], // Kilidi açılmış tarif ID'leri
            playerAchievements: {}, // Achievements.js'den yüklenecek
            catAccessories: {}, // ChefKedi.js'den yüklenecek
            gamePaused: false,
            finalChallengeUnlocked: false, // Özel bayrak
            isLoading: true, // Başlangıçta yükleniyor
        },
        currentRecipeData: null, // O an oynanan tarifin verisi (Recipes'den)
        currentStepData: null, // O anki adımın verisi

        // --- Oyun Başlatma ve Yönetimi ---
        init() {
             console.log("Initializing Game...");
             this.state.isLoading = true;
             UI.init(); // Önce UI'ı başlat (elementleri alsın)
             Audio.init([ // Ses efektlerini tanımla
                 { id: 'click', src: 'audio/click.wav' },
                 { id: 'chop', src: 'audio/chop.wav' },
                 { id: 'mix', src: 'audio/mix.wav' },
                 { id: 'squish', src: 'audio/squish.wav' }, // Yoğurma sesi
                 { id: 'drop', src: 'audio/drop.wav' }, // Item bırakma
                 { id: 'sizzle', src: 'audio/sizzle.wav' }, // Kızartma
                 { id: 'success', src: 'audio/success.wav' },
                 { id: 'failure', src: 'audio/failure.wav' },
                 { id: 'achievement_unlocked', src: 'audio/achievement_unlocked.wav' }, // Özel başarı sesi
                 { id: 'meow_happy', src: 'audio/meow_happy.wav' },
                 { id: 'meow_neutral', src: 'audio/meow_neutral.wav' },
                 { id: 'success_ping', src: 'audio/success_ping.wav' }, // Zamanlama başarısı vb.
                 { id: 'failure_buzz', src: 'audio/failure_buzz.wav' } // Zamanlama hatası vb.
             ], 'audio/bgm.mp3'); // Arka plan müziği

             Achievements.init();
             this.state.playerAchievements = Achievements.playerProgress; // Güncel ilerlemeyi al

             ChefKedi.init(); // Kediyi başlat (aksesuarları yükler)
             this.state.catAccessories = ChefKedi.accessories;

             // Oyuncu ilerlemesini yükle
             this.state.currentScore = Utils.loadData('playerScore', 0);
             this.state.unlockedRecipes = Utils.loadData('unlockedRecipes', ['menemen']); // Başlangıçta menemen açık
             this.state.finalChallengeUnlocked = Utils.loadData('finalChallengeUnlocked', false);

             // Tariflerin kilidini kontrol et (skora göre)
              this.checkRecipeUnlocks();

             // Başlangıç UI ayarları
             UI.updateScore(this.state.currentScore);
             // Yükleme ekranı zaten aktif, DOMContentLoaded sonrası kaldırılacak.
             this.state.isLoading = false;
             this.state.currentScreen = 'main_menu'; // Yükleme bitince bu ekrana geçilecek
              console.log("Game Initialized. State:", this.state);
        },

        // Ana menüden oyuna başla
        startGame() {
            console.log("Starting game...");
            Audio.playSound('click');
            this.state.currentScreen = 'game';
            UI.hideScreen('main-menu');
            UI.showScreen('game-container');
             ChefKedi.speak("Harika! Hangi tarifle başlayalım Ceyda?", 'happy', 0); // Süresiz

             // Eğer hiç tarif oynanmadıysa veya belirli bir seçim yoksa ilk açılan tarifle başla
             const firstUnlockedRecipe = this.state.unlockedRecipes.find(id => Recipes[id] && !Recipes[id].isChallenge); // Challenge olmayan ilk tarif
             this.loadRecipe(firstUnlockedRecipe || 'menemen'); // Fallback olarak menemen
             Audio.stopBGM(); // Oyun içi farklı BGM olabilir veya sessizlik
             // Audio.playGameBGM(); // Eğer varsa
        },

         // Belirli bir tarifi başlat (Tarif Kitabından)
         startSpecificRecipe(recipeId) {
             if (!Recipes[recipeId]) {
                 console.error(`Recipe not found: ${recipeId}`);
                 return;
             }
              if (!this.state.unlockedRecipes.includes(recipeId) && Recipes[recipeId].unlockScore !== 0) {
                  console.warn(`Trying to start a locked recipe: ${recipeId}`);
                  ChefKedi.speak("Bu tarifin kilidini açmak için biraz daha puan kazanmalısın!", 'thinking');
                  return;
              }
             console.log(`Starting specific recipe: ${recipeId}`);
             Audio.playSound('click');
             this.state.currentScreen = 'game';
             // Menüleri gizle
             UI.hideScreen('main-menu');
             UI.hideScreen('recipe-book-screen');
             UI.showScreen('game-container');
             this.loadRecipe(recipeId);
              Audio.stopBGM();
         },

        // Oyunu Duraklat
        pauseGame() {
             if (this.state.currentScreen !== 'game' || this.state.gamePaused) return;
             this.state.gamePaused = true;
             this.state.currentScreen = 'paused';
             UI.showScreen('pause-menu');
             Audio.playSound('pause'); // Özel duraklatma sesi
             // Zamanlayıcıyı veya mini oyunları durdurma mantığı eklenebilir (MiniGames içinde)
             MiniGames.pause?.(); // Eğer varsa
             ChefKedi.speak("Biraz dinlenelim mi?", 'waiting', 0); // Süresiz
        },

        // Oyuna Devam Et
        resumeGame() {
             if (!this.state.gamePaused) return;
             this.state.gamePaused = false;
             this.state.currentScreen = 'game';
             UI.hideScreen('pause-menu');
             Audio.playSound('resume'); // Özel devam sesi
             MiniGames.resume?.(); // Eğer varsa
             ChefKedi.speak("Hadi devam edelim!", ChefKedi.currentMood); // Kaldığı yerden devam etsin
        },

        // Oyundan Ana Menüye Dön
        quitToMenu() {
             Audio.playSound('click');
             this.state.gamePaused = false;
             this.state.currentRecipeId = null;
             this.state.currentStepIndex = 0;
             this.state.currentScreen = 'main_menu';
             UI.hideScreen('game-container');
             UI.hideScreen('pause-menu');
             UI.hideScreen('recipe-complete-screen'); // Tüm oyunla ilgili ekranları gizle
             UI.showScreen('main-menu');
             Audio.stopBGM(); // Oyun içi müziği durdur
             Audio.playBGM(); // Ana menü müziğini başlat
        },

        // --- Tarif ve Adım Yönetimi ---
        loadRecipe(recipeId) {
             console.log(`Loading recipe: ${recipeId}`);
             if (!Recipes[recipeId]) {
                 console.error(`Recipe data not found for ID: ${recipeId}`);
                 this.quitToMenu(); // Hata durumunda menüye dön
                 return;
             }
             this.currentRecipeData = Recipes[recipeId];
             this.state.currentRecipeId = recipeId;
             this.state.currentStepIndex = 0;
             this.state.currentRecipeScore = 0;
             this.state.currentRecipeStartTime = Date.now();
             this.state.maxPossibleRecipeScore = this.currentRecipeData.maxPossibleScore || 1000; // Varsayılan

             UI.setRecipeTitle(this.currentRecipeData.name);
             UI.updateScore(this.state.currentScore); // Mevcut toplam skoru göster
             this.loadStep(this.state.currentStepIndex);
        },

        loadStep(stepIndex) {
            if (!this.currentRecipeData || stepIndex < 0 || stepIndex >= this.currentRecipeData.steps.length) {
                console.log("Recipe ended or invalid step index.");
                this.completeRecipe(); // Tarif bitti
                return;
            }

            this.state.currentStepIndex = stepIndex;
            this.currentStepData = this.currentRecipeData.steps[stepIndex];
            const step = this.currentStepData;
            console.log(`Loading step ${stepIndex + 1}/${this.currentRecipeData.steps.length}: ${step.type}`);

            // UI'ı temizle ve hazırla
             UI.clearFeedback();
             UI.disableItemClicks(false); // Item tıklamalarını etkinleştir
             UI.updateNextButton("İleri", null, false); // Başlangıçta sonraki butonu gizle
             UI.hideTimer(); // Önceki adımdan kalma timer varsa gizle

             // Adım türüne göre UI'ı ve Kedi'yi güncelle
             ChefKedi.speak(step.text || step.instruction || "...", step.catMood || 'thinking', step.type === 'message' ? 0 : 5000); // Mesaj adımları süresiz, diğerleri 5sn

             switch (step.type) {
                 case 'message':
                     UI.displayStepInfo(this.currentRecipeData.name, step.text);
                     UI.updateNextButton("Anladım!", null, true); // Mesajdan sonra devam butonu
                      UI.elements.ingredientsToolsContainer.innerHTML = ''; // Malzeme alanını boşalt
                     break;

                 case 'select':
                 case 'timed_choice': // Zamanlı seçim
                 case 'multi_select': // Çoklu seçim
                 case 'sequence_selection': // Sıralı seçim
                      UI.displayStepInfo(this.currentRecipeData.name, step.instruction);
                     UI.displayItems(step.items, step.type, step.correct || step.correctSequence || step.required, this.handleItemClick.bind(this)); // Tıklama işleyicisini bağla
                      if (step.type === 'timed_choice' && step.timeLimit) {
                           UI.showTimer(step.timeLimit);
                           // Zamanlayıcı sıfırlanınca otomatik hata verme mantığı UI veya Game içinde ele alınabilir
                           this.stepTimeout = setTimeout(() => this.handleStepTimeout(), step.timeLimit * 1000);
                       }
                       // Bu adımlarda doğru seçim yapılana kadar next butonu gizli kalır
                     break;

                 case 'click_tool': // Belirli bir araca tıklama (select gibi)
                     UI.displayStepInfo(this.currentRecipeData.name, step.instruction);
                     UI.displayItems(step.items, 'click_tool', step.correct, this.handleItemClick.bind(this));
                     break;

                 case 'minigame':
                 case 'timed_action': // Zamanlı aksiyon da bir mini oyun gibi ele alınabilir
                 case 'drag_drop': // Sürükle bırak da mini oyun
                     UI.displayStepInfo(this.currentRecipeData.name, ""); // Ana talimatı gizle
                     // Mini oyunu başlat, bittiğinde handleMinigameComplete çağrılacak
                     MiniGames.init(step.minigame_type || step.type, step, this.handleMinigameComplete.bind(this));
                     break;

                 case 'complete':
                     UI.displayStepInfo(this.currentRecipeData.name, step.text);
                     UI.updateNextButton("Harika!", null, true); // Tarifi bitirme butonu
                      UI.elements.ingredientsToolsContainer.innerHTML = ''; // Malzeme alanını boşalt
                      ChefKedi.changeMood(step.catMood || 'celebrate'); // Özel bitiş pozu
                     break;

                 default:
                     console.error(`Unknown step type: ${step.type}`);
                     this.nextStep(); // Bilinmeyen adımı atla
             }
        },

         // Adımı zaman aşımına uğrat (timed_choice için)
         handleStepTimeout() {
             if (this.state.currentScreen !== 'game' || this.state.gamePaused) return; // Oyun aktif değilse işlem yapma
             if (this.currentStepData && (this.currentStepData.type === 'timed_choice')) {
                 console.log("Step timed out:", this.currentStepData.instruction);
                 Audio.playSound('failure_buzz');
                 UI.showFeedback("Süre doldu! Hızlı olmalısın.", "error");
                 ChefKedi.speak("Ah, süre yetmedi! Bir dahaki sefere daha hızlı olalım.", 'sad', 4000);
                 // Zaman aşımında puan verme veya çok az ver
                 this.state.currentRecipeScore += 0; // Veya negatif puan?
                 UI.disableItemClicks(true); // Seçimi engelle
                 UI.updateNextButton("Devam Et", null, true); // Devam etmeye izin ver
             }
         },

        // Sonraki adıma geç
        nextStep() {
             clearTimeout(this.stepTimeout); // Varsa zamanlayıcıyı temizle
             Audio.playSound('click');
             this.loadStep(this.state.currentStepIndex + 1);
        },

        // Tarifi Tamamla
        completeRecipe() {
            console.log(`Recipe ${this.state.currentRecipeId} completed!`);
            const recipeTime = Math.floor((Date.now() - this.state.currentRecipeStartTime) / 1000); // Saniye cinsinden süre
            const scorePercent = Math.min(100, Math.floor((this.state.currentRecipeScore / this.state.maxPossibleRecipeScore) * 100));

             console.log(`Recipe Score: ${this.state.currentRecipeScore}, Time: ${recipeTime}s, Success: ${scorePercent}%`);

            // Toplam skoru güncelle
            this.state.currentScore += this.state.currentRecipeScore;
             Utils.saveData('playerScore', this.state.currentScore);
             UI.updateScore(this.state.currentScore); // UI'da toplam skoru göster

            // Yeni tariflerin kilidini kontrol et
            this.checkRecipeUnlocks();
             // Final challenge kilidini kontrol et
             this.checkFinalChallengeUnlock();


            // Başarıları kontrol et
            Achievements.checkAchievements({
                 type: 'recipe_complete',
                 id: this.state.currentRecipeId,
                 score: this.state.currentRecipeScore,
                 time: recipeTime,
                 scorePercent: scorePercent,
                 category: this.currentRecipeData.category,
                 cuisine: this.currentRecipeData.cuisine,
                 isDessert: this.currentRecipeData.isDessert
             });

            // Tamamlama ekranını göster
            this.state.currentScreen = 'recipe_complete';
            UI.showCompletionScreen(this.currentRecipeData, this.state.currentRecipeScore, this.state.currentScore);
             ChefKedi.changeMood('celebrate'); // Kedi kutlama yapsın
             Audio.playSound('recipe_complete_fanfare'); // Özel tarif bitirme sesi
             // Audio.playBGM(); // Menü müziği veya özel bir başarı müziği
        },

        // Mevcut tarifi tekrar oyna
        replayCurrentRecipe() {
             if (this.state.currentRecipeId) {
                 Audio.playSound('click');
                 UI.hideScreen('recipe-complete-screen');
                 this.loadRecipe(this.state.currentRecipeId); // Aynı tarifi yeniden yükle
                 this.state.currentScreen = 'game';
             }
        },

        // Sıradaki (açık olan) tarife geç
        startNextRecipe() {
             const nextRecipe = this.getNextRecipe();
             if (nextRecipe) {
                  Audio.playSound('click');
                  UI.hideScreen('recipe-complete-screen');
                  this.loadRecipe(nextRecipe.id);
                  this.state.currentScreen = 'game';
             } else {
                  console.log("No more unlocked recipes available.");
                  ChefKedi.speak("Görünüşe göre şimdilik tüm tarifleri tamamladık!", 'proud');
                  // Ana menüye yönlendirilebilir
                  this.quitToMenu();
             }
        },

         // Sıradaki açılmış ve tamamlanmamış tarifi bulur (veya zorluğa göre sıradakini)
         getNextRecipe() {
             const currentDifficulty = this.currentRecipeData?.difficulty || 0;
             const completedRecipeIds = []; // Eğer takip ediyorsak... Şimdilik tüm açıklar potansiyel hedef.

             const availableRecipes = Object.entries(Recipes)
                 .filter(([id, data]) =>
                     this.state.unlockedRecipes.includes(id) && // Açık olmalı
                     id !== this.state.currentRecipeId &&      // Mevcut tarif olmamalı
                     !data.isChallenge                         // Challenge olmamalı (şimdilik)
                     // && !completedRecipeIds.includes(id)    // Daha önce tamamlanmamış olmalı (isteğe bağlı)
                 )
                 .sort(([, a], [, b]) => (a.difficulty || 0) - (b.difficulty || 0)); // Zorluğa göre sırala

             // Mevcut zorluktan daha yüksek ilk tarifi bul
             const nextHigherDifficulty = availableRecipes.find(([,data]) => (data.difficulty || 0) > currentDifficulty);
             if (nextHigherDifficulty) return { id: nextHigherDifficulty[0], ...nextHigherDifficulty[1] };

             // Yoksa, aynı zorluktaki bir sonraki tarifi bul (alfabetik)
             const nextSameDifficulty = availableRecipes.find(([,data]) => (data.difficulty || 0) === currentDifficulty && data.name.localeCompare(this.currentRecipeData.name) > 0);
              if (nextSameDifficulty) return { id: nextSameDifficulty[0], ...nextSameDifficulty[1] };

              // O da yoksa, mevcut zorluktan daha düşük veya herhangi bir sonraki tarifi bul
              return availableRecipes.length > 0 ? { id: availableRecipes[0][0], ...availableRecipes[0][1] } : null;
         },


        // --- Olay İşleyicileri (UI'dan çağrılır) ---
        handleItemClick(event) {
             if (this.state.gamePaused) return;

             const clickedItem = event.currentTarget;
             const itemId = clickedItem.dataset.id;
             const step = this.currentStepData;

             if (!step || clickedItem.classList.contains('disabled')) return; // Adım yoksa veya item pasifse işlem yapma

             let isCorrect = false;
             let isSelectionComplete = false; // Adımın tamamlanıp tamamlanmadığını kontrol eder
             let scoreToAdd = 0;

             switch (step.type) {
                 case 'select':
                 case 'timed_choice':
                 case 'click_tool':
                     isCorrect = (itemId === step.correct);
                     if (isCorrect) {
                          scoreToAdd = step.scoreBase || step.score || 50; // Adımda tanımlı puan
                           // Zamanlı seçimde kalan süreye göre bonus
                           if (step.type === 'timed_choice' && MiniGames.timeLeft > 0) {
                               scoreToAdd += Math.floor(MiniGames.timeLeft * 2); // Örnek bonus
                               clearTimeout(this.stepTimeout); // Zamanlayıcıyı durdur
                               UI.hideTimer();
                           }
                         isSelectionComplete = true; // Tek seçim yeterli
                     } else {
                         Audio.playSound('failure'); // Yanlış seçim sesi
                         ChefKedi.speak("Hmm, emin misin? Tekrar bakalım.", 'thinking');
                     }
                     break;

                 case 'multi_select':
                      // Seçimi toggle yap (seç/kaldır)
                      clickedItem.classList.toggle('selected'); // CSS'te .selected stili tanımla
                       Audio.playSound('click');
                      // Gerekli sayıda doğru item seçildi mi kontrol et
                      const selectedItems = Array.from(this.elements.ingredientsToolsContainer.querySelectorAll('.selected')).map(el => el.dataset.id);
                      const requiredItems = step.required || [];
                      const optionalItems = step.optional || [];
                      const allRequiredSelected = requiredItems.every(reqId => selectedItems.includes(reqId));
                      const incorrectSelected = selectedItems.some(selId => !requiredItems.includes(selId) && !optionalItems.includes(selId));

                      if (allRequiredSelected && !incorrectSelected) {
                           // Doğru seçimler yapıldı, devam et butonu gösterilebilir
                           // Veya belirli sayıda seçim sonrası otomatik ilerleme? Şimdilik butonla.
                           const correctOptionalCount = selectedItems.filter(selId => optionalItems.includes(selId)).length;
                           scoreToAdd = (requiredItems.length * (step.scorePerRequired || 20)) + (correctOptionalCount * (step.scorePerOptional || 10));
                           isSelectionComplete = true;
                           isCorrect = true; // Adımı başarılı say
                      } else if (incorrectSelected) {
                           // Yanlış bir şey seçildi, uyarı ver
                           UI.showFeedback("Aradığımız bu değildi sanki?", "warning");
                           clickedItem.classList.remove('selected'); // Yanlışı geri al
                            isSelectionComplete = false;
                            isCorrect = false;
                      } else {
                           // Henüz tamamlanmadı, beklemeye devam
                           isSelectionComplete = false;
                           isCorrect = false; // Henüz doğru değil
                      }
                      break;

                 case 'sequence_selection':
                      // Sırayla tıklama mantığı
                      if (!this.currentSelectionSequence) this.currentSelectionSequence = [];
                      // Eğer item zaten seçildiyse veya yanlış sıradaysa işlem yapma (veya hata ver)
                       if (this.currentSelectionSequence.includes(itemId)) return;

                       const correctSequence = step.correctSequence || [];
                       const nextCorrectIndex = this.currentSelectionSequence.length;

                       if (itemId === correctSequence[nextCorrectIndex]) {
                           // Doğru sıradaki item'a tıklandı
                           this.currentSelectionSequence.push(itemId);
                           clickedItem.classList.add('selected'); // Görsel olarak işaretle
                           clickedItem.onclick = null; // Tekrar tıklanamaz
                            Audio.playSound('success_ping');
                           scoreToAdd = step.scorePerCorrect || 30;
                           // Tüm sıra tamamlandı mı?
                           if (this.currentSelectionSequence.length === correctSequence.length) {
                               scoreToAdd += step.bonusForOrder || 50; // Sıra bonusu
                               isSelectionComplete = true;
                               isCorrect = true;
                               this.currentSelectionSequence = []; // Sıfırla
                           }
                       } else {
                            // Yanlış sıradaki item'a tıklandı
                            Audio.playSound('failure_buzz');
                            UI.showFeedback("Sıralama yanlış oldu!", "error");
                            ChefKedi.speak("Eyvah! Sırayı karıştırdık galiba.", 'sad');
                            // Seçimi sıfırla ve baştan başla
                            this.currentSelectionSequence = [];
                             this.elements.ingredientsToolsContainer.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
                             // Belki yanlış tıklananı işaretle?
                             UI.setItemFeedback(itemId, false);
                            isSelectionComplete = false;
                             isCorrect = false;
                             scoreToAdd = -20; // Yanlış sıra için puan kır (isteğe bağlı)
                       }
                       break;
             }

             // Görsel geri bildirim ver
             if (step.type !== 'multi_select' && step.type !== 'sequence_selection') { // Bu türlerde feedback farklı işliyor
                UI.setItemFeedback(itemId, isCorrect);
             }


             // Eğer adım tamamlandıysa
             if (isSelectionComplete) {
                 this.state.currentRecipeScore += scoreToAdd;
                 // UI.updateScore(this.state.currentScore); // Tarif skorunu anlık göstermeyebiliriz
                 UI.showFeedback(step.feedbackGood || "Doğru seçim!", "success");
                 if (isCorrect) ChefKedi.speak(step.feedbackGood || "Harika!", step.catMood || 'happy');
                 UI.disableItemClicks(true); // Diğer item'ları pasif yap
                 UI.updateNextButton("Devam Et", null, true); // Sonraki adıma geç butonu
             } else if (step.type !== 'multi_select' && step.type !== 'sequence_selection' && !isCorrect) {
                 // Hatalı ama tamamlanmayan durum (örn: select'te yanlış tıklama)
                 // Puan düşürme vb. eklenebilir
                 this.state.currentRecipeScore -= 5; // Küçük ceza
             }
             // Multi-select ve sequence'de ilerleme butonunu sadece tamamlanınca gösteriyoruz.
              if (step.type === 'multi_select' && !isSelectionComplete && !isCorrect && incorrectSelected) {
                   // Multi-select'te yanlış bir item seçildiğinde de uyarı verdik.
              }
        },

        // Mini Oyun Tamamlandığında Çağrılır (MiniGames.end() tarafından)
        handleMinigameComplete(success, score, gameType) {
             console.log(`Minigame ${gameType} completed. Success: ${success}, Score: ${score}`);
             if (success) {
                 this.state.currentRecipeScore += score;
                 // UI.updateScore(this.state.currentScore); // Anlık güncelleme
                 // Geri bildirim ve kedi mesajı MiniGames.end() içinde yapıldı.
                 UI.updateNextButton("Devam Et", null, true); // Sonraki adıma geç
             } else {
                 this.state.currentRecipeScore += score; // Başarısızlıkta da (azaltılmış) skor eklenebilir
                 UI.showFeedback("Ah, olmadı ama sorun değil, devam edelim.", "warning");
                 // Kedi mesajı MiniGames.end() içinde
                 UI.updateNextButton("Devam Et", null, true); // Yine de devam etmeye izin ver
             }
        },


         // --- Yardımcı Fonksiyonlar ---
         checkRecipeUnlocks() {
             let changed = false;
             for (const id in Recipes) {
                 const recipe = Recipes[id];
                 if (!this.state.unlockedRecipes.includes(id) && recipe.unlockScore <= this.state.currentScore) {
                     this.state.unlockedRecipes.push(id);
                     changed = true;
                      console.log(`Recipe Unlocked: ${recipe.name}`);
                      // Bildirim gösterilebilir
                      UI.showToastNotification(`Yeni Tarif Açıldı: ${recipe.name}!`);
                 }
             }
             if (changed) {
                 Utils.saveData('unlockedRecipes', this.state.unlockedRecipes);
             }
         },

         checkFinalChallengeUnlock() {
            // Final challenge kilidini açmak için özel koşullar (örn: belirli sayıda tarif tamamlama veya yüksek skor)
             const requiredScore = Recipes['final_challenge']?.unlockScore || 5000;
             const requiredRecipesCompleted = 5; // Örnek: 5 tarif tamamlama
             const completedCount = this.state.unlockedRecipes.length - 1; // Başlangıçtakini sayma

             if (!this.state.finalChallengeUnlocked &&
                 this.state.currentScore >= requiredScore &&
                 completedCount >= requiredRecipesCompleted)
             {
                 this.state.finalChallengeUnlocked = true;
                 this.state.unlockedRecipes.push('final_challenge'); // Listeye ekle
                 Utils.saveData('finalChallengeUnlocked', true);
                  Utils.saveData('unlockedRecipes', this.state.unlockedRecipes); // Listeyi de kaydet
                 console.log("FINAL CHALLENGE UNLOCKED!");
                 ChefKedi.speak("Vay Ceyda! Tüm hünerlerini göstermeye hazırsın! Sana özel bir meydan okumam var!", 'excited', 8000);
                  UI.showToastNotification("🏆 Şef Kedi'nin Gurme Sınavı Açıldı! 🏆");
             }
         },

         // İlerlemeyi Sıfırla (Ayarlar'dan çağrılır)
         resetProgress() {
             console.log("Resetting game progress...");
             Audio.playSound('reset'); // Özel sıfırlama sesi
             Achievements.resetProgress(); // Başarıları sıfırla
             // Diğer verileri Utils içinde sildik (Achievements.resetProgress içinde çağrılabilir)
             this.state.currentScore = 0;
             this.state.unlockedRecipes = ['menemen'];
             this.state.finalChallengeUnlocked = false;
              ChefKedi.accessories = { hat: false, apron: false }; // Kedinin aksesuarlarını sıfırla
              ChefKedi.updateAccessoriesVisual();

              // Oyunu yeniden başlat veya ana menüye dön
              alert("Oyun ilerlemesi sıfırlandı. Ana menüye dönülüyor.");
              this.quitToMenu();
               UI.updateScore(0); // Skoru UI'da sıfırla
         }

    };


    // Toast Notification için basit UI fonksiyonu (UI.js'e eklenebilir)
    UI.showToastNotification = function(message) {
         const toast = document.createElement('div');
         toast.classList.add('toast-notification'); // CSS'te stil tanımla
         toast.textContent = message;
         document.body.appendChild(toast);
         setTimeout(() => {
             toast.classList.add('fade-out');
             setTimeout(() => toast.remove(), 500);
         }, 3500); // 3.5 saniye göster
    };
    /* Örnek CSS:
    .toast-notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: var(--accent-color); color: white; padding: 12px 25px; border-radius: 20px; box-shadow: var(--box-shadow-light); z-index: 1600; opacity: 1; transition: opacity 0.5s ease, top 0.5s ease; font-size: 1.1em; }
    .toast-notification.fade-out { opacity: 0; top: -50px; }
    */