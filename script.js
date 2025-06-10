import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';


// === Firebase Configuration (You Must Replace With Your Own Keys!) ===
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
// CHANGE: DOM variables for player health bar (already exist, just for clarity)
let playerHealthContainer;
let playerHealthDisplay;
let playerHealthBarBg;
let playerHealthBarFill;

// NEW: DOM variables for skin selection
let selectSkinButton;
let skinSelectionScreen;
let selectStonksSkinButton;
let selectTinuSkinButton;
let closeSkinSelectionButton;

// NEW: DOM variables for max health upgrade
let maxHealthLevelDisplay;
let maxHealthCostDisplay;
let buyMaxHealthButton;

// NEW: DOM variables for superpower level display on buttons
let btnLightningLvlDisplay;
let btnFreezeLvlDisplay;
let btnFrenzyLvlDisplay;


// --- Other global variables (not directly related to DOM), with immediate assignments ---
let playerNickname = "Player";
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
let COOLDOWN_DURATION_MS = 60 * 1000; // CHANGE: Changed to let, to modify

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

// CHANGE: Default images and for other skins
const SKIN_IMAGES = {
    stonks: {
        normal: 'stonks.png',
        boss: 'stonksboss.png'
    },
    tinu: {
        normal: 'tinu.png', // Replace with actual Tinu image path
        boss: 'tinuboss.png' // Replace with actual Tinu Boss image path
    }
};
let currentSkin = 'tinu'; // Domyślna skórka na Tinu

const BOSS_LEVEL_INTERVAL = 10; // Boss appears every 10 levels (e.g. level 10, 20, 30)

const NORMAL_OZZY_INITIAL_HEALTH = 100;
const NORMAL_OZZY_HEALTH_INCREMENT = 20; 
// CHANGE: Reduced initial health and increment for boss
const BOSS_INITIAL_HEALTH = 300; 
const BOSS_HEALTH_INCREMENT_PER_ENCOUNTER = 100; 

const BOSS_MOVEMENT_SPEED = 2; 
// ZMIANA: Zneutralizowane cytaty bossa
const BOSS_QUOTES = [
    "CRYPTON TEAM IS FARMING!", "TTB IS BEST!", 
    "TO DUBAI!", "WITH INVESTOR'S MONEY!", 
    "WANT V1 REFUND?", "STONKS OR STINKS?"
];
let bossMovementAnimationFrameId; 
let bossDx = BOSS_MOVEMENT_SPEED; 
let bossCurrentTransformX = 0; // Tracks additional X offset from center

const CLIENT_SIDE_MAX_SCORE = 200; // This variable is no longer used for level verification, but remains for historical context.

let upgradeLevels = {
    baseDamage: 1, lightningDamage: 1, freezeDamage: 1, frenzyDamage: 1,
    maxHealth: 1 // NEW: Max health upgrade level
};

const UPGRADE_COST_BASE = 10;
const UPGRADE_COST_MULTIPLIER = 1.5; 
const DAMAGE_INCREASE_PER_LEVEL = 5; 

const LIGHTNING_DAMAGE_INCREASE_PER_LEVEL = 30; 
const FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL = 10; 
const FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL = 5; 
const FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL = 15; 

// NEW: Constants for player health upgrade
let MAX_PLAYER_HEALTH = 100; // Changed to let, so it can be modified
const PLAYER_HEALTH_BASE_VALUE = 100; // Base health value
const PLAYER_HEALTH_INCREASE_PER_LEVEL = 25; // Max health increase per level

// NEW: Constants for cooldown reduction and max levels
const COOLDOWN_REDUCTION_PER_LEVEL_MS = 5 * 1000; // 5 seconds per level
const MIN_COOLDOWN_MS = 15 * 1000; // Minimum cooldown 15 seconds
const MAX_UPGRADE_LEVEL = 10; // Maximum upgrade level for superpowers

// --- Variables for visual variants of Stonks ---
let stonksVisualVariantIndex = 0; // Current index of Stonks visual variant
const totalStonksVariants = 20;     // ZMIANA: Zwiększona liczba wariantów (0-19)
let bossVisualVariantIndex = 0;    // Current index of Boss visual variant
const totalBossVariants = 20;       // ZMIANA: Zwiększona liczba wariantów (0-19)

// Original superpower button texts (for display when not on cooldown)
const originalLightningText = 'Lightning Strike';
const originalFreezeText = 'Ice Blast';
const originalFrenzyText = 'Battle Frenzy';

// NEW: Variables for player health and Stonks attacks (from previous changes)
let playerHealth = 100;

// CHANGE: Constant for Stonks damage increase AFTER DEFEATING A BOSS
const STONKS_DAMAGE_INCREMENT_PER_BOSS_CYCLE = 3; 

let baseStonksDamage = 5; // Base Stonks damage, which increases after each boss
let STONKS_ATTACK_DAMAGE = baseStonksDamage; // Current damage dealt by Stonks (can be modified by boss)

