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

    // Get DOM element references
    const backgroundTractor = document.getElementById('animated-background-tractor');
    const ozzyContainer = document.getElementById('ozzy-container');
    const ozzyImage = document.getElementById('ozzy-image');
    const healthBarFill = document.getElementById('health-bar-fill');
    const scoreDisplay = document.getElementById('score');
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

    // Level display reference
    const currentLevelDisplay = document.getElementById('current-level');

    let score = 0;
    let ozzyHealth = 100;
    let INITIAL_OZZY_HEALTH = 100;
    let PUNCH_DAMAGE = 10; // Changed to let, as it will be modified by Frenzy and upgrades
    let currentUserId = null;
    let isGameActive = false; // Flag indicating if the game is active (not paused on menu/shop screens)

    // Current level variable
    let currentLevel = 0;
    // Flag for boss fight
    let isBossFight = false;

    // Punches since last powerup activation
    let punchesSinceLastPowerup = 0;

    // --- Quote image references and variables ---
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

    // --- Superpower elements and variables ---
    const superpowerButtonsContainer = document.getElementById('superpower-buttons-container');
    const btnLightning = document.getElementById('btn-lightning');
    const btnFreeze = document.getElementById('btn-freeze');
    const btnFrenzy = document.getElementById('btn-frenzy');

    // Original button texts (for displaying after cooldown)
    const originalLightningText = '⚡ Piorun Zagłady';
    const originalFreezeText = '❄️ Lodowy Wybuch';
    const originalFrenzyText = '🔥 Szał Bojowy';

    const lightningEffect = document.getElementById('lightning-effect');
    const freezeEffect = document.getElementById('freeze-effect');
    const frenzyEffect = document.getElementById('frenzy-effect');

    const PUNCHES_PER_POWERUP = 10; // How many punches to activate a superpower (threshold)

    const COOLDOWN_DURATION_MS = 60 * 1000; // 60 seconds

    let lastUsedLightningTime = 0; // Timestamp of last Lightning use
    let lastUsedFreezeTime = 0; // Timestamp of last Ice Blast use
    let lastUsedFrenzyTime = 0; // Timestamp of last Frenzy use

    let frenzyModeActive = false;
    let frenzyTimerId;
    const FRENZY_DAMAGE_MULTIPLIER = 3; // E.g., 3 times more damage
    const FRENZY_DURATION_MS = 5000; // Duration of Frenzy (5 seconds)

    // Dynamic variables (will be scaled by upgrades)
    let LIGHTNING_BASE_DAMAGE = 150; // Reduced from 450 to 150, scalable
    let ICE_BLAST_INITIAL_DAMAGE = 50;
    let ICE_BLAST_DOT_DAMAGE_PER_SECOND = 25;
    const ICE_BLAST_DOT_DURATION_SECONDS = 5;
    let FRENZY_INITIAL_DAMAGE = 30;

    let superpowerCooldownIntervalId; // Interval ID for updating timers

    let freezeModeActive = false;
    let freezeDotIntervalId;

    // Paths to Stonks images (normal and boss)
    const ORIGINAL_OZZY_IMAGE_URL = 'zdjecie 2.jpg';
    const BOSS_IMAGE_URL = 'stonksboss.png'; // Use stonksboss.png graphic

    // Health values for normal Stonks and Boss
    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    const NORMAL_OZZY_HEALTH_INCREMENT = 20; // Health increase for normal Stonks every 5 knockouts
    const BOSS_INITIAL_HEALTH = 450; // Increased by 50% from 300 -> 450

    // Boss movement modifiers and quotes
    const BOSS_MOVEMENT_SPEED = 2; // Boss movement speed (pixels per animation frame)
    const BOSS_QUOTES = [
        "CHLOPY OD CRYPTONA FARMIA!",
        "TTB TO GÓWNO! TYLKO STONKS!",
        "DO DUBAJU! ZA KASE INWESTORÓW!",
        "Jeden launchpad, jeden bot, jeden dex!",
        "Farmer z bsc tom pisze ze to ja jestem scammerem"
    ];
    let bossMovementAnimationFrameId; // Changed from IntervalId to AnimationFrameId
    let bossDx = BOSS_MOVEMENT_SPEED; // Boss movement direction (początkowo w prawo)
    let bossCurrentTransformX = 0; // NEW: Tracks the translateX value for the boss

    // --- Audio element references ---
    const backgroundMusic = document.getElementById('background-music');
    const punchSound = document.getElementById('punch-sound');

    // --- Client-side max score (anti-cheat) ---
    const CLIENT_SIDE_MAX_SCORE = 200;

    // --- NEW: Upgrade system elements and variables ---
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
    // POPRAWKA: Usunięto zbędne "document = " z tej linii
    const freezeDamageCostDisplay = document.getElementById('freeze-damage-cost');
    const buyFreezeDamageButton = document.getElementById('buy-freeze-damage');

    const frenzyDamageLevelDisplay = document.getElementById('frenzy-damage-level');
    const frenzyDamageCostDisplay = document.getElementById('frenzy-damage-cost');
    const buyFrenzyDamageButton = document.getElementById('buy-frenzy-damage');

    // Upgrade state variables
    let upgradeLevels = {
        baseDamage: 1,
        lightningDamage: 1,
        freezeDamage: 1,
        frenzyDamage: 1
    };

    // Upgrade costs and modifiers (adjustable!)
    const UPGRADE_COST_BASE = 10;
    const UPGRADE_COST_MULTIPLIER = 1.5; // Cost increases by 50% for each level
    const DAMAGE_INCREASE_PER_LEVEL = 5; // Base damage increases by 5 per level

    const LIGHTNING_DAMAGE_INCREASE_PER_LEVEL = 30; // Lightning: damage increase by 30
    const FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL = 10; // Freeze: initial damage increase by 10
    const FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL = 5; // Freeze: DOT damage increase by 5
    const FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL = 15; // Frenzy: initial damage increase by 15


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
                // Cloud function call instead of direct Firestore write
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
        leaderboardList.innerHTML = ''; // Clear list before loading
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
        img.classList.add('quote-image'); // CSS class for styling

        // Random position within gameContainer, avoiding edges
        const gameContainerRect = gameContainer.getBoundingClientRect();
        const maxX = gameContainerRect.width - QUOTE_SIZE_PX;
        const maxY = gameContainerRect.height - QUOTE_SIZE_PX;

        // Ensure it doesn't go outside the container and has some margin
        const randomX = Math.random() * Math.max(0, maxX);
        const randomY = Math.random() * Math.max(0, maxY);

        img.style.left = `${randomX}px`;
        img.style.top = `${randomY}px`;

        // Random rotation angle (-45 to +45 degrees)
        const randomRotation = Math.random() * 90 - 45; // Random from -45 to 45
        img.style.transform = `rotate(${randomRotation}deg)`;

        quoteImagesContainer.appendChild(img);

        // Activate appearance animation
        setTimeout(() => {
            img.classList.add('active');
        }, 10); // Small delay for CSS transition to work

        // Set disappear time
        setTimeout(() => {
            img.classList.remove('active'); // Start fade-out animation
            setTimeout(() => {
                img.remove(); // Remove element from DOM after animation
            }, 500); // Opacity animation duration
        }, QUOTE_DISPLAY_DURATION_MS);
    }

    // --- Function: Unified Damage Application ---
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

        // Check punch threshold AND cooldown for each button
        const canUseLightning = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                                ((now - lastUsedLightningTime >= COOLDOWN_DURATION_MS) || lastUsedLightningTime === 0) &&
                                isGameActive; // Only if game is active

        const canUseFreeze = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                             ((now - lastUsedFreezeTime >= COOLDOWN_DURATION_MS) || lastUsedFreezeTime === 0) &&
                             isGameActive; // Only if game is active

        const canUseFrenzy = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                             ((now - lastUsedFrenzyTime >= COOLDOWN_DURATION_MS) || lastUsedFrenzyTime === 0) &&
                             isGameActive; // Only if game is active

        btnLightning.disabled = !canUseLightning;
        btnFreeze.disabled = !canUseFreeze;
        btnFrenzy.disabled = !canUseFrenzy;

        // Superpower buttons container is clickable if any button is active
        if (canUseLightning || canUseFreeze || canUseFrenzy) {
            superpowerButtonsContainer.style.pointerEvents = 'auto';
        } else {
            superpowerButtonsContainer.style.pointerEvents = 'none';
        }

        // Update cooldown displays
        updateSuperpowerCooldownDisplays();
    }

    // Updates superpower button texts with remaining cooldown time
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
                button.textContent = originalText; // Cooldown expired, show original text
            }
        };

        updateButtonText(btnLightning, lastUsedLightningTime, originalLightningText);
        updateButtonText(btnFreeze, lastUsedFreezeTime, originalFreezeText);
        updateButtonText(btnFrenzy, lastUsedFrenzyTime, originalFrenzyText);
    }


    function activateLightningStrike() {
        if (!isGameActive || btnLightning.disabled) return;

        showMessage("PIORUN ZAGŁADY!", 1500);
        punchesSinceLastPowerup = 0; // Reset punch counter
        lastUsedLightningTime = Date.now(); // Set last use time
        updateSuperpowerButtons(); // Disable buttons and update timers

        // Calculate lightning damage based on upgrade level
        const actualLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage - 1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualLightningDamage); // Apply damage

        // Visual lightning effect (generated by code)
        const segments = 10; // Number of lightning segments
        const ozzyRect = ozzyContainer.getBoundingClientRect();
        const startX = ozzyRect.left + ozzyRect.width / 2;
        const startY = ozzyRect.top - 50; // Starts above Ozzy

        for (let i = 0; i < segments; i++) {
            const segment = document.createElement('div');
            segment.classList.add('lightning-segment');

            const length = Math.random() * 50 + 30; // Segment length
            const angle = Math.random() * 40 - 20; // Deviation angle
            const width = Math.random() * 5 + 3; // Segment thickness

            segment.style.width = `${width}px`;
            segment.style.height = `${length}px`;
            segment.style.left = `${startX + (Math.random() - 0.5) * 50}px`; // Random offset
            segment.style.top = `${startY + i * (ozzyRect.height / segments) + (Math.random() - 0.5) * 20}px`;
            segment.style.transform = `rotate(${angle}deg)`;
            segment.style.transformOrigin = `center top`; // Rotate from top

            lightningEffect.appendChild(segment);
        }

        lightningEffect.classList.remove('hidden');

        setTimeout(() => {
            lightningEffect.classList.add('hidden');
            lightningEffect.innerHTML = ''; // Remove segments
        }, 1000); // Effect duration
    }

    function activateIceBlast() {
        if (!isGameActive || btnFreeze.disabled) return;

        showMessage("LODOWY WYBUCH!", 1500);
        punchesSinceLastPowerup = 0; // Reset punch counter
        lastUsedFreezeTime = Date.now(); // Set last use time
        updateSuperpowerButtons(); // Disable buttons and update timers

        // Calculate Ice Blast damage based on upgrade level
        const actualIceBlastInitialDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
        const actualIceBlastDotDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;

        // Remove hidden, add active
        freezeEffect.classList.remove('hidden');
        freezeEffect.classList.add('active'); // Activates CSS effects for the duration

        applyDamageToOzzy(actualIceBlastInitialDamage); // Apply initial damage

        freezeModeActive = true; // Activate freeze mode
        let dotTicks = 0;
        const maxDotTicks = ICE_BLAST_DOT_DURATION_SECONDS;

        // Start applying damage every second and spawning shards
        clearInterval(freezeDotIntervalId); // Ensure previous interval is cleared
        freezeDotIntervalId = setInterval(() => {
            if (!isGameActive && !upgradeShopScreen.classList.contains('hidden')) { // Check if game is still active OR if we are in the shop
                // If in shop, don't end DOT, but stop interval
                clearInterval(freezeDotIntervalId);
                // No need to set freezeModeActive to false here, it will be done when resuming game
                // We just resume the interval when resuming the game.
                return;
            }
            if (!isGameActive) { // If game is inactive (outside shop)
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; // Deactivate freeze mode
                freezeEffect.classList.remove('active'); // Remove visual effect class
                freezeEffect.innerHTML = ''; // Remove shards
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
                freezeModeActive = false; // Deactivate freeze mode
                freezeEffect.classList.remove('active'); // Remove visual effect class
                freezeEffect.innerHTML = ''; // Ensure all shards are removed at the end
                showMessage("Lodowy Wybuch osłabł.", 1000); // Message about effect ending
            }
        }, 1000); // Every second
    }

    function activateFrenzy() {
        if (!isGameActive || btnFrenzy.disabled) return;

        showMessage("SZAŁ BOJOWY!", 1500);
        punchesSinceLastPowerup = 0; // Reset punch counter
        lastUsedFrenzyTime = Date.now(); // Set last use time
        updateSuperpowerButtons(); // Disable buttons and update timers

        // Calculate initial Frenzy damage based on upgrade level
        const actualFrenzyInitialDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
        applyDamageToOzzy(actualFrenzyInitialDamage); // Apply initial damage

        frenzyModeActive = true;
        PUNCH_DAMAGE *= FRENZY_DAMAGE_MULTIPLIER; // Increase punch damage
        frenzyEffect.classList.remove('hidden');
        frenzyEffect.classList.add('active');

        clearTimeout(frenzyTimerId); // Ensure previous frenzy timer is cleared
        frenzyTimerId = setTimeout(() => {
            frenzyModeActive = false;
            PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL; // Restore normal damage (but account for base upgrade)
            frenzyEffect.classList.add('hidden');
            frenzyEffect.classList.remove('active');
            showMessage("Szał minął. Normalne uderzenia.", 1500);
        }, FRENZY_DURATION_MS);
    }


    // --- Boss Movement Animation Function ---
    let isBossMovementPaused = false; // New flag to pause boss movement
    function animateBossMovement() {
        if (!isGameActive || !isBossFight || isBossMovementPaused) { // Added pause condition
            cancelAnimationFrame(bossMovementAnimationFrameId); // Use cancelAnimationFrame
            return;
        }

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const ozzyRect = ozzyContainer.getBoundingClientRect(); // Current size and position of boss container

        // Calculate potential new transformX value
        let nextTransformX = bossCurrentTransformX + bossDx;

        // Define boundaries for nextTransformX based on container and Ozzy's width
        // maxOffsetRight is the maximum right offset so Ozzy's right edge touches the container's right edge
        const maxOffsetRight = (gameContainerRect.width / 2) - (ozzyRect.width / 2);
        // maxOffsetLeft is the maximum left offset so Ozzy's left edge touches the container's left edge
        const maxOffsetLeft = -((gameContainerRect.width / 2) - (ozzyRect.width / 2));

        // Collision check and direction change
        if (nextTransformX > maxOffsetRight) {
            nextTransformX = maxOffsetRight; // Snap to boundary
            bossDx *= -1; // Reverse direction
            ozzyImage.classList.add('flipped-x'); // Flip image left
        } else if (nextTransformX < maxOffsetLeft) {
            nextTransformX = maxOffsetLeft; // Snap to boundary
            bossDx *= -1; // Reverse direction
            ozzyImage.classList.remove('flipped-x'); // Flip image right
        }

        // Apply new transformX value
        ozzyContainer.style.transform = `translate(${nextTransformX}px, -50%)`;
        bossCurrentTransformX = nextTransformX; // Update state variable

        // Request next animation frame
        bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement);
    }


    // --- Game Functions ---
    function resetGame() {
        console.log("resetGame called.");
        score = 0;
        scoreDisplay.textContent = score;
        // Reset level
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        // Reset boss state and its image/style
        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); // Also remove flip class
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; // Reset health to initial normal Stonks value

        // Reset base damage according to upgrade level (if any)
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        // Remove spawn-ozzy class in case game was reset during animation
        ozzyImage.classList.remove('spawn-ozzy');
        ozzyContainer.classList.add('hidden'); // Hide Ozzy at start

        // Reset ozzyContainer position to center (important for next spawn)
        bossCurrentTransformX = 0; // Reset extra offset
        ozzyContainer.style.transform = `translate(-50%, -50%)`; // Restore CSS centering

        // Stop boss movement if active
        cancelAnimationFrame(bossMovementAnimationFrameId); // Use cancelAnimationFrame
        isBossMovementPaused = false; // Ensure pause flag is reset

        // Remove all quotes from screen on reset
        quoteImagesContainer.innerHTML = '';

        // Reset superpower state and cooldowns
        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;

        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); // Clear frenzy timer

        // Reset Ice Blast
        freezeModeActive = false;
        clearInterval(freezeDotIntervalId);
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active');
        freezeEffect.innerHTML = '';


        lightningEffect.classList.add('hidden');
        freezeEffect.classList.add('hidden');
        frenzyEffect.classList.add('hidden');
        lightningEffect.innerHTML = ''; // Clear lightning segments
        freezeEffect.innerHTML = ''; // Clear ice shards


        // Removed: messageDisplay.style.display = 'none'; // Hide general message
        // Remove all active knockout messages, if any
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        isGameActive = false;
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        upgradeShopScreen.classList.add('hidden'); // Hide shop
        startScreen.classList.remove('hidden'); // Show start screen
        shopButton.classList.remove('hidden'); // Show shop button on start screen
        superpowerButtonsContainer.classList.add('hidden'); // Hide superpower buttons on start screen

        // Stop cooldown timer interval
        clearInterval(superpowerCooldownIntervalId);
        updateSuperpowerCooldownDisplays(); // Final update to show original text

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    // Function to display GENERAL messages (now also for boss start)
    // Will use the same styles as superpowers.
    function showMessage(message, duration = 1500) {
        // Create a new div for the message
        const dynamicMessageElement = document.createElement('div');
        dynamicMessageElement.classList.add('knockout-message'); // Reuse knockout-message styling
        dynamicMessageElement.textContent = message;

        // Append to game container
        gameContainer.appendChild(dynamicMessageElement);

        // Set timeout to remove the message after its duration
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
        shopButton.classList.remove('hidden'); // Ensure shop button is visible during gameplay
        console.log("After hidden: startScreen display", window.getComputedStyle(startScreen).display);
        ozzyContainer.classList.remove('hidden'); // Show Ozzy
        scoreDisplay.classList.remove('hidden'); // Show score counter
        // Show level counter
        currentLevelDisplay.parentElement.classList.remove('hidden');
        superpowerButtonsContainer.classList.remove('hidden'); // Show superpower buttons
        shopButton.classList.remove('hidden'); // Ensure shop button is visible during gameplay

        isGameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
        // Set initial level
        currentLevel = 0;
        currentLevelDisplay.textContent = currentLevel;

        // Set initial Stonks state (normal, no boss)
        isBossFight = false;
        ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL;
        ozzyImage.classList.remove('boss-mode');
        ozzyImage.classList.remove('flipped-x'); // Ensure it's not flipped at start
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH;

        // Set base damage at game start, accounting for upgrades
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;

        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        ozzyImage.classList.remove('hit-effect');
        // Remove spawn-ozzy class at game start
        ozzyImage.classList.remove('spawn-ozzy');

        // Reset superpowers at game start
        punchesSinceLastPowerup = 0;
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;

        frenzyModeActive = false;
        clearTimeout(frenzyTimerId); // Clear frenzy timer

        // Reset Ice Blast
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
        // Remove all active knockout messages, if any
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());

        // Remove quotes, if any remained from previous game session
        quoteImagesContainer.innerHTML = '';

        // Stop and reset boss movement
        cancelAnimationFrame(bossMovementAnimationFrameId); // Use cancelAnimationFrame
        isBossMovementPaused = false; // Ensure pause flag is reset
        bossCurrentTransformX = 0; // Reset extra X offset
        ozzyContainer.style.transform = `translate(-50%, -50%)`; // Center Ozzy with CSS

        // Start cooldown timer interval
        clearInterval(superpowerCooldownIntervalId); // Clear previous if exists
        superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
        updateSuperpowerButtons(); // Initial update of button state and text

        if (backgroundMusic) {
            backgroundMusic.play().catch(e => console.error("Error playing backgroundMusic:", e));
        }
    }

    function endGame(message) {
        console.log("endGame called with message:", message);
        isGameActive = false;
        ozzyContainer.classList.add('hidden'); // Hide Ozzy after game ends
        scoreDisplay.classList.add('hidden'); // Hide score counter
        // Hide level counter
        currentLevelDisplay.parentElement.classList.add('hidden');
        // Removed: messageDisplay.style.display = 'none';
        quoteImagesContainer.innerHTML = ''; // Remove all quotes after game ends
        // Remove all active knockout messages, if any
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());


        // Reset all active superpowers after game ends
        frenzyModeActive = false;
        // Restore normal damage, accounting for base upgrades
        PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
        clearTimeout(frenzyTimerId);

        // Reset Ice Blast
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
        punchesSinceLastPowerup = 0; // Reset superpower counter
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        updateSuperpowerButtons(); // Update button state

        // Stop cooldown timer interval
        clearInterval(superpowerCooldownIntervalId);
        // Stop boss movement if active
        cancelAnimationFrame(bossMovementAnimationFrameId);
        isBossMovementPaused = false; // Ensure pause flag is reset

        document.getElementById('end-message').textContent = message;
        finalScoreDisplay.textContent = score;

        saveScoreToLeaderboard(playerNickname, score);

        endScreen.classList.remove('hidden');

        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    // Handles Ozzy knockout
    function handleOzzyKnockout() {
        score++; // Punches (score) still go up
        scoreDisplay.textContent = score;

        currentLevel++; // Increase level
        currentLevelDisplay.textContent = currentLevel; // Update level display


        // Remove existing knockout messages before creating a new one
        document.querySelectorAll('.knockout-message').forEach(el => el.remove());

        // Ozzy disappears immediately after knockout
        ozzyContainer.classList.add('hidden');

        // Boss / health increase logic
        if (currentLevel > 0 && currentLevel % 10 === 0) {
            // This is a boss level
            isBossFight = true;
            ozzyImage.src = BOSS_IMAGE_URL; // Change image to boss
            ozzyImage.classList.add('boss-mode'); // Add boss styling class
            INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH; // Boss has increased health

            // DISPLAY BOSS FIGHT START MESSAGE USING showMessage (larger, central style)
            showMessage("UWAGA! BOSS STONKS! ROZPIERDOL GO!", 2500); // Longer visibility time

            // Start boss movement
            cancelAnimationFrame(bossMovementAnimationFrameId); // Ensure no old interval
            isBossMovementPaused = false; // Ensure pause flag is reset

            // Reset bossCurrentTransformX and apply transform to center boss
            bossCurrentTransformX = 0;
            ozzyContainer.style.transform = `translate(${bossCurrentTransformX}px, -50%)`;

            bossDx = BOSS_MOVEMENT_SPEED * (Math.random() < 0.5 ? 1 : -1); // Random starting direction
            if (bossDx < 0) {
                ozzyImage.classList.add('flipped-x');
            } else {
                ozzyImage.classList.remove('flipped-x');
            }
            bossMovementAnimationFrameId = requestAnimationFrame(animateBossMovement); // Start boss animation

        } else {
            // Normal level
            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; // Restore normal image
            ozzyImage.classList.remove('boss-mode'); // Remove boss styling class
            ozzyImage.classList.remove('flipped-x'); // Also remove flip class
            // Reset ozzyContainer position to center (for next normal Stonks)
            bossCurrentTransformX = 0; // Reset extra offset
            ozzyContainer.style.transform = `translate(-50%, -50%)`; // Restore CSS centering

            cancelAnimationFrame(bossMovementAnimationFrameId); // Stop boss movement if active
            isBossMovementPaused = false; // Ensure pause flag is reset

            if (currentLevel > 0 && currentLevel % 5 === 0) {
                 INITIAL_OZZY_HEALTH += NORMAL_OZZY_HEALTH_INCREMENT; // Normal health increment
                 showMessage(`Stonks jest silniejszy!`, 2000); // Message about increased health
            }
            // Create and display non-blocking knockout message (standard style)
            const knockoutMsgElement = document.createElement('div');
            knockoutMsgElement.classList.add('knockout-message'); // Use new CSS class
            knockoutMsgElement.textContent = 'Stonks rozjebany!'; // Standard knockout message
            gameContainer.appendChild(knockoutMsgElement);

            setTimeout(() => {
                knockoutMsgElement.remove();
            }, 2000); // Matches CSS animation duration (fadeOutUpSmall)
        }

        ozzyHealth = INITIAL_OZZY_HEALTH; // Full health for new round
        updateHealthBar(); // Health bar updates immediately

        // Ozzy reappears after a VERY SHORT delay with animation
        setTimeout(() => {
            ozzyContainer.classList.remove('hidden');
            ozzyImage.classList.remove('hit-effect');
            ozzyImage.classList.add('spawn-ozzy'); // Add spawn animation class

            // Remove animation class after it finishes, so it doesn't conflict with other animations/styles
            setTimeout(() => {
                ozzyImage.classList.remove('spawn-ozzy');
            }, 500); // spawnOzzy animation duration in CSS
        }, 200); // Ozzy's "absence" time on screen before reappearing (0.2 seconds)

    }

    function handlePunch(event) {
        console.log("handlePunch called.");
        // Removed isOzzyDown condition to allow clicking Ozzy right after knockout
        if (!isGameActive) {
            return;
        }

        const punchSoundInstance = new Audio('punch.mp3');
        punchSoundInstance.play().catch(e => console.error("Error playing punchSoundInstance:", e));
        punchSoundInstance.onended = () => {
            punchSoundInstance.remove();
        };

        applyDamageToOzzy(PUNCH_DAMAGE); // Use current base damage

        ozzyImage.classList.add('hit-effect');
        setTimeout(() => {
            ozzyImage.classList.remove('hit-effect');
        }, 150);

        // Check if Ozzy was hit and if there's a chance for a quote to appear
        if (!isBossFight && ozzyHealth > 0 && Math.random() < 0.3) { // 30% chance for quote after hit (only for normal Stonks)
            spawnRandomQuote();
        } else if (isBossFight && ozzyHealth > 0 && Math.random() < 0.2) { // 20% chance for boss quote
            // Check if no other "knockout-message" is already displayed
            if (document.querySelectorAll('.knockout-message').length === 0) {
                const randomBossQuote = BOSS_QUOTES[Math.floor(Math.random() * BOSS_QUOTES.length)];
                // Create and display non-blocking knockout message (standard style)
                const bossQuoteElement = document.createElement('div');
                bossQuoteElement.classList.add('knockout-message');
                bossQuoteElement.textContent = randomBossQuote;
                gameContainer.appendChild(bossQuoteElement);

                setTimeout(() => {
                    bossQuoteElement.remove();
                }, 2000); // Disappears after 2 seconds
            }
        }

        // Increase superpower punch counter
        punchesSinceLastPowerup++;
        updateSuperpowerButtons(); // Update superpower button state (including cooldowns)
    }

    // --- NEW: Upgrade Shop Functions ---
    function calculateUpgradeCost(currentLevel) {
        return Math.ceil(UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, currentLevel - 1));
    }

    function updateUpgradeShopUI() {
        // Base Damage
        baseDamageLevelDisplay.textContent = upgradeLevels.baseDamage;
        const nextBaseDamageCost = calculateUpgradeCost(upgradeLevels.baseDamage);
        baseDamageCostDisplay.textContent = nextBaseDamageCost;
        buyBaseDamageButton.disabled = score < nextBaseDamageCost;

        // Lightning Strike
        lightningDamageLevelDisplay.textContent = upgradeLevels.lightningDamage;
        const nextLightningDamageCost = calculateUpgradeCost(upgradeLevels.lightningDamage);
        lightningDamageCostDisplay.textContent = nextLightningDamageCost;
        buyLightningDamageButton.disabled = score < nextLightningDamageCost;

        // Ice Blast
        freezeDamageLevelDisplay.textContent = upgradeLevels.freezeDamage;
        const nextFreezeDamageCost = calculateUpgradeCost(upgradeLevels.freezeDamage);
        freezeDamageCostDisplay.textContent = nextFreezeDamageCost;
        buyFreezeDamageButton.disabled = score < nextFreezeDamageCost;

        // Frenzy
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

            // Apply upgrade
            if (upgradeType === 'baseDamage') {
                PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Obrażenia Podstawowe! Nowe obrażenia: ${PUNCH_DAMAGE}`, 1500);
            } else if (upgradeType === 'lightningDamage') {
                // LIGHTNING_BASE_DAMAGE is used for calculations in activateLightningStrike, so we don't need to change it directly here,
                // but we can visually show the effect:
                const nextLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage -1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Piorun Zagłady! Poziom: ${upgradeLevels.lightningDamage} (Obrażenia: ~${nextLightningDamage})`, 1500);
            } else if (upgradeType === 'freezeDamage') {
                // Similarly for Freeze, damage will be calculated in activateIceBlast
                const nextInitialFreezeDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
                const nextDotFreezeDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Lodowy Wybuch! Poziom: ${upgradeLevels.freezeDamage} (Obrażenia: ~${nextInitialFreezeDamage}, DOT: ~${nextDotFreezeDamage}/s)`, 1500);
            } else if (upgradeType === 'frenzyDamage') {
                // Similarly for Frenzy, damage will be calculated in activateFrenzy
                const nextFrenzyDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Szał Bojowy! Poziom: ${upgradeLevels.frenzyDamage} (Obrażenia: ~${nextFrenzyDamage})`, 1500);
            }

            updateUpgradeShopUI(); // Refresh shop UI after purchase
        } else {
            showMessage("Za mało punktów!", 1000);
        }
    }


    // Important: this checks if the script is running at all
    console.log("Script.js is running!");

    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOMContentLoaded: DOM has been loaded!");

        // IMPORTANT: Hide the upgrade shop screen immediately upon load.
        // This prevents a brief display if resetGame is slow.
        upgradeShopScreen.classList.add('hidden');

        // Ensure all screens are initially hidden, except startScreen is made visible by resetGame()
        endScreen.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');
        ozzyContainer.classList.add('hidden');
        scoreDisplay.classList.add('hidden');
        currentLevelDisplay.parentElement.classList.add('hidden');
        quoteImagesContainer.innerHTML = ''; // Ensure quotes container is empty at start

        resetGame(); // This function will also reset superpowers and cooldowns

        console.log("Initial game container dimensions:", gameContainer.offsetWidth, gameContainer.offsetHeight);
        console.log("Initial target image (Ozzy) dimensions:", ozzyImage.offsetWidth, ozzyImage.offsetHeight);

        // Initialize anonymous authentication after DOM is loaded
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
            const nick = nicknameInput.value.trim();
            if (nick === "") {
                showMessage("Musisz wpisać swój nick!", 2000);
                return;
            }
            playerNickname = nick;
            startGame();
        });

        showLeaderboardButton.addEventListener('click', () => {
            console.log("LEADERBOARD button clicked!");
            startScreen.classList.add('hidden');
            shopButton.classList.add('hidden'); // Hide shop button when opening leaderboard
            superpowerButtonsContainer.classList.add('hidden'); // Hide superpower buttons
            ozzyContainer.classList.add('hidden'); // Hide Ozzy
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
            shopButton.classList.add('hidden'); // Hide shop button when opening leaderboard
            superpowerButtonsContainer.classList.add('hidden'); // Hide superpower buttons
            ozzyContainer.classList.add('hidden'); // Hide Ozzy
            leaderboardScreen.classList.remove('hidden');
            fetchAndDisplayLeaderboard();
        });

        backToStartButton.addEventListener('click', () => {
            console.log("BACK TO MENU button clicked!");
            leaderboardScreen.classList.add('hidden');
            resetGame(); // This function already shows the start screen and shop button
        });

        // Superpower button click handlers
        btnLightning.addEventListener('click', activateLightningStrike);
        btnFreeze.addEventListener('click', activateIceBlast);
        btnFrenzy.addEventListener('click', activateFrenzy);

        // --- NEW: Upgrade Shop Event Handlers ---
        shopButton.addEventListener('click', () => {
            // CHANGED: Game pausing logic
            isGameActive = false; // Pause game
            cancelAnimationFrame(bossMovementAnimationFrameId); // Stop boss movement
            isBossMovementPaused = true; // Set boss movement pause flag
            clearInterval(superpowerCooldownIntervalId); // Stop cooldown timer updates

            ozzyContainer.classList.add('hidden'); // Hide Ozzy
            superpowerButtonsContainer.classList.add('hidden'); // Hide superpower buttons
            shopButton.classList.add('hidden'); // Hide shop button
            scoreDisplay.classList.add('hidden'); // Hide score/level display
            currentLevelDisplay.parentElement.classList.add('hidden'); // Hide score/level display

            upgradeShopScreen.classList.remove('hidden'); // Show shop screen
            updateUpgradeShopUI(); // Refresh shop UI when opened
        });

        closeShopButton.addEventListener('click', () => {
            upgradeShopScreen.classList.add('hidden'); // Hide shop screen

            // CHANGED: Game resuming logic
            ozzyContainer.classList.remove('hidden'); // Show Ozzy
            superpowerButtonsContainer.classList.remove('hidden'); // Show superpower buttons
            shopButton.classList.remove('hidden'); // Show shop button
            scoreDisplay.classList.remove('hidden'); // Show score/level display
            currentLevelDisplay.parentElement.classList.remove('hidden'); // Show score/level display

            isGameActive = true; // Resume game
            isBossMovementPaused = false; // Reset boss movement pause flag
            if (isBossFight) { // If it's a boss fight, resume movement
                animateBossMovement();
            }
            // Resume cooldown timer interval
            clearInterval(superpowerCooldownIntervalId); // Ensure previous is cleared
            superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
            updateSuperpowerButtons(); // Update button state

            // In case of Ice Blast, if it was active, resume its DOT
            if (freezeModeActive) {
                activateIceBlast(); // Calling it again will activate the DOT interval
            }
        });

        buyBaseDamageButton.addEventListener('click', () => buyUpgrade('baseDamage'));
        buyLightningDamageButton.addEventListener('click', () => buyUpgrade('lightningDamage'));
        buyFreezeDamageButton.addEventListener('click', () => buyUpgrade('freezeDamage'));
        buyFrenzyDamageButton.addEventListener('click', () => buyUpgrade('frenzyDamage'));

        // Initial update of shop UI when the game loads
        updateUpgradeShopUI();
    });
