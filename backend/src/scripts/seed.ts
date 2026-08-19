import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../modules/users/user.model';
import Tenant from '../modules/tenants/tenant.model';
import FreeAd from '../modules/creatives/freeAd.model';
import B2CRequest from '../modules/creatives/b2cRequest.model';
import CustomerLead from '../modules/leads/customerLead.model';
import Lead from '../modules/leads/lead.model';
import AuditLog from '../modules/admin/models/AuditLog';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adhunter_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing collections for a clean environment
    await Promise.all([
      User.deleteMany({}),
      Tenant.deleteMany({}),
      FreeAd.deleteMany({}),
      B2CRequest.deleteMany({}),
      CustomerLead.deleteMany({}),
      Lead.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Headquarters Admin Tenant
    const adminTenant = await Tenant.create({
      name: 'AD-HUNTER Global Headquarters',
      type: 'B2B'
    });

    if (!adminTenant) {
      throw new Error('Failed to create admin tenant.');
    }

    // 2. Create Super Administrator Only
    // All other accounts (B2C Customers, B2B Clients, Staff, Explorers) are registered live via application forms
    const superAdmin = await User.create({
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
    await User.create({
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
    await AuditLog.create({
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
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
