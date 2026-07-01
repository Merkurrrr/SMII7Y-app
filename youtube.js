const fs = require('fs');
const path = require('path');

const VIDEO_DIR = path.join(__dirname, 'dvid');

// Automatically ensure the video directory path exists on startup
if (!fs.existsSync(VIDEO_DIR)) {
    fs.mkdirSync(VIDEO_DIR);
}

function fetchLocalVideos() {
    try {
        const files = fs.readdirSync(VIDEO_DIR);

        // Filter out everything except physical video formats
        const videoFiles = files.filter(file => ['.mp4', '.mkv', '.avi', '.mov', '.webm'].includes(path.extname(file).toLowerCase()));

        return videoFiles.map(file => {
            const filenameWithoutExt = path.basename(file, path.extname(file));

            return {
                title: filenameWithoutExt.replace(/_/g, ' '), // Cleans file underscores into visible titles
                              fileName: file,
                              filePath: path.join(VIDEO_DIR, file)
            };
        });
    } catch (err) {
        console.error("🔴 Failed reading local video assets folder:", err);
        return [];
    }
}

module.exports = { fetchLocalVideos };
