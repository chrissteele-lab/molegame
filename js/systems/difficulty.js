import { DIFFICULTY_CURVE } from '../config.js';

// difficulty.js — Difficulty curve based on elapsed game time

let elapsed = 0;

const CURVE = DIFFICULTY_CURVE;

export function initDifficulty() {
    elapsed = 0;
}

export function tickDifficulty(dt) {
    elapsed += dt;
}

function lerp(a, b, t) {
    return a + (b - a) * Math.min(t, 1);
}

function getParam(key) {
    const c = CURVE[key];
    const t = elapsed / c.rampTime;
    return lerp(c.start, c.end, t);
}

export function getPopUpDuration() { return getParam('popUpDuration'); }
export function getMaxSimultaneous() { return Math.floor(getParam('maxSimultaneous')); }
export function getBombChance() { return getParam('bombChance'); }
export function getHardHatChance() { return getParam('hardHatChance'); }
export function getSpawnInterval() { return getParam('spawnInterval'); }
export function getPopUpInterval() { return getParam('popUpInterval'); }
export function getElapsed() { return elapsed; }
