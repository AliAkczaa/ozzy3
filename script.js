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

    // --- ZMIANA: Deklaracja WSZYSTKICH zmiennych DOM globalnie (bez przypisania wartości na tym etapie) ---
    let backgroundTractor;
    let ozzyContainer;
    let ozzyImage;
    let healthBarFill;
    let gameContainer; // GŁÓWNY KONTENER GRY
    let gameInfoContainer;
    let scoreDisplay;
    let currentLevelDisplay;
    let startScreen;
    let startButton;
    let nicknameInput;
    let showLeaderboardButton;
    let endScreen;
    let finalScoreDisplay;
    let restartButton;
    let showLeaderboardAfterGameButton;
    let leaderboardScreen;
    let leaderboardList;
    let backToStartButton;
    let superpowerButtonsContainer;
    let btnLightning;
    let btnFreeze;
    let btnFrenzy;
    let lightningEffect;
    let freezeEffect;
    let frenzyEffect;
    let backgroundMusic;
    let punchSound;
    let shopButton;
    let upgradeShopScreen;
    let closeShopButton;
    let baseDamageLevelDisplay;
    let baseDamageCostDisplay;
    let buyBaseDamageButton;
    let lightningDamageLevelDisplay;
    let lightningDamageCostDisplay;
    let buyLightningDamageButton;
    let freezeDamageLevelDisplay;
    let freezeDamageCostDisplay;
    let buyFreezeDamageButton;
    let frenzyDamageLevelDisplay;
    let frenzyDamageCostDisplay;
    let buyFrenzyDamageButton;
    let quoteImagesContainer; // Dodane, aby było dostępne globalnie

    // --- Inne zmienne globalne (niezwiązane bezpośrednio z DOM) ---
    let playerNickname = "Gracz";
    let score = 0;
    let ozzyHealth = 100;
    let INITIAL_OZZY_HEALTH = 100;
    let PUNCH_DAMAGE = 10; 
    let currentUserId = null;
    let isGameActive = false; 

    let currentLevel = 0;
    let isBossFight = false;

    let punchesSinceLastPowerup = 0;

    const quoteImagePaths = [
        '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png',
        '10.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png',
        '18.png', '19.png', '20.png', '21.png', '22.png', '23.png', '24.png', '25.png',
        '26.png', '27.png', '28.png'
    ];
    const QUOTE_DISPLAY_DURATION_MS = 2000;
    const QUOTE_SIZE_PX = 150;

    const PUNCHES_PER_POWERUP = 10; 
    const COOLDOWN_DURATION_MS = 60 * 1000; 

    let lastUsedLightningTime = 0; 
    let lastUsedFreezeTime = 0; 
    let lastUsedFrenzyTime = 0; 

    let frenzyModeActive = false;
    let frenzyTimerId;
    const FRENZY_DAMAGE_MULTIPLIER = 3; 
    const FRENZY_DURATION_MS = 5000; 

    let LIGHTNING_BASE_DAMAGE = 150; 
    let ICE_BLAST_INITIAL_DAMAGE = 50;
    let ICE_BLAST_DOT_DAMAGE_PER_SECOND = 25;
    const ICE_BLAST_DOT_DURATION_SECONDS = 5;
    let FRENZY_INITIAL_DAMAGE = 30;

    let superpowerCooldownIntervalId; 

    let freezeModeActive = false;
    let freezeDotIntervalId;

    const ORIGINAL_OZZY_IMAGE_URL = 'zdjecie 2.jpg';
    const BOSS_IMAGE_URL = 'stonksboss.png'; 

    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    const NORMAL_OZZY_HEALTH_INCREMENT = 20; 
    const BOSS_INITIAL_HEALTH = 450; 

    const BOSS_MOVEMENT_SPEED = 2; 
    const BOSS_QUOTES = [
        "CHLOPY OD CRYPTONA FARMIA!", "TTB TO GÓWNO! TYLKO STONKS!", 
        "DO DUBAJU! ZA KASE INWESTORÓW!", "Jeden launchpad, jeden bot, jeden dex!", 
        "Farmer z bsc tom pisze ze to ja jestem scammerem"
    ];
    let bossMovementAnimationFrameId; 
    let bossDx = BOSS_MOVEMENT_SPEED; 
    let bossCurrentTransformX = 0; 

    const CLIENT_SIDE_MAX_SCORE = 200;

    let upgradeLevels = {
        baseDamage: 1, lightningDamage: 1, freezeDamage: 1, frenzyDamage: 1
    };

    const UPGRADE_COST_BASE = 10;
    const UPGRADE_COST_MULTIPLIER = 1.5; 
    const DAMAGE_INCREASE_PER_LEVEL = 5; 

    const LIGHTNING_DAMAGE_INCREASE_PER_LEVEL = 30; 
    const FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL = 10; 
    const FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL = 5; 
    const FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL = 15; 


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
                const result = await submitScoreFunction({ nickname: nickname, score: score });
                console.log("Response from Cloud Function:", result.data);
                showMessage(result.data.message, 2000);
            } catch (error) {
                console.error("Error calling Cloud Function:", error.code, error.message);
                showMessage(`Błąd zapisu: ${error.message}`, 3000);
            }
        } else if (!currentUserId) {
            console.warn("Cannot save score: User is not authenticated. Check Firebase Auth configuration.");
            showMessage("Błąd: Brak uwierzytelnień do zapisu wyniku.", 3000);
        }
    }

    async function fetchAndDisplayLeaderboard() {
        console.log("fetchAndDisplayLeaderboard called.");
        leaderboardList.innerHTML = ''; 
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
        img.classList.add('quote-image'); 

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const maxX = gameContainerRect.width - QUOTE_SIZE_PX;
        const maxY = gameContainerRect.height - QUOTE_SIZE_PX;

        const randomX = Math.random() * Math.max(0, maxX);
        const randomY = Math.random() * Math.max(0, maxY);

        img.style.left = `${randomX}px`;
        img.style.top = `${randomY}px`;

        const randomRotation = Math.random() * 90 - 45; 
        img.style.transform = `rotate(${randomRotation}deg)`;

        quoteImagesContainer.appendChild(img);

        setTimeout(() => {
            img.classList.add('active');
        }, 10); 

        setTimeout(() => {
            img.classList.remove('active'); 
            setTimeout(() => {
                img.remove(); 
            }, 500); 
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

        if (canUseLightning || canUseFreeze || canUseFrenzy) {
            superpowerButtonsContainer.style.pointerEvents = 'auto';
        } else {
            superpowerButtonsContainer.style.pointerEvents = 'none';
        }

        updateSuperpowerCooldownDisplays();
    }

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
                button.textContent = originalText; 
            }
        };

        updateButtonText(btnLightning, lastUsedLightningTime, originalLightningText);
        updateButtonText(btnFreeze, lastUsedFreezeTime, originalFreezeText);
        updateButtonText(btnFrenzy, lastUsedFrenzyTime, originalFrenzyText);
    }


    function activateLightningStrike() {
        if (!isGameActive || btnLightning.disabled) return;

        showMessage("PIORUN ZAGŁADY!", 1500);
        punchesSinceLastPowerup = 0; 
        lastUsedLightningTime = Date.now(); 
        updateSuperpowerButtons(); 

        const actualLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage - 1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualLightningDamage); 

        const segments = 10; 
        const ozzyRect = ozzyContainer.getBoundingClientRect();
        const startX = ozzyRect.left + ozzyRect.width / 2;
        const startY = ozzyRect.top - 50; 

        for (let i = 0; i < segments; i++) {
            const segment = document.createElement('div');
            segment.classList.add('lightning-segment');

            const length = Math.random() * 50 + 30; 
            const angle = Math.random() * 40 - 20; 
            const width = Math.random() * 5 + 3; 

            segment.style.width = `${width}px`;
            segment.style.height = `${length}px`;
            segment.style.left = `${startX + (Math.random() - 0.5) * 50}px`; 
            segment.style.top = `${startY + i * (ozzyRect.height / segments) + (Math.random() - 0.5) * 20}px`;
            segment.style.transform = `rotate(${angle}deg)`;
            segment.style.transformOrigin = `center top`; 

            lightningEffect.appendChild(segment);
        }

        lightningEffect.classList.remove('hidden');

        setTimeout(() => {
            lightningEffect.classList.add('hidden');
            lightningEffect.innerHTML = ''; 
        }, 1000); 
    }

    function activateIceBlast() {
        if (!isGameActive || btnFreeze.disabled) return;

        showMessage("LODOWY WYBUCH!", 1500);
        punchesSinceLastPowerup = 0; 
        lastUsedFreezeTime = Date.now(); 
        updateSuperpowerButtons(); 

        const actualIceBlastInitialDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
        const actualIceBlastDotDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;

        freezeEffect.classList.remove('hidden');
        freezeEffect.classList.add('active'); 

        applyDamageToOzzy(actualIceBlastInitialDamage); 

        freezeModeActive = true; 
        let dotTicks = 0;
        const maxDotTicks = ICE_BLAST_DOT_DURATION_SECONDS;

        clearInterval(freezeDotIntervalId); 
        freezeDotIntervalId = setInterval(() => {
            if (!isGameActive && !upgradeShopScreen.classList.contains('hidden')) { 
                clearInterval(freezeDotIntervalId);
                return;
            }
            if (!isGameActive) { 
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; 
                freezeEffect.classList.remove('active'); 
                freezeEffect.innerHTML = ''; 
                return;
            }
            applyDamageToOzzy(actualIceBlastDotDamage);
            dotTicks++;

            const ozzyRect = ozzyContainer.getBoundingClientRect();
            for (let i = 0; i < 5; i++) { 
                const shard = document.createElement('div');
                shard.classList.add('ice-shard');
                shard.style.left = `${ozzyRect.left + Math.random() * ozzyRect.width}px`;
                shard.style.top = `${ozzyRect.top + Math.random() * ozzyRect.height}px`;
                freezeEffect.appendChild(shard);
                setTimeout(() => {
                    shard.remove();
                }, 1000);
            }

            if (dotTicks >= maxDotTicks) {
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; 
                freezeEffect.classList.remove('active'); 
                freezeEffect.innerHTML = ''; 
                showMessage("Lodowy Wybuch osłabł.", 1000); 
            }
        }, 1000); 
    }

    function activateFrenzy() {
        if (!isGameActive || btnFrenzy.disabled) return;

        showMessage("SZAŁ BOJOWY!", 1500);
        punchesSinceLastPowerup = 0; 
        lastUsedFrenzyTime = Date.now(); 
        updateSuperpowerButtons(); 

        const actualFrenzyInitialDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualFrenzyInitialDamage); 

        frenzyModeActive = true;
        PUNCH_DAMAGE *= FRENZY_DAMAGE_MULTIPLIER; 
        frenzyEffect.classList.remove('hidden');
        frenzyEffect.classList.add('active');

        clearTimeout(frenzyTimerId); 
        frenzyTimerId = setTimeout(() => {
            frenzyModeActive = false;
            PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL; 
            frenzyEffect.classList.add('hidden');
            frenzyEffect.classList.remove('active');
            showMessage("Szał minął. Normalne uderzenia.", 1500);
        }, FRENZY_DURATION_MS);
    }


    // --- Funkcja Animacji Ruchu Bossa ---
    let isBossMovementPaused = false; 
    function animateBossMovement() {
        if (!isGameActive || !isBossFight || isBossMovementPaused) { 
            cancelAnimationFrame(bossMovementAnimationFrameId); 
            return;
        }

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const ozzyRect = ozzyContainer.getBoundingClientRect(); 

        let nextTransformX = bossCurrentTransformX + bossDx;

        const maxOffsetRight = (gameContainerRect.width / 2) - (ozzyRect.width / 2);
        const maxOffsetLeft = -((gameContainerRect.width / 2) - (ozzyRect.width / 2));

        if (nextTransformX > maxOffsetRight) {
            nextTransformX = maxOffsetRight; 
            bossDx *= -1; 
            ozzyImage.classList.add('flipped-x'); 
        } else if (nextTransformX < maxOffsetLeft) {
            nextTransformX = maxOffsetLeft; 
            bossDx *= -1; 
            ozzyImage.classList.remove('flipped-x'); 
        }

        ozzyContainer.style.transform = `translate(${nextTransformX}px, -50%)`;
        bossCurrentTransformX = nextTransformX; 

        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement);
    }


    // --- Funkcje Gry ---
    function resetGame() {
        console.log("resetGame called.");
        score = 0;
        scoreDisplay.textContent = score;
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); 
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; 

        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        ozzyImage.classList.remove('spawn-ozzy');
        ozzyContainer.classList.add('hidden'); 

        bossCurrentTransformX = 0; 
        ozzyContainer.style.transform = `translate(-50%, -50%)`; 

        cancelAnimationFrame(bossMovementAnimationFrameId); 
        isBossMovementPaused = false; 

        quoteImagesContainer.innerHTML = '';

        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;

        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); 

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

        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        isGameActive = false;
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        upgradeShopScreen.classList.add('hidden'); 
        startScreen.classList.remove('hidden'); 
        shopButton.classList.remove('hidden'); 
        superpowerButtonsContainer.classList.add('hidden'); 
        
        gameInfoContainer.classList.add('hidden');

        clearInterval(superpowerCooldownIntervalId);
        updateSuperpowerCooldownDisplays(); 

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    function showMessage(message, duration = 1500) {
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('knockout-message'); 
        dynamicMessageElement.textContent = message;

        gameContainer.appendChild(dynamicMessageElement);

        setTimeout(() => {
            dynamicMessageElement.remove();
        }, duration);
    }
    
    function showBossMessage(message, duration = 2500) {
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('boss-message'); 
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
        shopButton.classList.remove('hidden'); 
        console.log("After hidden: startScreen display", window.getComputedStyle(startScreen).display);
        ozzyContainer.classList.remove('hidden'); 
        
        gameInfoContainer.classList.remove('hidden');
        
        superpowerButtonsContainer.classList.remove('hidden'); 
        shopButton.classList.remove('hidden'); 

        isGameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; 
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); 
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH;

        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        ozzyImage.classList.remove('spawn-ozzy');

        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;

        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); 

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
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        document.querySelectorAll('.boss-message').forEach(el => el.remove());

        quoteImagesContainer.innerHTML = '';

        cancelAnimationFrame(bossMovementAnimationFrameId); 
        isBossMovementPaused = false; 
        bossCurrentTransformX = 0; 
        ozzyContainer.style.transform = `translate(-50%, -50%)`; 

        clearInterval(superpowerCooldownIntervalId); 
        superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
        updateSuperpowerButtons(); 

        if (backgroundMusic) {
            backgroundMusic.play().catch(e => console.error("Error playing backgroundMusic:", e));
        }
    }

    function endGame(message) {
        console.log("endGame called with message:", message);
        isGameActive = false;
        ozzyContainer.classList.add('hidden'); 
        
        gameInfoContainer.classList.add('hidden');
        
        quoteImagesContainer.innerHTML = ''; 
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        document.querySelectorAll('.boss-message').forEach(el => el.remove());


        frenzyModeActive = false;
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
        clearTimeout(frenzyTimerId);

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
        punchesSinceLastPowerup = 0; 
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        updateSuperpowerButtons(); 

        clearInterval(superpowerCooldownIntervalId);
        cancelAnimationFrame(bossMovementAnimationFrameId);
        isBossMovementPaused = false; 

        document.getElementById('end-message').textContent = message;
        document.getElementById('final-score').textContent = score; 

        saveScoreToLeaderboard(playerNickname, score);

        endScreen.classList.remove('hidden');

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    function handleOzzyKnockout() {
        score++; 
        scoreDisplay.textContent = score;

        currentLevel++; 
        currentLevelDisplay.textContent = currentLevel; 

        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        document.querySelectorAll('.boss-message').forEach(el => el.remove());

        ozzyContainer.classList.add('hidden');

        if (currentLevel > 0 && currentLevel % 10 === 0) {
            isBossFight = true;
            ozzyImage.src = BOSS_IMAGE_URL; 
            ozzyImage.classList.add('boss-mode'); 
            INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH; 

            showBossMessage("UWAGA! BOSS STONKS! ROZPIERDOL GO!", 2500); 

            cancelAnimationFrame(bossMovementAnimationFrameId); 
            isBossMovementPaused = false; 

            bossCurrentTransformX = 0;
            ozzyContainer.style.transform = `translate(${bossCurrentTransformX}px, -50%)`;

            bossDx = BOSS_MOVEMENT_SPEED * (Math.random() < 0.5 ? 1 : -1); 
            if (bossDx < 0) {
                ozzyImage.classList.add('flipped-x');
            } else {
                ozzyImage.classList.remove('flipped-x');
            }
            bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement); 

        } else {
            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; 
            ozzyImage.classList.remove('boss-mode'); 
            ozzyImage.classList.remove('flipped-x'); 
            bossCurrentTransformX = 0; 
            ozzyContainer.style.transform = `translate(-50%, -50%)`; 

            cancelAnimationFrame(bossMovementAnimationFrameId); 
            isBossMovementPaused = false; 

            if (currentLevel > 0 && currentLevel % 5 === 0) {
                 INITIAL_OZZY_HEALTH += NORMAL_OZZY_HEALTH_INCREMENT; 
                 showMessage(`Stonks jest silniejszy!`, 2000); 
            }
            const knockoutMsgElement = document.createElement('div');
            knockoutMsgElement.classList.add('knockout-message'); 
            knockoutMsgElement.textContent = 'Stonks rozjebany!'; 
            gameContainer.appendChild(knockoutMsgElement);

            setTimeout(() => {
                knockoutMsgElement.remove();
            }, 2000); 
        }

        ozzyHealth = INITIAL_OZZY_HEALTH; 
        updateHealthBar(); 

        setTimeout(() => {
            ozzyContainer.classList.remove('hidden');
            ozzyImage.classList.remove('hit-effect');
            ozzyContainer.style.transform = `translate(-50%, -50%)`; 
            ozzyImage.classList.add('spawn-ozzy'); 

            setTimeout(() => {
                ozzyImage.classList.remove('spawn-ozzy');
            }, 500); 
        }, 200); 
    }

    function handlePunch(event) {
        console.log("handlePunch called.");
        if (!isGameActive) {
            return;
        }

        const punchSoundInstance = new Audio('punch.mp3');
        punchSoundInstance.play().catch(e => console.error("Error playing punchSoundInstance:", e));
        punchSoundInstance.onended = () => {
            punchSoundInstance.remove();
        };

        applyDamageToOzzy(PUNCH_DAMAGE); 

        ozzyImage.classList.add('hit-effect');
        setTimeout(() => {
            ozzyImage.classList.remove('hit-effect');
        }, 150);

        if (!isBossFight && ozzyHealth > 0 && Math.random() < 0.3) { 
            spawnRandomQuote();
        } else if (isBossFight && ozzyHealth > 0 && Math.random() < 0.2) { 
            if (document.querySelectorAll('.knockout-message').length === 0 && document.querySelectorAll('.boss-message').length === 0) {
                const randomBossQuote = BOSS_QUOTES[Math.floor(Math.random() * BOSS_QUOTES.length)];
                showBossMessage(randomBossQuote, 2000); 
            }
        }

        punchesSinceLastPowerup++;
        updateSuperpowerButtons(); 
    }

    // --- NOWE: Funkcje Sklepu Ulepszeń ---
    function calculateUpgradeCost(currentLevel) {
        return Math.ceil(UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, currentLevel - 1));
    }

    function updateUpgradeShopUI() {
        baseDamageLevelDisplay.textContent = upgradeLevels.baseDamage;
        const nextBaseDamageCost = calculateUpgradeCost(upgradeLevels.baseDamage);
        baseDamageCostDisplay.textContent = nextBaseDamageCost;
        buyBaseDamageButton.disabled = score < nextBaseDamageCost;

        lightningDamageLevelDisplay.textContent = upgradeLevels.lightningDamage;
        const nextLightningDamageCost = calculateUpgradeCost(upgradeLevels.lightningDamage);
        lightningDamageCostDisplay.textContent = nextLightningDamageCost;
        buyLightningDamageButton.disabled = score < nextLightningDamageCost;

        freezeDamageLevelDisplay.textContent = upgradeLevels.freezeDamage;
        const nextFreezeDamageCost = calculateUpgradeCost(upgradeLevels.freezeDamage);
        freezeDamageCostDisplay.textContent = nextFreezeDamageCost;
        buyFreezeDamageButton.disabled = score < nextFreezeDamageCost;

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

            if (upgradeType === 'baseDamage') {
                PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Obrażenia Podstawowe! Nowe obrażenia: ${PUNCH_DAMAGE}`, 1500);
            } else if (upgradeType === 'lightningDamage') {
                const nextLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage -1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Piorun Zagłady! Poziom: ${upgradeLevels.lightningDamage} (Obrażenia: ~${nextLightningDamage})`, 1500);
            } else if (upgradeType === 'freezeDamage') {
                const nextInitialFreezeDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
                const nextDotFreezeDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Lodowy Wybuch! Poziom: ${upgradeLevels.freezeDamage} (Obrażenia: ~${nextInitialFreezeDamage}, DOT: ~${nextDotFreezeDamage}/s)`, 1500);
            } else if (upgradeType === 'frenzyDamage') {
                const nextFrenzyDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Szał Bojowy! Poziom: ${upgradeLevels.frenzyDamage} (Obrażenia: ~${nextFrenzyDamage})`, 1500);
            }

            updateUpgradeShopUI(); 
        } else {
            showMessage("Za mało punktów!", 1000);
        }
    }


    console.log("Script.js is running!");

    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOMContentLoaded: DOM został załadowany!");

        // === PRZYPISANIE WARTOŚCI do zmiennych DOM globalnych ===
        backgroundTractor = document.getElementById('animated-background-tractor');
        ozzyContainer = document.getElementById('ozzy-container');
        ozzyImage = document.getElementById('ozzy-image');
        healthBarFill = document.getElementById('health-bar-fill');
        gameContainer = document.getElementById('game-container'); 
        gameInfoContainer = document.getElementById('game-info-container');
        scoreDisplay = document.getElementById('score');
        currentLevelDisplay = document.getElementById('current-level');
        startScreen = document.getElementById('start-screen');
        startButton = document.getElementById('start-button');
        nicknameInput = document.getElementById('nickname-input');
        showLeaderboardButton = document.getElementById('show-leaderboard-button');
        endScreen = document.getElementById('end-screen');
        finalScoreDisplay = document.getElementById('final-score');
        restartButton = document.getElementById('restart-button');
        showLeaderboardAfterGameButton = document.getElementById('show-leaderboard-after-game-button');
        leaderboardScreen = document.getElementById('leaderboard-screen');
        leaderboardList = document.getElementById('leaderboard-list');
        backToStartButton = document.getElementById('back-to-start-button');
        superpowerButtonsContainer = document.getElementById('superpower-buttons-container');
        btnLightning = document.getElementById('btn-lightning');
        btnFreeze = document.getElementById('btn-freeze');
        btnFrenzy = document.getElementById('btn-frenzy');
        lightningEffect = document.getElementById('lightning-effect');
        freezeEffect = document.getElementById('freeze-effect');
        frenzyEffect = document.getElementById('frenzy-effect');
        backgroundMusic = document.getElementById('background-music');
        punchSound = document.getElementById('punch-sound');
        shopButton = document.getElementById('shop-button');
        upgradeShopScreen = document.getElementById('upgrade-shop-screen');
        closeShopButton = document.getElementById('close-shop-button');
        baseDamageLevelDisplay = document.getElementById('base-damage-level');
        baseDamageCostDisplay = document.getElementById('base-damage-cost');
        buyBaseDamageButton = document.getElementById('buy-base-damage');
        lightningDamageLevelDisplay = document.getElementById('lightning-damage-level');
        lightningDamageCostDisplay = document.getElementById('lightning-damage-cost');
        buyLightningDamageButton = document.getElementById('buy-lightning-damage');
        freezeDamageLevelDisplay = document.getElementById('freeze-damage-level');
        freezeDamageCostDisplay = document.getElementById('freeze-damage-cost');
        buyFreezeDamageButton = document.getElementById('buy-freeze-damage');
        frenzyDamageLevelDisplay = document.getElementById('frenzy-damage-level');
        frenzyDamageCostDisplay = document.getElementById('frenzy-cost'); 
        buyFrenzyDamageButton = document.getElementById('buy-frenzy-damage');
        quoteImagesContainer = document.getElementById('quote-images-container'); // Ostatecznie przypisane tutaj

        // WAŻNE: Natychmiast ukryj ekran sklepu z ulepszeniami po załadowaniu.
        upgradeShopScreen.classList.add('hidden');

        // Upewnij się, że wszystkie ekrany są początkowo ukryte, z wyjątkiem startScreen, który jest widoczny przez resetGame()
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        ozzyContainer.classList.add('hidden');
        
        gameInfoContainer.classList.add('hidden'); 
        
        quoteImagesContainer.innerHTML = ''; 

        resetGame(); 

        console.log("Initial game container dimensions:", gameContainer.offsetWidth, gameContainer.offsetHeight);
        console.log("Initial target image (Ozzy) dimensions:", ozzyImage.offsetWidth, ozzyImage.offsetHeight);

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
            shopButton.classList.add('hidden'); 
            superpowerButtonsContainer.classList.add('hidden'); 
            ozzyContainer.classList.add('hidden'); 
            
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
            event.preventDefault(); 
            handlePunch(event);
        }, { passive: false });

        showLeaderboardAfterGameButton.addEventListener('click', () => {
            console.log("Przycisk POKAŻ RANKING (po grze) kliknięty!");
            endScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); 
            superpowerButtonsContainer.classList.add('hidden'); 
            ozzyContainer.classList.add('hidden'); 
            
            gameInfoContainer.classList.add('hidden'); 
            
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        backToStartButton.addEventListener('click', () => {
            console.log("Przycisk WRÓĆ DO MENU kliknięty!");
            leaderboardScreen.classList.add('hidden');
            resetGame(); 
        });

        btnLightning.addEventListener('click', activateLightningStrike);
        btnFreeze.addEventListener('click', activateIceBlast);
        btnFrenzy.addEventListener('click', activateFrenzy);

        shopButton.addEventListener('click', () => {
            isGameActive = false; 
            cancelAnimationFrame(bossMovementAnimationFrameId); 
            isBossMovementPaused = true; 
            clearInterval(superpowerCooldownIntervalId); 

            ozzyContainer.classList.add('hidden'); 
            superpowerButtonsContainer.classList.add('hidden'); 
            shopButton.classList.add('hidden'); 
            
            gameInfoContainer.classList.add('hidden'); 

            upgradeShopScreen.classList.remove('hidden'); 
            updateUpgradeShopUI(); 
        });

        closeShopButton.addEventListener('click', () => {
            upgradeShopScreen.classList.add('hidden'); 

            ozzyContainer.classList.remove('hidden'); 
            superpowerButtonsContainer.classList.remove('hidden'); 
            shopButton.classList.remove('hidden'); 
            
            gameInfoContainer.classList.remove('hidden'); 

            isGameActive = true; 
            isBossMovementPaused = false; 
            if (isBossFight) { 
                animateBossMovement();
            }
            clearInterval(superpowerCooldownIntervalId); 
            superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
            updateSuperpowerButtons(); 

            if (freezeModeActive) {
                activateIceBlast(); 
            }
        });

        buyBaseDamageButton.addEventListener('click', () => buyUpgrade('baseDamage'));
        buyLightningDamageButton.addEventListener('click', () => buyUpgrade('lightningDamage'));
        buyFreezeDamageButton.addEventListener('click', () => buyUpgrade('freezeDamage'));
        buyFrenzyDamageButton.addEventListener('click', () => buyUpgrade('frenzyDamage'));

        updateUpgradeShopUI();
    });
