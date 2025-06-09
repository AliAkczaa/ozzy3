    // === Firebase Configuration (Musisz Zastąpić Własnymi Kluczami!) ===
    // Przejdź do Firebase Console -> Twój Projekt -> Ustawienia projektu (zębatka) -> Dodaj aplikację (ikona </> dla web)
    // Skopiuj obiekt firebaseConfig i wklej go tutaj:
    const firebaseConfig = {
        apiKey: "AIzaSyASSmHw3LVUu7lSql0QwGmmBcFkaNeMups", // Your Firebase API Key
        authDomain: "ozzy-14c19.firebaseapp.com",
        projectId: "ozzy-14c19",
        storageBucket: "ozzy-14c19.firebaseapp.com",
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
    let lightningEffect; // Still used for full-screen flash
    let freezeEffect;    // Still used for full-screen tint/glow
    let frenzyEffect;    // Still used for full-screen tint/glow
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
    let gameEffectsCanvas; // Canvas for all dynamic effects
    let gameEffectsCtx;    // 2D rendering context for the effects canvas

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
    // QUOTE_SIZE_PX is now a maximum for responsive sizing in CSS
    const QUOTE_DISPLAY_DURATION_MS = 2000;
    
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
    const BOSS_LEVEL_INTERVAL = 10; // Boss appears every 10 levels (e.g. level 10, 20, 30)

    const NORMAL_OZZY_INITIAL_HEALTH = 100;
    const NORMAL_OZZY_HEALTH_INCREMENT = 20; 
    // ZMIANA: Zmniejszone zdrowie początkowe i przyrost dla bossa
    const BOSS_INITIAL_HEALTH = 300; 
    const BOSS_HEALTH_INCREMENT_PER_ENCOUNTER = 100; 

    const BOSS_MOVEMENT_SPEED = 2; 
    const BOSS_QUOTES = [
        "CHLOPY OD CRYPTONA FARMIA!", "TTB TO GÓWNO! TYLKO STONKS!", 
        "DO DUBAJU! ZA KASE INWESTORÓW!", "1 LAUNCHPAD, 1 BOT, 1 DEX!", 
        "FARMER Z BSC - TOM - PISZE ZE TO JA JESTEM SCAMEREM!"
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
    const totalStonksVariants = 10;     // Number of available variants (0-9)
    let bossVisualVariantIndex = 0;    // Current index of Boss visual variant
    const totalBossVariants = 10;       // Number of available Boss variants (0-9)

    // Original superpower button texts (for display when not on cooldown)
    const originalLightningText = 'Piorun Zagłady';
    const originalFreezeText = 'Lodowy Wybuch';
    const originalFrenzyText = 'Szał Bojowy';

    // === Canvas Particles System ===
    class CanvasParticle {
        constructor(x, y, vx, vy, color, size, life, type, angle = 0, targetX = null, targetY = null) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size; // Updated: size can be larger now
            this.life = life; // Total frames/steps to live
            this.currentLife = 0;
            this.alpha = 1;
            this.type = type; // 'bossFire', 'bossIce', 'bossElectricity', 'lightningLine', 'iceShard', 'frenzyPulse'
            this.angle = angle; // For rotation of some shapes
            this.targetX = targetX;
            this.targetY = targetY;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.currentLife++;
            this.alpha = 1 - (this.currentLife / this.life); // Linear fade out

            // Type-specific physics
            if (this.type === 'iceShard') {
                this.vy -= 0.05; // Float upwards
            } else if (this.type === 'frenzyPulse') {
                this.size *= 1.02; // Grow slightly
                this.alpha -= 0.05; // Fade faster for quick pulse
            } else if (this.type === 'lightningLine') {
                // Lightning lines are static after creation, they just fade
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);

            if (this.type.startsWith('boss') || this.type === 'lightningSpark') { // Added lightningSpark type for small particles
                ctx.fillStyle = this.color;
                ctx.beginPath();
                if (this.type === 'bossElectricity' || this.type === 'lightningSpark') {
                    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                } else {
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (this.type === 'lightningLine') {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.size;
                ctx.lineCap = 'round'; // Rounded ends for lightning segments
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.targetX, this.targetY); // Use target for lightning line end point
                ctx.stroke();
            } else if (this.type === 'iceShard') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                ctx.moveTo(0, -this.size); // Top point
                ctx.lineTo(this.size / 2, this.size / 2); // Bottom right
                ctx.lineTo(-this.size / 2, this.size / 2); // Bottom left
                ctx.closePath();
                ctx.fill();
            } else if (this.type === 'frenzyPulse') {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }

        isDead() {
            return this.currentLife >= this.life || this.alpha <= 0;
        }
    }


    // Global arrays for different types of canvas particles
    let bossCanvasParticles = [];
    let lightningCanvasParticles = [];
    let freezeCanvasParticles = [];
    let frenzyCanvasParticles = [];
    const MAX_CANVAS_PARTICLES = 200; // General limit for performance
    let lightningModeActive = false; // New state variable for lightning storm

    let gameCanvasAnimationFrameId;

    function animateGameCanvasEffects() {
        // Resize canvas to match gameContainer (do this first for correct drawing)
        gameEffectsCanvas.width = gameContainer.offsetWidth;
        gameEffectsCanvas.height = gameContainer.offsetHeight;
        gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCanvas.height);

        // Calculate Ozzy's center relative to the canvas
        const ozzyRect = ozzyContainer.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        const ozzyCanvasX = ozzyRect.left - gameRect.left + ozzyRect.width / 2;
        const ozzyCanvasY = ozzyRect.top - gameRect.top + ozzyRect.height / 2;

        // Common multipliers for particle spawn area and speed
        const spawnAreaMultiplier = isBossFight ? 1.5 : 1.2; // Larger area for boss
        const baseParticleSpeed = 1; // Base speed, particles will be slower
        
        // Boss particles (spawn only if boss fight is active)
        if (isBossFight) {
            gameEffectsCanvas.classList.remove('hidden'); // Ensure canvas is visible for boss effects
            gameEffectsCanvas.classList.add('active'); // Add active class for transition
            if (bossCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.5) {
                let color, type;
                if (bossVisualVariantIndex === 0) { // Red/fiery boss
                    color = `rgba(255, ${Math.floor(Math.random() * 100)}, 0, 0.7)`;
                    type = 'bossFire';
                } else if (bossVisualVariantIndex === 1) { // Blue/glitchy boss
                    color = `rgba(0, ${Math.floor(Math.random() * 100) + 155}, 255, 0.7)`;
                    type = 'bossIce';
                } else { // Purple/intense boss
                    color = `rgba(${Math.floor(Math.random() * 100) + 155}, 0, ${Math.floor(Math.random() * 100) + 155}, 0.7)`;
                    type = 'bossElectricity';
                }
                bossCanvasParticles.push(new CanvasParticle(
                    ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * spawnAreaMultiplier, // Zwiększony obszar
                    ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * spawnAreaMultiplier, // Zwiększony obszar
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // vx (zmniejszona prędkość o 50%)
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // vy (zmniejszona prędkość o 50%)
                    color, Math.random() * 12 + 6, 90, type // size (większy o 25%), life (dłuższe)
                ));
            }
        }
        // Update and draw boss particles (and remove dead ones)
        for (let i = bossCanvasParticles.length - 1; i >= 0; i--) {
            bossCanvasParticles[i].update();
            if (bossCanvasParticles[i].isDead()) {
                bossCanvasParticles.splice(i, 1);
            } else {
                bossCanvasParticles[i].draw(gameEffectsCtx);
            }
        }

        // Lightning particles (spawned in activateLightningStrike, just update and draw here)
        if (lightningModeActive) {
            gameEffectsCanvas.classList.remove('hidden');
            gameEffectsCanvas.classList.add('active');
            lightningEffect.classList.remove('hidden'); // Ensure the overlay is visible
            lightningEffect.classList.add('flash-active'); // Ensure the flash effect is active

            // Spawn new lightning particles frequently
            if (lightningCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.7) { // Control frequency for storm
                const numSegments = Math.floor(Math.random() * 3) + 2; // 2-4 segments per bolt
                let currentX = ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.8; // Start near Ozzy, wider area (increased area for storm)
                let currentY = ozzyCanvasY - ozzyRect.height * (0.5 + Math.random() * 0.5); // Start above Ozzy

                for (let i = 0; i < numSegments; i++) {
                    const nextX = currentX + (Math.random() - 0.5) * 80; // Segment length (increased)
                    const nextY = currentY + (Math.random() * 100); // Segment length, generally downwards (increased)

                    const life = 45 + Math.random() * 45; // Longer life for individual segments (1.5 seconds)
                    const size = Math.random() * 8 + 8; // Line width (larger for better visibility)

                    lightningCanvasParticles.push(new CanvasParticle(
                        currentX, currentY, 0, 0, // No movement for line segments, fixed start/end
                        `rgba(255, 255, ${Math.floor(Math.random() * 100) + 155}, ${0.7 + Math.random() * 0.3})`, // Brighter, yellower
                        size, life, 'lightningLine', 0, nextX, nextY
                    ));
                    currentX = nextX;
                    currentY = nextY;
                }

                // Add some "sparks" around the lightning strike (larger, slower)
                for (let j = 0; j < Math.random() * 2 + 1; j++) { // 1-2 sparks per bolt
                    lightningCanvasParticles.push(new CanvasParticle(
                        ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.8, // Wider spawn area for sparks
                        ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * 1.8,
                        (Math.random() - 0.5) * (baseParticleSpeed * 0.7), // Slower sparks (reduced by 30%)
                        (Math.random() - 0.5) * (baseParticleSpeed * 0.7),
                        `rgba(255, 255, 200, ${0.5 + Math.random() * 0.5})`,
                        Math.random() * 8 + 4, // size (larger)
                        60, // life (longer)
                        'lightningSpark' // Specific type for lightning sparks
                    ));
                }
            }
        } else if (!lightningModeActive && lightningEffect.classList.contains('flash-active')) {
            // If lightning mode just ended, remove the flash effect
            lightningEffect.classList.remove('flash-active');
            lightningEffect.classList.add('hidden'); // Hide it
        }

        for (let i = lightningCanvasParticles.length - 1; i >= 0; i--) {
            lightningCanvasParticles[i].update();
            if (lightningCanvasParticles[i].isDead()) {
                lightningCanvasParticles.splice(i, 1);
            } else {
                lightningCanvasParticles[i].draw(gameEffectsCtx);
            }
        }

        // Freeze particles (spawn only if freeze mode is active)
        if (freezeModeActive) {
            gameEffectsCanvas.classList.remove('hidden'); // Ensure canvas is visible for freeze effects
            gameEffectsCanvas.classList.add('active');
            if (freezeCanvasParticles.length < MAX_CANVAS_PARTICLES / 2 && Math.random() < 0.3) {
                freezeCanvasParticles.push(new CanvasParticle(
                    ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.5, // Zwiększony obszar
                    ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * 1.5, // Zwiększony obszar
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // vx (jeszcze mniejsza prędkość) // ZMIANA: Zmniejszona prędkość
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // vy (jeszcze mniejsza prędkość) // ZMIANA: Zmniejszona prędkość
                    `rgba(173, 216, 230, ${0.7 + Math.random() * 0.3})`, // Vary alpha
                    Math.random() * 15 + 8, // size (większy)
                    90, // life (dłuższe)
                    'iceShard',
                    Math.random() * 360 // random angle
                ));
            }
        }
        for (let i = freezeCanvasParticles.length - 1; i >= 0; i--) {
            freezeCanvasParticles[i].update();
            if (freezeCanvasParticles[i].isDead()) {
                freezeCanvasParticles.splice(i, 1);
            } else {
                freezeCanvasParticles[i].draw(gameEffectsCtx);
            }
        }

        // Frenzy particles (spawn only if frenzy mode is active)
        if (frenzyModeActive) {
            gameEffectsCanvas.classList.remove('hidden'); // Ensure canvas is visible for frenzy effects
            gameEffectsCanvas.classList.add('active');
            if (frenzyCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.7) { // More frequent for frenzy
                frenzyCanvasParticles.push(new CanvasParticle(
                    ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.5, // Zwiększony obszar
                    ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * 1.5, // Zwiększony obszar
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // vx (jeszcze mniejsza prędkość) // ZMIANA: Zmniejszona prędkość
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // vy (jeszcze mniejsza prędkość) // ZMIANA: Zmniejszona prędkość
                    `rgba(255, 165, 0, ${0.7 + Math.random() * 0.3})`, // ZMIANA: Kolor na pomarańczowy
                    (Math.random() * 12 + 6) * 1.25, // ZMIANA: Rozmiar większy o 25%
                    45, // short life, but slightly longer
                    'frenzyPulse'
                ));
            }
        }
        for (let i = frenzyCanvasParticles.length - 1; i >= 0; i--) {
            frenzyCanvasParticles[i].update();
            if (frenzyCanvasParticles[i].isDead()) {
                frenzyCanvasParticles.splice(i, 1);
            } else {
                frenzyCanvasParticles[i].draw(gameEffectsCtx);
            }
        }

        // Determine if there are *any* active particles
        const anyParticlesActive = bossCanvasParticles.length > 0 ||
                                   lightningCanvasParticles.length > 0 ||
                                   freezeCanvasParticles.length > 0 ||
                                   frenzyCanvasParticles.length > 0;

        // Only request next frame if game is active OR there are still particles to animate
        if (isGameActive || anyParticlesActive) {
            gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects);
        } else {
            // No particles and game is inactive, so hide and clear canvas
            gameEffectsCanvas.classList.add('hidden');
            gameEffectsCanvas.classList.remove('active');
            gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
            cancelAnimationFrame(gameCanvasAnimationFrameId); // Ensure it stops
        }
    }

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
        // ZMIANA: Losowanie pozycji na całym ekranie, aby obrazki były widoczne
        const imgSize = Math.min(gameContainerRect.width * 0.15, gameContainerRect.height * 0.15, 150); // Use clamp in CSS

        const randomX = Math.random() * (gameContainerRect.width - imgSize);
        const randomY = Math.random() * (gameContainerRect.height - imgSize);

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

        lightningModeActive = true; // Activate lightning storm mode
        // Clear existing lightning particles to prevent accumulation from previous activations
        lightningCanvasParticles = [];
        // Set a timeout to deactivate lightning mode after 2.5 seconds
        setTimeout(() => {
            lightningModeActive = false;
        }, 2500); // Duration for the lightning storm (2.5 seconds)
    
        // Get Ozzy's position relative to the game container
        const ozzyRect = ozzyContainer.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();

        // Calculate center of Ozzy relative to game container
        const ozzyCanvasX = ozzyRect.left - gameRect.left + ozzyRect.width / 2;
        const ozzyCanvasY = ozzyRect.top - gameRect.top + ozzyRect.height / 2;

        const numBolts = 5; // Number of lightning segments

        lightningEffect.classList.remove('hidden'); // Show the overlay for general flash
        lightningEffect.classList.add('flash-active'); // Add class for animation

        // Generate lightning bolts on canvas
        for (let i = 0; i < numBolts; i++) {
            // Start point near top of Ozzy, spread wider
            const startX = ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.5; // Zwiększony obszar startowy
            const startY = ozzyCanvasY - ozzyRect.height * 0.7; // Start wyżej nad Ozzy'm

            // End point below Ozzy, spread wider
            const endX = ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.8; // Zwiększony obszar końcowy
            const endY = ozzyCanvasY + ozzyRect.height * 0.8 + Math.random() * 50; // Koniec niżej

            const life = 90; // Dłuższe życie dla efektu błyskawicy (ok. 1.5 sekundy przy 60FPS)
            const size = Math.random() * 8 + 5; // Line width (większy)

            lightningCanvasParticles.push(new CanvasParticle(
                startX, startY, 0, 0, // No independent movement for lines, target defines end
                `rgba(255, 255, 0, ${0.8 + Math.random() * 0.2})`, // Brighter yellow
                size, life, 'lightningLine', 0, endX, endY // Pass targetX, targetY
            ));

            // Add some small, bright "sparks" around the bolt (larger, slower)
            for (let j = 0; j < 3; j++) {
                lightningCanvasParticles.push(new CanvasParticle(
                    startX + (Math.random() - 0.5) * 30, // Większe rozproszenie
                    startY + (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 2.5, // vx (wolniejsze)
                    (Math.random() - 0.5) * 2.5, // vy (wolniejsze)
                    `rgba(255, 255, 200, ${0.5 + Math.random() * 0.5})`,
                    Math.random() * 5 + 3, // size (większy)
                    45, // ZWIĘKSZONO: Życie dla iskier
                    'bossFire' 
                ));
            }
        }

        // Hide CSS flash and clear canvas particles after animation
        setTimeout(() => {
            lightningEffect.classList.remove('flash-active');
            lightningEffect.classList.add('hidden');
        }, 1500); 
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
        freezeEffect.classList.add('active'); // Activate CSS overlay

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
                freezeCanvasParticles = []; // Clear particles on deactivation
                return;
            }
            applyDamageToOzzy(actualIceBlastDotDamage);
            dotTicks++;

            // Ice shards are now spawned directly in animateGameCanvasEffects if freezeModeActive
            
            if (dotTicks >= maxDotTicks) {
                clearInterval(freezeDotIntervalId);
                freezeModeActive = false; 
                freezeEffect.classList.remove('active'); 
                freezeCanvasParticles = []; // Clear particles
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
        frenzyEffect.classList.add('active'); // Activate CSS overlay

        clearTimeout(frenzyTimerId); 
        frenzyTimerId = setTimeout(() => {
            frenzyModeActive = false;
            PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL; 
            frenzyEffect.classList.add('hidden');
            frenzyEffect.classList.remove('active');
            frenzyCanvasParticles = []; // Clear particles
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
        } else {
            // If it's a boss fight, apply specific boss variant on top of default boss styling
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
        // Ensure effect overlays are hidden
        freezeEffect.classList.add('hidden');
        freezeEffect.classList.remove('active'); 
        frenzyEffect.classList.add('hidden');
        frenzyEffect.classList.remove('active');
        lightningEffect.classList.add('hidden');
        lightningEffect.classList.remove('flash-active');
        
        // Clear all canvas effect particles
        cancelAnimationFrame(gameCanvasAnimationFrameId); // ZMIANA: Anuluj animację canvasa
        gameEffectsCanvas.classList.add('hidden'); // ZMIANA: Ukryj canvas
        gameEffectsCanvas.classList.remove('active'); // ZMIANA: Usuń klasę active
        bossCanvasParticles = [];
        lightningCanvasParticles = [];
        freezeCanvasParticles = [];
        frenzyCanvasParticles = [];
        if (gameEffectsCtx) {
            gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
        }

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

        // Reset Ozzy's health for the new game based on level 1
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH; // No scaling for level 1
        ozzyHealth = INITIAL_OZZY_HEALTH;
        updateHealthBar();
        
        // Apply initial Stonks appearance for level 1 (always variant 0)
        stonksVisualVariantIndex = 0; 
        updateOzzyAppearance(); 

        // Start superpower cooldown interval
        clearInterval(superpowerCooldownIntervalId); 
        superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
        updateSuperpowerButtons(); 

        // Start the main canvas animation loop
        gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects); // ZMIANA: Upewnij się, że animacja canvasa startuje
        gameEffectsCanvas.classList.remove('hidden'); // ZMIANA: Upewnij się, że canvas jest widoczny
        gameEffectsCanvas.classList.add('active');


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
        freezeEffect.classList.remove('active'); 


        lightningEffect.classList.add('hidden');
        lightningEffect.classList.remove('flash-active');
        
        punchesSinceLastPowerup = 0; 
        lastUsedLightningTime = 0;
        lastUsedFreezeTime = 0;
        lastUsedFrenzyTime = 0;
        updateSuperpowerButtons(); 

        clearInterval(superpowerCooldownIntervalId);
        cancelAnimationFrame(bossMovementAnimationFrameId);
        isBossMovementPaused = false; 

        // Clear all canvas effect particles
        cancelAnimationFrame(gameCanvasAnimationFrameId);
        gameEffectsCanvas.classList.add('hidden');
        gameEffectsCanvas.classList.remove('active');
        bossCanvasParticles = [];
        lightningCanvasParticles = [];
        freezeCanvasParticles = [];
        frenzyCanvasParticles = [];
        if (gameEffectsCtx) {
            gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
        }

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
        score++; // Increment score for every knockout
        scoreDisplay.textContent = score;

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
            // No need to set ozzyHealth and updateHealthBar here, startBossFight handles it.
            // No need for a separate knockout message, startBossFight handles boss message.
        } else {
            // Normal Stonks knockout
            currentLevel = nextLevelCandidate; // Increment level for normal stonks
            currentLevelDisplay.textContent = currentLevel; // Update display
            console.log(`Normal Stonks knockout. New level: ${currentLevel}`);

            isBossFight = false;
            ozzyImage.src = ORIGINAL_OZZY_IMAGE_URL; 
            ozzyImage.classList.remove('boss-mode'); 
            ozzyImage.classList.remove('flipped-x'); 
            
            // ZMIANA: Logika wyboru wariantu Stonksa:
            if (currentLevel >= 1 && currentLevel <= 10) {
                stonksVisualVariantIndex = 0; // Wariant 0 dla poziomów 1-10
            } else {
                // Od poziomu 11, zmieniaj wariant co 11 poziomów, zaczynając od variant-1
                // currentLevel - 11: dla 11lvl to 0, dla 22lvl to 11, dla 33lvl to 22
                // (currentLevel - 11) / 11: dla 11lvl to 0, dla 22lvl to 1, dla 33lvl to 2
                // + 1: żeby zacząć od stonks-variant-1, stonks-variant-2, itd.
                stonksVisualVariantIndex = 1 + (Math.floor((currentLevel - 11) / 11) % (totalStonksVariants - 1));
            }
            console.log(`Stonks visual variant set to: stonks-variant-${stonksVisualVariantIndex}`);
            
            if (currentLevel > 1 && (currentLevel % BOSS_LEVEL_INTERVAL !== 1)) { // Tylko tutaj zwiększamy zdrowie normalnego Stonksa (po bossfighcie lub jeśli nie jest to poziom bossa)
                 INITIAL_OZZY_HEALTH += NORMAL_OZZY_HEALTH_INCREMENT;
            }
            updateOzzyAppearance(); // Apply the new Stonks variant

            bossCurrentTransformX = 0; // Reset position for normal Stonks
            ozzyContainer.style.transform = `translate(-50%, -50%)`; 
            cancelAnimationFrame(bossMovementAnimationFrameId); 
            isBossMovementPaused = false; 
            
            const knockoutMsgElement = document.createElement('div');
            knockoutMsgElement.classList.add('knockout-message'); 
            knockoutMsgElement.textContent = 'Stonks rozjebany!'; 
            gameContainer.appendChild(knockoutMsgElement);

            setTimeout(() => {
                knockoutMsgElement.remove();
            }, 2000); 
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
            gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects); // ZMIANA: Upewnij się, że animacja canvasa startuje po nokaucie
            gameEffectsCanvas.classList.remove('hidden'); // ZMIANA: Upewnij się, że canvas jest widoczny
            gameEffectsCanvas.classList.add('active');
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

        // ZMIANA: Logika wyboru wariantu Bossa: zmienia się dla każdego kolejnego bossa
        bossVisualVariantIndex = (bossEncounterCount - 1) % totalBossVariants;
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

        // Activate boss canvas effects
        gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects); // ZMIANA: Upewnij się, że animacja canvasa startuje dla bossa
        gameEffectsCanvas.classList.remove('hidden');
        gameEffectsCanvas.classList.add('active');
        // bossCanvasParticles = []; // ZMIANA: Usunięto - cząsteczki znikają naturalnie
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
                showMessage(`Ulepszono Obrażenia Podstawowe! Nowe obrażenia: ${PUNCH_DAMAGE}`, 3000); 
            } else if (upgradeType === 'lightningDamage') {
                const nextLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage -1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Piorun Zagłady! Poziom: ${upgradeLevels.lightningDamage} (Obrażenia: ~${nextLightningDamage})`, 3000); 
            } else if (upgradeType === 'freezeDamage') {
                const nextInitialFreezeDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
                const nextDotFreezeDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Lodowy Wybuch! Poziom: ${upgradeLevels.freezeDamage} (Obrażenia: ~${nextInitialFreezeDamage}, DOT: ~${nextDotFreezeDamage}/s)`, 3000); 
            } else if (upgradeType === 'frenzyDamage') {
                const nextFrenzyDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
                showMessage(`Ulepszono Szał Bojowy! Poziom: ${upgradeLevels.frenzyDamage} (Obrażenia: ~${nextFrenzyDamage})`, 3000); 
            }

            updateUpgradeShopUI(); 
        } else {
            showMessage("Za mało punktów!", 3000); 
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
        gameEffectsCanvas = document.getElementById('boss-effect-canvas'); // Reusing this canvas for all effects
        gameEffectsCtx = gameEffectsCanvas.getContext('2d'); // Get 2D context

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

        // Set canvas dimensions on load and resize
        const setCanvasDimensions = () => {
            gameEffectsCanvas.width = gameContainer.offsetWidth;
            gameEffectsCanvas.height = gameContainer.offsetHeight;
        };
        setCanvasDimensions();
        window.addEventListener('resize', setCanvasDimensions);


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

            // Stop all canvas effects when going to shop
            cancelAnimationFrame(gameCanvasAnimationFrameId); // ZMIANA: Anuluj animację canvasa
            gameEffectsCanvas.classList.add('hidden'); // ZMIANA: Ukryj canvas
            gameEffectsCanvas.classList.remove('active'); // ZMIANA: Usuń klasę active
            // ZMIANA: Czyszczenie tablic cząsteczek, aby nie wyświetlały się w sklepie
            bossCanvasParticles = [];
            lightningCanvasParticles = [];
            freezeCanvasParticles = [];
            frenzyCanvasParticles = [];
            if (gameEffectsCtx) {
                gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
            }

            // Also hide CSS overlays
            lightningEffect.classList.add('hidden');
            lightningEffect.classList.remove('flash-active');
            freezeEffect.classList.add('hidden');
            freezeEffect.classList.remove('active');
            frenzyEffect.classList.add('hidden');
            frenzyEffect.classList.remove('active');


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
            // ZMIANA: Upewnij się, że animacja canvasa startuje po wyjściu ze sklepu
            gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects);
            gameEffectsCanvas.classList.remove('hidden');
            gameEffectsCanvas.classList.add('active');


            clearInterval(superpowerCooldownIntervalId); 
            superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
            updateSuperpowerButtons(); 

            if (freezeModeActive) { // If freeze mode was active, re-activate CSS overlay and particles
                freezeEffect.classList.remove('hidden');
                freezeEffect.classList.add('active'); 
            }
            if (frenzyModeActive) { // If frenzy mode was active, re-activate CSS overlay
                frenzyEffect.classList.remove('hidden');
                frenzyEffect.classList.add('active');
            }
        });

        buyBaseDamageButton.addEventListener('click', () => buyUpgrade('baseDamage'));
        buyLightningDamageButton.addEventListener('click', () => buyUpgrade('lightningDamage'));
        buyFreezeDamageButton.addEventListener('click', () => buyUpgrade('freezeDamage'));
        buyFrenzyDamageButton.addEventListener('click', () => buyUpgrade('frenzyDamage'));

        updateUpgradeShopUI();
    });
