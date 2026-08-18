import { Response } from 'express';
import { AuthRequest } from '../../middleware/tenant.middleware';
export declare const createCampaign: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Bulk Ad Launcher Core
 * Takes a Campaign ID and launches all APPROVED creatives across the specified platforms via API (simulated via Queue).
 */
export declare const bulkLaunchAds: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=campaign.controller.d.ts.map