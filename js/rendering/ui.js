// ui.js — HUD rendering: score, timer, stun overlay, time bonus popups

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../canvas.js';
import { HUD_TOP } from './background.js';
import * as Scoring from '../systems/scoring.js';
import * as Character from '../entities/character.js';

// Time bonus popup queue
let bonusPopups = [];

export function initUI() {
    bonusPopups = [];
}

export function addBonusPopup() {
    bonusPopups.push({
        text: '+1s',
        x: VIRTUAL_WIDTH / 2 + (Math.random() - 0.5) * 100,
        y: HUD_TOP - 10,
        life: 1.0,
    });
}

export function addScorePopup(points, x, y) {
    bonusPopups.push({
        text: `+${points}`,
        x,
        y,
        life: 0.8,
        color: '#FFD54F',
    });
}

export function updateUI(dt) {
    for (const p of bonusPopups) {
        p.life -= dt;
        p.y -= 40 * dt;
    }
    bonusPopups = bonusPopups.filter(p => p.life > 0);
}

export function drawHUD(ctx) {
    const score = Scoring.getScore();
    const time = Scoring.getTimeRemaining();
    const hiScore = Scoring.getHiScore();

    const hudY = HUD_TOP + (VIRTUAL_HEIGHT - HUD_TOP) / 2;

    ctx.textBaseline = 'middle';

    // Score (left)
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 16px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE', 30, hudY - 12);

    ctx.fillStyle = '#FFD54F';
    ctx.font = '900 32px Outfit, sans-serif';
    ctx.fillText(String(score), 30, hudY + 14);

    // Timer (center)
    const timeStr = formatTime(time);
    const isUrgent = time <= 10;

    ctx.fillStyle = isUrgent ? '#F44336' : 'rgba(255,255,255,0.5)';
    ctx.font = '600 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIME', VIRTUAL_WIDTH / 2, hudY - 12);

    ctx.fillStyle = isUrgent ? '#F44336' : '#FFFFFF';
    ctx.font = `900 ${isUrgent ? '36' : '32'}px Outfit, sans-serif`;
    ctx.fillText(timeStr, VIRTUAL_WIDTH / 2, hudY + 14);

    // Pulse effect when low time
    if (isUrgent && time > 0) {
        const pulse = Math.sin(Date.now() * 0.015) * 0.3 + 0.7; // slightly faster pulse
        ctx.globalAlpha = pulse;

        // Pulsing timer
        ctx.fillStyle = '#F44336';
        ctx.font = '900 38px Outfit, sans-serif';
        ctx.fillText(timeStr, VIRTUAL_WIDTH / 2, hudY + 14);

        // "HURRY!" text
        ctx.font = '900 48px Outfit, sans-serif';
        // Move to top of screen as requested
        ctx.fillText('HURRY!', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT * 0.15);

        ctx.globalAlpha = 1;
    }

    // Hi Score (right)
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 16px Outfit, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('BEST', VIRTUAL_WIDTH - 30, hudY - 12);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '900 28px Outfit, sans-serif';
    ctx.fillText(String(hiScore), VIRTUAL_WIDTH - 30, hudY + 14);

    // Bonus popups
    for (const p of bonusPopups) {
        ctx.globalAlpha = Math.min(p.life * 2, 1);
        ctx.fillStyle = p.color || '#4CAF50';
        ctx.font = 'bold 22px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
}

export function drawStunOverlay(ctx) {
    if (!Character.isStunned()) return;

    const prog = Character.getStunProgress();
    const alpha = (1 - prog) * 0.3;

    // Red vignette
    const grad = ctx.createRadialGradient(
        VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2, VIRTUAL_WIDTH * 0.3,
        VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2, VIRTUAL_WIDTH * 0.8
    );
    grad.addColorStop(0, 'rgba(244, 67, 54, 0)');
    grad.addColorStop(1, `rgba(244, 67, 54, ${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // "STUNNED!" text
    if (prog < 0.7) {
        ctx.globalAlpha = (0.7 - prog) / 0.7;
        ctx.fillStyle = '#F44336';
        ctx.font = '900 48px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STUNNED!', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT * 0.25);
        ctx.globalAlpha = 1;
    }
}

function formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}
