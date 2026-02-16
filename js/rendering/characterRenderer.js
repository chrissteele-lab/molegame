// characterRenderer.js — Draw character with photo face composite

import { LAWN_TOP } from './background.js';
import { getActiveFace } from '../systems/photo.js';
import * as Character from '../entities/character.js';

// Character stands at the back of the lawn (just below horizon)
const CHAR_Y = LAWN_TOP + 30;
const BODY_WIDTH = 80;
const BODY_HEIGHT = 120;
const HEAD_RADIUS = 32;

export function drawCharacter(ctx, level = 'lawn') {
    const x = Character.getX();
    const isSwinging = Character.isSwinging();
    const swingProg = Character.getSwingProgress();
    const swingDir = Character.getSwingDirection();
    const isStunned = Character.isStunned();
    const stunProg = Character.getStunProgress();
    const idleTimer = Character.getIdleTimer();

    ctx.save();
    ctx.translate(x, CHAR_Y);

    // Idle breathing
    const breathe = Math.sin(idleTimer * 2.5) * 2;

    // Jump bob
    const jumpBob = Character.isJumping() ? -8 : 0;
    ctx.translate(0, jumpBob + breathe);

    // Stun sway
    if (isStunned) {
        const sway = Math.sin(stunProg * 20) * 8 * (1 - stunProg);
        ctx.translate(sway, 0);
    }

    // === Body ===
    if (level === 'rock') {
        drawRockstarBody(ctx, isSwinging, swingProg, swingDir, isStunned);
    } else if (level === 'birthday') {
        drawBirthdayBody(ctx, isSwinging, swingProg, swingDir, isStunned);
    } else {
        drawBody(ctx, isSwinging, swingProg, swingDir, isStunned);
    }

    // === Head with face ===
    if (level === 'rock') {
        drawRockstarHead(ctx, isStunned, stunProg);
    } else if (level === 'birthday') {
        drawBirthdayHead(ctx, isStunned, stunProg);
    } else {
        drawHead(ctx, isStunned, stunProg);
    }

    // === Weapon ===
    if (level === 'rock') {
        drawGuitar(ctx, isSwinging, swingProg, swingDir);
    } else if (level === 'birthday') {
        drawPinataStick(ctx, isSwinging, swingProg, swingDir);
    } else {
        drawHammer(ctx, isSwinging, swingProg, swingDir);
    }

    // === Stun stars ===
    if (isStunned) {
        drawStunStars(ctx, stunProg);
    }

    ctx.restore();
}

