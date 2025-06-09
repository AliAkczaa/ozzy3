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
    let freezeDamageLevelDisplay;
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

    const ORIGINAL_OZZY_IMAGE_URL = 'stonks.png';
    const BOSS_IMAGE_URL = 'stonksboss.png'; 
    const BOSS_LEVEL_INTERVAL = 10; // Boss appears every 10 levels

    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    const NORMAL_OZZY_HEALTH_INCREMENT = 20; 
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
    const totalStonksVariants = 4;     // Number of available variants (0, 1, 2, 3)
    let bossVisualVariantIndex = 0;    // Current index of Boss visual variant
    const totalBossVariants = 3;       // Number of available Boss variants (0, 1, 2)

    // Original superpower button texts (for display when not on cooldown)
    const originalLightningText = 'Piorun Zagłady';
    const originalFreezeText = 'Lodowy Wybuch';
    const originalFrenzyText = 'Szał Bojowy';


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
     * Uses CSS classes for dynamic filter changes.
     */
    function updateOzzyAppearance() {
        // Remove all previous variant classes
        for (let i = 0; i < totalStonksVariants; i++) {
            ozzyImage.classList.remove(`stonks-variant-${i}`);
        }
        for (let i = 0; i < totalBossVariants; i++) {
            ozzyImage.classList.remove(`boss-mode-variant-${i}`);
        }

        // Add Stonks variant class based on level
        ozzyImage.classList.add(`stonks-variant-${stonksVisualVariantIndex}`);

        // If it's a boss fight, add an additional boss variant class
        if (isBossFight) {
            ozzyImage.classList.add('boss-mode'); // Keep existing boss-mode class
            ozzyImage.classList.add(`boss-mode-variant-${bossVisualVariantIndex}`);
        } else {
            ozzyImage.classList.remove('boss-mode');
        }
    }


    // --- Game Functions ---
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
        
        // Reset visual variants
        stonksVisualVariantIndex = 0;
        bossVisualVariantIndex = 0;
        updateOzzyAppearance(); // Apply default appearance

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
        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            showMessage("Musisz wpisać swój nick!", 2000);
            return;
        }

        playerNickname = nickname;
        
        resetGame(); // This function already resets variants
        
        isGameActive = true;
        startScreen.classList.add('hidden');
        ozzyContainer.classList.remove('hidden');
        gameInfoContainer.classList.remove('hidden');
        superpowerButtonsContainer.classList.remove('hidden');
        shopButton.classList.remove('hidden');
        
        currentLevel = 1; // Start from level 1
        currentLevelDisplay.textContent = currentLevel;
        currentScore = 0; // Ensure score is reset
        scoreDisplay.textContent = currentScore;

        // Reset Ozzy's health for the new game based on level 1
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH + (currentLevel - 1) * NORMAL_OZZY_HEALTH_INCREMENT;
        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        
        updateOzzyAppearance(); // Apply initial Stonks appearance

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

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    function handleOzzyKnockout() {
        score++; 
        scoreDisplay.textContent = score;

        document.querySelectorAll('.knockout-message').forEach(el => el.remove());
        document.querySelectorAll('.boss-message').forEach(el => el.remove());

        ozzyContainer.classList.add('hidden');

        // Check if it's a boss level
        if (currentLevel > 0 && currentLevel % BOSS_LEVEL_INTERVAL === 0) {
            startBossFight();
        } else {
            // Normal Stonks knockout
            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; 
            ozzyImage.classList.remove('boss-mode'); 
            ozzyImage.classList.remove('flipped-x'); 
            
            // Increment Stonks visual variant every 10 levels (after boss fight)
            // This needs to happen when a *normal* Stonks spawns after 10 levels of regular play
            if (currentLevel > 0 && currentLevel % 10 === 0) { // This condition is already true for boss levels, so this will only trigger *after* a boss has been defeated and a new normal stonks appears.
                stonksVisualVariantIndex = (stonksVisualVariantIndex + 1) % totalStonksVariants;
            }
            updateOzzyAppearance(); // Apply the new Stonks variant

            // Reset Ozzy's position to center for normal Stonks
            bossCurrentTransformX = 0; 
            ozzyContainer.style.transform = `translate(-50%, -50%)`; 

            cancelAnimationFrame(bossMovementAnimationFrameId); 
            isBossMovementPaused = false; 

            // Scale normal Ozzy health
            INITIAL_OZZY_HEALTH += NORMAL_OZZY_HEALTH_INCREMENT; 
            showMessage(`Stonks jest silniejszy!`, 2000); 
            
            const knockoutMsgElement = document.createElement('div');
            knockoutMsgElement.classList.add('knockout-message'); 
            knockoutMsgElement.textContent = 'Stonks rozjebany!'; 
            gameContainer.appendChild(knockoutMsgElement);

            setTimeout(() => {
                knockoutMsgElement.remove();
            }, 2000); 

            // Increment level for normal knockout
            currentLevel++; 
            currentLevelDisplay.textContent = currentLevel; 
        }

        ozzyHealth = INITIAL_OZZY_HEALTH; 
        updateHealthBar(); 

        setTimeout(() => {
            ozzyContainer.classList.remove('hidden');
            ozzyImage.classList.remove('hit-effect');
            // Maintain appropriate transformation on respawn
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
        isBossFight = true;
        ozzyImage.src = BOSS_IMAGE_URL; 
        ozzyImage.classList.add('boss-mode'); 
        
        // Scale boss health based on encounter count
        const bossEncounterCount = currentLevel / BOSS_LEVEL_INTERVAL;
        INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH + (bossEncounterCount - 1) * BOSS_HEALTH_INCREMENT_PER_ENCOUNTER;

        // Ensure boss health does not drop below minimum if scaling is too aggressive
        INITIAL_OZZY_HEALTH = Math.max(BOSS_INITIAL_HEALTH, INITIAL_OZZY_HEALTH); 

        console.log(`BOSS SPAWN! Level: ${currentLevel}, Encounter: ${bossEncounterCount}, Health: ${INITIAL_OZZY_HEALTH}`);

        showBossMessage("UWAGA! BOSS STONKS! ROZPIERDOL GO!", 2500); 

        // Increment boss visual variant for each fight
        bossVisualVariantIndex = (bossVisualVariantIndex + 1) % totalBossVariants;
        updateOzzyAppearance(); // Apply the new boss variant

        cancelAnimationFrame(bossMovementAnimationFrameId); 
        isBossMovementPaused = false; 

        // Reset bossCurrentTransformX and set initial position to center
        bossCurrentTransformX = 0;
        ozzyContainer.style.transform = `translate(calc(-50% + ${bossCurrentTransformX}px), -50%)`;

        bossDx = BOSS_MOVEMENT_SPEED * (Math.random() < 0.5 ? 1 : -1); 
        if (bossDx < 0) {
            ozzyImage.classList.add('flipped-x');
        } else {
            ozzyImage.classList.remove('flipped-x');
        }
        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement); 

        // Increment level here after boss spawns, as it's a new level encounter
        currentLevel++;
        currentLevelDisplay.textContent = currentLevel;
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
        freezeDamageLevelDisplay = document.getElementById('freeze-damage-level');
        freezeDamageCostDisplay = document.getElementById('freeze-damage-cost');
        buyFreezeDamageButton = document.getElementById('buy-freeze-damage');
        frenzyDamageLevelDisplay = document.getElementById('frenzy-damage-level');
        frenzyDamageCostDisplay = document.getElementById('frenzy-cost'); 
        buyFrenzyDamageButton = document.getElementById('buy-frenzy-damage');
        quoteImagesContainer = document.getElementById('quote-images-container'); 

        // IMPORTANT: Hide the upgrade shop screen immediately upon loading.
        upgradeShopScreen.classList.add('hidden');

        // Ensure all screens are initially hidden
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        ozzyContainer.classList.add('hidden');
        gameInfoContainer.classList.add('hidden'); 
        quoteImagesContainer.innerHTML = ''; 

        // resetGame is called in DOMContentLoaded, so its use of global DOM variables is safe
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
