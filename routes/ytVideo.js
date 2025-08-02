import { Router } from 'express';
import {getInfo, getVideoOnly, getAudioOnly, getMerge} from '../controllers/ytVideo.controller.js';

const router = Router();

router.get('/info', getInfo);

router.get('/download-merge', getMerge);
router.get('/download-audio', getAudioOnly);
router.get('/download-video', getVideoOnly);

export default router;
