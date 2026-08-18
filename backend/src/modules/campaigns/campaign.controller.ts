import { Response } from 'express';
import { AuthRequest } from '../../middleware/tenant.middleware';
import Campaign from './campaign.model';
import Creative from '../creatives/creative.model';

// Mock BullMQ Queue (to be fully implemented with Redis)
const mockAdLaunchQueue = {
  add: async (jobName: string, data: any) => {
    console.log(`[Queue] Added job ${jobName} for Tenant ${data.tenantId}`);
    return { id: Math.random().toString(36).substr(2, 9) };
  }
};

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, platforms, budget } = req.body;
    const tenantId = req.user!.tenantId;

    const campaign = await Campaign.create({
      tenantId,
      name,
      platforms,
      budget,
      status: 'DRAFT'
    });

    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Bulk Ad Launcher Core
 * Takes a Campaign ID and launches all APPROVED creatives across the specified platforms via API (simulated via Queue).
 */
export const bulkLaunchAds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const tenantId = req.user!.tenantId;

    const campaign = await Campaign.findOne({ _id: campaignId, tenantId });
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    // Find all approved creatives for this campaign
    const creatives = await Creative.find({ campaignId, tenantId, status: 'APPROVED' });
    if (creatives.length === 0) {
      res.status(400).json({ message: 'No approved creatives found to launch.' });
      return;
    }

    // Update campaign status
    campaign.status = 'ACTIVE';
    await campaign.save();

    const jobs = [];

    // Push each creative to the publishing queue
    for (const creative of creatives) {
      creative.publishStatus = 'PUBLISHING';
      await creative.save();

      // Dispatch to BullMQ for asynchronous Meta/TikTok API calls
      const job = await mockAdLaunchQueue.add('publish-ad', {
        tenantId,
        campaignId: campaign._id,
        creativeId: creative._id,
        platforms: campaign.platforms,
        assetUrl: creative.assetUrl
      });
      jobs.push(job.id);
    }

    res.json({
      message: `Successfully launched ${creatives.length} creatives to the publishing queue.`,
      jobIds: jobs
    });
  } catch (error) {
    console.error('Error in Bulk Ad Launcher:', error);
    res.status(500).json({ message: 'Server error during bulk launch' });
  }
};