const STONKS_ATTACK_INTERVAL_MS = 2000; // How often in ms Stonks attacks the player
let playerAttackIntervalId; // Interval ID for Stonks' attack

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

    update(deltaTime) { // Accept deltaTime
        // Move particle based on velocity and deltaTime, normalized to 60 FPS base
        const baseFps = 1000 / 60; // Approximate milliseconds per frame at 60 FPS
        const dtRatio = deltaTime / baseFps;

        this.x += this.vx * dtRatio;
        this.y += this.vy * dtRatio;
        
        this.currentLifeTime += deltaTime; // Increase elapsed time

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
            this.alpha -= 0.005 * dtRatio; // Fast fade, scaled
            this.size = this.startSize * (1 - 0.002 * (this.currentLifeTime / this.life)); // Slight size reduction, scaled
        } else if (this.type === 'painParticle') {
            // Shape drawing is now in draw, not here
            this.vy += 0.02 * dtRatio; // Gravity, scaled
            this.alpha -= 0.008 * dtRatio; // Fast fade, scaled
            this.size = this.startSize * (1 - 0.001 * (this.currentLifeTime / this.life)); // Decrease size, scaled
        } else if (this.type === 'clawMark') { 
            this.alpha = 1 - (this.currentLifeTime / this.life); // Fade out
            // No movement, static mark
        } else if (this.type === 'frenzyFlame') { // New type for Battle Frenzy
            this.vy += 0.05 * dtRatio; // Slight gravity for flames to fall
            this.vx *= (1 - 0.01 * dtRatio); // Slight slowdown
            this.size = this.startSize * (1 - (this.currentLifeTime / this.life) * 0.5); // Decrease size by 50%
        } else if (this.type === 'bossFire') { // Improved boss fire dynamics
            this.vy -= 0.1 * dtRatio; // Rises faster
            this.vx *= (1 - 0.03 * dtRatio); // Stronger lateral slowdown
            this.size = this.startSize * (0.8 + 0.5 * (this.currentLifeTime / this.life)); // Expands
            this.alpha = 1 - Math.pow(this.currentLifeTime / this.life, 2); // Fast fade
        } else if (this.type === 'bossIce') { // Improved boss ice dynamics
            this.vy += 0.02 * dtRatio; // Slight gravity
            this.vx *= (1 - 0.01 * dtRatio); // Slight slowdown
            this.angle += 0.1 * dtRatio; // Slow rotation
            this.size = this.startSize * (1 - (this.currentLifeTime / this.life) * 0.7); // Shrinks
        } else if (this.type === 'bossElectricity') { // Improved boss electricity dynamics
             // Very short life and no significant movement after spawn
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        if (this.type.startsWith('boss') || this.type === 'lightningSpark') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.type === 'bossElectricity') { // Special drawing for electricity
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 4); // Thin, sharp rectangles
            } else if (this.type === 'lightningSpark') {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'bossFire') { // Drawing for fire
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.moveTo(0, -this.size);
                ctx.quadraticCurveTo(this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
                ctx.quadraticCurveTo(0, this.size / 4, -this.size / 2, this.size / 2);
                ctx.quadraticCurveTo(-this.size / 2, -this.size / 2, 0, -this.size);
                ctx.fill();
            } else if (this.type === 'bossIce') { // Drawing for ice
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
        } else if (this.type === 'frenzyPulse') { // Previous effect, leaving for safety
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'frenzyFlame') { // Drawing for Battle Frenzy (flames)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Could add more complex flame shape, for now it's a simple circle
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
            ctx.lineWidth = this.size * 0.4; // Reduced thickness of the main line (40% size)
            
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Drawing a jagged claw - main cut with irregular edges
            ctx.beginPath();
            // Top edge
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

            // Add a subtle shadow for depth
            ctx.globalAlpha = Math.max(0, this.alpha * 0.3); // Less visible shadow
            ctx.lineWidth = this.size * 0.2; // Shadow is thinner
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Dark shadow color
            ctx.stroke(); // Draw shadow
            ctx.globalAlpha = Math.max(0, this.alpha); // Restore full alpha for main shape
            
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
        return this.currentLifeTime >= this.life || this.alpha <= 0; // Check based on time
    }
}


// Global arrays for different types of canvas particles
let bossCanvasParticles = [];
let lightningCanvasParticles = [];
let freezeCanvasParticles = [];
let frenzyCanvasParticles = [];
let scratchCanvasParticles = [];
// NEW: Arrays for Stonks attack particles
let stonksAttackClawParticles = [];
let stonksAttackPainParticles = [];
let clawMarks = []; // New array for claw effects
let clawImage = new Image(); // Create a new Image object for the claw


const MAX_CANVAS_PARTICLES = 200; // General limit for performance
let lightningModeActive = false; // New state variable for lightning storm

let gameCanvasAnimationFrameId;
let lastFrameTime = 0; // Add variable to track last frame time

function animateGameCanvasEffects(currentTime) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const deltaTime = currentTime - lastFrameTime; // Time in milliseconds since last frame
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
        // CHANGE: More dynamic boss particles
        if (bossCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.6) { // Increased spawn chance
            let color, type, size, life, vx, vy;
            const spawnRadius = Math.min(ozzyRect.width, ozzyRect.height) * 0.8; // Larger spawn radius around boss
            const angle = Math.random() * Math.PI * 2;
            const spawnDistance = Math.random() * spawnRadius;

            const startX = ozzyCanvasX + Math.cos(angle) * spawnDistance;
            const startY = ozzyCanvasY + Math.sin(angle) * spawnDistance;

            if (bossVisualVariantIndex === 0) { // Red/fiery boss
                color = `rgba(255, ${Math.floor(Math.random() * 100)}, 0, ${0.7 + Math.random() * 0.3})`;
                type = 'bossFire';
                size = Math.random() * 15 + 10; // Larger flames
                life = 1000 + Math.random() * 500; // Longer life
                vx = (Math.random() - 0.5) * (baseParticleSpeed * 0.3); // Slower lateral movements
                vy = -(Math.random() * baseParticleSpeed * 0.5) - 0.5; // Moves upwards
            } else if (bossVisualVariantIndex === 1) { // Blue/glitchy boss (Ice)
                color = `rgba(${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 200}, 255, ${0.7 + Math.random() * 0.3})`;
                type = 'bossIce';
                size = Math.random() * 10 + 5; // Shard size
                life = 800 + Math.random() * 400;
                vx = (Math.random() - 0.5) * (baseParticleSpeed * 0.8); // Fast dispersion
                vy = (Math.random() - 0.5) * (baseParticleSpeed * 0.8);
            } else { // Purple/intense boss (Electricity)
                color = `rgba(${Math.floor(Math.random() * 50) + 200}, 0, ${Math.floor(Math.random() * 50) + 200}, ${0.8 + Math.random() * 0.2})`;
                type = 'bossElectricity';
                size = Math.random() * 20 + 10; // Spark length
                life = 200 + Math.random() * 100; // Very short life
                vx = 0; // No movement
                vy = 0;
            }
            bossCanvasParticles.push(new CanvasParticle(startX, startY, vx, vy, color, size, life, type, Math.random() * Math.PI * 2));
        }
    }
    // Update and draw boss particles (and remove dead ones)
    for (let i = bossCanvasParticles.length - 1; i >= 0; i--) {
        bossCanvasParticles[i].update(deltaTime); // Pass deltaTime
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

        // NEW: Generate lightning segments in animation loop
        const lightningSpawnChance = 0.2; // Chance to generate a new lightning bolt in each frame (increased)
        if (lightningCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < lightningSpawnChance) {
            const boltLength = Math.random() * 100 + 100; // Length of the main lightning segment
            const boltWidth = Math.random() * 5 + 5; // Lightning thickness
            const boltLife = 800 + Math.random() * 700; // Lightning life (0.8 - 1.5s)

            // Random starting point for lightning (at the top of the screen)
            const startX = Math.random() * gameEffectsCanvas.width;
            const startY = Math.random() * gameEffectsCanvas.height * 0.3; // Top 30% of the screen

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
                    `rgba(255, 255, ${Math.floor(Math.random() * 100) + 180}, ${0.8 + Math.random() * 0.2})`, // Brighter, more white-yellow
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
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5), // Slower sparks
                    (Math.random() - 0.5) * (baseParticleSpeed * 0.5),
                    `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`, // White sparks
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
        lightningCanvasParticles[i].update(deltaTime); // Pass deltaTime
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
                ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 1.5, // Increased area
                ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * 1.5, // Increased area
                (Math.random() - 0.5) * (baseParticleSpeed * 0.25), // CHANGE: Reduced speed by 75%, but higher base
                (Math.random() - 0.5) * (baseParticleSpeed * 0.25), // CHANGE: Reduced speed by 75%, but higher base
                `rgba(173, 216, 230, ${0.7 + Math.random() * 0.3})`, // Vary alpha
                Math.random() * 15 + 8, // size (larger)
                1200, // life in ms (1.2 seconds)
                'iceShard',
                Math.random() * 360 // random angle
            ));
        }
    }
    for (let i = freezeCanvasParticles.length - 1; i >= 0; i--) {
        freezeCanvasParticles[i].update(deltaTime); // Pass deltaTime
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
        if (frenzyCanvasParticles.length < MAX_CANVAS_PARTICLES && Math.random() < 0.8) { // Increased frequency for frenzy
            const initialParticleX = ozzyCanvasX + (Math.random() - 0.5) * ozzyRect.width * 0.8; // Start closer to ozzy
            const initialParticleY = ozzyCanvasY + (Math.random() - 0.5) * ozzyRect.height * 0.8;

            const speed = (Math.random() * 3 + 2); // Faster particles (2-5)
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            frenzyCanvasParticles.push(new CanvasParticle(
                initialParticleX, initialParticleY, vx, vy, 
                `rgba(255, ${Math.floor(Math.random() * 80)}, 0, ${0.9 + Math.random() * 0.1})`, // Intensywny czerwono-pomarańczowy
                Math.random() * 8 + 4, // Particle size (4-12)
                500 + Math.random() * 300, // Short life (0.5-0.8s)
                'frenzyFlame' // New type
            ));
        }
    }
    for (let i = frenzyCanvasParticles.length - 1; i >= 0; i--) {
        frenzyCanvasParticles[i].update(deltaTime); // Pass deltaTime
        if (frenzyCanvasParticles[i].isDead()) {
            frenzyCanvasParticles.splice(i, 1);
        } else {
            frenzyCanvasParticles[i].draw(gameEffectsCtx);
        }
    }

    // Update and draw scratch particles
    for (let i = scratchCanvasParticles.length - 1; i >= 0; i--) {
        scratchCanvasParticles[i].update(deltaTime); // Pass deltaTime
        if (scratchCanvasParticles[i].isDead()) {
            scratchCanvasParticles.splice(i, 1);
        } else {
            scratchCanvasParticles[i].draw(gameEffectsCtx);
        }
    }

    // NEW: Update and draw Stonks attack particles
    for (let i = stonksAttackClawParticles.length - 1; i >= 0; i--) {
        stonksAttackClawParticles[i].update(deltaTime); // Pass deltaTime
        if (stonksAttackClawParticles[i].isDead()) {
            stonksAttackClawParticles.splice(i, 1);
        } else {
            stonksAttackClawParticles[i].draw(gameEffectsCtx);
        }
    }

    for (let i = stonksAttackPainParticles.length - 1; i >= 0; i--) {
        stonksAttackPainParticles[i].update(deltaTime); // Pass deltaTime
        if (stonksAttackPainParticles[i].isDead()) {
            stonksAttackPainParticles.splice(i, 1);
        } else {
            stonksAttackPainParticles[i].draw(gameEffectsCtx);
        }
    }

    // NEW: Update and draw Claw Marks
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
                               stonksAttackClawParticles.length > 0 || // NEW
                               stonksAttackPainParticles.length > 0 ||  // NEW
                               clawMarks.length > 0; // NEW

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
 * NEW: Function to draw a scratch effect on the screen
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {number} x X position of the scratch center
 * @param {number} y Y position of the scratch center
 * @param {number} count Number of individual scratch lines
 * @param {string} color Color of the scratch (e.g., 'rgba(255, 0, 0, 0.7)')
 * @param {number} baseSize Base size of the scratch line
 */
