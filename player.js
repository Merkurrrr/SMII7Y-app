const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

async function getStreamUrl(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Request info with a browser-like user agent to avoid policy blocks
    const info = await ytdl.getInfo(url, {
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }
    });

    // Find the absolute highest quality stream that has BOTH video and audio combined
    const format = ytdl.chooseFormat(info.formats, {
        quality: 'highest',
        filter: 'audioandvideo'
    });

    if (!format || !format.url) {
        throw new Error("No playable direct link found");
    }

    return format.url;
}

function downloadVideo(videoId, statusCallback) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const outputPath = path.join(DOWNLOAD_DIR, `${videoId}.mp4`);

    if (fs.existsSync(outputPath)) {
        statusCallback(100, outputPath);
        return;
    }

    const stream = ytdl(url, { quality: 'highest', filter: 'audioandvideo' });
    const fileStream = fs.createWriteStream(outputPath);

    stream.pipe(fileStream);

    stream.on('progress', (chunkLength, downloaded, total) => {
        const percent = Math.floor((downloaded / total) * 100);
        statusCallback(percent, null);
    });

    stream.on('end', () => {
        statusCallback(100, outputPath);
    });

    stream.on('error', (err) => {
        console.error("🔴 Download pipeline error:", err);
        statusCallback(0, null);
    });
}

module.exports = { getStreamUrl, downloadVideo };
