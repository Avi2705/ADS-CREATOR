export interface SubscriptionPlanDef {
  name: string;
  category: 'B2C' | 'B2B';
  monthlyPrice: number;
  yearlyPrice: number;
  maxProducts: number;
  imageAdsPerProduct: number;
  videoAdsPerProduct: number;
  allowVideos: boolean;
  maxEmailUsers: number;
  features: string[];
  limitLabel: string;
  popular?: boolean;
  requiresVerification?: boolean;
}

export const UNIFIED_PLANS: SubscriptionPlanDef[] = [
  {
    name: 'Basic Plan',
    category: 'B2C',
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    maxProducts: 2,
    imageAdsPerProduct: 2,
    videoAdsPerProduct: 0,
    allowVideos: false,
    maxEmailUsers: 1,
    features: [
      'Up to 2 Product Registrations',
      '2 Image Ads per Product (4 total)',
      '🚫 No Video Ads (Image Ads Only)',
      'Direct 1-Click AI Ad Creator',
      '1 User Dashboard Access',
      'Standard Monthly Billing'
    ],
    limitLabel: 'For solo creators & small sellers starting with image ads'
  },
  {
    name: 'Pro Plan',
    category: 'B2C',
    monthlyPrice: 3499,
    yearlyPrice: 2799,
    maxProducts: 3,
    imageAdsPerProduct: 3,
    videoAdsPerProduct: 1,
    allowVideos: true,
    maxEmailUsers: 1,
    popular: true,
    features: [
      'Up to 3 Product Registrations',
      '3 Image Ads per Product (9 total)',
      '🎬 1 Video Motion Ad per Product (3 total)',
      'Direct 1-Click Video & Image Creator',
      'Instagram, Facebook, TikTok & YouTube Sync',
      'Interactive App Mockups (Reels & Shorts)'
    ],
    limitLabel: 'For growing e-commerce brands needing video & image ads'
  },
  {
    name: 'Enterprise Plan',
    category: 'B2B',
    monthlyPrice: 0, // No direct payment
    yearlyPrice: 0,
    maxProducts: 25,
    imageAdsPerProduct: 25,
    videoAdsPerProduct: 10,
    allowVideos: true,
    maxEmailUsers: 50,
    requiresVerification: true,
    features: [
      'Multi-Product B2B Enterprise Workspace',
      'Unlimited Staff / Employee Accounts',
      'High-Volume Video & Image Generation',
      'Inbound Leads Pipeline & CRM Routing',
      'Direct Social API Publishing (Meta & Google)',
      '📋 Requires Company Reg ID & Director Aadhar Verification'
    ],
    limitLabel: 'For corporate enterprises & registered companies (No direct payment)'
  }
];

export const DEFAULT_B2C_PLANS = UNIFIED_PLANS.filter(p => p.category === 'B2C');
export const DEFAULT_B2B_PLANS = UNIFIED_PLANS.filter(p => p.category === 'B2B');

export const getUnifiedPlans = (): SubscriptionPlanDef[] => {
  try {
    const raw = localStorage.getItem('admin_unified_subscription_plans');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Could not read admin_unified_subscription_plans:", e);
  }
  return UNIFIED_PLANS;
};

export const getB2CPlans = (): SubscriptionPlanDef[] => {
  return getUnifiedPlans().filter(p => p.category === 'B2C');
};

export const getB2BPlans = (): SubscriptionPlanDef[] => {
  return getUnifiedPlans().filter(p => p.category === 'B2B');
};

export const saveAdminPlans = (arg1: SubscriptionPlanDef[], arg2?: SubscriptionPlanDef[]) => {
  const combined = arg2 ? [...arg1, ...arg2] : arg1;
  localStorage.setItem('admin_unified_subscription_plans', JSON.stringify(combined));
  window.dispatchEvent(new Event('subscription_plans_updated'));
};

export const resetAdminPlans = () => {
  localStorage.removeItem('admin_unified_subscription_plans');
  localStorage.removeItem('admin_b2c_subscription_plans');
  localStorage.removeItem('admin_b2b_subscription_plans');
  window.dispatchEvent(new Event('subscription_plans_updated'));
};

// Aliases for compatibility
export const B2C_PLANS = DEFAULT_B2C_PLANS;
export const B2B_PLANS = DEFAULT_B2B_PLANS;

export const getPlanConfig = (planName?: string): SubscriptionPlanDef => {
  const all = getUnifiedPlans();
  if (!planName) return all[0];

  const found = all.find(p => 
    p.name.toLowerCase() === planName.toLowerCase() || 
    planName.toLowerCase().includes(p.name.toLowerCase().replace('b2c ', '').replace('b2b ', ''))
  );
  if (found) return found;

  // Fallbacks
  if (planName.toLowerCase().includes('enterprise') || planName.toLowerCase().includes('b2b')) return all[2] || UNIFIED_PLANS[2];
  if (planName.toLowerCase().includes('pro') || planName.toLowerCase().includes('growth') || planName.toLowerCase().includes('scale')) return all[1] || UNIFIED_PLANS[1];
  return all[0] || UNIFIED_PLANS[0];
};