function drawScratchEffect(x, y, count, color, baseSize) {
    for (let i = 0; i < count; i++) {
        // Random offset for each scratch line
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 50;
        // Random angle for each line to make them look like more natural scratches
        const angle = Math.random() * Math.PI * 2; // Angle in radians
        // Random size for each line
        const size = baseSize + (Math.random() * baseSize / 2);
        // Life of the scratch particle in ms (1 second)
        const life = 1000; 

        scratchCanvasParticles.push(new CanvasParticle(
            x + offsetX, y + offsetY, 0, 0, color, size, life, 'scratch', angle
        ));
    }
}

/**
 * NEW: Function to create dynamic Stonks attack effects (claws, pain splatter)
 * @param {number} ozzyX X position of Stonks on canvas (center)
 * @param {number} ozzyY Y position of Stonks on canvas (center)
 */
function spawnStonksAttackEffects(ozzyX, ozzyY) {
    const gameContainerRect = gameContainer.getBoundingClientRect(); 
    const gameContainerWidth = gameContainerRect.width;
    const gameContainerHeight = gameContainerRect.height;

    // Random starting point for claw attack on a larger screen area
    // Ensuring claws don't go completely off-screen
    const spawnAreaX = gameContainerWidth * 0.8; // 80% of screen width
    const spawnAreaY = gameContainerHeight * 0.8; // 80% of screen height
    
    // Attack hit point (center of the claw set)
    const attackHitX = (gameContainerWidth / 2) + (Math.random() - 0.5) * spawnAreaX;
    const attackHitY = (gameContainerHeight / 2) + (Math.random() - 0.5) * spawnAreaY;

    // --- Claw effects (clawMarks) ---
    const numClawImages = 1; // Only one claw image per attack
    // Claw size adjusted to screen size for readability
    const clawImageSize = Math.min(gameContainerWidth * 0.3, gameContainerHeight * 0.3, 200); // Max 200px, responsive to screen
    const clawLife = 1000; // Life of the claw image in ms (1 second)

    for (let s = 0; s < numClawImages; s++) {
        // Rotation angle of the claw image
        const angle = Math.random() * Math.PI * 2; 

        clawMarks.push(new CanvasParticle(
            attackHitX, attackHitY, 0, 0, null, // No color needed for image, no velocity
            clawImageSize, clawLife, 'clawMark', angle, clawImage // Pass the loaded image
        ));
    }

    // --- Pain Particles ---
    const numPainParticles = Math.floor(Math.random() * 15) + 15; // 15-29 points
    const painParticleLife = 1200; // Life in ms (1.2 seconds)
    const painParticleSize = Math.random() * 8 + 8; // Sizes (8-16, slightly larger)
    const painParticleBaseSpeed = 1.2; // Increased base speed

    // Pain points are clustered around attackHitX, attackHitY
    const painSpawnRadius = clawImageSize * 0.5; // Radius around the claw hit location

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
async function saveScoreToLeaderboard(nickname, level) { // CHANGE: Changed parameter name from 'score' to 'level'
    console.log("saveScoreToLeaderboard called with nickname:", nickname, "level:", level); // CHANGE: Changed logging

    // CLIENT_SIDE_MAX_SCORE is no longer used for level verification.
    // If a maximum level limit is needed, a new variable like MAX_LEVEL should be introduced.
    // CHANGE: Removed client-side score/level verification condition.
    // if (score > CLIENT_SIDE_MAX_SCORE) {
    //     showMessage("Spierdalaj frajerze cheaterze! Wynik nierealny!", 3000);
    //     console.warn(`Attempt to save unrealistic score (${score}) by ${nickname}. Blocked client-side.`);
    //     setTimeout(resetGame, 3000); // Reset the game after cheating attempt
    //     return;
    // }

    // Ensure the user is authenticated and the level is positive.
    if (level > 0 && currentUserId) { // CHANGE: Check 'level' instead of 'score'
        try {
            // DIRECT FIRESTORE SAVE
            // Use addDoc function from Firestore SDK to add a new document
            // to the 'leaderboard' collection. Firestore will automatically generate an ID for the document.
            await addDoc(collection(db, "leaderboard"), {
                nickname: nickname,
                score: level, // CHANGE: Save 'level' as 'score' in Firestore
                // Use serverTimestamp() to get a server-side timestamp,
                // which helps with sorting and prevents client-side time manipulation.
                timestamp: serverTimestamp(), 
                userId: currentUserId // Save anonymous user ID if needed (e.g., to filter results for a specific player)
            });

            showMessage("Score saved successfully!", 2000);
            console.log(`Score (level ${level}) submitted by ${nickname} (${currentUserId}) and saved.`); // CHANGE: Logging

        } catch (error) {
            console.error("Error saving score directly to Firestore:", error);
            showMessage(`Error saving score: ${error.message}`, 3000);
        }
    } else if (!currentUserId) {
        console.warn("Cannot save score: User is not authenticated.");
        showMessage("Error: No authentication to save score. Try refreshing.", 3000);
    }
}

async function fetchAndDisplayLeaderboard() {
    console.log("fetchAndDisplayLeaderboard called.");
    leaderboardList.innerHTML = ''; 
    try {
        // Query remains 'score' because that's the field name in Firestore
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), orderBy("timestamp", "asc"), limit(10));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            leaderboardList.innerHTML = '<li>No scores on the leaderboard. Be the first!</li>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li'); // NEW: Create li element
            // CHANGE: Display 'level' instead of 'knockouts'
            li.textContent = `${data.nickname || 'Anonymous'}: Level ${data.score}`;
            leaderboardList.appendChild(li);
        });
    } catch (e) {
        console.error("Error fetching leaderboard: ", e);
        leaderboardList.innerHTML = '<li>An error occurred while loading the leaderboard.</li>';
    }
}

