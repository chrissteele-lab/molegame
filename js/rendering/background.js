// background.js — Sky, lawn, soil layer rendering

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../canvas.js';

// Layout constants (exported for other renderers)
export const HORIZON_Y = VIRTUAL_HEIGHT * 0.35;
export const LAWN_TOP = HORIZON_Y;
export const LAWN_HEIGHT = VIRTUAL_HEIGHT * 0.45;
export const LAWN_BOTTOM = LAWN_TOP + LAWN_HEIGHT;
export const SOIL_TOP = LAWN_BOTTOM;
export const SOIL_BOTTOM = VIRTUAL_HEIGHT * 0.88;
export const HUD_TOP = SOIL_BOTTOM;

export function drawBackground(ctx, level = 'lawn') {
    if (level === 'pub') {
        drawPubBackground(ctx);
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

    // === HUD background ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
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
