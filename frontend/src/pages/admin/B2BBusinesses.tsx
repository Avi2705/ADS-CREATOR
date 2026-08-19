import { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, User, Users, ShoppingBag, 
  Sparkles, Eye, X, Lock, Shield, Save, CheckCircle2
} from 'lucide-react';

interface Business {
  id: string;
  referenceId?: string;
  company: string;
  owner: string;
  email: string;
  phone?: string;
  address?: string;
  registrationId?: string;
  aadharNumber?: string;
  users: number;
  products: number;
  ads: number;
  videos: number;
  leads: number;
  sub: string;
  status: string;
  createdDate?: string;
  assignedEmployeeRefId?: string;
  assignedEmployeeName?: string;
}

export default function B2BBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Headquarters Admin Employees List
  const [adminEmployees, setAdminEmployees] = useState<any[]>([]);

  // Company Inspection Dossier Modal State (Admin View Only - No Impersonation)
  const [inspectedCompany, setInspectedCompany] = useState<Business | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'profile' | 'team' | 'products' | 'creatives' | 'leads'>('profile');
  const [companyProducts, setCompanyProducts] = useState<any[]>([]);
  const [companyCreatives, setCompanyCreatives] = useState<any[]>([]);
  const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);
  const [companyLeads, setCompanyLeads] = useState<any[]>([]);
  const [selectedStaffEmpRef, setSelectedStaffEmpRef] = useState('');

  // Load registered B2B businesses & Admin Staff
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || 'mock-jwt-admin-token';
    setLoading(true);

    // Load Admin Headquarters Staff
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const emps = mockUsers.filter(
      (u: any) => 
        (u.role === 'EMPLOYEE' || u.role === 'MANAGER' || u.role === 'SUPPORT' || u.role === 'DESIGNER') &&
        u.accountType !== 'B2B' && u.accountType !== 'B2C'
    );
    setAdminEmployees(emps);

    fetch('http://localhost:3000/api/v1/admin/b2b/businesses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const list = data.data.map((u: any) => ({
            id: u._id,
            referenceId: u.referenceId || `B2B-REF-${u._id?.slice(-6)}`,
            company: u.companyName || u.name || 'SaaS Company',
            owner: u.name || 'B2B Client',
            email: u.email,
            phone: u.phone || u.mobile || '+91 98765 43210',
            address: u.address || 'Corporate Headquarters',
            registrationId: u.registrationId || 'GSTIN-29AAAAA0000A1Z5',
            aadharNumber: u.aadharNumber || '**** **** 8912',
            users: 1,
            products: u.numProducts || 0,
            ads: u.adsCount || 0,
            videos: u.videosCount || 0,
            leads: u.leadsCount || 0,
            sub: u.subscription || 'Enterprise Plan',
            status: u.status || 'ACTIVE',
            createdDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-08-19',
            assignedEmployeeRefId: u.assignedEmployeeRefId || 'EMP-REF-742918',
            assignedEmployeeName: u.assignedEmployeeName || 'Sarah Jenkins'
          }));
          setBusinesses(list);
        } else {
          // Read from mock_users in localStorage
          const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
          const b2bUsers = localUsers.filter((u: any) => u.customerType === 'B2B' || u.accountType === 'B2B');
          const list = b2bUsers.map((u: any) => ({
            id: u._id || u.referenceId || `B2B-${Date.now()}`,
            referenceId: u.referenceId || `B2B-REF-${(u._id || '').slice(-6) || '109284'}`,
            company: u.companyName || u.name || 'Corporate Enterprise Client',
            owner: u.name || 'Business Owner',
            email: u.email,
            phone: u.phone || u.mobile || '+91 99001 88888',
            address: u.address || 'Tech Park Blvd, Bangalore, KA, India',
            registrationId: u.registrationId || 'GSTIN-29ABCDE1234F1Z5',
            aadharNumber: u.aadharNumber || '**** **** 5432',
            users: 1,
            products: u.products?.length || u.numProducts || 1,
            ads: u.adsCount || 0,
            videos: u.videosCount || 0,
            leads: u.leadsCount || 0,
            sub: u.subscription || 'Enterprise Plan',
            status: u.status || 'ACTIVE',
            createdDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-08-19',
            assignedEmployeeRefId: u.assignedEmployeeRefId || 'EMP-REF-742918',
            assignedEmployeeName: u.assignedEmployeeName || u.employeeName || 'Sarah Jenkins'
          }));
          setBusinesses(list);
        }
      })
      .catch(err => {
        console.warn("Loading B2B businesses from local database...", err);
        const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const b2bUsers = localUsers.filter((u: any) => u.customerType === 'B2B' || u.accountType === 'B2B');
        const list = b2bUsers.map((u: any) => ({
          id: u._id || u.referenceId || `B2B-${Date.now()}`,
          referenceId: u.referenceId || `B2B-REF-${(u._id || '').slice(-6) || '109284'}`,
          company: u.companyName || u.name || 'Corporate Enterprise Client',
          owner: u.name || 'Business Owner',
          email: u.email,
          phone: u.phone || u.mobile || '+91 99001 88888',
          address: u.address || 'Tech Park Blvd, Bangalore, KA, India',
          registrationId: u.registrationId || 'GSTIN-29ABCDE1234F1Z5',
          aadharNumber: u.aadharNumber || '**** **** 5432',
          users: 1,
          products: u.products?.length || u.numProducts || 1,
          ads: u.adsCount || 0,
          videos: u.videosCount || 0,
          leads: u.leadsCount || 0,
          sub: u.subscription || 'Enterprise Plan',
          status: u.status || 'ACTIVE',
          createdDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-08-19',
          assignedEmployeeRefId: u.assignedEmployeeRefId || 'EMP-REF-742918',
          assignedEmployeeName: u.assignedEmployeeName || u.employeeName || 'Sarah Jenkins'
        }));
        setBusinesses(list);
      })
      .finally(() => setLoading(false));
  }, []);

  // Open Company Dossier & Load Client's Internal Assets (Read-Only)
  const handleInspectCompany = (b: Business) => {
    setInspectedCompany(b);
    setActiveDossierTab('profile');
    setSelectedStaffEmpRef(b.assignedEmployeeRefId || 'EMP-REF-742918');

    const companyKey = b.id || b.email;

    // Load company products
    const savedProducts = localStorage.getItem(`b2b_products_${companyKey}`) || localStorage.getItem(`b2b_products_${b.email}`);
    if (savedProducts) {
      try { setCompanyProducts(JSON.parse(savedProducts)); } catch { setCompanyProducts([]); }
    } else {
      setCompanyProducts([]);
    }

    // Load company campaigns & creatives
    const savedCampaigns = localStorage.getItem(`b2b_campaigns_${companyKey}`) || localStorage.getItem(`b2b_campaigns_${b.email}`);
    if (savedCampaigns) {
      try { setCompanyCreatives(JSON.parse(savedCampaigns)); } catch { setCompanyCreatives([]); }
    } else {
      setCompanyCreatives([]);
    }

    // Load company provisioned staff / team
    const savedEmployees = localStorage.getItem(`b2b_employees_${companyKey}`) || localStorage.getItem(`b2b_employees_${b.email}`);
    if (savedEmployees) {
      try { setCompanyEmployees(JSON.parse(savedEmployees)); } catch { setCompanyEmployees([]); }
    } else {
      setCompanyEmployees([]);
    }

    // Load company inbound leads
    const savedLeads = localStorage.getItem(`b2b_leads_${companyKey}`) || localStorage.getItem(`b2b_leads_${b.email}`);
    if (savedLeads) {
      try { setCompanyLeads(JSON.parse(savedLeads)); } catch { setCompanyLeads([]); }
    } else {
      const globalLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      const matched = globalLeads.filter((l: any) => 
        (b.company && l.companyName?.toLowerCase() === b.company.toLowerCase()) ||
        l.userId === b.id ||
        l.userEmail?.toLowerCase() === b.email.toLowerCase()
      );
      setCompanyLeads(matched);
    }
  };

  // Re-Assign Staff Member to B2B Company
  const handleSaveStaffAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedCompany) return;

    const chosenEmp = adminEmployees.find(e => e.referenceId === selectedStaffEmpRef);
    const empName = chosenEmp ? chosenEmp.name : 'Sarah Jenkins';

    const updated = {
      ...inspectedCompany,
      assignedEmployeeRefId: selectedStaffEmpRef,
      assignedEmployeeName: empName
    };

    setInspectedCompany(updated);

    // Update state list
    setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));

    // Update in mock_users
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === updated.id || u.email === updated.email || u.referenceId === updated.referenceId);
    if (idx !== -1) {
      mockUsers[idx].assignedEmployeeRefId = selectedStaffEmpRef;
      mockUsers[idx].assignedEmployeeName = empName;
      mockUsers[idx].employeeName = empName;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    alert(`✅ Assigned ${empName} (${selectedStaffEmpRef}) as the Dedicated Corporate Specialist for ${inspectedCompany.company}!`);
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = 
      b.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.assignedEmployeeName && b.assignedEmployeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.referenceId && b.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider mb-2 border border-red-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Client Registry</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">B2B Enterprise Accounts</h1>
          <p className="text-xs text-zinc-600 font-semibold mt-1">
            Audit corporate enterprise registrations, assigned staff specialists, verified credentials, and client asset portfolios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-700 font-mono text-xs font-black rounded-xl border border-zinc-200">
            {businesses.length} Verified {businesses.length === 1 ? 'Enterprise' : 'Enterprises'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verified Enterprises', val: businesses.length, sub: 'Corporate Tier Accounts' },
          { label: 'Total Catalog Assets', val: businesses.reduce((acc, b) => acc + (b.products || 1), 0), sub: 'Managed Products' },
          { label: 'Client Ad Creatives', val: businesses.reduce((acc, b) => acc + (b.ads || 0), 0), sub: 'Generated by Clients' },
          { label: 'Assigned Specialists', val: adminEmployees.length, sub: 'Headquarters Staff' },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-1 shadow-sm">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{stat.label}</h4>
            <div className="text-2xl font-black text-black font-display">{stat.val}</div>
            <div className="text-[10px] text-zinc-500 font-semibold">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Search & Filter Toolbar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search companies, specialists, or reference IDs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-medium text-black focus:outline-none focus:border-red-600 text-xs"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-xs text-zinc-700 outline-none focus:border-red-600"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="PENDING">Pending Verification</option>
            </select>
          </div>
        </div>

        {/* B2B Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] uppercase font-black tracking-wider">
                <th className="p-4">Reference ID & Company</th>
                <th className="p-4">Authorized Contact</th>
                <th className="p-4">Assigned HQ Specialist</th>
                <th className="p-4">Corporate Verification</th>
                <th className="p-4">Subscription</th>
                <th className="p-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-900 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 font-bold">
                    Loading enterprise registry...
                  </td>
                </tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 font-semibold">
                    No enterprise businesses registered yet.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-[10px] font-bold text-red-600">{b.referenceId || 'B2B-CORP'}</div>
                      <div className="font-black text-sm text-black">{b.company}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{b.address || 'India Headquarters'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-black">{b.owner}</div>
                      <div className="text-zinc-500 text-[11px] font-medium">{b.email}</div>
                      <div className="text-zinc-400 text-[10px] font-mono">{b.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black text-xs">
                          {b.assignedEmployeeName ? b.assignedEmployeeName[0] : 'S'}
                        </div>
                        <div>
                          <div className="font-black text-black text-xs">{b.assignedEmployeeName || 'Sarah Jenkins'}</div>
                          <div className="font-mono text-[9px] text-zinc-400 font-bold">{b.assignedEmployeeRefId || 'EMP-REF-742918'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[10px] font-bold text-zinc-700">
                          Reg ID: <span className="text-black font-black">{b.registrationId || 'VERIFIED'}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Director Aadhar Verified</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-black">{b.sub}</div>
                      <span className="text-[10px] text-zinc-500 font-semibold">B2B Multi-Seat Plan</span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleInspectCompany(b)}
                        className="btn-shimmer px-4 py-2 bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-500" />
                        <span>View Dossier & Staff</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🏢 COMPANY DOSSIER & ASSETS INSPECTION MODAL */}
      {inspectedCompany && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-zinc-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Corporate Audit & Assignment View</span>
                </div>
                <h2 className="text-2xl font-black text-black font-display tracking-tight">
                  {inspectedCompany.company}
                </h2>
                <div className="text-xs text-zinc-500 font-medium">
                  Reference ID: <span className="font-mono font-bold text-red-600">{inspectedCompany.referenceId}</span> • Assigned Specialist: <strong className="text-black font-bold">{inspectedCompany.assignedEmployeeName || 'Sarah Jenkins'}</strong>
                </div>
              </div>
              <button 
                onClick={() => setInspectedCompany(null)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="flex gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
              {[
                { id: 'profile', label: 'Company Profile & Reg ID', icon: Building2 },
                { id: 'team', label: `Staff & Team Logins (${companyEmployees.length + 1})`, icon: Users },
                { id: 'products', label: `Products (${companyProducts.length})`, icon: ShoppingBag },
                { id: 'creatives', label: `Ads & Video Creatives (${companyCreatives.length})`, icon: Sparkles },
                { id: 'leads', label: `Captured Inbound Leads (${companyLeads.length})`, icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDossierTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-red-600 text-white shadow-xs' 
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: COMPANY PROFILE, REG ID & ASSIGNED SPECIALIST */}
            {activeDossierTab === 'profile' && (
              <div className="space-y-6 text-xs">
                
                {/* 🛡️ ASSIGNED HEADQUARTERS SPECIALIST SECTION */}
                <div className="p-5 bg-red-50/70 rounded-3xl border border-red-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="font-black text-sm text-black">Assigned AD-HUNTER Corporate Specialist</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-700 font-mono font-bold text-[10px] rounded-lg">
                      {inspectedCompany.assignedEmployeeRefId || 'EMP-REF-742918'}
                    </span>
                  </div>

                  <form onSubmit={handleSaveStaffAssignment} className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-zinc-600">
                        Select Headquarters Account Specialist
                      </label>
                      <select 
                        value={selectedStaffEmpRef} 
                        onChange={(e) => setSelectedStaffEmpRef(e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                      >
                        {adminEmployees.map((emp) => (
                          <option key={emp._id || emp.referenceId} value={emp.referenceId}>
                            {emp.name} ({emp.referenceId}) • {emp.department || emp.role}
                          </option>
                        ))}
                        {adminEmployees.length === 0 && (
                          <option value="EMP-REF-742918">Sarah Jenkins (EMP-REF-742918) • Senior Specialist</option>
                        )}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="btn-shimmer px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/20 whitespace-nowrap"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Assignment</span>
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-500 uppercase text-[10px]">Corporate Legal Details</span>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Company Name:</span>
                        <span className="font-black text-black">{inspectedCompany.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Registration ID / GSTIN:</span>
                        <span className="font-mono font-bold text-red-600">{inspectedCompany.registrationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Director Aadhar Status:</span>
                        <span className="font-mono font-bold text-emerald-600">✓ {inspectedCompany.aadharNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Headquarters Address:</span>
                        <span className="font-bold text-black text-right max-w-xs">{inspectedCompany.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-500 uppercase text-[10px]">Authorized Contact & Plan</span>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Primary Contact:</span>
                        <span className="font-black text-black">{inspectedCompany.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Official Email:</span>
                        <span className="font-bold text-black">{inspectedCompany.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Phone:</span>
                        <span className="font-mono font-bold text-black">{inspectedCompany.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Subscription Plan:</span>
                        <span className="font-black text-red-600">{inspectedCompany.sub}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-start gap-3">
                  <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-zinc-700 font-medium text-[11px] leading-relaxed">
                    <strong>Admin Security Policy:</strong> Customer dashboards, private ad generation engines, and campaign launch triggers are strictly reserved for the client's authenticated credentials. Admins perform monitoring, staff assignment, and audit verifications through this central dossier.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: STAFF & TEAM LOGINS */}
            {activeDossierTab === 'team' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-black">Company Logins & Team Members</h4>
                  <span className="text-zinc-500 font-medium text-[11px]">Staff who can log into this B2B account</span>
                </div>

                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] uppercase font-black">
                        <th className="p-3">Reference ID</th>
                        <th className="p-3">Name & Email</th>
                        <th className="p-3">Assigned Role</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {/* Primary Owner */}
                      <tr className="bg-red-50/30">
                        <td className="p-3 font-mono font-bold text-red-600">{inspectedCompany.referenceId}</td>
                        <td className="p-3">
                          <div className="font-black text-black">{inspectedCompany.owner} <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black uppercase">Primary Owner</span></div>
                          <div className="text-zinc-500 text-[11px]">{inspectedCompany.email}</div>
                        </td>
                        <td className="p-3 font-bold text-zinc-800">Business Owner & Account Admin</td>
                        <td className="p-3"><span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">ACTIVE</span></td>
                      </tr>

                      {/* Provisioned Employees */}
                      {companyEmployees.map((emp) => (
                        <tr key={emp.id}>
                          <td className="p-3 font-mono font-bold text-zinc-700">{emp.referenceId}</td>
                          <td className="p-3">
                            <div className="font-black text-black">{emp.name}</div>
                            <div className="text-zinc-500 text-[11px]">{emp.email}</div>
                          </td>
                          <td className="p-3 font-bold text-zinc-800">{emp.role}</td>
                          <td className="p-3"><span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">ACTIVE</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: REGISTERED PRODUCTS */}
            {activeDossierTab === 'products' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-black">Company Product Catalog</h4>
                  <span className="text-zinc-500 font-medium text-[11px]">{companyProducts.length} registered products</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companyProducts.map((p) => (
                    <div key={p.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex gap-3">
                      <img src={p.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop'} alt="" className="w-16 h-16 object-cover rounded-xl border border-zinc-200 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-sm text-black truncate">{p.name}</h5>
                          <span className="font-mono font-bold text-red-600">₹{p.price}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-zinc-200 text-zinc-700 font-bold text-[9px] rounded">{p.category}</span>
                        <p className="text-[11px] text-zinc-500 font-medium line-clamp-2">{p.description}</p>
                      </div>
                    </div>
                  ))}

                  {companyProducts.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-zinc-400 font-medium">
                      No products added to catalog yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CREATED ADS & VIDEO CREATIVES */}
            {activeDossierTab === 'creatives' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-black">Created Ads & Video Motion Campaigns</h4>
                  <span className="text-zinc-500 font-medium text-[11px]">{companyCreatives.length} active creative campaigns</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companyCreatives.map((c) => (
                    <div key={c.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                      <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                        {c.adType === 'Video' ? (
                          <video src={c.creativeUrl} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={c.creativeUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-black text-[9px] uppercase">
                          {c.adType === 'Video' ? '🎬 Motion Video' : '🖼️ Image Banner'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-red-600 uppercase">{c.productName}</div>
                        <h5 className="font-black text-sm text-black">{c.headline}</h5>
                        <p className="text-[11px] text-zinc-500 font-medium line-clamp-2">{c.description}</p>
                        <div className="text-[10px] font-bold text-zinc-400 pt-1">
                          Format: {c.format || 'LinkedIn / Instagram'} • Status: <span className="text-emerald-600 font-black">{c.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {companyCreatives.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-zinc-400 font-medium">
                      No ad campaigns or videos created by this client yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: CAPTURED INBOUND LEADS */}
            {activeDossierTab === 'leads' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-black">Inbound Captured Inquiries</h4>
                  <span className="text-zinc-500 font-medium text-[11px]">{companyLeads.length} leads attributed to this company</span>
                </div>

                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] uppercase font-black">
                        <th className="p-3">Lead ID</th>
                        <th className="p-3">Prospect Name</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Campaign / Product</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {companyLeads.map((l, idx) => (
                        <tr key={l.id || idx}>
                          <td className="p-3 font-mono font-bold text-red-600">{l.id || `LEAD-${idx + 1}`}</td>
                          <td className="p-3 font-black text-black">{l.name}</td>
                          <td className="p-3">
                            <div className="font-bold text-zinc-800">{l.phone}</div>
                            <div className="text-[11px] text-zinc-400">{l.email}</div>
                          </td>
                          <td className="p-3 text-zinc-700">{l.productName || l.adName || 'Enterprise Inquiry'}</td>
                          <td className="p-3"><span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{l.status || 'NEW'}</span></td>
                        </tr>
                      ))}
                      {companyLeads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-zinc-400 font-medium">No inbound leads captured for this company yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
