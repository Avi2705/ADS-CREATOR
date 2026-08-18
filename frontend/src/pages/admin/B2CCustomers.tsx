import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, UserCheck, 
  ArrowRight, Lock, Filter 
} from 'lucide-react';

interface Customer {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  mobile: string;
  products: number;
  ads: number;
  leads: number;
  sub: string;
  status: string;
  assignedEmployeeRefId: string;
}

export default function B2CCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [plan, setPlan] = useState('B2C Growth');


  // Load registered/created users
  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const localB2C = localUsers
      .filter((u: any) => u.role === 'CUSTOMER' || u.accountType === 'B2C')
      .map((u: any) => ({
        id: u._id,
        referenceId: u.referenceId || `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        name: u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.name || 'B2C Client',
        email: u.email,
        mobile: u.mobile || u.phone || '+91 98765 00000',
        products: u.mainProduct ? 1 : 0,
        ads: u.adsCount || 0,
        leads: u.leadsCount || 0,
        sub: u.subscription || 'B2C Growth',
        status: u.status || 'ACTIVE',
        assignedEmployeeRefId: u.assignedEmployeeRefId || 'UNASSIGNED'
      }));

    setCustomers(localB2C);
  }, [isModalOpen]);


  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    const digitsOnly = mobile.replace(/\D/g, '');
    const fullMobile = `${countryCode} ${digitsOnly}`;
    const custRefId = `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const newUser = {
      _id: `cust-${Date.now()}`,
      referenceId: custRefId,
      email,
      password,
      name,
      firstName: name.split(' ')[0] || 'Client',
      lastName: name.split(' ')[1] || 'User',
      role: 'CUSTOMER',
      accountType: 'B2C',
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      subscription: plan,
      mobile: fullMobile,
      assignedEmployeeRefId: 'EMP-REF-742918'
    };

    mockUsers.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    setName('');
    setEmail('');
    setPassword('');
    setMobile('');
    setIsModalOpen(false);

    alert(`Customer account provisioned!\nReference ID: ${custRefId}\nCredentials: ${newUser.email} / ${newUser.password}`);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 bg-white text-black min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Subscribed B2C Client Accounts</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">B2C Customers Directory</h1>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Manage paying B2C customers, review active ad requests, and inspect assigned employee handlers.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-shimmer px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-xs tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Customer Account</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Subscribed Clients</span>
          <div className="text-3xl font-black text-black font-display">{customers.length}</div>
          <div className="text-[10px] text-zinc-500 font-semibold">B2C paid subscribers</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Active Campaigns</span>
          <div className="text-3xl font-black text-red-600 font-display">
            {customers.reduce((acc, curr) => acc + curr.ads, 0)}
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold">Image & Video Ads</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Generated Leads</span>
          <div className="text-3xl font-black text-black font-display">184</div>
          <div className="text-[10px] text-zinc-500 font-semibold">Attributed conversions</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Ad Creation Guard</span>
          <div className="text-base font-black text-red-600 font-display flex items-center gap-1.5 pt-1">
            <Lock className="w-4 h-4" /> Super Admin Only
          </div>
          <div className="text-[10px] text-red-700 font-bold">Image & Video buttons protected</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Name, Email, Reference ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active Subscriptions</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
              <th className="p-4 pl-6">Reference ID</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Plan Tier</th>
              <th className="p-4">Assigned Staff</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs font-medium">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                
                {/* Reference ID */}
                <td className="p-4 pl-6">
                  <span className="font-mono font-black text-red-600 text-xs px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
                    {c.referenceId}
                  </span>
                </td>

                {/* Customer Details */}
                <td className="p-4">
                  <div className="font-black text-black text-sm">{c.name}</div>
                  <div className="text-zinc-500 text-xs font-semibold">{c.email} • {c.mobile}</div>
                </td>

                {/* Plan Tier */}
                <td className="p-4">
                  <span className="font-black text-black text-xs">{c.sub}</span>
                  <div className="text-[10px] text-zinc-400 font-bold">PAID ($29/mo)</div>
                </td>

                {/* Assigned Staff */}
                <td className="p-4">
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${
                    !c.assignedEmployeeRefId || c.assignedEmployeeRefId === 'UNASSIGNED' || c.assignedEmployeeRefId === 'Unassigned'
                      ? 'bg-zinc-50 text-zinc-400 border-zinc-200'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}>
                    {c.assignedEmployeeRefId || 'Unassigned'}
                  </span>
                </td>


                {/* Status */}
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 font-black rounded-lg text-[10px] uppercase">
                    {c.status}
                  </span>
                </td>

                {/* Action */}
                <td className="p-4 pr-6 text-right">
                  <button 
                    onClick={() => navigate(`/admin/b2c/${c.id}`)}
                    className="btn-shimmer px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-xs tracking-wider inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>Manage Ad Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>

              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs font-semibold">
                  No B2C customer records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Provision B2C Client</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">Create an active customer account with full B2C studio access.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200">✕</button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Brand / Customer Name *</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  placeholder="e.g. Velocity Sportswear"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Client Email *</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  placeholder="client@velocity.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Password *</label>
                <input 
                  type="text" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  placeholder="Set login password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Subscription Tier</label>
                <select 
                  value={plan} 
                  onChange={e => setPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                >
                  <option value="B2C Starter">B2C Starter (₹1,499/mo)</option>
                  <option value="B2C Growth">B2C Growth (₹3,499/mo)</option>
                  <option value="B2C Scale Agency">B2C Scale Agency (₹7,999/mo)</option>
                </select>
              </div>

              <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider">
                Create & Provision Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
