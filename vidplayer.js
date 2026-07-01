const renderMedia = require('render-media');
const path = require('path');

// Keep track of the active rendering session so we can kill it on close
let currentMediaElement = null;

/**
 * Pipes a local file path into the video player using range-compliant chunking
 * @param {string} filePath - Absolute path to the local video file
 */
function playTape(filePath) {
    const overlay = document.getElementById('player-overlay');
    const player = document.getElementById('app-video-player');

    if (!overlay || !player) {
        console.error("🔴 Video player DOM elements are missing!");
        return;
    }

    // Clean up any previous active stream before starting a new one
    if (currentMediaElement) {
        try { currentMediaElement.destroy(); } catch(e){}
    }

    overlay.style.display = 'flex';

    // Fake a file object that render-media expects
    const file = {
        name: path.basename(filePath),
        createReadStream: (opts) => require('fs').createReadStream(filePath, opts)
    };

    // This handles the chunk buffering and stops the 4-6s freezing permanently
    currentMediaElement = renderMedia.render(file, player, {
        autoplay: true,
        controls: true
    }, (err, elem) => {
        if (err) {
            console.error("🔴 render-media stream error:", err);
        } else {
            console.log("🎬 Video stream initialized successfully via render-media");
            elem.play().catch(e => console.log("Autoplay blocked or delayed:", e));
        }
    });
}

/**
 * Stops playback and completely tears down the stream pipeline
 */
function closeTape() {
    const overlay = document.getElementById('player-overlay');
    const player = document.getElementById('app-video-player');

    if (currentMediaElement) {
        try { currentMediaElement.destroy(); } catch(e){}
        currentMediaElement = null;
    }

    if (player) {
        player.pause();
        player.src = "";
    }

    if (overlay) {
        overlay.style.display = 'none';
    }
}

module.exports = { playTape, closeTape };
