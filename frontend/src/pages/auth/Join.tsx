import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

import { sanitizeName, validateName, sanitizePhone, validatePhoneDigits, validateEmail } from '../../utils/validationUtils';
import { LOCATION_DATA, CATEGORY_OPTIONS } from '../../constants/locationAndCategoryData';

export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', length: 10, placeholder: '10-digit mobile number' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸', length: 10, placeholder: '10-digit phone number' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', minLength: 10, maxLength: 11, length: 10, placeholder: '10 or 11-digit phone' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', length: 9, placeholder: '9-digit phone number' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', length: 8, placeholder: '8-digit phone number' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', length: 9, placeholder: '9-digit phone number' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', minLength: 10, maxLength: 11, length: 11, placeholder: '10 or 11-digit phone' },
  { code: '+33', country: 'France', flag: '🇫🇷', length: 9, placeholder: '9-digit phone number' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', length: 10, placeholder: '10-digit phone number' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', length: 9, placeholder: '9-digit phone number' },
];

export const getCountryRule = (code: string) => {
  return COUNTRY_CODES.find(c => c.code === code) || { code, country: 'International', flag: '🌐', length: 10, placeholder: 'Phone number' };
};

export default function Join() {
  const [step, setStep] = useState(1);

  // Form State - Step 1: Personal Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');

  // Field Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Form State - Step 2: Company / Business Info
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Mumbai');
  const businessAddress = '';
  const [businessType, setBusinessType] = useState('Individual');
  const [industry, setIndustry] = useState('Education');
  const [yearEstablished, setYearEstablished] = useState('');
  const numEmployees = 1;
  const [numProducts] = useState(1);
  const [productCategories, setProductCategories] = useState('Education');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('0-1 Years');

  // Form State Constants
  const companyCountry = country;
  const intentType = 'EXPLORER';
  const b2bExpectedUsers = 1;
  const b2bAdChannels: string[] = [];
  const b2bSocialPlatforms: string[] = [];
  const b2bMainRequirement = '';
  const b2bExpectedUsage = 'Daily';
  const b2bAdProblems = '';
  const b2cProdName = 'Flagship Product';
  const b2cProdCategory = 'General';
  const b2cProdWebsite = '';
  const b2cAdMethod = '';
  const b2cAdTypes: string[] = [];
  const b2cExpectedAds = 1;
  const explorerLearnIntent = '';
  const explorerInterestService = '';
  const explorerOptionalBiz = '';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCountrySelect = (newCountry: string) => {
    setCountry(newCountry);
    const states = Object.keys(LOCATION_DATA[newCountry] || {});
    const firstState = states[0] || '';
    setState(firstState);
    const cities = LOCATION_DATA[newCountry]?.[firstState] || [];
    setCity(cities[0] || '');
  };

  const handleStateSelect = (newState: string) => {
    setState(newState);
    const cities = LOCATION_DATA[country]?.[newState] || [];
    setCity(cities[0] || '');
  };

  const validateStep1 = () => {
    const nameVal = validateName(name);
    setNameError(nameVal.error);

    const emailVal = validateEmail(email);
    setEmailError(emailVal.error);

    const rule = getCountryRule(countryCode);
    const phoneVal = validatePhoneDigits(phone, rule.minLength || rule.length || 8, rule.maxLength || rule.length || 11);
    setPhoneError(phoneVal.error);

    if (!nameVal.isValid || !emailVal.isValid || !phoneVal.isValid) {
      return false;
    }

    if (!password || !confirmPassword) {
      alert("Password fields are required.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.");
      return false;
    }

    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (!companyName || !businessType || !industry || !productCategories) {
        alert("Please fill in all required (*) business details.");
        return;
      }
      registerUser('COMPLETED');
    }
  };

  const registerUser = async (profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED') => {
    const payload = {
      name,
      email,
      password,
      country,
      countryCode,
      phone: `${countryCode} ${phone}`,
      profileStatus,
      intentType,
      // Company info
      companyName,
      companyEmail: email,
      companyPhone: `${countryCode} ${phone}`,
      website,
      companyCountry,
      state,
      city,
      businessAddress,
      businessType,
      industry,
      yearEstablished,
      numEmployees,
      numProducts,
      productCategories: productCategories.split(',').map(s => s.trim()).filter(Boolean),
      description,
      experience,
      // B2B info
      b2bExpectedUsers,
      b2bAdChannels,
      b2bSocialPlatforms,
      b2bMainRequirement,
      b2bExpectedUsage,
      b2bAdProblems,
      // B2C info
      b2cProdName,
      b2cProdCategory,
      b2cProdWebsite,
      b2cAdMethod,
      b2cAdTypes,
      b2cExpectedAds,
      // Explorer info
      explorerLearnIntent,
      explorerInterestService,
      explorerOptionalBiz
    };

    const leadRefId = `LEAD-REF-${Math.floor(100000 + Math.random() * 900000)}`;


    const mockUser = {
      _id: `lead-${Date.now()}`,
      referenceId: leadRefId,
      email,
      password,
      name,
      firstName: name.split(' ')[0] || 'Client',
      lastName: name.split(' ')[1] || 'User',
      customerType: 'EXPLORER',
      accountType: 'EXPLORER',
      role: 'CUSTOMER',
      status: 'LEAD',
      paymentStatus: 'PENDING',
      freeAdsAllowed: 1,
      freeAdsUsed: 0,
      freeAdsRemaining: 1,
      freeAdGenerated: false,
      mobile: `${countryCode} ${phone}`,
      countryCode,
      phone,
      country,
      profileStatus,
      intentType,
      companyName: companyName || 'Lead Brand',
      businessType,
      website,
      industry: industry || 'E-Commerce',
      city,
      state,
      productCategories: productCategories ? [productCategories] : [],
      description: description || 'Registered prospect.',
      mainProduct: {
        name: productCategories.split(',')[0] || b2cProdName || 'Flagship Product',
        price: 99,
        category: b2cProdCategory || 'General'
      },
      createdDate: new Date().toISOString().split('T')[0]
    };

    // Always persist to mock_users in browser DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const existingIdx = mockUsers.findIndex((u: any) => u.email === email);
    if (existingIdx !== -1) {
      mockUsers[existingIdx] = mockUser;
    } else {
      mockUsers.push(mockUser);
    }
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    // Also persist to mock_leads pipeline
    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
    const leadIdx = mockLeads.findIndex((l: any) => l.email === email);
    if (leadIdx !== -1) {
      mockLeads[leadIdx] = mockUser;
    } else {
      mockLeads.push({
        _id: mockUser._id,
        referenceId: leadRefId,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.mobile,
        companyName: mockUser.companyName,
        customerType: 'EXPLORER',
        intentType: mockUser.intentType,
        status: 'NEW',
        freeAdsAllowed: 1,
        freeAdsUsed: 0,
        profileStatus,
        createdAt: new Date().toISOString()
      });
    }
    localStorage.setItem('mock_leads', JSON.stringify(mockLeads));

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, referenceId: leadRefId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      dispatch(setCredentials({ user: { ...mockUser, ...data.user, freeAdsAllowed: 1, freeAdsUsed: 0 }, token: data.token }));
      navigate('/explorer/free-ad');
      
    } catch (err: any) {
      console.warn("Backend offline or local fallback:", err.message);
      dispatch(setCredentials({ user: mockUser, token: 'mock-jwt-token' }));
      navigate('/explorer/free-ad');
    }
  };



  const handleSkip = () => {
    if (step === 1 && !validateStep1()) return;
    registerUser('INCOMPLETE');
  };



  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-lg space-y-6">
        
        {/* Top-Left Back Navigation */}
        <div className="flex justify-between items-center -mt-2">
          {step === 1 ? (
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition-colors px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>Back to Home</span>
            </Link>
          ) : (
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition-colors px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>Back to Step 1 (Personal Info)</span>
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <Link to="/" className="text-3xl font-black tracking-tight font-display text-black">
            AD<span className="text-red-600">HUNTER</span>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-black tracking-tight font-display">Create Your Account</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2].map(s => (
              <span key={s} className={`h-2 rounded-full transition-all ${step === s ? 'w-8 bg-red-600' : 'w-2 bg-zinc-200'}`}></span>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Full Name (Letters Only) *</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => {
                    const cleaned = sanitizeName(e.target.value);
                    setName(cleaned);
                    setNameError(validateName(cleaned).error);
                  }} 
                  className={`w-full p-3 bg-zinc-50 border rounded-xl font-bold text-black focus:outline-none text-sm ${
                    nameError ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-300 focus:border-red-600'
                  }`} 
                  placeholder="John Doe" 
                />
                {nameError && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">⚠️ {nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Work Email (Strict TLD Check) *</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => {
                    const val = e.target.value;
                    setEmail(val);
                    setEmailError(validateEmail(val).error);
                  }} 
                  className={`w-full p-3 bg-zinc-50 border rounded-xl font-bold text-black focus:outline-none text-sm ${
                    emailError ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-300 focus:border-red-600'
                  }`} 
                  placeholder="john@company.com" 
                />
                {emailError && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">⚠️ {emailError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Password *</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Confirm Password *</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="••••••••" />
              </div>
            </div>

            {/* Cascading Location Selection */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">📍 Select Location (Country ➔ State ➔ City) *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={e => handleCountrySelect(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  >
                    {Object.keys(LOCATION_DATA).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">State / Region</label>
                  <select
                    value={state}
                    onChange={e => handleStateSelect(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  >
                    {Object.keys(LOCATION_DATA[country] || {}).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">City</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  >
                    {(LOCATION_DATA[country]?.[state] || []).map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Contact Phone (Numbers Only) *</label>
              <div className="flex gap-2">
                <select 
                  value={countryCode} 
                  onChange={e => setCountryCode(e.target.value)} 
                  className="p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 w-32 text-xs"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <div className="flex-1">
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={e => {
                      const digits = sanitizePhone(e.target.value);
                      setPhone(digits);
                      const rule = getCountryRule(countryCode);
                      setPhoneError(validatePhoneDigits(digits, rule.minLength || rule.length || 8, rule.maxLength || rule.length || 11).error);
                    }} 
                    maxLength={getCountryRule(countryCode).maxLength || getCountryRule(countryCode).length}
                    className={`w-full p-3 bg-zinc-50 border rounded-xl font-bold text-black focus:outline-none text-sm ${
                      phoneError ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-300 focus:border-red-600'
                    }`} 
                    placeholder={getCountryRule(countryCode).placeholder} 
                  />
                  {phoneError && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">⚠️ {phoneError}</p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black shadow-md shadow-red-600/20 rounded-xl uppercase tracking-wider text-xs transition-all mt-6">
              Next: Business Info
            </button>
          </form>
        )}

        {/* Step 2: Company details */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Company Name *</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Business Type *</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm">
                  <option value="Individual">Individual</option>
                  <option value="Startup">Startup</option>
                  <option value="Small Business">Small Business</option>
                  <option value="Medium Business">Medium Business</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Agency">Agency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Industry Category *</label>
                <select value={industry} onChange={e => { setIndustry(e.target.value); setProductCategories(e.target.value); }} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm">
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Company Website</label>
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="www.acme.com" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">State</label>
                <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Est. Year</label>
                <input type="text" value={yearEstablished} onChange={e => setYearEstablished(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="2022" />
              </div>
            </div>

            {/* Targeted Audience Checkboxes */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">🎯 Targeted Audience Groups</label>
              <div className="grid grid-cols-2 gap-2">
                {['Students', 'Home Maker', 'IT Professionals', 'Business Owners / Entrepreneurs', 'Healthcare Professionals', 'Working Professionals', 'Senior Citizens', 'Others'].map(target => (
                  <label key={target} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-200 text-xs font-bold text-black cursor-pointer hover:border-red-600">
                    <input
                      type="checkbox"
                      defaultChecked={target === 'Students' || target === 'IT Professionals'}
                      className="w-3.5 h-3.5 text-red-600 rounded border-zinc-300 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="truncate text-[11px]">{target}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Simplified Ad Type</label>
                <select value={productCategories} onChange={e => setProductCategories(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm">
                  <option value="B2C Creative Banner">B2C Creative Banner</option>
                  <option value="B2B Commercial Ad">B2B Commercial Ad</option>
                  <option value="Social Promotion">Social Promotion</option>
                  <option value="Product Launch">Product Launch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Experience Level</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm">
                  <option value="0-1 Years">0-1 Years</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Business Description *</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm h-20 resize-none" placeholder="Briefly describe what your company does..." />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(1)} className="w-1/4 py-3.5 bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 rounded-xl uppercase text-xs">Back</button>
              <button type="button" onClick={handleSkip} className="w-1/4 py-3.5 border border-dashed border-zinc-300 text-zinc-500 font-bold hover:bg-zinc-50 rounded-xl uppercase text-xs">Skip</button>
              <button type="submit" className="btn-shimmer flex-1 py-3.5 bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs">Create Account</button>
            </div>
          </form>
        )}
        <div className="mt-8 text-center text-sm font-medium text-zinc-500 border-t border-zinc-200 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-red-600 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
