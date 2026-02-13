// mole.js — Mole entity: movement, pop-up/down, hit state, types

import * as Difficulty from '../systems/difficulty.js';

export const MoleType = {
    NORMAL: 'normal',
    HARDHAT: 'hardhat',
    BOMB: 'bomb',
    GOLDEN: 'golden',
};

export const MoleState = {
    UNDERGROUND: 'underground',
    POPPING_UP: 'popping_up',
    UP: 'up',
    HIT: 'hit',
    RETREATING: 'retreating',
    DEAD: 'dead',
};

import { MOLE_CONFIG, TRAFFIC_CONFIG, GOLDEN_CONFIG, HARD_HAT_CONFIG } from '../config.js';



export class Mole {
    constructor(x, type = MoleType.NORMAL) {
        this.x = x;
        this.setType(type);

        this.state = MoleState.UNDERGROUND;
        this.popOffset = 0;
        this.popTimer = 0;
        this.popDuration = 0;
        this.hitTimer = 0;

        // Dirt disturbance animation
        this.dirtPhase = Math.random() * Math.PI * 2;

        // Independent pop-up scheduling
        this.nextPopTime = Math.random() * 2 + 1; // initial random delay

        // Wobble for pop-up spring effect
        this.wobble = 0;
        this.wobbleVel = 0;

        // Movement Logic (Queuing System)
        // Each mole has its own personality/speed
        this.baseSpeed = MOLE_CONFIG.moveSpeed * (0.8 + Math.random() * 0.4);
        this.currentSpeed = this.baseSpeed;
        this.waitTimer = 0; // For random stops
    }

    setType(type) {
        this.type = type;
        this.hitsRemaining = (type === MoleType.HARDHAT) ? 2 : 1;
    }

    randomizeType() {
        let type = MoleType.NORMAL;
        const roll = Math.random();
        if (roll < Difficulty.getBombChance()) {
            type = MoleType.BOMB;
        } else if (roll < Difficulty.getBombChance() + Difficulty.getHardHatChance()) {
            type = MoleType.HARDHAT;
        }
        this.setType(type);
    }

    reRollSpeed() {
        const variance = TRAFFIC_CONFIG.speedVariance;
        // Randomize speed around base config speed (e.g. +/- 30%)
        const factor = 1.0 - variance + Math.random() * variance * 2;
        this.baseSpeed = MOLE_CONFIG.moveSpeed * factor;
    }

    /** Get the base Y position (fixed single lane in front of character) */
    getBaseY(lawnTop, lawnHeight) {
        // Place vertically centered in the lawn area, well below character
        return lawnTop + lawnHeight * 0.6;
    }

    /** Get the visible Y (accounting for pop-up offset) */
    getVisibleY(lawnTop, lawnHeight) {
        return this.getBaseY(lawnTop, lawnHeight) - this.popOffset;
    }

