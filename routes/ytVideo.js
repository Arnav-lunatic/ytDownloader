import { Router } from 'express';
import ytdl from '@distube/ytdl-core';

const router = Router();

router.get('/info', async (req, res) => {
    const link = req.query.v;

    try {
        if (!ytdl.validateURL(link)) {
            res.status(400).json({ success: false, message: 'Invalid URL' });
            return;
        }

        const info = await ytdl.getBasicInfo(link);

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

        ytdl(link, { quality: 'highestvideo' }).pipe(res);
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
});

export default router;
