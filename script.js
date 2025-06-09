import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';


// === Firebase Configuration (Musisz Zastąpić Własnymi Kluczami!) ===
const firebaseConfig = {
    apiKey: "AIzaSyASSmHw3LVUu7lSql0QwGmmBcFkaNeMups", // Your Firebase API Key
    authDomain: "ozzy-14c19.firebaseapp.com",
    projectId: "ozzy-14c19",
    storageBucket: "ozzy-14c19.firebaseapp.com",
    messagingSenderId: "668337469201",
    appId: "1:668337469201:web:cd9d84d45c93d9b6e3feb0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
let gameOverSound; // Now a global DOM variable
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
// ZMIANA: Zmienne DOM dla paska życia gracza (już istnieją, tylko dla jasności)
let playerHealthContainer;
let playerHealthDisplay;
let playerHealthBarBg;
let playerHealthBarFill;

// NOWE: Zmienne DOM dla wyboru skórki
let selectSkinButton;
let skinSelectionScreen;
let selectStonksSkinButton;
let selectTinuSkinButton;
let closeSkinSelectionButton;

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

// ZMIANA: Obrazy domyślne i dla innych skórek
const SKIN_IMAGES = {
    stonks: {
        normal: 'stonks.png',
        boss: 'stonksboss.png'
    },
    tinu: {
        normal: 'tinu.png', // Zastąp to rzeczywistą ścieżką do obrazka Tinu
        boss: 'tinuboss.png' // Zastąp to rzeczywistą ścieżką do obrazka Tinu Boss
    }
};
let currentSkin = 'stonks'; // Domyślna skórka na start gry

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

// NOWE: Zmienne dla życia gracza i ataków Stonksa (z poprzednich zmian)
let playerHealth = 100;
const MAX_PLAYER_HEALTH = 100;

// ZMIANA: Stała dla zwiększenia obrażeń Stonksa PO POKONANIU BOSSA
const STONKS_DAMAGE_INCREMENT_PER_BOSS_CYCLE = 3; 

let baseStonksDamage = 5; // Bazowe obrażenia Stonksa, które rosną po każdym bossie
let STONKS_ATTACK_DAMAGE = baseStonksDamage; // Aktualne obrażenia zadawane przez Stonksa (może być modyfikowane przez bossa)

const STONKS_ATTACK_INTERVAL_MS = 2000; // Co ile ms Stonks atakuje gracza
let playerAttackIntervalId; // Id interwału dla ataku Stonksa

// === Canvas Particles System ===
class CanvasParticle {
    constructor(x, y, vx, vy, color, size, life, type, angle = 0, image = null, targetX = null, targetY = null) { // Added image parameter, and targetX/Y for lightning
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life; // Total life in milliseconds
        this.currentLifeTime = 0; // Current elapsed time in milliseconds
        this.alpha = 1;
        this.type = type; 
        this.angle = angle; // For rotation of some shapes
        this.startSize = size; // Store initial size for scaling
        this.image = image; // Store image for drawing (if type requires it)
        this.targetX = targetX; // For lightning lines
        this.targetY = targetY; // For lightning lines
    }

    update(deltaTime) { // Przyjmujemy deltaTime
        // Move particle based on velocity and deltaTime, normalized to 60 FPS base
        const baseFps = 1000 / 60; // Approximate milliseconds per frame at 60 FPS
        const dtRatio = deltaTime / baseFps;

        this.x += this.vx * dtRatio;
        this.y += this.vy * dtRatio;
        
        this.currentLifeTime += deltaTime; // Zwiększamy upłyniony czas

        // Calculate alpha based on elapsed time vs total life time
        this.alpha = 1 - (this.currentLifeTime / this.life); // Linear fade out

        // Type-specific physics
        if (this.type === 'iceShard') {
            this.vy -= 0.05 * dtRatio; // Float upwards, scaled by deltaTime
        } else if (this.type === 'frenzyPulse') {
            this.size = this.startSize * (1 + 0.02 * (this.currentLifeTime / this.life)); // Grow slightly, scaled by deltaTime
            this.alpha -= 0.05 * dtRatio; // Fade faster for quick pulse, scaled by deltaTime
        } else if (this.type === 'lightningLine') {
            // Lightning lines are static after creation, they just fade
        } else if (this.type === 'scratch') {
            this.alpha -= 0.02 * dtRatio; // Fade out slowly, scaled by deltaTime
            this.vx *= (1 - 0.02 * dtRatio); // Slow down, scaled by deltaTime
            this.vy *= (1 - 0.02 * dtRatio); // Slow down, scaled by deltaTime
        } else if (this.type === 'stonksClaw') {
            this.alpha -= 0.005 * dtRatio; // Szybkie zanikanie, skalowane
            this.size = this.startSize * (1 - 0.002 * (this.currentLifeTime / this.life)); // Lekkie zmniejszenie rozmiaru, skalowane
        } else if (this.type === 'painParticle') {
            this.vy += 0.02 * dtRatio; // Grawitacja, skalowana
            this.alpha -= 0.008 * dtRatio; // Szybkie zanikanie, skalowane
            this.size = this.startSize * (1 - 0.001 * (this.currentLifeTime / this.life)); // Zmniejszaj rozmiar, skalowane
        } else if (this.type === 'clawMark') { 
            this.alpha = 1 - (this.currentLifeTime / this.life); // Fade out
            // No movement, static mark
        } else if (this.type === 'frenzyFlame') { // Nowy typ dla Szału Bojowego
            this.vy += 0.05 * dtRatio; // Lekka grawitacja, aby płomienie opadały
            this.vx *= (1 - 0.01 * dtRatio); // Nieznaczne spowolnienie
            this.size = this.startSize * (1 - (this.currentLifeTime / this.life) * 0.5); // Zmniejszaj rozmiar o 50%
        } else if (this.type === 'bossFire') { // Ulepszona dynamika ognia bossa
            this.vy -= 0.1 * dtRatio; // Unosi się szybciej
            this.vx *= (1 - 0.03 * dtRatio); // Mocniejsze spowolnienie boczne
            this.size = this.startSize * (0.8 + 0.5 * (this.currentLifeTime / this.life)); // Rozszerza się
            this.alpha = 1 - Math.pow(this.currentLifeTime / this.life, 2); // Szybkie zanikanie
        } else if (this.type === 'bossIce') { // Ulepszona dynamika lodu bossa
            this.vy += 0.02 * dtRatio; // Lekka grawitacja
            this.vx *= (1 - 0.01 * dtRatio); // Lekkie spowolnienie
            this.angle += 0.1 * dtRatio; // Powolna rotacja
            this.size = this.startSize * (1 - (this.currentLifeTime / this.life) * 0.7); // Zmniejsza się
        } else if (this.type === 'bossElectricity') { // Ulepszona dynamika elektryczności bossa
             // Bardzo krótkie życie i brak znaczącego ruchu po spawnie
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        if (this.type.startsWith('boss') || this.type === 'lightningSpark') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.type === 'bossElectricity') { // Specjalne rysowanie dla elektryczności
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 4); // Cienkie, ostre prostokąty
            } else if (this.type === 'lightningSpark') {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'bossFire') { // Rysowanie dla ognia
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.moveTo(0, -this.size);
                ctx.quadraticCurveTo(this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
                ctx.quadraticCurveTo(0, this.size / 4, -this.size / 2, this.size / 2);
                ctx.quadraticCurveTo(-this.size / 2, -this.size / 2, 0, -this.size);
                ctx.fill();
            } else if (this.type === 'bossIce') { // Rysowanie dla lodu
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size / 2, this.size / 2);
                ctx.lineTo(-this.size / 2, this.size / 2);
                ctx.closePath();
                ctx.fill();
            }
        } else if (this.type === 'lightningLine') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetX, this.targetY); // Correctly uses targetX/Y for lines
            ctx.stroke();
        } else if (this.type === 'iceShard') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size / 2, this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'frenzyPulse') { // Poprzedni efekt, dla bezpieczeństwa zostawiam
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'frenzyFlame') { // Rysowanie dla Szału Bojowego (płomienie)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Można dodać bardziej złożony kształt płomienia, na razie to jest prosty okrąg
        }
        else if (this.type === 'scratch') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.cos(this.angle) * this.size * 8, this.y + Math.sin(this.angle) * this.size * 8);
            ctx.stroke();
        } else if (this.type === 'stonksClaw') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * 0.4; // Zmniejszona grubość głównej linii (40% size)
            
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Rysowanie poszarpanego pazura - główne cięcie z nieregularnymi krawędziami
            ctx.beginPath();
            // Górna krawędź
            ctx.moveTo(-this.size * 2, 0);
            ctx.lineTo(-this.size * 1.5 + Math.random() * this.size * 0.5, -this.size * 0.3);
            ctx.lineTo(-this.size * 1 + Math.random() * this.size * 0.5, this.size * 0.1);
            ctx.lineTo(-this.size * 0.5 + Math.random() * this.size * 0.5, -this.size * 0.2);
            ctx.lineTo(0 + Math.random() * this.size * 0.5, this.size * 0.3);
            ctx.lineTo(this.size * 0.5 + Math.random() * this.size * 0.5, -this.size * 0.1);
            ctx.lineTo(this.size * 1 + Math.random() * this.size * 0.5, this.size * 0.2);
            ctx.lineTo(this.size * 1.5 + Math.random() * this.size * 0.5, -this.size * 0.3);
            ctx.lineTo(this.size * 2, 0);

            ctx.stroke();

            // Dodaj delikatny cień, aby nadać głębię
            ctx.globalAlpha = Math.max(0, this.alpha * 0.3); // Mniej widoczny cień
            ctx.lineWidth = this.size * 0.2; // Cień jest cieńszy
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Ciemny kolor cienia
            ctx.stroke(); // Rysuj cień
            ctx.globalAlpha = Math.max(0, this.alpha); // Przywróć pełną alfa dla głównego kształtu
            
        } else if (this.type === 'painParticle') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Draw a more irregular, spiky shape for pain particles
            ctx.moveTo(0, -this.size * 0.8); // Top point
            ctx.lineTo(this.size * (0.8 + Math.random() * 0.2), this.size * (0.5 + Math.random() * 0.2)); // Right-bottom
            ctx.lineTo(-this.size * (0.8 + Math.random() * 0.2), this.size * (0.5 + Math.random() * 0.2)); // Left-bottom
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'clawMark' && this.image) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle); // Rotate the image

            // Draw the image centered around its origin (which is at x,y after translate)
            // Adjust to draw from top-left corner
            ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size * (this.image.naturalHeight / this.image.naturalWidth)); // Maintain aspect ratio
        }

        ctx.restore();
    }

    isDead() {
        return this.currentLifeTime >= this.life || this.alpha <= 0; // Sprawdzamy na podstawie czasu
    }
}


