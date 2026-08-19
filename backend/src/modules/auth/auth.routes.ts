import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  forgotPassword, 
  verifyOtp, 
  resetPassword 
} from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Password recovery & Nodemailer reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
