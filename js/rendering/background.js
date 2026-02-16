// background.js — Sky, lawn, soil layer rendering

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../canvas.js';
import { MOLE_CONFIG, TRAFFIC_CONFIG } from '../config.js';

// Layout constants (exported for other renderers)
export const HORIZON_Y = VIRTUAL_HEIGHT * 0.35;
export const LAWN_TOP = HORIZON_Y;
export const LAWN_HEIGHT = VIRTUAL_HEIGHT * 0.45;
export const LAWN_BOTTOM = LAWN_TOP + LAWN_HEIGHT;
export const SOIL_TOP = LAWN_BOTTOM;
export const SOIL_BOTTOM = VIRTUAL_HEIGHT * 0.88;
export const HUD_TOP = SOIL_BOTTOM;

let trackPhase = 0;

export function updateBackground(dt, isFrozen) {
    if (!isFrozen) {
        // Track speed = fastest possible mole speed
        const maxSpeed = MOLE_CONFIG.moveSpeed * (1 + TRAFFIC_CONFIG.speedVariance);
        trackPhase = (trackPhase + dt * maxSpeed) % 40;
    }
}

export function drawBackground(ctx, level = 'lawn') {
    if (level === 'pub') {
        drawPubBackground(ctx);
    } else if (level === 'rock') {
        drawRockBackground(ctx);
    } else {
        drawLawnBackground(ctx);
    }
}

function drawPubBackground(ctx) {
    // === Dark Pub Atmosphere ===
    ctx.fillStyle = '#1a120b'; // Dark brown wall
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, HORIZON_Y);

    // Wall decor - simple framed pictures
    ctx.fillStyle = '#3c2a21';
    ctx.fillRect(100, 30, 80, 60);
    ctx.fillRect(VIRTUAL_WIDTH - 180, 40, 70, 90);

    // === Bar Counter / Back Area ===
    const counterGrad = ctx.createLinearGradient(0, LAWN_TOP, 0, LAWN_BOTTOM);
    counterGrad.addColorStop(0, '#3c2a21'); // Deep wood
    counterGrad.addColorStop(1, '#251711');
    ctx.fillStyle = counterGrad;
    ctx.fillRect(0, LAWN_TOP, VIRTUAL_WIDTH, LAWN_HEIGHT);

    // Polish reflection on bar surface
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
        const y = LAWN_TOP + (i / 15) * LAWN_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VIRTUAL_WIDTH, y);
        ctx.stroke();
    }

    // === Wooden Floor ===
    const floorGrad = ctx.createLinearGradient(0, SOIL_TOP, 0, SOIL_BOTTOM);
    floorGrad.addColorStop(0, '#543a20');
    floorGrad.addColorStop(1, '#3c2a21');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, SOIL_TOP, VIRTUAL_WIDTH, SOIL_BOTTOM - SOIL_TOP);

    // Floor planks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    for (let x = 0; x < VIRTUAL_WIDTH; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, SOIL_TOP);
        ctx.lineTo(x, SOIL_BOTTOM);
        ctx.stroke();
    }

    // === Conveyor Belt Track (Persistent) ===
    // Position track so barrel bottoms rest on it.
    // Barrel baseY = LAWN_TOP + LAWN_HEIGHT * 0.6, barrel bottom = baseY + 47
    const baseY = LAWN_TOP + LAWN_HEIGHT * 0.6;
    const trackY = baseY + 47; // Top of the track = bottom of barrel
    const trackWidth = VIRTUAL_WIDTH;

    // Main belt track
    ctx.fillStyle = '#222';
    ctx.fillRect(0, trackY, trackWidth, 24);

    // Metal rails
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(trackWidth, trackY);
    ctx.moveTo(0, trackY + 24);
    ctx.lineTo(trackWidth, trackY + 24);
    ctx.stroke();

    // Animated belt tracks / chain
    const spacing = 40;
    // The speed is now managed by the global trackPhase variable, which is updated in updateBackground.

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    for (let x = -spacing; x < trackWidth + spacing; x += spacing) {
        const lx = x + trackPhase;
        ctx.beginPath();
        ctx.moveTo(lx, trackY + 2);
        ctx.lineTo(lx, trackY + 22);
        ctx.stroke();
    }

    // === HUD background ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, HUD_TOP, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - HUD_TOP);
}

