// js/game.js
const Game = {
    state: {
        currentScreen: 'loading', // 'loading', 'main_menu', 'game', 'paused', 'recipe_complete'
        currentRecipeId: null,
        currentStepIndex: 0,
        currentScore: 0,
        currentRecipeScore: 0,
        currentRecipeStartTime: 0,
        maxPossibleRecipeScore: 1,
        unlockedRecipes: [],
        playerAchievements: {},
        catAccessories: {},
        gamePaused: false,
        finalChallengeUnlocked: false,
        isLoading: true,
        stepTimeout: null,
        currentSelectionSequence: [],
    },
    currentRecipeData: null,
    currentStepData: null,

    init() {
         console.log("Initializing Game...");
         this.state.isLoading = true;
         UI.init();

         try {
            GameAudio.init([ // Ses dosyalarının listesi
                { id: 'click', src: 'audio/click.wav' },
                { id: 'chop', src: 'audio/chop.wav' },
                { id: 'mix', src: 'audio/mix.wav' },
                { id: 'squish', src: 'audio/squish.wav' },
                { id: 'drop', src: 'audio/drop.wav' },
                { id: 'sizzle', src: 'audio/sizzle.wav' },
                { id: 'success', src: 'audio/success.wav' },
                { id: 'failure', src: 'audio/failure.wav' },
                { id: 'achievement_unlocked', src: 'audio/achievement_unlocked.wav' },
                { id: 'meow_happy', src: 'audio/meow_happy.wav' },
                { id: 'meow_neutral', src: 'audio/meow_neutral.wav' },
                { id: 'success_ping', src: 'audio/success_ping.wav' },
                { id: 'failure_buzz', src: 'audio/failure_buzz.wav' },
                { id: 'pause', src: 'audio/pause.wav' },
                { id: 'resume', src: 'audio/resume.wav' },
                { id: 'recipe_complete_fanfare', src: 'audio/recipe_complete_fanfare.wav'},
                { id: 'reset', src: 'audio/reset.wav'},
                { id: 'blender_start', src: 'audio/blender_loop.wav'},
                { id: 'blender_stop', src: 'audio/blender_stop.wav'},
                { id: 'roll_pin', src: 'audio/roll.wav'}
            ], 'audio/bgm.mp3');
         } catch (error) {
             console.error("Critical error initializing GameAudio:", error);
             alert("Ses sistemi başlatılırken bir hata oluştu. Sesler çalışmayabilir.");
         }

         Achievements.init();
         this.state.playerAchievements = Achievements.playerProgress;

         ChefKedi.init();
         this.state.catAccessories = ChefKedi.accessories;

         this.state.currentScore = Utils.loadData('playerScore', 0);
         this.state.unlockedRecipes = Utils.loadData('unlockedRecipes', ['menemen']);
         this.state.finalChallengeUnlocked = Utils.loadData('finalChallengeUnlocked', false);

         this.checkRecipeUnlocks();

         UI.updateScore(this.state.currentScore);

         if (UI.elements.bgmVolumeSlider) UI.elements.bgmVolumeSlider.value = GameAudio.bgmVolume;
         if (UI.elements.sfxVolumeSlider) UI.elements.sfxVolumeSlider.value = GameAudio.sfxVolume;

         this.state.isLoading = false;
         this.state.currentScreen = 'main_menu';
         console.log("Game Initialized. State:", this.state);
    },

    startGame() {
        console.log("Starting game...");
        GameAudio.playSound('click');
        this.state.currentScreen = 'game';
        UI.hideScreen('main-menu');
        UI.showScreen('game-container');
        GameAudio.playBGM();

        ChefKedi.speak("Harika! Hangi tarifle başlayalım Ceyda?", 'excited', 0);
        ChefKedi.startIdleAnimation(); // Kedi animasyonunu başlat

        const firstUnlockedRecipe = this.state.unlockedRecipes.find(id => Recipes[id] && !Recipes[id].isChallenge);
        this.loadRecipe(firstUnlockedRecipe || 'menemen');
    },

     startSpecificRecipe(recipeId) {
         if (!Recipes[recipeId]) {
             console.error(`Recipe not found: ${recipeId}`); return;
         }
         const recipe = Recipes[recipeId];
         const isUnlocked = this.state.unlockedRecipes.includes(recipeId) || (recipeId === 'final_challenge' && this.state.finalChallengeUnlocked);
         if (!isUnlocked && recipe.unlockScore !== 0) {
              console.warn(`Trying to start a locked recipe: ${recipeId}`);
              ChefKedi.speak(`Bu tarifin kilidini açmak için ${recipe.unlockScore} puana ulaşmalısın!`, 'thinking');
              return;
          }
         console.log(`Starting specific recipe: ${recipeId}`);
         GameAudio.playSound('click');
         this.state.currentScreen = 'game';
         UI.hideScreen('main-menu');
         UI.hideScreen('recipe-book-screen');
         UI.showScreen('game-container');
         GameAudio.playBGM();
         ChefKedi.startIdleAnimation(); // Kedi animasyonunu başlat
         this.loadRecipe(recipeId);
     },

    pauseGame() {
         if (this.state.currentScreen !== 'game' || this.state.gamePaused) return;
         this.state.gamePaused = true;
         this.state.currentScreen = 'paused';
         ChefKedi.stopIdleAnimation(); // Kedi animasyonunu durdur
         UI.showScreen('pause-menu');
         GameAudio.playSound('pause');
         MiniGames.pause?.();
         ChefKedi.speak("Biraz dinlenelim mi?", 'waiting', 0);
         // Pause sırasında aktif zamanlayıcıları durdurmak önemli
         clearTimeout(this.state.stepTimeout);
         this.state.stepTimeout = null; // Referansı temizle
         // Mini oyun zamanlayıcısı MiniGames.pause içinde durdurulmalı
    },

    resumeGame() {
         if (!this.state.gamePaused) return;
         this.state.gamePaused = false;
         this.state.currentScreen = 'game';
         UI.hideScreen('pause-menu');
         GameAudio.playSound('resume');
         MiniGames.resume?.();
         ChefKedi.speak("Hadi devam edelim!", ChefKedi.currentMood || 'idle', 4000);
         ChefKedi.startIdleAnimation(); // Kedi animasyonunu tekrar başlat

         // Duraklatma sırasında zaman aşımı olan bir adım varsa,
         // kalan süreyi hesaplayıp zamanlayıcıyı tekrar başlatmak gerekebilir.
         // Şimdilik, duraklatma zamanlayıcıyı sıfırlıyor varsayalım.
         // Eğer stepTimeout tutuluyorsa burada yeniden başlatılabilir.
         // Örneğin: if (this.pausedStepTimeoutDuration > 0) {
         //           this.state.stepTimeout = setTimeout(() => this.handleStepTimeout(), this.pausedStepTimeoutDuration);
         //         }
    },

    quitToMenu() {
         GameAudio.playSound('click');
         this.state.gamePaused = false;
         this.state.currentRecipeId = null;
         this.state.currentStepIndex = 0;
         this.state.currentScreen = 'main_menu';

         // Tüm potansiyel zamanlayıcıları temizle
         clearTimeout(this.state.stepTimeout);
         this.state.stepTimeout = null;
         ChefKedi.stopIdleAnimation(); // Kedi animasyonunu durdur
         MiniGames.forceEnd?.(); // Mini oyunu zorla bitir (varsa)

         UI.hideTimer();
         UI.hideScreen('game-container');
         UI.hideScreen('pause-menu');
         UI.hideScreen('recipe-complete-screen');
         UI.hideScreen('recipe-book-screen');
         UI.hideScreen('achievements-screen');
         UI.hideScreen('options-screen');

         UI.showScreen('main-menu');
         GameAudio.playBGM(); // Ana menü müziği
    },

    loadRecipe(recipeId) {
         console.log(`Loading recipe: ${recipeId}`);
         if (!Recipes[recipeId]) {
             console.error(`Recipe data not found for ID: ${recipeId}`);
             this.quitToMenu(); return;
         }
         try {
            // Orijinal tarifi korumak için derin kopya al
            this.currentRecipeData = JSON.parse(JSON.stringify(Recipes[recipeId]));
         } catch (e) {
             console.error(`Error cloning recipe data for ${recipeId}:`, e);
             this.quitToMenu(); return;
         }

         if (!this.currentRecipeData) {
             console.error(`Failed to load or clone recipe data for ID: ${recipeId}`);
             this.quitToMenu(); return;
         }

         this.state.currentRecipeId = recipeId;
         this.state.currentStepIndex = 0;
         this.state.currentRecipeScore = 0;
         this.state.currentRecipeStartTime = Date.now();
         // Maksimum skoru tariften al veya hesapla
         this.state.maxPossibleRecipeScore = this.currentRecipeData.maxPossibleScore || this.calculateMaxScore(this.currentRecipeData) || 1; // 0 olmasın

         UI.setRecipeTitle(this.currentRecipeData.name || "Tarif Yükleniyor...");
         UI.updateScore(this.state.currentScore);
         this.loadStep(this.state.currentStepIndex);
    },

     calculateMaxScore(recipeData) {
         if (!recipeData || !recipeData.steps) return 1; // Hata durumunda 1 dön
         let maxScore = 0;
         recipeData.steps.forEach(step => {
             let stepMax = 0;
             switch (step.type) {
                 case 'select':
                 case 'timed_choice':
                 case 'click_tool':
                     stepMax = step.scoreBase || step.score || 50;
                     if(step.type === 'timed_choice') stepMax += (step.timeLimit || 8) * 1; // Zaman bonusu tahmini
                     break;
                 case 'multi_select':
                     stepMax += (step.required?.length || 0) * (step.scorePerRequired || 20);
                     stepMax += (step.optional?.length || 0) * (step.scorePerOptional || 10);
                     break;
                 case 'sequence_selection':
                     stepMax += (step.correctSequence?.length || 0) * (step.scorePerCorrect || 30);
                     stepMax += step.bonusForOrder || 50;
                     break;
                 case 'minigame':
                 case 'timed_action':
                 case 'drag_drop':
                      // Mini oyunlar için tarifte belirtilen max puanı kullanmak en iyisi
                      stepMax = step.maxPossibleScore || step.scoreBase || 100;
                      if (step.bonusForCompletion) stepMax += step.bonusForCompletion;
                      if (step.timeLimit && step.type !== 'timed_action') stepMax += step.timeLimit * 1;
                     break;
             }
             maxScore += stepMax;
         });
         console.log(`Calculated max possible score for ${recipeData.id}: ${maxScore}`);
         return Math.max(1, maxScore); // 0 veya negatif olmasını engelle
     },


    loadStep(stepIndex) {
        clearTimeout(this.state.stepTimeout); this.state.stepTimeout = null;
        UI.clearFeedback();
        UI.disableItemClicks(false);
        UI.updateNextButton("İleri", null, false);
        UI.hideTimer();
        this.state.currentSelectionSequence = [];

        // Varsayılan olarak mini oyunu gizle, adımı göster
        UI.elements.minigameArea?.classList.add('hidden');
        UI.elements.stepArea?.classList.remove('hidden');
        UI.elements.ingredientsToolsContainer?.classList.remove('hidden'); // Başlangıçta göster

        if (!this.currentRecipeData || !this.currentRecipeData.steps || stepIndex < 0 || stepIndex >= this.currentRecipeData.steps.length) {
            console.log("Recipe ended or invalid step index.");
            this.completeRecipe();
            return;
        }

        this.state.currentStepIndex = stepIndex;
        this.currentStepData = this.currentRecipeData.steps[stepIndex];
        const step = this.currentStepData;
        console.log(`Loading step ${stepIndex + 1}/${this.currentRecipeData.steps.length}: ${step.type} - ${step.instruction || step.text || ''}`);

        const catMessageDuration = (step.type === 'message' || step.type === 'complete') ? 0 : 6000;
        ChefKedi.speak(step.text || step.instruction || "...", step.catMood || 'thinking', catMessageDuration);

        switch (step.type) {
            case 'message':
                UI.displayStepInfo(this.currentRecipeData.name, step.text);
                UI.updateNextButton("Anladım!", null, true);
                UI.elements.ingredientsToolsContainer.innerHTML = '';
                UI.elements.ingredientsToolsContainer.classList.add('hidden');
                break;

            case 'select':
            case 'timed_choice':
            case 'multi_select':
            case 'sequence_selection':
            case 'click_tool':
                UI.displayStepInfo(step.instruction, step.description || '');
                UI.displayItems(step.items || [], step.type, step.correct || step.correctSequence || step.required, this.handleItemClick.bind(this));
                 if (step.type === 'timed_choice' && step.timeLimit) {
                      UI.showTimer(step.timeLimit);
                      // Zamanlayıcıyı başlat (küçük bir gecikme ekleyerek render sonrası çalışmasını sağla)
                      this.state.stepTimeout = setTimeout(() => this.handleStepTimeout(), step.timeLimit * 1000 + 100);
                  }
                break;

            case 'minigame':
            case 'timed_action':
            case 'drag_drop':
                 UI.elements.stepArea.classList.add('hidden'); // Adım alanını gizle
                 UI.elements.minigameArea.classList.remove('hidden'); // Mini oyun alanını göster
                 if(UI.elements.minigameTitle) UI.elements.minigameTitle.textContent = step.instruction || "Mini Oyun!";
                 if(UI.elements.minigameInstructions) UI.elements.minigameInstructions.textContent = step.description || "";
                 MiniGames.init(step.minigame_type || step.type, step, this.handleMinigameComplete.bind(this));
                break;

            case 'complete':
                UI.displayStepInfo(this.currentRecipeData.name, step.text);
                UI.updateNextButton("Bitir!", null, true);
                UI.elements.ingredientsToolsContainer.innerHTML = '';
                UI.elements.ingredientsToolsContainer.classList.add('hidden');
                ChefKedi.changeMood(step.catMood || 'celebrate');
                break;

            default:
                console.error(`Unknown step type: ${step.type}`);
                this.nextStep();
        }
    },

     handleStepTimeout() {
         if (this.state.currentScreen !== 'game' || this.state.gamePaused || !this.state.stepTimeout) return;
         const step = this.currentStepData;
         if (step && (step.type === 'timed_choice')) {
             console.log("Step timed out:", step.instruction);
             this.state.stepTimeout = null;
             GameAudio.playSound('failure_buzz');
             UI.showFeedback("Süre doldu! Hızlı olmalısın.", "error");
             ChefKedi.speak("Ah, süre yetmedi! Bir dahaki sefere daha hızlı olalım.", 'sad', 4000);
             this.state.currentRecipeScore += step.timeoutPenalty || 0; // Zaman aşımı cezası (varsa)
             UI.disableItemClicks(true);
             UI.updateNextButton("Devam Et", null, true);
             UI.hideTimer();
         }
     },

    nextStep() {
         clearTimeout(this.state.stepTimeout); this.state.stepTimeout = null;
         GameAudio.playSound('click');
         this.loadStep(this.state.currentStepIndex + 1);
    },

    completeRecipe() {
        console.log(`Recipe ${this.state.currentRecipeId} completed!`);
        ChefKedi.stopIdleAnimation(); // Kedi animasyonunu durdur
        if (!this.currentRecipeData) {
             console.error("Cannot complete recipe without data.");
             this.quitToMenu(); return;
         }
        const recipeTime = Math.floor((Date.now() - this.state.currentRecipeStartTime) / 1000);
        this.state.currentRecipeScore = Math.max(0, this.state.currentRecipeScore); // Negatif skoru engelle
        const scorePercent = Math.min(100, Math.max(0, Math.floor((this.state.currentRecipeScore / this.state.maxPossibleRecipeScore) * 100)));

         console.log(`Recipe Score: ${this.state.currentRecipeScore}/${this.state.maxPossibleRecipeScore}, Time: ${recipeTime}s, Success: ${scorePercent}%`);

        this.state.currentScore += this.state.currentRecipeScore;
         Utils.saveData('playerScore', this.state.currentScore);
         UI.updateScore(this.state.currentScore);

        this.checkRecipeUnlocks();
         this.checkFinalChallengeUnlock();

        Achievements.checkAchievements({
             type: 'recipe_complete',
             id: this.state.currentRecipeId,
             score: this.state.currentRecipeScore,
             time: recipeTime,
             scorePercent: scorePercent,
             category: this.currentRecipeData.category,
             cuisine: this.currentRecipeData.cuisine,
             isDessert: this.currentRecipeData.isDessert || false
         });

        this.state.currentScreen = 'recipe_complete';
        UI.showCompletionScreen(this.currentRecipeData, this.state.currentRecipeScore, this.state.currentScore);
         ChefKedi.changeMood('celebrate');
         GameAudio.playSound('recipe_complete_fanfare');
    },

    replayCurrentRecipe() {
         if (this.state.currentRecipeId) {
             GameAudio.playSound('click');
             UI.hideScreen('recipe-complete-screen');
             ChefKedi.startIdleAnimation(); // Kedi animasyonunu başlat
             this.loadRecipe(this.state.currentRecipeId);
             this.state.currentScreen = 'game';
         }
    },

    startNextRecipe() {
         const nextRecipe = this.getNextRecipe();
         if (nextRecipe) {
              GameAudio.playSound('click');
              UI.hideScreen('recipe-complete-screen');
              ChefKedi.startIdleAnimation(); // Kedi animasyonunu başlat
              this.loadRecipe(nextRecipe.id);
              this.state.currentScreen = 'game';
         } else {
              console.log("No more unlocked non-challenge recipes available.");
              ChefKedi.speak("Görünüşe göre şimdilik tüm tarifleri tamamladık! Harikasın Ceyda!", 'proud');
              this.quitToMenu();
         }
    },

     getNextRecipe() {
         const currentDifficulty = this.currentRecipeData?.difficulty || 0;
         const currentId = this.currentRecipeData?.id || '';

         const availableRecipes = Object.entries(Recipes)
             .filter(([id, data]) =>
                 this.state.unlockedRecipes.includes(id) &&
                 id !== currentId &&
                 !data.isChallenge
             )
             .map(([id, data]) => ({ id, ...data }))
             .sort((a, b) => {
                  const diffCompare = (a.difficulty || 0) - (b.difficulty || 0);
                  if (diffCompare !== 0) return diffCompare;
                  return (a.name || '').localeCompare(b.name || '');
              });

          const currentIndex = availableRecipes.findIndex(r => r.id === currentId);
          if (currentIndex !== -1 && currentIndex + 1 < availableRecipes.length) {
              return availableRecipes[currentIndex + 1];
          } else if (availableRecipes.length > 0) {
              // Eğer son tarif oynandıysa veya bulunamadıysa, listedeki ilk tarife dön (mevcut tarif hariç)
              const firstAvailable = availableRecipes.find(r => r.id !== currentId);
              return firstAvailable || (availableRecipes.length > 0 ? availableRecipes[0] : null); // Eğer tek tarif açıksa onu döndür
          }

         return null;
     },

    handleItemClick(event) {
         if (this.state.gamePaused || !this.currentStepData || !event.currentTarget) return;

         const clickedItem = event.currentTarget;
         const itemId = clickedItem.dataset.id;
         const step = this.currentStepData;

         if (clickedItem.classList.contains('disabled')) return;

         let isCorrect = false;
         let isSelectionComplete = false;
         let scoreToAdd = 0;
         let feedbackMsg = "";
         let feedbackType = "info";
         let catMood = ChefKedi.currentMood;
         let playSound = 'click';

         if(this.state.stepTimeout) {
              clearTimeout(this.state.stepTimeout);
              this.state.stepTimeout = null;
              UI.hideTimer();
         }

         switch (step.type) {
            case 'select':
            case 'timed_choice':
            case 'click_tool':
                isCorrect = (itemId === step.correct);
                if (isCorrect) {
                    scoreToAdd = step.scoreBase || step.score || 50;
                    feedbackMsg = step.feedbackGood || "Doğru seçim!";
                    feedbackType = "success";
                    catMood = step.catMoodGood || 'happy';
                    playSound = 'success_ping';
                    UI.setItemFeedback(itemId, true); // Doğruyu göster
                    isSelectionComplete = true;
                    UI.disableItemClicks(true); // Seçenekleri kitle
                } else {
                    scoreToAdd = step.penalty || -10;
                    feedbackMsg = step.feedbackBad || "Hmm, bu değildi sanırım?";
                    feedbackType = "error";
                    catMood = step.catMoodBad || 'thinking';
                    playSound = 'failure_buzz';
                    UI.setItemFeedback(itemId, false); // Yanlışı göster (geçici)
                    isSelectionComplete = false; // Tekrar deneme şansı vermeyelim, adımı geçelim
                    // Yanlış seçimde ilerlemek için:
                    isSelectionComplete = true;
                    UI.disableItemClicks(true); // İlerlemek için kitle
                }
                break;


             case 'multi_select':
                   const isCurrentlySelected = clickedItem.classList.contains('selected');
                   UI.setItemSelected(itemId, !isCurrentlySelected);
                   playSound = 'click';

                   const selectedItems = Array.from(UI.elements.ingredientsToolsContainer.querySelectorAll('.selected')).map(el => el.dataset.id);
                   const requiredItems = step.required || [];
                   const optionalItems = step.optional || [];

                   const hasIncorrectSelection = selectedItems.some(selId => !requiredItems.includes(selId) && !optionalItems.includes(selId));

                   if (hasIncorrectSelection) {
                       feedbackMsg = step.feedbackBad || "Bu listede yoktu galiba?";
                       feedbackType = "warning";
                       catMood = 'thinking';
                       playSound = 'failure_buzz';
                       UI.setItemSelected(itemId, false); // Hatalı seçimi geri al
                       scoreToAdd = step.penalty || -5;
                       isSelectionComplete = false;
                   } else {
                       const allRequiredSelected = requiredItems.every(reqId => selectedItems.includes(reqId));
                       if (allRequiredSelected) {
                           const correctOptionalCount = selectedItems.filter(selId => optionalItems.includes(selId)).length;
                           scoreToAdd = (requiredItems.length * (step.scorePerRequired || 20)) + (correctOptionalCount * (step.scorePerOptional || 10));
                           feedbackMsg = step.feedbackGood || "Malzemeler tamam!";
                           feedbackType = "success";
                           catMood = 'happy';
                           playSound = 'success';
                           isSelectionComplete = true;
                           UI.disableItemClicks(true);
                       } else {
                           feedbackMsg = "Gerekli olanları seçmeye devam et...";
                           feedbackType = "info";
                           catMood = 'pointing';
                           isSelectionComplete = false;
                       }
                   }
                   break;

             case 'sequence_selection':
                   if (clickedItem.classList.contains('selected') || clickedItem.classList.contains('disabled')) break;

                   const correctSequence = step.correctSequence || [];
                   const nextCorrectIndex = this.state.currentSelectionSequence.length;

                   if (itemId === correctSequence[nextCorrectIndex]) {
                       this.state.currentSelectionSequence.push(itemId);
                       UI.setItemSelected(itemId, true);
                       clickedItem.classList.add('disabled'); // Sadece seçili olarak işaretle, tekrar tıklanamaz
                       playSound = 'success_ping';
                       scoreToAdd = step.scorePerCorrect || 30;

                       if (this.state.currentSelectionSequence.length === correctSequence.length) {
                           scoreToAdd += step.bonusForOrder || 50;
                           feedbackMsg = step.feedbackGood || "Sıralama harika!";
                           feedbackType = "success";
                           catMood = 'proud';
                           playSound = 'success';
                           isSelectionComplete = true;
                           UI.disableItemClicks(true); // Tümünü kitle
                       } else {
                           feedbackMsg = "Süper! Sıradaki...";
                           feedbackType = "info";
                           catMood = 'pointing';
                           isSelectionComplete = false;
                       }
                   } else {
                       playSound = 'failure_buzz';
                       feedbackMsg = step.feedbackBad || "Eyvah! Sıra karıştı. Baştan deneyelim.";
                       feedbackType = "error";
                       catMood = 'sad';
                       scoreToAdd = step.penalty || -20;
                       this.state.currentSelectionSequence = []; // Sıfırla
                       UI.elements.ingredientsToolsContainer?.querySelectorAll('.selected, .disabled').forEach(el => {
                           el.classList.remove('selected', 'disabled');
                           el.disabled = false;
                       });
                        UI.setItemFeedback(itemId, false); // Yanlışı göster
                       isSelectionComplete = false;
                   }
                   break;
         }

         GameAudio.playSound(playSound);
         this.state.currentRecipeScore += scoreToAdd;
         UI.showFeedback(feedbackMsg, feedbackType);

         if (catMood !== ChefKedi.currentMood) {
             ChefKedi.changeMood(catMood);
         }

         if (isSelectionComplete) {
             UI.updateNextButton("Devam Et", null, true);
         }
    },

    handleMinigameComplete(success, score, gameType) {
         console.log(`Minigame ${gameType} completed. Success: ${success}, Score: ${score}`);
         this.state.currentRecipeScore += Math.max(0, score);
         UI.updateNextButton("Devam Et", null, true);
         // Mini oyun alanını gizle, adım alanını göster (UI tarafında yapılmalı?)
         // UI.elements.minigameArea?.classList.add('hidden'); // Bu MiniGames.end içinde yapılabilir
         // UI.elements.stepArea?.classList.remove('hidden');
    },

     checkRecipeUnlocks() {
         let changed = false;
         let newlyUnlocked = [];
         for (const id in Recipes) {
             const recipe = Recipes[id];
             if (!this.state.unlockedRecipes.includes(id) &&
                  recipe.unlockScore <= this.state.currentScore &&
                  recipe.unlockScore !== 0)
              {
                 if (id === 'final_challenge' && !this.shouldUnlockFinalChallenge()) {
                     continue;
                 }
                 this.state.unlockedRecipes.push(id);
                 changed = true;
                  console.log(`Recipe Unlocked: ${recipe.name}`);
                  newlyUnlocked.push(recipe.name);
             }
         }
         if (changed) {
             Utils.saveData('unlockedRecipes', this.state.unlockedRecipes);
             if (newlyUnlocked.length > 0) {
                UI.showToastNotification(`Yeni Tarif${newlyUnlocked.length > 1 ? 'ler' : ''} Açıldı: ${newlyUnlocked.join(', ')}!`, 'unlock');
             }
         }
     },

     shouldUnlockFinalChallenge() {
         if (this.state.finalChallengeUnlocked) return true;
         const challengeData = Recipes['final_challenge'];
         if (!challengeData) return false;
         const requiredScore = challengeData.unlockScore || 2500;
         const requiredRecipesCount = challengeData.requiredRecipes || 5;
         // Tamamlanan tarif sayısını başarılar üzerinden saymak daha doğru
         const completedRecipeAchievements = Object.keys(Achievements.playerProgress).filter(key =>
            Achievements.list[key]?.unlocked && Achievements.list[key]?.category !== 'challenge' && key.startsWith('recipe_complete_') // Veya başka bir yöntem
         ).length;
         // Alternatif: Açılan tarif sayısını kullan (daha basit)
         const unlockedNonDefaultCount = this.state.unlockedRecipes.filter(id => id !== 'menemen' && id !== 'final_challenge').length;

         return (this.state.currentScore >= requiredScore && unlockedNonDefaultCount >= requiredRecipesCount);
     },


     checkFinalChallengeUnlock() {
         if (!this.state.finalChallengeUnlocked && this.shouldUnlockFinalChallenge())
         {
             this.state.finalChallengeUnlocked = true;
              if (!this.state.unlockedRecipes.includes('final_challenge')) {
                   this.state.unlockedRecipes.push('final_challenge');
              }
             Utils.saveData('finalChallengeUnlocked', true);
             Utils.saveData('unlockedRecipes', this.state.unlockedRecipes);
             console.log("FINAL CHALLENGE UNLOCKED!");
             ChefKedi.speak("Vay Ceyda! Tüm hünerlerini göstermeye hazırsın! Sana özel bir meydan okumam var!", 'excited', 8000);
             UI.showToastNotification("🏆 Şef Kedi'nin Gurme Sınavı Açıldı! 🏆", 'achievement');
         }
     },

     resetProgress() {
         console.warn("Resetting all game progress!");
         GameAudio.playSound('reset');
         ChefKedi.stopIdleAnimation(); // Önce animasyonu durdur
         Achievements.resetProgress();
         ChefKedi.resetAccessories();

         Utils.removeData('playerScore');
         Utils.removeData('unlockedRecipes');
         Utils.removeData('finalChallengeUnlocked');
         // catAccessories zaten resetAccessories içinde siliniyor

         this.state.currentScore = 0;
         this.state.unlockedRecipes = ['menemen'];
         this.state.finalChallengeUnlocked = false;
         this.state.playerAchievements = {};
         this.state.catAccessories = { hat: false, apron: false };

         UI.hideScreen('options-screen');
         alert("Oyun ilerlemesi sıfırlandı. Ana menüye dönülüyor.");
         this.quitToMenu();
         UI.updateScore(0);
     }

};