// --- Quote Functions ---
function spawnRandomQuote() {
    const randomImagePath = quoteImagePaths[Math.floor(Math.random() * quoteImagePaths.length)];

    const img = document.createElement('img');
    img.src = randomImagePath;
    img.classList.add('quote-image'); 

    const gameContainerRect = gameContainer.getBoundingClientRect();
    // CHANGE: Randomize position across the entire screen so images are visible
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

// NEW: Stonks function to attack the player
function stonksAttack() {
    if (!isGameActive) {
        clearInterval(playerAttackIntervalId); // Stop attacking if game is inactive
        return;
    }

    // 1. Visual effect on Stonks character
    // We will use a CSS class to quickly apply a filter (e.g., invert or brightness)
    ozzyImage.classList.add('attacking'); // Class for movement animation (already exists)
    ozzyImage.classList.add('stonks-attack-effect'); // NEW class for visual effect

    // Remove visual effect class after a short time
    setTimeout(() => {
        ozzyImage.classList.remove('stonks-attack-effect');
    }, 200); // Short flash/effect lasting 200ms

    // Apply visual attack animation to Stonks (already exists)
    setTimeout(() => {
        ozzyImage.classList.remove('attacking');
    }, 800); // Duration of the attack animation

    // CHANGE: Add screen shake (already exists)
    gameContainer.classList.add('screen-shake');
    setTimeout(() => {
        gameContainer.classList.remove('screen-shake');
    }, 400); // Shake duration, matched to CSS animation

    // Apply damage to player (already exists)
    playerHealth -= STONKS_ATTACK_DAMAGE;
    playerHealth = Math.max(0, playerHealth); // Ensure health doesn't go below zero
    updatePlayerHealthUI();

    // Call NEW Stonks attack effect on canvas (changed)
    const ozzyRect = ozzyContainer.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    const ozzyCanvasX = ozzyRect.left - gameRect.left + ozzyRect.width / 2;
    const ozzyCanvasY = ozzyRect.top - gameRect.top + ozzyRect.height / 2;
    
    // Use the new function to generate improved effects
    spawnStonksAttackEffects(ozzyCanvasX, ozzyCanvasY); // Pass Ozzy's position for reference

    if (playerHealth <= 0) {
        endGame("YOU DIED FIGHTING THE BOT!"); // ZMIANA: Neutralny tekst
    }
}

// NEW: Function to update player health bar UI (from previous changes)
function updatePlayerHealthUI() {
    playerHealthDisplay.textContent = `${playerHealth}/${MAX_PLAYER_HEALTH}`;
    const healthPercentage = (playerHealth / MAX_PLAYER_HEALTH) * 100;
    playerHealthBarFill.style.width = `${healthPercentage}%`;

    // Change player health bar color
    if (healthPercentage > 60) {
        playerHealthBarFill.style.backgroundColor = '#00BFFF'; // Blue
    } else if (healthPercentage > 30) {
        playerHealthBarFill.style.backgroundColor = '#FFD700'; // Gold/Yellow
    } else {
        playerHealthBarFill.style.backgroundColor = '#FF0000'; // Red
    }
}


// --- Superpower Functions ---
function updateSuperpowerButtons() {
    const now = Date.now();

    // Helper function to get effective cooldown
    const getEffectiveCooldown = (upgradeLevel) => {
        return Math.max(MIN_COOLDOWN_MS, COOLDOWN_DURATION_MS - (upgradeLevel - 1) * COOLDOWN_REDUCTION_PER_LEVEL_MS);
    };

    const canUseLightning = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                            ((now - lastUsedLightningTime >= getEffectiveCooldown(upgradeLevels.lightningDamage)) || lastUsedLightningTime === 0) &&
                            isGameActive; 

    const canUseFreeze = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                         ((now - lastUsedFreezeTime >= getEffectiveCooldown(upgradeLevels.freezeDamage)) || lastUsedFreezeTime === 0) &&
                         isGameActive; 

    const canUseFrenzy = (punchesSinceLastPowerup >= PUNCHES_PER_POWERUP) &&
                         ((now - lastUsedFrenzyTime >= getEffectiveCooldown(upgradeLevels.frenzyDamage)) || lastUsedFrenzyTime === 0) &&
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

    const updateButtonInfo = (button, lastUsedTime, originalText, upgradeLevel, levelDisplayElement) => {
        const superpowerNameCooldownSpan = button.querySelector('.superpower-name-cooldown');
        
        const effectiveCooldown = Math.max(MIN_COOLDOWN_MS, COOLDOWN_DURATION_MS - (upgradeLevel - 1) * COOLDOWN_REDUCTION_PER_LEVEL_MS);
        const timeElapsed = now - lastUsedTime;
        const timeLeft = Math.ceil((lastUsedTime + effectiveCooldown - now) / 1000);
        
        // Update level display (always visible)
        if (levelDisplayElement) {
            levelDisplayElement.textContent = `Lvl ${upgradeLevel}`;
        }

        if (isGameActive && timeLeft > 0) {
            // Calculate cooldown progress percentage
            const progressPercentage = (timeElapsed / effectiveCooldown) * 100;
            button.style.setProperty('--cooldown-percentage', `${progressPercentage}%`);
            if (superpowerNameCooldownSpan) {
                superpowerNameCooldownSpan.textContent = ` ${timeLeft}s`;
            }
        } else {
            // Cooldown is finished or game is inactive
            button.style.setProperty('--cooldown-percentage', '100%'); // Fully charged visually
            if (superpowerNameCooldownSpan) {
                superpowerNameCooldownSpan.textContent = ` ${originalText}`;
            }
        }
    };

    updateButtonInfo(btnLightning, lastUsedLightningTime, originalLightningText, upgradeLevels.lightningDamage, btnLightningLvlDisplay);
    updateButtonInfo(btnFreeze, lastUsedFreezeTime, originalFreezeText, upgradeLevels.freezeDamage, btnFreezeLvlDisplay);
    updateButtonInfo(btnFrenzy, lastUsedFrenzyTime, originalFrenzyText, upgradeLevels.frenzyDamage, btnFrenzyLvlDisplay);
}


function activateLightningStrike() {
    if (!isGameActive || btnLightning.disabled) return;

    showMessage("LIGHTNING STRIKE!", 1500);
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
    lightningEffect.classList.add('flash-active'); // Add active class for animation

    // Hide CSS flash and clear canvas particles after animation
    setTimeout(() => {
        lightningEffect.classList.remove('flash-active');
        lightningEffect.classList.add('hidden');
    }, 1500); 
}


function activateIceBlast() {
    if (!isGameActive || btnFreeze.disabled) return;

    showMessage("ICE BLAST!", 1500);
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
            showMessage("Ice Blast weakened.", 1000); 
        }
    }, 1000); 
}

