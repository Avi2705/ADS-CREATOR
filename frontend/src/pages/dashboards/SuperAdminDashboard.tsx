import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Shield, Sparkles, 
  CreditCard, ArrowRight, RefreshCw, UserPlus
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'PAYMENT' | 'FREE_AD' | 'LEAD' | 'EMPLOYEE';
  title: string;
  desc: string;
  time: string;
  badge: string;
  refId: string;
}

export default function SuperAdminDashboard() {
  const [b2cCount, setB2cCount] = useState(0);
  const [freeAdCount, setFreeAdCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [mrrRevenue, setMrrRevenue] = useState(0);

  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  // Modal for quick conversion
  const [convertingLead, setConvertingLead] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('B2C Growth');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');

    // 1. Calculate B2C Customers (Paid & Active)
    const b2cUsers = mockUsers.filter((u: any) => u.role === 'CUSTOMER' || u.accountType === 'B2C');
    setB2cCount(b2cUsers.length);

    // 2. Calculate Leads who generated their 1 Free Ad
    const freeAdUsers = mockUsers.filter((u: any) => u.freeAdGenerated === true);
    setFreeAdCount(freeAdUsers.length);

    // 3. Calculate Pending Leads in Pipeline
    const pendingLeads = mockUsers.filter((u: any) => u.status === 'LEAD' && u.role !== 'CUSTOMER');
    setLeadsCount(pendingLeads.length);

    // 4. Calculate Staff Employees
    const staff = mockUsers.filter((u: any) => u.role === 'EMPLOYEE' || u.role === 'MANAGER' || u.role === 'SUPPORT');
    setEmployeesCount(staff.length);

    // 5. Calculate Revenue (₹3,499 average per B2C subscriber)
    const revenue = b2cUsers.length * 3499;
    setMrrRevenue(revenue);

    // Recent leads list
    setRecentLeads(pendingLeads.slice(0, 5));

    // Dynamic Activity Feed
    const feed: ActivityItem[] = [];

    // Add customer payment events
    b2cUsers.forEach((cust: any, i: number) => {
      feed.push({
        id: `act-pay-${cust._id || i}`,
        type: 'PAYMENT',
        title: `Customer Subscribed: ${cust.firstName || cust.name || 'Client'}`,
        desc: `Paid for ${cust.subscription || 'B2C Growth'} plan. Active B2C workspace unlocked.`,
        time: `${i * 12 + 4} mins ago`,
        badge: 'PAID SUBSCRIBER',
        refId: cust.referenceId || `CUST-REF-${cust._id?.slice(-6) || 'PENDING'}`
      });
    });

    // Add free trial ad events
    freeAdUsers.forEach((lead: any, i: number) => {
      feed.push({
        id: `act-free-${lead._id || i}`,
        type: 'FREE_AD',
        title: `1st Free Ad Generated: ${lead.name || lead.email}`,
        desc: `Rendered 1-time studio ad for ${lead.companyName || 'Brand Product'}.`,
        time: `${(i + 1) * 25} mins ago`,
        badge: 'TRIAL CLAIMED',
        refId: lead.referenceId || `LEAD-REF-${lead._id?.slice(-6) || 'PENDING'}`
      });
    });

    setActivityFeed(feed);
  };

  const handleConvertLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    const customerRefId = `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === convertingLead._id || u.email === convertingLead.email);

    if (idx !== -1) {
      mockUsers[idx] = {
        ...mockUsers[idx],
        status: 'ACTIVE',
        accountType: 'B2C',
        role: 'CUSTOMER',
        paymentStatus: 'PAID',
        subscription: selectedPlan,
        referenceId: customerRefId
      };
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    } else {
      mockUsers.push({
        _id: convertingLead._id,
        referenceId: customerRefId,
        email: convertingLead.email,
        name: convertingLead.name,
        companyName: convertingLead.companyName,
        status: 'ACTIVE',
        accountType: 'B2C',
        role: 'CUSTOMER',
        paymentStatus: 'PAID',
        subscription: selectedPlan
      });
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    setConvertingLead(null);
    loadDashboardData();
    alert(`Lead upgraded to Active B2C Customer!\nCustomer Reference ID: ${customerRefId}`);
  };

  return (
    <div className="space-y-8 bg-white text-black min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">System & Revenue Overview</h1>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Real-time telemetry tracking paid B2C subscribers, free trial ad creations, inbound leads, and employee operations.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-2 border border-zinc-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>



      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Paid Customers */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">B2C Customers</span>
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-display">{b2cCount}</div>
          <div className="text-[10px] font-bold text-red-600 flex items-center gap-1">
            <span>●</span> Active subscribers
          </div>
        </div>

        {/* 2. Free Trial Ads Generated */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">1st Free Ads Made</span>
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 font-display">{freeAdCount}</div>
          <div className="text-[10px] font-bold text-zinc-500">
            Trial ad created
          </div>
        </div>

        {/* 3. Inbound Unconverted Leads */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Pipeline Leads</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-200 text-black flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-display">{leadsCount}</div>
          <div className="text-[10px] font-bold text-zinc-500">
            Unconverted leads
          </div>
        </div>

        {/* 4. Staff Employees */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Staff Employees</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-display">{employeesCount}</div>
          <div className="text-[10px] font-bold text-zinc-500">
            Active staff credentials
          </div>
        </div>

        {/* 5. Monthly Recurring Revenue */}
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-red-600 tracking-wider">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm shadow-red-600/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-display">₹{mrrRevenue.toLocaleString()}</div>
          <div className="text-[10px] font-bold text-red-700">
            From active plans
          </div>
        </div>

      </div>


      {/* Main Grid: Activity Feed & Pending Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Platform & Payment Detection Activity */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-black text-black text-lg font-display">Real-Time Event Stream</h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Automated detection of payments & trial claims.</p>
            </div>
            <span className="px-2.5 py-1 bg-red-50 text-red-600 font-mono text-[10px] font-black rounded-lg">
              LIVE FEED
            </span>
          </div>

          <div className="space-y-3">

            {activityFeed.map((item) => (
              <div key={item.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black text-red-600 px-2 py-0.5 bg-red-50 border border-red-200 rounded-md">
                      {item.refId}
                    </span>
                    <span className="font-black text-black text-xs">{item.title}</span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium">{item.desc}</p>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">{item.time}</span>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-200 text-black text-[9px] font-black rounded-md uppercase">
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}

            {activityFeed.length === 0 && (
              <div className="text-center py-12 text-zinc-400 text-xs font-semibold">
                No recent activity recorded in the platform database yet.
              </div>
            )}
          </div>
        </div>



        {/* Right Column: Lead Pipeline & 1-Click Customer Provisioning */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-black text-black text-lg font-display">Pending Lead Conversion Queue</h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Leads awaiting subscription activation.</p>
            </div>
            <Link to="/admin/leads" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id || lead.referenceId} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black text-red-600 px-2 py-0.5 bg-red-50 border border-red-200 rounded-md">
                      {lead.referenceId || 'LEAD'}
                    </span>
                    <span className="font-black text-black text-sm">{lead.name || lead.email}</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-semibold mt-1">
                    {lead.companyName || 'Prospect Brand'} • Free Ad: {lead.freeAdGenerated ? '✅ Claimed' : '❌ None'}
                  </div>
                </div>

                <button
                  onClick={() => setConvertingLead(lead)}
                  className="btn-shimmer px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-[11px] tracking-wider shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision Customer</span>
                </button>
              </div>
            ))}

            {recentLeads.length === 0 && (
              <div className="text-center py-12 text-zinc-400 text-xs font-semibold">
                All registered leads have been converted into active customers!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Conversion Modal */}
      {convertingLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg">
                  Super Admin Provisioning
                </span>
                <h2 className="text-2xl font-black text-black font-display mt-1">
                  Activate B2C Customer
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Upgrading {convertingLead.name} ({convertingLead.referenceId}).
                </p>
              </div>
              <button onClick={() => setConvertingLead(null)} className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200">✕</button>
            </div>

            <form onSubmit={handleConvertLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Assign Subscription Tier</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                >
                  <option value="B2C Starter">B2C Starter (₹1,499/mo)</option>
                  <option value="B2C Growth">B2C Growth (₹3,499/mo)</option>
                  <option value="B2C Scale Agency">B2C Scale Agency (₹7,999/mo)</option>
                </select>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                ⚡ A unique <strong>Customer Reference ID (CUST-REF-XXXXX)</strong> will be generated, and payment status marked as PAID.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shimmer px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-xs shadow-md shadow-red-600/20"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
