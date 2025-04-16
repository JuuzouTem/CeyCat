// js/minigames.js
const MiniGames = {
    activeGame: null,
    timerInterval: null,
    timeLeft: 0,
    scoreEarned: 0,
    gameData: null, // O anki mini oyunun tarif adımı verisi
    callback: null, // Oyun bitince çağrılacak fonksiyon
    canvasElement: null, // Mini oyun alanı
    instructionsElement: null,
    rafId: null, // requestAnimationFrame ID'si (gerekirse animasyonlar için)
    checkSuccess: null, // Süre bitiminde kontrol için fonksiyon referansı

    init(gameType, data, callback) {
        console.log(`Starting minigame: ${gameType}`);
        this.activeGame = gameType;
        this.gameData = data;
        this.callback = callback;
        this.scoreEarned = 0;
        this.timeLeft = data.timeLimit || 0;
        this.checkSuccess = null; // Önceki oyundan kalanı temizle
        this.rafId = null; // Önceki oyundan kalanı temizle

        this.canvasElement = document.getElementById('minigame-canvas');
        this.instructionsElement = document.getElementById('minigame-instructions');
        if (!this.canvasElement || !this.instructionsElement) {
             console.error("Minigame DOM elements not found!");
             this.end(false);
             return;
         }

        this.canvasElement.innerHTML = '';
        this.instructionsElement.textContent = data.instruction;
        document.getElementById('minigame-area').classList.remove('hidden');
        document.getElementById('step-area').classList.add('hidden');

        if (this.timeLeft > 0) {
            UI.showTimer(this.timeLeft);
            clearInterval(this.timerInterval); // Önceki interval'ı temizle
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                UI.updateTimer(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.handleTimeout();
                }
            }, 1000);
        }

        const setupFunction = `setup${gameType.charAt(0).toUpperCase() + gameType.slice(1)}Game`;
        if (typeof this[setupFunction] === 'function') {
            this[setupFunction](this.canvasElement, data);
        } else {
            console.error(`Unknown minigame setup function: ${setupFunction}`);
            this.end(false);
        }
    },

    handleTimeout() {
         console.log(`Minigame ${this.activeGame} timed out.`);
         clearInterval(this.timerInterval); // Zamanlayıcıyı durdur
         this.timerInterval = null;

         // Eğer özel bir başarı kontrol fonksiyonu varsa (örn: kneading), onu çağır
         if (this.checkSuccess) {
             this.checkSuccess(); // Bu kendi içinde end() çağıracak
         } else {
             // Diğer oyunlar için genel zaman aşımı durumu
              if (this.activeGame === 'chopping' || this.activeGame === 'rapid_chopping') {
                 this.end(false); // Doğrama oyunları süre bitince başarısız
             } else if (this.activeGame === 'timed_action'){
                 // Zamanlı aksiyon süre bitince başarısız
                  this.end(false);
             }
             else {
                 // Diğer oyunlar (shaping, dragdrop vs.) o anki skorla başarılı sayılabilir
                 this.end(true); // Veya false, kurala göre değişir. Şimdilik true.
             }
         }
    },

     setupChoppingGame(canvas, data) {
         canvas.style.display = 'flex';
         canvas.style.gap = '10px';
         canvas.style.flexWrap = 'wrap';
         canvas.style.justifyContent = 'center';
         data.itemsToChop.forEach(itemId => {
             const itemDiv = document.createElement('div');
             itemDiv.className = 'choppable-item';
             itemDiv.dataset.id = itemId;
             const clicksNeeded = data.clicksNeeded[itemId] || 5; // Varsayılan tıklama
             itemDiv.dataset.clicksLeft = clicksNeeded;
             // Görselin yolunu düzeltelim (malzemeler ingredients klasöründe)
             itemDiv.innerHTML = `<img src="images/ingredients/${itemId}.png" alt="${itemId}"><span>${clicksNeeded}</span>`;
             itemDiv.onclick = (e) => this.handleChopClick(e.currentTarget, data);
             canvas.appendChild(itemDiv);
         });
     },

     handleChopClick(itemDiv, data) {
         if (!this.activeGame) return;
         let clicksLeft = parseInt(itemDiv.dataset.clicksLeft, 10);
         if (clicksLeft > 0) {
             clicksLeft--;
             itemDiv.dataset.clicksLeft = clicksLeft;
             itemDiv.querySelector('span').textContent = clicksLeft;
             GameAudio.playSound('chop'); // <<< DEĞİŞTİ

             itemDiv.style.transform = 'scale(0.95) rotate(' + Utils.getRandomInt(-5, 5) + 'deg)';
             setTimeout(() => itemDiv.style.transform = 'scale(1)', 80);

             this.scoreEarned += (data.scorePerClick || 5);
             UI.updateScore(Game.state.currentScore + this.scoreEarned);

             if (clicksLeft === 0) {
                 itemDiv.style.opacity = '0.6';
                 itemDiv.onclick = null;
                 // Doğranmış görseli göster (varsa)
                 const choppedImgSrc = `images/ingredients/${itemDiv.dataset.id}_chopped.png`;
                  // Bu görselin varlığını kontrol etmek iyi olurdu ama şimdilik deneyelim
                  itemDiv.querySelector('img').src = choppedImgSrc;
                  // Eğer doğranmış görsel yoksa, sadece span'ı değiştir:
                  // itemDiv.querySelector('span').textContent = '✓';
                  itemDiv.querySelector('span').textContent = '✓'; // Her durumda değiştir
             }

             const allDone = Array.from(this.canvasElement.querySelectorAll('.choppable-item'))
                                 .every(div => parseInt(div.dataset.clicksLeft, 10) === 0);
             if (allDone) {
                 this.scoreEarned += (data.bonusForCompletion || 0);
                 if (this.timeLeft > 0) {
                      this.scoreEarned += Math.floor(this.timeLeft * 1.5);
                 }
                 this.end(true);
             }
         }
     },

     setupKneadingGame(canvas, data) { // Mixing için de
         canvas.innerHTML = `<div class="kneading-area" title="Hızlıca Tıkla!">
                                 <img src="images/ingredients/dough_ball.png" alt="Hamur">
                                 <p id="kneading-clicks">0</p>
                             </div>`;
         const kneadingArea = canvas.querySelector('.kneading-area');
         const clickCounter = canvas.querySelector('#kneading-clicks');
         let clickCount = 0;
         const targetClicks = (data.duration || 15) * (data.targetClicksPerSecond || 2);

         kneadingArea.onclick = () => {
             if (!this.activeGame) return;
             clickCount++;
             clickCounter.textContent = clickCount;
             GameAudio.playSound('squish'); // <<< DEĞİŞTİ (veya 'mix')

             const imgElement = kneadingArea.querySelector('img');
             if(imgElement) imgElement.style.transform = `scale(${1 + Math.sin(clickCount / 2) * 0.08}) rotate(${clickCount * 3}deg)`;

             this.scoreEarned += 1;
             UI.updateScore(Game.state.currentScore + this.scoreEarned);
         };

         this.checkSuccess = () => { // Süre bitince çağrılacak fonksiyon
             const successRatio = clickCount / targetClicks;
             let success = false;
             let calculatedScore = this.scoreEarned; // Başlangıç skoru
             if (successRatio >= 0.9) {
                 calculatedScore = (data.scoreBase || 100) * (data.scoreMultiplier || 1); // Tam puan
                 success = true;
             } else if (successRatio >= 0.6) {
                 calculatedScore = Math.floor((data.scoreBase || 100) * (data.scoreMultiplier || 1) * 0.6); // Kısmi puan
                 success = true;
             } else {
                  calculatedScore = Math.floor(this.scoreEarned * 0.5); // Çok azsa puanı azalt
                  success = false;
             }
             this.scoreEarned = calculatedScore; // Nihai skoru ata
             this.end(success); // Oyunu bitir
         };
     },
      setupMixingGame(canvas, data) { // Kneading ile aynı mantık, farklı görsel/ses
          this.setupKneadingGame(canvas, data); // Şimdilik aynı
          // Görseli ve sesi değiştirebiliriz
           const imgElement = canvas.querySelector('.kneading-area img');
           if(imgElement) imgElement.src = 'images/tools/bowl_mixing.png'; // Karıştırma kasesi görseli (eklenmeli)
          // kneadingArea.onclick içinde sesi 'mix' yapabiliriz
      },


     setupDragDropGame(canvas, data) {
         canvas.style.position = 'relative';
         canvas.style.minHeight = '200px';
         canvas.style.border = '2px dashed var(--secondary-color)';
         canvas.style.borderRadius = '10px';
         canvas.style.background = '#fdfdf0'; // Hafif sarı arka plan

         // Hedef Alan
          const dropTarget = document.createElement('div');
          dropTarget.classList.add('drop-target'); // CSS'te stil verilebilir
          dropTarget.style.position = 'absolute';
          dropTarget.style.bottom = '10px';
          dropTarget.style.left = '50%';
          dropTarget.style.transform = 'translateX(-50%)';
          dropTarget.style.width = '100px';
          dropTarget.style.height = '100px';
          dropTarget.style.backgroundImage = `url(${data.dropTarget.img})`;
          dropTarget.style.backgroundSize = 'contain';
          dropTarget.style.backgroundRepeat = 'no-repeat';
          dropTarget.style.backgroundPosition = 'center';
          dropTarget.dataset.targetId = data.dropTarget.id;
          canvas.appendChild(dropTarget);


         // Sürüklenecek Öğe
         const draggable = document.createElement('img');
         draggable.src = data.draggableItem.img;
         draggable.alt = data.draggableItem.name;
         draggable.classList.add('draggable-item'); // CSS'te stil verilebilir
         draggable.style.position = 'absolute';
         draggable.style.maxWidth = '80px';
         draggable.style.cursor = 'grab';
         draggable.style.left = Utils.getRandomInt(10, 80) + '%';
         draggable.style.top = Utils.getRandomInt(10, 30) + '%';
         draggable.draggable = true; // Sürüklenebilir yap

         // Sürükleme Olayları (Basit Kontrol)
         draggable.ondragstart = (event) => {
             event.dataTransfer.setData("text/plain", data.draggableItem.id);
             event.target.style.cursor = 'grabbing';
              event.target.style.opacity = '0.7';
         };
         draggable.ondragend = (event) => {
             event.target.style.cursor = 'grab';
              event.target.style.opacity = '1';
         };

         dropTarget.ondragover = (event) => {
             event.preventDefault(); // Bırakmaya izin ver
              dropTarget.style.backgroundColor = 'rgba(174, 213, 129, 0.3)'; // Hedef üzerine gelince renk değiştir
         };
          dropTarget.ondragleave = (event) => {
               dropTarget.style.backgroundColor = 'transparent';
           };

         dropTarget.ondrop = (event) => {
             event.preventDefault();
             dropTarget.style.backgroundColor = 'transparent';
             const droppedItemId = event.dataTransfer.getData("text/plain");

             if (droppedItemId === data.draggableItem.id && this.activeGame) {
                 // Başarılı bırakma
                  GameAudio.playSound('drop'); // <<< DEĞİŞTİ
                 this.scoreEarned += (data.scoreBase || 50);
                 // Sürüklenen öğeyi kaldırabilir veya hedefte gösterebiliriz
                 draggable.remove();
                 dropTarget.style.backgroundImage = `url(${data.draggableItem.img})`; // Hedefte göster
                 this.end(true);
             } else {
                 // Yanlış bırakma (veya başka bir item)
                 // Hata sesi çalınabilir
             }
         };

         canvas.appendChild(draggable);
     },

     setupTimedActionGame(canvas, data) {
         canvas.style.textAlign = 'center';
         const progressBarContainer = document.createElement('div');
          progressBarContainer.classList.add('progress-bar-container'); // CSS için
          // Stil tanımlamaları CSS'e taşınabilir
         progressBarContainer.style.width = '80%';
         progressBarContainer.style.height = '30px';
         progressBarContainer.style.backgroundColor = '#eee';
         progressBarContainer.style.margin = '20px auto';
         progressBarContainer.style.borderRadius = '15px';
         progressBarContainer.style.overflow = 'hidden';
         progressBarContainer.style.position = 'relative';

         const progressBar = document.createElement('div');
          progressBar.classList.add('progress-bar-fill'); // CSS için
         progressBar.style.width = '0%';
         progressBar.style.height = '100%';
         progressBar.style.backgroundColor = 'var(--secondary-color)';
         progressBar.style.transition = `width ${data.totalDuration}s linear`;

         const targetWindow = document.createElement('div');
          targetWindow.classList.add('progress-bar-target'); // CSS için
         targetWindow.style.position = 'absolute';
         targetWindow.style.height = '100%';
         targetWindow.style.backgroundColor = 'rgba(255, 183, 77, 0.5)';
         const windowWidth = (data.timeWindow / data.totalDuration) * 100;
         const windowStart = Utils.getRandomInt(20, 80 - windowWidth);
         targetWindow.style.width = `${windowWidth}%`;
         targetWindow.style.left = `${windowStart}%`;
         targetWindow.style.top = '0';

         progressBarContainer.appendChild(targetWindow);
         progressBarContainer.appendChild(progressBar);
         canvas.appendChild(progressBarContainer);

         const actionButton = document.createElement('button');
         actionButton.textContent = data.actionText;
         actionButton.className = 'action-button large timed-action-button'; // Özel sınıf
         actionButton.onclick = () => {
             if (!this.activeGame) return;
             clearInterval(this.timerInterval); // Zamanlayıcıyı durdur
             this.timerInterval = null;
             // Geçerli progress'i hesaplamak için geçen süreyi kullanmak daha doğru olabilir
             // Ama transition ile yaklaşık bir değer alalım:
             const computedStyle = window.getComputedStyle(progressBar);
             const currentWidth = parseFloat(computedStyle.width);
             const containerWidth = parseFloat(window.getComputedStyle(progressBarContainer).width);
             const progressPercent = (currentWidth / containerWidth) * 100;

             const success = progressPercent >= windowStart && progressPercent <= (windowStart + windowWidth);
             if (success) {
                 this.scoreEarned += (data.scoreBase || 80);
                 GameAudio.playSound('success_ping'); // <<< DEĞİŞTİ
             } else {
                 GameAudio.playSound('failure_buzz'); // <<< DEĞİŞTİ
             }
             actionButton.disabled = true;
             this.end(success);
         };
         canvas.appendChild(actionButton);

          requestAnimationFrame(() => {
             progressBar.style.width = '100%'; // Animasyonu başlat
         });

          // handleTimeout içinde çağrılacak fonksiyon (eğer butona basılmazsa)
         this.checkSuccess = () => {
              if (this.activeGame) {
                 this.end(false); // Süre bitti ve basılmadı = başarısız
              }
          };
     },

     // --- Diğer Mini Oyun Kurulumları ---
     setupBlendingGame(canvas, data){
         // Tıklama veya basılı tutma mekanizması kullanılabilir
         // setupKneadingGame benzeri, farklı görsel ve ses ile
          canvas.innerHTML = `<div class="blending-area" title="Basılı Tut!">
                                  <img src="images/tools/blender.png" alt="Blender">
                                  <div class="blending-progress"></div>
                              </div>`;
          const blendArea = canvas.querySelector('.blending-area');
          const progressBar = canvas.querySelector('.blending-progress'); // CSS ile stil verilmeli
           let holdInterval = null;
           let progress = 0;
           const targetDuration = (data.holdDuration || 8) * 1000; // Milisaniye

           const startBlending = () => {
               if (holdInterval) return; // Zaten çalışıyorsa tekrar başlatma
                GameAudio.playSound('blender_start'); // Blender sesi (eklenmeli)
               holdInterval = setInterval(() => {
                   progress += 100; // Her 100ms'de ilerle
                   const percent = Math.min(100, (progress / targetDuration) * 100);
                   if (progressBar) progressBar.style.width = `${percent}%`;

                   if (progress >= targetDuration) {
                       stopBlending(true); // Başarıyla tamamlandı
                   }
               }, 100);
           };

            const stopBlending = (completed = false) => {
               clearInterval(holdInterval);
               holdInterval = null;
                GameAudio.playSound('blender_stop'); // Blender durma sesi (eklenmeli)
                if (this.activeGame) { // Sadece oyun aktifken bitir
                    if (completed) {
                        this.scoreEarned = data.scoreBase || 150;
                        this.end(true);
                    } else if (progress > 0) { // Erken bırakıldıysa
                         this.scoreEarned = Math.floor((data.scoreBase || 150) * (progress / targetDuration) * 0.5); // Kısmi puan
                         this.end(true); // Kısmen başarılı sayılabilir
                    } else {
                        this.end(false); // Hiç basılmadıysa
                    }
                }
            };

            blendArea.onmousedown = startBlending;
            blendArea.onmouseup = () => stopBlending(false);
            blendArea.onmouseleave = () => stopBlending(false); // Fare dışarı çıkarsa da durdur
             // Dokunmatik cihazlar için:
             blendArea.ontouchstart = (e) => { e.preventDefault(); startBlending(); };
             blendArea.ontouchend = () => stopBlending(false);
     } ,

     setupRollingPinGame(canvas, data){
          // Fare veya dokunma ile çizim alanı oluşturulabilir (P5.js ideal)
          // Basit versiyon: belirli sayıda tıklama veya sürükleme hareketi
          canvas.innerHTML = `<div class="rolling-area">
                                  <img src="images/ingredients/dough_flat.png" alt="Açılmış Hamur" style="width:150px;">
                                  <p>Hamuru inceltmek için tıkla!</p>
                              </div>`;
           let clickCount = 0;
           const targetClicks = 10; // Örnek
           canvas.querySelector('.rolling-area').onclick = () => {
               if (!this.activeGame) return;
               clickCount++;
                GameAudio.playSound('roll_pin'); // Oklava sesi (eklenmeli)
               // Görsel efekt (hamur biraz daha büyüyebilir/incelir gibi)
                const img = canvas.querySelector('.rolling-area img');
                if(img) img.style.transform = `scale(${1 + clickCount * 0.03})`;

               if(clickCount >= targetClicks){
                   this.scoreEarned = data.scoreBase || 120;
                   this.end(true);
               }
           }
     },

      setupShapingGame(canvas, data) {
          // Belirli yerlere tıklayarak kurabiye yerleştirme
          canvas.style.position = 'relative';
          canvas.style.minHeight = '250px';
          canvas.style.backgroundImage = `url(images/tools/baking_sheet.png)`;
          canvas.style.backgroundSize = 'contain';
          canvas.style.backgroundRepeat = 'no-repeat';
          canvas.style.backgroundPosition = 'center';
          canvas.style.cursor = 'crosshair'; // Yerleştirme imleci

          let placedCount = 0;
          const targetCount = data.itemsToPlace || 8;

          canvas.onclick = (event) => {
              if (!this.activeGame || placedCount >= targetCount) return;

              const rect = canvas.getBoundingClientRect();
              const x = event.clientX - rect.left - 15; // 15px = kurabiye yarıçapı (yaklaşık)
              const y = event.clientY - rect.top - 15;

              const cookie = document.createElement('img');
              cookie.src = 'images/ingredients/cookie_dough_ball.png'; // Çiğ kurabiye topu (eklenmeli)
              cookie.alt = 'Kurabiye';
              cookie.style.position = 'absolute';
              cookie.style.left = `${x}px`;
              cookie.style.top = `${y}px`;
              cookie.style.width = '30px';
              cookie.style.height = '30px';
              cookie.style.pointerEvents = 'none'; // Tıklamayı engelle
              canvas.appendChild(cookie);

              placedCount++;
              GameAudio.playSound('drop'); // <<< DEĞİŞTİ

              if (placedCount >= targetCount) {
                  this.scoreEarned = (data.scorePerPlacement || 15) * targetCount + (data.bonusForCompletion || 50);
                  canvas.style.cursor = 'default';
                  this.end(true);
              }
          };
            // Zamanlayıcı kontrolü
           if (this.timeLeft > 0) {
                 this.checkSuccess = () => {
                     if (this.activeGame) { // Süre bittiğinde
                         this.scoreEarned = (data.scorePerPlacement || 15) * placedCount; // O anki yerleştirme sayısı kadar puan
                         this.end(true); // Süre bitince de başarılı sayalım (kısmi puanla)
                     }
                 };
           }
      },

    // Mini Oyunu Bitir
    end(success) {
        if (!this.activeGame) return;

        console.log(`Minigame ${this.activeGame} ended. Success: ${success}, Score: ${this.scoreEarned}`);
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        UI.hideTimer();

        // if (this.rafId) cancelAnimationFrame(this.rafId);
        // this.rafId = null;

        const gameType = this.activeGame; // Callback'e göndermeden önce sakla
        const finalScore = Math.max(0, Math.floor(this.scoreEarned)); // Negatif skoru engelle

        // Durumu sıfırla
        this.activeGame = null;
        const localCallback = this.callback; // Callback'i yerel değişkene al
        this.callback = null;
        this.gameData = null;
        this.checkSuccess = null; // Check fonksiyonunu temizle
        if(this.canvasElement) this.canvasElement.innerHTML = ''; // Canvas'ı temizle

        document.getElementById('minigame-area')?.classList.add('hidden');
        document.getElementById('step-area')?.classList.remove('hidden');

        // Geri bildirimi UI üzerinden verelim
        const feedbackData = this.gameData || {}; // Eğer gameData null ise boş obje kullan
        let feedbackMsg = "";
        let feedbackType = "";
        let catMood = "";

        if (success) {
             feedbackMsg = feedbackData.feedbackGood || "Harika iş!";
             feedbackType = "success";
             catMood = feedbackData.catMood || 'happy';
             if (typeof GameAudio !== 'undefined') GameAudio.playSound('success'); // <<< DEĞİŞTİ
         } else {
             const failMessages = ["Hmm, olmadı sanki?", "Neredeyse oluyordu!", "Bir dahaki sefere Ceyda!", "Sorun değil, devam edelim."];
             feedbackMsg = feedbackData.feedbackBad || failMessages[Utils.getRandomInt(0, failMessages.length - 1)];
             feedbackType = "warning";
             catMood = 'encourage';
             if (typeof GameAudio !== 'undefined') GameAudio.playSound('failure'); // <<< DEĞİŞTİ
         }

         UI.showFeedback(feedbackMsg, feedbackType);
         if (typeof ChefKedi !== 'undefined') ChefKedi.speak(feedbackMsg, catMood, 4000);

        // Ana oyuna sonucu bildir
        if (localCallback) {
            localCallback(success, finalScore, gameType);
        } else {
            console.error("Minigame callback was null!");
        }
    }
};