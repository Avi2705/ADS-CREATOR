import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../users/user.model';
import Tenant from '../tenants/tenant.model';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production';

// In-memory array to store valid refresh tokens (for demo; production should store in DB)
let refreshTokens: string[] = [];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, accountType, businessType, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let tenantId = undefined;
    let role: 'BUSINESS_OWNER' | 'EXPLORER' = 'EXPLORER';

    if (accountType === 'BUSINESS') {
      if (!companyName || !businessType) {
        res.status(400).json({ message: 'Company name and business type are required for business accounts' });
        return;
      }
      const tenant = await Tenant.create({
        name: companyName,
        type: businessType
      });
      tenantId = tenant._id;
      role = 'BUSINESS_OWNER';
    }

    const user: any = await User.create({
      name,
      email,
      passwordHash,
      customerType: 'EXPLORER',
      accountType: 'EXPLORER',
      role: 'CUSTOMER',
      tenantId
    });

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId, customerType: user.customerType, accountType: user.accountType },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    refreshTokens.push(refreshToken);

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerType: user.customerType || 'EXPLORER',
        accountType: user.accountType,
        tenantId: user.tenantId,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId, customerType: user.customerType, accountType: user.accountType },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    refreshTokens.push(refreshToken);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerType: user.customerType || (user.role === 'SUPER_ADMIN' ? null : 'EXPLORER'),
        accountType: user.accountType,
        tenantId: user.tenantId,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh Token required' });
    return;
  }

  if (!refreshTokens.includes(refreshToken)) {
    res.status(403).json({ message: 'Invalid Refresh Token' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(403).json({ message: 'User no longer exists' });
      return;
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId, accountType: user.accountType },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Expired or invalid Refresh Token' });
  }
};
