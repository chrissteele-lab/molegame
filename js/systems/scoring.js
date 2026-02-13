// scoring.js — Score tracking, time bonus, high score persistence

const HI_SCORE_KEY = 'whackamole_hiscore';

let score = 0;
let timeRemaining = 30;
let hiScore = 0;

export function initScoring() {
    score = 0;
    timeRemaining = 30;
    hiScore = parseInt(localStorage.getItem(HI_SCORE_KEY) || '0', 10);
}

export function addScore(points) {
    score += points;
}

export function addTime(seconds) {
    timeRemaining += seconds;
}

export function tick(dt) {
    timeRemaining -= dt;
    if (timeRemaining < 0) timeRemaining = 0;
}

export function isTimeUp() {
    return timeRemaining <= 0;
}

export function getScore() { return score; }
export function getTimeRemaining() { return timeRemaining; }
export function getHiScore() { return hiScore; }

export function finalizeScore() {
    if (score > hiScore) {
        hiScore = score;
        localStorage.setItem(HI_SCORE_KEY, String(hiScore));
    }
    return { score, hiScore };
}
