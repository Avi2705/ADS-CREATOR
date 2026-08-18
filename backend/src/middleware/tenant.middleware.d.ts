import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        tenantId?: string;
        accountType: string;
    };
}
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireTenant: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requirePermission: (requiredPermission: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkSubscriptionLimits: (limitKey: 'maxProducts' | 'maxUsers' | 'maxImageAds' | 'maxVideoAds') => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tenant.middleware.d.ts.map