function drawRockBackground(ctx) {
    const t = Date.now() * 0.001;

    // === Dark venue backdrop ===
    const bgGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    bgGrad.addColorStop(0, '#0a0012');
    bgGrad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, HORIZON_Y);

    // === Spotlights (sweeping beams from ceiling) ===
    const spotColors = [
        `hsla(${(t * 30) % 360}, 100%, 60%, 0.08)`,
        `hsla(${(t * 30 + 120) % 360}, 100%, 60%, 0.08)`,
        `hsla(${(t * 30 + 240) % 360}, 100%, 60%, 0.06)`,
    ];
    for (let i = 0; i < 3; i++) {
        const angle = Math.sin(t * 0.5 + i * 2.1) * 0.4;
        const baseX = VIRTUAL_WIDTH * (0.2 + i * 0.3);
        ctx.save();
        ctx.translate(baseX, 0);
        ctx.rotate(angle);
        ctx.fillStyle = spotColors[i];
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-120, HORIZON_Y + 100);
        ctx.lineTo(120, HORIZON_Y + 100);
        ctx.lineTo(8, 0);
        ctx.fill();
        ctx.restore();
    }

    // === Speaker stacks (left & right) ===
    for (let side = 0; side <= 1; side++) {
        const sx = side === 0 ? 20 : VIRTUAL_WIDTH - 80;
        // Stack of 3 speakers
        for (let row = 0; row < 3; row++) {
            const sy = HORIZON_Y - 110 + row * 40;
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(sx, sy, 60, 36);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx, sy, 60, 36);
            // Speaker cone
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(sx + 30, sy + 18, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(sx + 30, sy + 18, 12, 0, Math.PI * 2);
            ctx.stroke();
            // Center cap
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(sx + 30, sy + 18, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === Crowd silhouette (bottom of backdrop) ===
    ctx.fillStyle = '#0d0d1a';
    ctx.beginPath();
    ctx.moveTo(0, HORIZON_Y);
    for (let cx = 0; cx < VIRTUAL_WIDTH; cx += 18) {
        const headH = 10 + Math.sin(cx * 0.15 + t * 2) * 4 + Math.sin(cx * 0.07) * 6;
        ctx.lineTo(cx, HORIZON_Y - headH);
        ctx.lineTo(cx + 9, HORIZON_Y - headH - 5 - Math.sin(cx * 0.1 + t * 3) * 3);
        ctx.lineTo(cx + 18, HORIZON_Y - headH);
    }
    ctx.lineTo(VIRTUAL_WIDTH, HORIZON_Y);
    ctx.fill();

    // Raised hands in crowd
    ctx.strokeStyle = 'rgba(30, 20, 50, 0.8)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const hx = 80 + i * 150 + Math.sin(i * 4.3) * 30;
        const bounceY = Math.sin(t * 3 + i * 1.7) * 5;
        ctx.beginPath();
        ctx.moveTo(hx, HORIZON_Y - 5);
        ctx.lineTo(hx + 3, HORIZON_Y - 25 + bounceY);
        ctx.stroke();
    }

    // === Stage floor ===
    const stageGrad = ctx.createLinearGradient(0, LAWN_TOP, 0, LAWN_BOTTOM);
    stageGrad.addColorStop(0, '#1a1a1a');
    stageGrad.addColorStop(1, '#111');
    ctx.fillStyle = stageGrad;
    ctx.fillRect(0, LAWN_TOP, VIRTUAL_WIDTH, LAWN_HEIGHT);

    // Stage floor grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < VIRTUAL_WIDTH; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, LAWN_TOP);
        ctx.lineTo(x, LAWN_BOTTOM);
        ctx.stroke();
    }
    for (let y = LAWN_TOP; y < LAWN_BOTTOM; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VIRTUAL_WIDTH, y);
        ctx.stroke();
    }

    // Stage front edge (light strip)
    ctx.strokeStyle = `hsla(${(t * 40) % 360}, 80%, 60%, 0.4)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, LAWN_BOTTOM);
    ctx.lineTo(VIRTUAL_WIDTH, LAWN_BOTTOM);
    ctx.stroke();

    // === Below stage (pit area) ===
    const pitGrad = ctx.createLinearGradient(0, SOIL_TOP, 0, SOIL_BOTTOM);
    pitGrad.addColorStop(0, '#0d0d0d');
    pitGrad.addColorStop(1, '#050505');
    ctx.fillStyle = pitGrad;
    ctx.fillRect(0, SOIL_TOP, VIRTUAL_WIDTH, SOIL_BOTTOM - SOIL_TOP);

    // === HUD background ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, HUD_TOP, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - HUD_TOP);
}

function drawLawnBackground(ctx) {
    // === Sky Gradient ===
    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(0.6, '#B8E4F9');
    skyGrad.addColorStop(1, '#E0F4FD');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, HORIZON_Y);

    // === Distant hills ===
    drawHills(ctx);

    // === Sun ===
    ctx.fillStyle = '#FFF59D';
    ctx.shadowColor = '#FFE082';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(VIRTUAL_WIDTH - 120, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // === Lawn ===
    const lawnGrad = ctx.createLinearGradient(0, LAWN_TOP, 0, LAWN_BOTTOM);
    lawnGrad.addColorStop(0, '#66BB6A');
    lawnGrad.addColorStop(0.3, '#4CAF50');
    lawnGrad.addColorStop(1, '#388E3C');
    ctx.fillStyle = lawnGrad;
    ctx.fillRect(0, LAWN_TOP, VIRTUAL_WIDTH, LAWN_HEIGHT);

    // Grass texture lines
    ctx.strokeStyle = 'rgba(46, 125, 50, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
        const gx = (i / 60) * VIRTUAL_WIDTH + Math.sin(i * 7) * 10;
        const gy = LAWN_TOP + Math.random() * LAWN_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - 3, gy - 8 - Math.random() * 6);
        ctx.stroke();
    }

    // === Soil layer ===
    const soilGrad = ctx.createLinearGradient(0, SOIL_TOP, 0, SOIL_BOTTOM);
    soilGrad.addColorStop(0, '#5D4037');
    soilGrad.addColorStop(0.4, '#4E342E');
    soilGrad.addColorStop(1, '#3E2723');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, SOIL_TOP, VIRTUAL_WIDTH, SOIL_BOTTOM - SOIL_TOP);

    // Soil/lawn border
    ctx.strokeStyle = '#33691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, LAWN_BOTTOM);
    ctx.lineTo(VIRTUAL_WIDTH, LAWN_BOTTOM);
    ctx.stroke();

    // === HUD background ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, HUD_TOP, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - HUD_TOP);
}

function drawHills(ctx) {
    // Back hills
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.moveTo(0, HORIZON_Y);
    for (let x = 0; x <= VIRTUAL_WIDTH; x += 40) {
        const y = HORIZON_Y - 15 - Math.sin(x * 0.005) * 25 - Math.sin(x * 0.012) * 10;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(VIRTUAL_WIDTH, HORIZON_Y);
    ctx.closePath();
    ctx.fill();

    // Front hills
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.moveTo(0, HORIZON_Y);
    for (let x = 0; x <= VIRTUAL_WIDTH; x += 40) {
        const y = HORIZON_Y - 5 - Math.sin(x * 0.008 + 1) * 15 - Math.sin(x * 0.02) * 8;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(VIRTUAL_WIDTH, HORIZON_Y);
    ctx.closePath();
    ctx.fill();

    // Trees
    for (let i = 0; i < 6; i++) {
        const tx = 80 + i * 210 + Math.sin(i * 3.7) * 40;
        const ty = HORIZON_Y - 18 - Math.sin(tx * 0.005) * 20;
        drawTree(ctx, tx, ty, 12 + Math.sin(i * 2.3) * 4);
    }
}

function drawTree(ctx, x, y, size) {
    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - 2, y, 4, size * 0.7);

    // Canopy
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.2, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
}
