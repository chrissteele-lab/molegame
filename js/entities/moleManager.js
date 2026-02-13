// moleManager.js — Spawning, lifecycle, pop-up freeze, difficulty integration

import { Mole, MoleType, MoleState } from './mole.js';
import * as Difficulty from '../systems/difficulty.js';
import { VIRTUAL_WIDTH } from '../canvas.js';
import { MOLE_CONFIG, GAME_SETUP, PAUSE_CONFIG, TRAFFIC_CONFIG, GOLDEN_CONFIG } from '../config.js';

let moles = [];
let spawnTimer = 0;
let popUpTimer = 0;

// Pause mechanics
let molesSpawnedSincePause = 0;
let molesToNextPause = 12; // Initial random target
let isPaused = false;
let pauseTimer = 0;
let timeSinceGolden = 0;

export function initMoleManager() {
    moles = [];
    spawnTimer = 0;
    popUpTimer = 2.0;

    // Reset pause state
    molesSpawnedSincePause = 0;
    isPaused = false;
    pauseTimer = 0;
    timeSinceGolden = 0;
    scheduleNextPause();

    // Spawn initial batch
    for (let i = 0; i < GAME_SETUP.initialMoles; i++) {
        spawnMole(-VIRTUAL_WIDTH * 0.1 + i * 220);
    }
}

function spawnMole(x = -40) {
    // Single lane, no lane selection needed

    // Determine type
    let type = MoleType.NORMAL;

    // Check for Golden Mole spawn
    // Force spawn if timer exceeded interval
    if (timeSinceGolden >= GOLDEN_CONFIG.spawnInterval) {
        type = MoleType.GOLDEN;
        timeSinceGolden = 0; // Reset timer
    } else {
        // Standard random spawn
        const roll = Math.random();
        if (roll < Difficulty.getBombChance()) {
            type = MoleType.BOMB;
        } else if (roll < Difficulty.getBombChance() + Difficulty.getHardHatChance()) {
            type = MoleType.HARDHAT;
        }
    }

    const mole = new Mole(x, type);
    moles.push(mole);
}

export function update(dt) {
    // Timer for Golden Moles
    timeSinceGolden += dt;

    // 1. Check for Global Freeze (stopOnPop config)
    let globalFreeze = false;
    if (MOLE_CONFIG.stopOnPop && moles.some(m => m.isPopped())) {
        globalFreeze = true;
    }

    const activePops = moles.filter(m => m.isPopped()).length;
    const maxPops = Difficulty.getMaxSimultaneous();

    // 2. Traffic Flow / Collision Avoidance
    // Sort logic: Moles move Left -> Right (x increases).
    // The "Leader" is the rightmost mole (highest x).
    // We should process Leader first, so followers can adapt to leader's speed.
    moles.sort((a, b) => b.x - a.x);

    for (let i = 0; i < moles.length; i++) {
        const mole = moles[i];
        let speedLimit = 9999;

        if (globalFreeze) {
            speedLimit = 0;
        } else if (i > 0) {
            // Not the leader. Check distance to mole ahead (i-1).
            const leader = moles[i - 1];
            // Calculate center-to-center distance
            const dist = leader.x - mole.x;

            if (dist < TRAFFIC_CONFIG.minSafeDist) {
                // Too close! Panic brake!
                speedLimit = 0;
            } else if (dist < TRAFFIC_CONFIG.followDist) {
                // Getting close, match leader's speed to maintain gap
                speedLimit = leader.currentSpeed;
            }
        }

        // Apply movement & state updates
        mole.update(dt, speedLimit);

        // Independent pop logic
        if (mole.state === MoleState.UNDERGROUND && mole.nextPopTime <= 0) {
            if (activePops < maxPops) {
                // Pop this mole!
                mole.state = MoleState.POPPING_UP;
                mole.popDuration = Difficulty.getPopUpDuration() * (0.8 + Math.random() * 0.4);

                // Reset timer for next pop (randomized)
                mole.nextPopTime = Difficulty.getPopUpInterval() * (0.5 + Math.random() * 1.5);
            } else {
                // Can't pop yet (cap reached), retry soon
                mole.nextPopTime = 0.5 + Math.random() * 0.5;
            }
        }
    }

    // Remove dead or off-screen moles
    moles = moles.filter(m => !m.isDead() && !m.isOffScreen(VIRTUAL_WIDTH));

    // Spawn new moles from the left
    // If frozen, we shouldn't spawn (conveyor belt stopped)
    if (!globalFreeze && moles.length < GAME_SETUP.initialMoles) {

        if (isPaused) {
            pauseTimer -= dt;
            if (pauseTimer <= 0) {
                isPaused = false;
                molesSpawnedSincePause = 0;
                scheduleNextPause();
                // Immediately spawn one to break the silence?
                // Or just let natural timer take over.
                // Let's set spawnTimer to 0 to spawn immediately.
                spawnTimer = 0;
            }
        } else {
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnMole();
                molesSpawnedSincePause++;

                // Check if we should trigger a pause
                if (molesSpawnedSincePause >= molesToNextPause) {
                    isPaused = true;
                    pauseTimer = PAUSE_CONFIG.pauseDuration.min + Math.random() * (PAUSE_CONFIG.pauseDuration.max - PAUSE_CONFIG.pauseDuration.min);
                }

                spawnTimer = Difficulty.getSpawnInterval() * (0.7 + Math.random() * 0.6);
            }
        }
    }
}

function scheduleNextPause() {
    molesToNextPause = Math.floor(
        PAUSE_CONFIG.minMolesBeforePause +
        Math.random() * (PAUSE_CONFIG.maxMolesBeforePause - PAUSE_CONFIG.minMolesBeforePause + 1)
    );
}

// Helper functions

/** Find the mole at the given game coordinates (if any is popped up) */
export function getMoleAt(x, y, lawnTop, lawnHeight) {
    // Check in reverse order so topmost (closest lane) moles are hit first
    for (let i = moles.length - 1; i >= 0; i--) {
        const m = moles[i];
        if (!m.isPopped()) continue;
        const hb = m.getHitBox(lawnTop, lawnHeight);
        if (x >= hb.x && x <= hb.x + hb.w && y >= hb.y && y <= hb.y + hb.h) {
            return m;
        }
    }
    return null;
}

export function getMoles() { return moles; }

