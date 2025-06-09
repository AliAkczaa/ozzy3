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
    const submitScoreFunction = httpsCallable(functions, 'submitScore'); // Reference to our Cloud Function

    // ===================================================================

    // --- Declare ALL global DOM variables ---
    let backgroundTractor;
    let ozzyContainer;
    let ozzyImage;
    let healthBarFill;
    let gameContainer; 
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
    let freezeDamageLevelDisplay; // Corrected
    let freezeDamageCostDisplay;
    let buyFreezeDamageButton;
    let frenzyDamageLevelDisplay;
    let frenzyDamageCostDisplay;
    let buyFrenzyDamageButton;
    let quoteImagesContainer; 

    // --- Other global variables (not directly related to DOM), with immediate assignments ---
    let playerNickname = "Gracz";
    let score = 0;
    let ozzyHealth = 100;
    let INITIAL_OZZY_HEALTH = 100; // This will be dynamic based on level and boss fights
    let PUNCH_DAMAGE = 10; 
    let currentUserId = null;
    let isGameActive = false; 

    let currentLevel = 0; // Starts at 0, becomes 1 on game start
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

    const ORIGINAL_OZZY_IMAGE_URL = 'stonks2.png'; 
    const BOSS_IMAGE_URL = 'stonksboss.png'; 
    const BOSS_LEVEL_INTERVAL = 10; // Boss appears every 10 levels (e.g. level 10, 20, 30)

    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    // ZMIANA: Zwiększony przyrost zdrowia
    const NORMAL_OZZY_HEALTH_INCREMENT = 30; 
    const BOSS_INITIAL_HEALTH = 450; 
    const BOSS_HEALTH_INCREMENT_PER_ENCOUNTER = 150; 

    const BOSS_MOVEMENT_SPEED = 2; 
    const BOSS_QUOTES = [
        "CHLOPY OD CRYPTONA FARMIA!", "TTB TO GÓWNO! TYLKO STONKS!", 
        "DO DUBAJU! ZA KASE INWESTORÓW!", "Jeden launchpad, jeden bot, jeden dex!", 
        "Farmer z bsc tom pisze ze to ja jestem scammerem"
    ];
    let bossMovementAnimationFrameId; 
    let bossDx = BOSS_MOVEMENT_SPEED; 
    let bossCurrentTransformX = 0; // Tracks additional X offset from center

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

    // --- Variables for visual variants of Stonks ---
    let stonksVisualVariantIndex = 0; // Current index of Stonks visual variant
    // ZMIANA: Zwiększona liczba wariantów wizualnych
    const totalStonksVariants = 10;     
    let bossVisualVariantIndex = 0;    // Current index of Boss visual variant
    // ZMIANA: Zwiększona liczba wariantów wizualnych bossa
    const totalBossVariants = 10;       

    // Original superpower button texts (for display when not on cooldown)
    const originalLightningText = 'Piorun Zagłady';
    const originalFreezeText = 'Lodowy Wybuch';
    const originalFrenzyText = 'Szał Bojowy';

    // --- NEW: Global variables for Canvas effects ---
    let bossEffectCanvas;
    let bossEffectCtx;
    let bossCanvasAnimationId;
    let bossParticles = []; // For ice shards/flames
    let isCanvasEffectActive = false;
    let bossEffectIntervalId; // Interval for generating particles

    // Constants for canvas effects
    const ICE_SHARD_COUNT = 10; // Zwiększona liczba odłamków lodu
    const FLAME_PARTICLE_COUNT = 8; // Zwiększona liczba cząsteczek płomieni
    const EARTH_PARTICLE_COUNT = 7; // Nowy typ: cząsteczki ziemi
    const ENERGY_ORB_COUNT = 3;   // Nowy typ: kule energii
    const BOSS_EFFECT_PARTICLE_INTERVAL_MS = 100; // Częściej generowane cząsteczki


    // --- Leaderboard Functions ---
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

    // --- Quote Functions ---
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

    // --- Function: Unified damage application ---
    function applyDamageToOzzy(damageAmount) {
        ozzyHealth -= damageAmount;
        ozzyHealth = Math.max(0, ozzyHealth);
        updateHealthBar();
        if (ozzyHealth <= 0) {
            handleOzzyKnockout();
        }
    }

    // --- Superpower Functions ---
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
            const superpowerTextSpan = button.querySelector('.superpower-text');
            const targetElement = superpowerTextSpan || button; 

            if (!isGameActive && button.classList.contains('hidden')) {
                targetElement.textContent = ` ${originalText}`;
                return;
            }
            if (!isGameActive) {
                targetElement.textContent = ` ${originalText}`;
                return;
            }

            const timeLeft = Math.ceil((lastUsedTime + COOLDOWN_DURATION_MS - now) / 1000);
            if (timeLeft > 0) {
                targetElement.textContent = ` ${timeLeft}s`;
            } else {
                targetElement.textContent = ` ${originalText}`; 
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


    // --- Boss Movement Animation Function ---
    let isBossMovementPaused = false; 
    function animateBossMovement() {
        if (!isGameActive || !isBossFight || isBossMovementPaused) { 
            cancelAnimationFrame(bossMovementAnimationFrameId); 
            return;
        }

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const ozzyRect = ozzyContainer.getBoundingClientRect(); // Current visual size of Ozzy

        // Calculate the maximum offset from the center
        // Total movement space for the CENTER of the boss from edge to edge of the container
        const maxOffset = (gameContainerRect.width - ozzyRect.width) / 2;

        let nextTransformX = bossCurrentTransformX + bossDx;

        // Check and correct position and direction
        if (nextTransformX > maxOffset) {
            nextTransformX = maxOffset; // Snap to the right boundary
            bossDx *= -1; // Reverse direction
            ozzyImage.classList.add('flipped-x'); // Flip image to the left
        } else if (nextTransformX < -maxOffset) { // Left boundary
            nextTransformX = -maxOffset; // Snap to the left boundary
            bossDx *= -1; // Reverse direction
            ozzyImage.classList.remove('flipped-x'); // Flip image to the right
        }

        // Apply transformation. calc(-50% + ${nextTransformX}px) is key!
        // -50% is base centering, and ${nextTransformX}px is additional offset.
        ozzyContainer.style.transform = `translate(calc(-50% + ${nextTransformX}px), -50%)`;
        bossCurrentTransformX = nextTransformX; // Update state variable

        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement);
    }

    /**
     * Updates Ozzy's appearance based on the current level and boss status.
     * Uses CSS classes to dynamically change filters.
     */
    function updateOzzyAppearance() {
        // Remove all previous variant classes
        for (let i = 0; i < totalStonksVariants; i++) {
            ozzyImage.classList.remove(`stonks-variant-${i}`);
        }
        for (let i = 0; i < totalBossVariants; i++) {
            ozzyImage.classList.remove(`boss-mode-variant-${i}`);
        }

        // Add Stonks variant class based on level (for normal Stonks)
        // If it's a boss fight, the boss-mode class takes precedence for core appearance
        if (!isBossFight) {
             ozzyImage.classList.add(`stonks-variant-${stonksVisualVariantIndex}`);
        }
        // If it's a boss fight, apply specific boss variant on top of default boss styling
        else {
            ozzyImage.classList.add('boss-mode'); 
            ozzyImage.classList.add(`boss-mode-variant-${bossVisualVariantIndex}`);
        }
    }


    // --- Game Functions ---
    function resetGame() {
        console.log("resetGame called.");
        score = 0;
        scoreDisplay.textContent = score;
        currentLevel = 0; // Reset level to 0
        currentLevelDisplay.textContent = currentLevel;

        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); 
        
        // Reset visual variants
        stonksVisualVariantIndex = 0;
        bossVisualVariantIndex = 0;
        updateOzzyAppearance(); // Apply default appearance

        // ZMIANA: Resetowanie zdrowia Ozzy'ego do wartości początkowej dla poziomu 1
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; 

        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        ozzyImage.classList.remove('spawn-ozzy');
        ozzyContainer.classList.add('hidden'); 

        // Reset Ozzy's position to center for normal Stonks
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
        freezeEffect.classList.remove('active'); // Ensure class is removed
        freezeEffect.innerHTML = '';


        lightningEffect.classList.add('hidden');
        freezeEffect.classList.add('hidden');
        frenzyEffect.classList.add('hidden');
        lightningEffect.innerHTML = ''; 
        freezeEffect.innerHTML = ''; 

        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        document.querySelectorAll('.boss-message').forEach(el => el.remove());


        isGameActive = false;
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        upgradeShopScreen.classList.add('hidden'); // Ensure shop is hidden on reset
        startScreen.classList.remove('hidden'); 
        shopButton.classList.remove('hidden'); 
        superpowerButtonsContainer.classList.add('hidden'); 
        
        gameInfoContainer.classList.add('hidden');

        clearInterval(superpowerCooldownIntervalId);
        updateSuperpowerCooldownDisplays(); 

        // Stop Canvas effects when game resets
        stopBossCanvasEffects();

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    function showMessage(message, duration = 1500) {
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('knockout-message'); 
        dynamicMessageElement.textContent = message;

        // Ensure only one general knockout message is shown at a time
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());

        gameContainer.appendChild(dynamicMessageElement);

        setTimeout(() => {
            dynamicMessageElement.remove();
        }, duration);
    }
    
    function showBossMessage(message, duration = 2500) {
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('boss-message'); 
        dynamicMessageElement.textContent = message;
        // Ensure only one boss message is shown at a time
        document.querySelectorAll('.boss-message').forEach(el => el.remove());
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
        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            showMessage("Musisz wpisać swój nick!", 2000);
            return;
        }

        playerNickname = nickname;
        
        resetGame(); // This function already resets variants and basic game state
        
        isGameActive = true;
        startScreen.classList.add('hidden');
        ozzyContainer.classList.remove('hidden');
        gameInfoContainer.classList.remove('hidden');
        superpowerButtonsContainer.classList.remove('hidden');
        shopButton.classList.remove('hidden');
        
        // Initialize level and score for the *new* game
        currentLevel = 1; // Start from level 1
        currentLevelDisplay.textContent = currentLevel;
        score = 0; 
        scoreDisplay.textContent = score;

        // ZMIANA: Zdrowie dla poziomu 1 jest ustawiane tutaj
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; 
        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        
        // Apply initial Stonks appearance for level 1
        stonksVisualVariantIndex = 0; // Ensure it starts with the first variant
        updateOzzyAppearance(); 

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
        frenzyEffect.classList.add('hidden'); // Ensure frenzy effect is hidden
        frenzyEffect.classList.remove('active');

        freezeModeActive = false;
        clearInterval(freezeDotIntervalId);
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active'); // Ensure class is removed
        freezeEffect.innerHTML = '';


        lightningEffect.classList.add('hidden');
        lightningEffect.innerHTML = ''; // Clear lightning segments
        
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

        // Stop Canvas effects when game ends
        stopBossCanvasEffects();

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    function handleOzzyKnockout() {
        score++; // Increment score for every knockout
        scoreDisplay.textContent = score;

        // Clear all previous general messages before showing new ones
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        document.querySelectorAll('.boss-message').forEach(el => el.remove());

        ozzyContainer.classList.add('hidden');

        // Determine if the *next* level is a boss level
        const nextLevelCandidate = currentLevel + 1; // Temporary variable to check for boss
        
        if (nextLevelCandidate > 0 && nextLevelCandidate % BOSS_LEVEL_INTERVAL === 0) {
            // It's time for a boss fight
            currentLevel = nextLevelCandidate; // Set currentLevel to the boss level (e.g., 10, 20)
            currentLevelDisplay.textContent = currentLevel; // Update display
            isBossFight = true; // Set boss flag 
            startBossFight(); // This function will setup boss, increment bossVisualVariantIndex, and apply appearance
            startBossCanvasEffects(); // NEW: Start canvas effects for boss
        } else {
            // Normal Stonks knockout
            currentLevel = nextLevelCandidate; // Increment level for normal stonks
            currentLevelDisplay.textContent = currentLevel; // Update display

            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
            ozzyImage.classList.remove('boss-mode'); 
            ozzyImage.classList.remove('flipped-x'); 
            
            // ZMIANA: Logika zwiększania zdrowia i komunikatu "Stonks jest silniejszy!"
            // To następuje tylko na poziomach 1, 11, 21, itd.
            // Sprawdź, czy aktualny poziom jest początkiem nowej "dziesiątki"
            const isNewTier = currentLevel === 1 || (currentLevel > 1 && (currentLevel - 1) % BOSS_LEVEL_INTERVAL === 0);

            if (isNewTier) { 
                stonksVisualVariantIndex = Math.floor((currentLevel - 1) / BOSS_LEVEL_INTERVAL) % totalStonksVariants; 
                
                // Zwiększ zdrowie Stonksa tylko na początku nowej "dziesiątki" poziomów
                // (np. poziom 1, po bossie na poziomie 10 - czyli poziom 11, po bossie na 20 - czyli poziom 21)
                const tier = Math.floor((currentLevel - 1) / BOSS_LEVEL_INTERVAL); // 0 dla poziomów 1-10, 1 dla 11-20, itd.
                INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH + (tier * NORMAL_OZZY_HEALTH_INCREMENT);
                showMessage(`Stonks jest silniejszy!`, 2000); 
            } else {
                 // Tylko jeśli nie jest to nowa "dziesiątka" i nie wyświetlono "Stonks jest silniejszy!"
                showMessage('Stonks rozjebany!', 1500);
            }
            
            updateOzzyAppearance(); // Apply the new Stonks variant

            bossCurrentTransformX = 0; // Reset position for normal Stonks
            ozzyContainer.style.transform = `translate(-50%, -50%)`; 
            cancelAnimationFrame(bossMovementAnimationFrameId); 
            isBossMovementPaused = false; 
            
            stopBossCanvasEffects(); // NEW: Stop canvas effects when normal Stonks returns
        }

        ozzyHealth = INITIAL_OZZY_HEALTH; // Set Ozzy's health to the new scaled max health
        updateHealthBar(); 

        // Rest of the common respawn logic
        setTimeout(() => {
            ozzyContainer.classList.remove('hidden');
            ozzyImage.classList.remove('hit-effect');
            if (!isBossFight) {
                ozzyContainer.style.transform = `translate(-50%, -50%)`; // Clean centering for normal Stonks
            } else {
                // If it's a boss, movement animation continues, so we keep bossCurrentTransformX
                ozzyContainer.style.transform = `translate(calc(-50% + ${bossCurrentTransformX}px), -50%)`;
            }
            ozzyImage.classList.add('spawn-ozzy'); 

            setTimeout(() => {
                ozzyImage.classList.remove('spawn-ozzy');
            }, 500); 
        }, 200); 
    }

    function startBossFight() {
        // `isBossFight` and `currentLevel` are already correctly set by `handleOzzyKnockout`
        ozzyImage.src = BOSS_IMAGE_URL; 
        ozzyImage.classList.add('boss-mode'); 
        
        // Scale boss health based on encounter count (currentLevel is already correct)
        const bossEncounterCount = currentLevel / BOSS_LEVEL_INTERVAL;
        INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH + (bossEncounterCount - 1) * BOSS_HEALTH_INCREMENT_PER_ENCOUNTER;
        INITIAL_OZZY_HEALTH = Math.max(BOSS_INITIAL_HEALTH, INITIAL_OZZY_HEALTH); // Ensure it doesn't go below base

        console.log(`BOSS SPAWN! Level: ${currentLevel}, Encounter: ${bossEncounterCount}, Health: ${INITIAL_OZZY_HEALTH}`);

        showBossMessage("UWAGA! BOSS STONKS! ROZPIERDOL GO!", 2500); 

        // Increment boss visual variant for each fight
        bossVisualVariantIndex = (bossVisualVariantIndex + 1) % totalBossVariants;
        updateOzzyAppearance(); // Apply the new boss variant

        cancelAnimationFrame(bossMovementAnimationFrameId); 
        isBossMovementPaused = false; 

        bossCurrentTransformX = 0; // Reset boss position to center initially
        ozzyContainer.style.transform = `translate(calc(-50% + ${bossCurrentTransformX}px), -50%)`;

        bossDx = BOSS_MOVEMENT_SPEED * (Math.random() < 0.5 ? 1 : -1); 
        if (bossDx < 0) {
            ozzyImage.classList.add('flipped-x');
        } else {
            ozzyImage.classList.remove('flipped-x');
        }
        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement); 
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

    // --- NEW: Upgrade Shop Functions ---
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

    // --- NEW: Canvas functions for boss effects ---

    // Function to initialize canvas
    function initializeBossCanvas() {
        bossEffectCanvas = document.getElementById('boss-effect-canvas');
        if (!bossEffectCanvas) {
            console.error("Canvas element #boss-effect-canvas not found.");
            return;
        }
        bossEffectCtx = bossEffectCanvas.getContext('2d');
        resizeBossCanvas(); // Set initial size
        window.addEventListener('resize', resizeBossCanvas); // Make it responsive
    }

    // Function to resize canvas
    function resizeBossCanvas() {
        if (bossEffectCanvas && gameContainer) {
            bossEffectCanvas.width = gameContainer.offsetWidth;
            bossEffectCanvas.height = gameContainer.offsetHeight;
            // Redraw content if necessary after resize
            if (isCanvasEffectActive) {
                animateBossCanvasEffects(); // Trigger a redraw
            }
        }
    }

    // Canvas animation loop
    function animateBossCanvasEffects() {
        if (!isCanvasEffectActive) return;

        // Clear only the parts that need redrawing, or the whole canvas
        bossEffectCtx.clearRect(0, 0, bossEffectCanvas.width, bossEffectCtx.canvas.height);

        // Update and draw particles
        for (let i = bossParticles.length - 1; i >= 0; i--) {
            let p = bossParticles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.alpha -= p.fade;

            if (p.alpha <= 0 || p.y < -p.size * 2 || p.y > bossEffectCanvas.height + p.size * 2 || p.x < -p.size * 2 || p.x > bossEffectCanvas.width + p.size * 2) {
                bossParticles.splice(i, 1);
            } else {
                if (p.type === 'ice') {
                    bossEffectCtx.fillStyle = `rgba(173, 216, 230, ${p.alpha})`; // Light blue
                    drawIceShard(bossEffectCtx, p.x, p.y, p.size, p.angle);
                } else if (p.type === 'flame') {
                    const gradient = bossEffectCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                    gradient.addColorStop(0, `rgba(255, 165, 0, ${p.alpha})`); // Orange
                    gradient.addColorStop(0.5, `rgba(255, 69, 0, ${p.alpha * 0.7})`); // Red-orange
                    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`); // Transparent red
                    bossEffectCtx.fillStyle = gradient;
                    bossEffectCtx.beginPath();
                    bossEffectCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    bossEffectCtx.fill();
                } else if (p.type === 'earth') {
                    bossEffectCtx.fillStyle = `rgba(139, 69, 19, ${p.alpha})`; // Brown
                    bossEffectCtx.beginPath();
                    bossEffectCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    bossEffectCtx.fill();
                } else if (p.type === 'energy') {
                    const gradient = bossEffectCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, `rgba(0, 255, 255, ${p.alpha})`); // Cyan inner
                    gradient.addColorStop(0.5, `rgba(128, 0, 128, ${p.alpha * 0.7})`); // Purple middle
                    gradient.addColorStop(1, `rgba(0, 0, 255, 0)`); // Blue outer, transparent
                    bossEffectCtx.fillStyle = gradient;
                    bossEffectCtx.beginPath();
                    bossEffectCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    bossEffectCtx.fill();
                }
            }
        }

        // Subtle flicker effect (draws a transparent black overlay sometimes)
        // ZMIANA: Zwiększona widoczność migotania ekranu
        if (Math.random() < 0.05) { // 5% chance per frame to flicker
            bossEffectCtx.fillStyle = `rgba(0, 0, 0, 0.1)`; // Bardziej zauważalny czarny overlay
            bossEffectCtx.fillRect(0, 0, bossEffectCanvas.width, bossEffectCanvas.height);
        }

        bossCanvasAnimationId = requestAnimationFrame(animateBossCanvasEffects);
    }

    // Helper to draw an ice shard (simple polygon)
    function drawIceShard(ctx, x, y, size, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Function to start boss-specific canvas effects
    function startBossCanvasEffects() {
        if (isCanvasEffectActive) return; // Avoid starting multiple times
        isCanvasEffectActive = true;
        bossEffectCanvas.classList.remove('hidden'); // Ensure canvas is visible
        bossParticles = []; // Clear any old particles

        // Set initial canvas size just before starting effects
        resizeBossCanvas();

        // Start generating particles
        bossEffectIntervalId = setInterval(() => {
            if (!isBossFight || !isGameActive) { // Stop if boss fight or game ends unexpectedly
                stopBossCanvasEffects();
                return;
            }

            const ozzyRect = ozzyContainer.getBoundingClientRect();
            const gameContainerRect = gameContainer.getBoundingClientRect();

            // Adjust coordinates to be relative to the canvas's own coordinate system
            // Canvas origin (0,0) is at the top-left of gameContainer.
            const ozzyCanvasCenterX = (ozzyRect.left + ozzyRect.width / 2) - gameContainerRect.left;
            const ozzyCanvasCenterY = (ozzyRect.top + ozzyRect.height / 2) - gameContainerRect.top;


            // Generate ice shards (more spread out around Ozzy)
            for (let i = 0; i < ICE_SHARD_COUNT; i++) {
                bossParticles.push({
                    type: 'ice',
                    x: ozzyCanvasCenterX + (Math.random() - 0.5) * ozzyRect.width * 1.5,
                    y: ozzyCanvasCenterY + (Math.random() - 0.5) * ozzyRect.height * 1.5,
                    size: Math.random() * 20 + 10, 
                    alpha: 0.8,
                    dx: (Math.random() - 0.5) * 4, 
                    dy: (Math.random() - 0.5) * 4, 
                    fade: 0.01, 
                    angle: Math.random() * Math.PI * 2
                });
            }

            // Generate flame particles (from bottom of boss, moving up)
            for (let i = 0; i < FLAME_PARTICLE_COUNT; i++) {
                bossParticles.push({
                    type: 'flame',
                    x: ozzyCanvasCenterX + (Math.random() - 0.5) * ozzyRect.width * 0.5, 
                    y: ozzyCanvasCenterY + ozzyRect.height * 0.4, 
                    radius: Math.random() * 40 + 20, 
                    alpha: 0.7,
                    dx: (Math.random() - 0.5) * 2,
                    dy: -Math.random() * 5 - 1, 
                    fade: 0.008 
                });
            }

            // NEW: Generate earth particles (from bottom, moving up slightly)
            for (let i = 0; i < EARTH_PARTICLE_COUNT; i++) {
                bossParticles.push({
                    type: 'earth',
                    x: ozzyCanvasCenterX + (Math.random() - 0.5) * ozzyRect.width * 0.8,
                    y: ozzyCanvasCenterY + ozzyRect.height * 0.5 + Math.random() * 20, // From below boss
                    size: Math.random() * 15 + 5,
                    alpha: 0.9,
                    dx: (Math.random() - 0.5) * 1,
                    dy: -Math.random() * 3 - 0.5, // Slow upward movement
                    fade: 0.015
                });
            }

            // NEW: Generate energy orbs (larger, slower, fading)
            for (let i = 0; i < ENERGY_ORB_COUNT; i++) {
                bossParticles.push({
                    type: 'energy',
                    x: ozzyCanvasCenterX + (Math.random() - 0.5) * ozzyRect.width * 0.7,
                    y: ozzyCanvasCenterY + (Math.random() - 0.5) * ozzyRect.height * 0.7,
                    size: Math.random() * 30 + 15,
                    alpha: 0.6,
                    dx: (Math.random() - 0.5) * 0.5, // Slower movement
                    dy: (Math.random() - 0.5) * 0.5,
                    fade: 0.005 // Slower fade
                });
            }

        }, BOSS_EFFECT_PARTICLE_INTERVAL_MS);

        // Start animation loop
        bossCanvasAnimationId = requestAnimationFrame(animateBossCanvasEffects);
    }

    // Function to stop boss-specific canvas effects
    function stopBossCanvasEffects() {
        if (!isCanvasEffectActive) return;
        isCanvasEffectActive = false;
        clearInterval(bossEffectIntervalId);
        cancelAnimationFrame(bossCanvasAnimationId);
        bossEffectCtx.clearRect(0, 0, bossEffectCanvas.width, bossEffectCanvas.height);
        bossParticles = []; // Clear particles
        bossEffectCanvas.classList.add('hidden'); // Hide canvas
    }


    console.log("Script.js is running!");

    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOMContentLoaded: DOM has been loaded!");

        // === ASSIGN VALUES to global DOM variables ===
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
        freezeDamageLevelDisplay = document.getElementById('freeze-damage-level'); // Corrected line
        freezeDamageCostDisplay = document.getElementById('freeze-damage-cost');
        buyFreezeDamageButton = document.getElementById('buy-freeze-damage');
        frenzyDamageLevelDisplay = document.getElementById('frenzy-damage-level');
        frenzyDamageCostDisplay = document.getElementById('frenzy-cost'); 
        buyFrenzyDamageButton = document.getElementById('buy-frenzy-damage');
        quoteImagesContainer = document.getElementById('quote-images-container'); 

        // NEW: Initialize the boss effect canvas
        initializeBossCanvas();

        // The resetGame function handles hiding all screens, including the shop.
        // It's crucial to call it AFTER all DOM elements are assigned.
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

        // --- Event Handlers ---
        startButton.addEventListener('click', () => {
            console.log("START button clicked!");
            startGame();
        });

        showLeaderboardButton.addEventListener('click', () => {
            console.log("LEADERBOARD button clicked!");
            startScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); 
            superpowerButtonsContainer.classList.add('hidden'); 
            ozzyContainer.classList.add('hidden'); 
            gameInfoContainer.classList.add('hidden'); 
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        restartButton.addEventListener('click', () => {
            console.log("RESTART button clicked!");
            resetGame();
        });

        ozzyContainer.addEventListener('click', handlePunch);
        ozzyContainer.addEventListener('touchstart', (event) => {
            event.preventDefault(); 
            handlePunch(event);
        }, { passive: false });

        showLeaderboardAfterGameButton.addEventListener('click', () => {
            console.log("SHOW LEADERBOARD (after game) button clicked!");
            endScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); 
            superpowerButtonsContainer.classList.add('hidden'); 
            ozzyContainer.classList.add('hidden'); 
            gameInfoContainer.classList.add('hidden'); 
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        backToStartButton.addEventListener('click', () => {
            console.log("BACK TO MENU button clicked!");
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

            // NEW: Stop canvas effects when entering shop
            stopBossCanvasEffects();
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
                // NEW: Restart canvas effects if it's a boss fight when closing shop
                startBossCanvasEffects();
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
