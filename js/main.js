// main.js — Game loop, state machine, wires everything together

import { initCanvas, getCtx, getCanvas, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './canvas.js';
import { initInput, setClickHandler, setInputEnabled } from './input.js';
import * as MoleManager from './entities/moleManager.js';
import * as Character from './entities/character.js';
import * as Scoring from './systems/scoring.js';
import * as Difficulty from './systems/difficulty.js';
import { initPhoto, skipPhoto, getFaceImage } from './systems/photo.js';
import { drawBackground, updateBackground, LAWN_TOP, LAWN_HEIGHT } from './rendering/background.js';
import { drawHoles, drawActiveMoles } from './rendering/moleRenderer.js';
import { drawCharacter } from './rendering/characterRenderer.js';
import { drawHUD, drawStunOverlay, initUI, updateUI, addBonusPopup, addScorePopup } from './rendering/ui.js';
import { GOLDEN_CONFIG } from './config.js';

// Game states
const State = {
    TITLE: 'title',
    PHOTO: 'photo',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
};

let state = State.TITLE;
let lastTime = 0;
let selectedLevel = 'lawn';

// Screen shake
let shakeIntensity = 0;
let shakeTimer = 0;

// DOM elements
const titleScreen = document.getElementById('title-screen');
const photoScreen = document.getElementById('photo-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const btnStart = document.getElementById('btn-start');
const btnSkipPhoto = document.getElementById('btn-skip-photo');
const btnPlay = document.getElementById('btn-play');
const btnRetry = document.getElementById('btn-retry');
const btnMenu = document.getElementById('btn-menu');
const finalScore = document.getElementById('final-score');
const finalHiScore = document.getElementById('final-hiscore');

// === Initialization ===
// === Initialization ===
function init() {
    const { canvas } = initCanvas();
    initInput(canvas);
    initPhoto();

    // Button handlers
    const startBtn = document.getElementById('btn-start');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            setState(State.PHOTO);
        });
    }

    // Photo screen buttons
    const skipBtn = document.getElementById('btn-skip-photo');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            skipPhoto();
            startGame();
        });
    }

    const playBtn = document.getElementById('btn-play');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            startGame();
        });
    }

    const retryBtn = document.getElementById('btn-retry');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            startGame();
        });
    }

    const menuBtn = document.getElementById('btn-menu');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            setState(State.TITLE);
        });
    }

    // Level selection buttons
    const lawnBtn = document.getElementById('btn-level-lawn');
    const pubBtn = document.getElementById('btn-level-pub');
    const rockBtn = document.getElementById('btn-level-rock');
    const levelBtns = [lawnBtn, pubBtn, rockBtn].filter(Boolean);

    function selectLevel(level, btn) {
        selectedLevel = level;
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (lawnBtn) lawnBtn.addEventListener('click', () => selectLevel('lawn', lawnBtn));
    if (pubBtn) pubBtn.addEventListener('click', () => selectLevel('pub', pubBtn));
    if (rockBtn) rockBtn.addEventListener('click', () => selectLevel('rock', rockBtn));

    // Click handler for gameplay
    setClickHandler((x, y) => {
        if (state !== State.PLAYING) return;
        handleGameClick(x, y);
    });

    // Start loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function setState(newState) {
    state = newState;
    titleScreen.classList.toggle('hidden', state !== State.TITLE);
    photoScreen.classList.toggle('hidden', state !== State.PHOTO);
    gameoverScreen.classList.toggle('hidden', state !== State.GAME_OVER);
}

function startGame() {
    Scoring.initScoring();
    Difficulty.initDifficulty();
    MoleManager.initMoleManager();
    Character.initCharacter();
    initUI();
    setInputEnabled(true);
    setState(State.PLAYING);
}

// === Game Loop ===
function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // cap at 100ms
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (state !== State.PLAYING) return;

    // Update systems
    Difficulty.tickDifficulty(dt);
    Scoring.tick(dt);
    MoleManager.update(dt);
    updateBackground(dt, MoleManager.isFrozen());
    Character.update(dt);
    updateUI(dt);

    // Screen shake decay
    if (shakeTimer > 0) {
        shakeTimer -= dt;
        if (shakeTimer <= 0) shakeIntensity = 0;
    }

    // Enable/disable input based on stun
    setInputEnabled(!Character.isStunned());

    // Check game over
    if (Scoring.isTimeUp()) {
        endGame();
    }
}

function render() {
    const ctx = getCtx();

    ctx.save();

    // Screen shake
    if (shakeIntensity > 0) {
        const sx = (Math.random() - 0.5) * shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(sx, sy);
    }

    // Clear
    ctx.clearRect(-10, -10, VIRTUAL_WIDTH + 20, VIRTUAL_HEIGHT + 20);

    // Draw layers
    drawBackground(ctx, selectedLevel);
    drawHoles(ctx, MoleManager.getMoles(), selectedLevel);
    drawCharacter(ctx, selectedLevel);
    drawActiveMoles(ctx, MoleManager.getMoles(), selectedLevel);
    drawHUD(ctx);
    drawStunOverlay(ctx);

    ctx.restore();
}

// === Game Logic ===
function handleGameClick(x, y) {
    if (Character.isStunned()) return;

    const mole = MoleManager.getMoleAt(x, y, LAWN_TOP, LAWN_HEIGHT);
    if (!mole) return;

    const moleX = mole.x;

    // Jump character to mole and swing
    Character.jumpAndSwing(moleX, () => {
        // This fires at the hit frame
        const result = mole.tryHit();

        switch (result) {
            case 'hit':
                const points = mole.type === 'hardhat' ? 2 : 1;
                Scoring.addScore(points);
                Scoring.addTime(1);
                addBonusPopup();
                addScorePopup(points, mole.x, mole.getVisibleY(LAWN_TOP, LAWN_HEIGHT) - 40);
                triggerShake(4, 0.15);
                break;

            case 'cracked':
                triggerShake(2, 0.1);
                addScorePopup('CRACK!', mole.x, mole.getVisibleY(LAWN_TOP, LAWN_HEIGHT) - 40);
                break;

            case 'bomb':
                Character.applyStun();
                triggerShake(10, 0.4);
                break;

            case 'golden':
                Scoring.addTime(GOLDEN_CONFIG.bonusTime);
                addScorePopup(`+${GOLDEN_CONFIG.bonusTime}s!`, mole.x, mole.getVisibleY(LAWN_TOP, LAWN_HEIGHT) - 40);
                triggerShake(6, 0.2);
                break;
        }
    });
}

function triggerShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
}

function endGame() {
    state = State.GAME_OVER;
    const { score, hiScore } = Scoring.finalizeScore();
    finalScore.textContent = String(score);
    finalHiScore.textContent = String(hiScore);
    setState(State.GAME_OVER);
}

export function getSelectedLevel() { return selectedLevel; }

// === Boot ===
init();
