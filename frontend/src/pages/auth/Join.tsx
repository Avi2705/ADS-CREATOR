import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';

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

  // Form State - Step 3: Intent Choice (B2B, B2C, Explorer)
  const [intentType, setIntentType] = useState<'B2B' | 'B2C' | 'Explorer'>('B2B');

  // Form State - Step 4: B2B Conditional
  const [b2bExpectedUsers, setB2bExpectedUsers] = useState(1);
  const b2bAdChannels: string[] = [];
  const [b2bSocialPlatforms, setB2bSocialPlatforms] = useState<string[]>([]);
  const [b2bMainRequirement, setB2bMainRequirement] = useState('');
  const [b2bExpectedUsage, setB2bExpectedUsage] = useState('Daily');
  const [b2bAdProblems, setB2bAdProblems] = useState('');

  // Form State - Step 4: B2C Conditional
  const [b2cProdName, setB2cProdName] = useState('');
  const [b2cProdCategory, setB2cProdCategory] = useState('');
  const [b2cProdWebsite, setB2cProdWebsite] = useState('');
  const [b2cAdMethod, setB2cAdMethod] = useState('');
  const b2cAdTypes: string[] = [];
  const [b2cExpectedAds, setB2cExpectedAds] = useState(1);

  // Form State - Step 4: Explorer Conditional
  const [explorerLearnIntent, setExplorerLearnIntent] = useState('');
  const [explorerInterestService, setExplorerInterestService] = useState('');
  const explorerOptionalBiz = '';

  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    // Phone Number digits-only check
    const digitsOnly = phone.replace(/\D/g, '');
    if (phone !== digitsOnly) {
      alert("Phone number must contain only numbers.");
      return false;
    }

    // Country Code specific length checks
    if (countryCode === '+91') {
      if (digitsOnly.length !== 10) {
        alert("For India (+91), the mobile number must be exactly 10 digits.");
        return false;
      }
    } else if (countryCode === '+1') {
      if (digitsOnly.length !== 10) {
        alert("For America (+1), the phone number must be exactly 10 digits.");
        return false;
      }
    } else if (countryCode === '+44') {
      if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
        alert("For United Kingdom (+44), the phone number must be 10 or 11 digits.");
        return false;
      }
    }
    return true;
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
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const registerUser = async (profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED') => {
    const payload = {
      name,
      email,
      password,
      country,
      countryCode,
      phone,
      profileStatus,
      intentType,
      // Company info
      companyName,
      companyEmail,
      companyPhone,
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
      
      dispatch(setCredentials({ user: { ...mockUser, ...data.user }, token: data.token }));
      navigate('/explorer');
      
    } catch (err: any) {
      console.warn("Backend offline or local fallback:", err.message);
      dispatch(setCredentials({ user: mockUser, token: 'mock-jwt-token' }));
      navigate('/explorer');
    }
  };



  const handleSkip = () => {
    if (step === 1 && !validateStep1()) return;
    registerUser('INCOMPLETE');
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser('COMPLETED');
  };

  const toggleArrayItem = (list: string[], setList: (arr: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-lg">
        
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black tracking-tight font-display text-black">
            AD<span className="text-red-600">HUNTER</span>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-black tracking-tight font-display">Create Your Account</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3, 4].map(s => (
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
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 w-24 text-sm">
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input 
                  type="text" required value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  maxLength={countryCode === '+91' || countryCode === '+1' ? 10 : countryCode === '+44' ? 11 : undefined}
                  className="flex-1 p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" 
                  placeholder={countryCode === '+91' ? '10-digit number' : 'Phone'} 
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Company Email</label>
                <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="corp@acme.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Company Phone</label>
                <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm" placeholder="+1 555-0011" />
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
              <button type="submit" className="btn-shimmer flex-1 py-3.5 bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs">Next: Intent</button>
            </div>
          </form>
        )}

        {/* Step 3: Intent Choices */}
        {step === 3 && (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-4 text-center">Why are you here? *</label>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { type: 'B2B', title: 'B2B Platform Client', desc: 'I want the AD-HUNTER software to manage multiple products, advertisements, videos, publishing, and customer leads.' },
                { type: 'B2C', title: 'B2C Ad Creation Service', desc: 'I want to promote my own product/business and need advertisement creation services.' },
                { type: 'Explorer', title: 'Platform Explorer', desc: 'I want to explore AD-HUNTER and learn more about the platform.' }
              ].map((card) => (
                <div 
                  key={card.type}
                  onClick={() => setIntentType(card.type as any)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    intentType === card.type 
                      ? 'border-red-600 bg-red-50/40' 
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-black text-base">{card.title}</h3>
                    <input type="radio" checked={intentType === card.type} onChange={() => {}} className="accent-red-600 w-4 h-4" />
                  </div>
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setStep(2)} className="w-1/4 py-3.5 bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 rounded-xl uppercase text-xs">Back</button>
              <button type="button" onClick={handleSkip} className="w-1/4 py-3.5 border border-dashed border-zinc-300 text-zinc-500 font-bold hover:bg-zinc-50 rounded-xl uppercase text-xs">Skip</button>
              <button type="button" onClick={() => setStep(4)} className="btn-shimmer flex-1 py-3.5 bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs">Continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Intent-specific questions */}
        {step === 4 && (
          <form onSubmit={handleFinish} className="space-y-4">
            
            {/* B2B Questions */}
            {intentType === 'B2B' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Expected User Seats</label>
                    <input type="number" value={b2bExpectedUsers} onChange={e => setB2bExpectedUsers(parseInt(e.target.value) || 1)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Expected Software Usage</label>
                    <select value={b2bExpectedUsage} onChange={e => setB2bExpectedUsage(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm">
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Main Platform Requirement</label>
                  <input type="text" value={b2bMainRequirement} onChange={e => setB2bMainRequirement(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="AI Video Generation, Lead Collection" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Social Platforms Used</label>
                  <div className="flex flex-wrap gap-2">
                    {['Meta Ads', 'TikTok', 'Google Display', 'LinkedIn'].map(p => (
                      <button 
                        type="button" key={p}
                        onClick={() => toggleArrayItem(b2bSocialPlatforms, setB2bSocialPlatforms, p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          b2bSocialPlatforms.includes(p) 
                            ? 'bg-red-600 border-red-600 text-white' 
                            : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Current Advertising Pain Points</label>
                  <textarea value={b2bAdProblems} onChange={e => setB2bAdProblems(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm h-20 resize-none" placeholder="What are your main advertising struggles today?" />
                </div>
              </>
            )}

            {/* B2C Questions */}
            {intentType === 'B2C' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Product Name</label>
                    <input type="text" value={b2cProdName} onChange={e => setB2cProdName(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="Summer Dress Collection" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Product Category</label>
                    <input type="text" value={b2cProdCategory} onChange={e => setB2cProdCategory(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="Apparel" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Product Website</label>
                    <input type="text" value={b2cProdWebsite} onChange={e => setB2cProdWebsite(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="www.myshop.com/summer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Expected Ads Count / mo</label>
                    <input type="number" value={b2cExpectedAds} onChange={e => setB2cExpectedAds(parseInt(e.target.value) || 1)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Current Advertising Methods</label>
                  <input type="text" value={b2cAdMethod} onChange={e => setB2cAdMethod(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="Facebook Boost posts, local flyers" />
                </div>
              </>
            )}

            {/* Explorer Questions */}
            {intentType === 'Explorer' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">What do you want to learn?</label>
                  <textarea value={explorerLearnIntent} onChange={e => setExplorerLearnIntent(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm h-20 resize-none" placeholder="Tell us what platform features you are looking to learn about..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Platform Service of Interest</label>
                  <input type="text" value={explorerInterestService} onChange={e => setExplorerInterestService(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none text-sm" placeholder="Creative image creation, auto reels scheduler" />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setStep(3)} className="w-1/4 py-3.5 bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 rounded-xl uppercase text-xs">Back</button>
              <button type="button" onClick={handleSkip} className="w-1/4 py-3.5 border border-dashed border-zinc-300 text-zinc-500 font-bold hover:bg-zinc-50 rounded-xl uppercase text-xs">Skip</button>
              <button type="submit" className="btn-shimmer flex-1 py-3.5 bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs">Submit & Complete Profile</button>
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