// ===== ROCKSTAR BODY =====
function drawRockstarBody(ctx, isSwinging, swingProg, swingDir, isStunned) {
    // Torn jeans
    ctx.fillStyle = '#1a237e';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH / 2, -BODY_HEIGHT * 0.3, BODY_WIDTH, BODY_HEIGHT * 0.65, 8);
    ctx.fill();

    // Jean rips
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, BODY_HEIGHT * 0.1);
    ctx.lineTo(-5, BODY_HEIGHT * 0.15);
    ctx.moveTo(8, BODY_HEIGHT * 0.05);
    ctx.lineTo(14, BODY_HEIGHT * 0.12);
    ctx.stroke();

    // Band tee (black with skull)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.4, -BODY_HEIGHT * 0.6, BODY_WIDTH * 0.8, BODY_HEIGHT * 0.35, 6);
    ctx.fill();

    // Skull design on shirt
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☠', 0, -BODY_HEIGHT * 0.38);

    // Leather jacket (open vest)
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(-BODY_WIDTH * 0.45, -BODY_HEIGHT * 0.58, 14, BODY_HEIGHT * 0.50);
    ctx.fillRect(BODY_WIDTH * 0.45 - 14, -BODY_HEIGHT * 0.58, 14, BODY_HEIGHT * 0.50);

    // Jacket collar
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(-BODY_WIDTH * 0.35, -BODY_HEIGHT * 0.58);
    ctx.lineTo(-BODY_WIDTH * 0.15, -BODY_HEIGHT * 0.48);
    ctx.lineTo(-BODY_WIDTH * 0.35, -BODY_HEIGHT * 0.48);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(BODY_WIDTH * 0.35, -BODY_HEIGHT * 0.58);
    ctx.lineTo(BODY_WIDTH * 0.15, -BODY_HEIGHT * 0.48);
    ctx.lineTo(BODY_WIDTH * 0.35, -BODY_HEIGHT * 0.48);
    ctx.fill();

    // Studded belt
    ctx.fillStyle = '#222';
    ctx.fillRect(-BODY_WIDTH * 0.42, -BODY_HEIGHT * 0.05, BODY_WIDTH * 0.84, 8);
    ctx.fillStyle = '#aaa';
    for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(i * 8, -BODY_HEIGHT * 0.01, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Arms
    const armY = -BODY_HEIGHT * 0.45;
    ctx.fillStyle = '#2c2c2c';
    ctx.save();
    if (isSwinging) {
        ctx.translate(-BODY_WIDTH * 0.45, armY);
        ctx.rotate(-0.3 + swingProg * 0.5);
        ctx.fillRect(0, -6, -30, 14);
    } else {
        ctx.translate(-BODY_WIDTH * 0.45, armY);
        ctx.rotate(-0.5);
        ctx.fillRect(0, -6, -28, 14);
    }
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(-28, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#2c2c2c';
    ctx.save();
    ctx.translate(BODY_WIDTH * 0.45, armY);
    if (isSwinging) {
        ctx.rotate(0.3 - swingProg * 0.3);
    } else {
        ctx.rotate(0.3);
    }
    ctx.fillRect(0, -6, 25, 14);
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(25, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Legs
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(-BODY_WIDTH * 0.3, BODY_HEIGHT * 0.3, 18, 25);
    ctx.fillRect(BODY_WIDTH * 0.3 - 18, BODY_HEIGHT * 0.3, 18, 25);

    // Platform boots
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.35, BODY_HEIGHT * 0.5, 24, 14, [0, 0, 4, 4]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(BODY_WIDTH * 0.35 - 24, BODY_HEIGHT * 0.5, 24, 14, [0, 0, 4, 4]);
    ctx.fill();
    // Boot soles
    ctx.fillStyle = '#333';
    ctx.fillRect(-BODY_WIDTH * 0.35, BODY_HEIGHT * 0.58, 24, 4);
    ctx.fillRect(BODY_WIDTH * 0.35 - 24, BODY_HEIGHT * 0.58, 24, 4);
}

// ===== ROCKSTAR HEAD =====
function drawRockstarHead(ctx, isStunned, stunProg) {
    const headY = -BODY_HEIGHT * 0.6 - HEAD_RADIUS;
    ctx.save();
    ctx.translate(0, headY);

    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    const face = getActiveFace();
    if (face) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, HEAD_RADIUS - 2, 0, Math.PI * 2);
        ctx.clip();
        const faceW = HEAD_RADIUS * 2;
        const faceH = faceW * (face.height / face.width);
        ctx.drawImage(face, -faceW / 2, -faceH / 2, faceW, faceH);
        ctx.restore();
    }

    ctx.strokeStyle = '#E0A050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Spiky punk hair
    ctx.fillStyle = '#111';
    for (let i = 0; i < 7; i++) {
        const angle = -Math.PI * 0.8 + (i / 6) * Math.PI * 0.6;
        const spikeLen = 14 + (i % 2) * 8;
        const baseR = HEAD_RADIUS - 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle - 0.12) * baseR, Math.sin(angle - 0.12) * baseR);
        ctx.lineTo(Math.cos(angle) * (baseR + spikeLen), Math.sin(angle) * (baseR + spikeLen));
        ctx.lineTo(Math.cos(angle + 0.12) * baseR, Math.sin(angle + 0.12) * baseR);
        ctx.fill();
    }

    if (isStunned) {
        const spin = stunProg * 15;
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2.5;
        for (let side = -1; side <= 1; side += 2) {
            const ex = side * 12;
            ctx.save();
            ctx.translate(ex, -4);
            ctx.rotate(spin);
            ctx.beginPath();
            ctx.moveTo(-5, -5); ctx.lineTo(5, 5);
            ctx.moveTo(5, -5); ctx.lineTo(-5, 5);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.restore();
}

// ===== STANDARD BODY =====
function drawBody(ctx, isSwinging, swingProg, swingDir, isStunned) {
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH / 2, -BODY_HEIGHT * 0.3, BODY_WIDTH, BODY_HEIGHT * 0.65, 8);
    ctx.fill();

    ctx.fillStyle = '#1565C0';
    ctx.fillRect(-BODY_WIDTH * 0.35, -BODY_HEIGHT * 0.55, 12, 30);
    ctx.fillRect(BODY_WIDTH * 0.35 - 12, -BODY_HEIGHT * 0.55, 12, 30);

    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.4, -BODY_HEIGHT * 0.6, BODY_WIDTH * 0.8, BODY_HEIGHT * 0.35, 6);
    ctx.fill();

    ctx.fillStyle = '#4E342E';
    ctx.fillRect(-BODY_WIDTH * 0.42, -BODY_HEIGHT * 0.05, BODY_WIDTH * 0.84, 8);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(-6, -BODY_HEIGHT * 0.05, 12, 8);

    const armY = -BODY_HEIGHT * 0.45;
    ctx.fillStyle = '#E53935';
    ctx.save();
    if (isSwinging) {
        ctx.translate(-BODY_WIDTH * 0.45, armY);
        ctx.rotate(-0.3 + swingProg * 0.5);
        ctx.fillRect(0, -6, -30, 14);
    } else {
        ctx.translate(-BODY_WIDTH * 0.45, armY);
        ctx.rotate(-0.5);
        ctx.fillRect(0, -6, -28, 14);
    }
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(-28, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#E53935';
    ctx.save();
    ctx.translate(BODY_WIDTH * 0.45, armY);
    if (isSwinging) {
        ctx.rotate(0.3 - swingProg * 0.3);
    } else {
        ctx.rotate(0.3);
    }
    ctx.fillRect(0, -6, 25, 14);
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(25, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#1565C0';
    ctx.fillRect(-BODY_WIDTH * 0.3, BODY_HEIGHT * 0.3, 18, 25);
    ctx.fillRect(BODY_WIDTH * 0.3 - 18, BODY_HEIGHT * 0.3, 18, 25);

    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.35, BODY_HEIGHT * 0.5, 24, 12, [0, 0, 4, 4]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(BODY_WIDTH * 0.35 - 24, BODY_HEIGHT * 0.5, 24, 12, [0, 0, 4, 4]);
    ctx.fill();
}

// ===== STANDARD HEAD =====
function drawHead(ctx, isStunned, stunProg) {
    const headY = -BODY_HEIGHT * 0.6 - HEAD_RADIUS;
    ctx.save();
    ctx.translate(0, headY);

    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    const face = getActiveFace();
    if (face) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, HEAD_RADIUS - 2, 0, Math.PI * 2);
        ctx.clip();
        const faceW = HEAD_RADIUS * 2;
        const faceH = faceW * (face.height / face.width);
        ctx.drawImage(face, -faceW / 2, -faceH / 2, faceW, faceH);
        ctx.restore();
    }

    ctx.strokeStyle = '#E0A050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(-12, -HEAD_RADIUS + 2, 10, 8, -0.3, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -HEAD_RADIUS + 1, 12, 9, 0.2, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, -HEAD_RADIUS + 4, 8, 7, 0.4, Math.PI, Math.PI * 2);
    ctx.fill();

    if (isStunned) {
        const spin = stunProg * 15;
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2.5;
        for (let side = -1; side <= 1; side += 2) {
            const ex = side * 12;
            ctx.save();
            ctx.translate(ex, -4);
            ctx.rotate(spin);
            ctx.beginPath();
            ctx.moveTo(-5, -5); ctx.lineTo(5, 5);
            ctx.moveTo(5, -5); ctx.lineTo(-5, 5);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.restore();
}

// ===== GUITAR (Rock weapon — held by neck, body swings) =====
function drawGuitar(ctx, isSwinging, swingProg, swingDir) {
    ctx.save();
    ctx.translate(-BODY_WIDTH * 0.45 - 28, -BODY_HEIGHT * 0.45);

    if (isSwinging) {
        ctx.rotate(-1.5 + swingProg * 3.0);
    } else {
        ctx.rotate(-1.2);
    }

    // --- Neck (near the hand, bottom portion) ---
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(-3, -45, 6, 45);

    // Frets on neck
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const fy = -40 + i * 8;
        ctx.beginPath();
        ctx.moveTo(-3, fy);
        ctx.lineTo(3, fy);
        ctx.stroke();
    }

    // Strings running up the neck
    ctx.strokeStyle = 'rgba(200,200,200,0.4)';
    ctx.lineWidth = 0.5;
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 2, -45);
        ctx.lineTo(i * 2, 0);
        ctx.stroke();
    }

    // --- Guitar body (far end = striking end, at the top) ---
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.ellipse(0, -55, 16, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -68, 14, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pickguard
    ctx.fillStyle = '#eee';
    ctx.beginPath();
    ctx.ellipse(3, -57, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pickups
    ctx.fillStyle = '#333';
    ctx.fillRect(-5, -52, 10, 3);
    ctx.fillRect(-4, -62, 8, 3);

    // Bridge
    ctx.fillStyle = '#888';
    ctx.fillRect(-4, -70, 8, 2);

    // --- Headstock (at the very bottom, near the hand) ---
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(-5, -2, 10, 10, 2);
    ctx.fill();
    // Tuning pegs
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(-7, 4, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, 6, 2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

// ===== HAMMER (Standard weapon) =====
function drawHammer(ctx, isSwinging, swingProg, swingDir) {
    ctx.save();
    ctx.translate(-BODY_WIDTH * 0.45 - 28, -BODY_HEIGHT * 0.45);

    if (isSwinging) {
        ctx.rotate(-1.5 + swingProg * 3.0);
    } else {
        ctx.rotate(-1.2);
    }

    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(-3, -50, 6, 50);

    ctx.fillStyle = '#757575';
    ctx.beginPath();
    ctx.roundRect(-14, -65, 28, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(-12, -63, 24, 5);

    ctx.fillStyle = '#616161';
    ctx.fillRect(-14, -57, 4, 10);
    ctx.fillRect(10, -57, 4, 10);

    ctx.restore();
}

// ===== STUN STARS =====
function drawStunStars(ctx, stunProg) {
    const headY = -BODY_HEIGHT * 0.6 - HEAD_RADIUS;
    const count = 5;
    const radius = HEAD_RADIUS + 15;
    const spin = stunProg * 12;

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + spin;
        const sx = Math.cos(angle) * radius;
        const sy = headY + Math.sin(angle) * radius * 0.5 - 10;
        ctx.globalAlpha = 0.8 + Math.sin(spin + i) * 0.2;
        ctx.fillText('★', sx, sy);
    }
    ctx.globalAlpha = 1;
}

// ===== BIRTHDAY BODY (Party outfit) =====
function drawBirthdayBody(ctx, isSwinging, swingProg, swingDir, isStunned) {
    // Shorts (bright green)
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH / 2, -BODY_HEIGHT * 0.3, BODY_WIDTH, BODY_HEIGHT * 0.6, 8);
    ctx.fill();

    // Party shirt (colourful stripes)
    const stripeColors = ['#e53935', '#ffb300', '#43a047', '#1e88e5', '#e91e63'];
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.4, -BODY_HEIGHT * 0.6, BODY_WIDTH * 0.8, BODY_HEIGHT * 0.35, 6);
    ctx.clip();
    for (let i = 0; i < stripeColors.length; i++) {
        const sy = -BODY_HEIGHT * 0.6 + i * (BODY_HEIGHT * 0.35 / stripeColors.length);
        ctx.fillStyle = stripeColors[i];
        ctx.fillRect(-BODY_WIDTH * 0.4, sy, BODY_WIDTH * 0.8, BODY_HEIGHT * 0.35 / stripeColors.length + 1);
    }
    ctx.restore();

    // Bow tie
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.moveTo(-8, -BODY_HEIGHT * 0.58);
    ctx.lineTo(0, -BODY_HEIGHT * 0.55);
    ctx.lineTo(8, -BODY_HEIGHT * 0.58);
    ctx.lineTo(0, -BODY_HEIGHT * 0.52);
    ctx.closePath();
    ctx.fill();

    // Arms
    const armAngle = isSwinging ? -0.5 + swingProg * 1.5 : 0.3;
    ctx.save();
    ctx.translate(-BODY_WIDTH * 0.4, -BODY_HEIGHT * 0.5);
    ctx.rotate(-armAngle);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(-5, 0, 10, 35);
    ctx.restore();
    ctx.save();
    ctx.translate(BODY_WIDTH * 0.4, -BODY_HEIGHT * 0.5);
    ctx.rotate(armAngle);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(-5, 0, 10, 35);
    ctx.restore();

    // Legs
    ctx.fillStyle = '#fdd835';
    ctx.fillRect(-BODY_WIDTH * 0.25, BODY_HEIGHT * 0.15, 14, 22);
    ctx.fillRect(BODY_WIDTH * 0.1, BODY_HEIGHT * 0.15, 14, 22);

    // Shoes
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.27, BODY_HEIGHT * 0.33, 18, 10, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(BODY_WIDTH * 0.08, BODY_HEIGHT * 0.33, 18, 10, 3);
    ctx.fill();
}

// ===== BIRTHDAY HEAD (with party hat) =====
function drawBirthdayHead(ctx, isStunned, stunProg) {
    const headY = -BODY_HEIGHT * 0.6 - HEAD_RADIUS;

    // Head
    ctx.fillStyle = '#FFD699';
    ctx.beginPath();
    ctx.arc(0, headY, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Face
    const faceImg = getActiveFace();
    if (faceImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, headY, HEAD_RADIUS * 0.75, 0, Math.PI * 2);
        ctx.clip();
        const s = HEAD_RADIUS * 1.5;
        ctx.drawImage(faceImg, -s / 2, headY - s / 2, s, s);
        ctx.restore();
    } else {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-10, headY - 5, 4, 0, Math.PI * 2);
        ctx.arc(10, headY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, headY + 5, 8, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }

    // Party hat!
    const hatBase = headY - HEAD_RADIUS + 2;
    const hatColors = ['#e53935', '#ffb300', '#1e88e5'];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-18, hatBase + 5);
    ctx.lineTo(0, hatBase - 35);
    ctx.lineTo(18, hatBase + 5);
    ctx.closePath();
    ctx.clip();
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = hatColors[i % hatColors.length];
        const sy = hatBase - 35 + i * 8;
        ctx.fillRect(-20, sy, 40, 9);
    }
    ctx.restore();
    // Hat brim
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.ellipse(0, hatBase + 5, 20, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pom-pom
    ctx.fillStyle = '#e91e63';
    ctx.beginPath();
    ctx.arc(0, hatBase - 35, 5, 0, Math.PI * 2);
    ctx.fill();

    // Stun X eyes
    if (isStunned) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(-14, headY - 8); ctx.lineTo(-6, headY - 2);
        ctx.moveTo(-6, headY - 8); ctx.lineTo(-14, headY - 2);
        ctx.moveTo(6, headY - 8); ctx.lineTo(14, headY - 2);
        ctx.moveTo(14, headY - 8); ctx.lineTo(6, headY - 2);
        ctx.stroke();
    }
}

// ===== PIÑATA STICK (Birthday weapon) =====
function drawPinataStick(ctx, isSwinging, swingProg, swingDir) {
    ctx.save();
    ctx.translate(-BODY_WIDTH * 0.45 - 28, -BODY_HEIGHT * 0.45);

    if (isSwinging) {
        ctx.rotate(-1.5 + swingProg * 3.0);
    } else {
        ctx.rotate(-1.2);
    }

    // Stick (colourful candy-stripe wrapped)
    const stickColors = ['#e53935', '#ffb300', '#43a047', '#1e88e5', '#e91e63'];
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = stickColors[i % stickColors.length];
        ctx.fillRect(-3, -55 + i * 5, 6, 6);
    }

    // Streamers at the tip
    const t = Date.now() * 0.003;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const hue = i * 90;
        ctx.strokeStyle = `hsla(${hue}, 80%, 55%, 0.7)`;
        ctx.beginPath();
        ctx.moveTo(0, -55);
        const sx = Math.sin(t + i * 1.5) * 12;
        const sy = -55 - 10 - Math.cos(t * 0.7 + i) * 5;
        ctx.quadraticCurveTo(sx * 0.5, -55 - 5, sx, sy);
        ctx.stroke();
    }

    ctx.restore();
}
