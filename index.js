import express from 'express';
import ytVideo from './routes/ytVideo.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

app.use('/api/videos', ytVideo);

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
    console.log(`listening at PORT: ${port}`);
});