// Global arrays for different types of canvas particles
let bossCanvasParticles = [];
let lightningCanvasParticles = [];
let freezeCanvasParticles = [];
let frenzyCanvasParticles = [];
let scratchCanvasParticles = [];
// NOWE: Tablice na cząsteczki ataku Stonksa
let stonksAttackClawParticles = [];
let stonksAttackPainParticles = [];
let clawMarks = []; // Nowa tablica na efekty pazurów
let clawImage = new Image(); // Create a new Image object for the claw


const MAX_CANVAS_PARTICLES = 200; // General limit for performance
let lightningModeActive = false; // New state variable for lightning storm

let gameCanvasAnimationFrameId;
let lastFrameTime = 0; // Dodajemy zmienną do śledzenia czasu ostatniej klatki

function animateGameCanvasEffects(currentTime) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const deltaTime = currentTime - lastFrameTime; // Czas w milisekundach od ostatniej klatki
    lastFrameTime = currentTime;

    // Resize canvas to match gameContainer (do this first for correct drawing)
    gameEffectsCanvas.width = gameContainer.offsetWidth;
    gameEffectsCanvas.height = gameContainer.offsetHeight;
    gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);

    // Calculate Ozzy's center relative to the canvas
    const ozzyRect = ozzyContainer.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    const ozzyCanvasX = ozzyRect.left - gameRect.left + ozzyRect.width / 2;
    const ozzyCanvasY = ozzyRect.top - gameRect.top + ozzyRect.height / 2;

    // Common multipliers for particle spawn area and speed
    const spawnAreaMultiplier = isBossFight ? 1.5 : 1.2; // Larger area for boss
    const baseParticleSpeed = 5; // Base speed for particles (increased from 1 to make them more visible/faster at base)
    
    // Boss particles (spawn only if boss fight is active)
    if (isBossFight) {
        gameEffectsCanvas.classList.remove('hidden'); // Ensure canvas is visible for boss effects
        gameEffectsCanvas.classList.add('active'); // Add active class for transition
        // ZMIANA: Bardziej dynamiczne cząsteczki bossa
        if (bossCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.6) { // Zwiększona szansa na spawn
            let color, type, size, life, vx, vy;
            const spawnRadius = Math.min(ozzyRect.width, ozzyRect.height) * 0.8; // Większy promień spawnu wokół bossa
            const angle = Math.random() * Math.PI * 2;
            const spawnDistance = Math.random() * spawnRadius;

            const startX = ozzyCanvasX + Math.cos(angle) * spawnDistance;
            const startY = ozzyCanvasY + Math.sin(angle) * spawnDistance;

            if (bossVisualVariantIndex === 0) { // Red/fiery boss
                color = `rgba(255, ${Math.floor(Math.random() * 100)}, 0, ${0.7 + Math.random() * 0.3})`;
                type = 'bossFire';
                size = Math.random() * 15 + 10; // Większe płomienie
                life = 1000 + Math.random() * 500; // Dłuższe życie
                vx = (Math.random() - 0.5) * (baseParticleSpeed * 0.3); // Wolniejsze ruchy boczne
                vy = -(Math.random() * baseParticleSpeed * 0.5) - 0.5; // Unosi się do góry
            } else if (bossVisualVariantIndex === 1) { // Blue/glitchy boss (Ice)
                color = `rgba(${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 200}, 255, ${0.7 + Math.random() * 0.3})`;
                type = 'bossIce';
                size = Math.random() * 10 + 5; // Rozmiar odłamków
                life = 800 + Math.random() * 400;
                vx = (Math.random() - 0.5) * (baseParticleSpeed * 0.8); // Szybkie rozproszenie
                vy = (Math.random() - 0.5) * (baseParticleSpeed * 0.8);
            } else { // Purple/intense boss (Electricity)
                color = `rgba(${Math.floor(Math.random() * 50) + 200}, 0, ${Math.floor(Math.random() * 50) + 200}, ${0.8 + Math.random() * 0.2})`;
                type = 'bossElectricity';
                size = Math.random() * 20 + 10; // Długość iskry
                life = 200 + Math.random() * 100; // Bardzo krótkie życie
                vx = 0; // Brak ruchu
                vy = 0;
            }
            bossCanvasParticles.push(new CanvasParticle(startX, startY, vx, vy, color, size, life, type, Math.random() * Math.PI * 2));
        }
    }
    // Update and draw boss particles (and remove dead ones)
    for (let i = bossCanvasParticles.length - 1; i >= 0; i--) {
        bossCanvasParticles[i].update(deltaTime); // Przekazujemy deltaTime
        if (bossCanvasParticles[i].isDead()) {
            bossCanvasParticles.splice(i, 1);
        } else {
            bossCanvasParticles[i].draw(gameEffectsCtx);
        }
    }

    // Lightning particles (spawn only if lightning mode is active)
    if (lightningModeActive) {
        gameEffectsCanvas.classList.remove('hidden');
        gameEffectsCanvas.classList.add('active');
        lightningEffect.classList.remove('hidden'); // Ensure the overlay is visible
        lightningEffect.classList.add('flash-active'); // Add active class for transition

        // NOWE: Generowanie segmentów błyskawic w pętli animacji
        const lightningSpawnChance = 0.2; // Szansa na wygenerowanie nowej błyskawicy w każdej klatce (zwiększona)
        if (lightningCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < lightningSpawnChance) {
            const boltLength = Math.random() * 100 + 100; // Długość głównego segmentu błyskawicy
            const boltWidth = Math.random() * 5 + 5; // Grubość błyskawicy
            const boltLife = 800 + Math.random() * 700; // Życie błyskawicy (0.8 - 1.5s)

            // Losowy punkt startowy dla błyskawicy (na górze ekranu)
            const startX = Math.random() * gameEffectsCanvas.width;
            const startY = Math.random() * gameEffectsCanvas.height * 0.3; // Górne 30% ekranu

            // Random angle, mostly downwards
            const angle = Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4); // Between 45 and 135 degrees (mostly downwards)

            let currentBoltX = startX;
            let currentBoltY = startY;

            // Generate main segments of the bolt
            for (let i = 0; i < 3; i++) { // 3-4 segments per bolt for branching effect
                const nextX = currentBoltX + Math.cos(angle + (Math.random() - 0.5) * 0.3) * (boltLength / 3 + Math.random() * 20);
                const nextY = currentBoltY + Math.sin(angle + (Math.random() - 0.5) * 0.3) * (boltLength / 3 + Math.random() * 20);

                lightningCanvasParticles.push(new CanvasParticle(
                    currentBoltX, currentBoltY, 0, 0,
                    `rgba(255, 255, ${Math.floor(Math.random() * 100) + 180}, ${0.8 + Math.random() * 0.2})`, // Jaśniejszy, bardziej biało-żółty
                    boltWidth, boltLife, 'lightningLine', 0, nextX, nextY
                ));
                currentBoltX = nextX;
                currentBoltY = nextY;

                // Add small branches
                if (Math.random() < 0.5) { // 50% chance to branch
                    const branchLength = boltLength * (0.3 + Math.random() * 0.3); // 30-60% of main length
                    const branchAngle = angle + (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 4 + Math.random() * (Math.PI / 8)); // 45-67.5 degrees off main
                    const branchX = currentBoltX + Math.cos(branchAngle) * branchLength;
                    const branchY = currentBoltY + Math.sin(branchAngle) * branchLength;

                    lightningCanvasParticles.push(new CanvasParticle(
                        currentBoltX, currentBoltY, 0, 0,
                        `rgba(255, 255, ${Math.floor(Math.random() * 100) + 180}, ${0.6 + Math.random() * 0.2})`,
                        boltWidth * 0.6, boltLife * 0.8, 'lightningLine', 0, branchX, branchY
                    ));
                }
            }

            // Add some bright "sparks" at the end of the main bolt
            for (let j = 0; j < Math.random() * 5 + 3; j++) { // 3-7 sparks per bolt
                lightningCanvasParticles.push(new CanvasParticle(
                    currentBoltX + (Math.random() - 0.5) * 20,
                    currentBoltY + (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // Wolniejsze iskry
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5),
                    `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`, // Białe iskry
                    Math.random() * 6 + 2, // size (2-8)
                    600, // life in ms (0.6 seconds)
                    'lightningSpark' 
                ));
            }
        }
    } else if (!lightningModeActive && lightningEffect.classList.contains('flash-active')) {
        // If lightning mode just ended, remove the flash effect
        lightningEffect.classList.remove('flash-active');
        lightningEffect.classList.add('hidden'); // Hide it
    }

    for (let i = lightningCanvasParticles.length - 1; i >= 0; i--) {
        lightningCanvasParticles[i].update(deltaTime); // Przekazujemy deltaTime
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
                (Math.random() - 0.5) * (baseParticleSpeed * 0.25), // ZMIANA: Zmniejszona prędkość o 75%, ale bazowo większa
                (Math.random() - 0.5) * (baseParticleSpeed * 0.25), // ZMIANA: Zmniejszona prędkość o 75%, ale bazowo większa
                `rgba(173, 216, 230, ${0.7 + Math.random() * 0.3})`, // Vary alpha
                Math.random() * 15 + 8, // size (większy)
                1200, // life in ms (1.2 seconds)
                'iceShard',
                Math.random() * 360 // random angle
            ));
        }
    }
    for (let i = freezeCanvasParticles.length - 1; i >= 0; i--) {
        freezeCanvasParticles[i].update(deltaTime); // Przekazujemy deltaTime
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
        if (frenzyCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.8) { // Zwiększona częstotliwość dla szału
            const initialParticleX = ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 0.8; // Start bliżej ozzy'ego
            const initialParticleY = ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * 0.8;

            const speed = (Math.random() * 3 + 2); // Szybsze cząsteczki (2-5)
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            frenzyCanvasParticles.push(new CanvasParticle(
                initialParticleX, initialParticleY, vx, vy, 
                `rgba(255, ${Math.floor(Math.random() * 80)}, 0, ${0.9 + Math.random() * 0.1})`, // Intensywny czerwono-pomarańczowy
                Math.random() * 8 + 4, // Rozmiar cząsteczek (4-12)
                500 + Math.random() * 300, // Krótkie życie (0.5-0.8s)
                'frenzyFlame' // Nowy typ
            ));
        }
    }
    for (let i = frenzyCanvasParticles.length - 1; i >= 0; i--) {
        frenzyCanvasParticles[i].update(deltaTime); // Przekazujemy deltaTime
        if (frenzyCanvasParticles[i].isDead()) {
            frenzyCanvasParticles.splice(i, 1);
        } else {
            frenzyCanvasParticles[i].draw(gameEffectsCtx);
        }
    }

    // Update and draw scratch particles
    for (let i = scratchCanvasParticles.length - 1; i >= 0; i--) {
        scratchCanvasParticles[i].update(deltaTime); // Przekazujemy deltaTime
        if (scratchCanvasParticles[i].isDead()) {
            scratchCanvasParticles.splice(i, 1);
        } else {
            scratchCanvasParticles[i].draw(gameEffectsCtx);
        }
    }

    // NOWE: Update and draw Stonks attack particles
    for (let i = stonksAttackClawParticles.length - 1; i >= 0; i--) {
        stonksAttackClawParticles[i].update(deltaTime); // Przekazujemy deltaTime
        if (stonksAttackClawParticles[i].isDead()) {
            stonksAttackClawParticles.splice(i, 1);
        } else {
            stonksAttackClawParticles[i].draw(gameEffectsCtx);
        }
    }

    for (let i = stonksAttackPainParticles.length - 1; i >= 0; i--) {
        stonksAttackPainParticles[i].update(deltaTime); // Przekazujemy deltaTime
        if (stonksAttackPainParticles[i].isDead()) {
            stonksAttackPainParticles.splice(i, 1);
        } else {
            stonksAttackPainParticles[i].draw(gameEffectsCtx);
        }
    }

    // NOWE: Update and draw Claw Marks
    for (let i = clawMarks.length - 1; i >= 0; i--) {
        clawMarks[i].update(deltaTime);
        if (clawMarks[i].isDead()) {
            clawMarks.splice(i, 1);
        } else {
            clawMarks[i].draw(gameEffectsCtx);
        }
    }


    // Determine if there are *any* active particles or if game is active to keep canvas visible
    const anyParticlesActive = bossCanvasParticles.length > 0 ||
                               lightningCanvasParticles.length > 0 ||
                               freezeCanvasParticles.length > 0 ||
                               frenzyCanvasParticles.length > 0 ||
                               scratchCanvasParticles.length > 0 ||
                               stonksAttackClawParticles.length > 0 || // NOWE
                               stonksAttackPainParticles.length > 0 ||  // NOWE
                               clawMarks.length > 0; // NOWE

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

