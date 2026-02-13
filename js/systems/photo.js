// photo.js — Photo upload, face cropping, and image management

let faceImage = null;
let defaultFaceCanvas = null;

export function initPhoto() {
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('photo-img');
    const video = document.getElementById('camera-feed');
    const placeholder = document.getElementById('photo-placeholder');
    const playBtn = document.getElementById('btn-play');
    const cameraBtn = document.getElementById('btn-camera');
    const captureBtn = document.getElementById('btn-capture');
    const retakeBtn = document.getElementById('btn-retake');
    const uploadLabel = document.getElementById('btn-upload-label');

    let stream = null;

    // --- File Upload ---
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                faceImage = cropFace(img);
                showPreview(preview, placeholder, playBtn);
                stopCamera();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    // --- Camera ---
    cameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 400, height: 400 }
            });
            video.srcObject = stream;
            video.classList.remove('hidden');
            placeholder.classList.add('hidden');
            preview.classList.add('hidden');

            cameraBtn.classList.add('hidden');
            uploadLabel.classList.add('hidden');
            captureBtn.classList.remove('hidden');
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Could not access camera. Please try uploading a file instead.");
        }
    });

    captureBtn.addEventListener('click', () => {
        // Draw video frame to canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const img = new Image();
        img.onload = () => {
            faceImage = cropFace(img);
            showPreview(preview, placeholder, playBtn);
            stopCamera();
            // Adjust UI for review
            video.classList.add('hidden');
            captureBtn.classList.add('hidden');
            retakeBtn.classList.remove('hidden');
        };
        img.src = canvas.toDataURL('image/png');
    });

    retakeBtn.addEventListener('click', () => {
        faceImage = null;
        preview.src = '';
        preview.classList.add('hidden');
        playBtn.classList.add('hidden');
        retakeBtn.classList.add('hidden');

        cameraBtn.classList.remove('hidden');
        uploadLabel.classList.remove('hidden');
        placeholder.classList.remove('hidden');
    });

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
}

function showPreview(preview, placeholder, playBtn) {
    preview.src = faceImage.toDataURL();
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    playBtn.classList.remove('hidden');
}

/**
 * Crop the center of the image into an oval-shaped face.
 * Assumes a front-facing headshot; takes the center square and applies oval mask.
 */
function cropFace(img) {
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) * 0.3; // bias toward top (face is usually upper portion)

    const outSize = 200;
    const c = document.createElement('canvas');
    c.width = outSize;
    c.height = outSize * 1.25; // oval: taller than wide
    const cx = c.getContext('2d');

    // Draw oval clip
    cx.beginPath();
    cx.ellipse(outSize / 2, c.height / 2, outSize / 2, c.height / 2, 0, 0, Math.PI * 2);
    cx.closePath();
    cx.clip();

    // Draw the image
    cx.drawImage(img, sx, sy, size, size * 1.25, 0, 0, outSize, c.height);

    return c;
}

export function getFaceImage() {
    return faceImage;
}

/**
 * Create a default smiley face for when no photo is uploaded.
 */
export function createDefaultFace() {
    const size = 200;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size * 1.25;
    const cx = c.getContext('2d');

    // Oval face
    cx.fillStyle = '#FFCC80';
    cx.beginPath();
    cx.ellipse(size / 2, c.height / 2, size / 2 - 4, c.height / 2 - 4, 0, 0, Math.PI * 2);
    cx.fill();

    // Eyes
    cx.fillStyle = '#333';
    cx.beginPath();
    cx.arc(size * 0.35, c.height * 0.4, 8, 0, Math.PI * 2);
    cx.arc(size * 0.65, c.height * 0.4, 8, 0, Math.PI * 2);
    cx.fill();

    // Smile
    cx.strokeStyle = '#333';
    cx.lineWidth = 3;
    cx.beginPath();
    cx.arc(size / 2, c.height * 0.5, 30, 0.2, Math.PI - 0.2);
    cx.stroke();

    defaultFaceCanvas = c;
    return c;
}

export function getActiveFace() {
    return faceImage || defaultFaceCanvas || createDefaultFace();
}

export function skipPhoto() {
    faceImage = null;
}
