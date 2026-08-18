import { Router } from 'express';
import { generateFreeAd, getFreeAdStatus, getPublicShowcaseAds } from './freeAd.controller';

const router = Router();

router.get('/status', getFreeAdStatus);
router.post('/generate', generateFreeAd);
router.get('/public-showcase', getPublicShowcaseAds);

export default router;
