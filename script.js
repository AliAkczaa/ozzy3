    // === Firebase Configuration (Musisz Zastąpić Własnymi Kluczami!) ===
    // Przejdź do Firebase Console -> Twój Projekt -> Ustawienia projektu (zębatka) -> Dodaj aplikację (ikona </> dla web)
    // Skopiuj obiekt firebaseConfig i wklej go tutaj:
    const firebaseConfig = {
        apiKey: "AIzaSyASSmHw3LVUu7lSql0QwGmmBcFkaNeMups", // Your Firebase API Key
        authDomain: "ozzy-14c19.firebaseapp.com",
        projectId: "ozzy-14c19",
        storageBucket: "ozzy-14c19.firebasestorage.app",
        messagingSenderId: "668337469201",
        appId: "1:668337469201:web:cd9d84d45c93d9b6e3feb0"
    };

    // === Modular Firebase SDK v9 Imports ===
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
    import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
    import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
    import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js';

    // Firebase Initialization
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const functions = getFunctions(app);
    const submitScoreFunction = httpsCallable(functions, 'submitScore'); // Referencja do naszej funkcji Cloud Function

    // ===================================================================

    // Pobranie referencji do elementów DOM
    const backgroundTractor = document.getElementById('animated-background-tractor');
    const ozzyContainer = document.getElementById('ozzy-container');
    const ozzyImage = document.getElementById('ozzy-image');
    const healthBarFill = document.getElementById('health-bar-fill');
    
    // Referencje do nowego kontenera informacji o grze i elementów punktów/poziomu
    const gameInfoContainer = document.getElementById('game-info-container');
    const scoreDisplay = document.getElementById('score');
    const currentLevelDisplay = document.getElementById('current-level');

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

    let score = 0;
    let ozzyHealth = 100;
    let INITIAL_OZZY_HEALTH = 100;
    let PUNCH_DAMAGE = 10; // Zmienna, będzie modyfikowana przez Frenzy i ulepszenia
    let currentUserId = null;
    let isGameActive = false; // Flaga wskazująca, czy gra jest aktywna (nie wstrzymana w menu/sklepie)

    // Zmienna bieżącego poziomu
    let currentLevel = 0;
    // Flaga walki z bossem
    let isBossFight = false;

    // Uderzenia od ostatniej aktywacji supermocy
    let punchesSinceLastPowerup = 0;

    // --- Referencje i zmienne cytatów obrazkowych ---
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

    // --- Elementy i zmienne supermocy ---
    const superpowerButtonsContainer = document.getElementById('superpower-buttons-container');
    const btnLightning = document.getElementById('btn-lightning');
    const btnFreeze = document.getElementById('btn-freeze');
    const btnFrenzy = document.getElementById('btn-frenzy');

    // Oryginalne teksty przycisków (do wyświetlenia po zakończeniu cooldownu)
    const originalLightningText = '⚡ Piorun Zagłady';
    const originalFreezeText = '❄️ Lodowy Wybuch';
    const originalFrenzyText = '🔥 Szał Bojowy';

    const lightningEffect = document.getElementById('lightning-effect');
    const freezeEffect = document.getElementById('freeze-effect');
    const frenzyEffect = document.getElementById('frenzy-effect');

    const PUNCHES_PER_POWERUP = 10; // Ile uderzeń do aktywacji supermocy (próg)

    const COOLDOWN_DURATION_MS = 60 * 1000; // 60 sekund

    let lastUsedLightningTime = 0; // Czas ostatniego użycia Pioruna
    let lastUsedFreezeTime = 0; // Czas ostatniego użycia Lodowego Wybuchu
    let lastUsedFrenzyTime = 0; // Czas ostatniego użycia Szału Bojowego

    let frenzyModeActive = false;
    let frenzyTimerId;
    const FRENZY_DAMAGE_MULTIPLIER = 3; // Np. 3 razy większe obrażenia
    const FRENZY_DURATION_MS = 5000; // Czas trwania Szału (5 sekund)

    // Zmienne dynamiczne (będą skalowane przez ulepszenia)
    let LIGHTNING_BASE_DAMAGE = 150; // Zmniejszono z 450 do 150, skalowalne
    let ICE_BLAST_INITIAL_DAMAGE = 50;
    let ICE_BLAST_DOT_DAMAGE_PER_SECOND = 25;
    const ICE_BLAST_DOT_DURATION_SECONDS = 5;
    let FRENZY_INITIAL_DAMAGE = 30;

    let superpowerCooldownIntervalId; // ID interwału do aktualizacji timerów

    let freezeModeActive = false;
    let freezeDotIntervalId;

    // Ścieżki do obrazów Stonksa (normalny i boss)
    const ORIGINAL_OZZY_IMAGE_URL = 'zdjecie 2.jpg';
    const BOSS_IMAGE_URL = 'stonksboss.png'; // Użycie grafiki stonksboss.png

    // Wartości zdrowia dla normalnego Stonksa i Bossa
    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    const NORMAL_OZZY_HEALTH_INCREMENT = 20; // Zwiększenie zdrowia dla normalnego Stonksa co 5 nokautów
    const BOSS_INITIAL_HEALTH = 450; // Zwiększone o 50% z 300 -> 450

    // Modyfikatory ruchu bossa i cytaty
    const BOSS_MOVEMENT_SPEED = 2; // Prędkość ruchu bossa (piksele na klatkę animacji)
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

    // --- NOWE: Elementy i zmienne systemu ulepszeń ---
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
    const frenzyDamageCostDisplay = document.getElementById('frenzy-cost'); 
    const buyFrenzyDamageButton = document.getElementById('buy-frenzy-damage');

    // Zmienne stanu ulepszeń
    let upgradeLevels = {
        baseDamage: 1,
        lightningDamage: 1,
        freezeDamage: 1,
        frenzyDamage: 1
    };

    // Koszty ulepszeń i modyfikatory (można dostosować!)
    const UPGRADE_COST_BASE = 10;
    const UPGRADE_COST_MULTIPLIER = 1.5; // Koszt zwiększa się o 50% za każdy poziom
    const DAMAGE_INCREASE_PER_LEVEL = 5; // Obrażenia podstawowe zwiększają się o 5 za poziom

    const LIGHTNING_DAMAGE_INCREASE_PER_LEVEL = 30; // Piorun: obrażenia zwiększają się o 30
    const FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL = 10; // Zamrożenie: początkowe obrażenia zwiększają się o 10
    const FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL = 5; // Zamrożenie: obrażenia DOT zwiększają się o 5
    const FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL = 15; // Szał: początkowe obrażenia zwiększają się o 15


    // --- Funkcje Leaderboard ---
    async function saveScoreToLeaderboard(nickname, score) {
        console.log("saveScoreToLeaderboard called with nickname:", nickname, "score:", score);
        if (score > CLIENT_SIDE_MAX_SCORE) {
            showMessage("Spierdalaj frajerze cheaterze! Wynik nierealny!", 3000);
            console.warn(`Attempt to save unrealistic score (${score}) by ${nickname}. Blocked client-side.`);
            setTimeout(resetGame, 3000);
            return;
        }

        if (score > 0 && currentUserId) {
            try {
                // Wywołanie funkcji Cloud Function zamiast bezpośredniego zapisu do Firestore
                const result = await submitScoreFunction({ nickname: nickname, score: score });
                console.log("Response from Cloud Function:", result.data);
                showMessage(result.data.message, 2000);
            } catch (error) {
                console.error("Error calling Cloud Function:", error.code, error.message);
                showMessage(`Błąd zapisu: ${error.message}`, 3000);
            }
        } else if (!currentUserId) {
            console.warn("Cannot save score: User is not authenticated. Check Firebase Auth configuration.");
            showMessage("Błąd: Brak uwierzytelnienia do zapisu wyniku.", 3000);
        }
    }

    async function fetchAndDisplayLeaderboard() {
        console.log("fetchAndDisplayLeaderboard called.");
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
            console.error("Error fetching leaderboard: ", e);
            leaderboardList.innerHTML = '<li>Wystąpił błąd podczas ładowania rankingu.</li>';
        }
    }

    // --- Funkcje Cytatów ---
    function spawnRandomQuote() {
        const randomImagePath = quoteImagePaths[Math.floor(Math.random() * quoteImagePaths.length)];

        const img = document.createElement('img');
        img.src = randomImagePath;
        img.classList.add('quote-image'); // Klasa CSS do stylizacji

        // Losowa pozycja w obrębie gameContainer, unikanie krawędzi
        const gameContainerRect = gameContainer.getBoundingClientRect();
        const maxX = gameContainerRect.width - QUOTE_SIZE_PX;
        const maxY = gameContainerRect.height - QUOTE_SIZE_PX;

        // Upewnij się, że nie wyjdzie poza kontener i ma trochę marginesu
        const randomX = Math.random() * Math.max(0, maxX);
        const randomY = Math.random() * Math.max(0, maxY);

        img.style.left = `${randomX}px`;
        img.style.top = `${randomY}px`;

        // Losowy kąt obrotu (-45 do +45 stopni)
        const randomRotation = Math.random() * 90 - 45; 
        img.style.transform = `rotate(${randomRotation}deg)`;

        quoteImagesContainer.appendChild(img);

        // Aktywuj animację pojawiania się
        setTimeout(() => {
            img.classList.add('active');
        }, 10); // Małe opóźnienie dla działania przejścia CSS

        // Ustaw czas znikania
        setTimeout(() => {
            img.classList.remove('active'); // Rozpocznij animację zanikania
            setTimeout(() => {
                img.remove(); // Usuń element z DOM po animacji
            }, 500); // Czas trwania animacji opacity
        }, QUOTE_DISPLAY_DURATION_MS);
    }

    // --- Funkcja: Zunifikowane stosowanie obrażeń ---
    function applyDamageToOzzy(damageAmount) {
        ozzyHealth -= damageAmount;
        ozzyHealth = Math.max(0, ozzyHealth);
        updateHealthBar();
        if (ozzyHealth <= 0) {
            handleOzzyKnockout();
        }
    }

    // --- Funkcje Supermocy ---
    function updateSuperpowerButtons() {
        const now = Date.now();

        // Sprawdź próg uderzeń ORAZ cooldown dla każdego przycisku
        const canUseLightning = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                                ((now - lastUsedLightningTime >= COOLDOWN_DURATION_MS) || lastUsedLightningTime === 0) &&
                                isGameActive; // Tylko jeśli gra jest aktywna

        const canUseFreeze = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                             ((now - lastUsedFreezeTime >= COOLDOWN_DURATION_MS) || lastUsedFreezeTime === 0) &&
                             isGameActive; // Tylko jeśli gra jest aktywna

        const canUseFrenzy = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                             ((now - lastUsedFrenzyTime >= COOLDOWN_DURATION_MS) || lastUsedFrenzyTime === 0) &&
                             isGameActive; // Tylko jeśli gra jest aktywna

        btnLightning.disabled = !canUseLightning;
        btnFreeze.disabled = !canUseFreeze;
        btnFrenzy.disabled = !canUseFrenzy;

        // Kontener przycisków supermocy jest klikalny, jeśli którykolwiek przycisk jest aktywny
        if (canUseLightning || canUseFreeze || canUseFrenzy) {
            superpowerButtonsContainer.style.pointerEvents = 'auto';
        } else {
            superpowerButtonsContainer.style.pointerEvents = 'none';
        }

        // Aktualizuj wyświetlanie cooldownów
        updateSuperpowerCooldownDisplays();
    }

    // Aktualizuje teksty przycisków supermocy z pozostałym czasem cooldownu
    function updateSuperpowerCooldownDisplays() {
        const now = Date.now();

        const updateButtonText = (button, lastUsedTime, originalText) => {
            if (!isGameActive && button.classList.contains('hidden')) {
                button.textContent = originalText;
                return;
            }
            if (!isGameActive) {
                button.textContent = originalText;
                return;
            }

            const timeLeft = Math.ceil((lastUsedTime + COOLDOWN_DURATION_MS - now) / 1000);
            if (timeLeft > 0) {
                button.textContent = `${timeLeft}s`;
            } else {
                button.textContent = originalText; // Cooldown wygasł, pokaż oryginalny tekst
            }
        };

        updateButtonText(btnLightning, lastUsedLightningTime, originalLightningText);
        updateButtonText(btnFreeze, lastUsedFreezeTime, originalFreezeText);
        updateButtonText(btnFrenzy, lastUsedFrenzyTime, originalFrenzyText);
    }


    function activateLightningStrike() {
        if (!isGameActive || btnLightning.disabled) return;

        showMessage("PIORUN ZAGŁADY!", 1500);
        punchesSinceLastPowerup = 0; // Zresetuj licznik uderzeń
        lastUsedLightningTime = Date.now(); // Ustaw czas ostatniego użycia
        updateSuperpowerButtons(); // Wyłącz przyciski i zaktualizuj timery

        // Oblicz obrażenia pioruna na podstawie poziomu ulepszenia
        const actualLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage - 1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualLightningDamage); // Zastosuj obrażenia

        // Wizualny efekt pioruna (generowany przez kod)
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
            segment.style.transformOrigin = `center top`; // Obróć od góry

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
        punchesSinceLastPowerup = 0; // Zresetuj licznik uderzeń
        lastUsedFreezeTime = Date.now(); // Ustaw czas ostatniego użycia
        updateSuperpowerButtons(); // Wyłącz przyciski i zaktualizuj timery

        // Oblicz obrażenia Lodowego Wybuchu na podstawie poziomu ulepszenia
        const actualIceBlastInitialDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
        const actualIceBlastDotDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;

        // Usuń hidden, dodaj active
        freezeEffect.classList.remove('hidden');
        freezeEffect.classList.add('active'); // Aktywuje efekty CSS na czas trwania

        applyDamageToOzzy(actualIceBlastInitialDamage); // Zastosuj początkowe obrażenia

        freezeModeActive = true; // Aktywuj tryb zamrożenia
        let dotTicks = 0;
        const maxDotTicks = ICE_BLAST_DOT_DURATION_SECONDS;

        // Rozpocznij stosowanie obrażeń co sekundę i spawnowanie odłamków
        clearInterval(freezeDotIntervalId); // Upewnij się, że poprzedni interwał jest wyczyszczony
        freezeDotIntervalId = setInterval(() => {
            if (!isGameActive && !upgradeShopScreen.classList.contains('hidden')) { // Sprawdź, czy gra jest nadal aktywna LUB czy jesteśmy w sklepie
                // Jeśli w sklepie, nie kończ DOT, ale zatrzymaj interwał
                clearInterval(freezeDotIntervalId);
                // Nie trzeba tutaj ustawiać freezeModeActive na false, zostanie to zrobione przy wznowieniu gry
                // Po prostu wznawiamy interwał po wznowieniu gry.
                return;
            }
            if (!isGameActive) { // Jeśli gra jest nieaktywna (poza sklepem)
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; // Dezaktywuj tryb zamrożenia
                freezeEffect.classList.remove('active'); // Usuń klasę efektu wizualnego
                freezeEffect.innerHTML = ''; // Usuń odłamki
                return;
            }
            applyDamageToOzzy(actualIceBlastDotDamage);
            dotTicks++;

            // Spawnowanie nowych odłamków co sekundę wokół Ozzy'ego
            const ozzyRect = ozzyContainer.getBoundingClientRect();
            for (let i = 0; i < 5; i++) { // Spawnowanie kilku nowych odłamków co takt
                const shard = document.createElement('div');
                shard.classList.add('ice-shard');
                // Losowa pozycja w kontenerze Ozzy'ego
                shard.style.left = `${ozzyRect.left + Math.random() * ozzyRect.width}px`;
                shard.style.top = `${ozzyRect.top + Math.random() * ozzyRect.height}px`;
                freezeEffect.appendChild(shard);
                // Usuń stare odłamki po animacji (1s zdefiniowane w CSS)
                setTimeout(() => {
                    shard.remove();
                }, 1000);
            }

            if (dotTicks >= maxDotTicks) {
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; // Dezaktywuj tryb zamrożenia
                freezeEffect.classList.remove('active'); // Usuń klasę efektu wizualnego
                freezeEffect.innerHTML = ''; // Upewnij się, że wszystkie odłamki są usunięte na koniec
                showMessage("Lodowy Wybuch osłabł.", 1000); // Komunikat o zakończeniu efektu
            }
        }, 1000); // Co sekundę
    }

    function activateFrenzy() {
        if (!isGameActive || btnFrenzy.disabled) return;

        showMessage("SZAŁ BOJOWY!", 1500);
        punchesSinceLastPowerup = 0; // Zresetuj licznik uderzeń
        lastUsedFrenzyTime = Date.now(); // Ustaw czas ostatniego użycia
        updateSuperpowerButtons(); // Wyłącz przyciski i zaktualizuj timery

        // Oblicz początkowe obrażenia Szału na podstawie poziomu ulepszenia
        const actualFrenzyInitialDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualFrenzyInitialDamage); // Zastosuj początkowe obrażenia

        frenzyModeActive = true;
        PUNCH_DAMAGE *= FRENZY_DAMAGE_MULTIPLIER; // Zwiększ obrażenia uderzeń
        frenzyEffect.classList.remove('hidden');
        frenzyEffect.classList.add('active');

        clearTimeout(frenzyTimerId); // Upewnij się, że poprzedni timer szału jest wyczyszczony
        frenzyTimerId = setTimeout(() => {
            frenzyModeActive = false;
            PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL; // Przywróć normalne obrażenia (uwzględniając bazowe ulepszenie)
            frenzyEffect.classList.add('hidden');
            frenzyEffect.classList.remove('active');
            showMessage("Szał minął. Normalne uderzenia.", 1500);
        }, FRENZY_DURATION_MS);
    }


    // --- Funkcja Animacji Ruchu Bossa ---
    let isBossMovementPaused = false; // Nowa flaga do wstrzymywania ruchu bossa
    function animateBossMovement() {
        if (!isGameActive || !isBossFight || isBossMovementPaused) { // Dodano warunek pauzy
            cancelAnimationFrame(bossMovementAnimationFrameId); // Użyj cancelAnimationFrame
            return;
        }

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const ozzyRect = ozzyContainer.getBoundingClientRect(); // Bieżący rozmiar i pozycja kontenera bossa

        // Oblicz potencjalną nową wartość transformX
        let nextTransformX = bossCurrentTransformX + bossDx;

        // Zdefiniuj granice dla nextTransformX na podstawie kontenera i szerokości Ozzy'ego
        // maxOffsetRight to maksymalne przesunięcie w prawo, tak aby prawy brzeg Ozzy'ego dotykał prawego brzegu kontenera
        const maxOffsetRight = (gameContainerRect.width / 2) - (ozzyRect.width / 2);
        // maxOffsetLeft to maksymalne przesunięcie w lewo, tak aby lewy brzeg Ozzy'ego dotykał lewego brzegu kontenera
        const maxOffsetLeft = -((gameContainerRect.width / 2) - (ozzyRect.width / 2));

        // Sprawdzenie kolizji i zmiana kierunku
        if (nextTransformX > maxOffsetRight) {
            nextTransformX = maxOffsetRight; // Przyciągnij do granicy
            bossDx *= -1; // Odwróć kierunek
            ozzyImage.classList.add('flipped-x'); // Odwróć obraz w lewo
        } else if (nextTransformX < maxOffsetLeft) {
            nextTransformX = maxOffsetLeft; // Przyciągnij do granicy
            bossDx *= -1; // Odwróć kierunek
            ozzyImage.classList.remove('flipped-x'); // Odwróć obraz w prawo
        }

        // Zastosuj nową wartość transformX
        ozzyContainer.style.transform = `translate(${nextTransformX}px, -50%)`;
        bossCurrentTransformX = nextTransformX; // Zaktualizuj zmienną stanu

        // Poproś o następną klatkę animacji
        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement);
    }


    // --- Funkcje Gry ---
    function resetGame() {
        console.log("resetGame called.");
        score = 0;
        scoreDisplay.textContent = score;
        // Zresetuj poziom
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        // Zresetuj stan bossa i jego obraz/styl
        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); // Usuń również klasę odwrócenia
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; // Zresetuj zdrowie do początkowej wartości normalnego Stonksa

        // Zresetuj obrażenia podstawowe zgodnie z poziomem ulepszenia (jeśli istnieje)
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        // Usuń klasę spawn-ozzy w przypadku resetu gry podczas animacji
        ozzyImage.classList.remove('spawn-ozzy');
        ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego na początku

        // Zresetuj pozycję ozzyContainer do centrum (ważne dla następnego spawnu)
        bossCurrentTransformX = 0; // Zresetuj dodatkowe przesunięcie
        ozzyContainer.style.transform = `translate(-50%, -50%)`; // Przywróć centrowanie CSS

        // Zatrzymaj ruch bossa, jeśli jest aktywny
        cancelAnimationFrame(bossMovementAnimationFrameId); // Użyj cancelAnimationFrame
        isBossMovementPaused = false; // Upewnij się, że flaga pauzy jest zresetowana

        // Usuń wszystkie cytaty z ekranu po resecie
        quoteImagesContainer.innerHTML = '';

        // Zresetuj stan supermocy i cooldowny
        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;

        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); // Wyczyść timer szału

        // Zresetuj Lodowy Wybuch
        freezeModeActive = false;
        clearInterval(freezeDotIntervalId);
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active');
        freezeEffect.innerHTML = '';


        lightningEffect.classList.add('hidden');
        freezeEffect.classList.add('hidden');
        frenzyEffect.classList.add('hidden');
        lightningEffect.innerHTML = ''; // Wyczyść segmenty pioruna
        freezeEffect.innerHTML = ''; // Wyczyść odłamki lodu


        // Usunięto: messageDisplay.style.display = 'none'; // Ukryj ogólną wiadomość
        // Usuń wszystkie aktywne wiadomości o nokaucie, jeśli istnieją
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        isGameActive = false;
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        upgradeShopScreen.classList.add('hidden'); // Ukryj sklep
        startScreen.classList.remove('hidden'); // Pokaż ekran startowy
        shopButton.classList.remove('hidden'); // Pokaż przycisk sklepu na ekranie startowym
        superpowerButtonsContainer.classList.add('hidden'); // Ukryj przyciski supermocy na ekranie startowym
        
        // ZMIANA: Ukryj kontener z punktami/poziomem
        gameInfoContainer.classList.add('hidden');

        // Zatrzymaj interwał timera cooldownu
        clearInterval(superpowerCooldownIntervalId);
        updateSuperpowerCooldownDisplays(); // Końcowa aktualizacja, aby pokazać oryginalny tekst

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    // Funkcja do wyświetlania OGÓLNYCH wiadomości (teraz również dla rozpoczęcia walki z bossem)
    // Będzie używać tych samych stylów co supermoce.
    function showMessage(message, duration = 1500) {
        // Stwórz nowy div dla wiadomości
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('knockout-message'); // Ponowne użycie stylizacji knockout-message
        dynamicMessageElement.textContent = message;

        // Dołącz do kontenera gry
        gameContainer.appendChild(dynamicMessageElement);

        // Ustaw timeout, aby usunąć wiadomość po jej czasie trwania
        setTimeout(() => {
            dynamicMessageElement.remove();
        }, duration);
    }
    
    // ZMIANA: NOWA FUNKCJA: Wyświetlanie komunikatów bossa
    function showBossMessage(message, duration = 2500) {
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('boss-message'); // Nowa klasa CSS dla komunikatów bossa
        dynamicMessageElement.textContent = message;
        gameContainer.appendChild(dynamicMessageElement);
        setTimeout(() => {
            dynamicMessageElement.remove();
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
        console.log("startGame called.");
        startScreen.classList.add('hidden');
        shopButton.classList.remove('hidden'); // Upewnij się, że przycisk sklepu jest widoczny podczas gry
        console.log("After hidden: startScreen display", window.getComputedStyle(startScreen).display);
        ozzyContainer.classList.remove('hidden'); // Pokaż Ozzy'ego
        
        // ZMIANA: Pokaż kontener z punktami/poziomem
        gameInfoContainer.classList.remove('hidden');
        
        superpowerButtonsContainer.classList.remove('hidden'); // Pokaż przyciski supermocy
        shopButton.classList.remove('hidden'); // Upewnij się, że przycisk sklepu jest widoczny podczas gry

        isGameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
        // Ustaw początkowy poziom
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        // Ustaw początkowy stan Stonksa (normalny, bez bossa)
        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; // Użyj oryginalnego obrazu Ozzy'ego
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); // Upewnij się, że nie jest odwrócony na początku
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH;

        // Ustaw obrażenia podstawowe na początku gry, uwzględniając ulepszenia
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        // Usuń klasę spawn-ozzy na początku gry
        ozzyImage.classList.remove('spawn-ozzy');

        // Zresetuj supermoce na początku gry
        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;

        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); // Wyczyść timer szału

        // Zresetuj Lodowy Wybuch
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
        // Usuń wszystkie aktywne wiadomości o nokaucie, jeśli istnieją
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        // ZMIANA: Usuń również komunikaty bossa
        document.querySelectorAll('.boss-message').forEach(el => el.remove());

        // Usuń cytaty, jeśli jakieś pozostały z poprzedniej sesji gry
        quoteImagesContainer.innerHTML = '';

        // Zatrzymaj i zresetuj ruch bossa
        cancelAnimationFrame(bossMovementAnimationFrameId); // Użyj cancelAnimationFrame
        isBossMovementPaused = false; // Upewnij się, że flaga pauzy jest zresetowana
        bossCurrentTransformX = 0; // Zresetuj dodatkowe przesunięcie X
        ozzyContainer.style.transform = `translate(-50%, -50%)`; // Wyśrodkuj Ozzy'ego za pomocą CSS

        // Rozpocznij interwał timera cooldownu
        clearInterval(superpowerCooldownIntervalId); // Wyczyść poprzedni, jeśli istnieje
        superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
        updateSuperpowerButtons(); // Początkowa aktualizacja stanu przycisków i tekstu

        if (backgroundMusic) {
            backgroundMusic.play().catch(e => console.error("Error playing backgroundMusic:", e));
        }
    }

    function endGame(message) {
        console.log("endGame called with message:", message);
        isGameActive = false;
        ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego po zakończeniu gry
        
        // ZMIANA: Ukryj kontener z punktami/poziomem
        gameInfoContainer.classList.add('hidden');
        
        // Usunięto: messageDisplay.style.display = 'none';
        quoteImagesContainer.innerHTML = ''; // Usuń wszystkie cytaty po zakończeniu gry
        // Usuń wszystkie aktywne wiadomości o nokaucie, jeśli istnieją
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        // ZMIANA: Usuń również komunikaty bossa
        document.querySelectorAll('.boss-message').forEach(el => el.remove());


        // Zresetuj wszystkie aktywne supermoce po zakończeniu gry
        frenzyModeActive = false;
        // Przywróć normalne obrażenia, uwzględniając bazowe ulepszenia
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
        clearTimeout(frenzyTimerId);

        // Zresetuj Lodowy Wybuch
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
        punchesSinceLastPowerup = 0; // Zresetuj licznik supermocy
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        updateSuperpowerButtons(); // Zaktualizuj stan przycisków

        // Zatrzymaj interwał timera cooldownu
        clearInterval(superpowerCooldownIntervalId);
        // Zatrzymaj ruch bossa, jeśli aktywny
        cancelAnimationFrame(bossMovementAnimationFrameId);
        isBossMovementPaused = false; // Upewnij się, że flaga pauzy jest zresetowana

        document.getElementById('end-message').textContent = message;
        finalScoreDisplay.textContent = score;

        saveScoreToLeaderboard(playerNickname, score);

        endScreen.classList.remove('hidden');

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    // Obsługuje nokaut Ozzy'ego
    function handleOzzyKnockout() {
        score++; // Uderzenia (wynik) nadal rosną
        scoreDisplay.textContent = score;

        currentLevel++; // Zwiększ poziom
        currentLevelDisplay.textContent = currentLevel; // Zaktualizuj wyświetlanie poziomu


        // Usuń istniejące wiadomości o nokaucie przed utworzeniem nowej
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        // ZMIANA: Usuń również komunikaty bossa
        document.querySelectorAll('.boss-message').forEach(el => el.remove());

        // Ozzy znika natychmiast po nokaucie
        ozzyContainer.classList.add('hidden');

        // Logika bossa / zwiększania zdrowia
        if (currentLevel > 0 && currentLevel % 10 === 0) {
            // To jest poziom bossa
            isBossFight = true;
            ozzyImage.src = BOSS_IMAGE_URL; // Zmień obraz na bossa
            ozzyImage.classList.add('boss-mode'); // Dodaj klasę stylizacji bossa
            INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH; // Boss ma zwiększone zdrowie

            // ZMIANA: WYŚWIETL KOMUNIKAT BOSSA UŻYWAJĄC NOWEJ FUNKCJI
            showBossMessage("UWAGA! BOSS STONKS! ROZPIERDOL GO!", 2500); // Dłuższy czas widoczności

            // Rozpocznij ruch bossa
            cancelAnimationFrame(bossMovementAnimationFrameId); // Upewnij się, że nie ma starego interwału
            isBossMovementPaused = false; // Upewnij się, że flaga pauzy jest zresetowana

            // Zresetuj bossCurrentTransformX i zastosuj transformację, aby wyśrodkować bossa
            bossCurrentTransformX = 0;
            ozzyContainer.style.transform = `translate(${bossCurrentTransformX}px, -50%)`;

            bossDx = BOSS_MOVEMENT_SPEED * (Math.random() < 0.5 ? 1 : -1); // Losowy kierunek początkowy
            if (bossDx < 0) {
                ozzyImage.classList.add('flipped-x');
            } else {
                ozzyImage.classList.remove('flipped-x');
            }
            bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement); // Rozpocznij animację bossa

        } else {
            // Normalny poziom
            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; // Przywróć normalny obraz
            ozzyImage.classList.remove('boss-mode'); // Usuń klasę stylizacji bossa
            ozzyImage.classList.remove('flipped-x'); // Usuń również klasę odwrócenia
            // Zresetuj pozycję ozzyContainer do centrum (dla następnego normalnego Stonksa)
            bossCurrentTransformX = 0; // Zresetuj dodatkowe przesunięcie
            ozzyContainer.style.transform = `translate(-50%, -50%)`; // Przywróć centrowanie CSS

            cancelAnimationFrame(bossMovementAnimationFrameId); // Zatrzymaj ruch bossa, jeśli aktywny
            isBossMovementPaused = false; // Upewnij się, że flaga pauzy jest zresetowana

            if (currentLevel > 0 && currentLevel % 5 === 0) {
                 INITIAL_OZZY_HEALTH += NORMAL_OZZY_HEALTH_INCREMENT; // Normalne zwiększenie zdrowia
                 showMessage(`Stonks jest silniejszy!`, 2000); // Komunikat o zwiększonym zdrowiu
            }
            // Utwórz i wyświetl nieblokującą wiadomość o nokaucie (standardowy styl)
            const knockoutMsgElement = document.createElement('div');
            knockoutMsgElement.classList.add('knockout-message'); // Użyj nowej klasy CSS
            knockoutMsgElement.textContent = 'Stonks rozjebany!'; // Standardowa wiadomość o nokaucie
            gameContainer.appendChild(knockoutMsgElement);

            setTimeout(() => {
                knockoutMsgElement.remove();
            }, 2000); // Pasuje do czasu trwania animacji CSS (fadeOutUpSmall)
        }

        ozzyHealth = INITIAL_OZZY_HEALTH; // Pełne zdrowie na nową rundę
        updateHealthBar(); // Pasek zdrowia aktualizuje się natychmiast

        // Ozzy pojawia się ponownie po BARDZO KRÓTKIM opóźnieniu z animacją
        setTimeout(() => {
            ozzyContainer.classList.remove('hidden');
            ozzyImage.classList.remove('hit-effect');
            // ZMIANA: Upewnij się, że ozzyContainer jest wyśrodkowany przed nałożeniem animacji
            ozzyContainer.style.transform = `translate(-50%, -50%)`;
            ozzyImage.classList.add('spawn-ozzy'); // Dodaj klasę animacji pojawiania się

            // Usuń klasę animacji po jej zakończeniu, aby nie kolidowała z innymi animacjami/stylami
            setTimeout(() => {
                ozzyImage.classList.remove('spawn-ozzy');
            }, 500); // czas trwania animacji spawnOzzy w CSS
        }, 200); // Czas "nieobecności" Ozzy'ego na ekranie przed ponownym pojawieniem się (0.2 sekundy)

    }

    function handlePunch(event) {
        console.log("handlePunch called.");
        // Usunięto warunek isOzzyDown, aby umożliwić klikanie Ozzy'ego zaraz po nokaucie
        if (!isGameActive) {
            return;
        }

        const punchSoundInstance = new Audio('punch.mp3');
        punchSoundInstance.play().catch(e => console.error("Error playing punchSoundInstance:", e));
        punchSoundInstance.onended = () => {
            punchSoundInstance.remove();
        };

        applyDamageToOzzy(PUNCH_DAMAGE); // Użyj bieżących obrażeń podstawowych

        ozzyImage.classList.add('hit-effect');
        setTimeout(() => {
            ozzyImage.classList.remove('hit-effect');
        }, 150);

        // Sprawdź, czy Ozzy został trafiony i czy istnieje szansa na pojawienie się cytatu
        if (!isBossFight && ozzyHealth > 0 && Math.random() < 0.3) { // 30% szans na cytat po trafieniu (tylko dla normalnego Stonksa)
            spawnRandomQuote();
        } else if (isBossFight && ozzyHealth > 0 && Math.random() < 0.2) { // 20% szans na cytat bossa
            // Sprawdź, czy nie ma już wyświetlanej innej wiadomości "knockout-message" lub "boss-message"
            if (document.querySelectorAll('.knockout-message').length === 0 && document.querySelectorAll('.boss-message').length === 0) {
                const randomBossQuote = BOSS_QUOTES[Math.floor(Math.random() * BOSS_QUOTES.length)];
                // ZMIANA: Użyj showBossMessage dla cytatów bossa
                showBossMessage(randomBossQuote, 2000); // Znika po 2 sekundach
            }
        }

        // Zwiększ licznik uderzeń supermocy
        punchesSinceLastPowerup++;
        updateSuperpowerButtons(); // Zaktualizuj stan przycisków supermocy (w tym cooldowny)
    }

    // --- NOWE: Funkcje Sklepu Ulepszeń ---
    function calculateUpgradeCost(currentLevel) {
        return Math.ceil(UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, currentLevel - 1));
    }

    function updateUpgradeShopUI() {
        // Obrażenia Podstawowe
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
                // LIGHTNING_BASE_DAMAGE jest używane do obliczeń w activateLightningStrike, więc nie musimy zmieniać go bezpośrednio tutaj,
                // ale możemy wizualnie pokazać efekt:
                const nextLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage -1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Piorun Zagłady! Poziom: ${upgradeLevels.lightningDamage} (Obrażenia: ~${nextLightningDamage})`, 1500);
            } else if (upgradeType === 'freezeDamage') {
                // Podobnie dla Zamrożenia, obrażenia będą obliczane w activateIceBlast
                const nextInitialFreezeDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
                const nextDotFreezeDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Lodowy Wybuch! Poziom: ${upgradeLevels.freezeDamage} (Obrażenia: ~${nextInitialFreezeDamage}, DOT: ~${nextDotFreezeDamage}/s)`, 1500);
            } else if (upgradeType === 'frenzyDamage') {
                // Podobnie dla Szału, obrażenia będą obliczane w activateFrenzy
                const nextFrenzyDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Szał Bojowy! Poziom: ${upgradeLevels.frenzyDamage} (Obrażenia: ~${nextFrenzyDamage})`, 1500);
            }

            updateUpgradeShopUI(); // Odśwież UI sklepu po zakupie
        } else {
            showMessage("Za mało punktów!", 1000);
        }
    }


    // Ważne: to sprawdza, czy skrypt w ogóle działa
    console.log("Script.js is running!");

    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOMContentLoaded: DOM został załadowany!");

        // WAŻNE: Natychmiast ukryj ekran sklepu z ulepszeniami po załadowaniu.
        // Zapobiega to krótkiemu wyświetleniu, jeśli resetGame jest wolne.
        upgradeShopScreen.classList.add('hidden');

        // Upewnij się, że wszystkie ekrany są początkowo ukryte, z wyjątkiem startScreen, który jest widoczny przez resetGame()
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        ozzyContainer.classList.add('hidden');
        
        // ZMIANA: Ukryj kontener z punktami/poziomem
        gameInfoContainer.classList.add('hidden'); 
        
        quoteImagesContainer.innerHTML = ''; // Upewnij się, że kontener cytatów jest pusty na początku

        resetGame(); // Ta funkcja zresetuje również supermoce i cooldowny

        console.log("Initial game container dimensions:", gameContainer.offsetWidth, gameContainer.offsetHeight);
        console.log("Initial target image (Ozzy) dimensions:", ozzyImage.offsetWidth, ozzyImage.offsetHeight);

        // Zainicjuj anonimowe uwierzytelnianie po załadowaniu DOM
        try {
            const userCredential = await signInAnonymously(auth);
            currentUserId = userCredential.user.uid;
            console.log("Logged in anonymously. UID:", currentUserId);
        } catch (error) {
            console.error("Error with anonymous login:", error);
            showMessage("Błąd połączenia z rankingiem. Spróbuj odświeżyć stronę.", 5000);
        }
        console.log("DOMContentLoaded: Authentication completed.");

        // --- Obsługa Zdarzeń ---
        startButton.addEventListener('click', () => {
            console.log("Przycisk START kliknięty!");
            const nick = nicknameInput.value.trim();
            if (nick === "") {
                showMessage("Musisz wpisać swój nick!", 2000);
                return;
            }
            playerNickname = nick;
            startGame();
        });

        showLeaderboardButton.addEventListener('click', () => {
            console.log("Przycisk RANKING kliknięty!");
            startScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); // Ukryj przycisk sklepu po otwarciu rankingu
            superpowerButtonsContainer.classList.add('hidden'); // Ukryj przyciski supermocy
            ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego
            
            // ZMIANA: Ukryj kontener z punktami/poziomem
            gameInfoContainer.classList.add('hidden'); 
            
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        restartButton.addEventListener('click', () => {
            console.log("Przycisk RESTART kliknięty!");
            resetGame();
        });

        ozzyContainer.addEventListener('click', handlePunch);
        ozzyContainer.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Zapobiegaj domyślnemu zachowaniu przeglądarki (np. powiększanie)
            handlePunch(event);
        }, { passive: false });

        showLeaderboardAfterGameButton.addEventListener('click', () => {
            console.log("Przycisk POKAŻ RANKING (po grze) kliknięty!");
            endScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); // Ukryj przycisk sklepu po otwarciu rankingu
            superpowerButtonsContainer.classList.add('hidden'); // Ukryj przyciski supermocy
            ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego
            
            // ZMIANA: Ukryj kontener z punktami/poziomem
            gameInfoContainer.classList.add('hidden'); 
            
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        backToStartButton.addEventListener('click', () => {
            console.log("Przycisk WRÓĆ DO MENU kliknięty!");
            leaderboardScreen.classList.add('hidden');
            resetGame(); // Ta funkcja już pokazuje ekran startowy i przycisk sklepu
        });

        // Obsługa kliknięć przycisków supermocy
        btnLightning.addEventListener('click', activateLightningStrike);
        btnFreeze.addEventListener('click', activateIceBlast);
        btnFrenzy.addEventListener('click', activateFrenzy);

        // --- NOWE: Obsługa zdarzeń sklepu z ulepszeniami ---
        shopButton.addEventListener('click', () => {
            // ZMIENIONO: Logika wstrzymywania gry
            isGameActive = false; // Wstrzymaj grę
            cancelAnimationFrame(bossMovementAnimationFrameId); // Zatrzymaj ruch bossa
            isBossMovementPaused = true; // Ustaw flagę pauzy ruchu bossa
            clearInterval(superpowerCooldownIntervalId); // Zatrzymaj aktualizację timera cooldownu

            ozzyContainer.classList.add('hidden'); // Ukryj Ozzy'ego
            superpowerButtonsContainer.classList.add('hidden'); // Ukryj przyciski supermocy
            shopButton.classList.add('hidden'); // Ukryj przycisk sklepu
            
            // ZMIANA: Ukryj kontener z punktami/poziomem
            gameInfoContainer.classList.add('hidden'); 

            upgradeShopScreen.classList.remove('hidden'); // Pokaż ekran sklepu
            updateUpgradeShopUI(); // Odśwież UI sklepu po otwarciu
        });

        closeShopButton.addEventListener('click', () => {
            upgradeShopScreen.classList.add('hidden'); // Ukryj ekran sklepu

            // ZMIENIONO: Logika wznawiania gry
            ozzyContainer.classList.remove('hidden'); // Pokaż Ozzy'ego
            superpowerButtonsContainer.classList.remove('hidden'); // Pokaż przyciski supermocy
            shopButton.classList.remove('hidden'); // Pokaż przycisk sklepu
            
            // ZMIANA: Pokaż kontener z punktami/poziomem
            gameInfoContainer.classList.remove('hidden'); 

            isGameActive = true; // Wznów grę
            isBossMovementPaused = false; // Zresetuj flagę pauzy ruchu bossa
            if (isBossFight) { // Jeśli to walka z bossem, wznów ruch
                animateBossMovement();
            }
            // Wznów interwał timera cooldownu
            clearInterval(superpowerCooldownIntervalId); // Upewnij się, że poprzedni jest wyczyszczony
            superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
            updateSuperpowerButtons(); // Zaktualizuj stan przycisków

            // W przypadku Lodowego Wybuchu, jeśli był aktywny, wznów jego DOT
            if (freezeModeActive) {
                activateIceBlast(); // Wywołanie go ponownie aktywuje interwał DOT
            }
        });

        buyBaseDamageButton.addEventListener('click', () => buyUpgrade('baseDamage'));
        buyLightningDamageButton.addEventListener('click', () => buyUpgrade('lightningDamage'));
        buyFreezeDamageButton.addEventListener('click', () => buyUpgrade('freezeDamage'));
        buyFrenzyDamageButton.addEventListener('click', () => buyUpgrade('frenzyDamage'));

        // Początkowa aktualizacja UI sklepu po załadowaniu gry
        updateUpgradeShopUI();
    });
