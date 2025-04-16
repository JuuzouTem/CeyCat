    // js/recipes.js

    const Recipes = {
        "menemen": {
            id: "menemen",
            name: "Klasik Menemen",
            category: "breakfast", // Tarif kategorisi (Başarılar için)
            cuisine: "turkish", // Mutfak türü
            difficulty: 1,
            unlockScore: 0,
            maxPossibleScore: 800, // Puanlama için tahmini maks skor
            completionImage: "images/dishes/menemen_final.png",
            completionTitle: "Mis Gibi Menemen!",
            completionMessageBase: "Harika bir menemen yaptın Ceyda! Yanında sıcacık ekmekle mükemmel gider.",
            steps: [
                 { type: 'message', text: "Güne enerjik başlamak için lezzetli bir menemen yapalım mı? 🍳 Önce malzemeleri hazırlayalım!", catMood: 'excited' },
                 { type: 'select', instruction: "Tavaya biraz yağ ekleyelim. Sıvı yağı seç.", correct: 'oil', items: [{ id: 'oil', name: 'Sıvı Yağ', img: 'images/ingredients/oil.png' }, { id: 'butter', name: 'Tereyağ', img: 'images/ingredients/butter.png' }, { id: 'water', name: 'Su', img: 'images/ingredients/water.png' }], feedbackGood: "Harika! Yağ tavada.", catMood: 'pointing', score: 50 },
                 { type: 'minigame', minigame_type: 'chopping', instruction: "Şimdi biberleri doğrayalım!", itemsToChop: ['pepper'], clicksNeeded: { pepper: 6 }, timeLimit: 15, feedbackGood: "Biberler hazır!", catMood: 'chopping', scorePerClick: 10, bonusForCompletion: 50 },
                 { type: 'timed_choice', instruction: "Doğranmış biberleri tavaya ekle. Çabuk!", correct: 'chopped_pepper', items: [{ id: 'chopped_pepper', name: 'Doğranmış Biber', img: 'images/ingredients/pepper_chopped.png' }, { id: 'whole_pepper', name: 'Bütün Biber', img: 'images/ingredients/pepper.png' }], timeLimit: 8, feedbackGood: "Biberler kavruluyor...", catMood: 'working', scoreBase: 70 },
                 { type: 'minigame', minigame_type: 'chopping', instruction: "Sırada domatesler var, onları da doğra!", itemsToChop: ['tomato'], clicksNeeded: { tomato: 8 }, timeLimit: 20, feedbackGood: "Domatesler de tamam!", catMood: 'chopping', scorePerClick: 10, bonusForCompletion: 60 },
                 { type: 'sequence_selection', instruction: "Domatesleri eklemeden önce hangisini eklemek istersin? (İsteğe bağlı: Soğan veya Sarımsak - veya Hiçbiri)", correctSequence: [], // Boş bırakılabilir veya ['onion', 'tomato'] gibi
                    items: [
                        { id: 'chopped_tomato', name: 'Doğranmış Domates', img: 'images/ingredients/tomato_chopped.png', required: true }, // Gerekli öğe
                        { id: 'chopped_onion', name: 'Doğranmış Soğan', img: 'images/ingredients/onion_chopped.png' },
                        { id: 'garlic', name: 'Sarımsak', img: 'images/ingredients/garlic.png' }
                    ],
                    allowSkipOptional: true, // İsteğe bağlıları atlamaya izin ver
                    feedbackGood: "Malzemeler tavada buluştu!", catMood: 'happy', scorePerCorrect: 40, bonusForOrder: 20
                 },
                 { type: 'message', text: "Biraz pişmelerini bekleyelim... Kokusu geliyor mu?", catMood: 'waiting' },
                 { type: 'select', instruction: "Şimdi yumurtaları kıralım. Yumurtaları seç.", correct: 'eggs', items: [{ id: 'eggs', name: 'Yumurta', img: 'images/ingredients/eggs.png' }, { id: 'milk', name: 'Süt', img: 'images/ingredients/milk.png' }], feedbackGood: "Yumurtalar kırılmaya hazır!", catMood: 'pointing', score: 50 },
                 { type: 'minigame', minigame_type: 'mixing', instruction: "Yumurtaları ekleyip hızlıca karıştır!", duration: 10, targetClicksPerSecond: 2.5, feedbackGood: "İyice karıştı!", catMood: 'working', scoreMultiplier: 1.2, scoreBase: 100}, // Karıştırma mini oyunu (kneading benzeri olabilir)
                 { type: 'multi_select', instruction: "Son dokunuşlar! Tuz ve istediğin baharatları (Pul Biber, Karabiber) ekle.", required: ['salt'], optional: ['red_pepper_flakes', 'black_pepper'],
                    items: [
                        { id: 'salt', name: 'Tuz', img: 'images/ingredients/salt.png' },
                        { id: 'sugar', name: 'Şeker', img: 'images/ingredients/sugar.png' },
                        { id: 'red_pepper_flakes', name: 'Pul Biber', img: 'images/ingredients/red_pepper.png' },
                        { id: 'black_pepper', name: 'Karabiber', img: 'images/ingredients/black_pepper.png' }
                    ],
                    feedbackGood: "Lezzet tamamdır!", catMood: 'proud', scorePerRequired: 30, scorePerOptional: 15
                 },
                 { type: 'complete', text: "Veee Menemen hazır! Afiyet olsun Ceyda!", catMood: 'celebrate' }
            ]
        },
        "pizza_margherita": { // Önceki yanıttaki gibi ama detaylandırılmış
            id: "pizza_margherita",
            name: "Klasik Margherita Pizza",
            category: "main_course",
            cuisine: "italian",
            difficulty: 3,
            unlockScore: 300, // Menemen sonrası açılabilir
            maxPossibleScore: 1500,
            completionImage: "images/dishes/pizza_final.png",
            completionTitle: "İşte Gerçek İtalyan İşi!",
            completionMessageBase: "Harika bir Margherita Pizza yaptın Ceyda! Fırından yeni çıkmış kokusu muhteşem!",
            steps: [
                 { type: 'message', text: "Pizza zamanı! 🍕 İtalya'nın klasiği Margherita yapıyoruz. Önce hamur!", catMood: 'excited' },
                 { type: 'select', instruction: "Hamur için ana malzeme: Unu seç.", correct: 'flour', items: [{ id: 'flour', name: 'Un', img: 'images/ingredients/flour.png' }, { id: 'sugar', name: 'Şeker', img: 'images/ingredients/sugar.png' }], feedbackGood: "Un hazır!", catMood: 'pointing', score: 50 },
                 { type: 'multi_select', instruction: "Unun yanına Maya, Tuz ve Ilık Su ekle.", required: ['yeast', 'salt', 'warm_water'], optional: ['olive_oil'],
                    items: [
                        { id: 'yeast', name: 'Maya', img: 'images/ingredients/yeast.png' },
                        { id: 'salt', name: 'Tuz', img: 'images/ingredients/salt.png' },
                        { id: 'cold_water', name: 'Soğuk Su', img: 'images/ingredients/water.png' },
                        { id: 'warm_water', name: 'Ilık Su', img: 'images/ingredients/warm_water.png' },
                        { id: 'olive_oil', name: 'Zeytinyağı', img: 'images/ingredients/olive_oil.png' }
                    ],
                    feedbackGood: "Hamur malzemeleri tamam!", catMood: 'happy', scorePerRequired: 40, scorePerOptional: 20
                 },
                 { type: 'minigame', minigame_type: 'kneading', instruction: "Şimdi hamuru yoğur! Enerjini göster!", duration: 20, targetClicksPerSecond: 2, feedbackGood: "Harika bir hamur oldu!", catMood: 'working', scoreMultiplier: 1.5, scoreBase: 150 },
                 { type: 'timed_choice', instruction: "Hamurun mayalanması için üzerini ört. Ne kullanalım?", correct: 'stretch_film', items: [{ id: 'stretch_film', name: 'Streç Film', img: 'images/tools/stretch_film.png' }, { id: 'foil', name: 'Alüminyum Folyo', img: 'images/tools/foil.png' }, { id: 'towel', name: 'Temiz Bez', img: 'images/tools/towel.png' }], timeLimit: 10, feedbackGood: "Güzel! Biraz dinlensin.", catMood: 'waiting', scoreBase: 80 },
                 { type: 'message', text: "Hamur kabarırken sosu hazırlayalım. Domates ve fesleğen lazım.", catMood: 'thinking' },
                 { type: 'minigame', minigame_type: 'chopping', instruction: "Domatesleri ve fesleğeni doğra.", itemsToChop: ['tomato', 'basil'], clicksNeeded: { tomato: 8, basil: 4 }, timeLimit: 25, feedbackGood: "Sos malzemeleri hazır!", catMood: 'chopping', scorePerClick: 10, bonusForCompletion: 70 },
                 { type: 'drag_drop', // Sürükle bırak mini oyunu (Basit haliyle: doğru yere tıklama)
                    instruction: "Doğranmış domatesleri sos tenceresine taşı.",
                    draggableItem: { id: 'chopped_tomato_drag', name: 'Doğranmış Domates', img: 'images/ingredients/tomato_chopped.png' },
                    dropTarget: { id: 'saucepan', name: 'Sos Tenceresi', img: 'images/tools/saucepan.png' },
                    feedbackGood: "Domatesler tencerede!", catMood: 'working', scoreBase: 100
                 },
                 { type: 'message', text: "Sosu biraz pişirelim... Kısık ateşte.", catMood: 'waiting' },
                 { type: 'message', text: "Hamurumuz kabarmış olmalı! Şimdi açma zamanı.", catMood: 'excited' },
                  { type: 'minigame', minigame_type: 'rolling_pin', // Oklava ile açma mini oyunu
                     instruction: "Oklavayı kullanarak hamuru yuvarlak şekilde aç!",
                     targetShape: 'circle', // Hedef şekil
                     requiredAccuracy: 0.8, // Gerekli doğruluk (%80)
                     duration: 25,
                     feedbackGood: "Harika bir pizza tabanı!", catMood: 'proud', scoreBase: 120, scoreMultiplier: 1.8
                  },
                  { type: 'sequence_selection', instruction: "Sırayla malzemeleri ekle: Sos, Mozzarella, Fesleğen", correctSequence: ['sauce', 'mozzarella', 'basil_leaves'],
                     items: [
                         { id: 'sauce', name: 'Domates Sosu', img: 'images/ingredients/tomato_sauce.png' },
                         { id: 'ketchup', name: 'Ketçap', img: 'images/ingredients/ketchup.png' },
                         { id: 'mozzarella', name: 'Mozzarella', img: 'images/ingredients/mozzarella.png' },
                         { id: 'cheddar', name: 'Çedar Peyniri', img: 'images/ingredients/cheddar.png' },
                         { id: 'basil_leaves', name: 'Taze Fesleğen', img: 'images/ingredients/basil.png' }
                     ],
                     feedbackGood: "Malzemeler pizzanın üzerinde!", catMood: 'happy', scorePerCorrect: 50, bonusForOrder: 50
                  },
                  { type: 'timed_action', // Belirli sürede butona basma
                      instruction: "Pizzayı fırına verme zamanı! Tam ısınmışken 'Fırına Ver' butonuna bas!",
                      actionText: "Fırına Ver",
                      timeWindow: 3, // 3 saniyelik doğru zaman aralığı
                      totalDuration: 8, // 8 saniye içinde basılmalı
                      feedbackGood: "Tam zamanında fırında!", catMood: 'working', scoreBase: 100
                  },
                  { type: 'message', text: "Pişmesini bekliyoruz... Mis gibi kokular!", catMood: 'waiting'},
                  { type: 'complete', text: "İşte muhteşem pizzan hazır! Buon Appetito Ceyda!", catMood: 'celebrate' }
            ]
        },
         "lentil_soup": { // Mercimek Çorbası
             id: "lentil_soup",
             name: "Sıcacık Mercimek Çorbası",
             category: "soup",
             cuisine: "turkish",
             difficulty: 2,
             unlockScore: 100, // Menemen sonrası
             maxPossibleScore: 1000,
             completionImage: "images/dishes/lentil_soup_final.png",
             completionTitle: "İçini Isıtan Lezzet!",
             completionMessageBase: "Nefis bir mercimek çorbası oldu Ceyda! Limon ve nane ile harika gider.",
             isDessert: false, // Tatlı olmadığını belirtelim
             steps: [
                 { type: 'message', text: "Bugün içimizi ısıtacak klasik bir mercimek çorbası yapalım mı? 🥣", catMood: 'happy' },
                 { type: 'select', instruction: "Önce tencereye yıkanmış mercimekleri koyalım.", correct: 'lentils', items: [{ id: 'lentils', name: 'Mercimek', img: 'images/ingredients/lentils.png' }, { id: 'rice', name: 'Pirinç', img: 'images/ingredients/rice.png' }, { id: 'bulgur', name: 'Bulgur', img: 'images/ingredients/bulgur.png' }], feedbackGood: "Mercimekler tencerede!", catMood: 'pointing', score: 60 },
                 { type: 'multi_select', instruction: "Lezzet için Soğan ve Havuç ekleyebiliriz (isteğe bağlı).", optional: ['onion_chopped', 'carrot_chopped'], required: [], // Zorunlu değil
                    items: [
                        { id: 'onion_chopped', name: 'Doğranmış Soğan', img: 'images/ingredients/onion_chopped.png' },
                        { id: 'carrot_chopped', name: 'Doğranmış Havuç', img: 'images/ingredients/carrot_chopped.png' },
                        { id: 'potato_chopped', name: 'Doğranmış Patates', img: 'images/ingredients/potato_chopped.png' } // Patates de olabilir
                    ],
                    feedbackGood: "Ekstra lezzetler de geldi!", catMood: 'thinking', scorePerOptional: 30
                 },
                 { type: 'select', instruction: "Üzerine sıcak suyu ekleyelim.", correct: 'hot_water', items: [{ id: 'hot_water', name: 'Sıcak Su', img: 'images/ingredients/hot_water.png' }, { id: 'cold_water', name: 'Soğuk Su', img: 'images/ingredients/water.png' }, { id: 'broth', name: 'Et/Tavuk Suyu', img: 'images/ingredients/broth.png' }], feedbackGood: "Su da tamam, şimdi pişmeye bırakalım.", catMood: 'working', score: 70 },
                 { type: 'message', text: "Mercimekler ve sebzeler yumuşayana kadar pişireceğiz.", catMood: 'waiting' },
                 { type: 'select', instruction: "Çorbayı pürüzsüz hale getirmek için hangi aleti kullanalım?", correct: 'blender', items: [{ id: 'blender', name: 'El Blenderı', img: 'images/tools/blender.png' }, { id: 'whisk', name: 'Çırpıcı', img: 'images/tools/whisk.png' }, { id: 'fork', name: 'Çatal', img: 'images/tools/fork.png' }], feedbackGood: "Blender hazır!", catMood: 'pointing', score: 80 },
                 { type: 'minigame', minigame_type: 'blending', // Blender mini oyunu
                    instruction: "Blenderı çalıştır ve çorbayı pürüzsüz hale getir! Düğmeye basılı tut.",
                    holdDuration: 8, // 8 saniye basılı tutma
                    feedbackGood: "Vızzz! İpek gibi çorba oldu!", catMood: 'working', scoreBase: 150, scoreMultiplier: 1.6
                 },
                  { type: 'message', text: "Ayrı bir tavada yağda nane ve pul biber yakıp üzerine gezdirebilirsin. Bu, çorbaya harika bir aroma katar!", catMood: 'idea' },
                   { type: 'multi_select', instruction: "Sosu hazırlamak için Yağ, Nane ve Pul Biberi seç.", required: ['oil_sauce', 'mint', 'red_pepper_flakes_sauce'], optional: [],
                     items: [
                          { id: 'oil_sauce', name: 'Sıvı Yağ (Sos için)', img: 'images/ingredients/oil.png' },
                          { id: 'butter_sauce', name: 'Tereyağ (Sos için)', img: 'images/ingredients/butter.png' },
                          { id: 'mint', name: 'Kuru Nane', img: 'images/ingredients/mint.png' },
                          { id: 'red_pepper_flakes_sauce', name: 'Pul Biber (Sos için)', img: 'images/ingredients/red_pepper.png' },
                          { id: 'salt_sauce', name: 'Tuz (Sos için)', img: 'images/ingredients/salt.png' }
                     ],
                     feedbackGood: "Sos malzemeleri hazır!", catMood: 'happy', scorePerRequired: 40
                   },
                   { type: 'timed_action',
                       instruction: "Yağı kızdırıp baharatları ekle, yanmadan ocaktan al! 'Al' butonuna tam zamanında bas.",
                       actionText: "Ocaktan Al",
                       timeWindow: 2, // 2 saniyelik aralık
                       totalDuration: 7,
                       feedbackGood: "Tam kıvamında sos!", catMood: 'proud', scoreBase: 120
                   },
                 { type: 'complete', text: "İşte sıcacık, şifa dolu mercimek çorbamız hazır! Limon sıkmayı unutma!", catMood: 'celebrate' }
             ]
         },
        // --- Daha Fazla Tarif Eklenebilir ---
        // Örnek: Basit Kurabiye (Tatlı)
         "simple_cookies": {
             id: "simple_cookies",
             name: "Şef Kedi'nin Basit Kurabiyesi",
             category: "dessert", // Tatlı kategorisi
             cuisine: "international",
             difficulty: 2,
             unlockScore: 600, // Biraz daha ileride
             maxPossibleScore: 1200,
             completionImage: "images/dishes/cookies_final.png",
             completionTitle: "Tatlı Anlar!",
             completionMessageBase: "Yumuşacık kurabiyelerin harika kokuyor Ceyda! Sütle birlikte çok iyi gider.",
             isDessert: true, // Tatlı olduğunu belirt
             steps: [
                 { type: 'message', text: "Tatlı bir mola zamanı! 🍪 Kolay ve lezzetli kurabiyeler yapalım.", catMood: 'happy' },
                  { type: 'multi_select', instruction: "Kuru malzemeleri bir kapta birleştir: Un, Kabartma Tozu, Tuz.", required: ['flour_cookie', 'baking_powder', 'salt_cookie'], optional: ['cinnamon'],
                     items: [
                         { id: 'flour_cookie', name: 'Un', img: 'images/ingredients/flour.png' },
                         { id: 'baking_soda', name: 'Karbonat', img: 'images/ingredients/baking_soda.png' },
                         { id: 'baking_powder', name: 'Kabartma Tozu', img: 'images/ingredients/baking_powder.png' },
                         { id: 'salt_cookie', name: 'Tuz', img: 'images/ingredients/salt.png' },
                         { id: 'cinnamon', name: 'Tarçın', img: 'images/ingredients/cinnamon.png' }
                     ],
                     feedbackGood: "Kuru malzemeler hazır!", catMood: 'pointing', scorePerRequired: 30, scorePerOptional: 15
                  },
                   { type: 'minigame', minigame_type: 'mixing', instruction: "Ayrı bir kapta Tereyağ ve Şekeri çırp!", itemsToMix: ['butter_room_temp', 'sugar_cookie'], // Görsel olarak gösterilebilir
                      duration: 15, targetClicksPerSecond: 2, feedbackGood: "Krema gibi oldu!", catMood: 'working', scoreBase: 100, scoreMultiplier: 1.4
                   },
                   { type: 'timed_choice', instruction: "Karışıma Yumurta ekle. Doğru olanı seç!", correct: 'egg_cookie', items: [{ id: 'egg_cookie', name: 'Yumurta', img: 'images/ingredients/eggs.png' }, { id: 'milk_cookie', name: 'Süt', img: 'images/ingredients/milk.png' }], timeLimit: 8, feedbackGood: "Yumurta da eklendi.", catMood: 'happy', scoreBase: 70 },
                   { type: 'message', text: "Şimdi kuru malzemeleri yavaş yavaş ıslak karışıma ekleyip karıştıralım.", catMood: 'thinking' },
                    { type: 'select', instruction: "Karıştırmak için hangi aleti kullanalım?", correct: 'spatula', items: [{ id: 'spatula', name: 'Spatula', img: 'images/tools/spatula.png' }, { id: 'whisk_cookie', name: 'Çırpıcı', img: 'images/tools/whisk.png' }], feedbackGood: "Spatula ile nazikçe karıştıralım.", catMood: 'pointing', score: 50 },
                     { type: 'multi_select', instruction: "İsteğe bağlı: Damla Çikolata veya Kuru Üzüm ekleyebilirsin!", optional: ['chocolate_chips', 'raisins'], required: [],
                        items: [
                           { id: 'chocolate_chips', name: 'Damla Çikolata', img: 'images/ingredients/chocolate_chips.png' },
                           { id: 'raisins', name: 'Kuru Üzüm', img: 'images/ingredients/raisins.png' },
                           { id: 'nuts', name: 'Fındık/Ceviz', img: 'images/ingredients/nuts.png' }
                        ],
                       feedbackGood: "Ekstra lezzetler harika!", catMood: 'excited', scorePerOptional: 40
                     },
                     { type: 'minigame', minigame_type: 'shaping', // Şekil verme mini oyunu
                         instruction: "Hamurdan toplar yapıp tepsiye diz! Tıklayarak yerleştir.",
                         itemsToPlace: 8, // 8 kurabiye
                         targetArea: 'baking_sheet', // Tepsi görseli
                         timeLimit: 30,
                         feedbackGood: "Kurabiyeler tepside, fırına hazır!", catMood: 'proud', scorePerPlacement: 15, bonusForCompletion: 50
                     },
                     { type: 'message', text: "Önceden ısıtılmış fırında pişirelim...", catMood: 'waiting' },
                     { type: 'complete', text: "Kurabiyeler pişti! Ev mis gibi koktu! Biraz soğumasını bekle Ceyda.", catMood: 'celebrate' }
             ]
         },

        // Final Challenge (Örnek)
        "final_challenge": {
            id: "final_challenge",
            name: "Şef Kedi'nin Gurme Sınavı",
            category: "challenge",
            difficulty: 5,
            unlockScore: 2500, // Yüksek skor gerektirir
            maxPossibleScore: 3000,
            isChallenge: true,
            completionImage: "images/dishes/feast.png",
            completionTitle: "MUTFAĞIN YILDIZI SENSİN!",
            completionMessageBase: "İnanılmaz! Tüm bu zorlu görevleri başardın Ceyda! Sen gerçek bir gurmesin. Unutma, kendine iyi bakmak ve keyif almak en lezzetli tarif!",
            steps: [
                { type: 'message', text: "Hazır mısın Ceyda? Bu son sınav! Hızını ve becerini gösterme zamanı!", catMood: 'excited' },
                // Rastgele seçilmiş mini oyunlar veya daha zorlu versiyonlar
                { type: 'minigame', minigame_type: 'rapid_chopping', instruction: "Süper hızlı doğrama! 3 farklı sebzeyi 30 saniyede doğra!", itemsToChop: ['carrot', 'onion', 'pepper'], clicksNeeded: { carrot: 7, onion: 5, pepper: 6 }, timeLimit: 30, feedbackGood: "Ninja gibi doğradın!", catMood: 'surprised', scorePerClick: 12, bonusForCompletion: 150 },
                { type: 'timed_sequence', instruction: "Doğru sırayla 5 malzemeyi 15 saniyede seç!", sequence: ['flour', 'eggs', 'milk', 'sugar', 'butter'], timeLimit: 15, feedbackGood: "Hafızan ve hızın harika!", catMood: 'proud', scorePerCorrect: 40, bonusForOrder: 100 },
                // Belki 2 adımı aynı anda yönetme? (UI'ı karmaşıklaştırır)
                { type: 'multi_task', instruction: "Bir yandan sosu karıştırırken (tıkla), diğer yandan fırın sıcaklığını ayarla (kaydırıcı)!", tasks: [{type: 'mixing', duration: 15}, {type: 'temperature_control', target: 180}], feedbackGood: "Aynı anda iki iş! Harikasın!", catMood: 'celebrate', scoreBase: 300},
                { type: 'complete', text: "Başardın! Tüm sınavları geçtin! Sen mutfağın kraliçesisin!", catMood: 'celebrate' } // Özel kutlama animasyonu
            ]
        }
    };