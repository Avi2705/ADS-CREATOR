import { useState, useEffect } from 'react';

interface Business {
  id: string;
  company: string;
  owner: string;
  email: string;
  users: number;
  products: number;
  ads: number;
  videos: number;
  leads: number;
  sub: string;
  status: string;
}

export default function B2BBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subPlan, setSubPlan] = useState('Pro');

  const [loading, setLoading] = useState(true);

  // Load registered/created users
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || 'mock-jwt-admin-token';
    setLoading(true);
    fetch('http://localhost:3000/api/v1/admin/b2b/businesses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const list = data.data.map((u: any) => ({
            id: u._id,
            company: u.companyName || 'SaaS Company',
            owner: u.name || 'B2B Client',
            email: u.email,
            users: 1,
            products: u.numProducts || 0,
            ads: u.adsCount || 0,
            videos: u.videosCount || 0,
            leads: u.leadsCount || 0,
            sub: u.subscription || 'Pro',
            status: u.status || 'Active'
          }));
          setBusinesses(list);
        }
      })
      .catch(err => {
        console.error("Failed to load database B2B businesses:", err);
      })
      .finally(() => setLoading(false));
  }, [isModalOpen]);

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !owner || !email || !password) return;

    const token = localStorage.getItem('auth_token') || 'mock-jwt-admin-token';

    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/b2b/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: company,
          ownerName: owner,
          email,
          password,
          subscription: subPlan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save business');
      }

      setCompany('');
      setOwner('');
      setEmail('');
      setPassword('');
      setSubPlan('Pro');
      setIsModalOpen(false);

      alert(`✅ B2B Business account provisioned in database!\nReference ID: ${data.business.referenceId}`);
    } catch (err: any) {
      alert(`⚠️ Failed to create business in database: ${err.message}`);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.company.toLowerCase().includes(searchTerm.toLowerCase()) || b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">B2B SaaS Businesses</h1>
          <p className="text-gray-500 font-medium mt-1">Manage self-serve software tenants and their workspace limits.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn bg-gray-900 text-white rounded-xl shadow-premium border-none font-bold uppercase tracking-wide px-6 py-3"
        >
          + Provision SaaS Tenant
        </button>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-premium border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Provision SaaS Tenant</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Create an email & password account for a B2B SaaS subscriber.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-950 font-bold text-xl">✕</button>
            </div>
            
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Company Name</label>
                <input 
                  type="text" required value={company} onChange={e => setCompany(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Owner Full Name</label>
                <input 
                  type="text" required value={owner} onChange={e => setOwner(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  placeholder="owner@acme.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  placeholder="Set account password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Subscription Plan</label>
                <select 
                  value={subPlan} onChange={e => setSubPlan(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-gray-900"
                >
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold hover:bg-black shadow-premium rounded-xl uppercase tracking-wide">
                Provision SaaS Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total B2B Businesses', val: businesses.length },
          { label: 'Total SaaS Users', val: businesses.reduce((acc, b) => acc + b.users, 0) },
          { label: 'Total Products Managed', val: businesses.reduce((acc, b) => acc + b.products, 0) },
          { label: 'Total Ads Published', val: businesses.reduce((acc, b) => acc + b.ads, 0) },
        ].map((stat, i) => (
          <div key={i} className="p-6 glass-panel rounded-2xl shadow-sm bg-white border-l-4 border-primary">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">{stat.label}</h3>
            <div className="text-3xl font-black text-gray-900">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-3xl shadow-sm bg-white overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search companies or emails..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 text-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none focus:border-gray-900"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Business</th>
                <th className="p-4">Workspace (Users / Prod)</th>
                <th className="p-4">Publishing (Ads / Vid)</th>
                <th className="p-4">Leads</th>
                <th className="p-4">Plan & Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-900 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                    Loading SaaS tenants list...
                  </td>
                </tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                    No businesses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-base text-gray-900">{b.company}</div>
                      <div className="text-gray-500 text-xs">{b.owner} • {b.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold" title="Users">{b.users} Usr</span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold" title="Products">{b.products} Prd</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">{b.ads} Ads</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">{b.videos} Vid</span>
                      </div>
                    </td>
                    <td className="p-4 font-black text-gray-700">{b.leads.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 mb-1">{b.sub}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-900 font-bold hover:underline mr-4">Manage Tenant</button>
                      <button className="text-primary font-bold hover:underline">Login As</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
