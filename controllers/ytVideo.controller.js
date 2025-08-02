import ytdl from '@distube/ytdl-core';

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

export const getInfo = async (req, res) => {
    const link = req.query.v;

    try {
        if (!ytdl.validateURL(link)) {
            res.status(400).json({ success: false, message: 'Invalid URL' });
            return;
        }

        const info = await ytdl.getInfo(link, { agent });

        let audioFormatList = [];
        let videoFormatList = [];

        // Filter formats to get audio formats separately
        info.formats
            .filter((format) => format.hasAudio && format.hasVideo === false)
            .forEach((format) => {
                if (!audioFormatList.includes(format.itag)) {
                    audioFormatList.push({
                        itag: format.itag,
                        bitRate: format.audioBitrate,
                        type: format.mimeType,
                    });
                }
            });

        // Filter formats to get video formats separately
        info.formats
            .filter((format) => format.hasVideo && format.container === 'mp4')
            .forEach((format) => {
                videoFormatList.push({
                    itag: format.itag,
                    quality: format.qualityLabel,
                    type: format.mimeType,
                });
            });

        console.log(audioFormatList);
        console.log(videoFormatList);

        res.json({
            success: true,
            data: {
                thumbnails: info.videoDetails.thumbnails,
                title: info.videoDetails.title,
                quality: [
                    info.formats.filter(
                        (format) =>
                            format.hasVideo &&
                            format.container === 'mp4' &&
                            format.codecs.includes('av01.0.08M.08')
                    ),
                ],
            },
        });
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
};

export const getVideo = async (req, res) => {
    const link = req.query.v;
    const videoQuality = req.query.videoQuality || 'highestvideo';
    const audioQuality = req.query.audioQuality || 'highestaudio';

    try {
        const info = await ytdl.getBasicInfo(link);

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}"`);

        ytdl(link, { agent, quality: videoQuality });
        ytdl(link, { agent, quality: audioQuality });
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
};
