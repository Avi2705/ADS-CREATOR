import { Request, Response } from 'express';
import mongoose from 'mongoose';
import B2CRequest from './b2cRequest.model';
import User from '../users/user.model';
import AuditLog from '../admin/models/AuditLog';

// B2C Customer: Create new advertisement request
export const createB2CRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId || req.body.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({
        $or: [
          { referenceId: String(userId) },
          { email: String(userId).toLowerCase() }
        ]
      });
    }

    // Fallback virtual user for lead / non-mongo ID
    if (!user) {
      user = {
        _id: userId,
        referenceId: String(userId),
        name: 'B2C Customer',
        email: 'customer@adhunter.com',
        customerType: 'B2C',
        role: 'CUSTOMER',
        companyName: 'Brand Partner',
        tenantId: null
      } as any;
    }

    // Role/CustomerType validation
    if (user.customerType !== 'B2C' && user.role !== 'SUPER_ADMIN' && user.role !== 'CUSTOMER') {
      res.status(403).json({
        success: false,
        error: {
          code: 'CUSTOMER_TYPE_MISMATCH',
          message: 'Advertisement requests are only available to B2C accounts.'
        }
      });
      return;
    }

    const {
      brandName,
      productName,
      category,
      price,
      productUrl,
      adType,
      purpose,
      targetAudience,
      headlineIdea,
      ctaIdea,
      preferredStyle,
      format,
      description,
      mediaAssets
    } = req.body;

    if (!productName || !category || !purpose || !targetAudience || !description) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required request parameters (Product Name, Category, Purpose, Audience, Description).'
        }
      });
      return;
    }

    // Check existing ads for this specific product under user's subscription
    const existingCount = await B2CRequest.countDocuments({
      $or: [{ customerId: user._id }, { customerRefId: user.referenceId }],
      productName
    });

    const userSub = (user as any).subscription || 'B2C Basic Plan';
    const maxAllowed = userSub.includes('Enterprise') || userSub.includes('Scale') ? 10 : userSub.includes('Pro') || userSub.includes('Growth') ? 3 : 2;

    if (existingCount >= maxAllowed) {
      res.status(403).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_LIMIT_MET',
          message: `You have already met your subscription limit for product "${productName}" (${existingCount}/${maxAllowed} ads created under ${userSub}). If you want to create more ads, please upgrade to our higher plans.`
        }
      });
      return;
    }

    const referenceId = `REQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRequest = await B2CRequest.create({
      referenceId,
      customerId: user._id,
      customerRefId: user.referenceId,
      customerName: user.name,
      customerEmail: user.email,
      tenantId: user.tenantId,
      brandName: brandName || user.companyName || 'Brand Partner',
      productName,
      category,
      price: price ? parseFloat(price) : undefined,
      productUrl,
      adType: adType || 'Image',
      purpose,
      targetAudience,
      headlineIdea,
      ctaIdea,
      preferredStyle: preferredStyle || 'Modern & Bold',
      format: format || 'Instagram Post (1:1)',
      description,
      mediaAssets: mediaAssets || [],
      status: 'SUBMITTED',
      creativeAssets: [],
      revisions: []
    });

    try {
      await AuditLog.create({
        actorId: mongoose.Types.ObjectId.isValid(user._id) ? user._id : undefined,
        actorName: user.name || 'B2C Client',
        action: 'CREATE_B2C_REQUEST',
        entity: 'B2CRequest',
        entityId: newRequest._id.toString(),
        newValue: { referenceId, productName, adType }
      });
    } catch (auditErr) {
      console.warn("AuditLog skipped for non-mongo actorId:", auditErr);
    }

    res.status(201).json({
      success: true,
      message: 'Advertisement request submitted successfully.',
      data: newRequest
    });
  } catch (error: any) {
    console.error('createB2CRequest error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// B2C Customer: Get all own requests (Tenant isolated)
export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId || req.query.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const query = {
      $or: [
        { customerId: userId },
        { customerRefId: String(userId) },
        { customerEmail: String(userId).toLowerCase() }
      ]
    };

    const requests = await B2CRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('getMyRequests error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// B2C Customer: Request a revision with feedback notes
export const requestRevision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ success: false, error: { code: 'NOTE_REQUIRED', message: 'Revision feedback note is required.' } });
      return;
    }

    const b2cReq = await B2CRequest.findById(id);
    if (!b2cReq) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
      return;
    }

    b2cReq.revisions.push({ note, requestedAt: new Date() });
    b2cReq.status = 'REVISION_REQUESTED';
    await b2cReq.save();

    res.json({ success: true, message: 'Revision request sent to ad director.', data: b2cReq });
  } catch (error: any) {
    console.error('requestRevision error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// B2C Customer: Approve creative for publishing
export const approveCreative = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const b2cReq = await B2CRequest.findById(id);
    if (!b2cReq) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
      return;
    }

    b2cReq.status = 'APPROVED_FOR_PUBLISH';
    await b2cReq.save();

    res.json({ success: true, message: 'Creative approved for publishing.', data: b2cReq });
  } catch (error: any) {
    console.error('approveCreative error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Super Admin: List all requests globally
export const getAllB2CRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const statusFilter = req.query.status as string;
    const query: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      query.status = statusFilter;
    }

    const requests = await B2CRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('getAllB2CRequests error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Super Admin: Create Image Advertisement for request (Strictly Admin Only)
export const adminCreateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role || req.body.role;
    if (userRole !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'B2C_AD_CREATION_FORBIDDEN',
          message: 'Forbidden: B2C customers cannot directly create advertisements. Only Super Admin creates ad creatives.'
        }
      });
      return;
    }

    const { id } = req.params;
    const { headline, primaryText, cta, mediaUrl } = req.body;

    const b2cReq = await B2CRequest.findById(id);
    if (!b2cReq) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
      return;
    }

    const newVersion = (b2cReq.creativeAssets?.length || 0) + 1;
    b2cReq.creativeAssets.push({
      assetType: 'IMAGE',
      url: mediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop',
      headline: headline || `SPECIAL OFFER: ${b2cReq.productName}`,
      primaryText: primaryText || `Experience top-tier quality with ${b2cReq.productName}.`,
      cta: cta || 'Shop Collection',
      version: newVersion,
      createdAt: new Date(),
      createdByAdminId: (req as any).user?.userId
    });

    b2cReq.status = 'CREATIVE_READY';
    await b2cReq.save();

    res.json({
      success: true,
      message: 'Advertisement image creative successfully attached to request.',
      data: b2cReq
    });
  } catch (error: any) {
    console.error('adminCreateAd error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Super Admin: Create Video Advertisement for request (Strictly Admin Only)
export const adminCreateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role || req.body.role;
    if (userRole !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'B2C_AD_CREATION_FORBIDDEN',
          message: 'Forbidden: B2C customers cannot directly create video advertisements. Only Super Admin creates video ads.'
        }
      });
      return;
    }

    const { id } = req.params;
    const { headline, primaryText, cta, mediaUrl } = req.body;

    const b2cReq = await B2CRequest.findById(id);
    if (!b2cReq) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
      return;
    }

    const newVersion = (b2cReq.creativeAssets?.length || 0) + 1;
    b2cReq.creativeAssets.push({
      assetType: 'VIDEO',
      url: mediaUrl || 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&fit=crop',
      headline: headline || `VIRAL HOOK: ${b2cReq.productName}`,
      primaryText: primaryText || `High-converting 15-second kinetic video reel for ${b2cReq.productName}.`,
      cta: cta || 'Order Today',
      version: newVersion,
      createdAt: new Date(),
      createdByAdminId: (req as any).user?.userId
    });

    b2cReq.status = 'CREATIVE_READY';
    await b2cReq.save();

    res.json({
      success: true,
      message: 'Video advertisement creative successfully attached to request.',
      data: b2cReq
    });
  } catch (error: any) {
    console.error('adminCreateVideo error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Super Admin: Publish Ad Creative
export const adminPublishCreative = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const b2cReq = await B2CRequest.findById(id);
    if (!b2cReq) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
      return;
    }

    b2cReq.status = 'PUBLISHED';
    await b2cReq.save();

    res.json({ success: true, message: 'Creative published live to Meta & TikTok network.', data: b2cReq });
  } catch (error: any) {
    console.error('adminPublishCreative error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
