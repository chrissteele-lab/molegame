// canvas.js — Responsive canvas setup with virtual resolution

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

let canvas, ctx;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

export function initCanvas() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return { canvas, ctx };
}

export function resize() {
    const container = document.getElementById('game-container');
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Scale to fit while maintaining aspect ratio
    scale = Math.min(cw / VIRTUAL_WIDTH, ch / VIRTUAL_HEIGHT);
    const displayW = Math.floor(VIRTUAL_WIDTH * scale);
    const displayH = Math.floor(VIRTUAL_HEIGHT * scale);

    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';

    offsetX = (cw - displayW) / 2;
    offsetY = (ch - displayH) / 2;
    canvas.style.marginLeft = offsetX + 'px';
    canvas.style.marginTop = offsetY + 'px';
}

/** Convert screen pixel coords to virtual game coords */
export function screenToGame(screenX, screenY) {
    const rect = canvas.getBoundingClientRect();
    const x = (screenX - rect.left) / scale;
    const y = (screenY - rect.top) / scale;
    return { x, y };
}

export function getCtx() { return ctx; }
export function getCanvas() { return canvas; }
export { VIRTUAL_WIDTH, VIRTUAL_HEIGHT };
