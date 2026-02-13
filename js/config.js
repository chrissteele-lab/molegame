/**
 * config.js — Game Configuration
 *
 * This file contains all the crucial variables for modifying the game's behavior,
 * difficulty, and visual timing. Modify values here to tune the game.
 */

// === VISUAL & PHYSICS ===
export const MOLE_CONFIG = {
    // Movement speed of the moles (conveyor belt) from left to right
    // Unit: pixels per second
    moveSpeed: 120,

    // How fast the mole rises from the hole (pixels per second)
    popUpSpeed: 400,

    // The maximum height the mole reaches above the hole (pixels)
    popUpHeight: 10,

    // How fast the mole retreats back into the hole (pixels per second)
    retreatSpeed: 1000,

    // Time to show the "hit" animation/stars before the mole recycles (seconds)
    hitDisplayTime: 0.4,

    // Visual scale factor for the mole (1.0 = normal, 1.6 = larger)
    visualScale: 1.6,

    // If true, ALL moles stop moving when ANY mole pops up.
    // If false, moles keep moving (conveyor belt never stops).
    stopOnPop: false,
};

// === GAMEPLAY & DIFFICULTY ===
// Each parameter has a 'start' value (at 0s) and 'end' value (at rampTime seconds).
// The game smoothly interpolates between these values as time passes.
// 'rampTime' is in seconds.
export const DIFFICULTY_CURVE = {
    // How long a mole stays up before retreating naturally (seconds)
    // Controls how much time the player has to react.
    popUpDuration: { start: 2.5, end: 1.0, rampTime: 60 },

    // Maximum number of moles allowed to be up at once (starts at 1, ramps to 3)
    // Capped at 3 to prevent the screen from being totally blocked.
    maxSimultaneous: { start: 3, end: 3, rampTime: 60 },

    // Chance that a newly spawned mole is a Bomb (0.0 to 1.0)
    bombChance: { start: 0.2, end: 0.3, rampTime: 60 },

    // Chance that a newly spawned mole is a Hard Hat (requires 2 hits)
    hardHatChance: { start: 0.1, end: 0.40, rampTime: 60 },

    // Time between checking for new mole spawns (seconds)
    // Controls how consistently the conveyor belt is filled.
    spawnInterval: { start: 1.2, end: 0.6, rampTime: 60 },

    // Time a mole waits underground before attempting to pop up again (seconds)
    // Increasing this creates more gaps in the action, allowing movement.
    popUpInterval: { start: 2.0, end: 1, rampTime: 60 },
};

export const PAUSE_CONFIG = {
    // Minimum number of moles to spawn before a pause is possible
    minMolesBeforePause: 8,
    // Maximum number of moles to spawn before a pause is forced
    maxMolesBeforePause: 15,
    // How long the pause lasts (in seconds)
    pauseDuration: { min: 2.0, max: 4.0 },
};

export const TRAFFIC_CONFIG = {
    // Minimum distance between moles (pixels) before a hard stop
    // Reduced to allow tighter queuing as requested
    minSafeDist: 90,

    // Distance where they start matching speed to maintain flow
    followDist: 150,

    // How much speed varies each time a mole starts moving (0.0 to 1.0)
    speedVariance: 0.3,
};

export const GOLDEN_CONFIG = {
    spawnInterval: 30, // seconds
    bonusTime: 5,      // seconds added to timer
    score: 0,          // Does it give score? Maybe just time. Let's say 0 points, purely time bonus.
    // Visuals handled in renderer
};

export const HARD_HAT_CONFIG = {
    // How long the hard hat stays "cracked"/stunned before recovering (seconds)
    recoverTime: 2.5,
};

// === SETUP ===
export const GAME_SETUP = {
    // Number of moles to spawn at the start of the game
    initialMoles: 6,
};
