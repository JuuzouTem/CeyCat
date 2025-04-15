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

        init(gameType, data, callback) {
            console.log(`Starting minigame: ${gameType}`);
            this.activeGame = gameType;
            this.gameData = data;
            this.callback = callback;
            this.scoreEarned = 0;
            this.timeLeft = data.timeLimit || 0;

            this.canvasElement = document.getElementById('minigame-canvas');
            this.instructionsElement = document.getElementById('minigame-instructions');
            if (!this.canvasElement || !this.instructionsElement) {
                 console.error("Minigame DOM elements not found!");
                 this.end(false); // Başlamadan bitir
                 return;
             }

            // Alanı temizle ve göster
            this.canvasElement.innerHTML = ''; // Önceki oyundan kalanları temizle
            this.instructionsElement.textContent = data.instruction;
            document.getElementById('minigame-area').classList.remove('hidden');
            document.getElementById('step-area').classList.add('hidden');

            // Zamanlayıcıyı başlat (varsa)
            if (this.timeLeft > 0) {
                UI.showTimer(this.timeLeft);
                this.timerInterval = setInterval(() => {
                    this.timeLeft--;
                    UI.updateTimer(this.timeLeft);
                    if (this.timeLeft <= 0) {
                        this.handleTimeout(); // Süre bittiğinde özel işlem
                    }
                }, 1000);
            }

             // Animasyon döngüsünü başlat (gerekirse)
             // this.rafId = requestAnimationFrame(this.gameLoop.bind(this));


            // Oyuna özel kurulumu çağır
            const setupFunction = `setup${gameType.charAt(0).toUpperCase() + gameType.slice(1)}Game`; //örn: setupChoppingGame
            if (typeof this[setupFunction] === 'function') {
                this[setupFunction](this.canvasElement, data);
            } else {
                console.error(`Unknown minigame setup function: ${setupFunction}`);
                this.end(false);
            }
        },

        // Süre bittiğinde çağrılır
        handleTimeout() {
             console.log(`Minigame ${this.activeGame} timed out.`);
             // Bazı oyunlar süre bitince başarısız olur, bazıları o anki skoru alır.
             // Oyun tipine göre karar verilebilir.
             if (this.activeGame === 'chopping' || this.activeGame === 'kneading' || this.activeGame === 'rapid_chopping') {
                 // Süre bitince o anki ilerlemeye göre kısmi puan verilebilir veya başarısız sayılabilir.
                 // Şimdilik başarısız sayalım.
                 this.end(false);
             } else {
                 // Diğer oyunlar (örn: shaping) süre bitince o anki skoru kabul edebilir.
                 this.end(true); // Veya false, oyunun kuralına bağlı.
             }
        },

         // Örnek: Doğrama Oyunu Kurulumu
         setupChoppingGame(canvas, data) {
             canvas.style.display = 'flex'; // Öğeleri yan yana diz
             canvas.style.gap = '10px';
             canvas.style.flexWrap = 'wrap';
             canvas.style.justifyContent = 'center';
             data.itemsToChop.forEach(itemId => {
                 const itemDiv = document.createElement('div');
                 itemDiv.classList.add('choppable-item');
                 itemDiv.dataset.id = itemId;
                 const clicksNeeded = data.clicksNeeded[itemId];
                 itemDiv.dataset.clicksLeft = clicksNeeded;
                 // Başlangıç görseli (doğranmamış)
                 itemDiv.innerHTML = `<img src="images/ingredients/${itemId}.png" alt="${itemId}"><span>${clicksNeeded}</span>`;
                 itemDiv.onclick = (e) => this.handleChopClick(e.currentTarget, data);
                 canvas.appendChild(itemDiv);
             });
         },

         // Doğrama Tıklama İşlemi
         handleChopClick(itemDiv, data) {
             if (!this.activeGame) return; // Oyun bittiyse işlem yapma

             let clicksLeft = parseInt(itemDiv.dataset.clicksLeft, 10);
             if (clicksLeft > 0) {
                 clicksLeft--;
                 itemDiv.dataset.clicksLeft = clicksLeft;
                 itemDiv.querySelector('span').textContent = clicksLeft;
                 Audio.playSound('chop');

                 // Görsel efekt
                 itemDiv.style.transform = 'scale(0.95) rotate(' + Utils.getRandomInt(-5, 5) + 'deg)';
                 setTimeout(() => itemDiv.style.transform = 'scale(1)', 80);

                 this.scoreEarned += (data.scorePerClick || 5);
                 UI.updateScore(Game.currentScore + this.scoreEarned); // Anlık skoru göster

                 if (clicksLeft === 0) {
                     itemDiv.style.opacity = '0.6';
                     itemDiv.onclick = null; // Artık tıklanamaz
                     // Görseli doğranmış ile değiştir
                     itemDiv.querySelector('img').src = `images/ingredients/${itemDiv.dataset.id}_chopped.png`;
                     itemDiv.querySelector('span').textContent = '✓'; // Tamamlandı işareti
                 }

                 // Tüm item'lar doğrandı mı kontrol et
                 const allDone = Array.from(this.canvasElement.querySelectorAll('.choppable-item'))
                                     .every(div => parseInt(div.dataset.clicksLeft, 10) === 0);
                 if (allDone) {
                     this.scoreEarned += (data.bonusForCompletion || 0);
                     // Süre bitmeden tamamlarsa ekstra bonus
                     if (this.timeLeft > 0) {
                          this.scoreEarned += Math.floor(this.timeLeft * 1.5); // Kalan süre x 1.5 puan
                     }
                     this.end(true); // Başarıyla bitir
                 }
             }
         },

         // Örnek: Yoğurma/Karıştırma Oyunu Kurulumu (Tıklama Hızı)
         setupKneadingGame(canvas, data) { // Mixing için de kullanılabilir
             canvas.innerHTML = `<div class="kneading-area" title="Hızlıca Tıkla!">
                                     <img src="images/ingredients/dough_ball.png" alt="Hamur">
                                     <p id="kneading-clicks">0</p>
                                 </div>`;
             const kneadingArea = canvas.querySelector('.kneading-area');
             const clickCounter = canvas.querySelector('#kneading-clicks');
             let clickCount = 0;
             const targetClicks = data.duration * (data.targetClicksPerSecond || 2); // Hedef tıklama

             kneadingArea.onclick = () => {
                 if (!this.activeGame) return;
                 clickCount++;
                 clickCounter.textContent = clickCount;
                 Audio.playSound('squish'); // Veya 'mix'

                 // Görsel efekt
                 const imgElement = kneadingArea.querySelector('img');
                 imgElement.style.transform = `scale(${1 + Math.sin(clickCount / 2) * 0.08}) rotate(${clickCount * 3}deg)`;

                 this.scoreEarned += 1; // Her tıklama için küçük puan
                 UI.updateScore(Game.currentScore + this.scoreEarned);

                 // Hedefe ulaşınca erken bitirme (isteğe bağlı)
                 // if (clickCount >= targetClicks) { this.end(true); }
             };

              // Süre bitince tıklama sayısını kontrol et
             this.checkSuccess = () => {
                 const successRatio = clickCount / targetClicks;
                 let success = false;
                 if (successRatio >= 0.9) { // Hedefin %90'ı veya fazlası
                     this.scoreEarned += (data.scoreBase || 100) * (data.scoreMultiplier || 1);
                     success = true;
                 } else if (successRatio >= 0.6) { // %60-%90 arası
                     this.scoreEarned += (data.scoreBase || 100) * (data.scoreMultiplier || 1) * 0.6; // Kısmi puan
                     success = true; // Yine de başarılı sayılabilir
                 } else {
                      this.scoreEarned = Math.floor(this.scoreEarned / 2); // Çok az tıklandıysa puanı azalt
                      success = false;
                 }
                 this.end(success);
             };
              // handleTimeout içinde bu fonksiyon çağrılacak şekilde ayarlanabilir.
              // Veya direkt end() içinde kontrol edilir.
         },

         // Örnek: Sürükle Bırak Oyunu Kurulumu (Basit - Doğru yere tıklama)
         setupDragDropGame(canvas, data) {
             canvas.style.position = 'relative'; // İçerideki öğeleri konumlandırmak için
             canvas.style.height = '200px'; // Alan yüksekliği
             canvas.style.border = '2px dashed var(--secondary-color)';
             canvas.style.backgroundImage = `url(${data.dropTarget.img})`; // Hedef arka planı
             canvas.style.backgroundSize = 'contain';
             canvas.style.backgroundRepeat = 'no-repeat';
             canvas.style.backgroundPosition = 'center bottom';

             const draggable = document.createElement('img');
             draggable.src = data.draggableItem.img;
             draggable.alt = data.draggableItem.name;
             draggable.style.position = 'absolute';
             draggable.style.maxWidth = '80px';
             draggable.style.cursor = 'pointer';
             // Rastgele başlangıç konumu
             draggable.style.left = Utils.getRandomInt(10, 80) + '%';
             draggable.style.top = Utils.getRandomInt(10, 30) + '%';
             draggable.onclick = () => {
                 if (!this.activeGame) return;
                 // Basitçe tıklandığında başarılı sayalım
                  Audio.playSound('drop');
                 this.scoreEarned += (data.scoreBase || 50);
                 this.end(true);
             };
             canvas.appendChild(draggable);
             // Gerçek sürükle bırak HTML5 Drag and Drop API veya kütüphane gerektirir.
         },

         // Örnek: Zamanlı Aksiyon (Doğru zamanda butona basma)
         setupTimedActionGame(canvas, data) {
             canvas.style.textAlign = 'center';
             const progressBarContainer = document.createElement('div');
             progressBarContainer.style.width = '80%';
             progressBarContainer.style.height = '30px';
             progressBarContainer.style.backgroundColor = '#eee';
             progressBarContainer.style.margin = '20px auto';
             progressBarContainer.style.borderRadius = '15px';
             progressBarContainer.style.overflow = 'hidden';
             progressBarContainer.style.position = 'relative';

             const progressBar = document.createElement('div');
             progressBar.style.width = '0%';
             progressBar.style.height = '100%';
             progressBar.style.backgroundColor = var(--secondary-color);
             progressBar.style.transition = `width ${data.totalDuration}s linear`; // Süre boyunca dolacak

             const targetWindow = document.createElement('div'); // Hedef aralık
             targetWindow.style.position = 'absolute';
             targetWindow.style.height = '100%';
             targetWindow.style.backgroundColor = 'rgba(255, 183, 77, 0.5)'; // Turuncu hedef aralığı
             const windowWidth = (data.timeWindow / data.totalDuration) * 100;
             const windowStart = Utils.getRandomInt(20, 80 - windowWidth); // Rastgele başlangıç (%20-%80 arası)
             targetWindow.style.width = `${windowWidth}%`;
             targetWindow.style.left = `${windowStart}%`;
             targetWindow.style.top = '0';

             progressBarContainer.appendChild(targetWindow);
             progressBarContainer.appendChild(progressBar);
             canvas.appendChild(progressBarContainer);

             const actionButton = document.createElement('button');
             actionButton.textContent = data.actionText;
             actionButton.classList.add('action-button', 'large');
             actionButton.onclick = () => {
                 if (!this.activeGame) return;
                 const progressPercent = parseFloat(progressBar.style.width) || 0;
                 const success = progressPercent >= windowStart && progressPercent <= (windowStart + windowWidth);
                 if (success) {
                     this.scoreEarned += (data.scoreBase || 80);
                     Audio.playSound('success_ping'); // Özel başarı sesi
                 } else {
                     Audio.playSound('failure_buzz');
                 }
                 actionButton.disabled = true; // Sadece bir kere basılabilir
                 this.end(success);
             };
             canvas.appendChild(actionButton);

             // Progress bar'ı başlat
              requestAnimationFrame(() => { // DOM güncellendikten sonra başlat
                 progressBar.style.width = '100%';
             });

              // Süre sonunda otomatik bitirme (eğer butona basılmadıysa)
              this.checkSuccess = () => {
                  if (this.activeGame) { // Eğer end() henüz çağrılmadıysa
                     this.end(false); // Süre bitti ve basılmadı = başarısız
                  }
              };
              // handleTimeout içinde çağrılabilir
         },

         // ... Diğer oyun kurulum fonksiyonları ...
         // setupBlendingGame, setupRollingPinGame, setupShapingGame, setupRapidChoppingGame etc.


         // Mini Oyunu Bitir
         end(success) {
             if (!this.activeGame) return; // Zaten bittiyse tekrar bitirme

             console.log(`Minigame ${this.activeGame} ended. Success: ${success}, Score: ${this.scoreEarned}`);
             clearInterval(this.timerInterval); // Zamanlayıcıyı durdur
             this.timerInterval = null;
             UI.hideTimer(); // Zamanlayıcıyı gizle

              // Animasyon döngüsünü durdur (varsa)
             // if (this.rafId) cancelAnimationFrame(this.rafId);
             // this.rafId = null;

              // Eğer oyunun kendine özel kontrol fonksiyonu varsa onu çağır (zamanlı oyunlar için)
              if (this.checkSuccess) {
                  const checkFn = this.checkSuccess;
                  this.checkSuccess = null; // Tekrar çağrılmasını engelle
                  this.activeGame = null; // end() tekrar çağrılmasın diye
                  checkFn(); // Bu fonksiyon kendi içinde end() çağıracak
                  return;
              }


             document.getElementById('minigame-area').classList.add('hidden');
             document.getElementById('step-area').classList.remove('hidden'); // Normal adımı geri göster

             const feedbackArea = document.getElementById('feedback-area');
             let feedbackMsg = "";
             let feedbackType = "";
             let catMood = "";

             if (success) {
                 feedbackMsg = this.gameData.feedbackGood || "Harika iş!";
                 feedbackType = "success";
                 catMood = this.gameData.catMood || 'happy'; // Adımda belirtilen ruh hali
                 Audio.playSound('success');
             } else {
                  // Başarısızlık mesajları daha nazik olabilir
                 const failMessages = ["Hmm, olmadı sanki?", "Neredeyse oluyordu!", "Bir dahaki sefere Ceyda!", "Sorun değil, devam edelim."];
                 feedbackMsg = this.gameData.feedbackBad || failMessages[Utils.getRandomInt(0, failMessages.length - 1)];
                 feedbackType = "warning"; // Hata yerine uyarı
                 catMood = 'encourage'; // Teşvik edici
                 Audio.playSound('failure'); // Nazik hata sesi
                 // Başarısızlıkta puanı azalt veya sıfırla (oyun dengesine bağlı)
                 this.scoreEarned = Math.floor(this.scoreEarned * 0.3); // Örnek: Puanın %30'unu ver
             }

             UI.showFeedback(feedbackMsg, feedbackType);
             ChefKedi.speak(feedbackMsg, catMood, 4000); // Kedi de yorum yapsın


             const finalScore = this.scoreEarned;
             const gameType = this.activeGame; // Callback'e göndermeden önce sakla

             // Durumu sıfırla
             this.activeGame = null;
             this.gameData = null;
             this.canvasElement.innerHTML = ''; // Temizle

             // Ana oyuna sonucu bildir
             if (this.callback) {
                 this.callback(success, finalScore, gameType);
             }
         }
    };