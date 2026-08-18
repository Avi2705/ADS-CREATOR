import { useState, useEffect } from 'react';

interface PlanConfig {
  name: string;
  price: number;
  maxUsers: number;
  features: string;
}

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState<'plans' | 'provision'>('plans');

  // Subscription configurations
  const [b2bPlans, setB2bPlans] = useState<PlanConfig[]>([
    { name: 'Basic', price: 49, maxUsers: 2, features: 'Ad rendering automation, basic analytics' },
    { name: 'Advanced', price: 99, maxUsers: 4, features: 'Custom templates, team collaboration, email integration' },
    { name: 'Premium', price: 199, maxUsers: 6, features: 'All features, dedicated support, custom API access' }
  ]);

  const [b2cPlans, setB2cPlans] = useState<PlanConfig[]>([
    { name: 'Basic', price: 29, maxUsers: 1, features: 'Done-for-you single campaign ads' },
    { name: 'Pro', price: 59, maxUsers: 1, features: 'Done-for-you multi-campaign videos and reels' }
  ]);

  // Provisioning Form
  const [custType, setCustType] = useState<'B2B' | 'B2C'>('B2B');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Basic');
  const [b2bRole, setB2bRole] = useState('BUSINESS_OWNER');

  useEffect(() => {
    // Load existing settings if saved in localStorage
    const savedB2b = localStorage.getItem('config_b2b_plans');
    const savedB2c = localStorage.getItem('config_b2c_plans');
    if (savedB2b) setB2bPlans(JSON.parse(savedB2b));
    if (savedB2c) setB2cPlans(JSON.parse(savedB2c));
  }, []);

  const handleUpdatePlan = (type: 'B2B' | 'B2C', index: number, field: keyof PlanConfig, value: any) => {
    if (type === 'B2B') {
      const updated = [...b2bPlans];
      updated[index] = { ...updated[index], [field]: value };
      setB2bPlans(updated);
      localStorage.setItem('config_b2b_plans', JSON.stringify(updated));
    } else {
      const updated = [...b2cPlans];
      updated[index] = { ...updated[index], [field]: value };
      setB2cPlans(updated);
      localStorage.setItem('config_b2c_plans', JSON.stringify(updated));
    }
  };

  const handleProvisionUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !companyName) {
      alert("Please fill in all provisioning fields.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long and contain 1 uppercase letter, 1 number, and 1 special character.");
      return;
    }

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    const newUser = {
      _id: `cust-${Date.now()}`,
      email,
      password,
      firstName: name.split(' ')[0] || 'Client',
      lastName: name.split(' ')[1] || 'User',
      role: custType === 'B2B' ? b2bRole : 'CUSTOMER',
      status: 'ACTIVE',
      tenantId: `tenant-${Date.now()}`,
      companyName,
      companyType: custType === 'B2B' ? 'SaaS' : 'Retail',
      mobile: '+91 9999999999',
      profileStatus: 'COMPLETED',
      intentType: custType,
      mainProduct: {
        name: 'Auto Generated Product',
        price: 99,
        category: 'Services'
      }
    };

    mockUsers.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    alert(`Successfully Created Customer! \nEmail: ${email} \nPassword: ${password} \nType: ${custType} \nPlan: ${selectedPlan}`);
    
    // Reset Form
    setName('');
    setEmail('');
    setPassword('');
    setCompanyName('');
  };

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Super Admin Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Configure subscription pricing tiers and manually provision client accounts.</p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-gray-200 mb-8 gap-6 text-sm font-bold">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`pb-4 transition-all ${activeTab === 'plans' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-900'}`}
        >
          Subscription Pricing & Limits
        </button>
        <button 
          onClick={() => setActiveTab('provision')}
          className={`pb-4 transition-all ${activeTab === 'provision' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-900'}`}
        >
          Create Customer Account
        </button>
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-8">
          {/* B2B Tiers */}
          <div className="glass-panel rounded-3xl p-8 bg-white border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 text-lg border-b pb-3">B2B SaaS Plan Editor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {b2bPlans.map((plan, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <div className="font-black text-gray-900 text-base">{plan.name} Tier</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Monthly Price ($)</label>
                    <input 
                      type="number" value={plan.price} 
                      onChange={e => handleUpdatePlan('B2B', idx, 'price', parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold focus:outline-none text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Max Users / Workspace</label>
                    <input 
                      type="number" value={plan.maxUsers} 
                      onChange={e => handleUpdatePlan('B2B', idx, 'maxUsers', parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold focus:outline-none text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Features Description</label>
                    <textarea 
                      value={plan.features} 
                      onChange={e => handleUpdatePlan('B2B', idx, 'features', e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-semibold focus:outline-none text-xs h-16 resize-none" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B2C Tiers */}
          <div className="glass-panel rounded-3xl p-8 bg-white border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 text-lg border-b pb-3">B2C Done-For-You Plan Editor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {b2cPlans.map((plan, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <div className="font-black text-gray-900 text-base">{plan.name} Tier</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Monthly Price ($)</label>
                    <input 
                      type="number" value={plan.price} 
                      onChange={e => handleUpdatePlan('B2C', idx, 'price', parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold focus:outline-none text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Features Description</label>
                    <textarea 
                      value={plan.features} 
                      onChange={e => handleUpdatePlan('B2C', idx, 'features', e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-semibold focus:outline-none text-xs h-16 resize-none" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'provision' && (
        <div className="glass-panel rounded-3xl p-8 bg-white border border-gray-100 shadow-sm max-w-xl">
          <h3 className="font-black text-gray-900 text-lg border-b pb-4 mb-6">Create Login ID for B2B/B2C</h3>
          
          <form onSubmit={handleProvisionUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Customer Profile Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <input type="radio" checked={custType === 'B2B'} onChange={() => setCustType('B2B')} className="radio radio-primary" />
                  B2B SaaS Business
                </label>
                <label className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <input type="radio" checked={custType === 'B2C'} onChange={() => setCustType('B2C')} className="radio radio-primary" />
                  B2C Client
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Customer Full Name</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary text-xs"
                  placeholder="Steve Rogers"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Workspace / Tenant Name</label>
                <input 
                  type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary text-xs"
                  placeholder="Rogers Avengers LLC"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Login Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary text-xs"
                  placeholder="steve@shield.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Temporary Password</label>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-primary text-xs"
                  placeholder="Temp123!"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Assigned Plan</label>
                <select 
                  value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none text-xs"
                >
                  <option value="Basic">Basic Plan</option>
                  {custType === 'B2B' && (
                    <>
                      <option value="Advanced">Advanced Plan</option>
                      <option value="Premium">Premium Plan</option>
                    </>
                  )}
                  {custType === 'B2C' && <option value="Pro">Pro Plan</option>}
                </select>
              </div>

              {custType === 'B2B' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Client Workspace Role</label>
                  <select 
                    value={b2bRole} onChange={e => setB2bRole(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none text-xs"
                  >
                    <option value="BUSINESS_OWNER">Business Owner / Creator</option>
                    <option value="MANAGER">Workspace Manager</option>
                  </select>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold hover:bg-red-700 shadow-glow-red rounded-xl uppercase text-xs tracking-wider transition-all mt-6"
            >
              Provision Customer Credentials
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
