import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

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

  // Form State - Step 2: Company / Business Info
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyCountryCode, setCompanyCountryCode] = useState('+91');
  const [companyPhone, setCompanyPhone] = useState('');
  const [website, setWebsite] = useState('');
  const companyCountry = 'India';
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const businessAddress = '';
  const [businessType, setBusinessType] = useState('Individual');
  const [industry, setIndustry] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const numEmployees = 1;
  const [numProducts] = useState(1);
  const [productCategories, setProductCategories] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('0-1 Years');

  // Form State Constants (previously step 3 & 4 choice values)
  const intentType = 'Explorer';
  const b2bExpectedUsers = 1;
  const b2bAdChannels: string[] = [];
  const b2bSocialPlatforms: string[] = [];
  const b2bMainRequirement = '';
  const b2bExpectedUsage = 'Daily';
  const b2bAdProblems = '';
  const b2cProdName = '';
  const b2cProdCategory = '';
  const b2cProdWebsite = '';
  const b2cAdMethod = '';
  const b2cAdTypes: string[] = [];
  const b2cExpectedAds = 1;
  const explorerLearnIntent = '';
  const explorerInterestService = '';
  const explorerOptionalBiz = '';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validatePhoneNumber = (rawPhone: string, code: string, fieldName: string): boolean => {
    if (!rawPhone.trim()) return true;
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (rawPhone !== digitsOnly) {
      alert(`${fieldName} must contain only numbers (no letters or symbols).`);
      return false;
    }
    const rule = getCountryRule(code);
    if (rule.minLength && rule.maxLength) {
      if (digitsOnly.length < rule.minLength || digitsOnly.length > rule.maxLength) {
        alert(`For ${rule.country} (${rule.code}), ${fieldName.toLowerCase()} must be between ${rule.minLength} and ${rule.maxLength} digits. You entered ${digitsOnly.length} digits.`);
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

  const validateStep1 = () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      alert("Please fill in all required (*) personal details.");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }
    // Password Strength Check
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.");
      return false;
    }
    // Validate phone number against country rule
    return validatePhoneNumber(phone, countryCode, "Contact phone number");
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (!companyName || !businessType || !industry || !productCategories || !description) {
        alert("Please fill in all required (*) business details.");
        return;
      }
      if (companyPhone && !validatePhoneNumber(companyPhone, companyCountryCode, "Company phone number")) {
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
      companyEmail,
      companyPhone: companyPhone ? `${companyCountryCode} ${companyPhone}` : '',
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
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Full Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Email Address *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Password *</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Confirm Password *</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Country *</label>
              <input type="text" required value={country} onChange={e => setCountry(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="India" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Contact Phone *</label>
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
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                  maxLength={getCountryRule(countryCode).maxLength || getCountryRule(countryCode).length}
                  className="flex-1 p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" 
                  placeholder={getCountryRule(countryCode).placeholder} 
                />
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
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Company Email</label>
                <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="corp@acme.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Company Phone</label>
                <div className="flex gap-2">
                  <select 
                    value={companyCountryCode} 
                    onChange={e => setCompanyCountryCode(e.target.value)} 
                    className="p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 w-32 text-xs"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    value={companyPhone} 
                    onChange={e => setCompanyPhone(e.target.value.replace(/\D/g, ''))} 
                    maxLength={getCountryRule(companyCountryCode).maxLength || getCountryRule(companyCountryCode).length}
                    className="flex-1 p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" 
                    placeholder={getCountryRule(companyCountryCode).placeholder} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Website</label>
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="www.acme.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Industry *</label>
                <input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="E-commerce, Apparel" />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Product Categories *</label>
                <input type="text" required value={productCategories} onChange={e => setProductCategories(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="Electronics, Gadgets" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Experience</label>
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
