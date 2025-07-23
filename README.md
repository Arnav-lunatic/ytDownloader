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

## Deployment Note
If you want to deploy this app on platforms like Render, make sure to add your YouTube cookies in the environment variables (`YOUTUBE_COOKIE`) for proper video access and downloads.

## .gitignore
This project ignores:
- `node_modules` (dependencies)
- `.env` (environment variables)
- `.vscode` (editor settings)

## License
ISC
