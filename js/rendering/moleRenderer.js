// moleRenderer.js — Draw moles, dirt disturbance, pop-up animation

import { MoleState, MoleType } from '../entities/mole.js';
import { LAWN_TOP, LAWN_HEIGHT, LAWN_BOTTOM } from './background.js';
import { MOLE_CONFIG } from '../config.js';




// -- Layer 1: Holes & Dirt (Background) --
export function drawHoles(ctx, moles) {
    for (const mole of moles) {
        const baseY = mole.getBaseY(LAWN_TOP, LAWN_HEIGHT);
        const x = mole.x;

        if (mole.state === MoleState.UNDERGROUND) {
            drawDirtDisturbance(ctx, x, baseY, mole.dirtPhase);
        } else {
            drawHole(ctx, x, baseY);
        }
    }
}

// -- Layer 2: Active Moles (Foreground) --
export function drawActiveMoles(ctx, moles) {
    for (const mole of moles) {
        if (mole.state === MoleState.UNDERGROUND) continue;

        const baseY = mole.getBaseY(LAWN_TOP, LAWN_HEIGHT);
        const visY = mole.getVisibleY(LAWN_TOP, LAWN_HEIGHT);
        const x = mole.x;

        // Clip above ground line (mole emerges from ground)
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 50, 0, 100, baseY);
        ctx.clip();

        // Draw the mole body
        drawMoleBody(ctx, x, visY, mole);

        ctx.restore();

        // Draw dirt ring on top of the hole (covers mole's bottom)
        drawDirtRing(ctx, x, baseY);
    }
}

function drawDirtDisturbance(ctx, x, y, phase) {
    // Moving dirt mound
    const moundHeight = 6 + Math.sin(phase) * 3;

    // Main mound
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(x, y - moundHeight / 2, 22, moundHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dirt surface
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(x, y - moundHeight / 2 - 2, 18, moundHeight - 2, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Scattered dirt particles
    ctx.fillStyle = '#8D6E63';
    for (let i = 0; i < 4; i++) {
        const px = x + Math.sin(phase + i * 2.5) * 15;
        const py = y - moundHeight + Math.cos(phase + i * 1.7) * 4 - 3;
        const pr = 2 + Math.sin(phase + i) * 1;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
    }

    // Grass displacement lines
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(x + i * 20, y);
        ctx.lineTo(x + i * 25, y - 5 - Math.sin(phase + i) * 2);
        ctx.stroke();
    }
}

function drawHole(ctx, x, y) {
    // Dark hole
    ctx.fillStyle = '#2E1B0E';
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawDirtRing(ctx, x, y) {
    // Raised dirt ring around hole
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, 30, 11, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Small dirt lumps
    ctx.fillStyle = '#6D4C41';
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const lx = x + Math.cos(angle) * 28;
        const ly = y + Math.sin(angle) * 10;
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawMoleBody(ctx, x, y, mole) {
    const wobble = mole.wobble || 0;

    ctx.save();
    ctx.translate(x + wobble, y);

    // Scale on hit
    let scale = MOLE_CONFIG.visualScale;
    if (mole.state === MoleState.HIT) {
        // Squash effect
        const t = mole.hitTimer / MOLE_CONFIG.hitDisplayTime;
        scale = MOLE_CONFIG.visualScale * (0.5 + t * 0.5);
    }
    ctx.scale(scale, scale);

    if (mole.type === MoleType.BOMB) {
        drawBomb(ctx);
    } else {
        drawMoleCharacter(ctx, mole);
    }

    ctx.restore();
}

function drawMoleCharacter(ctx, mole) {
    let bodyColor = '#6D4C41';
    let bellyColor = '#A1887F';
    let noseColor = '#F48FB1';

    if (mole.type === MoleType.GOLDEN) {
        bodyColor = '#FFD700'; // Gold
        bellyColor = '#FFF9C4'; // Light Yellow
        noseColor = '#E91E63'; // Ruby Nose
    }

    // Body (oval)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -10, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, -2, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = noseColor;
    ctx.beginPath();
    ctx.ellipse(0, -16, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (squinty)
    ctx.fillStyle = '#212121';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#212121';

    // Left eye
    ctx.beginPath();
    ctx.moveTo(-10, -22);
    ctx.quadraticCurveTo(-7, -26, -4, -22);
    ctx.stroke();

    // Right eye
    ctx.beginPath();
    ctx.moveTo(4, -22);
    ctx.quadraticCurveTo(7, -26, 10, -22);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(side * 8, -14 + i * 3);
            ctx.lineTo(side * 24, -18 + i * 4);
            ctx.stroke();
        }
    }

    // Paws (reaching up when popped)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(-16, 8, 7, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(16, 8, 7, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Claws
    ctx.strokeStyle = '#FFF9C4';
    ctx.lineWidth = 1.5;
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
            const cx = side * 16 + (i - 1) * 3 * side;
            ctx.beginPath();
            ctx.moveTo(cx, 12);
            ctx.lineTo(cx + side, 16);
            ctx.stroke();
        }
    }

    // Hard hat (if applicable)
    if (mole.type === MoleType.HARDHAT) {
        drawHardHat(ctx, mole.hitsRemaining < 2);
    }

    // Golden Sparkles
    if (mole.type === MoleType.GOLDEN && mole.state !== MoleState.HIT) {
        drawSparkles(ctx);
    }

    // Stars on hit
    if (mole.state === MoleState.HIT && mole.type !== MoleType.BOMB) {
        drawStars(ctx, mole.hitTimer);
    }
}

