// js/audio.js
const GameAudio = {
    sounds: {}, // Ses efektleri { id: Howl veya Audio nesnesi }
    bgm: null,    // Arka plan müziği (Howl veya Audio nesnesi)
    sfxVolume: 0.7, // Efekt sesi seviyesi (0-1)
    bgmVolume: 0.5, // Müzik sesi seviyesi (0-1)
    isInitialized: false, // Başlatılıp başlatılmadığını takip et

    init(soundList, bgmSrc) {
        if (this.isInitialized) {
            console.warn("GameAudio already initialized.");
            return;
        }
        console.log("Initializing GameAudio...");

        // Kayıtlı ses ayarlarını yükle
        this.sfxVolume = Utils.loadData('sfxVolume', 0.7);
        this.bgmVolume = Utils.loadData('bgmVolume', 0.5);
        console.log(`Loaded volumes - SFX: ${this.sfxVolume}, BGM: ${this.bgmVolume}`);

        // Ses efektlerini yükle
        soundList.forEach(sound => {
            this.loadSound(sound.id, sound.src);
        });

        // Arka plan müziğini yükle
        if (bgmSrc) {
            // Howler.js kütüphanesi varsa kullanmayı dene
            if (typeof Howl !== 'undefined') {
                 try {
                    console.log("Attempting to load BGM with Howler.js...");
                    this.bgm = new Howl({
                        src: [bgmSrc],
                        loop: true,
                        volume: this.bgmVolume,
                        html5: true, // Daha geniş uyumluluk için HTML5 Audio'yu zorla
                        preload: true, // Ön yüklemeyi iste
                        onload: () => console.log("Howler BGM loaded successfully."),
                        onloaderror: (id, err) => {
                            console.error(`Howler BGM load error (ID: ${id}):`, err);
                            console.log("Falling back to HTML5 Audio for BGM.");
                            this.loadHtml5Bgm(bgmSrc); // Hata durumunda HTML5'e düş
                        },
                        onplayerror: (id, err) => {
                             console.error(`Howler BGM play error (ID: ${id}):`, err);
                             // Kullanıcı etkileşimi gerektiğini belirten bir uyarı gösterilebilir
                             if (err.name === 'NotAllowedError') {
                                 console.warn("BGM playback blocked by browser. Requires user interaction.");
                             }
                        }
                    });
                } catch (e) {
                    console.error("Error initializing Howler BGM:", e);
                    this.loadHtml5Bgm(bgmSrc); // Başlatma hatasında HTML5'e düş
                }
            } else {
                 // Howler.js yoksa doğrudan HTML5 Audio kullan
                 console.log("Howler.js not found. Loading BGM with HTML5 Audio.");
                 this.loadHtml5Bgm(bgmSrc);
            }
        } else {
             console.warn("No BGM source provided.");
        }

        this.isInitialized = true; // Başlatıldı olarak işaretle
        console.log("GameAudio Initialized.");
    },

    // Ses efektini yükle (Howler veya HTML5)
    loadSound(id, src) {
        if (this.sounds[id]) {
             console.warn(`Sound ID "${id}" already loaded.`);
             return; // Zaten yüklüyse tekrar yükleme
        }

        if (typeof Howl !== 'undefined') {
            try {
                 this.sounds[id] = new Howl({
                     src: [src],
                     volume: this.sfxVolume,
                     preload: true,
                     onloaderror: (soundId, err) => console.error(`Howler SFX load error (${id}, ID: ${soundId}):`, err),
                     onplayerror: (soundId, err) => console.error(`Howler SFX play error (${id}, ID: ${soundId}):`, err)
                 });
             } catch (e) {
                console.error(`Error initializing Howler sound ${id}:`, e);
                // Howler hatasında HTML5'e düşmek yerine sesi atlayabiliriz veya HTML5 deneyebiliriz
                // this.loadHtml5Sound(id, src); // Opsiyonel fallback
             }
        } else {
             // Howler yoksa HTML5 Audio kullan
             this.loadHtml5Sound(id, src);
        }
    },

    // HTML5 Audio ile ses efekti yükle
    loadHtml5Sound(id, src) {
        try {
            this.sounds[id] = new Audio(src);
            this.sounds[id].volume = this.sfxVolume;
            this.sounds[id].preload = 'auto'; // Tarayıcıya bırak
            // Yükleme olaylarını dinlemek daha sağlam olabilir ama basit tutalım
             this.sounds[id].load(); // Yüklemeyi başlat
        } catch(e) {
             console.error(`Error loading sound ${id} with HTML5 Audio:`, e);
        }
    },


    // HTML5 Audio ile BGM yükleme (Fallback veya ana yöntem)
    loadHtml5Bgm(bgmSrc) {
         try {
            console.log("Loading BGM using HTML5 Audio element.");
            this.bgm = new Audio(bgmSrc);
            this.bgm.loop = true;
            this.bgm.volume = this.bgmVolume;
            this.bgm.preload = 'auto';
            this.bgm.addEventListener('error', (e) => {
                 console.error("HTML5 BGM loading/playback error:", e);
                 this.bgm = null; // Hata durumunda referansı temizle
            });
             this.bgm.addEventListener('canplaythrough', () => {
                  console.log("HTML5 BGM ready to play through.");
             });
             this.bgm.load(); // Yüklemeyi başlat
         } catch (e) {
             console.error("Error initializing HTML5 BGM element:", e);
             this.bgm = null;
         }
    },

    // Ses efekti çal
    playSound(id) {
        if (!this.isInitialized) return; // Henüz başlatılmadıysa çalma
        const sound = this.sounds[id];
        if (!sound) {
            console.warn(`Sound not found: ${id}`);
            return;
        }

        try {
            // Howler nesnesi mi?
            if (typeof Howl !== 'undefined' && sound instanceof Howl) {
                sound.volume(this.sfxVolume); // Her çalmadan önce sesi ayarla (Howler'da gerekli olmayabilir)
                sound.play();
            }
            // HTML5 Audio nesnesi mi?
            else if (sound instanceof Audio) {
                sound.volume = this.sfxVolume; // Sesi ayarla
                sound.currentTime = 0; // Başa sar (tekrar çalabilmek için)
                sound.play().catch(e => {
                     // Otomatik çalma engellenmiş olabilir
                     if (e.name === 'NotAllowedError') {
                          console.warn(`HTML5 Audio play blocked for "${id}" by browser. Requires user interaction.`);
                     } else {
                          console.error(`Error playing HTML5 sound "${id}":`, e);
                     }
                });
            } else {
                 console.error(`Invalid sound object type for ID: ${id}`);
            }
        } catch(e) {
             console.error(`General error playing sound ${id}:`, e);
        }
    },

    // Arka plan müziğini çal
    playBGM() {
        if (!this.isInitialized || !this.bgm) {
             console.warn("BGM cannot be played. Not initialized or loaded.");
             return;
        }

        try {
             // Howler nesnesi mi?
             if (typeof Howl !== 'undefined' && this.bgm instanceof Howl) {
                 if (!this.bgm.playing()) {
                    this.bgm.volume(this.bgmVolume); // Sesi ayarla
                    console.log("Attempting to play Howler BGM...");
                    this.bgm.play(); // Howler playerror olayını dinler
                 } else {
                     console.log("Howler BGM already playing.");
                 }
             }
             // HTML5 Audio nesnesi mi?
             else if (this.bgm instanceof Audio) {
                  // HTML5'te paused durumunu kontrol etmek daha güvenilir
                  if (this.bgm.paused) {
                      this.bgm.volume = this.bgmVolume; // Sesi ayarla
                      console.log("Attempting to play HTML5 BGM...");
                      this.bgm.play().then(() => {
                          console.log("HTML5 BGM Playing.");
                      }).catch(e => {
                           if (e.name === 'NotAllowedError') {
                                console.warn("HTML5 BGM play blocked by browser. Requires user interaction.");
                                // Burada kullanıcıya bir bildirim gösterilebilir.
                           } else {
                                console.error("Error playing HTML5 BGM:", e);
                           }
                      });
                  } else {
                      console.log("HTML5 BGM already playing.");
                       // Ses seviyesi değişmişse güncelle
                       if (this.bgm.volume !== this.bgmVolume) {
                            this.bgm.volume = this.bgmVolume;
                       }
                  }
             } else {
                  console.error("Invalid BGM object type.");
             }
         } catch (e) {
              console.error("General error playing BGM:", e);
         }
    },

    // Arka plan müziğini durdur
    stopBGM() {
        if (!this.isInitialized || !this.bgm) return;

        try {
            if (typeof Howl !== 'undefined' && this.bgm instanceof Howl) {
                this.bgm.stop();
                console.log("Howler BGM Stopped.");
            } else if (this.bgm instanceof Audio) {
                 this.bgm.pause();
                 this.bgm.currentTime = 0; // Başa sar
                 console.log("HTML5 BGM Stopped.");
            }
        } catch (e) {
             console.error("Error stopping BGM:", e);
        }
    },

    // Efekt ses seviyesini ayarla
    setSfxVolume(volume) {
        volume = Math.max(0, Math.min(1, parseFloat(volume) || 0)); // Güvenli değer (0-1)
        this.sfxVolume = volume;
         Utils.saveData('sfxVolume', volume); // Ayarı kaydet

        // Howler kullanılıyorsa global ses ayarı veya her ses için ayrı ayar gerekir.
        // Şimdilik playSound içinde ayarlamak yeterli.
        console.log("SFX Volume set to:", volume);
         // Ayarı test etmek için bir ses çal
         this.playSound('click');
    },

    // Müzik ses seviyesini ayarla
    setBgmVolume(volume) {
        volume = Math.max(0, Math.min(1, parseFloat(volume) || 0)); // Güvenli değer (0-1)
        this.bgmVolume = volume;

        if (this.isInitialized && this.bgm) {
             try {
                 if (typeof Howl !== 'undefined' && this.bgm instanceof Howl) {
                    this.bgm.volume(volume);
                 } else if (this.bgm instanceof Audio) {
                     this.bgm.volume = volume;
                 }
            } catch (e) {
                 console.error("Error setting BGM volume:", e);
            }
        }
         Utils.saveData('bgmVolume', volume); // Ayarı kaydet
         console.log("BGM Volume set to:", volume);
    }
};