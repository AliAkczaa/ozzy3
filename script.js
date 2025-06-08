    // === Firebase Configuration (Musisz Zastąpić Własnymi Kluczami!) ===
    // Przejdź do Firebase Console -> Twój Projekt -> Ustawienia projektu (zębatka) -> Dodaj aplikację (ikona </> dla web)
    // Skopiuj obiekt firebaseConfig i wklej go tutaj:
    const firebaseConfig = {
        apiKey: "AIzaSyASSmHw3LVUu7lSql0QwGmmBcFkaNeMups", // Twoje klucze Firebase
        authDomain: "ozzy-14c19.firebaseapp.com",
        projectId: "ozzy-14c19",
        storageBucket: "ozzy-14c19.firebasestorage.app",
        messagingSenderId: "668337469201",
        appId: "1:668337469201:web:cd9d84d45c93d9b6e3feb0"
    };

    // === ZMIENIONO: Importy modularne Firebase SDK v9 ===
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
    import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js'; // Usunięto serverTimestamp, bo nie jest bezpośrednio importowany, ale używany w kodzie
    import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js'; 
    import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js'; 

    // Inicjalizacja Firebase (teraz używamy modularnych funkcji)
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app); 
    const functions = getFunctions(app); 
    const submitScoreFunction = httpsCallable(functions, 'submitScore'); // Odwołanie do naszej funkcji chmurowej

    // ===================================================================

    // Pobieranie referencji do elementów DOM
    const backgroundTractor = document.getElementById('animated-background-tractor');
    const ozzyContainer = document.getElementById('ozzy-container'); 
    const ozzyImage = document.getElementById('ozzy-image'); 
    const healthBarFill = document.getElementById('health-bar-fill'); 
    const scoreDisplay = document.getElementById('score');
    const messageDisplay = document.getElementById('message-display'); // Do ogólnych komunikatów (np. "Stonks silniejszy")
    const gameContainer = document.getElementById('game-container');

    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const nicknameInput = document.getElementById('nickname-input');
    const showLeaderboardButton = document.getElementById('show-leaderboard-button');

    let playerNickname = "Gracz";

    const endScreen = document.getElementById('end-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const showLeaderboardAfterGameButton = document.getElementById('show-leaderboard-after-game-button'); 

    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const leaderboardList = document.getElementById('leaderboard-list');
    const backToStartButton = document.getElementById('back-to-start-button');

    // Referencja do wyświetlania poziomu
    const currentLevelDisplay = document.getElementById('current-level');

    let score = 0; 
    let ozzyHealth = 100; 
    let INITIAL_OZZY_HEALTH = 100; 
    let PUNCH_DAMAGE = 10; // Zmieniono na let, bo będzie modyfikowane przez Szał Bojowy i ulepszenia
    let currentUserId = null; 
    let isGameActive = false; 

    // Zmienna dla aktualnego poziomu
    let currentLevel = 0;
    // Flaga do oznaczania walki z bossem
    let isBossFight = false;

    // --- Referencje i zmienne dla obrazków cytatów ---
    const quoteImagesContainer = document.getElementById('quote-images-container');
    const quoteImagePaths = [
        '1.png', '2.png', '3.png', 
        '4.png', '5.png', '6.png',
        '7.png', '8.png', '9.png',
        '10.png', '11.png', '12.png',
        '13.png', '14.png', '15.png',
        '16.png', '17.png', '18.png',
        '19.png', '20.png', '21.png',
        '22.png', '23.png', '24.png',
        '25.png', '26.png', '27.png',
        '28.png'
    ];
    const QUOTE_DISPLAY_DURATION_MS = 2000;
    const QUOTE_SIZE_PX = 150;

    // --- Elementy i zmienne dla supermocy ---
    const superpowerButtonsContainer = document.getElementById('superpower-buttons-container');
    const btnLightning = document.getElementById('btn-lightning');
    const btnFreeze = document.getElementById('btn-freeze'); 
    const btnFrenzy = document.getElementById('btn-frenzy');

    // Oryginalne teksty przycisków (do wyświetlania po zakończeniu cooldownu)
    const originalLightningText = '⚡ Piorun Zagłady';
    const originalFreezeText = '❄️ Lodowy Wybuch';
    const originalFrenzyText = '🔥 Szał Bojowy';


    const lightningEffect = document.getElementById('lightning-effect');
    const freezeEffect = document.getElementById('freeze-effect'); 
    const frenzyEffect = document.getElementById('frenzy-effect');

    const PUNCHES_PER_POWERUP = 10; // Ile uderzeń do aktywacji supermocy (próg)

    const COOLDOWN_DURATION_MS = 60 * 1000; // 60 sekund

    let lastUsedLightningTime = 0; // Timestamp ostatniego użycia Pioruna
    let lastUsedFreezeTime = 0; // Timestamp ostatniego użycia Lodowego Wybuchu
    let lastUsedFrenzyTime = 0; // Timestamp ostatniego użycia Szału Bojowego

    let frenzyModeActive = false;
    let frenzyTimerId;
    const FRENZY_DAMAGE_MULTIPLIER = 3; // Np. 3 razy większe obrażenia
    const FRENZY_DURATION_MS = 5000; // Czas trwania Szału Bojowego (5 sekund)

    // Zmieniono na zmienne dynamiczne (będą skalowane przez ulepszenia)
    let LIGHTNING_BASE_DAMAGE = 150; // Zmniejszone z 450 do 150, skalowalne
    let ICE_BLAST_INITIAL_DAMAGE = 50; 
    let ICE_BLAST_DOT_DAMAGE_PER_SECOND = 25; 
    const ICE_BLAST_DOT_DURATION_SECONDS = 5; 
    let FRENZY_INITIAL_DAMAGE = 30;

    let superpowerCooldownIntervalId; // ID dla setInterval do aktualizacji timerów

    let freezeModeActive = false;
    let freezeDotIntervalId;

    // Ścieżki do obrazków Stonksa (normalnego i bossa)
    const ORIGINAL_OZZY_IMAGE_URL = 'zdjecie 2.jpg';
    const BOSS_IMAGE_URL = 'stonksboss.png'; // Użyj grafiki stonksboss.png

    // Wartości zdrowia dla normalnego Stonksa i Bossa
    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    const NORMAL_OZZY_HEALTH_INCREMENT = 20; // Zwiększenie zdrowia dla normalnego Stonksa co 5 zabic
    const BOSS_INITIAL_HEALTH = 450; // Zwiększone o 50% względem 300 -> 450

    // Modyfikatory prędkości i kwestie dla bossa
    const BOSS_MOVEMENT_SPEED = 2; // Szybkość ruchu bossa (piksele na klatkę animacji)
    const BOSS_QUOTES = [
        "CHLOPY OD CRYPTONA FARMIA!",
        "TTB TO GÓWNO! TYLKO STONKS!",
        "DO DUBAJU! ZA KASE INWESTORÓW!",
        "Jeden launchpad, jeden bot, jeden dex!",
        "Farmer z bsc tom pisze ze to ja jestem scammerem"
    ];
    let bossMovementAnimationFrameId; // Zmieniono z IntervalId na AnimationFrameId
    let bossDx = BOSS_MOVEMENT_SPEED; // Kierunek ruchu bossa (początkowo w prawo)
    let bossCurrentTransformX = 0; // NOWE: Śledzi wartość translateX dla bossa

    // --- Referencje do elementów audio ---
    const backgroundMusic = document.getElementById('background-music');
    const punchSound = document.getElementById('punch-sound'); 

    // --- Maksymalny wynik po stronie klienta (anti-cheat) ---
    const CLIENT_SIDE_MAX_SCORE = 200; 

    // --- NOWE: Elementy i zmienne dla systemu ulepszeń ---
    const shopButton = document.getElementById('shop-button');
    const upgradeShopScreen = document.getElementById('upgrade-shop-screen');
    const closeShopButton = document.getElementById('close-shop-button');

    const baseDamageLevelDisplay = document.getElementById('base-damage-level');
    const baseDamageCostDisplay = document.getElementById('base-damage-cost');
    const buyBaseDamageButton = document.getElementById('buy-base-damage');

    const lightningDamageLevelDisplay = document.getElementById('lightning-damage-level');
    const lightningDamageCostDisplay = document.getElementById('lightning-damage-cost');
    const buyLightningDamageButton = document.getElementById('buy-lightning-damage');

    const freezeDamageLevelDisplay = document.getElementById('freeze-damage-level');
    const freezeDamageCostDisplay = document.getElementById('freeze-damage-cost');
    const buyFreezeDamageButton = document.getElementById('buy-freeze-damage');

    const frenzyDamageLevelDisplay = document.getElementById('frenzy-damage-level');
    const frenzyDamageCostDisplay = document.getElementById('frenzy-damage-cost');
    const buyFrenzyDamageButton = document.getElementById('buy-frenzy-damage');

    // Zmienne stanu ulepszeń
    let upgradeLevels = {
        baseDamage: 1,
        lightningDamage: 1,
        freezeDamage: 1,
        frenzyDamage: 1
    };

    // Koszty i modyfikatory ulepszeń (do dostosowania!)
    const UPGRADE_COST_BASE = 10;
    const UPGRADE_COST_MULTIPLIER = 1.5; // Koszt rośnie o 50% za każdy poziom
    const DAMAGE_INCREASE_PER_LEVEL = 5; // Zwiększenie bazowych obrażeń o 5 na poziom

    const LIGHTNING_DAMAGE_INCREASE_PER_LEVEL = 30; // Piorun: zwiększenie obrażeń o 30
    const FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL = 10; // Freeze: zwiększenie początkowych obrażeń o 10
    const FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL = 5; // Freeze: zwiększenie obrażeń DOT o 5
    const FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL = 15; // Frenzy: zwiększenie początkowych obrażeń o 15


    // --- Funkcje Leaderboarda ---
    async function saveScoreToLeaderboard(nickname, score) {
        console.log("saveScoreToLeaderboard wywołane z nickiem:", nickname, "wynikiem:", score); 
        if (score > CLIENT_SIDE_MAX_SCORE) {
            showMessage("Spierdalaj frajerze cheaterze! Wynik nierealny!", 3000); 
            console.warn(`Próba zapisu nierealnego wyniku (${score}) przez ${nickname}. Zablokowano po stronie klienta.`);
            setTimeout(resetGame, 3000); 
            return; 
        }

        if (score > 0 && currentUserId) { 
            try {
                // Dodano Timestamp dla sortowania w Firestore
                const result = await submitScoreFunction({ nickname: nickname, score: score });
                console.log("Odpowiedź z funkcji chmurowej:", result.data);
                showMessage(result.data.message, 2000); 
            } catch (error) {
                console.error("Błąd podczas wywoływania funkcji chmurowej:", error.code, error.message);
                showMessage(`Błąd zapisu: ${error.message}`, 3000); 
            }
        } else if (!currentUserId) { 
            console.warn("Nie można zapisać wyniku: Użytkownik nie jest uwierzytelniony. Sprawdź konfigurację Firebase Auth.");
            showMessage("Błąd: Brak uwierzytelnienia do zapisu wyniku.", 3000);
        }
    }

    async function fetchAndDisplayLeaderboard() {
        console.log("fetchAndDisplayLeaderboard wywołane."); 
        leaderboardList.innerHTML = ''; // Wyczyść listę przed załadowaniem
        try {
            const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), orderBy("timestamp", "asc"), limit(10));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                leaderboardList.innerHTML = '<li>Brak wyników w rankingu. Bądź pierwszy!</li>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.textContent = `${data.nickname || 'Anonim'}: ${data.score} znokautowań`;
                leaderboardList.appendChild(li);
            });
        } catch (e) {
            console.error("Błąd podczas pobierania rankingu: ", e);
            leaderboardList.innerHTML = '<li>Wystąpił błąd podczas ładowania rankingu.</li>';
        }
    }

    // --- Funkcje Cytatów ---
    function spawnRandomQuote() {
        const randomImagePath = quoteImagePaths[Math.floor(Math.random() * quoteImagePaths.length)];
        
        const img = document.createElement('img');
        img.src = randomImagePath;
        img.classList.add('quote-image'); // Klasa dla stylizacji CSS
        
        // Losowa pozycja w obrębie gameContainer, ale unikając krawędzi
        const gameContainerRect = gameContainer.getBoundingClientRect();
        const maxX = gameContainerRect.width - QUOTE_SIZE_PX;
        const maxY = gameContainerRect.height - QUOTE_SIZE_PX;

        // Upewnij się, że nie wychodzi poza kontener i ma trochę marginesu
        const randomX = Math.random() * Math.max(0, maxX);
        const randomY = Math.random() * Math.max(0, maxY);
        
        img.style.left = `${randomX}px`;
        img.style.top = `${randomY}px`;

        // Losowy kąt obrotu (-45 do +45 stopni)
        const randomRotation = Math.random() * 90 - 45; // Losuje od -45 do 45
        img.style.transform = `rotate(${randomRotation}deg)`;

        quoteImagesContainer.appendChild(img);

        // Aktywuj animację pojawiania się
        setTimeout(() => {
            img.classList.add('active');
        }, 10); // Małe opóźnienie, aby CSS transition zadziałało

        // Ustaw czas zniknięcia
        setTimeout(() => {
            img.classList.remove('active'); // Rozpocznij animację znikania
            setTimeout(() => {
                img.remove(); // Usuń element z DOM po zakończeniu animacji
            }, 500); // Czas trwania animacji opactiy
        }, QUOTE_DISPLAY_DURATION_MS);
    }

    // --- Funkcja: Ujednolicone zadawanie obrażeń ---
    function applyDamageToOzzy(damageAmount) {
        ozzyHealth -= damageAmount;
        ozzyHealth = Math.max(0, ozzyHealth);
        updateHealthBar();
        if (ozzyHealth <= 0) {
            handleOzzyKnockout();
        }
    }

    // --- Funkcje supermocy ---
    function updateSuperpowerButtons() {
        const now = Date.now();

        // Sprawdź próg uderzeń ORAZ cooldown dla każdego przycisku
        const canUseLightning = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) && 
                                ((now - lastUsedLightningTime >= COOLDOWN_DURATION_MS) || lastUsedLightningTime === 0) && 
                                isGameActive;
        
        const canUseFreeze = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) && 
                             ((now - lastUsedFreezeTime >= COOLDOWN_DURATION_MS) || lastUsedFreezeTime === 0) && 
                             isGameActive;
        
        const canUseFrenzy = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) && 
                             ((now - lastUsedFrenzyTime >= COOLDOWN_DURATION_MS) || lastUsedFrenzyTime === 0) && 
                             isGameActive;

        btnLightning.disabled = !canUseLightning;
        btnFreeze.disabled = !canUseFreeze;
        btnFrenzy.disabled = !canUseFrenzy;

        // Kontener przycisków jest klikalny, jeśli którykolwiek przycisk jest aktywny
        if (canUseLightning || canUseFreeze || canUseFrenzy) {
            superpowerButtonsContainer.style.pointerEvents = 'auto'; 
        } else {
            superpowerButtonsContainer.style.pointerEvents = 'none';
        }

        // Aktualizuj wyświetlanie cooldownów
        updateSuperpowerCooldownDisplays();
    }

    // Aktualizuje tekst na przyciskach supermocy o pozostały czas cooldownu
    function updateSuperpowerCooldownDisplays() {
        const now = Date.now();

        const updateButtonText = (button, lastUsedTime, originalText) => {
            // Jeśli gra nieaktywna lub przycisk jest aktywny (dostępny), wyświetl oryginalny tekst
            if (!isGameActive || (!button.disabled && lastUsedTime === 0)) {
                 button.textContent = originalText;
                 return;
            }

            const timeLeft = Math.ceil((lastUsedTime + COOLDOWN_DURATION_MS - now) / 1000);
            if (timeLeft > 0) {
                button.textContent = `${timeLeft}s`;
            } else {
                button.textContent = originalText; // Cooldown minął, pokaż oryginalny tekst
            }
        };

        updateButtonText(btnLightning, lastUsedLightningTime, originalLightningText);
        updateButtonText(btnFreeze, lastUsedFreezeTime, originalFreezeText);
        updateButtonText(btnFrenzy, lastUsedFrenzyTime, originalFrenzyText);
    }


    function activateLightningStrike() {
        if (!isGameActive || btnLightning.disabled) return;

        showMessage("PIORUN ZAGŁADY!", 1500);
        punchesSinceLastPowerup = 0; // Resetuj licznik uderzeń
        lastUsedLightningTime = Date.now(); // Ustaw czas ostatniego użycia
        updateSuperpowerButtons(); // Zablokuj przyciski i zaktualizuj timery

        // Oblicz obrażenia pioruna na podstawie poziomu ulepszenia
        const actualLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage - 1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualLightningDamage); // Zadaj obrażenia

        // Efekt wizualny błyskawicy (generowany kodem)
        const segments = 10; // Liczba segmentów błyskawicy
        const ozzyRect = ozzyContainer.getBoundingClientRect();
        const startX = ozzyRect.left + ozzyRect.width / 2;
        const startY = ozzyRect.top - 50; // Zaczyna się nad Ozzym

        for (let i = 0; i < segments; i++) {
            const segment = document.createElement('div');
            segment.classList.add('lightning-segment');
            
            const length = Math.random() * 50 + 30; // Długość segmentu
            const angle = Math.random() * 40 - 20; // Kąt odchylenia
            const width = Math.random() * 5 + 3; // Grubość segmentu

            segment.style.width = `${width}px`;
            segment.style.height = `${length}px`;
            segment.style.left = `${startX + (Math.random() - 0.5) * 50}px`; // Losowe przesunięcie
            segment.style.top = `${startY + i * (ozzyRect.height / segments) + (Math.random() - 0.5) * 20}px`;
            segment.style.transform = `rotate(${angle}deg)`;
            segment.style.transformOrigin = `center top`; // Obracaj od góry

            lightningEffect.appendChild(segment);
        }

        lightningEffect.classList.remove('hidden');
        
        setTimeout(() => {
            lightningEffect.classList.add('hidden');
            lightningEffect.innerHTML = ''; // Usuń segmenty
        }, 1000); // Czas trwania efektu
    }

    function activateIceBlast() { 
        if (!isGameActive || btnFreeze.disabled) return;

        showMessage("LODOWY WYBUCH!", 1500);
        punchesSinceLastPowerup = 0; // Resetuj licznik uderzeń
        lastUsedFreezeTime = Date.now(); // Ustaw czas ostatniego użycia
        updateSuperpowerButtons(); // Zablokuj przyciski i zaktualizuj timery

        // Oblicz obrażenia Lodowego Wybuchu na podstawie poziomu ulepszenia
        const actualIceBlastInitialDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
        const actualIceBlastDotDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;

        // Usuwamy hidden, dodajemy active
        freezeEffect.classList.remove('hidden');
        freezeEffect.classList.add('active'); // Aktywuje efekty CSS na czas trwania

        applyDamageToOzzy(actualIceBlastInitialDamage); // Zadaj początkowe obrażenia

        freezeModeActive = true; // Aktywuj tryb zamrożenia
        let dotTicks = 0;
        const maxDotTicks = ICE_BLAST_DOT_DURATION_SECONDS;

        // Rozpocznij zadawanie obrażeń co sekundę i spawning kryształków
        clearInterval(freezeDotIntervalId); // Upewnij się, że poprzedni interwał jest wyczyszczony
        freezeDotIntervalId = setInterval(() => {
            if (!isGameActive) { // Sprawdź, czy gra nadal aktywna
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; // Deaktywuj tryb zamrożenia
                freezeEffect.classList.remove('active'); // Usuń klasę efektu wizualnego
                freezeEffect.innerHTML = ''; // Usuń kryształki
                return;
            }
            applyDamageToOzzy(actualIceBlastDotDamage);
            dotTicks++;

            // Spawn new shards each second around Ozzy
            const ozzyRect = ozzyContainer.getBoundingClientRect();
            for (let i = 0; i < 5; i++) { // Spawn a few new shards each tick
                const shard = document.createElement('div');
                shard.classList.add('ice-shard');
                // Random position within Ozzy's container
                shard.style.left = `${ozzyRect.left + Math.random() * ozzyRect.width}px`;
                shard.style.top = `${ozzyRect.top + Math.random() * ozzyRect.height}px`;
                freezeEffect.appendChild(shard);
                // Remove old shards after their animation (1s defined in CSS)
                setTimeout(() => {
                    shard.remove();
                }, 1000); 
            }

            if (dotTicks >= maxDotTicks) {
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; // Deaktywuj tryb zamrożenia
                freezeEffect.classList.remove('active'); // Usuń klasę efektu wizualnego
                freezeEffect.innerHTML = ''; // Upewnij się, że wszystkie kryształki są usunięte na koniec
                showMessage("Lodowy Wybuch osłabł.", 1000); // Komunikat o zakończeniu efektu
            }
        }, 1000); // Co sekundę
    }

    function activateFrenzy() {
        if (!isGameActive || btnFrenzy.disabled) return;

        showMessage("SZAŁ BOJOWY!", 1500);
        punchesSinceLastPowerup = 0; // Resetuj licznik uderzeń
        lastUsedFrenzyTime = Date.now(); // Ustaw czas ostatniego użycia
        updateSuperpowerButtons(); // Zablokuj przyciski i zaktualizuj timery

        // Oblicz początkowe obrażenia Szału Bojowego na podstawie poziomu ulepszenia
        const actualFrenzyInitialDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualFrenzyInitialDamage); // Zadaj początkowe obrażenia

        frenzyModeActive = true;
        PUNCH_DAMAGE *= FRENZY_DAMAGE_MULTIPLIER; // Zwiększ obrażenia od uderzeń
        frenzyEffect.classList.remove('hidden');
        frenzyEffect.classList.add('active');

        clearTimeout(frenzyTimerId); // Upewnij się, że poprzedni timer szału jest wyczyszczony
        frenzyTimerId = setTimeout(() => {
            frenzyModeActive = false;
            PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL; // Przywróć normalne obrażenia (ale uwzględnij ulepszenie bazowe)
            frenzyEffect.classList.add('hidden');
            frenzyEffect.classList.remove('active');
            showMessage("Szał minął. Normalne uderzenia.", 1500);
        }, FRENZY_DURATION_MS);
    }


    // --- Funkcja do animacji ruchu bossa ---
    function animateBossMovement() {
        if (!isGameActive || !isBossFight) {
            cancelAnimationFrame(bossMovementAnimationFrameId); // Użyj cancelAnimationFrame
            return;
        }

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const ozzyRect = ozzyContainer.getBoundingClientRect(); // Aktualny rozmiar i pozycja kontenera bossa

        // Oblicz potencjalną nową wartość transformX
        let nextTransformX = bossCurrentTransformX + bossDx;

        // Definiuj granice dla nextTransformX na podstawie kontenera i szerokości Ozzy'ego
        // maxOffsetRight to maksymalne przesunięcie w prawo, tak aby prawa krawędź Ozzy'ego dotykała prawej krawędzi kontenera
        const maxOffsetRight = (gameContainerRect.width / 2) - (ozzyRect.width / 2);
        // maxOffsetLeft to maksymalne przesunięcie w lewo, tak aby lewa krawędź Ozzy'ego dotykała lewej krawędzi kontenera
        const maxOffsetLeft = -((gameContainerRect.width / 2) - (ozzyRect.width / 2));

        // Sprawdzenie kolizji i zmiana kierunku
        if (nextTransformX > maxOffsetRight) {
            nextTransformX = maxOffsetRight; // Przyciągnij do granicy
            bossDx *= -1; // Odwróć kierunek
            ozzyImage.classList.add('flipped-x'); // Obróć obrazek w lewo
        } else if (nextTransformX < maxOffsetLeft) {
            nextTransformX = maxOffsetLeft; // Przyciągnij do granicy
            bossDx *= -1; // Odwróć kierunek
            ozzyImage.classList.remove('flipped-x'); // Obróć obrazek w prawo
        }

        // Zastosuj nową wartość transformX
        ozzyContainer.style.transform = `translate(${nextTransformX}px, -50%)`;
        bossCurrentTransformX = nextTransformX; // Zaktualizuj zmienną stanu

        // Zapytaj o następną klatkę animacji
        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement);
    }


    // --- Funkcje Gry ---
    function resetGame() {
        console.log("resetGame wywołane."); 
        score = 0;
        scoreDisplay.textContent = score;
        // Reset poziomu
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        // Reset stanu bossa i jego obrazka/stylu
        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); // Usuń też klasę flip
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; // Reset zdrowia do początkowej wartości normalnego Stonksa

        // Resetuj obrażenia bazowe zgodnie z poziomem ulepszenia (jeśli jest)
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect'); 
        // Usunięcie klasy spawn-ozzy na wypadek, gdyby gra została zresetowana w trakcie animacji
        ozzyImage.classList.remove('spawn-ozzy'); 
        ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego na starcie

        // Zresetuj pozycję ozzyContainer na środek (ważne, aby było tam przed kolejnym spawnem)
        bossCurrentTransformX = 0; // Reset dodatkowego przesunięcia
        ozzyContainer.style.transform = `translate(-50%, -50%)`; // Przywróć CSSowe wyśrodkowanie

        // Zatrzymaj ruch bossa, jeśli aktywny
        cancelAnimationFrame(bossMovementAnimationFrameId); // Użyj cancelAnimationFrame
        
        // Usuń wszystkie cytaty z ekranu przy resecie
        quoteImagesContainer.innerHTML = ''; 

        // Resetuj stan supermocy i cooldowny
        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        
        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); // Wyczyść timer szału
        
        // Resetuj Lodowy Wybuch
        freezeModeActive = false;
        clearInterval(freezeDotIntervalId);
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active');
        freezeEffect.innerHTML = '';


        lightningEffect.classList.add('hidden');
        freezeEffect.classList.add('hidden');
        frenzyEffect.classList.add('hidden');
        lightningEffect.innerHTML = ''; // Wyczyść segmenty błyskawicy
        freezeEffect.innerHTML = ''; // Wyczyść kryształki lodu


        messageDisplay.style.display = 'none'; // Ukryj ogólny komunikat
        // Usuń wszystkie aktywne komunikaty nokautu, jeśli jakieś są
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        isGameActive = false; 
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden'); 
        upgradeShopScreen.classList.add('hidden'); // Ukryj sklep
        startScreen.classList.remove('hidden'); // Pokaż ekran startowy
        shopButton.classList.remove('hidden'); // Pokaż przycisk sklepu na ekranie startowym
        
        // Zatrzymanie intervalu timera cooldownów
        clearInterval(superpowerCooldownIntervalId);
        updateSuperpowerCooldownDisplays(); // Końcowa aktualizacja, by pokazać oryginalny tekst

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0; 
        }
    }

    // Funkcja do wyświetlania OGÓLNYCH komunikatów (teraz również dla startu bossa)
    // Będzie używać tych samych stylów co supermoce.
    function showMessage(message, duration = 1500) {
        messageDisplay.textContent = message;
        messageDisplay.style.display = 'block';
        // Użyj stylów z messageDisplay, które są zdefiniowane w style.css
        // Dodatkowo, aby były bardziej widoczne, upewnij się, że ich style są wyraziste w CSS
        // (już zostały poprawione, aby były jak dla supermocy)
        setTimeout(() => {
            messageDisplay.style.display = 'none';
        }, duration);
    }

    function updateHealthBar() {
        const healthPercentage = (ozzyHealth / INITIAL_OZZY_HEALTH) * 100;
        healthBarFill.style.width = `${healthPercentage}%`;
        if (healthPercentage > 50) {
            healthBarFill.style.backgroundColor = 'limegreen';
        } else if (healthPercentage > 20) {
            healthBarFill.style.backgroundColor = 'orange';
        } else {
            healthBarFill.style.backgroundColor = 'red';
        }
    }

    function startGame() {
        console.log("startGame wywołane."); 
        startScreen.classList.add('hidden'); 
        shopButton.classList.add('hidden'); // Ukryj przycisk sklepu podczas gry
        console.log("Po hidden: startScreen display", window.getComputedStyle(startScreen).display); 
        ozzyContainer.classList.remove('hidden'); // Pokaż Ozzy'ego
        scoreDisplay.classList.remove('hidden'); // Pokaż licznik
        // Pokaż licznik poziomu
        currentLevelDisplay.parentElement.classList.remove('hidden'); 
        
        isGameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
        // Ustaw początkowy poziom
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        // Ustawienie początkowego stanu Stonksa (normalny, bez bossa)
        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); // Upewnij się, że nie jest flipnięty na starcie
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH;

        // Ustaw obrażenia bazowe na początku gry, uwzględniając ulepszenia
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH; 
        updateHealthBar(); 
        ozzyImage.classList.remove('hit-effect'); 
        // Usunięcie klasy spawn-ozzy na start gry
        ozzyImage.classList.remove('spawn-ozzy');

        // Resetuj supermoce na start gry
        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        
        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); // Wyczyść timer szału

        // Resetuj Lodowy Wybuch na start gry
        freezeModeActive = false;
        clearInterval(freezeDotIntervalId);
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active');
        freezeEffect.innerHTML = '';

        lightningEffect.classList.add('hidden');
        freezeEffect.classList.add('hidden');
        frenzyEffect.classList.add('hidden');
        lightningEffect.innerHTML = '';
        freezeEffect.innerHTML = '';
        // Usuń wszystkie aktywne komunikaty nokautu, jeśli jakieś są
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());

        // Usuń cytaty, jeśli jakieś zostały z poprzedniej sesji gry
        quoteImagesContainer.innerHTML = '';

        // Zatrzymaj i zresetuj ruch bossa
        cancelAnimationFrame(bossMovementAnimationFrameId); // Użyj cancelAnimationFrame
        bossCurrentTransformX = 0; // Reset dodatkowego przesunięcia X
        ozzyContainer.style.transform = `translate(-50%, -50%)`; // Ustaw Ozzy'ego na środku CSS
        
        // Uruchomienie intervalu timera cooldownów
        clearInterval(superpowerCooldownIntervalId); // Wyczyść poprzedni, jeśli istnieje
        superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
        updateSuperpowerButtons(); // Początkowa aktualizacja stanu i tekstu przycisków

        if (backgroundMusic) {
            backgroundMusic.play().catch(e => console.error("Błąd odtwarzania backgroundMusic:", e));
        }
    }

    function endGame(message) {
        console.log("endGame wywołane z wiadomością:", message); 
        isGameActive = false;
        ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego po zakończeniu gry
        scoreDisplay.classList.add('hidden'); // Ukryj licznik
        // Ukryj licznik poziomu
        currentLevelDisplay.parentElement.classList.add('hidden'); 
        messageDisplay.style.display = 'none';
        quoteImagesContainer.innerHTML = ''; // Usuń wszystkie cytaty po zakończeniu gry
        // Usuń wszystkie aktywne komunikaty nokautu, jeśli jakieś są
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        // Zresetuj wszystkie aktywne supermoce po zakończeniu gry
        frenzyModeActive = false;
        // Przywróć normalne obrażenia, uwzględniając ulepszenia bazowe
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL; 
        clearTimeout(frenzyTimerId);
        
        // Resetuj Lodowy Wybuch
        freezeModeActive = false;
        clearInterval(freezeDotIntervalId);
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active');
        freezeEffect.innerHTML = '';


        lightningEffect.classList.add('hidden');
        freezeEffect.classList.add('hidden');
        frenzyEffect.classList.add('hidden');
        lightningEffect.innerHTML = '';
        freezeEffect.innerHTML = '';
        punchesSinceLastPowerup = 0; // Resetuj licznik do supermocy
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        updateSuperpowerButtons(); // Zaktualizuj stan przycisków

        // Zatrzymanie intervalu timera cooldownów
        clearInterval(superpowerCooldownIntervalId);
        // Zatrzymaj ruch bossa, jeśli aktywny
        cancelAnimationFrame(bossMovementAnimationFrameId);

        document.getElementById('end-message').textContent = message;
        finalScoreDisplay.textContent = score;

        saveScoreToLeaderboard(playerNickname, score);

        endScreen.classList.remove('hidden');

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    // Obsługuje znokautowanie Ozzy'ego
    function handleOzzyKnockout() {
        score++; // Uderzenia (punkty) nadal idą w górę
        scoreDisplay.textContent = score;

        currentLevel++; // Zwiększ poziom
        currentLevelDisplay.textContent = currentLevel; // Aktualizuj wyświetlanie poziomu


        // Usuń istniejące komunikaty nokautu przed utworzeniem nowego
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        
        // Ozzy znika natychmiast po nokaucie
        ozzyContainer.classList.add('hidden'); 
        
        // Logika bossa / zwiększania zdrowia
        if (currentLevel > 0 && currentLevel % 10 === 0) {
            // To jest poziom bossa
            isBossFight = true;
            ozzyImage.src = BOSS_IMAGE_URL; // Zmień obrazek na bossa
            ozzyImage.classList.add('boss-mode'); // Dodaj klasę stylizacji bossa
            INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH; // Boss ma zwiększone zdrowie
            
            // WYŚWIETL KOMUNIKAT O ROZPOCZĘCIU BOSS FIGHTU UŻYWAJĄC showMessage (większy, centralny styl)
            showMessage("UWAGA! BOSS STONKS! ROZPIERDOL GO!", 2500); // Dłuższy czas widoczności

            // Rozpocznij ruch bossa
            cancelAnimationFrame(bossMovementAnimationFrameId); // Upewnij się, że nie ma starego interwału
            
            // Resetuj bossCurrentTransformX i zastosuj transform, aby wyśrodkować bossa
            bossCurrentTransformX = 0; 
            ozzyContainer.style.transform = `translate(${bossCurrentTransformX}px, -50%)`; 
            
            bossDx = BOSS_MOVEMENT_SPEED * (Math.random() < 0.5 ? 1 : -1); // Losowy kierunek startowy
            if (bossDx < 0) {
                ozzyImage.classList.add('flipped-x');
            } else {
                ozzyImage.classList.remove('flipped-x');
            }
            bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement); // Rozpocznij animację bossa
            
        } else {
            // Normalny poziom
            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; // Przywróć normalny obrazek
            ozzyImage.classList.remove('boss-mode'); // Usuń klasę stylizacji bossa
            ozzyImage.classList.remove('flipped-x'); // Usuń też klasę flip
            // Zresetuj pozycję ozzyContainer na środek (dla kolejnego normalnego stonksa)
            bossCurrentTransformX = 0; // Reset dodatkowego przesunięcia
            ozzyContainer.style.transform = `translate(-50%, -50%)`; // Przywróć CSSowe wyśrodkowanie

            cancelAnimationFrame(bossMovementAnimationFrameId); // Zatrzymaj ruch bossa, jeśli był aktywny
            
            if (currentLevel > 0 && currentLevel % 5 === 0) { 
                 INITIAL_OZZY_HEALTH += NORMAL_OZZY_HEALTH_INCREMENT; // Normalny przyrost zdrowia
                 showMessage(`Stonks jest silniejszy!`, 2000); // Komunikat o zwiększeniu zdrowia
            }
            // Utwórz i wyświetl nieblokujący komunikat o nokaucie (standardowy styl)
            const knockoutMsgElement = document.createElement('div');
            knockoutMsgElement.classList.add('knockout-message'); // Użyj nowej klasy CSS
            knockoutMsgElement.textContent = 'Stonks rozjebany!'; // Zwykły komunikat o nokaucie
            gameContainer.appendChild(knockoutMsgElement);

            setTimeout(() => {
                knockoutMsgElement.remove();
            }, 2000); // Dopasowane do czasu trwania animacji CSS (fadeOutUpSmall)
        }

        ozzyHealth = INITIAL_OZZY_HEALTH; // Pełne zdrowie na nową rundę
        updateHealthBar(); // Pasek zdrowia aktualizuje się natychmiast

        // Ozzy pojawia się ponownie po BARDZO KRÓTKIM opóźnieniu z animacją
        setTimeout(() => {
            ozzyContainer.classList.remove('hidden'); 
            ozzyImage.classList.remove('hit-effect'); 
            ozzyImage.classList.add('spawn-ozzy'); // Dodaj klasę animacji pojawiania się

            // Usuń klasę animacji po jej zakończeniu, aby nie kolidowała z innymi animacjami/stylami
            setTimeout(() => {
                ozzyImage.classList.remove('spawn-ozzy');
            }, 500); // Czas trwania animacji spawnOzzy w CSS
        }, 200); // Czas "nieobecności" Ozzy'ego na ekranie przed ponownym pojawieniem się (0.2 sekundy)

    }

    function handlePunch(event) {
        console.log("handlePunch wywołane."); 
        // Usunięto warunek isOzzyDown, aby umożliwić klikanie Ozzy'ego zaraz po nokaucie
        if (!isGameActive) { 
            return;
        }

        const punchSoundInstance = new Audio('punch.mp3');
        punchSoundInstance.play().catch(e => console.error("Błąd odtwarzania punchSoundInstance:", e));
        punchSoundInstance.onended = () => {
            punchSoundInstance.remove();
        };

        applyDamageToOzzy(PUNCH_DAMAGE); // Użyj aktualnych obrażeń bazowych

        ozzyImage.classList.add('hit-effect');
        setTimeout(() => {
            ozzyImage.classList.remove('hit-effect');
        }, 150); 
        
        // Sprawdzamy, czy Ozzy został trafiony i czy jest szansa na pojawienie się cytatu
        if (!isBossFight && ozzyHealth > 0 && Math.random() < 0.3) { // 30% szans na pojawienie się cytatu po trafieniu (tylko dla normalnego Stonksa)
            spawnRandomQuote();
        } else if (isBossFight && ozzyHealth > 0 && Math.random() < 0.2) { // 20% szans na kwestię bossa
            // Sprawdź, czy żaden inny komunikat typu "knockout-message" nie jest już wyświetlany
            if (document.querySelectorAll('.knockout-message').length === 0) {
                const randomBossQuote = BOSS_QUOTES[Math.floor(Math.random() * BOSS_QUOTES.length)];
                // Utwórz i wyświetl nieblokujący komunikat o nokaucie (standardowy styl)
                const bossQuoteElement = document.createElement('div');
                bossQuoteElement.classList.add('knockout-message'); 
                bossQuoteElement.textContent = randomBossQuote; 
                gameContainer.appendChild(bossQuoteElement);

                setTimeout(() => {
                    bossQuoteElement.remove();
                }, 2000); // Znika po 2 sekundach
            }
        }

        // Zwiększ licznik uderzeń do supermocy
        punchesSinceLastPowerup++;
        updateSuperpowerButtons(); // Aktualizuj stan przycisków supermocy (w tym cooldowny)
    }

    // --- NOWE: Funkcje sklepu ulepszeń ---
    function calculateUpgradeCost(currentLevel) {
        return Math.ceil(UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, currentLevel - 1));
    }

    function updateUpgradeShopUI() {
        // Obrażenia podstawowe
        baseDamageLevelDisplay.textContent = upgradeLevels.baseDamage;
        const nextBaseDamageCost = calculateUpgradeCost(upgradeLevels.baseDamage);
        baseDamageCostDisplay.textContent = nextBaseDamageCost;
        buyBaseDamageButton.disabled = score < nextBaseDamageCost;

        // Piorun Zagłady
        lightningDamageLevelDisplay.textContent = upgradeLevels.lightningDamage;
        const nextLightningDamageCost = calculateUpgradeCost(upgradeLevels.lightningDamage);
        lightningDamageCostDisplay.textContent = nextLightningDamageCost;
        buyLightningDamageButton.disabled = score < nextLightningDamageCost;

        // Lodowy Wybuch
        freezeDamageLevelDisplay.textContent = upgradeLevels.freezeDamage;
        const nextFreezeDamageCost = calculateUpgradeCost(upgradeLevels.freezeDamage);
        freezeDamageCostDisplay.textContent = nextFreezeDamageCost;
        buyFreezeDamageButton.disabled = score < nextFreezeDamageCost;

        // Szał Bojowy
        frenzyDamageLevelDisplay.textContent = upgradeLevels.frenzyDamage;
        const nextFrenzyDamageCost = calculateUpgradeCost(upgradeLevels.frenzyDamage);
        frenzyDamageCostDisplay.textContent = nextFrenzyDamageCost;
        buyFrenzyDamageButton.disabled = score < nextFrenzyDamageCost;
    }

    function buyUpgrade(upgradeType) {
        let currentLevel = upgradeLevels[upgradeType];
        const cost = calculateUpgradeCost(currentLevel);

        if (score >= cost) {
            score -= cost;
            scoreDisplay.textContent = score;
            upgradeLevels[upgradeType]++;
            
            // Zastosuj ulepszenie
            if (upgradeType === 'baseDamage') {
                PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Obrażenia Podstawowe! Nowe obrażenia: ${PUNCH_DAMAGE}`, 1500);
            } else if (upgradeType === 'lightningDamage') {
                // LIGHTNING_BASE_DAMAGE jest używane do obliczeń w activateLightningStrike, więc nie musimy zmieniać go tutaj bezpośrednio,
                // ale wizualnie możemy pokazać efekt:
                const nextLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage -1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Piorun Zagłady! Poziom: ${upgradeLevels.lightningDamage} (Obrażenia: ~${nextLightningDamage})`, 1500);
            } else if (upgradeType === 'freezeDamage') {
                // Podobnie dla Freeze, obrażenia będą obliczane w activateIceBlast
                const nextInitialFreezeDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
                const nextDotFreezeDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Lodowy Wybuch! Poziom: ${upgradeLevels.freezeDamage} (Obrażenia: ~${nextInitialFreezeDamage}, DOT: ~${nextDotFreezeDamage}/s)`, 1500);
            } else if (upgradeType === 'frenzyDamage') {
                // Podobnie dla Frenzy, obrażenia będą obliczane w activateFrenzy
                const nextFrenzyDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Szał Bojowy! Poziom: ${upgradeLevels.frenzyDamage} (Obrażenia: ~${nextFrenzyDamage})`, 1500);
            }

            updateUpgradeShopUI(); // Odśwież UI sklepu po zakupie
        } else {
            showMessage("Za mało punktów!", 1000);
        }
    }


    // Ważne: to sprawdza, czy skrypt jest w ogóle uruchamiany
    console.log("Script.js jest uruchamiany!"); 

    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOMContentLoaded: DOM został załadowany!"); 
        
        // Upewnij się, że wszystkie ekrany są początkowo ukryte, z wyjątkiem startScreen
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        upgradeShopScreen.classList.add('hidden'); // Ukryj sklep na start
        ozzyContainer.classList.add('hidden');
        scoreDisplay.classList.add('hidden'); 
        currentLevelDisplay.parentElement.classList.add('hidden'); // Ukryj licznik poziomu na starcie
        messageDisplay.style.display = 'none';
        quoteImagesContainer.innerHTML = ''; // Upewnij się, że kontener cytatów jest pusty na starcie
        // Usuń wszystkie aktywne komunikaty nokautu, jeśli jakieś są
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        resetGame(); // Ta funkcja również resetuje supermoce i cooldowny

        console.log("Initial game container dimensions:", gameContainer.offsetWidth, gameContainer.offsetHeight);
        console.log("Initial target image (Ozzy) dimensions:", ozzyImage.offsetWidth, ozzyImage.offsetHeight);

        // Inicjalizacja uwierzytelniania anonimowego po załadowaniu DOM
        try {
            const userCredential = await signInAnonymously(auth);
            currentUserId = userCredential.user.uid;
            console.log("Zalogowano anonimowo. UID:", currentUserId);
        } catch (error) {
            console.error("Błąd logowania anonimowego:", error);
            showMessage("Błąd połączenia z rankingiem. Spróbuj odświeżyć stronę.", 5000);
        }
        console.log("DOMContentLoaded: Uwierzytelnianie zakończone."); 

        // --- Obsługa zdarzeń ---
        startButton.addEventListener('click', () => {
            console.log("Kliknięto przycisk START!"); 
            const nick = nicknameInput.value.trim();
            if (nick === "") {
                showMessage("Musisz wpisać swój nick!", 2000);
                return;
            }
            playerNickname = nick;
            startGame();
        });

        showLeaderboardButton.addEventListener('click', () => {
            console.log("Kliknięto przycisk RANKING!"); 
            startScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); // Ukryj przycisk sklepu, gdy otwierasz ranking
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        restartButton.addEventListener('click', () => {
            console.log("Kliknięto przycisk RESTART!"); 
            resetGame();
        });

        ozzyContainer.addEventListener('click', handlePunch);
        ozzyContainer.addEventListener('touchstart', (event) => {
            event.preventDefault(); 
            handlePunch(event);
        }, { passive: false });

        showLeaderboardAfterGameButton.addEventListener('click', () => {
            console.log("Kliknięto przycisk ZOBACZ RANKING (po grze)!"); 
            endScreen.classList.add('hidden');
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        backToStartButton.addEventListener('click', () => {
            console.log("Kliknięto przycisk WRÓĆ DO MENU!"); 
            leaderboardScreen.classList.add('hidden'); 
            resetGame(); // Ta funkcja już pokazuje ekran startowy i przycisk sklepu
        });

        // Obsługa kliknięć przycisków supermocy
        btnLightning.addEventListener('click', activateLightningStrike);
        btnFreeze.addEventListener('click', activateIceBlast); 
        btnFrenzy.addEventListener('click', activateFrenzy);

        // --- NOWE: Obsługa zdarzeń sklepu ulepszeń ---
        shopButton.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); // Ukryj przycisk sklepu
            upgradeShopScreen.classList.remove('hidden');
            updateUpgradeShopUI(); // Odśwież UI sklepu przy otwarciu
        });

        closeShopButton.addEventListener('click', () => {
            upgradeShopScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            shopButton.classList.remove('hidden'); // Pokaż przycisk sklepu z powrotem
        });

        buyBaseDamageButton.addEventListener('click', () => buyUpgrade('baseDamage'));
        buyLightningDamageButton.addEventListener('click', () => buyUpgrade('lightningDamage'));
        buyFreezeDamageButton.addEventListener('click', () => buyUpgrade('freezeDamage'));
        buyFrenzyDamageButton.addEventListener('click', () => buyUpgrade('frenzyDamage'));

        // Początkowa aktualizacja UI sklepu, gdy gra się załaduje
        updateUpgradeShopUI();
    });
    