import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

export default function B2BDashboard() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const customerType = user?.customerType || 'EXPLORER';

  if (!user || customerType !== 'B2B') {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-black text-black font-display">B2B Dashboard Restricted</h1>
        <p className="text-zinc-600 mt-2 text-xs font-medium leading-relaxed">
          {customerType === 'EXPLORER'
            ? 'Your account is currently in Explorer mode. Please navigate to your profile to select and save B2B as your account type.'
            : 'Your account is classified as B2C. You can only access the B2C Client Portal.'}
        </p>
        <div className="pt-4">
          <Link
            to={customerType === 'EXPLORER' ? '/explorer' : '/b2c'}
            className="btn-shimmer px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md shadow-red-600/20"
          >
            <span>{customerType === 'EXPLORER' ? 'Go to Explorer Hub' : 'Go to B2C Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }


  // Onboarding Form State
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [mainProductName, setMainProductName] = useState('');
  const [mainProductPrice, setMainProductPrice] = useState('');
  const [mainProductCategory, setMainProductCategory] = useState('');

  // Local state to simulate DB products for the user
  const [products, setProducts] = useState<any[]>([]);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user already completed profile and product onboarding
      const userOnboarded = !!(user.mobile && user.companyName && user.mainProduct);
      setIsOnboarded(userOnboarded);
      if (user.mainProduct) {
        setProducts([user.mainProduct]);
      }
    }
  }, [user]);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !companyName || !mainProductName || !mainProductPrice) return;

    // Validate India Phone Number Length (10 digits)
    if (countryCode === '+91') {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        alert("For India, the mobile number must be exactly 10 digits.");
        return;
      }
    }

    const fullPhoneNumber = `${countryCode} ${phone}`;

    const mainProduct = {
      name: mainProductName,
      price: parseFloat(mainProductPrice),
      category: mainProductCategory || 'General',
      createdDate: new Date().toLocaleDateString()
    };

    // Update user object
    const updatedUser = {
      ...user,
      mobile: fullPhoneNumber,
      companyName,
      mainProduct
    };

    // Update Redux state and localStorage persistence
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    // Also update in mock_users DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const userIndex = mockUsers.findIndex((u: any) => u.email === user.email);
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        mobile: fullPhoneNumber,
        companyName,
        mainProduct
      };
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    setIsOnboarded(true);
    setProducts([mainProduct]);
  };

  // Guard: If not onboarded, show the Profile & Product Onboarding Screen
  if (!isOnboarded) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="glass-panel rounded-3xl p-10 bg-white border border-gray-100 shadow-premium">
          <div className="text-center mb-8">
            <span className="text-4xl">🚀</span>
            <h1 className="text-3xl font-black text-gray-900 mt-4">Welcome to Ads Creator</h1>
            <p className="text-gray-500 font-semibold mt-1">Please complete your business profile and add your main product to unlock your dashboard.</p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 border-b pb-2">1. Profile & Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Company Name</label>
                <input 
                  type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Contact Phone</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode} 
                    onChange={e => setCountryCode(e.target.value)}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary w-24"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input 
                    type="text" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                    placeholder={countryCode === '+91' ? '10-digit number' : 'Phone number'}
                  />
                </div>
              </div>
            </div>

            <h2 className="text-lg font-black text-gray-900 border-b pb-2 pt-2">2. Register Your Main Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Product Name</label>
                <input 
                  type="text" required value={mainProductName} onChange={e => setMainProductName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                  placeholder="e.g. Premium Ergonomic Chair"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Price ($)</label>
                  <input 
                    type="number" required value={mainProductPrice} onChange={e => setMainProductPrice(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                    placeholder="299.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
                  <input 
                    type="text" value={mainProductCategory} onChange={e => setMainProductCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                    placeholder="e.g. Furniture"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-primary text-white font-bold hover:bg-red-700 shadow-glow-red rounded-xl uppercase tracking-wide transition-all mt-4">
              Complete Onboarding & Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">SaaS Portal</h1>
          <p className="text-gray-500 font-medium mt-1">Manage products, create ads, and publish to social media.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Active Products', val: products.length.toString() },
          { label: 'Active Ads Running', val: '0' },
          { label: 'Total Leads', val: '0' },
        ].map((stat, i) => (
          <div key={i} className="p-6 glass-panel rounded-2xl shadow-sm hover:shadow-premium hover:-translate-y-1 transition-transform cursor-pointer">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">{stat.label}</h3>
            <div className="text-4xl font-black">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Asset Management */}
        <div className="glass-panel rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black tracking-tight">Asset Manager</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4">Your Products</h3>
              <div className="space-y-2">
                {products.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl">
                    <div>
                      <div className="font-bold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">Category: {p.category}</div>
                    </div>
                    <div className="font-black text-primary">${p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Publishing */}
        <div className="glass-panel rounded-3xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-black tracking-tight mb-2">Publishing Engine</h2>
          <p className="text-gray-500 font-medium mb-6">Instantly push your approved creatives to connected social platforms.</p>
          
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">f</div>
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center font-bold text-xl">ig</div>
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl">𝕏</div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-xl">yt</div>
            </div>
            <button className="w-full btn bg-primary text-white rounded-xl shadow-glow-red hover:shadow-glow-red-strong hover:-translate-y-0.5 border-none font-bold text-lg tracking-wide uppercase">
              Launch Ads to All Socials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
