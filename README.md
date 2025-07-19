# YouTube Downloader API

A simple Express.js API to fetch YouTube video information and download videos as MP4 files using `@distube/ytdl-core`.

## Features
- Get YouTube video info (title, thumbnails)
- Download YouTube videos as MP4

## Endpoints

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

## Setup

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run dev
   ```
   or
   ```sh
   node index.js
   ```

The server runs on [http://localhost:8000](http://localhost:8000) by default.

## License
ISC
