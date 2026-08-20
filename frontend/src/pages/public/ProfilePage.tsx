import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Edit3, Check, 
  Lock, CheckCircle2, Compass, ArrowLeft,
  CreditCard, Calendar, Sparkles
} from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';
import { COUNTRY_CODES, getCountryRule } from '../auth/Join';
import { validateName, validatePhoneDigits } from '../../utils/validationUtils';

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
  const [personalCountryCode, setPersonalCountryCode] = useState(user?.countryCode || '+91');
  const [mobile, setMobile] = useState((user?.mobile || user?.phone || '').replace(/^\+\d+\s*/, ''));
  const [selectedType, setSelectedType] = useState<'EXPLORER' | 'B2B' | 'B2C'>(currentCustomerType);
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'Not Specified');

  // Validation States
  const [nameErr, setNameErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  // Business / Company Form Fields
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyEmail, setCompanyEmail] = useState(user?.companyEmail || user?.email || '');
  const [industry, setIndustry] = useState(user?.industry || 'E-Commerce');
  const [website, setWebsite] = useState(user?.website || '');
  const [businessCountryCode, setBusinessCountryCode] = useState('+91');
  const [businessPhone, setBusinessPhone] = useState((user?.companyPhone || user?.mobile || '').replace(/^\+\d+\s*/, ''));
  const [description, setDescription] = useState(user?.description || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'Direct to Consumer (B2C)');
  const [yearEstablished, setYearEstablished] = useState(user?.yearEstablished || '2024');
  const [numEmployees, setNumEmployees] = useState(user?.numEmployees || 10);
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [state, setState] = useState(user?.state || 'Maharashtra');
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

  const validatePhone = (rawPhone: string, code: string, fieldName: string): boolean => {
    if (!rawPhone.trim()) return true;
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (rawPhone !== digitsOnly) {
      alert(`${fieldName} must contain only numbers.`);
      return false;
    }
    const rule = getCountryRule(code);
    if (rule.minLength && rule.maxLength) {
      if (digitsOnly.length < rule.minLength || digitsOnly.length > rule.maxLength) {
        alert(`For ${rule.country} (${rule.code}), ${fieldName.toLowerCase()} must be between ${rule.minLength} and ${rule.maxLength} digits.`);
        return false;
      }
    } else if (rule.length) {
      if (digitsOnly.length !== rule.length) {
        alert(`For ${rule.country} (${rule.code}), ${fieldName.toLowerCase()} must be exactly ${rule.length} digits. You entered ${digitsOnly.length} digits.`);
        return false;
      }
    }
    return true;
  };

  // Handle Save Personal Profile
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();

    const nameVal = validateName(name);
    setNameErr(nameVal.error);

    const rule = getCountryRule(personalCountryCode);
    const phoneVal = validatePhoneDigits(mobile, rule.minLength || rule.length || 8, rule.maxLength || rule.length || 11);
    setPhoneErr(phoneVal.error);

    if (!nameVal.isValid || (mobile && !phoneVal.isValid)) {
      return;
    }

    const updatedCustomerType = selectedType;
    const updatedRole = updatedCustomerType === 'B2B' 
      ? 'BUSINESS_OWNER' 
      : updatedCustomerType === 'B2C' 
        ? 'CUSTOMER' 
        : user.role;

    const formattedMobile = mobile ? `${personalCountryCode} ${mobile}` : '';

    const updatedUser = {
      ...user,
      name,
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || '',
      mobile: formattedMobile,
      countryCode: personalCountryCode,
      customerType: updatedCustomerType,
      accountType: updatedCustomerType,
      role: updatedRole,
      dateOfBirth,
      gender
    };

    // Update Redux state immediately
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    // Update local DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      mockUsers[idx] = { ...mockUsers[idx], ...updatedUser };
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

    if (businessPhone && !validatePhone(businessPhone, businessCountryCode, "Business phone number")) {
      return;
    }

    const formattedBusinessPhone = businessPhone ? `${businessCountryCode} ${businessPhone}` : '';

    const updatedUser = {
      ...user,
      companyName,
      companyEmail,
      industry,
      website,
      companyPhone: formattedBusinessPhone,
      description,
      businessType,
      yearEstablished,
      numEmployees,
      businessAddress,
      city,
      state,
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
    const idx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
    if (idx !== -1) {
      mockUsers[idx] = { ...mockUsers[idx], ...updatedUser };
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    // Success State Transition: Return to View Mode
    setIsEditingBusiness(false);
    setSuccessMessage("Business & commercial profile information saved successfully.");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top-Left Back Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to={user?.role === 'SUPER_ADMIN' ? '/admin' : currentCustomerType === 'B2B' ? '/b2b' : currentCustomerType === 'B2C' ? '/b2c' : '/explorer'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition-colors px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

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
            <div className="p-3 bg-white border border-zinc-200 rounded-2xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-zinc-700">Account Active</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: PERSONAL & ACCOUNT TYPE PROFILE */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              {isEditingPersonal && (
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(false)}
                  className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors flex items-center gap-1 text-xs font-bold mr-1"
                  title="Cancel Edit"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-black text-black font-display">
                  {isEditingPersonal ? 'Edit Profile & Account Type' : 'Profile & Account Type'}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Manage identity credentials and commercial account classification.</p>
              </div>
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

              {/* Personal & Business Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Date of Birth</span>
                  <span className="text-sm font-black text-black">{dateOfBirth || 'Not Specified'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Gender</span>
                  <span className="text-sm font-black text-black">{gender}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Company Name</span>
                  <span className="text-sm font-black text-black">{companyName || 'N/A'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Business Website</span>
                  <span className="text-sm font-black text-red-600 truncate block">{website || 'N/A'}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Industry Sector</span>
                  <span className="text-sm font-black text-black">{industry}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Business Type</span>
                  <span className="text-sm font-black text-black">{businessType}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Year Established</span>
                  <span className="text-sm font-black text-black">{yearEstablished}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Number of Employees</span>
                  <span className="text-sm font-black text-black">{numEmployees}</span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Business Address</span>
                  <span className="text-sm font-black text-black">{businessAddress ? `${businessAddress}, ${city}, ${state}` : `${city}, ${state}`}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Full Name (Letters Only) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setName(cleaned);
                      setNameErr(validateName(cleaned).error);
                    }}
                    className={`w-full px-4 py-3 bg-zinc-50 border rounded-xl font-bold text-xs text-black focus:outline-none ${
                      nameErr ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-300 focus:border-red-600'
                    }`}
                  />
                  {nameErr && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">⚠️ {nameErr}</p>
                  )}
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Mobile Phone (Numbers Only)</label>
                  <div className="flex gap-2">
                    <select
                      value={personalCountryCode}
                      onChange={(e) => setPersonalCountryCode(e.target.value)}
                      className="px-3 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600 w-28"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setMobile(digits);
                          const rule = getCountryRule(personalCountryCode);
                          setPhoneErr(validatePhoneDigits(digits, rule.minLength || rule.length || 8, rule.maxLength || rule.length || 11).error);
                        }}
                        className={`w-full px-4 py-3 bg-zinc-50 border rounded-xl font-bold text-xs text-black focus:outline-none ${
                          phoneErr ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-300 focus:border-red-600'
                        }`}
                        placeholder={getCountryRule(personalCountryCode).placeholder}
                      />
                      {phoneErr && (
                        <p className="text-[11px] font-bold text-red-600 mt-1">⚠️ {phoneErr}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Velocity Athletics"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Company Email</label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Business Type</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Direct to Consumer (B2C)"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Year Established</label>
                  <input
                    type="text"
                    value={yearEstablished}
                    onChange={(e) => setYearEstablished(e.target.value)}
                    placeholder="2024"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Number of Employees</label>
                  <input
                    type="number"
                    value={numEmployees}
                    onChange={(e) => setNumEmployees(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Business Address</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Street / Office Address"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Action Buttons: Save (Dirty Enforced) and Cancel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name || user.firstName || 'User');
                    setMobile((user.mobile || user.phone || '').replace(/^\+\d+\s*/, ''));
                    setPersonalCountryCode(user.countryCode || '+91');
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
              <div className="flex items-center gap-2">
                {isEditingBusiness && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBusiness(false)}
                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors flex items-center gap-1 text-xs font-bold mr-1"
                    title="Cancel Edit"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-black text-black font-display">
                    {isEditingBusiness 
                      ? (currentCustomerType === 'B2B' ? 'Edit Company Profile' : 'Edit Brand Profile')
                      : (currentCustomerType === 'B2B' ? 'Company Profile' : 'Brand & Creative Profile')}
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    {currentCustomerType === 'B2B' 
                      ? 'Business entity details, website, and industry parameters.'
                      : 'Brand information utilized for generating advertising creatives.'}
                  </p>
                </div>
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
                    <div className="flex gap-2">
                      <select
                        value={businessCountryCode}
                        onChange={e => setBusinessCountryCode(e.target.value)}
                        className="px-3 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600 w-28"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={businessPhone}
                        maxLength={getCountryRule(businessCountryCode).maxLength || getCountryRule(businessCountryCode).length}
                        onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                        placeholder={getCountryRule(businessCountryCode).placeholder}
                      />
                    </div>
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

        {/* SECTION 3: SUBSCRIPTION & BILLING LIFECYCLE */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Subscription Lifecycle</span>
              </div>
              <h2 className="text-lg font-black text-black font-display">Commercial Plan & Billing Status</h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Track your active plan entitlement, monthly validity, and renewal status.</p>
            </div>

            {user?.subscription && (
              <div className="flex items-center gap-2">
                {user.paymentStatus === 'PAID' && (user.subscriptionExpiresAt ? Date.now() < Number(user.subscriptionExpiresAt) : true) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const expiredTimestamp = Date.now() - 1000;
                      const updated = {
                        ...user,
                        paymentStatus: 'EXPIRED',
                        subscriptionExpiresAt: expiredTimestamp,
                        subscriptionExpiryDate: new Date(expiredTimestamp).toLocaleDateString()
                      };
                      dispatch(setCredentials({ user: updated, token: 'mock-jwt-token' }));
                      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
                      const idx = mockUsers.findIndex((u: any) => u.email === user.email);
                      if (idx !== -1) {
                        mockUsers[idx] = updated;
                        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
                      }
                      setSuccessMessage("Simulated 1 month passed: Plan is now expired and Payment Due button is active!");
                      setTimeout(() => setSuccessMessage(null), 4000);
                    }}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-xl border border-zinc-200 transition-colors"
                    title="Simulate 30 days passing to test payment renewal"
                  >
                    ⏱️ Test 1 Month Expiry
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const freshExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
                      const updated = {
                        ...user,
                        paymentStatus: 'PAID',
                        subscriptionStatus: 'ACTIVE',
                        subscriptionExpiresAt: freshExpiry,
                        subscriptionExpiryDate: new Date(freshExpiry).toLocaleDateString()
                      };
                      dispatch(setCredentials({ user: updated, token: 'mock-jwt-token' }));
                      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
                      const idx = mockUsers.findIndex((u: any) => u.email === user.email);
                      if (idx !== -1) {
                        mockUsers[idx] = updated;
                        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
                      }
                      setSuccessMessage("Reset subscription to 1 month paid (30 days remaining)!");
                      setTimeout(() => setSuccessMessage(null), 4000);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-sm transition-colors"
                  >
                    ↺ Reset 1 Month Paid
                  </button>
                )}
              </div>
            )}
          </div>

          {user?.subscription ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Plan Name */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Subscribed Plan</span>
                  <div className="text-base font-black text-black">{user.subscription}</div>
                  <span className="text-xs text-zinc-500 font-semibold">{user.billingCycle || 'Monthly'} Billing Cycle</span>
                </div>

                {/* Status & Validity */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Payment & Validity</span>
                  {user.paymentStatus === 'PAID' && (user.subscriptionExpiresAt ? Date.now() < Number(user.subscriptionExpiresAt) : true) ? (
                    <div>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs uppercase bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid for 1 Month</span>
                      </span>
                      <div className="text-xs text-zinc-600 font-bold mt-1.5">
                        {user.subscriptionExpiresAt 
                          ? `${Math.max(0, Math.ceil((Number(user.subscriptionExpiresAt) - Date.now()) / (1000 * 60 * 60 * 24)))} Days Remaining`
                          : 'Active Monthly'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1 text-red-700 font-black text-xs uppercase bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payment Due (1 Month Expired)</span>
                      </span>
                      <div className="text-xs text-red-600 font-bold mt-1.5">
                        Renewal required to maintain active studio deliverables
                      </div>
                    </div>
                  )}
                </div>

                {/* Expiration Date */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Next Renewal / Expiry</span>
                  <div className="text-sm font-black text-black flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span>{user.subscriptionExpiryDate || 'In 30 Days'}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">Subscribed: {user.subscriptionDate || 'Recent'}</span>
                </div>

              </div>

              {/* Payment Action Bar */}
              {user.paymentStatus === 'PAID' && (user.subscriptionExpiresAt ? Date.now() < Number(user.subscriptionExpiresAt) : true) ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your subscription is fully paid for this month. All commercial tools, dispatch APIs, and creative deliverables are active.</span>
                  </div>
                  <Link
                    to="/pricing"
                    className="px-4 py-2 bg-white hover:bg-zinc-50 text-black text-xs font-bold rounded-xl border border-zinc-200 shadow-sm shrink-0 transition-colors"
                  >
                    View All Plans
                  </Link>
                </div>
              ) : (
                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="text-xs font-black text-red-700 uppercase tracking-wider">1 Month Cycle Completed</div>
                    <p className="text-xs text-zinc-700 font-medium">
                      Your monthly billing cycle has ended. Please pay for the upcoming month to renew and continue active campaigns.
                    </p>
                  </div>
                  <Link
                    to="/pricing"
                    className="btn-shimmer px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20 shrink-0 flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Subscription Now</span>
                  </Link>
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-black text-black uppercase tracking-wider">No Active Subscription</div>
                <p className="text-xs text-zinc-600 font-medium">
                  You are currently using the Explorer tier. Upgrade to a B2B or B2C plan to unlock multi-product campaigns and automated posting.
                </p>
              </div>
              <Link
                to="/pricing"
                className="btn-shimmer px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20 shrink-0"
              >
                <span>View Plans & Subscribe</span>
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
