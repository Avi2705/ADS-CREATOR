import { useState, useEffect } from 'react';
import { 
  Users, Search, 
  ArrowRight, Filter, UserPlus
} from 'lucide-react';

interface Lead {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  intentType: 'B2B' | 'B2C' | 'Explorer';
  profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'APPROVED' | 'CONVERTED' | 'REJECTED';
  paymentStatus: string;
  source: string;
  createdDate: string;
  assignedEmployeeRefId?: string;
  assignedEmployeeName?: string;
}

export default function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [intentFilter, setIntentFilter] = useState('All');

  
  // Selected Lead Modal details
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Assignment / Conversion states
  const [selectedEmployeeRef, setSelectedEmployeeRef] = useState('');
  const [conversionPlan, setConversionPlan] = useState('B2C Growth');


  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const localLeads = localUsers
      .filter((u: any) => 
        (u.status === 'LEAD' || u.customerType === 'EXPLORER' || (u.role === 'CUSTOMER' && u.paymentStatus !== 'PAID')) &&
        u.role !== 'SUPER_ADMIN' && u.role !== 'EMPLOYEE' && u.role !== 'MANAGER' && u.role !== 'SUPPORT'
      )
      .map((u: any) => ({
        id: u._id,
        referenceId: u.referenceId || `LEAD-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        name: u.name || `${u.firstName || 'Lead'} ${u.lastName || 'Prospect'}`,
        email: u.email,
        phone: u.mobile || u.phone || '+91 98765 00000',
        companyName: u.companyName || 'Registered Prospect',
        intentType: u.intentType || u.customerType || 'B2C',
        profileStatus: u.profileStatus || 'INCOMPLETE',
        status: 'NEW',
        paymentStatus: u.paymentStatus || 'PENDING',
        source: 'Public Signup (/join)',
        createdDate: u.createdDate || new Date().toISOString().split('T')[0],
        assignedEmployeeRefId: u.assignedEmployeeRefId || 'UNASSIGNED',
        assignedEmployeeName: u.assignedEmployeeName || 'Unassigned'
      }));

    setLeads(localLeads);
  };



  const handleAssignEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const updated = leads.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          assignedEmployeeRefId: selectedEmployeeRef
        };
      }
      return l;
    });

    setLeads(updated);

    // Update in mock_users DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === selectedLead.id || u.email === selectedLead.email);
    if (idx !== -1) {
      mockUsers[idx].assignedEmployeeRefId = selectedEmployeeRef;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    setIsAssignModalOpen(false);
    alert(`Lead (${selectedLead.referenceId}) assigned to staff specialist ${selectedEmployeeRef}!`);
  };

  const handleConvertLeadToCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const customerRefId = `CUST-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Convert in local state
    const updatedLeads = leads.filter(l => l.id !== selectedLead.id);
    setLeads(updatedLeads);

    // Update in mock_users DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === selectedLead.id || u.email === selectedLead.email);
    if (idx !== -1) {
      mockUsers[idx] = {
        ...mockUsers[idx],
        status: 'ACTIVE',
        accountType: 'B2C',
        role: 'CUSTOMER',
        paymentStatus: 'PAID',
        subscription: conversionPlan,
        referenceId: customerRefId
      };
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    } else {
      mockUsers.push({
        _id: selectedLead.id,
        referenceId: customerRefId,
        email: selectedLead.email,
        name: selectedLead.name,
        companyName: selectedLead.companyName,
        status: 'ACTIVE',
        accountType: 'B2C',
        role: 'CUSTOMER',
        paymentStatus: 'PAID',
        subscription: conversionPlan,
        mobile: selectedLead.phone,
        assignedEmployeeRefId: selectedEmployeeRef
      });
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }

    setIsConvertModalOpen(false);
    alert(`Lead successfully upgraded to Active Subscribed Customer!\nCustomer Reference ID: ${customerRefId}`);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntent = intentFilter === 'All' || l.intentType === intentFilter;
    return matchesSearch && matchesIntent;
  });

  return (
    <div className="space-y-8 bg-white text-black min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Inbound Registration Pipeline</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">Leads Pipeline & Conversion</h1>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Track all incoming public signups (Leads). Convert leads into paying B2C customers upon subscription activation.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Unconverted Leads</span>
          <div className="text-3xl font-black text-black font-display">{leads.length}</div>
          <div className="text-[10px] text-zinc-500 font-semibold">Registered prospects</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">B2C Ad Intent</span>
          <div className="text-3xl font-black text-red-600 font-display">
            {leads.filter(l => l.intentType === 'B2C').length}
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold">Ready for creative studio</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Assigned to Staff</span>
          <div className="text-3xl font-black text-black font-display">
            {leads.filter(l => l.assignedEmployeeRefId).length}
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold">Tracked by Reference ID</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Conversion Rule</span>
          <div className="text-base font-black text-red-600 font-display flex items-center gap-1.5 pt-1">
            <UserPlus className="w-4 h-4" /> Subscription Required
          </div>
          <div className="text-[10px] text-red-700 font-bold">Leads become Customers upon payment</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Lead Name, Email, Reference ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Intent:
          </span>
          <select 
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
          >
            <option value="All">All Intents</option>
            <option value="B2C">B2C Ad Intent</option>
            <option value="B2B">B2B SaaS Intent</option>
            <option value="Explorer">Explorer</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
              <th className="p-4 pl-6">Reference ID</th>
              <th className="p-4">Lead Details</th>
              <th className="p-4">Brand / Company</th>
              <th className="p-4">Assigned Staff</th>
              <th className="p-4">Payment</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs font-medium">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                
                {/* Reference ID */}
                <td className="p-4 pl-6">
                  <span className="font-mono font-black text-red-600 text-xs px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
                    {lead.referenceId}
                  </span>
                </td>

                {/* Lead Details */}
                <td className="p-4">
                  <div className="font-black text-black text-sm">{lead.name}</div>
                  <div className="text-zinc-500 text-xs font-semibold">{lead.email} • {lead.phone}</div>
                </td>

                {/* Brand / Company */}
                <td className="p-4">
                  <div className="font-bold text-black text-xs">{lead.companyName}</div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[9px] font-black text-zinc-600 rounded-full uppercase">
                    {lead.intentType}
                  </span>
                </td>

                {/* Assigned Staff */}
                <td className="p-4">
                  <span className="font-mono font-bold text-zinc-700 text-xs px-2 py-0.5 bg-zinc-100 rounded-lg border border-zinc-200">
                    {lead.assignedEmployeeRefId || 'UNASSIGNED'}
                  </span>
                </td>

                {/* Payment Status */}
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 font-black rounded-lg text-[10px] uppercase">
                    {lead.paymentStatus}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    
                    {/* Assign Staff */}
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsAssignModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold transition-colors border border-zinc-200"
                    >
                      Assign Staff
                    </button>

                    {/* Convert to Subscribed Customer */}
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsConvertModalOpen(true);
                      }}
                      className="btn-shimmer px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1"
                    >
                      <span>Convert to Customer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs font-semibold">
                  No leads in pipeline. New registrations on /join will appear here automatically.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Assign Lead */}
      {isAssignModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Assign Lead</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Assign {selectedLead.name} ({selectedLead.referenceId}) to an employee specialist.
                </p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200">✕</button>
            </div>

            <form onSubmit={handleAssignEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Select Staff Specialist</label>
                <select
                  value={selectedEmployeeRef}
                  onChange={(e) => setSelectedEmployeeRef(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                >
                  <option value="EMP-REF-742918">Sarah Jenkins (EMP-REF-742918) - Inbound Lead Specialist</option>
                  <option value="EMP-REF-389104">David Miller (EMP-REF-389104) - Client Relationship Lead</option>
                  <option value="EMP-REF-612490">Priya Sharma (EMP-REF-612490) - Creator Support Specialist</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shimmer px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-xs shadow-md shadow-red-600/20"
                >
                  Confirm Staff Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Convert Lead to Active Customer */}
      {isConvertModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Provision Subscribed Customer</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Upgrading {selectedLead.name} to active B2C Customer.
                </p>
              </div>
              <button onClick={() => setIsConvertModalOpen(false)} className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200">✕</button>
            </div>

            <form onSubmit={handleConvertLeadToCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Activate Subscription Plan</label>
                <select
                  value={conversionPlan}
                  onChange={(e) => setConversionPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                >
                  <option value="B2C Starter">B2C Starter (₹1,499/mo)</option>
                  <option value="B2C Growth">B2C Growth (₹3,499/mo)</option>
                  <option value="B2C Scale Agency">B2C Scale Agency (₹7,999/mo)</option>
                </select>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                ⚡ A unique <strong>Customer Reference ID (CUST-REF-XXXXX)</strong> will be generated and full B2C Ad Studio features unlocked.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shimmer px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-xs shadow-md shadow-red-600/20"
                >
                  Activate Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
