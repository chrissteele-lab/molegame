// moleRenderer.js — Draw moles, dirt disturbance, pop-up animation

import { MoleState, MoleType } from '../entities/mole.js';
import { LAWN_TOP, LAWN_HEIGHT, LAWN_BOTTOM } from './background.js';
import { MOLE_CONFIG } from '../config.js';




// -- Layer 1: Holes & Dirt (Background) --
export function drawHoles(ctx, moles, level = 'lawn') {
    for (const mole of moles) {
        const baseY = mole.getBaseY(LAWN_TOP, LAWN_HEIGHT);
        const x = mole.x;

        if (mole.state === MoleState.UNDERGROUND) {
            if (level === 'pub') {
                drawPubDisturbance(ctx, x, baseY, mole.dirtPhase);
            } else if (level === 'rock') {
                drawRockDisturbance(ctx, x, baseY, mole.dirtPhase);
            } else if (level === 'birthday') {
                drawGiftDisturbance(ctx, x, baseY, mole.dirtPhase);
            } else {
                drawDirtDisturbance(ctx, x, baseY, mole.dirtPhase);
            }
        } else {
            if (level === 'pub') {
                drawBarrel(ctx, x, baseY);
            } else if (level === 'rock') {
                drawRockTrapdoor(ctx, x, baseY);
            } else if (level === 'birthday') {
                drawGiftBox(ctx, x, baseY);
            } else {
                drawHole(ctx, x, baseY);
            }
        }
    }
}

// -- Layer 2: Active Moles (Foreground) --
export function drawActiveMoles(ctx, moles, level = 'lawn') {
    for (const mole of moles) {
        if (mole.state === MoleState.UNDERGROUND) continue;

        const baseY = mole.getBaseY(LAWN_TOP, LAWN_HEIGHT);
        const visY = mole.getVisibleY(LAWN_TOP, LAWN_HEIGHT);
        const x = mole.x;

        // Clip above ground line (mole emerges from ground/barrel/trapdoor)
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 50, 0, 100, baseY);
        ctx.clip();

        // Draw the mole body
        drawMoleBody(ctx, x, visY, mole);

        ctx.restore();

        // Draw top of the hole/barrel/trapdoor ring
        if (level === 'pub') {
            drawBarrelRing(ctx, x, baseY);
        } else if (level === 'rock') {
            drawRockRing(ctx, x, baseY);
        } else if (level === 'birthday') {
            drawGiftRing(ctx, x, baseY);
        } else {
            drawDirtRing(ctx, x, baseY);
        }
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

function drawPubDisturbance(ctx, x, y, phase) {
    // Mechanical base / Bracket for the barrel
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 20, y - 2, 40, 6);
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 18, y, 36, 3);

    // Barrel is already drawn in drawHoles/drawActiveMoles calling drawBarrel/drawBarrelRing
    // But drawPubDisturbance is called specifically for "underground" moles.
    // So we just call drawBarrel/drawBarrelRing here to show the moving empty barrel.
    drawBarrel(ctx, x, y);
    drawBarrelRing(ctx, x, y);
}

