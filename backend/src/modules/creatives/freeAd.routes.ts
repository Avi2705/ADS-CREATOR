import { Router } from 'express';
import { generateFreeAd, getFreeAdStatus } from './freeAd.controller';

const router = Router();

router.get('/status', getFreeAdStatus);
router.post('/generate', generateFreeAd);

export default router;
