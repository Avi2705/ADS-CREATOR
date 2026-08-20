"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../modules/users/user.model"));
const tenant_model_1 = __importDefault(require("../modules/tenants/tenant.model"));
const freeAd_model_1 = __importDefault(require("../modules/creatives/freeAd.model"));
const b2cRequest_model_1 = __importDefault(require("../modules/creatives/b2cRequest.model"));
const customerLead_model_1 = __importDefault(require("../modules/leads/customerLead.model"));
const lead_model_1 = __importDefault(require("../modules/leads/lead.model"));
const AuditLog_1 = __importDefault(require("../modules/admin/models/AuditLog"));
dotenv_1.default.config();
const seedDatabase = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adhunter_db';
        console.log(`Connecting to MongoDB at ${mongoUri}...`);
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB successfully.');
        // Clear existing collections for a clean environment
        await Promise.all([
            user_model_1.default.deleteMany({}),
            tenant_model_1.default.deleteMany({}),
            freeAd_model_1.default.deleteMany({}),
            b2cRequest_model_1.default.deleteMany({}),
            customerLead_model_1.default.deleteMany({}),
            lead_model_1.default.deleteMany({}),
            AuditLog_1.default.deleteMany({})
        ]);
        const passwordHash = await bcrypt_1.default.hash('password123', 10);
        // 1. Create Headquarters Admin Tenant
        const adminTenant = await tenant_model_1.default.create({
            name: 'AD-HUNTER Global Headquarters',
            type: 'B2B'
        });
        if (!adminTenant) {
            throw new Error('Failed to create admin tenant.');
        }
        // 2. Create Super Administrator Only
        // All other accounts (B2C Customers, B2B Clients, Staff, Explorers) are registered live via application forms
        const superAdmin = await user_model_1.default.create({
            name: 'Super Administrator',
            email: 'admin@adscreator.com',
            passwordHash,
            role: 'SUPER_ADMIN',
            customerType: null,
            accountType: 'SUPER_ADMIN',
            referenceId: 'ADM-REF-100001',
            tenantId: adminTenant._id,
            status: 'ACTIVE',
            freeAdsAllowed: 9999,
            freeAdsUsed: 0
        });
        // Secondary Admin alias
        await user_model_1.default.create({
            name: 'Super Administrator',
            email: 'admin@adhunter.com',
            passwordHash,
            role: 'SUPER_ADMIN',
            customerType: null,
            accountType: 'SUPER_ADMIN',
            referenceId: 'ADM-REF-100002',
            tenantId: adminTenant._id,
            status: 'ACTIVE',
            freeAdsAllowed: 9999,
            freeAdsUsed: 0
        });
        // 3. Create Root Audit Log
        await AuditLog_1.default.create({
            actorId: superAdmin._id,
            actorName: superAdmin.name,
            action: 'SYSTEM_INITIALIZATION',
            entity: 'GlobalSystem',
            entityId: superAdmin._id.toString(),
            newValue: { message: 'Clean system initialized with Super Administrator account.' }
        });
        console.log('====================================================');
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY (CLEAN PRODUCTION)');
        console.log('====================================================');
        console.log('👑 Super Admin: admin@adscreator.com / password123');
        console.log('ℹ️  All other users register live via /join & /pricing');
        console.log('====================================================');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map