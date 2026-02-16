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
    } else if (level === 'birthday') {
        drawBirthdayBackground(ctx);
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

    // === Stage Platform (where the rockstar stands) ===
    const stageBottom = LAWN_TOP + 110; // stage ends here, crowd begins below

    // Stage floor
    const stageGrad = ctx.createLinearGradient(0, LAWN_TOP, 0, stageBottom);
    stageGrad.addColorStop(0, '#1a1a1a');
    stageGrad.addColorStop(1, '#111');
    ctx.fillStyle = stageGrad;
    ctx.fillRect(0, LAWN_TOP, VIRTUAL_WIDTH, stageBottom - LAWN_TOP);

    // Stage floor planks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < VIRTUAL_WIDTH; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, LAWN_TOP);
        ctx.lineTo(x, stageBottom);
        ctx.stroke();
    }

    // Footlights along front of stage
    for (let i = 0; i < 12; i++) {
        const lx = (i + 0.5) * (VIRTUAL_WIDTH / 12);
        const hue = (t * 40 + i * 30) % 360;
        const pulse = 0.4 + Math.sin(t * 2 + i * 0.8) * 0.15;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${pulse})`;
        ctx.beginPath();
        ctx.arc(lx, stageBottom - 3, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Stage front edge (thick metal lip)
    ctx.fillStyle = '#333';
    ctx.fillRect(0, stageBottom - 2, VIRTUAL_WIDTH, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, stageBottom + 4, VIRTUAL_WIDTH, 3);

    // === Dense Crowd (fills area below the stage) ===
    // Dark base for the crowd
    const crowdTop = stageBottom + 7;
    const crowdGrad = ctx.createLinearGradient(0, crowdTop, 0, LAWN_BOTTOM);
    crowdGrad.addColorStop(0, '#0d0a15');
    crowdGrad.addColorStop(1, '#08060e');
    ctx.fillStyle = crowdGrad;
    ctx.fillRect(0, crowdTop, VIRTUAL_WIDTH, LAWN_BOTTOM - crowdTop);

    // Draw rows of crowd heads (back to front, getting larger)
    const crowdHeight = LAWN_BOTTOM - crowdTop;
    const rows = 4;
    for (let row = 0; row < rows; row++) {
        const rowY = crowdTop + (row / rows) * crowdHeight + crowdHeight * 0.1;
        const headSize = 6 + row * 2.5;
        const spacing = 22 + row * 4;
        const rowOffset = (row % 2) * (spacing / 2);
        const darkness = 0.2 + row * 0.12;

        for (let cx = rowOffset; cx < VIRTUAL_WIDTH + spacing; cx += spacing) {
            const bounce = Math.sin(t * 2.5 + cx * 0.08 + row * 1.3) * (2 + row * 0.5);
            const sway = Math.sin(t * 1.8 + cx * 0.05 + row * 0.7) * 2;
            const hx = cx + sway;
            const hy = rowY + bounce;

            // Shoulders
            ctx.fillStyle = `rgba(${20 + row * 10}, ${15 + row * 8}, ${30 + row * 12}, ${darkness})`;
            ctx.beginPath();
            ctx.ellipse(hx, hy + headSize * 0.8, headSize * 1.3, headSize * 0.5, 0, 0, Math.PI);
            ctx.fill();

            // Head
            ctx.fillStyle = `rgba(${30 + row * 12}, ${20 + row * 10}, ${40 + row * 14}, ${darkness + 0.1})`;
            ctx.beginPath();
            ctx.arc(hx, hy, headSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Raised hands (scattered, animated)
    ctx.lineWidth = 3;
    for (let i = 0; i < 15; i++) {
        const hx = 40 + i * 90 + Math.sin(i * 4.3) * 30;
        const baseRowY = crowdTop + ((i * 3) % rows) / rows * crowdHeight + crowdHeight * 0.1;
        const bounceY = Math.sin(t * 3 + i * 1.7) * 8;
        const handH = 18 + Math.sin(t * 2 + i * 2.3) * 5;
        const hue = (t * 30 + i * 40) % 360;

        // Arm
        ctx.strokeStyle = `hsla(${hue}, 20%, 25%, 0.4)`;
        ctx.beginPath();
        ctx.moveTo(hx, baseRowY + 5);
        ctx.lineTo(hx + 2, baseRowY - handH + bounceY);
        ctx.stroke();

        // Phone/lighter glow
        if (i % 3 === 0) {
            ctx.fillStyle = `hsla(${hue}, 50%, 60%, ${0.3 + Math.sin(t * 4 + i) * 0.15})`;
            ctx.beginPath();
            ctx.arc(hx + 2, baseRowY - handH + bounceY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === Below crowd (dark pit) ===
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

function drawBirthdayBackground(ctx) {
    const t = Date.now() * 0.001;

    // === Party Room Walls ===
    const wallGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    wallGrad.addColorStop(0, '#ffe0f0');
    wallGrad.addColorStop(1, '#ffd1e8');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, HORIZON_Y);

    // Bunting / Triangular flags across top
    const flagColors = ['#e53935', '#ffb300', '#43a047', '#1e88e5', '#8e24aa', '#f06292'];
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(0, 35);
    ctx.lineTo(VIRTUAL_WIDTH, 30);
    ctx.stroke();
    for (let i = 0; i < 18; i++) {
        const fx = i * (VIRTUAL_WIDTH / 18) + 15;
        const fy = 32 + Math.sin(i * 0.8) * 3;
        ctx.fillStyle = flagColors[i % flagColors.length];
        ctx.beginPath();
        ctx.moveTo(fx - 12, fy);
        ctx.lineTo(fx + 12, fy);
        ctx.lineTo(fx, fy + 22);
        ctx.closePath();
        ctx.fill();
    }

    // "HAPPY BIRTHDAY" banner
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.roundRect(VIRTUAL_WIDTH / 2 - 160, 60, 320, 40, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎂 HAPPY BIRTHDAY! 🎂', VIRTUAL_WIDTH / 2, 87);

    // Balloons (scattered, rising)
    const balloonColors = ['#e53935', '#ffb300', '#43a047', '#1e88e5', '#e91e63', '#9c27b0'];
    for (let i = 0; i < 10; i++) {
        const bx = 50 + i * 130 + Math.sin(i * 3.7) * 40;
        const by = 60 + Math.sin(t * 0.8 + i * 2.1) * 12 + i * 8;
        const color = balloonColors[i % balloonColors.length];

        // String
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by + 18);
        ctx.quadraticCurveTo(bx + Math.sin(t + i) * 5, by + 45, bx + 3, by + 60);
        ctx.stroke();

        // Balloon
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(bx, by, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(bx - 4, by - 6, 4, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Knot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(bx - 3, by + 17);
        ctx.lineTo(bx + 3, by + 17);
        ctx.lineTo(bx, by + 22);
        ctx.closePath();
        ctx.fill();
    }

    // Disco ball (top centre)
    const dbx = VIRTUAL_WIDTH / 2;
    const dby = 25;
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dbx, 0);
    ctx.lineTo(dbx, dby);
    ctx.stroke();
    // Ball
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(dbx, dby + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    // Facets
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 2;
        ctx.beginPath();
        ctx.arc(dbx + Math.cos(a) * 6, dby + 10 + Math.sin(a) * 6, 3, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Light reflections on walls
    for (let i = 0; i < 6; i++) {
        const ra = t * 1.5 + i * 1.05;
        const rx = dbx + Math.cos(ra) * (150 + i * 40);
        const ry = 20 + Math.sin(ra * 0.7 + i) * 60 + 40;
        if (rx > 0 && rx < VIRTUAL_WIDTH && ry < HORIZON_Y) {
            ctx.fillStyle = `hsla(${(i * 60 + t * 30) % 360}, 80%, 70%, ${0.25 + Math.sin(t * 3 + i) * 0.1})`;
            ctx.beginPath();
            ctx.arc(rx, ry, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === Confetti Floor (play area) ===
    const floorGrad = ctx.createLinearGradient(0, LAWN_TOP, 0, LAWN_BOTTOM);
    floorGrad.addColorStop(0, '#fff5e6');
    floorGrad.addColorStop(1, '#ffe0cc');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, LAWN_TOP, VIRTUAL_WIDTH, LAWN_HEIGHT);

    // Scattered confetti pieces (static pattern seeded by position)
    for (let i = 0; i < 60; i++) {
        const cx = (i * 97 + 13) % VIRTUAL_WIDTH;
        const cy = LAWN_TOP + ((i * 61 + 29) % Math.floor(LAWN_HEIGHT));
        const hue = (i * 47) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(i * 1.3);
        ctx.fillRect(-4, -1.5, 8, 3);
        ctx.restore();
    }

    // === Toy Train Track ===
    const baseY = LAWN_TOP + LAWN_HEIGHT * 0.6;
    const trackY = baseY + 47;

    // Sleepers (wooden cross-ties)
    ctx.fillStyle = '#8d6e63';
    const sleeperSpacing = 30;
    for (let x = -sleeperSpacing; x < VIRTUAL_WIDTH + sleeperSpacing; x += sleeperSpacing) {
        const sx = x + (trackPhase % sleeperSpacing);
        ctx.fillRect(sx - 2, trackY + 2, 4, 20);
    }

    // Rails
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY + 5);
    ctx.lineTo(VIRTUAL_WIDTH, trackY + 5);
    ctx.moveTo(0, trackY + 19);
    ctx.lineTo(VIRTUAL_WIDTH, trackY + 19);
    ctx.stroke();

    // Rail highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, trackY + 4);
    ctx.lineTo(VIRTUAL_WIDTH, trackY + 4);
    ctx.moveTo(0, trackY + 18);
    ctx.lineTo(VIRTUAL_WIDTH, trackY + 18);
    ctx.stroke();

    // === Below floor (carpet) ===
    const carpetGrad = ctx.createLinearGradient(0, SOIL_TOP, 0, SOIL_BOTTOM);
    carpetGrad.addColorStop(0, '#e8b4b8');
    carpetGrad.addColorStop(1, '#d4878f');
    ctx.fillStyle = carpetGrad;
    ctx.fillRect(0, SOIL_TOP, VIRTUAL_WIDTH, SOIL_BOTTOM - SOIL_TOP);

    // === HUD background ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, HUD_TOP, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - HUD_TOP);
}