function activateFrenzy() {
    if (!isGameActive || btnFrenzy.disabled) return;

    showMessage("BATTLE FRENZY!", 1500);
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
        showMessage("Frenzy ended. Normal punches.", 1500);
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
        bossDx *= -1;
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
    // CHANGE: Use image path based on selected skin
    ozzyImage.src = SKIN_IMAGES[currentSkin].normal;
    ozzyImage.classList.remove('boss-mode');
    ozzyImage.classList.remove('flipped-x'); 
    ozzyImage.classList.remove('attacking'); // NEW: Remove attack class
    ozzyImage.classList.remove('stonks-attack-effect'); // NEW: Remove Stonks attack effect class
    gameContainer.classList.remove('screen-shake'); // NEW: Remove shake class

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
    cancelAnimationFrame(gameCanvasAnimationFrameId); // CHANGE: Cancel canvas animation
    gameEffectsCanvas.classList.add('hidden'); // CHANGE: Hide canvas
    gameEffectsCanvas.classList.remove('active'); // CHANGE: Remove active class
    bossCanvasParticles = [];
    lightningCanvasParticles = [];
    freezeCanvasParticles = [];
    frenzyCanvasParticles = [];
    scratchCanvasParticles = [];
    stonksAttackClawParticles = []; // NEW
    stonksAttackPainParticles = [];   // NEW
    clawMarks = []; // NEW: Clear claw marks
    if (gameEffectsCtx) {
        gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
    }

    document.querySelectorAll('.knockout-message').forEach(el => el.remove());
    document.querySelectorAll('.boss-message').forEach(el => el.remove());

    // CHANGE: Reset player health and hide bar
    upgradeLevels.maxHealth = 1; // Reset max health upgrade level
    MAX_PLAYER_HEALTH = PLAYER_HEALTH_BASE_VALUE + (upgradeLevels.maxHealth - 1) * PLAYER_HEALTH_INCREASE_PER_LEVEL;
    playerHealth = MAX_PLAYER_HEALTH; // Set player health to max base
    updatePlayerHealthUI();
    playerHealthContainer.classList.add('hidden');
    clearInterval(playerAttackIntervalId); // Stop Stonks attack

    // NEW: Reset superpower upgrade levels to 1
    upgradeLevels.lightningDamage = 1;
    upgradeLevels.freezeDamage = 1;
    upgradeLevels.frenzyDamage = 1;

    isGameActive = false;
    endScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    upgradeShopScreen.classList.add('hidden'); 
    startScreen.classList.remove('hidden'); 
    shopButton.classList.remove('hidden'); 
    superpowerButtonsContainer.classList.add('hidden'); 
    
    gameInfoContainer.classList.add('hidden');

    clearInterval(superpowerCooldownIntervalId);
    updateSuperpowerCooldownDisplays(); // Ensure level display is up to date

    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    if (gameOverSound) { // NEW: Stop game over sound (if playing)
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }
    baseStonksDamage = 5; // Reset base Stonks damage to initial value
    STONKS_ATTACK_DAMAGE = baseStonksDamage; // Set current damage to base
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
        showMessage("You must enter your nickname!", 2000);
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
    gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects); // CHANGE: Ensure canvas animation starts
    gameEffectsCanvas.classList.remove('hidden'); // CHANGE: Ensure canvas is visible
    gameEffectsCanvas.classList.add('active');

    // CHANGE: Set player health, show bar, and start Stonks attack
    MAX_PLAYER_HEALTH = PLAYER_HEALTH_BASE_VALUE + (upgradeLevels.maxHealth - 1) * PLAYER_HEALTH_INCREASE_PER_LEVEL;
    playerHealth = MAX_PLAYER_HEALTH;
    updatePlayerHealthUI();
    playerHealthContainer.classList.remove('hidden');
    clearInterval(playerAttackIntervalId); // Clear any previous interval first
    STONKS_ATTACK_DAMAGE = baseStonksDamage; // Set current damage to base for level 1
    playerAttackIntervalId = setInterval(stonksAttack, STONKS_ATTACK_INTERVAL_MS); // Stonks starts attacking

    if (backgroundMusic) {
        backgroundMusic.play().catch(e => console.error("Error playing backgroundMusic:", e));
    }
}