/**
 * NOWE: Funkcja rysująca efekt zadrapania na ekranie
 * @param {CanvasRenderingContext2D} ctx Kontekst canvasu
 * @param {number} x Pozycja X środka zadrapania
 * @param {number} y Pozycja Y środka zadrapania
 * @param {number} count Liczba pojedynczych linii zadrapania
 * @param {string} color Kolor zadrapania (np. 'rgba(255, 0, 0, 0.7)')
 * @param {number} baseSize Bazowy rozmiar linii zadrapania
 */
function drawScratchEffect(x, y, count, color, baseSize) {
    for (let i = 0; i < count; i++) {
        // Losowy offset dla każdej linii zadrapania
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 50;
        // Losowy kąt dla każdej linii, aby wyglądały na bardziej naturalne zadrapania
        const angle = Math.random() * Math.PI * 2; // Kąt w radianach
        // Losowy rozmiar dla każdej linii
        const size = baseSize + (Math.random() * baseSize / 2);
        // Życie cząsteczki zadrapania w ms (1 sekunda)
        const life = 1000; 

        scratchCanvasParticles.push(new CanvasParticle(
            x + offsetX, y + offsetY, 0, 0, color, size, life, 'scratch', angle
        ));
    }
}

/**
 * NOWE: Funkcja do tworzenia dynamicznych efektów ataku Stonksa (szpony, rozprysk bólu)
 * @param {number} ozzyX Pozycja X Stonksa na canvasie (środek)
 * @param {number} ozzyY Pozycja Y Stonksa na canvasie (środek)
 */
