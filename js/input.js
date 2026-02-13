// input.js — Unified click/touch handling with hit detection

import { screenToGame } from './canvas.js';

let onClick = null;
let inputEnabled = true;

export function initInput(canvas) {
    // Mouse
    canvas.addEventListener('click', handleEvent);
    // Touch (prevent double-fire)
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            handleEvent(touch);
        }
    });
}

function handleEvent(e) {
    if (!inputEnabled || !onClick) return;

    const clientX = e.clientX ?? e.pageX;
    const clientY = e.clientY ?? e.pageY;
    const pos = screenToGame(clientX, clientY);
    onClick(pos.x, pos.y);
}

export function setClickHandler(handler) {
    onClick = handler;
}

export function setInputEnabled(enabled) {
    inputEnabled = enabled;
}

export function isInputEnabled() {
    return inputEnabled;
}
