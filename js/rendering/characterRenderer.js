// characterRenderer.js — Draw character with photo face composite

import { LAWN_TOP } from './background.js';
import { getActiveFace } from '../systems/photo.js';
import * as Character from '../entities/character.js';

// Character stands at the back of the lawn (just below horizon)
const CHAR_Y = LAWN_TOP + 30;
const BODY_WIDTH = 80;
const BODY_HEIGHT = 120;
const HEAD_RADIUS = 32;

export function drawCharacter(ctx) {
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
    drawBody(ctx, isSwinging, swingProg, swingDir, isStunned);

    // === Head with face ===
    drawHead(ctx, isStunned, stunProg);

    // === Hammer ===
    drawHammer(ctx, isSwinging, swingProg, swingDir);

    // === Stun stars ===
    if (isStunned) {
        drawStunStars(ctx, stunProg);
    }

    ctx.restore();
}

function drawBody(ctx, isSwinging, swingProg, swingDir, isStunned) {
    // Overalls body
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH / 2, -BODY_HEIGHT * 0.3, BODY_WIDTH, BODY_HEIGHT * 0.65, 8);
    ctx.fill();

    // Overalls straps
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(-BODY_WIDTH * 0.35, -BODY_HEIGHT * 0.55, 12, 30);
    ctx.fillRect(BODY_WIDTH * 0.35 - 12, -BODY_HEIGHT * 0.55, 12, 30);

    // Shirt
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.4, -BODY_HEIGHT * 0.6, BODY_WIDTH * 0.8, BODY_HEIGHT * 0.35, 6);
    ctx.fill();

    // Belt
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(-BODY_WIDTH * 0.42, -BODY_HEIGHT * 0.05, BODY_WIDTH * 0.84, 8);

    // Belt buckle
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(-6, -BODY_HEIGHT * 0.05, 12, 8);

    // Arms
    const armY = -BODY_HEIGHT * 0.45;

    // Left arm (holds hammer)
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
    // Hand
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(-28, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right arm
    ctx.fillStyle = '#E53935';
    ctx.save();
    ctx.translate(BODY_WIDTH * 0.45, armY);
    if (isSwinging) {
        ctx.rotate(0.3 - swingProg * 0.3);
    } else {
        ctx.rotate(0.3);
    }
    ctx.fillRect(0, -6, 25, 14);
    // Hand
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(25, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Legs
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(-BODY_WIDTH * 0.3, BODY_HEIGHT * 0.3, 18, 25);
    ctx.fillRect(BODY_WIDTH * 0.3 - 18, BODY_HEIGHT * 0.3, 18, 25);

    // Boots
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.roundRect(-BODY_WIDTH * 0.35, BODY_HEIGHT * 0.5, 24, 12, [0, 0, 4, 4]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(BODY_WIDTH * 0.35 - 24, BODY_HEIGHT * 0.5, 24, 12, [0, 0, 4, 4]);
    ctx.fill();
}

function drawHead(ctx, isStunned, stunProg) {
    const headY = -BODY_HEIGHT * 0.6 - HEAD_RADIUS;

    ctx.save();
    ctx.translate(0, headY);

    // Head circle (skin color background behind face)
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Composite face photo
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

    // Head outline
    ctx.strokeStyle = '#E0A050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Hair (tufts on top)
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

    // Dizzy eyes when stunned (drawn over the face photo)
    if (isStunned) {
        const spin = stunProg * 15;
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2.5;
        // X eyes
        for (let side = -1; side <= 1; side += 2) {
            const ex = side * 12;
            const ey = -4;
            ctx.save();
            ctx.translate(ex, ey);
            ctx.rotate(spin);
            ctx.beginPath();
            ctx.moveTo(-5, -5);
            ctx.lineTo(5, 5);
            ctx.moveTo(5, -5);
            ctx.lineTo(-5, 5);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.restore();
}

function drawHammer(ctx, isSwinging, swingProg, swingDir) {
    ctx.save();

    const hammerX = -BODY_WIDTH * 0.45 - 28;
    const hammerY = -BODY_HEIGHT * 0.45;

    ctx.translate(hammerX, hammerY);

    if (isSwinging) {
        // Swing arc
        const angle = -1.5 + swingProg * 3.0;
        ctx.rotate(angle);
    } else {
        ctx.rotate(-1.2); // Resting position (raised)
    }

    // Handle
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(-3, -50, 6, 50);

    // Hammerhead
    ctx.fillStyle = '#757575';
    ctx.beginPath();
    ctx.roundRect(-14, -65, 28, 18, 3);
    ctx.fill();

    // Hammerhead highlight
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(-12, -63, 24, 5);

    // Hammerhead face
    ctx.fillStyle = '#616161';
    ctx.fillRect(-14, -57, 4, 10);
    ctx.fillRect(10, -57, 4, 10);

    ctx.restore();
}

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