function drawHole(ctx, x, y) {
    // Dark hole
    ctx.fillStyle = '#2E1B0E';
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBarrel(ctx, x, y) {
    const w = 30;
    // Dark interior (deeper shadow)
    ctx.fillStyle = '#120c08';
    ctx.beginPath();
    ctx.ellipse(x, y, w, 11, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBarrelRing(ctx, x, y) {
    const w = 30;

    // Barrel Body (front half) - TALLER/DEEPER
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.ellipse(x, y + 15, w, 32, 0, 0, Math.PI);
    ctx.fill();

    // Wood Planks (vertical lines)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
        const sx = x + i * 8;
        if (Math.abs(sx - x) > w - 2) continue;

        ctx.beginPath();
        ctx.moveTo(sx, y + 5);
        ctx.lineTo(sx, y + 45); // Extended down
        ctx.stroke();
    }

    // Metal Bands (darker, more robust)
    ctx.strokeStyle = '#2b1d16';
    ctx.lineWidth = 5;

    // Top band
    ctx.beginPath();
    ctx.ellipse(x, y + 12, w + 1, 11, 0, 0, Math.PI);
    ctx.stroke();

    // Middle band
    ctx.beginPath();
    ctx.ellipse(x, y + 28, w - 1, 9, 0, 0, Math.PI);
    ctx.stroke();

    // Bottom band
    ctx.beginPath();
    ctx.ellipse(x, y + 42, w - 5, 6, 0, 0, Math.PI);
    ctx.stroke();

    // Rivets (brass look)
    ctx.fillStyle = '#9e7e5d';
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(x + i * 22, y + 22, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Top Rim (Sturdy metal)
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(x, y, w + 2, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
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

// === Rock Level: Crowd Gap ===
function drawRockTrapdoor(ctx, x, y) {
    // Dark gap in the crowd where someone can pop up
    ctx.fillStyle = '#05030a';
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Surrounding crowd shoulders (heads around the gap)
    const t = Date.now() * 0.002;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.3;
        const r = 24;
        const hx = x + Math.cos(angle) * r;
        const hy = y + Math.sin(angle) * (r * 0.35);
        const bob = Math.sin(t * 2 + i * 1.5) * 1.5;

        ctx.fillStyle = `rgba(25, 18, 40, ${0.5 + Math.sin(i + t) * 0.1})`;
        ctx.beginPath();
        ctx.arc(hx, hy + bob, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRockDisturbance(ctx, x, y, phase) {
    const t = Date.now() * 0.002;
    const ripple = Math.sin(phase * 6) * 3;

    // Dark gap forming as crowd parts
    ctx.fillStyle = '#08050f';
    ctx.beginPath();
    ctx.ellipse(x, y, 20 + Math.abs(ripple), 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heads being pushed aside
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const pushOut = 22 + Math.sin(phase * 4 + i * 2) * 4;
        const hx = x + Math.cos(angle) * pushOut;
        const hy = y + Math.sin(angle) * (pushOut * 0.35);
        const bob = Math.sin(t * 3 + i * 1.8) * 2;

        ctx.fillStyle = `rgba(30, 22, 48, ${0.5 + Math.sin(phase + i) * 0.15})`;
        ctx.beginPath();
        ctx.arc(hx, hy + bob, 5.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Faint glow from below (something's coming up)
    const glow = 0.15 + Math.sin(phase * 3) * 0.1;
    ctx.fillStyle = `rgba(180, 100, 255, ${glow})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawRockRing(ctx, x, y) {
    const t = Date.now() * 0.002;

    // Crowd parting around the mole — shoulders forming a ring
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.2;
        const r = 30;
        const hx = x + Math.cos(angle) * r;
        const hy = y + Math.sin(angle) * (r * 0.38);
        const bob = Math.sin(t * 2.5 + i * 1.2) * 1.5;

        // Shoulder
        ctx.fillStyle = `rgba(35, 25, 55, ${0.55 + Math.sin(i * 0.8 + t) * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(hx, hy + bob + 3, 7, 4, angle * 0.3, 0, Math.PI);
        ctx.fill();
        // Head
        ctx.fillStyle = `rgba(40, 30, 60, ${0.6 + Math.sin(i + t) * 0.1})`;
        ctx.beginPath();
        ctx.arc(hx, hy + bob, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Faint purple spotlight on the emerging mole
    ctx.fillStyle = `rgba(150, 80, 220, ${0.08 + Math.sin(t * 3) * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(x, y - 20, 25, 40, 0, 0, Math.PI * 2);
    ctx.fill();
}

// === Birthday Level: Gift Box ===
function drawGiftBox(ctx, x, y) {
    // Wrapped present — dark opening
    ctx.fillStyle = '#2a0a0a';
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawGiftDisturbance(ctx, x, y, phase) {
    const wobble = Math.sin(phase * 6) * 3;
    const t = Date.now() * 0.002;

    // Gift box body
    const boxW = 40, boxH = 32;
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2 + wobble, y - boxH, boxW, boxH, 3);
    ctx.fill();

    // Wrapping ribbon (vertical)
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(x - 3 + wobble, y - boxH, 6, boxH);
    // Wrapping ribbon (horizontal)
    ctx.fillRect(x - boxW / 2 + wobble, y - boxH / 2 - 3, boxW, 6);

    // Lid (closed, wobbling)
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2 - 3 + wobble, y - boxH - 6, boxW + 6, 8, 2);
    ctx.fill();

    // Bow on top
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.ellipse(x - 7 + wobble, y - boxH - 8, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 7 + wobble, y - boxH - 8, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Bow centre
    ctx.beginPath();
    ctx.arc(x + wobble, y - boxH - 7, 3, 0, Math.PI * 2);
    ctx.fill();

    // Jiggle indicator
    const glow = 0.15 + Math.sin(phase * 3) * 0.1;
    ctx.fillStyle = `rgba(255, 200, 0, ${glow})`;
    ctx.beginPath();
    ctx.ellipse(x, y - boxH / 2, boxW / 2 + 5, boxH / 2 + 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawGiftRing(ctx, x, y) {
    const t = Date.now() * 0.002;

    // Open gift box (bottom half visible, lid popped off)
    const boxW = 42, boxH = 30;

    // Box body (front half visible below mole)
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, y, boxW, boxH * 0.6, [0, 0, 4, 4]);
    ctx.fill();

    // Ribbon on box body
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(x - 3, y, 6, boxH * 0.6);
    ctx.fillRect(x - boxW / 2, y + boxH * 0.2, boxW, 5);

    // Popped-off lid (tilted to side)
    ctx.save();
    ctx.translate(x + boxW / 2 + 5, y - 5);
    ctx.rotate(0.4 + Math.sin(t) * 0.05);
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.roundRect(-boxW / 2 - 3, -4, boxW + 6, 8, 2);
    ctx.fill();
    // Lid ribbon
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(-3, -4, 6, 8);
    ctx.restore();

    // Torn wrapping paper bits
    ctx.fillStyle = 'rgba(229, 57, 53, 0.4)';
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 0.3;
        const r = boxW / 2 + 8;
        ctx.save();
        ctx.translate(x + Math.cos(angle) * r, y + Math.sin(angle) * (r * 0.4));
        ctx.rotate(angle + t * 0.5);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
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
