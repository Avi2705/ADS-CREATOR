import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../users/user.model';
import Lead from '../leads/lead.model';

import Subscription from './models/Subscription';
import Payment from './models/Payment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalB2C = await User.countDocuments({ accountType: 'B2C' });
    const totalB2B = await User.countDocuments({ accountType: 'B2B' });
    const totalLeads = await Lead.countDocuments({ status: { $ne: 'CONVERTED' } });
    const totalEmployees = await User.countDocuments({ role: { $in: ['EMPLOYEE', 'MANAGER', 'SUPPORT', 'DESIGNER'] } });
    
    res.json({
      success: true,
      data: {
        totalB2C,
        totalB2B,
        totalLeads,
        totalEmployees,
        activeSubscriptions: totalB2C,
        expiredSubscriptions: 0,
        pendingPayments: 0,
        totalRevenue: totalB2C * 3499,
        totalAds: 120
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

export const getB2CCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find({ accountType: 'B2C' }).select('-passwordHash');
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch B2C customers' });
  }
};

export const createB2CCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, password, subscription, mobile } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referenceId = `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newCustomer = await User.create({
      referenceId,
      name,
      email,
      passwordHash,
      accountType: 'B2C',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      subscription: subscription || 'B2C Growth',
      mobile: mobile || '',
      profileStatus: 'COMPLETED'
    });

    res.status(201).json({
      success: true,
      message: 'B2C Customer account created successfully',
      customer: newCustomer
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create B2C customer' });
  }
};

export const getB2BBusinesses = async (req: Request, res: Response) => {
  try {
    const businesses = await User.find({ accountType: 'B2B' }).select('-passwordHash');
    res.json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch B2B businesses' });
  }
};

export const createB2BBusiness = async (req: Request, res: Response) => {
  try {
    const { companyName, ownerName, email, password, subscription } = req.body;
    if (!companyName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Company name, owner name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referenceId = `BUS-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBusiness = await User.create({
      referenceId,
      name: ownerName,
      email,
      passwordHash,
      accountType: 'B2B',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      subscription: subscription || 'Pro',
      companyName,
      profileStatus: 'COMPLETED'
    });

    res.status(201).json({
      success: true,
      message: 'B2B Business account created successfully',
      business: newBusiness
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create B2B business' });
  }
};

// ==========================================
// EMPLOYEE MANAGEMENT CONTROLLERS
// ==========================================

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referenceId = `EMP-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEmployee = await User.create({
      referenceId,
      name,
      email,
      passwordHash,
      accountType: 'EMPLOYEE',
      role: role || 'EMPLOYEE',
      status: 'ACTIVE',
      department: department || 'Lead & Sales Operations',
      designation: designation || 'Operations Specialist',
      mobile: phone || '',
      profileStatus: 'COMPLETED'
    });

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully',
      employee: {
        _id: newEmployee._id,
        referenceId: newEmployee.referenceId,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        department: newEmployee.department,
        designation: newEmployee.designation,
        status: newEmployee.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create employee' });
  }
};

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await User.find({ 
      role: { $in: ['EMPLOYEE', 'MANAGER', 'SUPPORT', 'DESIGNER'] } 
    }).select('-passwordHash');

    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
};

export const assignLeadToEmployee = async (req: Request, res: Response) => {
  try {
    const { leadId, employeeRefId, employeeName } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedEmployeeRefId: employeeRefId, assignedEmployeeName: employeeName },
      { new: true }
    );

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Update employee assigned count
    await User.findOneAndUpdate(
      { referenceId: employeeRefId },
      { $inc: { assignedLeadsCount: 1 } }
    );

    res.json({ success: true, message: 'Lead assigned successfully', data: lead });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to assign lead' });
  }
};

export const convertLeadToCustomer = async (req: Request, res: Response) => {
  try {
    const { leadId, subscriptionPlan } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const custRefId = `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update or create User as B2C Customer
    let user = await User.findById(lead.userId);
    if (user) {
      user.status = 'ACTIVE';
      user.accountType = 'B2C';
      user.role = 'CUSTOMER';
      user.paymentStatus = 'PAID';
      user.referenceId = custRefId;
      await user.save();
    }

    lead.status = 'CONVERTED';
    lead.subscriptionPlan = subscriptionPlan || 'B2C Growth';
    await lead.save();

    res.json({
      success: true,
      message: 'Lead converted to active B2C Customer successfully',
      referenceId: custRefId,
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to convert lead' });
  }
};