    update(dt, speedLimit = 9999) {
        // Track previous speed to detect "start moving" event
        const oldSpeed = this.currentSpeed;

        // 1. Determine target speed based on state
        let targetSpeed = this.baseSpeed;

        // Stop if not underground (popping up anchors the mole)
        if (this.state !== MoleState.UNDERGROUND) {
            targetSpeed = 0;
        }

        // Handle random stops
        if (this.waitTimer > 0) {
            this.waitTimer -= dt;
            targetSpeed = 0;
        } else if (this.state === MoleState.UNDERGROUND && targetSpeed > 0) {
            // Chance to stop randomly while moving
            if (Math.random() < 0.005) { // 0.5% chance per frame (~30% per second at 60fps)
                this.waitTimer = 0.5 + Math.random() * 1.5;
            }
        }

        // Apply external speed limit (from traffic queue)
        this.currentSpeed = Math.min(targetSpeed, speedLimit);

        // If we were stopped and just started moving, pick a new speed!
        // "travel at different speeds each time they move"
        if (oldSpeed < 5 && this.currentSpeed > 5) {
            this.reRollSpeed();
            // Apply new speed immediately
            this.currentSpeed = Math.min(this.baseSpeed, speedLimit);
        }

        // Move
        this.x += this.currentSpeed * dt;
        if (this.currentSpeed > 10) { // Only animate dirt if moving significantly
            this.dirtPhase += dt * 8;
        }

        // Count down pop timer if underground
        // Only count down if we are actually moving? 
        // Or if we are waiting?
        // User said: "sometimes just stopping, but not popping up".
        // So waitTimer pauses movement but NOT necessarily pop timer?
        // But if pop timer hits 0, it pops.
        // If it pops, it stops moving.
        // So yes, pop timer should run.
        if (this.state === MoleState.UNDERGROUND) {
            this.nextPopTime -= dt;
        }

        switch (this.state) {
            case MoleState.POPPING_UP:
                this.popOffset += MOLE_CONFIG.popUpSpeed * dt;
                if (this.popOffset >= MOLE_CONFIG.popUpHeight) {
                    this.popOffset = MOLE_CONFIG.popUpHeight;
                    this.state = MoleState.UP;
                    this.popTimer = this.popDuration;
                    this.wobble = 10;
                    this.wobbleVel = -200;
                }
                break;

            case MoleState.UP:
                this.popTimer -= dt;
                // Spring wobble
                this.wobbleVel += -this.wobble * 800 * dt;
                this.wobbleVel *= 0.9;
                this.wobble += this.wobbleVel * dt;

                if (this.popTimer <= 0) {
                    this.state = MoleState.RETREATING;
                }
                break;

            case MoleState.RETREATING:
                this.popOffset -= MOLE_CONFIG.retreatSpeed * dt;
                if (this.popOffset <= 0) {
                    this.popOffset = 0;
                    this.state = MoleState.UNDERGROUND;
                    // Reset pop-up logic
                    this.nextPopTime = Difficulty.getPopUpInterval() * (0.8 + Math.random());
                    this.randomizeType(); // Change type after natural retreat too? Maybe not?
                    // User said "after killing". 
                    // But if it retreats naturally, it just goes underground.
                    // If we want it to reappear as something else, we can randomize here too.
                    // Let's randomize here too for variety.
                    this.randomizeType();
                }
                break;

            case MoleState.HIT:
                this.hitTimer -= dt;
                // Sink down (slower than normal retreat)
                this.popOffset -= MOLE_CONFIG.retreatSpeed * 0.5 * dt;
                if (this.popOffset < 0) this.popOffset = 0;
                if (this.hitTimer <= 0) {
                    // UNDEAD MECHANIC: Recycle!
                    this.state = MoleState.UNDERGROUND;
                    this.randomizeType();
                    // Give it a break before popping again
                    this.nextPopTime = Difficulty.getPopUpInterval() * (1.0 + Math.random());
                }
                break;
        }
    }

    /** Attempt to hit this mole. Returns: 'hit', 'cracked', 'bomb', or 'miss' */
    tryHit() {
        if (this.state !== MoleState.UP && this.state !== MoleState.POPPING_UP) {
            return 'miss';
        }

        if (this.type === MoleType.GOLDEN) {
            this.state = MoleState.HIT;
            this.hitTimer = MOLE_CONFIG.hitDisplayTime;
            return 'golden';
        }

        if (this.type === MoleType.BOMB) {
            this.state = MoleState.HIT;
            this.hitTimer = MOLE_CONFIG.hitDisplayTime;
            return 'bomb';
        }

        this.hitsRemaining--;
        if (this.hitsRemaining <= 0) {
            this.state = MoleState.HIT;
            this.hitTimer = MOLE_CONFIG.hitDisplayTime;
            return 'hit';
        } else {
            // Hard hat cracked - STUN IT!
            this.wobble = 15;
            this.wobbleVel = -300;
            // Logic: keep it up for longer to allow second hit
            this.popTimer = HARD_HAT_CONFIG.recoverTime;
            // Also force state to UP in case it was transitioning?
            this.state = MoleState.UP;
            return 'cracked';
        }
    }

    isPopped() {
        return this.state === MoleState.POPPING_UP || this.state === MoleState.UP;
    }

    isDead() {
        return this.state === MoleState.DEAD;
    }

    isOffScreen(maxX) {
        return this.x > maxX + 60;
    }

    /** Hit box for click detection (when popped) */
    getHitBox(lawnTop, lawnHeight) {
        // Larger hit box for easier tapping (scaled for 1.6x visuals)
        const bx = this.x - 70;
        const by = this.getVisibleY(lawnTop, lawnHeight) - 90;
        return { x: bx, y: by, w: 140, h: 130 };
    }
}
