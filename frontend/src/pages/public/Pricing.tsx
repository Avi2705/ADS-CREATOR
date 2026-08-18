import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, X, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limitLabel: string;
  popular?: boolean;
}

const B2C_PLANS: PricingPlan[] = [
  {
    name: 'B2C Starter',
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    features: [
      '1 Flagship Product Registration',
      '10 Studio AI Image Ads / mo',
      '5 AI Video & Reel Ads / mo',
      '1 Direct Social Platform Sync',
      'Lead Generation Capture Forms',
      'Standard 48h Turnaround'
    ],
    limitLabel: 'For local boutique shops and solo makers'
  },
  {
    name: 'B2C Growth',
    monthlyPrice: 3499,
    yearlyPrice: 2799,
    features: [
      'Up to 5 Registered Products',
      '50 Studio AI Image Ads / mo',
      '20 AI Video & Reel Ads / mo',
      '3 Social Networks (Meta, TikTok, X)',
      'Advanced Lead Pipeline Dashboard',
      'Custom Psychological Hook Variations',
      'Priority 24h Turnaround'
    ],
    limitLabel: 'For direct-to-consumer e-commerce brands',
    popular: true
  },
  {
    name: 'B2C Scale Agency',
    monthlyPrice: 7999,
    yearlyPrice: 6399,
    features: [
      'Unlimited Products Catalog',
      '150 Studio AI Image Ads / mo',
      '60 AI Video & Reel Ads / mo',
      'All Social Ad Channels Connected',
      'Done-For-You Campaign Deployment',
      'Custom API & Webhook Lead Export',
      'Dedicated Creative Director'
    ],
    limitLabel: 'Full scale agency done-for-you service'
  }
];

const B2B_PLANS: PricingPlan[] = [
  {
    name: 'B2B Essentials',
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    features: [
      'Max 5 Active Products',
      '40 AI Image Generations / mo',
      '15 AI Video Generations / mo',
      'Up to 2 Employee / Team Seats',
      'Direct Meta & TikTok Graph API',
      'Basic Lead Pipeline & Webhooks'
    ],
    limitLabel: 'For small in-house creative teams'
  },
  {
    name: 'B2B Scale SaaS',
    monthlyPrice: 9999,
    yearlyPrice: 7999,
    features: [
      'Max 25 Active Products',
      '150 AI Image Generations / mo',
      '50 AI Video Generations / mo',
      'Up to 5 Employee / Team Seats',
      'Custom Team Roles (Owner, Designer, Manager)',
      'Omni-Channel Multi-Platform Launcher',
      'CRM Integration (HubSpot / Salesforce / Webhooks)'
    ],
    limitLabel: 'For high-velocity marketing scale-ups',
    popular: true
  },
  {
    name: 'B2B Enterprise',
    monthlyPrice: 19999,
    yearlyPrice: 15999,
    features: [
      'Unlimited Products & Assets',
      '600 AI Image Generations / mo',
      '250 AI Video Generations / mo',
      'Unlimited Employee Seats',
      'Dedicated GPU Rendering Cluster',
      '99.9% SLA & Priority Support',
      'Custom Brand Kit Fine-Tuning'
    ],
    limitLabel: 'Enterprise media buying suites'
  }
];