function spawnStonksAttackEffects(ozzyX, ozzyY) {
    const gameContainerRect = gameContainer.getBoundingClientRect(); 
    const gameContainerWidth = gameContainerRect.width;
    const gameContainerHeight = gameContainerRect.height;

    // Losowanie punktu startowego dla ataku pazurami na większym obszarze ekranu
    // Upewniamy się, że pazury nie wychodzą całkowicie poza ekran
    const spawnAreaX = gameContainerWidth * 0.8; // 80% szerokości ekranu
    const spawnAreaY = gameContainerHeight * 0.8; // 80% wysokości ekranu
    
    // Punkt uderzenia ataku (środek zestawu pazurów)
    const attackHitX = (gameContainerWidth / 2) + (Math.random() - 0.5) * spawnAreaX;
    const attackHitY = (gameContainerHeight / 2) + (Math.random() - 0.5) * spawnAreaY;

    // --- Efekty pazurów (clawMarks) ---
    const numClawImages = 1; // Tylko jeden obraz pazura na atak
    // Rozmiar pazura dostosowany do rozmiaru ekranu, aby był czytelny
    const clawImageSize = Math.min(gameContainerWidth * 0.3, gameContainerHeight * 0.3, 200); // Max 200px, responsive to screen
    const clawLife = 1000; // Życie obrazka pazura w ms (1 sekunda)

    for (let s = 0; s < numClawImages; s++) {
        // Kąt obrotu obrazka pazura
        const angle = Math.random() * Math.PI * 2; 

        clawMarks.push(new CanvasParticle(
            attackHitX, attackHitY, 0, 0, null, // No color needed for image, no velocity
            clawImageSize, clawLife, 'clawMark', angle, clawImage // Pass the loaded image
        ));
    }

    // --- Punkty bólu (Pain Particles) ---
    const numPainParticles = Math.floor(Math.random() * 15) + 15; // 15-29 punktów
    const painParticleLife = 1200; // Życie w ms (1.2 sekundy)
    const painParticleSize = Math.random() * 8 + 8; // Rozmiary (8-16, nieco większe)
    const painParticleBaseSpeed = 1.2; // Zwiększona prędkość bazowa

    // Punkty bólu są skupione wokół attackHitX, attackHitY
    const painSpawnRadius = clawImageSize * 0.5; // Promień wokół miejsca uderzenia pazura

    for (let i = 0; i < numPainParticles; i++) {
        const angle = Math.random() * Math.PI * 2; 
        const distance = Math.random() * painSpawnRadius;

        const startX = attackHitX + Math.cos(angle) * distance; 
        const startY = attackHitY + Math.sin(angle) * distance;
        
        const vx = (Math.random() - 0.5) * painParticleBaseSpeed * 2; 
        const vy = (Math.random() - 0.5) * painParticleBaseSpeed * 2 - 0.5; 

        const color = `rgba(255, ${Math.floor(Math.random() * 100)}, 0, ${0.7 + Math.random() * 0.3})`; 
        
        stonksAttackPainParticles.push(new CanvasParticle(
            startX, startY, vx, vy, color, painParticleSize, painParticleLife, 'painParticle', angle
        ));
    }
}


