const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;

const app = express();
app.use(cors());
app.use(express.json());

// Initialize yt-dlp-wrap
const ytDlpWrap = new YTDlpWrap();

app.get('/getAudio', async (req, res) => {
    const videoUrl = req.query.videoUrl;

    if (!videoUrl) {
        return res.status(400).json({ error: 'videoUrl parameter is required' });
    }

    try {
        // Execute yt-dlp command to get the audio URL
        const result = await ytDlpWrap.execPromise([
            videoUrl,
            '-f', 'bestaudio',
            '-g' // Output direct URL of the audio stream
        ]);

        res.json({ audioUrl: result.trim() });
    } catch (error) {
        console.error('yt-dlp error:', error);
        res.status(500).json({ error: 'Failed to fetch audio' });
    }
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