function drawSparkles(ctx) {
    const t = Date.now() * 0.005;
    ctx.fillStyle = '#FFFDE7';
    for (let i = 0; i < 3; i++) {
        const angle = t + (i * Math.PI * 2 / 3);
        const r = 28 + Math.sin(t * 3 + i) * 4;
        const sx = Math.cos(angle) * r;
        const sy = -20 + Math.sin(angle) * r;

        ctx.globalAlpha = 0.6 + Math.sin(t * 5 + i) * 0.4;
        ctx.beginPath();
        // 4-point star shape
        ctx.moveTo(sx, sy - 4);
        ctx.lineTo(sx + 2, sy);
        ctx.lineTo(sx, sy + 4);
        ctx.lineTo(sx - 2, sy);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawHardHat(ctx, cracked) {
    // Hat
    ctx.fillStyle = cracked ? '#FFA000' : '#FFC107';
    ctx.beginPath();
    ctx.ellipse(0, -34, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hat dome
    ctx.beginPath();
    ctx.ellipse(0, -38, 15, 10, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Hat brim
    ctx.fillStyle = cracked ? '#FF8F00' : '#FFB300';
    ctx.beginPath();
    ctx.ellipse(0, -34, 22, 5, 0, 0, Math.PI);
    ctx.fill();

    // Crack lines
    if (cracked) {
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, -42);
        ctx.lineTo(2, -36);
        ctx.lineTo(-1, -30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, -40);
        ctx.lineTo(8, -34);
        ctx.stroke();
    }
}

function drawBomb(ctx) {
    // Bomb body
    ctx.fillStyle = '#37474F';
    ctx.beginPath();
    ctx.arc(0, -15, 20, 0, Math.PI * 2);
    ctx.fill();

    // Sheen
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(-7, -22, 8, 0, Math.PI * 2);
    ctx.fill();

    // Fuse
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.quadraticCurveTo(8, -42, 5, -48);
    ctx.stroke();

    // Fuse spark
    const sparkPhase = Date.now() * 0.01;
    ctx.fillStyle = `hsl(${30 + Math.sin(sparkPhase) * 20}, 100%, ${60 + Math.sin(sparkPhase * 2) * 15}%)`;
    ctx.beginPath();
    ctx.arc(5, -48, 5 + Math.sin(sparkPhase) * 2, 0, Math.PI * 2);
    ctx.fill();

    // Skull & crossbones (danger sign)
    ctx.fillStyle = '#FFF9C4';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☠', 0, -10);
}

function drawStars(ctx, timer) {
    const count = 4;
    const t = timer / 0.4;
    const radius = 30 + (1 - t) * 20;

    ctx.fillStyle = '#FFD54F';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + t * 3;
        const sx = Math.cos(angle) * radius;
        const sy = -30 + Math.sin(angle) * radius * 0.5;
        ctx.globalAlpha = t;
        ctx.fillText('★', sx, sy);
    }
    ctx.globalAlpha = 1;
}