function endGame(message) {
    console.log("endGame called with message:", message);
    isGameActive = false;
    ozzyContainer.classList.add('hidden'); 
    
    gameInfoContainer.classList.add('hidden');
    playerHealthContainer.classList.add('hidden'); // NEW: Hide player health bar
    
    quoteImagesContainer.innerHTML = ''; 
    document.querySelectorAll('.knockout-message').forEach(el => el.remove());
    document.querySelectorAll('.boss-message').forEach(el => el.remove());

    gameContainer.classList.remove('screen-shake'); // NEW: Remove shake class

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
    clearInterval(playerAttackIntervalId); // NEW: Stop Stonks attack
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
    stonksAttackClawParticles = []; // NEW
    stonksAttackPainParticles = [];   // NEW
    clawMarks = []; // NEW: Clear claw marks
    if (gameEffectsCtx) {
        gameEffectsCtx.clearRect(0, 0, gameEffectsCanvas.width, gameEffectsCtx.height);
    }

    document.getElementById('end-message').textContent = message; // End game message
    document.getElementById('final-score').textContent = currentLevel; // CHANGE: Display achieved level
    saveScoreToLeaderboard(playerNickname, currentLevel); // CHANGE: Save level, not points

    endScreen.classList.remove('hidden');

    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    if (gameOverSound) { // NEW: Play game over sound
        gameOverSound.play().catch(e => console.error("Error playing gameOverSound:", e));
    }
}

function handleOzzyKnockout() {
    score++; // Increment score for every knockout
    scoreDisplay.textContent = score;

    document.querySelectorAll('.knockout-message').forEach(el => el.remove());
    document.querySelectorAll('.boss-message').forEach(el => el.remove());

    ozzyContainer.classList.add('hidden');

    // NEW: Regenerate player health after defeating the bot - RESTORED TO 100%
    playerHealth = MAX_PLAYER_HEALTH; // Set player health to maximum
    updatePlayerHealthUI();

    // Determine if the *next* level is a boss level
    const nextLevelCandidate = currentLevel + 1; // Temporary variable to check for boss
    
    if (nextLevelCandidate > 0 && nextLevelCandidate % BOSS_LEVEL_INTERVAL === 0) {
        // It's time for a boss fight
        currentLevel = nextLevelCandidate; // Set currentLevel to the boss level (e.g., 10, 20)
        currentLevelDisplay.textContent = currentLevel; // Update display
        isBossFight = true; // Set boss flag 
        
        // INCREASE BASE BOT DAMAGE AFTER DEFEATING THE PREVIOUS BOSS
        baseStonksDamage += STONKS_DAMAGE_INCREMENT_PER_BOSS_CYCLE;
        console.log(`Base bot damage increased to ${baseStonksDamage} after boss cycle.`); // ZMIANA: Neutralny tekst

        startBossFight(); // This function will setup boss, increment bossVisualVariantIndex, and apply appearance
        
        clearInterval(playerAttackIntervalId); // Stop current interval
        playerAttackIntervalId = setInterval(stonksAttack, STONKS_ATTACK_INTERVAL_MS); // Restart with new damage
    } else {
        // Normal bot knockout
        currentLevel = nextLevelCandidate; // Increment level for normal bot
        currentLevelDisplay.textContent = currentLevel; // Update display
        console.log(`Normal bot knockout. New level: ${currentLevel}`); // ZMIANA: Neutralny tekst

        isBossFight = false;
        ozzyImage.src = SKIN_IMAGES[currentSkin].normal; // ZMIANA: Używaj obrazu z wybranej skórki
        ozzyImage.classList.remove('boss-mode'); 
        ozzyImage.classList.remove('flipped-x'); 
        
        // CHANGE: Bot variant selection logic: changes every 10 levels from level 11
        // ZMIANA: Nowa logika dla 20 wariantów. Co 10 poziomów wariant bossa się zmienia, a co 10 poziomów wariant normalnego bota też się zmienia.
        // Jeśli aktualny poziom jest np. 11, bossCyclesCompletedForNormalTinus = 1, więc indeks wariantu = 1 (drugi wariant).
        // Jeśli aktualny poziom jest np. 21, bossCyclesCompletedForNormalTinus = 2, więc indeks wariantu = 2 (trzeci wariant).
        const bossCyclesCompletedForNormalTinus = Math.floor((currentLevel - 1) / BOSS_LEVEL_INTERVAL); 
        stonksVisualVariantIndex = bossCyclesCompletedForNormalTinus % totalStonksVariants;
        
        console.log(`Bot visual variant set to: stonks-variant-${stonksVisualVariantIndex} for level ${currentLevel}`); // ZMIANA: Neutralny tekst
        
        // CHANGE: Calculate normal bot health based on number of bosses defeated
        // This will ensure health scales every 10 levels, after each boss fight.
        // bossCyclesCompletedForNormalTinus: 0 for levels 1-10, 1 for 11-20, 2 for 21-30 etc.
        INITIAL_OZZY_HEALTH = NORMAL_OZZY_INITIAL_HEALTH + (bossCyclesCompletedForNormalTinus * NORMAL_OZZY_HEALTH_INCREMENT);
        console.log(`Normal bot HP set to: ${INITIAL_OZZY_HEALTH} (based on ${bossCyclesCompletedForNormalTinus} completed boss cycles)`); // ZMIANA: Neutralny tekst

        updateOzzyAppearance(); // Apply the new bot variant

        bossCurrentTransformX = 0; // Reset position for normal bot
        ozzyContainer.style.transform = `translate(-50%, -50%)`; 
        cancelAnimationFrame(bossMovementAnimationFrameId); 
        isBossMovementPaused = false; 
        
        const knockoutMsgElement = document.createElement('div');
        knockoutMsgElement.classList.add('knockout-message'); 
        knockoutMsgElement.textContent = '+1 to respect!'; // Restored original text
        gameContainer.appendChild(knockoutMsgElement);

        setTimeout(() => {
            knockoutMsgElement.remove();
        }, 2000); 

        // CHANGE: Normal bot damage is just base damage
        STONKS_ATTACK_DAMAGE = baseStonksDamage;
        console.log(`Normal bot attack damage set to: ${STONKS_ATTACK_DAMAGE} for level ${currentLevel}`); // ZMIANA: Neutralny tekst
    }

    ozzyHealth = INITIAL_OZZY_HEALTH; // Set Ozzy's health to the new scaled max health
    updateHealthBar(); 

    // Rest of the common respawn logic
    setTimeout(() => {
        ozzyContainer.classList.remove('hidden');
        ozzyImage.classList.remove('hit-effect');
        if (!isBossFight) {
            ozzyContainer.style.transform = `translate(-50%, -50%)`; // Clean centering for normal bot
        } else {
            // If it's a boss, movement animation continues, so we keep bossCurrentTransformX
            ozzyContainer.style.transform = `translate(calc(-50% + ${bossCurrentTransformX}px), -50%)`;
        }
        ozzyImage.classList.add('spawn-ozzy'); 

        setTimeout(() => {
            ozzyImage.classList.remove('spawn-ozzy');
        }, 500); 
        gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects); // CHANGE: Ensure canvas animation starts after knockout
        gameEffectsCanvas.classList.remove('hidden'); // CHANGE: Ensure canvas is visible
        gameEffectsCanvas.classList.add('active');
    }, 200); 
}

