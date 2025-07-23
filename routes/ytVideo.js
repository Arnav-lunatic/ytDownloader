import { Router } from 'express';
import ytdl from '@distube/ytdl-core';

const router = Router();
const YOUTUBE_COOKIE_STRING = process.env.YOUTUBE_COOKIE || '';

let agent;

if (YOUTUBE_COOKIE_STRING) {
    try {
        // Convert the raw cookie string into the JSON format ytdl-core needs
        const cookies = YOUTUBE_COOKIE_STRING.split(';').map((cookie) => {
            const parts = cookie.trim().split('=');
            return {
                name: parts[0],
                value: parts.slice(1).join('='), // Join back in case value had '='
            };
        });

        // Create the agent with the formatted cookies
        agent = ytdl.createAgent(cookies);
        console.log('Successfully created YouTube agent with cookies.');
    } catch (err) {
        console.error('Error parsing or creating agent from cookie string:', err);
    }
} else {
    console.warn('WARNING: YOUTUBE_COOKIE environment variable not set. Downloads may fail.');
}

router.get('/info', async (req, res) => {
    const link = req.query.v;

    try {
        if (!ytdl.validateURL(link)) {
            res.status(400).json({ success: false, message: 'Invalid URL' });
            return;
        }

        const info = await ytdl.getBasicInfo(link, {agent});

        res.json({
            success: true,
            data: {
                thumbnails: info.videoDetails.thumbnails,
                title: info.videoDetails.title,
            },
        });
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
});

router.get('/download', async (req, res) => {
    const link = req.query.v;

    try {
        const info = await ytdl.getBasicInfo(link);

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

        ytdl(link, {
            agent,
            quality: 'highestvideo',
        }).pipe(res);

    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
});

export default router;
