import { Router } from 'express';
import { getFeed, getVideo, generateVideo, markAsViewed } from '../controllers/video.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/feed', authenticateToken, getFeed);
router.get('/:id', authenticateToken, getVideo);
router.post('/generate', authenticateToken, generateVideo);
router.put('/:id/viewed', authenticateToken, markAsViewed);

export default router;