function startBossFight() {
    // `isBossFight` and `currentLevel` are already correctly set by `handleOzzyKnockout`
    // CHANGE: Use image path based on selected skin
    ozzyImage.src = SKIN_IMAGES[currentSkin].boss; 
    ozzyImage.classList.add('boss-mode'); 
    
    // Scale boss health based on encounter count (currentLevel is already correct)
    const bossEncounterCount = currentLevel / BOSS_LEVEL_INTERVAL;
    INITIAL_OZZY_HEALTH = BOSS_INITIAL_HEALTH + (bossEncounterCount - 1) * BOSS_HEALTH_INCREMENT_PER_ENCOUNTER;
    INITIAL_OZZY_HEALTH = Math.max(BOSS_INITIAL_HEALTH, INITIAL_OZZY_HEALTH); // Ensure it doesn't go below base

    // CHANGE: Boss message depends on selected skin, but more neutral
    const bossMessageText = `WARNING! BOSS ${currentSkin.toUpperCase()}! BEAT IT UP!`; // ZMIANA: Dynamiczny i neutralny tekst bossa
    showBossMessage(bossMessageText, 2500); 

    // CHANGE: Calculate boss damage: base damage + 25%
    STONKS_ATTACK_DAMAGE = Math.ceil(baseStonksDamage * 1.25); // Apply 25% increase, round up
    console.log(`BOSS SPAWN! Level: ${currentLevel}, Encounter: ${bossEncounterCount}, Health: ${INITIAL_OZZY_HEALTH}, Attack Damage: ${STONKS_ATTACK_DAMAGE}`);


    // CHANGE: Boss variant selection logic: changes for each subsequent boss
    // ZMIANA: Nowa logika dla 20 wariantów.
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
    gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects); // CHANGE: Ensure canvas animation starts for boss
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
    } else if (isBossFight && ozzyHealth > 0 && Math.random() < 0.45) { // CHANGE: Increased frequency of boss quotes
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
    // NEW: Update points display in shop
    document.getElementById('current-score-shop').textContent = score;

    baseDamageLevelDisplay.textContent = upgradeLevels.baseDamage;
    const nextBaseDamageCost = calculateUpgradeCost(upgradeLevels.baseDamage);
    baseDamageCostDisplay.textContent = nextBaseDamageCost;
    buyBaseDamageButton.disabled = score < nextBaseDamageCost;

    lightningDamageLevelDisplay.textContent = upgradeLevels.lightningDamage;
    const nextLightningDamageCost = calculateUpgradeCost(upgradeLevels.lightningDamage);
    lightningDamageCostDisplay.textContent = nextLightningDamageCost;
    // NEW: Check max level for Lightning Strike
    buyLightningDamageButton.disabled = score < nextLightningDamageCost || upgradeLevels.lightningDamage >= MAX_UPGRADE_LEVEL;

    freezeDamageLevelDisplay.textContent = upgradeLevels.freezeDamage;
    const nextFreezeDamageCost = calculateUpgradeCost(upgradeLevels.freezeDamage);
    freezeDamageCostDisplay.textContent = nextFreezeDamageCost;
    // NEW: Check max level for Ice Blast
    buyFreezeDamageButton.disabled = score < nextFreezeDamageCost || upgradeLevels.freezeDamage >= MAX_UPGRADE_LEVEL;

    frenzyDamageLevelDisplay.textContent = upgradeLevels.frenzyDamage;
    const nextFrenzyDamageCost = calculateUpgradeCost(upgradeLevels.frenzyDamage);
    frenzyDamageCostDisplay.textContent = nextFrenzyDamageCost;
    // NEW: Check max level for Battle Frenzy
    buyFrenzyDamageButton.disabled = score < nextFrenzyDamageCost || upgradeLevels.frenzyDamage >= MAX_UPGRADE_LEVEL;

    // NEW: Max player health upgrade
    maxHealthLevelDisplay.textContent = upgradeLevels.maxHealth;
    const nextMaxHealthCost = calculateUpgradeCost(upgradeLevels.maxHealth);
    maxHealthCostDisplay.textContent = nextMaxHealthCost;
    buyMaxHealthButton.disabled = score < nextMaxHealthCost;
}

function buyUpgrade(upgradeType) {
    let currentLevel = upgradeLevels[upgradeType];

    // NEW: Check max level for superpowers
    if (['lightningDamage', 'freezeDamage', 'frenzyDamage'].includes(upgradeType) && currentLevel >= MAX_UPGRADE_LEVEL) {
        showMessage(`Max level (${MAX_UPGRADE_LEVEL}) reached for this upgrade!`, 3000);
        return;
    }

    const cost = calculateUpgradeCost(currentLevel);

    if (score >= cost) {
        score -= cost;
        scoreDisplay.textContent = score;
        upgradeLevels[upgradeType]++;

        if (upgradeType === 'baseDamage') {
            PUNCH_DAMAGE = 10 + (upgradeLevels.baseDamage - 1) * DAMAGE_INCREASE_PER_LEVEL;
            showMessage(`Base Damage Upgraded! New damage: ${PUNCH_DAMAGE}`, 3000); 
        } else if (upgradeType === 'lightningDamage') {
            const nextLightningDamage = LIGHTNING_BASE_DAMAGE + (upgradeLevels.lightningDamage -1) * LIGHTNING_DAMAGE_INCREASE_PER_LEVEL;
            showMessage(`Lightning Strike Upgraded! Level: ${upgradeLevels.lightningDamage} (Damage: ~${nextLightningDamage})`, 3000); 
        } else if (upgradeType === 'freezeDamage') {
            const nextInitialFreezeDamage = ICE_BLAST_INITIAL_DAMAGE + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_INITIAL_INCREASE_PER_LEVEL;
            const nextDotFreezeDamage = ICE_BLAST_DOT_DAMAGE_PER_SECOND + (upgradeLevels.freezeDamage - 1) * FREEZE_DAMAGE_DOT_INCREASE_PER_LEVEL;
            showMessage(`Ice Blast Upgraded! Level: ${upgradeLevels.freezeDamage} (Damage: ~${nextInitialFreezeDamage}, DOT: ~${nextDotFreezeDamage}/s)`, 3000); 
        } else if (upgradeType === 'frenzyDamage') {
            const nextFrenzyDamage = FRENZY_INITIAL_DAMAGE + (upgradeLevels.frenzyDamage - 1) * FRENZY_INITIAL_DAMAGE_INCREASE_PER_LEVEL;
            showMessage(`Battle Frenzy Upgraded! Level: ${upgradeLevels.frenzyDamage} (Damage: ~${nextFrenzyDamage})`, 3000); 
        } else if (upgradeType === 'maxHealth') { // NEW: Max player health upgrade
            MAX_PLAYER_HEALTH = PLAYER_HEALTH_BASE_VALUE + (upgradeLevels.maxHealth - 1) * PLAYER_HEALTH_INCREASE_PER_LEVEL;
            playerHealth = MAX_PLAYER_HEALTH; // Heal to new max
            updatePlayerHealthUI();
            showMessage(`Max Health Upgraded! New Max HP: ${MAX_PLAYER_HEALTH}`, 3000);
        }

        updateUpgradeShopUI(); 
        updateSuperpowerButtons(); // Update buttons after purchase (for cooldown)
    } else {
        showMessage("Not enough points!", 3000); 
    }
}


