import { Router } from 'express';
import { addContentSource, getContentSources } from '../controllers/content.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/sources', authenticateToken, addContentSource);
router.get('/sources', authenticateToken, getContentSources);

export default router;
