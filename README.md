# YouTube Downloader API

A fullstack YouTube downloader app with:
- **Backend:** Express.js API for fetching YouTube video info and streaming downloads using `@distube/ytdl-core` and `ffmpeg`. You can download:
  - Audio only
  - Video only
  - Merged audio + video (MP4)
- **Frontend:** Modern UI (HTML/CSS/JS) for users to paste YouTube links, select formats/quality, and download files.

## How Streaming and Pipe Work in This Project

The backend uses Node.js streams to efficiently handle large video/audio files:
- **ytdl-core** streams YouTube video/audio data directly from YouTube servers.
- **ffmpeg** is spawned as a child process and receives video/audio streams via pipes (`pipe:3`, `pipe:4`).
- The merged output from ffmpeg is piped (`pipe:5`) directly to the HTTP response, so the user downloads the file as it is processed—no temp files needed.

**Benefits:**
- Low memory usage (no full file in RAM)
- Fast downloads (starts immediately)
- Scalable for multiple users

**Example:**
```js
const videoStream = ytdl(link, { quality: videoItag });
const audioStream = ytdl(link, { quality: audioItag });
const mergedStream = await mergeAudioVideoStream(videoStream, audioStream);
mergedStream.pipe(res); // Sends merged file to user
```

## Backend Endpoints

## Features
- Get YouTube video info (title, thumbnails)
- Download YouTube videos as MP4


### `/api/videos/info`
Returns video info, available formats, and thumbnails.

### `/api/videos/download-merge`
Streams merged audio/video as MP4 using selected qualities.

### `/api/videos/download-audio`
Streams audio only.

### `/api/videos/download-video`
Streams video only.

### GET `/api/videos/info?v=<video_url>`
Returns video title and thumbnails.

**Example:**
```
GET /api/videos/info?v=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
**Response:**
```json
{
  "thumbnails": [ ... ],
  "title": "Video Title"
}
```

### GET `/api/videos/download?v=<video_url>`
Downloads the video as an MP4 file.

**Example:**
```
GET /api/videos/download?v=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```


## Setup (Backend)


1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file (optional) for environment variables:
   - Example:
     ```env
     YOUTUBE_COOKIE=your_cookie_string_here
     PORT=8000
     ```
   - The `.env` file is ignored by git (see `.gitignore`).
4. Start the server:
   ```sh
   npm start
   ```
   or for development:
   ```sh
   npm run dev
   ```

The server runs on [http://localhost:8000](http://localhost:8000) by default.

## Frontend

The frontend is in `/public/index.html`, `/public/script.js`, and `/public/style.css`.

- Paste a YouTube link, select format/quality, and download.
- UI uses Tailwind CSS and Font Awesome for a modern look.
- Communicates with backend endpoints for info and downloads.

## Deployment Note
If you want to deploy this app on platforms like Render, make sure to add your YouTube cookies in the environment variables (`YOUTUBE_COOKIE`) for proper video access and downloads.

## .gitignore
This project ignores:
- `node_modules` (dependencies)
- `.env` (environment variables)
- `.vscode` (editor settings)



## What I Learned

This project helped me learn and apply:
- How to use Node.js streams for efficient file handling and downloads.
- How to pipe data between processes (ytdl-core → ffmpeg → HTTP response) for real-time merging and delivery.
- How to work with child processes in Node.js using `spawn` and manage their input/output streams.
- How to build a fullstack app with a modern frontend and a scalable backend API.
- How to design RESTful endpoints for media processing and downloads.

## License
ISC
