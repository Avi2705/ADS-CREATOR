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
        // Clear existing collections for a clean seed
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
        // 1. Create Tenants
        const adminTenant = await tenant_model_1.default.create({
            name: 'AD-HUNTER Global Headquarters',
            type: 'B2B'
        });
        const b2cTenant = await tenant_model_1.default.create({
            name: 'Velocity Sportswear & Footwear',
            type: 'B2C'
        });
        const b2bTenant = await tenant_model_1.default.create({
            name: 'Apex Cloud Solutions',
            type: 'B2B'
        });
        if (!adminTenant || !b2cTenant || !b2bTenant) {
            throw new Error('Failed to create tenants.');
        }
        // 2. Create Users
        // Super Admin
        const superAdmin = await user_model_1.default.create({
            name: 'Alexander Hunt',
            email: 'admin@adhunter.com',
            passwordHash,
            role: 'SUPER_ADMIN',
            customerType: null,
            accountType: 'B2B',
            referenceId: 'ADM-REF-100001',
            tenantId: adminTenant._id,
            status: 'ACTIVE',
            freeAdsAllowed: 999,
            freeAdsUsed: 0
        });
        // Staff Employee
        const staffEmployee = await user_model_1.default.create({
            name: 'Sarah Jenkins',
            email: 'sarah.jenkins@adhunter.com',
            passwordHash,
            role: 'MANAGER',
            customerType: null,
            accountType: 'B2B',
            referenceId: 'EMP-REF-742918',
            tenantId: adminTenant._id,
            status: 'ACTIVE',
            freeAdsAllowed: 100,
            freeAdsUsed: 0
        });
        // Explorer User
        const explorerUser = await user_model_1.default.create({
            name: 'Alex Rivera',
            email: 'alex.explorer@gmail.com',
            passwordHash,
            role: 'CUSTOMER',
            customerType: 'EXPLORER',
            accountType: 'EXPLORER',
            referenceId: 'EXP-REF-200001',
            status: 'LEAD',
            freeAdsAllowed: 1,
            freeAdsUsed: 0,
            mobile: '+91 98765 43210',
            companyName: 'Rivera Athletics'
        });
        // B2C Customer
        const b2cCustomer = await user_model_1.default.create({
            name: 'David Miller',
            email: 'david.retail@velocity.com',
            passwordHash,
            role: 'CUSTOMER',
            customerType: 'B2C',
            accountType: 'B2C',
            referenceId: 'CUST-REF-918234',
            tenantId: b2cTenant._id,
            status: 'ACTIVE',
            subscription: 'B2C Growth',
            billingCycle: 'MONTHLY',
            mobile: '+91 98450 12345',
            companyName: 'Velocity Sportswear',
            assignedEmployeeRefId: staffEmployee.referenceId,
            assignedEmployeeName: staffEmployee.name,
            freeAdsAllowed: 1,
            freeAdsUsed: 1
        });
        // B2B Customer
        const b2bCustomer = await user_model_1.default.create({
            name: 'Marcus Vance',
            email: 'marcus.ceo@apexsaas.com',
            passwordHash,
            role: 'CUSTOMER',
            customerType: 'B2B',
            accountType: 'B2B',
            referenceId: 'CUST-REF-847291',
            tenantId: b2bTenant._id,
            status: 'ACTIVE',
            subscription: 'B2B Enterprise',
            billingCycle: 'YEARLY',
            mobile: '+91 99001 88888',
            companyName: 'Apex Cloud Solutions',
            assignedEmployeeRefId: staffEmployee.referenceId,
            assignedEmployeeName: staffEmployee.name,
            freeAdsAllowed: 1,
            freeAdsUsed: 1
        });
        if (!superAdmin || !staffEmployee || !explorerUser || !b2cCustomer || !b2bCustomer) {
            throw new Error('Failed to create seed users.');
        }
        // 3. Create Sample FreeAd
        await freeAd_model_1.default.create({
            userId: explorerUser._id,
            tenantId: adminTenant._id,
            productName: 'Velocity Hyper-Glide X1',
            category: 'Footwear',
            price: 1499,
            targetAudience: 'Marathon runners & fitness creators',
            location: 'India (Metro Tier 1)',
            objective: 'Direct Sales & Conversions',
            cta: 'Shop Now',
            tone: 'High Energy & Urgent',
            sellingPoints: 'Carbon fiber spring plate, 48-hr flash dispatch',
            promotionalOffer: 'FLAT 30% OFF + Free Express Shipping',
            brandName: 'Velocity Sports',
            mediaAssets: [],
            generatedResult: {
                headline: 'UNLEASH YOUR BEST: VELOCITY HYPER-GLIDE X1',
                primaryText: 'Engineered specifically for marathon runners & fitness creators, Velocity Hyper-Glide X1 by Velocity Sports fuses cutting-edge carbon-fiber propulsion with standout aesthetic design.',
                description: 'Premium Footwear crafted for maximum impact. Starting at ₹1,499. Fast dispatch & verified quality guarantee.',
                cta: 'Shop Now',
                promotionalWording: 'FLAT 30% OFF + Free Express Shipping',
                socialCaption: '🔥 Drop Alert! Meet the all-new Velocity Hyper-Glide X1 by #VelocitySports!\n\n👉 Click "Shop Now" before stock runs out!',
                targetAudienceSuggestions: ['Marathon runners actively browsing sports shoes', 'Urban athletes in Bangalore & Mumbai'],
                videoScript: '[0:00 - 0:03 HOOK]: Fast kinetic visual of Velocity Hyper-Glide X1.\n[0:03 - 0:08]: 3D cinematic showcase.\n[0:08 - 0:12]: Split-screen showing FLAT 30% OFF.\n[0:12 - 0:15 CTA]: Tap Shop Now!',
                generatedVisualUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
                provider: 'Gemini-Flash-2.0',
                generatedAt: new Date()
            }
        });
        // 4. Create Sample B2C Requests
        await b2cRequest_model_1.default.create([
            {
                referenceId: 'REQ-2026-81920',
                customerId: b2cCustomer._id,
                customerRefId: b2cCustomer.referenceId,
                customerName: b2cCustomer.name,
                customerEmail: b2cCustomer.email,
                tenantId: b2cTenant._id,
                brandName: 'Velocity Sportswear',
                productName: 'Air Max Velocity Pro',
                category: 'Footwear & Streetwear',
                price: 189,
                adType: 'Both',
                purpose: 'Summer Flash Launch Drop',
                targetAudience: 'Marathon runners, sneaker collectors, age 18-35',
                headlineIdea: 'UNLEASH PEAK VELOCITY',
                ctaIdea: 'Claim 25% Off',
                preferredStyle: 'Modern High-Contrast Studio',
                format: 'Instagram Post (1:1) & TikTok Reel (9:16)',
                description: 'Ultra-responsive carbon fiber running footwear designed for marathon velocity and aesthetic streetwear appeal.',
                status: 'CREATIVE_READY',
                creativeAssets: [
                    {
                        assetType: 'IMAGE',
                        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&fit=crop',
                        headline: '4K Hero Studio Banner — Air Max Velocity Pro',
                        primaryText: 'Supercharge your run with carbon fiber propulsion.',
                        cta: 'Claim 25% Off',
                        version: 1
                    },
                    {
                        assetType: 'VIDEO',
                        url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&fit=crop',
                        headline: '15s Kinetic Reel Script — Velocity Pro Drop',
                        primaryText: 'Experience marathon velocity and street appeal.',
                        cta: 'Shop Velocity',
                        version: 1
                    }
                ]
            },
            {
                referenceId: 'REQ-2026-47102',
                customerId: b2cCustomer._id,
                customerRefId: b2cCustomer.referenceId,
                customerName: b2cCustomer.name,
                customerEmail: b2cCustomer.email,
                tenantId: b2cTenant._id,
                brandName: 'Velocity Sportswear',
                productName: 'Apex Carbon Sprint Jacket',
                category: 'Apparel',
                price: 129,
                adType: 'Image',
                purpose: 'Monsoon Running Gear Promotion',
                targetAudience: 'Outdoor athletes and cyclists',
                preferredStyle: 'Minimalist High-Key White',
                format: 'Facebook News Feed (16:9)',
                description: 'Lightweight waterproof windbreaker with reflective 3M stripes for night runners.',
                status: 'IN_PROGRESS',
                creativeAssets: []
            }
        ]);
        // 5. Create Sample Customer Leads for B2C Customer
        await customerLead_model_1.default.create([
            {
                referenceId: 'LEAD-AD-901',
                customerId: b2cCustomer._id,
                customerRefId: b2cCustomer.referenceId,
                tenantId: b2cTenant._id,
                name: 'Vikram Malhotra',
                email: 'vikram.m@gmail.com',
                phone: '+91 98201 55432',
                location: 'Mumbai, Maharashtra',
                source: 'Instagram Feed (Air Max Velocity Pro)',
                status: 'NEW',
                value: 189
            },
            {
                referenceId: 'LEAD-AD-902',
                customerId: b2cCustomer._id,
                customerRefId: b2cCustomer.referenceId,
                tenantId: b2cTenant._id,
                name: 'Ananya Sharma',
                email: 'ananya.s@outlook.com',
                phone: '+91 97110 88765',
                location: 'Bangalore, Karnataka',
                source: 'TikTok Reel (Velocity Pro Drop)',
                status: 'QUALIFIED',
                value: 189
            },
            {
                referenceId: 'LEAD-AD-903',
                customerId: b2cCustomer._id,
                customerRefId: b2cCustomer.referenceId,
                tenantId: b2cTenant._id,
                name: 'Rohan Deshmukh',
                email: 'rohan.d@gmail.com',
                phone: '+91 98900 11223',
                location: 'Pune, Maharashtra',
                source: 'Instagram Feed (Air Max Velocity Pro)',
                status: 'CONVERTED',
                value: 189
            }
        ]);
        // 6. Create Platform SaaS Leads
        await lead_model_1.default.create([
            {
                referenceId: 'LEAD-SaaS-101',
                userId: explorerUser._id,
                name: 'Alex Rivera',
                email: 'alex.explorer@gmail.com',
                countryCode: '+91',
                phone: '9876543210',
                intentType: 'Explorer',
                profileStatus: 'PARTIAL',
                status: 'NEW',
                companyName: 'Rivera Athletics',
                assignedEmployeeRefId: staffEmployee.referenceId,
                assignedEmployeeName: staffEmployee.name
            },
            {
                referenceId: 'LEAD-SaaS-102',
                userId: b2cCustomer._id,
                name: 'Kavita Rao',
                email: 'kavita.boutique@gmail.com',
                countryCode: '+91',
                phone: '98400 33445',
                intentType: 'B2C',
                profileStatus: 'COMPLETED',
                status: 'QUALIFIED',
                companyName: 'Kavita Designer Studio',
                assignedEmployeeRefId: staffEmployee.referenceId,
                assignedEmployeeName: staffEmployee.name
            }
        ]);
        // 7. Create Audit Logs
        await AuditLog_1.default.create([
            {
                actorId: superAdmin._id,
                actorName: 'Alexander Hunt (Super Admin)',
                action: 'SYSTEM_INITIALIZATION',
                entity: 'System',
                entityId: 'AD-HUNTER-ROOT',
                newValue: { status: 'INITIALIZED', database: 'adhunter_db' }
            },
            {
                actorId: superAdmin._id,
                actorName: 'Alexander Hunt (Super Admin)',
                action: 'CREATE_B2C_CUSTOMER',
                entity: 'User',
                entityId: b2cCustomer._id.toString(),
                newValue: { referenceId: b2cCustomer.referenceId, plan: 'B2C Growth' }
            }
        ]);
        console.log('----------------------------------------------------');
        console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY IN MONGODB!');
        console.log('Database Name: adhunter_db');
        console.log('Collections Created:');
        console.log('  - users');
        console.log('  - tenants');
        console.log('  - freeads');
        console.log('  - b2crequests');
        console.log('  - customerleads');
        console.log('  - leads');
        console.log('  - auditlogs');
        console.log('----------------------------------------------------');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map