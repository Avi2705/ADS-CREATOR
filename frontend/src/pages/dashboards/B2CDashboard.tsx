import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';

export default function B2CDashboard() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  if (!user || user.status === 'LEAD' || user.role === 'EXPLORER') {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center font-sans">
        <h1 className="text-3xl font-black text-gray-900">Access Denied</h1>
        <p className="text-gray-500 mt-2 font-medium">Your account is a registered lead and is currently pending administrator review. You do not have access to the B2C client dashboard features yet.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('Overview');

  // Onboarding Form State
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [mainProductName, setMainProductName] = useState('');
  const [mainProductPrice, setMainProductPrice] = useState('');
  const [mainProductCategory, setMainProductCategory] = useState('');

  // Local state to simulate DB onboarding status
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
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

    const updatedUser = {
      ...user,
      mobile: fullPhoneNumber,
      companyName,
      mainProduct
    };

    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

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

  // Guard: Show Profile Onboarding for New Clients
  if (!isOnboarded) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="glass-panel rounded-3xl p-10 bg-white border border-gray-100 shadow-premium">
          <div className="text-center mb-8">
            <span className="text-4xl">👋</span>
            <h1 className="text-3xl font-black text-gray-900 mt-4">Welcome to Ads Creator</h1>
            <p className="text-gray-500 font-semibold mt-1">Please complete your client profile and add your primary product details to activate your portal.</p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 border-b pb-2">1. Your Profile & Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Company / Shop Name</label>
                <input 
                  type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                  placeholder="e.g. Sarah's Boutique"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Mobile Phone</label>
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
                  placeholder="e.g. Leather Summer Sandals"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Price ($)</label>
                  <input 
                    type="number" required value={mainProductPrice} onChange={e => setMainProductPrice(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                    placeholder="79.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
                  <input 
                    type="text" value={mainProductCategory} onChange={e => setMainProductCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary"
                    placeholder="e.g. Shoes"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-primary text-white font-bold hover:bg-red-700 shadow-glow-red rounded-xl uppercase tracking-wide transition-all mt-4">
              Submit Profile & Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Portal</h1>
          <p className="text-gray-500 font-medium">View the performance of your Done-For-You campaigns.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-8 pb-2">
        {['Overview', 'My Products', 'My Advertisements', 'Incoming Leads'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`font-bold px-4 py-2 transition-all rounded-t-lg ${activeTab === tab ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Active Ads Running', val: '0' },
            { label: 'Total Leads Generated', val: '0' },
            { label: 'Estimated ROAS', val: 'N/A' },
          ].map((stat, i) => (
            <div key={i} className="p-6 glass-panel rounded-2xl shadow-sm hover:shadow-premium hover:-translate-y-1 transition-transform cursor-pointer">
              <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">{stat.label}</h3>
              <div className="text-4xl font-black text-gray-900">{stat.val}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'My Products' && (
        <div className="glass-panel rounded-3xl p-8 bg-white border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black mb-6">Registered Products</h2>
          <div className="space-y-4">
            {products.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <div className="font-bold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">Category: {p.category} | Created: {p.createdDate}</div>
                </div>
                <div className="font-black text-primary text-lg">${p.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'My Advertisements' && (
        <div className="glass-panel rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black">Your Live Ads</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Managed by Agency</span>
          </div>
          <div className="text-center py-12 text-gray-500 font-medium">
            No active advertisements are running for your products yet. Check back soon!
          </div>
        </div>
      )}

      {activeTab === 'Incoming Leads' && (
        <div className="glass-panel rounded-3xl p-8">
          <h2 className="text-xl font-black mb-6">Lead Feed</h2>
          <div className="text-center py-12 text-gray-500 font-medium">
            Your ad campaign hasn't captured any leads yet.
          </div>
        </div>
      )}
    </div>
  );
}
