const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/getAudio', async (req, res) => {
    const videoUrl = req.query.videoUrl;

    if (!videoUrl) {
        return res.status(400).json({ error: 'videoUrl parameter is required' });
    }

    // Modified command to get high-quality audio
    // -f 251/250/249 selects the best available WebM Opus audio format
    // If not available, falls back to 171 (WebM Vorbis) or 140 (M4A AAC)
    const command = `/usr/bin/yt-dlp -f "251/250/249/171/140" --extract-audio --audio-quality 0 -g "${videoUrl.replace(/"/g, '\\"')}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: `Failed to fetch audio: ${stderr || error.message}` });
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }

        const audioUrl = stdout.trim();
        if (!audioUrl) {
            return res.status(500).json({ error: 'Failed to extract audio URL from yt-dlp' });
        }

        res.json({ audioUrl });
    });
});

// Add an endpoint to get available formats (helpful for debugging)
app.get('/getFormats', async (req, res) => {
    const videoUrl = req.query.videoUrl;

    if (!videoUrl) {
        return res.status(400).json({ error: 'videoUrl parameter is required' });
    }

    const command = `/usr/bin/yt-dlp -F "${videoUrl.replace(/"/g, '\\"')}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: `Failed to fetch formats: ${stderr || error.message}` });
        }

        res.json({ formats: stdout });
    });
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));