export default function Pricing() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customerType = user?.customerType || 'EXPLORER';
  const isExplorer = customerType === 'EXPLORER';

  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [activatedCustomer, setActivatedCustomer] = useState<any | null>(null);


  // Security Guard: Without login, cannot see pricing or pay
  if (!user) {
    return (
      <div className="w-full min-h-[75vh] bg-white text-black flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-black font-display tracking-tight">Login Required</h2>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Pricing tiers and subscription checkout are protected. Please sign in to view plans and activate your commercial workspace.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login?redirect=pricing"
              className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
            >
              <span>Sign In to Access Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/join"
              className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs border border-zinc-200 block text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active plans rendered strictly by user's customerType
  const activePlans = customerType === 'B2B' ? B2B_PLANS : B2C_PLANS;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (isExplorer) {
      alert("Subscription Blocked: Explorer accounts cannot purchase subscriptions directly. Please navigate to your Profile and select B2B or B2C first.");
      return;
    }

    // Convert Lead to Active Subscribed Customer with Customer Reference ID
    const customerRefId = user.referenceId?.startsWith('CUST') 
      ? user.referenceId 
      : `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedUser = {
      ...user,
      status: 'ACTIVE',
      accountType: customerType,
      role: customerType === 'B2B' ? 'BUSINESS_OWNER' : 'CUSTOMER',
      paymentStatus: 'PAID',
      subscription: selectedPlan.name,
      referenceId: customerRefId,
      billingCycle: isYearly ? 'Annual' : 'Monthly',
      subscriptionDate: new Date().toLocaleDateString()
    };

    // Update Redux state
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    // Update in local mock_users DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email === user.email);
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    } else {
      mockUsers.push(updatedUser);
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    // Mark Lead as Converted in mock_leads DB
    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
    const leadIdx = mockLeads.findIndex((l: any) => l.email === user.email);
    if (leadIdx !== -1) {
      mockLeads[leadIdx] = {
        ...mockLeads[leadIdx],
        status: 'CONVERTED',
        subscriptionPlan: selectedPlan.name
      };
      localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
    }

    setSelectedPlan(null);
    setActivatedCustomer(updatedUser);
  };



  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-20 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Flexible Self-Serve & Agency Plans</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-black font-display tracking-tight leading-tight">
          Transparent Pricing, <br />
          <span className="text-red-600">Zero Hidden Fees</span>
        </h1>

        {/* Explorer Account Notice */}
        {isExplorer && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-red-700 font-black text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-red-600" />
              <span>Explorer Account — Subscription Blocked</span>
            </div>
            <p className="text-xs text-zinc-700 font-medium leading-relaxed">
              Explorer accounts cannot directly purchase subscription plans. Please complete your profile and choose either <strong>B2B SaaS</strong> or <strong>B2C Creative Client</strong> to unlock subscriptions.
            </p>
            <div className="pt-1">
              <Link
                to="/profile"
                className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20"
              >
                <span>Choose Account Type in Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Segment Indicator & Billing Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          
          {/* Active Plan Type Badge */}
          <div className="px-5 py-2.5 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-black text-black">
            <span>Viewing: </span>
            <span className="text-red-600 uppercase">
              {customerType === 'B2B' ? 'B2B SaaS Plans' : customerType === 'B2C' ? 'B2C Agency Plans' : 'Platform Plans Preview'}
            </span>
          </div>

          {/* Monthly vs Yearly Switcher */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-bold">
            <span className={!isYearly ? 'text-black font-black' : 'text-zinc-500'}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                isYearly ? 'bg-red-600 justify-end' : 'bg-zinc-300 justify-start'
              }`}
            >

              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
            <span className={isYearly ? 'text-black font-black' : 'text-zinc-500'}>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase">
              Save 20%
            </span>
          </div>

        </div>

      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
        {activePlans.map((plan, i) => {
          const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <div 
              key={i} 
              className={`rounded-3xl p-8 border flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular 
                  ? 'border-2 border-red-600 shadow-xl scale-100 md:scale-105 z-10 bg-white' 
                  : 'border-zinc-200 hover:border-zinc-300 bg-white shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular Choice</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-black font-display">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">{plan.limitLabel}</p>
                </div>

                <div className="flex items-baseline gap-1.5 pb-6 border-b border-zinc-200">
                  <span className="text-4xl sm:text-5xl font-black text-black font-display">₹{displayPrice.toLocaleString()}</span>
                  <span className="text-xs font-bold text-zinc-500">/ month</span>
                </div>

                <ul className="space-y-3.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs font-bold text-zinc-800">
                      <div className="w-4 h-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-red-600" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => {
                    if (isExplorer) {
                      navigate('/profile');
                    } else {
                      setSelectedPlan(plan);
                    }
                  }}
                  className={`btn-shimmer w-full py-4 rounded-2xl font-extrabold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 ${
                    isExplorer
                      ? 'bg-zinc-200 hover:bg-zinc-300 text-black border border-zinc-300'
                      : plan.popular 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 hover:scale-[1.02]' 
                        : 'bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200'
                  }`}
                >
                  <span>{isExplorer ? 'Choose Account Type in Profile' : `Select ${plan.name}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Simulator Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Instant Checkout</h2>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Activate subscription for {selectedPlan.name}.</p>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase">Tier</span>
                <span className="font-black text-black">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase">Billing Cycle</span>
                <span className="font-bold text-red-600">{isYearly ? 'Annual (20% Off)' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm">
                <span className="font-bold text-zinc-500 uppercase text-xs">Amount Due</span>
                <span className="font-black text-black text-base">₹{(isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Cardholder / Business Name</label>
                <input 
                  type="text" 
                  required 
                  defaultValue={user ? `${user.firstName || user.name || ''}` : ''}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-xs"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">UPI ID or Card Number</label>
                <input 
                  type="text" 
                  required 
                  defaultValue="9988776655@paytm"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-xs"
                  placeholder="e.g. 4242 •••• •••• 4242 or user@upi"
                />
              </div>

              <button 
                type="submit"
                className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Activate Now</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Subscription Activation Success Modal */}
      {activatedCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 text-red-600" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                Subscription Activated
              </span>
              <h2 className="text-3xl font-black text-black font-display tracking-tight pt-1">
                Welcome to B2C Portal!
              </h2>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Your lead account has been successfully upgraded to an Active B2C Customer with plan <strong className="text-black">{activatedCustomer.subscription}</strong>.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Customer Reference ID</span>
                <span className="font-mono font-black text-red-600">{activatedCustomer.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Payment Status</span>
                <span className="font-bold text-black">PAID ({activatedCustomer.billingCycle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Workspace Access</span>
                <span className="font-bold text-red-600">UNLOCKED</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/b2c')}
                className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
              >
                <span>Launch B2C Customer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}



