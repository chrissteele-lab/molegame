// character.js — Player character: position, jump, swing, stun

import { VIRTUAL_WIDTH } from '../canvas.js';

const JUMP_SPEED = 3600; // pixels per second horizontal
const SWING_DURATION = 0.25; // seconds
const STUN_DURATION = 2.0;

let x = VIRTUAL_WIDTH / 2;
let targetX = x;
let jumping = false;
let swinging = false;
let swingTimer = 0;
let swingDirection = 1; // 1 = right, -1 = left
let stunned = false;
let stunTimer = 0;
let idleTimer = 0;

// Callbacks
let onSwingHit = null;
let pendingTarget = null; // the mole being targeted

export function initCharacter() {
    x = VIRTUAL_WIDTH / 2;
    targetX = x;
    jumping = false;
    swinging = false;
    swingTimer = 0;
    stunned = false;
    stunTimer = 0;
    idleTimer = 0;
    onSwingHit = null;
    pendingTarget = null;
}

export function update(dt) {
    idleTimer += dt;

    // Stun
    if (stunned) {
        stunTimer -= dt;
        if (stunTimer <= 0) {
            stunned = false;
        }
        return; // no movement while stunned
    }

    // Jumping toward target
    if (jumping) {
        const dist = targetX - x;
        const dir = Math.sign(dist);
        const step = JUMP_SPEED * dt;

        if (Math.abs(dist) <= step) {
            x = targetX;
            jumping = false;
            // Start swing
            swinging = true;
            swingTimer = SWING_DURATION;
            swingDirection = dir || 1;
        } else {
            x += dir * step;
        }
    }

    // Swinging
    if (swinging) {
        swingTimer -= dt;
        if (swingTimer <= SWING_DURATION * 0.5 && onSwingHit) {
            // Hit frame — trigger callback (midway through swing)
            onSwingHit();
            onSwingHit = null;
        }
        if (swingTimer <= 0) {
            swinging = false;
        }
    }
}

/**
 * Jump to target X and swing. Callback fires at the hit frame.
 */
export function jumpAndSwing(tx, hitCallback) {
    if (stunned) return;
    targetX = Math.max(60, Math.min(VIRTUAL_WIDTH - 60, tx));
    jumping = true;
    swinging = false;
    onSwingHit = hitCallback;
    idleTimer = 0;
}

export function applyStun() {
    stunned = true;
    stunTimer = STUN_DURATION;
    jumping = false;
    swinging = false;
    onSwingHit = null;
}

export function getX() { return x; }
export function isJumping() { return jumping; }
export function isSwinging() { return swinging; }
export function getSwingProgress() {
    return swinging ? 1 - (swingTimer / SWING_DURATION) : 0;
}
export function getSwingDirection() { return swingDirection; }
export function isStunned() { return stunned; }
export function getStunProgress() {
    return stunned ? 1 - (stunTimer / STUN_DURATION) : 0;
}
export function getIdleTimer() { return idleTimer; }
