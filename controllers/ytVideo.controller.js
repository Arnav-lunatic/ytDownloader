import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
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
                if (!audioFormatList.some((audioFormat) => audioFormat.itag === format.itag)) {
                    audioFormatList.push({
                        itag: format.itag,
                        bitRate: format.audioBitrate,
                        codec: format.codecs,
                        type: format.container,
                    });
                }
            });

        // Filter formats to get video formats separately
        info.formats
            .filter((format) => format.hasVideo && format.hasAudio === false)
            .forEach((format) => {
                if (!videoFormatList.some((videoFormat) => videoFormat.itag === format.itag)) {
                    videoFormatList.push({
                        itag: format.itag,
                        quality: format.qualityLabel,
                        codec: format.codecs,
                        type: format.container,
                    });
                }
            });

        res.json({
            success: true,
            data: {
                thumbnails: info.videoDetails.thumbnails,
                title: info.videoDetails.title,
                videoFormat: videoFormatList,
                audioFormat: audioFormatList,
            },
        });
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
};

// Helper: merge audio and video streams using ffmpeg, returns the merged output stream
async function mergeAudioVideoStream(videoStream, audioStream) {
    // create the ffmpeg process for muxing
    let ffmpegProcess = spawn(ffmpegPath, [
        // supress non-crucial messages
        '-loglevel', '8', '-hide_banner',
        // input audio and video by pipe
        '-i', 'pipe:3', '-i', 'pipe:4',
        // map audio and video correspondingly
        '-map', '0:a', '-map', '1:v',
        // no need to change the codec
        '-c', 'copy',
        // output mp4 and pipe
        '-f', 'matroska', 'pipe:5'
    ], {
        // no popup window for Windows users
        windowsHide: true,
        stdio: [
            // silence stdin/out, forward stderr,
            'inherit', 'inherit', 'inherit',
            // and pipe audio, video, output
            'pipe', 'pipe', 'pipe'
        ]
    });

    audioStream.pipe(ffmpegProcess.stdio[3]);
    videoStream.pipe(ffmpegProcess.stdio[4]);

    // return the output stream
    ffmpegProcess.on('error', (error) => {
        console.error('Error starting ffmpeg process:', error);
    });
    ffmpegProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`ffmpeg process exited with code ${code}`);
        }
    });
    ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`ffmpeg process closed with code ${code}`);
        }
    });

    // return the output stream
    return ffmpegProcess.stdio[5];
}

export const getMerge = async (req, res) => {
    const link = req.query.v;
    const videoItag = req.query.videoItag;
    const audioItag = req.query.audioItag;
    try {
        const info = await ytdl.getBasicInfo(link);

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}(${videoItag}-${audioItag}).mp4"`);

        const videoStream = ytdl(link, { agent, quality: videoItag });
        const audioStream = ytdl(link, { agent, quality: audioItag });

        const mergedStream = await mergeAudioVideoStream(videoStream, audioStream);

        mergedStream.pipe(res);

        mergedStream.on('error', (error) => {
            console.error('Error during merging streams:', error);
            res.status(500).send('Error processing video download');
        });
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
};

export const getVideoOnly = async (req, res) => {
    const link = req.query.v;
    const itag = req.query.videoItag;

    try {
        const info = await ytdl.getBasicInfo(link);

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}(${itag}).mp4"`);

        const videoStream = ytdl(link, { agent, quality: itag });

        videoStream.pipe(res);

        videoStream.on('error', (error) => {
            console.error('Error during video stream:', error);
            res.status(500).send('Error processing video download');
        });

    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
};

export const getAudioOnly = async (req, res) => {
    const link = req.query.v;
    const itag = req.query.audioItag;

    try {
        const info = await ytdl.getBasicInfo(link);

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}(${itag}).mp4"`);

        const audioStream = ytdl(link, { agent, quality: itag });

        audioStream.pipe(res);

        audioStream.on('error', (error) => {
            console.error('Error during audio stream:', error);
            res.status(500).send('Error processing audio download');
        });
    } catch (error) {
        res.status(404).send('Video Not Found');
        console.log(error);
    }
}
