import { Router } from 'express';
import { requireAuth, requirePermission, requireRole } from '../../middleware/tenant.middleware';
import * as adminController from './admin.controller';

const router = Router();

// Base middleware for all admin routes - must be authenticated and at least have some admin access
router.use(requireAuth);

// Dashboard Overview - Requires Analytics View permission
router.get('/dashboard', requirePermission('ANALYTICS_VIEW'), adminController.getDashboardStats);

// B2C Customer Management
router.get('/b2c/customers', requirePermission('CUSTOMERS_VIEW'), adminController.getB2CCustomers);
router.post('/b2c/customers', requirePermission('CUSTOMERS_VIEW'), adminController.createB2CCustomer);

// B2B Business Management
router.get('/b2b/businesses', requirePermission('CUSTOMERS_VIEW'), adminController.getB2BBusinesses);
router.post('/b2b/businesses', requirePermission('CUSTOMERS_VIEW'), adminController.createB2BBusiness);

// Employee Management
router.post('/employees', adminController.createEmployee);
router.get('/employees', adminController.getEmployees);
router.post('/assign-lead', adminController.assignLeadToEmployee);
router.post('/convert-lead', adminController.convertLeadToCustomer);

export default router;

