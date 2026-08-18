import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    tenantId?: string;
    accountType: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.tenantId) {
    res.status(403).json({ message: 'Tenant context is required for this action' });
    return;
  }
  // The tenantId is now guaranteed to exist on req.user
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
      return;
    }
    next();
  };
};

import Role from '../modules/admin/models/Role';

export const requirePermission = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    try {
      const roleDoc = await Role.findOne({ name: req.user.role });
      if (!roleDoc || !roleDoc.permissions.includes(requiredPermission)) {
        res.status(403).json({ message: `Forbidden: Requires permission ${requiredPermission}` });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error checking permissions' });
    }
  };
};

import Subscription from '../modules/admin/models/Subscription';
import SubscriptionPlan from '../modules/admin/models/SubscriptionPlan';

export const checkSubscriptionLimits = (limitKey: 'maxProducts' | 'maxUsers' | 'maxImageAds' | 'maxVideoAds') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.tenantId) {
      res.status(403).json({ message: 'Tenant context required' });
      return;
    }
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }
    try {
      const sub = await Subscription.findOne({ tenantId: req.user.tenantId, status: 'ACTIVE' });
      if (!sub) {
        res.status(403).json({ message: 'No active subscription found for this tenant.' });
        return;
      }
      const plan = await SubscriptionPlan.findById(sub.planId);
      if (!plan) {
        res.status(403).json({ message: 'Subscription plan not found.' });
        return;
      }

      const limit = plan[limitKey];
      (req as any).subscriptionLimit = limit;
      next();
    } catch (err) {
      res.status(500).json({ message: 'Error checking subscription limits' });
    }
  };
};
