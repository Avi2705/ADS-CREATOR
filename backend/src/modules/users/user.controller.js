"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await user_model_1.default.findById(userId).select('-passwordHash');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const currentUser = await user_model_1.default.findById(userId);
        if (!currentUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, mobile, countryCode, country, dateOfBirth, gender, customerType, companyName, companyEmail, companyPhone, website, businessType, industry, productCategories, description } = req.body;
        // Strict State Machine Validation: One-Way Transitions
        if (customerType && customerType !== currentUser.customerType) {
            if (currentUser.customerType === 'B2B') {
                res.status(403).json({
                    message: 'Forbidden: Account type is locked to B2B and cannot be transitioned to B2C or Explorer.'
                });
                return;
            }
            if (currentUser.customerType === 'B2C') {
                res.status(403).json({
                    message: 'Forbidden: Account type is locked to B2C and cannot be transitioned to B2B or Explorer.'
                });
                return;
            }
            if (currentUser.customerType === 'EXPLORER') {
                if (customerType !== 'B2B' && customerType !== 'B2C') {
                    res.status(400).json({
                        message: 'Invalid transition: Explorer can only transition to B2B or B2C.'
                    });
                    return;
                }
                currentUser.customerType = customerType;
                currentUser.accountType = customerType;
                if (customerType === 'B2B') {
                    currentUser.role = 'BUSINESS_OWNER';
                }
                else if (customerType === 'B2C') {
                    currentUser.role = 'CUSTOMER';
                }
            }
        }
        // Update other fields
        if (name)
            currentUser.name = name;
        if (mobile)
            currentUser.mobile = mobile;
        if (countryCode)
            currentUser.countryCode = countryCode;
        if (country)
            currentUser.country = country;
        if (dateOfBirth)
            currentUser.dateOfBirth = dateOfBirth;
        if (gender)
            currentUser.gender = gender;
        if (companyName)
            currentUser.companyName = companyName;
        if (companyEmail)
            currentUser.companyEmail = companyEmail;
        if (companyPhone)
            currentUser.companyPhone = companyPhone;
        if (website)
            currentUser.website = website;
        if (businessType)
            currentUser.businessType = businessType;
        if (industry)
            currentUser.industry = industry;
        if (productCategories) {
            currentUser.productCategories = Array.isArray(productCategories)
                ? productCategories
                : [productCategories];
        }
        if (description)
            currentUser.description = description;
        await currentUser.save();
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: currentUser._id,
                referenceId: currentUser.referenceId,
                name: currentUser.name,
                email: currentUser.email,
                customerType: currentUser.customerType,
                accountType: currentUser.accountType,
                role: currentUser.role,
                status: currentUser.status,
                companyName: currentUser.companyName,
                mobile: currentUser.mobile,
                website: currentUser.website,
                businessType: currentUser.businessType,
                industry: currentUser.industry,
                productCategories: currentUser.productCategories,
                description: currentUser.description
            }
        });
    }
    catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=user.controller.js.map