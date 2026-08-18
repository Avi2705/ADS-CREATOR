"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLeadToCustomer = exports.assignLeadToEmployee = exports.getEmployees = exports.createEmployee = exports.getB2BBusinesses = exports.getB2CCustomers = exports.getDashboardStats = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../users/user.model"));
const lead_model_1 = __importDefault(require("../leads/lead.model"));
const getDashboardStats = async (req, res) => {
    try {
        const totalB2C = await user_model_1.default.countDocuments({ accountType: 'B2C' });
        const totalB2B = await user_model_1.default.countDocuments({ accountType: 'B2B' });
        const totalLeads = await lead_model_1.default.countDocuments({ status: { $ne: 'CONVERTED' } });
        const totalEmployees = await user_model_1.default.countDocuments({ role: { $in: ['EMPLOYEE', 'MANAGER', 'SUPPORT', 'DESIGNER'] } });
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getB2CCustomers = async (req, res) => {
    try {
        const customers = await user_model_1.default.find({ accountType: 'B2C' }).select('-passwordHash');
        res.json({ success: true, data: customers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch B2C customers' });
    }
};
exports.getB2CCustomers = getB2CCustomers;
const getB2BBusinesses = async (req, res) => {
    try {
        const businesses = await user_model_1.default.find({ accountType: 'B2B' }).select('-passwordHash');
        res.json({ success: true, data: businesses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch B2B businesses' });
    }
};
exports.getB2BBusinesses = getB2BBusinesses;
// ==========================================
// EMPLOYEE MANAGEMENT CONTROLLERS
// ==========================================
const createEmployee = async (req, res) => {
    try {
        const { name, email, password, role, department, designation, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const referenceId = `EMP-REF-${Math.floor(100000 + Math.random() * 900000)}`;
        const newEmployee = await user_model_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create employee' });
    }
};
exports.createEmployee = createEmployee;
const getEmployees = async (req, res) => {
    try {
        const employees = await user_model_1.default.find({
            role: { $in: ['EMPLOYEE', 'MANAGER', 'SUPPORT', 'DESIGNER'] }
        }).select('-passwordHash');
        res.json({ success: true, data: employees });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch employees' });
    }
};
exports.getEmployees = getEmployees;
const assignLeadToEmployee = async (req, res) => {
    try {
        const { leadId, employeeRefId, employeeName } = req.body;
        const lead = await lead_model_1.default.findByIdAndUpdate(leadId, { assignedEmployeeRefId: employeeRefId, assignedEmployeeName: employeeName }, { new: true });
        if (!lead)
            return res.status(404).json({ success: false, message: 'Lead not found' });
        // Update employee assigned count
        await user_model_1.default.findOneAndUpdate({ referenceId: employeeRefId }, { $inc: { assignedLeadsCount: 1 } });
        res.json({ success: true, message: 'Lead assigned successfully', data: lead });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to assign lead' });
    }
};
exports.assignLeadToEmployee = assignLeadToEmployee;
const convertLeadToCustomer = async (req, res) => {
    try {
        const { leadId, subscriptionPlan } = req.body;
        const lead = await lead_model_1.default.findById(leadId);
        if (!lead)
            return res.status(404).json({ success: false, message: 'Lead not found' });
        const custRefId = `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;
        // Update or create User as B2C Customer
        let user = await user_model_1.default.findById(lead.userId);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to convert lead' });
    }
};
exports.convertLeadToCustomer = convertLeadToCustomer;
//# sourceMappingURL=admin.controller.js.map