// --- Leaderboard Functions ---
async function saveScoreToLeaderboard(nickname, score) {
    console.log("saveScoreToLeaderboard called with nickname:", nickname, "score:", score);

    // Klienckie zabezpieczenie przed nierealistycznymi wynikami.
    // Pamiętaj, że to zabezpieczenie jest podatne na modyfikację przez gracza.
    const CLIENT_SIDE_MAX_SCORE = 200; 
    if (score > CLIENT_SIDE_MAX_SCORE) {
        showMessage("Spierdalaj frajerze cheaterze! Wynik nierealny!", 3000);
        console.warn(`Attempt to save unrealistic score (${score}) by ${nickname}. Blocked client-side.`);
        setTimeout(resetGame, 3000); // Resetujemy grę po próbie oszustwa
        return;
    }

    // Upewniamy się, że użytkownik jest uwierzytelniony i wynik jest dodatni.
    if (score > 0 && currentUserId) {
        try {
            // BEZPOŚREDNI ZAPIS DO FIRESTORE
            // Używamy funkcji addDoc z Firestore SDK, aby dodać nowy dokument
            // do kolekcji 'leaderboard'. Firestore automatycznie wygeneruje ID dla dokumentu.
            await addDoc(collection(db, "leaderboard"), {
                nickname: nickname,
                score: score,
                // Używamy serverTimestamp() do uzyskania znacznika czasu z serwera Firestore,
                // co pomaga w sortowaniu i zapobiega manipulacji czasem przez klienta.
                timestamp: serverTimestamp(), 
                userId: currentUserId // Zapisujemy ID anonimowego użytkownika, jeśli zajdzie potrzeba (np. do odfiltrowania wyników danego gracza)
            });

            showMessage("Wynik zapisany pomyślnie!", 2000);
            console.log(`Wynik (${score}) przesłany przez ${nickname} (${currentUserId}) i zapisany.`);

        } catch (error) {
            console.error("Error saving score directly to Firestore:", error);
            showMessage(`Błąd zapisu wyniku: ${error.message}`, 3000);
        }
    } else if (!currentUserId) {
        console.warn("Cannot save score: User is not authenticated.");
        showMessage("Błąd: Brak uwierzytelnień do zapisu wyniku. Spróbuj odświeżyć.", 3000);
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

// NOWE: Funkcja Stonksa do ataku gracza
function stonksAttack() {
    if (!isGameActive) {
        clearInterval(playerAttackIntervalId); // Stop attacking if game is inactive
        return;
    }

    // 1. Efekt wizualny na postaci Stonksa
    // Użyjemy klasy CSS do szybkiego zastosowania filtra (np. invert lub brightness)
    ozzyImage.classList.add('attacking'); // Klasa do animacji ruchu (już jest)
    ozzyImage.classList.add('stonks-attack-effect'); // NOWA klasa dla efektu wizualnego

    // Usuń klasę efektu wizualnego po krótkim czasie
    setTimeout(() => {
        ozzyImage.classList.remove('stonks-attack-effect');
    }, 200); // Krótki błysk/efekt trwający 200ms

    // Apply visual attack animation to Stonks (już jest)
    setTimeout(() => {
        ozzyImage.classList.remove('attacking');
    }, 800); // Duration of the attack animation

    // ZMIANA: Dodanie wstrząsu ekranu (już jest)
    gameContainer.classList.add('screen-shake');
    setTimeout(() => {
        gameContainer.classList.remove('screen-shake');
    }, 400); // Czas trwania wstrząsu, dopasowany do animacji CSS

    // Apply damage to player (już jest)
    playerHealth -= STONKS_ATTACK_DAMAGE;
    playerHealth = Math.max(0, playerHealth); // Ensure health doesn't go below zero
    updatePlayerHealthUI();

    // Wywołanie NOWEGO efektu ataku Stonksa na canvasie (zmienione)
    const ozzyRect = ozzyContainer.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    const ozzyCanvasX = ozzyRect.left - gameRect.left + ozzyRect.width / 2;
    const ozzyCanvasY = ozzyRect.top - gameRect.top + ozzyRect.height / 2;
    
    // Używamy nowej funkcji do generowania ulepszonych efektów
    spawnStonksAttackEffects(ozzyCanvasX, ozzyCanvasY); // Pass Ozzy's position for reference

    if (playerHealth <= 0) {
        endGame("ZGINĄŁEŚ W WALCE ZE STONKSEM!"); // Game over if player health reaches 0
    }
}

// NOWE: Funkcja do aktualizacji UI paska życia gracza (z poprzednich zmian)
function updatePlayerHealthUI() {
    playerHealthDisplay.textContent = `${playerHealth}/${MAX_PLAYER_HEALTH}`;
    const healthPercentage = (playerHealth / MAX_PLAYER_HEALTH) * 100;
    playerHealthBarFill.style.width = `${healthPercentage}%`;

    // Zmiana koloru paska zdrowia gracza
    if (healthPercentage > 60) {
        playerHealthBarFill.style.backgroundColor = '#00BFFF'; // Niebieski
    } else if (healthPercentage > 30) {
        playerHealthBarFill.style.backgroundColor = '#FFD700'; // Złoty/Żółty
    } else {
        playerHealthBarFill.style.backgroundColor = '#FF0000'; // Czerwony
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

    lightningEffect.classList.remove('hidden'); // Show the overlay for general flash
    lightningEffect.classList.add('flash-active'); // Add class for animation

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
    // ZMIANA: Używamy ścieżki obrazu z zależności od wybranej skórki
    ozzyImage.src = SKIN_IMAGES[currentSkin].normal;
    ozzyImage.classList.remove('boss-mode');
    ozzyImage.classList.remove('flipped-x'); 
    ozzyImage.classList.remove('attacking'); // NOWE: Usuń klasę ataku
    ozzyImage.classList.remove('stonks-attack-effect'); // NOWE: Usuń klasę efektu ataku Stonksa
    gameContainer.classList.remove('screen-shake'); // NOWE: Usuń klasę wstrząsu

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
    scratchCanvasParticles = [];
    stonksAttackClawParticles = []; // NOWE
    stonksAttackPainParticles = [];   // NOWE
    clawMarks = []; // NOWE: Wyczyść ślady pazurów
    if (gameEffectsCtx) {
        gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
    }

    document.querySelectorAll('.knockout-message').forEach(el => el.remove());
    document.querySelectorAll('.boss-message').forEach(el => el.remove());

    // ZMIANA: Zresetuj życie gracza i ukryj pasek
    playerHealth = MAX_PLAYER_HEALTH;
    updatePlayerHealthUI();
    playerHealthContainer.classList.add('hidden');
    clearInterval(playerAttackIntervalId); // Zatrzymaj atak Stonksa

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
    if (gameOverSound) { // NOWE: Zatrzymaj dźwięk game over (jeśli jest)
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }
    baseStonksDamage = 5; // Resetuj bazowe obrażenia Stonksa do wartości początkowej
    STONKS_ATTACK_DAMAGE = baseStonksDamage; // Ustaw aktualne obrażenia na bazowe
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

    // ZMIANA: Ustaw życie gracza, pokaż pasek i rozpocznij atak Stonksa
    playerHealth = MAX_PLAYER_HEALTH;
    updatePlayerHealthUI();
    playerHealthContainer.classList.remove('hidden');
    clearInterval(playerAttackIntervalId); // Clear any previous interval first
    STONKS_ATTACK_DAMAGE = baseStonksDamage; // Ustaw aktualne obrażenia na bazowe dla poziomu 1
    playerAttackIntervalId = setInterval(stonksAttack, STONKS_ATTACK_INTERVAL_MS); // Stonks zaczyna atakować

    if (backgroundMusic) {
        backgroundMusic.play().catch(e => console.error("Error playing backgroundMusic:", e));
    }
}

function endGame(message) {
    console.log("endGame called with message:", message);
    isGameActive = false;
    ozzyContainer.classList.add('hidden'); 
    
    gameInfoContainer.classList.add('hidden');
    playerHealthContainer.classList.add('hidden'); // NOWE: Ukryj pasek życia gracza
    
    quoteImagesContainer.innerHTML = ''; 
    document.querySelectorAll('.knockout-message').forEach(el => el.remove());
    document.querySelectorAll('.boss-message').forEach(el => el.remove());

    gameContainer.classList.remove('screen-shake'); // NOWE: Usuń klasę wstrząsu

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
    clearInterval(playerAttackIntervalId); // NOWE: Zatrzymaj atak Stonksa
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
    scratchCanvasParticles = [];
    stonksAttackClawParticles = []; // NOWE
    stonksAttackPainParticles = [];   // NOWE
    clawMarks = []; // NOWE: Wyczyść ślady pazurów
    if (gameEffectsCtx) {
        gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
    }

    document.getElementById('end-message').textContent = message; // Komunikat o zakończeniu gry
    document.getElementById('final-score').textContent = score; 

    saveScoreToLeaderboard(playerNickname, score);

    endScreen.classList.remove('hidden');

    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    if (gameOverSound) { // NOWE: Odtwórz dźwięk game over
        gameOverSound.play().catch(e => console.error("Error playing gameOverSound:", e));
    }
}

function handleOzzyKnockout() {
    score++; // Increment score for every knockout
    scoreDisplay.textContent = score;

    document.querySelectorAll('.knockout-message').forEach(el => el.remove());
    document.querySelectorAll('.boss-message').forEach(el => el.remove());

    ozzyContainer.classList.add('hidden');

    // NOWE: Regeneracja życia gracza po pokonaniu Stonksa - PRZYWRÓCONO DO 100%
    playerHealth = MAX_PLAYER_HEALTH; // Ustaw życie gracza na maksymalne
    updatePlayerHealthUI();

    // Determine if the *next* level is a boss level
    const nextLevelCandidate = currentLevel + 1; // Temporary variable to check for boss
    
    if (nextLevelCandidate > 0 && nextLevelCandidate % BOSS_LEVEL_INTERVAL === 0) {
        // It's time for a boss fight
        currentLevel = nextLevelCandidate; // Set currentLevel to the boss level (e.g., 10, 20)
        currentLevelDisplay.textContent = currentLevel; // Update display
        isBossFight = true; // Set boss flag 
        
        // ZWIĘKSZ BAZOWE OBRAŻENIA STONKSA PO POKONANIU POPRZEDNIEGO BOSSA
        baseStonksDamage += STONKS_DAMAGE_INCREMENT_PER_BOSS_CYCLE;
        console.log(`Bazowe obrażenia Stonksa zwiększone do ${baseStonksDamage} po cyklu bossa.`);

        startBossFight(); // Ta funkcja ustawi obrażenia dla bossa
        
        clearInterval(playerAttackIntervalId); // Zatrzymaj obecny interwał
        playerAttackIntervalId = setInterval(stonksAttack, STONKS_ATTACK_INTERVAL_MS); // Restartuj z nowymi obrażeniami
    } else {
        // Normal Stonks knockout
        currentLevel = nextLevelCandidate; // Increment level for normal stonks
        currentLevelDisplay.textContent = currentLevel; // Update display
        console.log(`Normalny nokaut Stonksa. Nowy poziom: ${currentLevel}`);

        isBossFight = false;
        // ZMIANA: Używamy ścieżki obrazu z zależności od wybranej skórki
        ozzyImage.src = SKIN_IMAGES[currentSkin].normal; 
        ozzyImage.classList.remove('boss-mode'); 
        ozzyImage.classList.remove('flipped-x'); 
        
        // ZMIANA: Logika wyboru wariantu Stonksa: zmienia się co 10 poziomów od levelu 11
        if (currentLevel >= 1 && currentLevel <= 10) {
            stonksVisualVariantIndex = 0; // Wariant 0 dla poziomów 1-10
        } else {
            // Dla poziomów 11 i wyżej, zmieniaj wariant co 10 poziomów, zapętlając się przez 0-9
            stonksVisualVariantIndex = Math.floor((currentLevel - 1) / BOSS_LEVEL_INTERVAL) % totalStonksVariants;
        }
        console.log(`Wariant wizualny Stonksa ustawiony na: stonks-variant-${stonksVisualVariantIndex} dla poziomu ${currentLevel}`);
        
        // ZMIANA: Obliczanie zdrowia normalnego Stonksa na podstawie liczby pokonanych bossów
        // To zapewni, że zdrowie będzie skalować się co 10 poziomów, po każdej walce z bossem.
        // bossCyclesCompletedForNormalStonks: 0 dla poziomów 1-10, 1 dla 11-20, 2 dla 21-30 itd.
        const bossCyclesCompletedForNormalStonks = Math.floor((currentLevel - 1) / BOSS_LEVEL_INTERVAL); 
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH + (bossCyclesCompletedForNormalStonks * NORMAL_OZZY_HEALTH_INCREMENT);
        console.log(`HP normalnego Stonksa ustawione na: ${INITIAL_OZZY_HEALTH} (na podstawie ${bossCyclesCompletedForNormalStonks} ukończonych cykli bossów)`);

        updateOzzyAppearance(); // Apply the new Stonks variant

        bossCurrentTransformX = 0; // Reset position for normal Stonks
        ozzyContainer.style.transform = `translate(-50%, -50%)`; 
        cancelAnimationFrame(bossMovementAnimationFrameId); 
        isBossMovementPaused = false; 
        
        const knockoutMsgElement = document.createElement('div');
        knockoutMsgElement.classList.add('knockout-message'); 
        knockoutMsgElement.textContent = '+1 to respect!'; // Przywrócono oryginalny tekst
        gameContainer.appendChild(knockoutMsgElement);

        setTimeout(() => {
            knockoutMsgElement.remove();
        }, 2000); 

        // ZMIANA: Obrażenia normalnego Stonksa to po prostu bazowe obrażenia
        STONKS_ATTACK_DAMAGE = baseStonksDamage;
        console.log(`Obrażenia ataku normalnego Stonksa ustawione na: ${STONKS_ATTACK_DAMAGE} dla poziomu ${currentLevel}`);
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
    // ZMIANA: Używamy ścieżki obrazu z zależności od wybranej skórki
    ozzyImage.src = SKIN_IMAGES[currentSkin].boss; 
    ozzyImage.classList.add('boss-mode'); 
    
    // Scale boss health based on encounter count (currentLevel is already correct)
    const bossEncounterCount = currentLevel / BOSS_LEVEL_INTERVAL;
    INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH + (bossEncounterCount - 1) * BOSS_HEALTH_INCREMENT_PER_ENCOUNTER;
    INITIAL_OZZY_HEALTH = Math.max(BOSS_INITIAL_HEALTH, INITIAL_OZZY_HEALTH); // Ensure it doesn't go below base

    // ZMIANA: Komunikat bossa zależny od wybranej skórki
    const bossMessageText = currentSkin === 'stonks' ? "UWAGA! BOSS STONKS! ROZPIERDOL GO!" : "UWAGA! BOSS TINU! ROZPIERDOL GO!";
    showBossMessage(bossMessageText, 2500); 

    // ZMIANA: Oblicz obrażenia bossa: bazowe obrażenia + 25%
    STONKS_ATTACK_DAMAGE = Math.ceil(baseStonksDamage * 1.25); // Zastosuj 25% zwiększenie, zaokrąglaj w górę
    console.log(`BOSS SPAWN! Poziom: ${currentLevel}, Spotkanie: ${bossEncounterCount}, Zdrowie: ${INITIAL_OZZY_HEALTH}, Obrażenia ataku: ${STONKS_ATTACK_DAMAGE}`);


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
    } else if (isBossFight && ozzyHealth > 0 && Math.random() < 0.4) { // ZMIANA: Zwiększono częstotliwość pojawiania się cytatów bossa
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
    // NOWE: Zaktualizuj wyświetlanie punktów w sklepie
    document.getElementById('current-score-shop').textContent = score;

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


// NOWE: Funkcje do obsługi wyboru skórki
function showSkinSelectionScreen() {
    startScreen.classList.add('hidden');
    shopButton.classList.add('hidden'); // Ukryj przycisk sklepu na ekranie wyboru skórek
    superpowerButtonsContainer.classList.add('hidden'); // Ukryj przyciski supermocy
    ozzyContainer.classList.add('hidden'); // Ukryj Stonksa/Ozzy'ego
    gameInfoContainer.classList.add('hidden'); // Ukryj informacje o grze
    playerHealthContainer.classList.add('hidden'); // Ukryj pasek życia gracza
    leaderboardScreen.classList.add('hidden'); // Ukryj ranking
    endScreen.classList.add('hidden'); // Ukryj ekran końcowy

    skinSelectionScreen.classList.remove('hidden');
}

function hideSkinSelectionScreen() {
    skinSelectionScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    // Pozostałe elementy UI zostaną ukryte/pokazane przez resetGame/startGame
}

function selectSkin(skinName) {
    currentSkin = skinName;
    console.log(`Wybrano skórkę: ${currentSkin}`);
    // Zaktualizuj źródło obrazu dla ozzyImage natychmiast po wyborze skórki
    ozzyImage.src = SKIN_IMAGES[currentSkin].normal;
    // Opcjonalnie: zaktualizuj podgląd skórki w menu, jeśli jest widoczny
    // W tej prostej implementacji, zmiana będzie widoczna po rozpoczęciu gry.
    hideSkinSelectionScreen();
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
    gameOverSound = document.getElementById('game-over-sound'); // NOWE: Przypisanie elementu audio (przeniesione z góry, upewnienie się)
    shopButton = document.getElementById('shop-button');
    upgradeShopScreen = document.getElementById('upgrade-shop-screen');
    closeShopButton = document.getElementById('close-shop-button');
    baseDamageLevelDisplay = document.getElementById('base-damage-level');
    baseDamageCostDisplay = document.getElementById('base-damage-cost');
    buyBaseDamageButton = document.getElementById('buy-base-damage');
    lightningDamageLevelDisplay = document.getElementById('lightning-damage-level');
    lightningDamageCostDisplay = document = document.getElementById('lightning-damage-cost');
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
    // ZMIANA: Zmienne DOM dla paska życia gracza (już istnieją, tylko dla jasności)
    playerHealthContainer = document.getElementById('player-health-container');
    playerHealthDisplay = document.getElementById('player-health-display');
    playerHealthBarBg = document.getElementById('player-health-bar-bg');
    playerHealthBarFill = document.getElementById('player-health-bar-fill');

    // NOWE: Przypisanie zmiennych DOM dla wyboru skórki
    selectSkinButton = document.getElementById('select-skin-button');
    skinSelectionScreen = document.getElementById('skin-selection-screen');
    selectStonksSkinButton = document.getElementById('select-stonks-skin');
    selectTinuSkinButton = document.getElementById('select-tinu-skin');
    closeSkinSelectionButton = document.getElementById('close-skin-selection-button');


    // IMPORTANT: Hide the upgrade shop screen immediately upon loading.
    upgradeShopScreen.classList.add('hidden');

    // Ensure all screens are initially hidden
    endScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    ozzyContainer.classList.add('hidden');
    gameInfoContainer.classList.add('hidden'); 
    quoteImagesContainer.innerHTML = ''; 
    skinSelectionScreen.classList.add('hidden'); // Ukryj ekran wyboru skórki na starcie

    // resetGame is called in DOMContentLoaded, so its use of global DOM variables is safe
    resetGame(); 

    // Set canvas dimensions on load and resize
    const setCanvasDimensions = () => {
        gameEffectsCanvas.width = gameContainer.offsetWidth;
        gameEffectsCanvas.height = gameContainer.offsetHeight;
    };
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Load the claw image once
    clawImage.src = 'pazury.png';
    clawImage.onerror = () => {
        console.error("Failed to load pazury.png. Please check the image path.");
        // Fallback or show an error to the user if image is critical
    };


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
        playerHealthContainer.classList.add('hidden'); // NOWE: Ukryj pasek gracza przy przejściu do rankingu
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
        playerHealthContainer.classList.add('hidden'); // NOWE: Ukryj pasek gracza przy przejściu do rankingu
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
        clearInterval(playerAttackIntervalId); // NOWE: Zatrzymaj atak Stonksa w sklepie

        // Stop all canvas effects when going to shop
        cancelAnimationFrame(gameCanvasAnimationFrameId); // ZMIANA: Anuluj animację canvasa
        gameEffectsCanvas.classList.add('hidden'); // ZMIANA: Ukryj canvas
        gameEffectsCanvas.classList.remove('active'); // ZMIANA: Usuń klasę active
        // ZMIANA: Czyszczenie tablic cząsteczek, aby nie wyświetlały się w sklepie
        bossCanvasParticles = [];
        lightningCanvasParticles = [];
        freezeCanvasParticles = [];
        frenzyCanvasParticles = [];
        scratchCanvasParticles = [];
        stonksAttackClawParticles = []; // NOWE
        stonksAttackPainParticles = [];   // NOWE
        clawMarks = []; // NOWE: Wyczyść ślady pazurów
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
        playerHealthContainer.classList.add('hidden'); // NOWE: Ukryj pasek gracza w sklepie

        upgradeShopScreen.classList.remove('hidden'); 
        updateUpgradeShopUI(); 
    });

    closeShopButton.addEventListener('click', () => {
        upgradeShopScreen.classList.add('hidden'); 

        ozzyContainer.classList.remove('hidden'); 
        superpowerButtonsContainer.classList.remove('hidden'); 
        shopButton.classList.remove('hidden'); 
        gameInfoContainer.classList.remove('hidden'); 
        playerHealthContainer.classList.remove('hidden'); // NOWE: Pokaż pasek gracza po wyjściu ze sklepu


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

        // NOWE: Wznów atak Stonksa po wyjściu ze sklepu
        clearInterval(playerAttackIntervalId);
        playerAttackIntervalId = setInterval(stonksAttack, STONKS_ATTACK_INTERVAL_MS);


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

    // NOWE: Obsługa przycisków wyboru skórki
    selectSkinButton.addEventListener('click', showSkinSelectionScreen);
    selectStonksSkinButton.addEventListener('click', () => selectSkin('stonks'));
    selectTinuSkinButton.addEventListener('click', () => selectSkin('tinu'));
    closeSkinSelectionButton.addEventListener('click', hideSkinSelectionScreen);


    updateUpgradeShopUI();
});