// NEW: Functions to handle skin selection
function showSkinSelectionScreen() {
    startScreen.classList.add('hidden');
    shopButton.classList.add('hidden'); // Hide shop button on skin selection screen
    superpowerButtonsContainer.classList.add('hidden'); // Hide superpower buttons
    ozzyContainer.classList.add('hidden'); // Hide bot
    gameInfoContainer.classList.add('hidden'); // Hide game info
    playerHealthContainer.classList.add('hidden'); // Hide player health bar
    leaderboardScreen.classList.add('hidden'); // Hide leaderboard
    endScreen.classList.add('hidden'); // Hide end screen

    skinSelectionScreen.classList.remove('hidden');
}

function hideSkinSelectionScreen() {
    skinSelectionScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    // Other UI elements will be hidden/shown by resetGame/startGame
}

function selectSkin(skinName) {
    currentSkin = skinName;
    console.log(`Skin selected: ${currentSkin}`);
    // Update image source for ozzyImage immediately after skin selection
    ozzyImage.src = SKIN_IMAGES[currentSkin].normal;
    // Optional: update skin preview in menu, if visible
    // In this simple implementation, the change will be visible after starting the game.
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
    gameOverSound = document.getElementById('game-over-sound'); // NEW: Audio element assignment (moved from above, ensured)
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
    // CHANGE: DOM variables for player health bar (already exist, just for clarity)
    playerHealthContainer = document.getElementById('player-health-container');
    playerHealthDisplay = document.getElementById('player-health-display');
    playerHealthBarBg = document.getElementById('player-health-bar-bg');
    playerHealthBarFill = document.getElementById('player-health-bar-fill');

    // NEW: Assign DOM variables for skin selection
    selectSkinButton = document.getElementById('select-skin-button');
    skinSelectionScreen = document.getElementById('skin-selection-screen');
    selectStonksSkinButton = document.getElementById('select-stonks-skin');
    selectTinuSkinButton = document.getElementById('select-tinu-skin');
    closeSkinSelectionButton = document.getElementById('close-skin-selection-button');

    // NEW: Assign DOM variables for max health upgrade
    maxHealthLevelDisplay = document.getElementById('max-health-level');
    maxHealthCostDisplay = document.getElementById('max-health-cost');
    buyMaxHealthButton = document.getElementById('buy-max-health');

    // NEW: Assign DOM variables for superpower level display on buttons
    btnLightningLvlDisplay = btnLightning.querySelector('.superpower-level-display');
    btnFreezeLvlDisplay = btnFreeze.querySelector('.superpower-level-display');
    btnFrenzyLvlDisplay = btnFrenzy.querySelector('.superpower-level-display');


    // IMPORTANT: Hide the upgrade shop screen immediately upon loading.
    upgradeShopScreen.classList.add('hidden');

    // Ensure all screens are initially hidden
    endScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    ozzyContainer.classList.add('hidden');
    gameInfoContainer.classList.add('hidden'); 
    quoteImagesContainer.innerHTML = ''; 
    skinSelectionScreen.classList.add('hidden'); // Hide skin selection screen on start

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
        showMessage("Leaderboard connection error. Try refreshing the page.", 5000);
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
        playerHealthContainer.classList.add('hidden'); // NEW: Hide player bar when going to leaderboard
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
        playerHealthContainer.classList.add('hidden'); // NEW: Hide player bar when going to leaderboard
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
        clearInterval(playerAttackIntervalId); // NEW: Stop bot attack in shop

        // Stop all canvas effects when going to shop
        cancelAnimationFrame(gameCanvasAnimationFrameId); // CHANGE: Cancel canvas animation
        gameEffectsCanvas.classList.add('hidden'); // CHANGE: Hide canvas
        gameEffectsCanvas.classList.remove('active'); // CHANGE: Remove active class
        // CHANGE: Clear particle arrays so they don't display in the shop
        bossCanvasParticles = [];
        lightningCanvasParticles = [];
        freezeCanvasParticles = [];
        frenzyCanvasParticles = [];
        scratchCanvasParticles = [];
        stonksAttackClawParticles = []; // NEW
        stonksAttackPainParticles = [];   // NEW
        clawMarks = []; // NEW: Clear claw marks
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
        playerHealthContainer.classList.add('hidden'); // NEW: Hide player bar in shop

        upgradeShopScreen.classList.remove('hidden'); 
        updateUpgradeShopUI(); 
    });

    closeShopButton.addEventListener('click', () => {
        upgradeShopScreen.classList.add('hidden'); 

        ozzyContainer.classList.remove('hidden'); 
        superpowerButtonsContainer.classList.remove('hidden'); 
        shopButton.classList.remove('hidden'); 
        gameInfoContainer.classList.remove('hidden'); 
        playerHealthContainer.classList.remove('hidden'); // NEW: Show player bar after leaving shop


        isGameActive = true; 
        isBossMovementPaused = false; 
        if (isBossFight) { 
            animateBossMovement();
        }
        // CHANGE: Ensure canvas animation starts after leaving shop
        gameCanvasAnimationFrameId = requestAnimationFrame(animateGameCanvasEffects);
        gameEffectsCanvas.classList.remove('hidden');
        gameEffectsCanvas.classList.add('active');


        clearInterval(superpowerCooldownIntervalId); 
        superpowerCooldownIntervalId = setInterval(updateSuperpowerCooldownDisplays, 1000);
        updateSuperpowerButtons(); 

        // NEW: Resume bot attack after leaving shop
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
    buyMaxHealthButton.addEventListener('click', () => buyUpgrade('maxHealth')); // NEW: Added button handler for health upgrade

    // NEW: Skin selection button handlers
    selectSkinButton.addEventListener('click', showSkinSelectionScreen);
    selectStonksSkinButton.addEventListener('click', () => selectSkin('stonks'));
    selectTinuSkinButton.addEventListener('click', () => selectSkin('tinu'));
    closeSkinSelectionButton.addEventListener('click', hideSkinSelectionScreen);


    updateUpgradeShopUI();
});
