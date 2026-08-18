"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkLaunchAds = exports.createCampaign = void 0;
const campaign_model_1 = __importDefault(require("./campaign.model"));
const creative_model_1 = __importDefault(require("../creatives/creative.model"));
// Mock BullMQ Queue (to be fully implemented with Redis)
const mockAdLaunchQueue = {
    add: async (jobName, data) => {
        console.log(`[Queue] Added job ${jobName} for Tenant ${data.tenantId}`);
        return { id: Math.random().toString(36).substr(2, 9) };
    }
};
const createCampaign = async (req, res) => {
    try {
        const { name, platforms, budget } = req.body;
        const tenantId = req.user.tenantId;
        const campaign = await campaign_model_1.default.create({
            tenantId,
            name,
            platforms,
            budget,
            status: 'DRAFT'
        });
        res.status(201).json({ campaign });
    }
    catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createCampaign = createCampaign;
/**
 * Bulk Ad Launcher Core
 * Takes a Campaign ID and launches all APPROVED creatives across the specified platforms via API (simulated via Queue).
 */
const bulkLaunchAds = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const tenantId = req.user.tenantId;
        const campaign = await campaign_model_1.default.findOne({ _id: campaignId, tenantId });
        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found' });
            return;
        }
        // Find all approved creatives for this campaign
        const creatives = await creative_model_1.default.find({ campaignId, tenantId, status: 'APPROVED' });
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
    }
    catch (error) {
        console.error('Error in Bulk Ad Launcher:', error);
        res.status(500).json({ message: 'Server error during bulk launch' });
    }
};
exports.bulkLaunchAds = bulkLaunchAds;
//# sourceMappingURL=campaign.controller.js.map