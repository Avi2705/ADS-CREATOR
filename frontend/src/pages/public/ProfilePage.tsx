import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Building2, ShoppingBag, Edit3, Check, 
  Lock, CheckCircle2, Compass
} from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

export default function ProfilePage() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Mode States
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User Current Account Type (Source of Truth)
  const currentCustomerType: 'EXPLORER' | 'B2B' | 'B2C' = user?.customerType || 'EXPLORER';

  // Personal Form Fields
  const [name, setName] = useState(user?.name || user?.firstName || 'User');
  const [mobile, setMobile] = useState(user?.mobile || user?.phone || '');
  const [selectedType, setSelectedType] = useState<'EXPLORER' | 'B2B' | 'B2C'>(currentCustomerType);

  // Business / Company Form Fields
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [industry, setIndustry] = useState(user?.industry || 'E-Commerce');
  const [website, setWebsite] = useState(user?.website || '');
  const [businessPhone, setBusinessPhone] = useState(user?.companyPhone || user?.mobile || '');
  const [description, setDescription] = useState(user?.description || '');
  const productCategory = Array.isArray(user?.productCategories) ? user.productCategories[0] || 'Footwear' : (user?.productCategories || 'Footwear');


  // Check URL params on mount (e.g. from Explorer Hub: /profile?edit=true&type=B2B)
  useEffect(() => {
    const editParam = searchParams.get('edit');
    const typeParam = searchParams.get('type') as 'B2B' | 'B2C' | null;

    if (editParam === 'true' && currentCustomerType === 'EXPLORER') {
      setIsEditingPersonal(true);
      if (typeParam === 'B2B' || typeParam === 'B2C') {
        setSelectedType(typeParam);
      }
    }
  }, [searchParams, currentCustomerType]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-black text-black font-display">Access Denied</h1>
        <p className="text-zinc-600 mt-2 text-xs font-medium">Please sign in to view and manage your profile.</p>
        <Link to="/login" className="btn-shimmer inline-block mt-4 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  // Dirty state tracking for Personal Profile
  const isPersonalDirty = 
    name !== (user.name || user.firstName || '') ||
    mobile !== (user.mobile || user.phone || '') ||
    selectedType !== currentCustomerType;

  // Dirty state tracking for Business Profile
  const isBusinessDirty =
    companyName !== (user.companyName || '') ||
    industry !== (user.industry || 'E-Commerce') ||
    website !== (user.website || '') ||
    description !== (user.description || '') ||
    productCategory !== (Array.isArray(user.productCategories) ? user.productCategories[0] || '' : (user.productCategories || 'Footwear'));

  // Handle Save Personal Profile
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();

    // Transition Legality Check
    if (currentCustomerType === 'B2B' && selectedType !== 'B2B') {
      alert("Error: Account type is permanently locked to B2B and cannot be altered.");
      return;
    }
    if (currentCustomerType === 'B2C' && selectedType !== 'B2C') {
      alert("Error: Account type is permanently locked to B2C and cannot be altered.");
      return;
    }

    const updatedCustomerType = currentCustomerType === 'EXPLORER' ? selectedType : currentCustomerType;
    const updatedRole = updatedCustomerType === 'B2B' 
      ? 'BUSINESS_OWNER' 
      : updatedCustomerType === 'B2C' 
        ? 'CUSTOMER' 
        : user.role;

    const updatedUser = {
      ...user,
      name,
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || '',
      mobile,
      customerType: updatedCustomerType,
      accountType: updatedCustomerType,
      role: updatedRole
    };

    // Update Redux state immediately
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    // Update local DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email === user.email);
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    // Success State Transition: Return to View Mode
    setIsEditingPersonal(false);
    setSuccessMessage(`Profile updated successfully. Account Type is now ${updatedCustomerType}.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Handle Save Business Profile
  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      companyName,
      industry,
      website,
      companyPhone: businessPhone,
      description,
      productCategories: [productCategory],
      mainProduct: {
        name: companyName || 'Flagship Product',
        category: productCategory,
        price: 149
      }
    };

    // Update Redux state immediately
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));


    // Update local DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email === user.email);
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    // Success State Transition: Return to View Mode
    setIsEditingBusiness(false);
    setSuccessMessage("Business & commercial profile information saved successfully.");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-red-700 font-bold text-xs animate-in fade-in duration-200 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-zinc-500 hover:text-black">✕</button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-black text-red-600 px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-lg">
                {user.referenceId || 'USER-REF-1001'}
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-zinc-200 text-zinc-800 rounded-full">
                {currentCustomerType}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black font-display tracking-tight mt-1">
              {name}
            </h1>
            <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            {currentCustomerType === 'EXPLORER' && (
              <Link
                to="/explorer"
                className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-black font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-red-600" />
                <span>Explorer Hub</span>
              </Link>
            )}
            {currentCustomerType === 'B2B' && (
              <Link
                to="/b2b"
                className="btn-shimmer px-4 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5 text-red-500" />
                <span>B2B Dashboard</span>
              </Link>
            )}
            {currentCustomerType === 'B2C' && (
              <Link
                to="/b2c"
                className="btn-shimmer px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-red-600/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>B2C Ad Portal</span>
              </Link>
            )}
          </div>
        </div>

        {/* SECTION 1: PERSONAL & ACCOUNT TYPE PROFILE */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-black font-display">Profile & Account Type</h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Manage identity credentials and commercial account classification.</p>
            </div>

            {/* In View Mode: Edit Profile button is displayed. NEVER SAVE. */}
            {!isEditingPersonal && (
              <button
                onClick={() => setIsEditingPersonal(true)}
                className="btn-shimmer px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm shadow-red-600/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* VIEW MODE: Default rendering without save buttons */}
          {!isEditingPersonal ? (
            <div className="space-y-6">
              
              {/* Account Type View Block */}
              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Account Classification</span>
                
                {currentCustomerType === 'EXPLORER' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 font-black text-xs uppercase rounded-lg">
                        Current: Explorer
                      </span>
                      <span className="text-xs text-zinc-500 font-semibold">No commercial type selected yet.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-white border border-zinc-200 rounded-xl text-center">
                        <span className="text-xs font-black text-black block">B2B SaaS</span>
                        <span className="text-[10px] text-zinc-500">For self-serve brands</span>
                      </div>
                      <div className="p-3 bg-white border border-zinc-200 rounded-xl text-center">
                        <span className="text-xs font-black text-black block">B2C Agency</span>
                        <span className="text-[10px] text-zinc-500">Done-for-you ad creation</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 font-medium">
                      💡 Click <strong>[Edit Profile]</strong> above to select and permanently establish your account type.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-black font-display">
                        Account Type: <span className="text-red-600">{currentCustomerType}</span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        {currentCustomerType === 'B2B' 
                          ? 'Configured for B2B Self-Serve SaaS and Multi-Product Campaigns.' 
                          : 'Configured for B2C Done-For-You Image & Video Ad Creatives.'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-zinc-200 text-zinc-800 font-black text-[10px] uppercase rounded-full border border-zinc-300">
                      Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Full Name</span>
                  <span className="text-sm font-black text-black">{name}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Email Address</span>
                  <span className="text-sm font-black text-black">{user.email}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Mobile Phone</span>
                  <span className="text-sm font-black text-black">{mobile || 'Not set'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Subscription Status</span>
                  <span className="text-sm font-black text-red-600 uppercase">{user.paymentStatus || 'UNPAID'}</span>
                </div>
              </div>

            </div>
          ) : (
            /* EDIT MODE: Only active when user clicked Edit Profile */
            <form onSubmit={handleSavePersonal} className="space-y-6">
              
              {/* Account Type Selector for Explorer / Locked for B2B & B2C */}
              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Account Type Configuration *
                </label>

                {currentCustomerType === 'EXPLORER' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-600 font-medium">
                      Select your target account type. Once saved, this transition is permanent:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedType('B2B')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          selectedType === 'B2B'
                            ? 'border-red-600 bg-red-50/50 shadow-sm'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-black text-black">B2B SaaS</span>
                          {selectedType === 'B2B' && <Check className="w-4 h-4 text-red-600" />}
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium">For self-serve brands & campaign creators</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedType('B2C')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          selectedType === 'B2C'
                            ? 'border-red-600 bg-red-50/50 shadow-sm'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-black text-black">B2C Creative Client</span>
                          {selectedType === 'B2C' && <Check className="w-4 h-4 text-red-600" />}
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium">Done-for-you professional ad generation</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl">
                    <div>
                      <span className="text-xs font-black text-black">Account Type: {currentCustomerType}</span>
                      <p className="text-[10px] text-zinc-500">Commercial type is locked and cannot be changed.</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase rounded-md">
                      Permanent
                    </span>
                  </div>
                )}
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl font-bold text-xs text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              {/* Action Buttons: Save (Dirty Enforced) and Cancel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name || user.firstName || 'User');
                    setMobile(user.mobile || user.phone || '');
                    setSelectedType(currentCustomerType);
                    setIsEditingPersonal(false);
                  }}
                  className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!isPersonalDirty}
                  className={`btn-shimmer px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm ${
                    isPersonalDirty
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 cursor-pointer'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                  }`}
                >
                  Save Profile Changes
                </button>
              </div>

            </form>
          )}

        </div>

        {/* SECTION 2: COMPANY / BRAND PROFILE (For B2B or B2C users) */}
        {(currentCustomerType === 'B2B' || currentCustomerType === 'B2C') && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-black font-display">
                  {currentCustomerType === 'B2B' ? 'Company Profile' : 'Brand & Creative Profile'}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {currentCustomerType === 'B2B' 
                    ? 'Business entity details, website, and industry parameters.'
                    : 'Brand information utilized for generating advertising creatives.'}
                </p>
              </div>

              {/* In View Mode: Edit Profile button is displayed. NEVER SAVE. */}
              {!isEditingBusiness && (
                <button
                  onClick={() => setIsEditingBusiness(true)}
                  className="btn-shimmer px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm shadow-red-600/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{currentCustomerType === 'B2B' ? 'Edit Company Profile' : 'Edit Brand Profile'}</span>
                </button>
              )}
            </div>

            {/* VIEW MODE: Default rendering without save buttons */}
            {!isEditingBusiness ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                    {currentCustomerType === 'B2B' ? 'Company Name' : 'Brand Name'}
                  </span>
                  <span className="text-sm font-black text-black">{companyName || 'Not configured'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                    {currentCustomerType === 'B2B' ? 'Industry' : 'Product Category'}
                  </span>
                  <span className="text-sm font-black text-black">{industry || productCategory || 'General'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Website URL</span>
                  <span className="text-sm font-black text-black">{website || 'Not configured'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Commercial Contact</span>
                  <span className="text-sm font-black text-black">{businessPhone || user.email}</span>
                </div>

                <div className="sm:col-span-2 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Description & Marketing Hook</span>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                    {description || 'No promotional description provided yet.'}
                  </p>
                </div>
              </div>
            ) : (
              /* EDIT MODE: Only active when user clicked Edit Company Profile */
              <form onSubmit={handleSaveBusiness} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      {currentCustomerType === 'B2B' ? 'Company Name *' : 'Brand Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                      placeholder="e.g. Velocity Footwear Ltd."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      {currentCustomerType === 'B2B' ? 'Industry' : 'Product Category'}
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                      placeholder="e.g. E-Commerce Footwear"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                      placeholder="https://brand.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Business Phone</label>
                    <input
                      type="text"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    placeholder="Provide overview of brand value proposition and products..."
                  />
                </div>

                {/* Action Buttons: Save and Cancel */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyName(user.companyName || '');
                      setIndustry(user.industry || 'E-Commerce');
                      setWebsite(user.website || '');
                      setDescription(user.description || '');
                      setIsEditingBusiness(false);
                    }}
                    className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!isBusinessDirty}
                    className={`btn-shimmer px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm ${
                      isBusinessDirty
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 cursor-pointer'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                    }`}
                  >
                    Save Company Profile
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
