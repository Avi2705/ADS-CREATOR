import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, X, CreditCard, CheckCircle2, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

import { getUnifiedPlans, type SubscriptionPlanDef as PricingPlan } from '../../constants/subscriptionPlans';

export default function Pricing() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [activatedCustomer, setActivatedCustomer] = useState<any | null>(null);

  // B2C Payment Modal State
  const [upiId, setUpiId] = useState('user@upi');
  const [cardHolderName, setCardHolderName] = useState(user?.name || user?.firstName || '');
  const [agreedAssurance, setAgreedAssurance] = useState(false);

  // B2B Enterprise Verification Form State
  const [b2bCompanyName, setB2bCompanyName] = useState(user?.companyName || '');
  const [b2bRegId, setB2bRegId] = useState(user?.registrationId || '');
  const [b2bAadhar, setB2bAadhar] = useState(user?.aadharNumber || '');
  const [b2bContactName, setB2bContactName] = useState(user?.name || user?.firstName || '');
  const [b2bEmail, setB2bEmail] = useState(user?.email || '');
  const [b2bPhone, setB2bPhone] = useState(user?.phone || user?.mobile || '');
  const [b2bAddress, setB2bAddress] = useState(user?.city ? `${user.city}, ${user.state || ''}` : '');
  const [agreedB2BVerification, setAgreedB2BVerification] = useState(false);
  const [isSubmittingEnterprise, setIsSubmittingEnterprise] = useState(false);

  useEffect(() => {
    const loadPlans = () => {
      setPlans(getUnifiedPlans());
    };
    loadPlans();
    window.addEventListener('subscription_plans_updated', loadPlans);
    return () => window.removeEventListener('subscription_plans_updated', loadPlans);
  }, []);

  // Subscription Lifecycle Calculation
  const isPaid = user?.paymentStatus === 'PAID';
  const expiryTime = user?.subscriptionExpiresAt ? Number(user.subscriptionExpiresAt) : 0;
  const isExpired = !isPaid || (expiryTime > 0 && Date.now() >= expiryTime);
  const msRemaining = Math.max(0, expiryTime - Date.now());
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  const handleSimulateExpiry = () => {
    if (!user) return;
    const expiredTimestamp = Date.now() - 1000;
    const updatedUser = {
      ...user,
      paymentStatus: 'EXPIRED',
      subscriptionExpiresAt: expiredTimestamp,
      subscriptionExpiryDate: new Date(expiredTimestamp).toLocaleDateString()
    };
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
  };

  const handleResetPaid = () => {
    if (!user) return;
    const freshExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const updatedUser = {
      ...user,
      paymentStatus: 'PAID',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: freshExpiry,
      subscriptionExpiryDate: new Date(freshExpiry).toLocaleDateString(),
      subscriptionDate: new Date().toLocaleDateString()
    };
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
  };

  // 1. Direct B2C Payment Handler (Basic / Pro)
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!user) {
      navigate(`/join?plan=${encodeURIComponent(selectedPlan.name)}&type=B2C`);
      return;
    }

    const customerRefId = user.referenceId?.startsWith('CUST') 
      ? user.referenceId 
      : `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const subscriptionTimestamp = Date.now();
    const durationDays = isYearly ? 365 : 30;
    const expiryTimestamp = subscriptionTimestamp + durationDays * 24 * 60 * 60 * 1000;
    const expiryDateStr = new Date(expiryTimestamp).toLocaleDateString();

    const updatedUser = {
      ...user,
      status: 'ACTIVE',
      customerType: 'B2C',
      accountType: 'B2C',
      role: 'CUSTOMER',
      paymentStatus: 'PAID',
      subscription: selectedPlan.name,
      subscriptionStatus: 'ACTIVE',
      subscriptionTimestamp,
      subscriptionExpiresAt: expiryTimestamp,
      subscriptionExpiryDate: expiryDateStr,
      maxProducts: selectedPlan.maxProducts || (selectedPlan.name.includes('Basic') ? 2 : 3),
      imageAdsPerProduct: selectedPlan.imageAdsPerProduct || (selectedPlan.name.includes('Basic') ? 2 : 3),
      videoAdsPerProduct: selectedPlan.videoAdsPerProduct || (selectedPlan.name.includes('Basic') ? 0 : 1),
      allowVideos: selectedPlan.allowVideos,
      referenceId: customerRefId,
      billingCycle: isYearly ? 'Annual' : 'Monthly',
      subscriptionDate: new Date().toLocaleDateString()
    };

    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      mockUsers[idx] = { ...mockUsers[idx], ...updatedUser };
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    } else {
      mockUsers.push(updatedUser);
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
    const leadIdx = mockLeads.findIndex((l: any) => l.email === user.email);
    if (leadIdx !== -1) {
      mockLeads[leadIdx] = {
        ...mockLeads[leadIdx],
        status: 'CONVERTED',
        customerType: 'B2C',
        subscriptionPlan: selectedPlan.name
      };
      localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
    }

    setSelectedPlan(null);
    setActivatedCustomer(updatedUser);
  };

  // 2. Enterprise B2B Verification Form Submit (No direct payment)
  const handleEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b2bCompanyName.trim() || !b2bRegId.trim() || !b2bAadhar.trim()) {
      alert("Please provide complete Company Name, Registration ID, and Aadhar Number.");
      return;
    }

    setIsSubmittingEnterprise(true);

    const b2bRefId = user?.referenceId?.startsWith('B2B')
      ? user.referenceId
      : `B2B-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedUser = {
      ...(user || {}),
      _id: user?._id || `b2b-client-${Date.now()}`,
      referenceId: b2bRefId,
      name: b2bContactName || user?.name || 'Enterprise Director',
      email: b2bEmail || user?.email,
      phone: b2bPhone || user?.phone,
      companyName: b2bCompanyName.trim(),
      registrationId: b2bRegId.trim(),
      aadharNumber: b2bAadhar.trim(),
      address: b2bAddress,
      customerType: 'B2B',
      accountType: 'B2B',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      paymentStatus: 'PAID', // Enterprise verified
      subscription: 'Enterprise Plan',
      subscriptionStatus: 'ACTIVE',
      subscriptionDate: new Date().toLocaleDateString(),
      maxProducts: 25,
      imageAdsPerProduct: 25,
      videoAdsPerProduct: 10,
      allowVideos: true,
      maxEmailUsers: 50,
      isVerifiedEnterprise: true
    };

    // Save in Redux
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    // Save in localStorage mock_users
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const userEmail = updatedUser.email?.toLowerCase();
    const uIdx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === userEmail);
    if (uIdx !== -1) {
      mockUsers[uIdx] = { ...mockUsers[uIdx], ...updatedUser };
    } else {
      mockUsers.push(updatedUser);
    }
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    // Save in mock_leads
    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
    const lIdx = mockLeads.findIndex((l: any) => l.email?.toLowerCase() === userEmail);
    if (lIdx !== -1) {
      mockLeads[lIdx] = {
        ...mockLeads[lIdx],
        ...updatedUser,
        status: 'CONVERTED',
        customerType: 'B2B',
        subscriptionPlan: 'Enterprise Plan'
      };
    } else {
      mockLeads.push(updatedUser);
    }
    localStorage.setItem('mock_leads', JSON.stringify(mockLeads));

    setIsSubmittingEnterprise(false);
    setShowEnterpriseModal(false);
    setActivatedCustomer(updatedUser);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition-colors px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Simple & Transparent Subscriptions</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-black font-display tracking-tight leading-tight">
          Three Clear Plans, <br />
          <span className="text-red-600">Built for Every Growth Stage</span>
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-xl mx-auto leading-relaxed">
          Choose <strong>Basic</strong> or <strong>Pro</strong> for immediate B2C Creative Studio access with AI image and video ads, or apply for our <strong>Enterprise (B2B)</strong> multi-seat corporate plan.
        </p>

        {/* Monthly vs Yearly Switcher for B2C plans */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-bold">
            <span className={!isYearly ? 'text-black font-black' : 'text-zinc-500'}>Monthly Billing</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                isYearly ? 'bg-red-600 justify-end' : 'bg-zinc-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
            <span className={isYearly ? 'text-black font-black' : 'text-zinc-500'}>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase">
              Save 20%
            </span>
          </div>
        </div>

        {/* Active Subscription Status Banner with 1-Month Lifecycle */}
        {user?.subscription && (
          <div className={`p-5 rounded-3xl border mb-6 flex flex-col md:flex-row justify-between items-center gap-4 ${
            !isExpired ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                !isExpired ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {!isExpired ? <Check className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-black text-sm">
                  {!isExpired ? `Active Plan: ${user.subscription} (${user.customerType || 'B2C'})` : `Subscription Expired: ${user.subscription}`}
                </div>
                <div className="text-xs opacity-80 font-medium mt-0.5">
                  {!isExpired 
                    ? `Payment valid until ${user.subscriptionExpiryDate || '1 month'}. (${daysRemaining} days remaining)` 
                    : '1 month has elapsed. Payment is due. Click below to renew and continue active service.'}
                </div>
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {!isExpired ? (
                <button
                  type="button"
                  onClick={handleSimulateExpiry}
                  className="px-3 py-1.5 bg-white text-red-600 font-bold text-[11px] rounded-xl border border-red-200 hover:bg-red-50 shadow-sm transition-colors"
                  title="Simulate 30 days passing to test payment renewal button"
                >
                  ⏱️ Fast-Forward 1 Month (Test Expiry)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetPaid}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-[11px] rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"
                  title="Reset to 30 days remaining"
                >
                  ↺ Reset to 1 Month Paid
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 3 Unified Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
        {plans.map((plan, i) => {
          const isEnterprise = plan.category === 'B2B' || plan.requiresVerification;
          const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isUserSubscribed = user?.subscription === plan.name;
          const isPlanActiveAndPaid = isUserSubscribed && isPaid && !isExpired;
          const isPlanExpiredDue = isUserSubscribed && isExpired;

          return (
            <div 
              key={i} 
              className={`rounded-3xl p-8 border flex flex-col justify-between relative transition-all duration-300 ${
                isPlanActiveAndPaid
                  ? 'border-2 border-emerald-500 shadow-xl bg-white scale-100 lg:scale-105 z-10'
                  : plan.popular 
                    ? 'border-2 border-red-600 shadow-xl scale-100 lg:scale-105 z-10 bg-white' 
                    : 'border-zinc-200 hover:border-zinc-300 bg-white shadow-sm'
              }`}
            >
              {isPlanActiveAndPaid ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Current Active Plan</span>
                </div>
              ) : plan.popular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular Choice</span>
                </div>
              ) : isEnterprise ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" />
                  <span>B2B Enterprise Corporate</span>
                </div>
              ) : null}

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-black font-display">{plan.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                      isEnterprise ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {isEnterprise ? 'B2B Enterprise' : 'B2C Studio'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">{plan.limitLabel}</p>
                </div>

                <div className="flex items-baseline gap-1.5 pb-6 border-b border-zinc-200">
                  {isEnterprise ? (
                    <div>
                      <span className="text-3xl font-black text-black font-display">Corporate Direct</span>
                      <div className="text-[11px] font-bold text-red-600 mt-1">No Direct Payment • Verification Required</div>
                    </div>
                  ) : (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-black font-display">₹{displayPrice.toLocaleString()}</span>
                      <span className="text-xs font-bold text-zinc-500">/ month</span>
                    </>
                  )}
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
                {isPlanActiveAndPaid ? (
                  <div className="p-3.5 rounded-2xl font-black text-xs uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active • {daysRemaining} Days Remaining</span>
                  </div>
                ) : isPlanExpiredDue ? (
                  <button 
                    onClick={() => {
                      if (isEnterprise) setShowEnterpriseModal(true);
                      else setSelectedPlan(plan);
                    }}
                    className="btn-shimmer w-full py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 hover:scale-[1.02]"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Subscription Expired • Renew Now</span>
                  </button>
                ) : isEnterprise ? (
                  /* B2B Enterprise CTA: Submit Form (No direct payment) */
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate(`/join?plan=Enterprise&type=B2B`);
                      } else {
                        setShowEnterpriseModal(true);
                      }
                    }}
                    className="btn-shimmer w-full py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white shadow-md hover:scale-[1.02]"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Apply for Enterprise (B2B)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  /* B2C Direct Payment CTA (Basic / Pro) */
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate(`/join?plan=${encodeURIComponent(plan.name)}&type=B2C`);
                      } else {
                        setSelectedPlan(plan);
                      }
                    }}
                    className={`btn-shimmer w-full py-4 rounded-2xl font-extrabold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 hover:scale-[1.02]' 
                        : 'bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Select {plan.name} (B2C)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. B2C PAYMENT MODAL (BASIC & PRO) */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-6">
            
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setSelectedPlan(null)} 
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 border border-zinc-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Back</span>
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">B2C Studio Checkout</span>
                  <h3 className="font-black text-black text-xl font-display">{selectedPlan.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500 uppercase">Selected Plan</span>
                <span className="font-black text-black">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500 uppercase">Product Limit</span>
                <span className="font-bold text-black">{selectedPlan.maxProducts} Products</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500 uppercase">Image Ads Limit</span>
                <span className="font-bold text-black">{selectedPlan.imageAdsPerProduct} Image Ads / Product</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500 uppercase">Video Ads Limit</span>
                <span className={`font-bold ${selectedPlan.allowVideos ? 'text-black' : 'text-red-600 font-mono'}`}>
                  {selectedPlan.allowVideos ? `${selectedPlan.videoAdsPerProduct} Video Ad / Product` : '🚫 Blocked (0 Videos)'}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm">
                <span className="font-bold text-zinc-500 uppercase text-xs">Amount Due</span>
                <span className="font-black text-red-600 text-base">₹{(isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Cardholder / Name *</label>
                <input 
                  type="text" 
                  required 
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-xs"
                  placeholder="e.g. Acme Brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">UPI ID / VPA *</label>
                <input 
                  type="text" 
                  required 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-xs"
                  placeholder="e.g. user@okhdfcbank or 9876543210@paytm"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="assuranceCheck"
                  checked={agreedAssurance}
                  onChange={(e) => setAgreedAssurance(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                />
                <label htmlFor="assuranceCheck" className="text-[11px] text-zinc-700 font-bold leading-snug cursor-pointer">
                  I understand the plan limits ({selectedPlan.maxProducts} products max, {selectedPlan.allowVideos ? 'includes video ads' : 'NO video ads'}) and accept the service terms.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-1/2 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit"
                  disabled={!agreedAssurance || !upiId.trim()}
                  className={`btn-shimmer w-1/2 py-3.5 font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    agreedAssurance && upiId.trim()
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 cursor-pointer'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay & Unlock</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 2. B2B ENTERPRISE VERIFICATION MODAL (NO DIRECT PAYMENT) */}
      {showEnterpriseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-5 my-8">
            
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">B2B Corporate Onboarding</span>
                  <h3 className="font-black text-black text-xl font-display">Enterprise Verification Form</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowEnterpriseModal(false)} 
                className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-black flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>No Direct Payment Required</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Please submit your corporate details and director Aadhar verification. Upon submission, your enterprise workspace will be provisioned directly.
              </p>
            </div>

            <form onSubmit={handleEnterpriseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Company / Corporate Name *</label>
                <input 
                  type="text" 
                  required 
                  value={b2bCompanyName}
                  onChange={(e) => setB2bCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                  placeholder="e.g. Apex Cloud Solutions Pvt Ltd"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Company Registration ID / GSTIN *</label>
                  <input 
                    type="text" 
                    required 
                    value={b2bRegId}
                    onChange={(e) => setB2bRegId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 font-mono"
                    placeholder="e.g. 27AAACA1234A1Z5 / CIN"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Director Aadhar Number (12 Digits) *</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={14}
                    value={b2bAadhar}
                    onChange={(e) => setB2bAadhar(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 font-mono"
                    placeholder="e.g. 5432 8976 1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Authorized Contact Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={b2bContactName}
                    onChange={(e) => setB2bContactName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                    placeholder="e.g. Marcus Vance"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Corporate Mobile / Phone *</label>
                  <input 
                    type="tel" 
                    required 
                    value={b2bPhone}
                    onChange={(e) => setB2bPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 font-mono"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Official Business Email *</label>
                <input 
                  type="email" 
                  required 
                  value={b2bEmail}
                  onChange={(e) => setB2bEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                  placeholder="e.g. enterprise@company.com"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Headquarters Address & State *</label>
                <input 
                  type="text" 
                  required 
                  value={b2bAddress}
                  onChange={(e) => setB2bAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                  placeholder="e.g. Level 4, Tech Park, Bengaluru, Karnataka"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="b2bVerificationCheck"
                  required
                  checked={agreedB2BVerification}
                  onChange={(e) => setAgreedB2BVerification(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                />
                <label htmlFor="b2bVerificationCheck" className="text-[11px] text-zinc-700 font-bold leading-snug cursor-pointer">
                  I certify that the company registration ID and director Aadhar details provided are authentic and authorized for this corporate B2B account.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnterpriseModal(false)}
                  className="w-1/2 py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!agreedB2BVerification || isSubmittingEnterprise}
                  className={`btn-shimmer w-1/2 py-3 font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    agreedB2BVerification && !isSubmittingEnterprise
                      ? 'bg-black hover:bg-zinc-800 text-white cursor-pointer shadow-black/20'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmittingEnterprise ? 'Submitting...' : 'Submit & Activate B2B'}</span>
                </button>
              </div>
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
                {activatedCustomer.customerType === 'B2B' ? 'B2B Enterprise Activated' : 'B2C Subscription Activated'}
              </span>
              <h2 className="text-3xl font-black text-black font-display tracking-tight pt-1">
                {activatedCustomer.customerType === 'B2B' ? 'Welcome to B2B Dashboard!' : 'Welcome to B2C Portal!'}
              </h2>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                {activatedCustomer.customerType === 'B2B'
                  ? `Your corporate verification for ${activatedCustomer.companyName || 'Enterprise'} is approved. Multi-product and team employee tools are unlocked.`
                  : `Your account is active on ${activatedCustomer.subscription}. You can now create AI image and video ads directly.`}
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Reference ID</span>
                <span className="font-mono font-black text-red-600">{activatedCustomer.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Account Tier</span>
                <span className="font-bold text-black">{activatedCustomer.customerType === 'B2B' ? 'B2B Enterprise Suite' : 'B2C Creative Studio'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Workspace Access</span>
                <span className="font-bold text-emerald-600">UNLOCKED & ACTIVE</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate(activatedCustomer.customerType === 'B2B' ? '/b2b' : '/b2c')}
                className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
              >
                <span>Launch {activatedCustomer.customerType === 'B2B' ? 'B2B Enterprise Dashboard' : 'B2C Customer Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
