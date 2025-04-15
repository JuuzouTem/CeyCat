    // js/audio.js
    const Audio = {
        sounds: {},
        bgm: null,
        sfxVolume: 0.7,
        bgmVolume: 0.5,
        isMuted: false, // Genel sessize alma (henüz kullanılmıyor ama eklenebilir)

        init(soundList, bgmSrc) {
            console.log("Initializing Audio...");
            // Ses ayarlarını yükle
            this.sfxVolume = Utils.loadData('sfxVolume', 0.7);
            this.bgmVolume = Utils.loadData('bgmVolume', 0.5);

            // Ses efektlerini yükle
            soundList.forEach(sound => {
                this.loadSound(sound.id, sound.src);
            });

            // Arka plan müziğini yükle
            if (bgmSrc) {
                this.bgm = new Howl({ // Howler.js kütüphanesi önerilir, yoksa temel Audio kullanılır
                    src: [bgmSrc],
                    loop: true,
                    volume: this.bgmVolume,
                    html5: true // Tarayıcı uyumluluğu için
                });
                // Tarayıcılar kullanıcı etkileşimi olmadan otomatik çalmayı engelleyebilir.
                // İlk play() genellikle bir buton tıklaması içinde olmalı.
            }
            console.log("Audio Initialized.");
        },

        // Howler.js KULLANILIYORSA:
        loadSound(id, src) {
             try {
                 this.sounds[id] = new Howl({
                     src: [src],
                     volume: this.sfxVolume
                 });
             } catch (e) {
                console.error(`Error loading sound ${id}:`, e);
                // Howler yoksa fallback veya hata mesajı
                if (typeof Howl === 'undefined') {
                    console.warn("Howler.js not found. Using basic HTML5 Audio (less reliable).");
                    this.sounds[id] = new Audio(src); // Temel HTML5 Audio
                    this.sounds[id].volume = this.sfxVolume;
                }
             }
        },

        playSound(id) {
            if (this.sounds[id]) {
                try {
                     // Howler varsa:
                     if (this.sounds[id].play) {
                         this.sounds[id].volume(this.sfxVolume); // Her çalmadan önce sesi ayarla
                         this.sounds[id].play();
                     }
                     // Howler yoksa (Temel HTML5 Audio Fallback):
                     else if (this.sounds[id].play) {
                         this.sounds[id].currentTime = 0; // Başa sar
                         this.sounds[id].volume = this.sfxVolume;
                         this.sounds[id].play().catch(e => console.warn(`Could not play sound ${id}:`, e)); // Otomatik çalma engeli olabilir
                     }
                } catch(e) {
                     console.error(`Error playing sound ${id}:`, e);
                }
            } else {
                console.warn(`Sound not found: ${id}`);
            }
        },

        playBGM() {
            if (this.bgm && !this.bgm.playing()) {
                 try {
                    this.bgm.volume(this.bgmVolume);
                    this.bgm.play();
                    console.log("BGM Playing");
                 } catch (e) {
                     console.error("Error playing BGM:", e);
                 }
            } else if (!this.bgm) {
                console.warn("BGM not loaded.");
            }
        },

        stopBGM() {
            if (this.bgm && this.bgm.playing()) {
                this.bgm.stop();
                 console.log("BGM Stopped");
            }
        },

        setSfxVolume(volume) {
            volume = Math.max(0, Math.min(1, parseFloat(volume))); // 0-1 aralığında tut
            this.sfxVolume = volume;
             Utils.saveData('sfxVolume', volume);
            // Howler kullanılıyorsa mevcut seslerin sesini ayarlamak daha karmaşık olabilir,
            // en basit yöntem her playSound'da sesi ayarlamak.
            console.log("SFX Volume set to:", volume);
             // Test sesi çalabiliriz
             this.playSound('click'); // Ayar değişince örnek ses
        },

        setBgmVolume(volume) {
            volume = Math.max(0, Math.min(1, parseFloat(volume)));
            this.bgmVolume = volume;
            if (this.bgm) {
                this.bgm.volume(volume);
            }
             Utils.saveData('bgmVolume', volume);
             console.log("BGM Volume set to:", volume);
        }
    };

    // Howler.js'i HTML'e <script> ile eklediysen bu çalışır.
    // Değilse, yukarıdaki temel HTML5 Audio fallback kullanılır.
    // Örnek Howler.js CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>