import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, Image, Video, 
  Lock, User, ShoppingBag, Send, 
  CreditCard, Users, Trash2
} from 'lucide-react';


interface Customer {
  _id: string;
  referenceId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  status?: string;
  paymentStatus?: string;
  subscription?: string;
  companyName?: string;
  companyType?: string;
  mobile?: string;
  countryCode?: string;
  profileStatus?: string;
  intentType?: string;
  employeeName?: string;
  assignedEmployeeRefId?: string;
  discount?: number;
  targetAudience?: string;
  description?: string;
}

interface AdRequest {
  id: string;
  productName: string;
  adType: 'Image' | 'Video' | 'Both';
  purpose: string;
  description: string;
  headline: string;
  cta: string;
  maxWords: number;
  style: string;
  format: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'IN_PROGRESS' | 'CREATIVE_READY' | 'CUSTOMER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'CANCELLED';
  createdDate: string;
  comment?: string;
  creativeUrl?: string;
  creativeVersion?: number;
  productImages?: string[];
}


export default function B2CCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: any) => state.auth);

  const isAdmin = currentUser && (
    currentUser.role === 'SUPER_ADMIN' || 
    currentUser.role === 'ADMIN' || 
    currentUser.role === 'BUSINESS_OWNER' || 
    currentUser.accountType === 'SUPER_ADMIN' ||
    currentUser.email?.toLowerCase().includes('admin')
  );


  const [activeTab, setActiveTab] = useState<'profile' | 'product' | 'requests' | 'employees' | 'payments'>('requests');
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Profile Edit fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [employeeName, setEmployeeName] = useState('');
  const [assignedEmployeeRefId, setAssignedEmployeeRefId] = useState('');

  // Ad Requests Workspace State
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<AdRequest | null>(null);
  
  // Create / Upload Creative Form State
  const [creativeUrl, setCreativeUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');
  const [creativeVersion, setCreativeVersion] = useState(1);
  const [reqStatus, setReqStatus] = useState<AdRequest['status']>('CUSTOMER_REVIEW');
  const [actionType, setActionType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  useEffect(() => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const found = mockUsers.find((u: any) => u._id === id || u.referenceId === id || u.email === id);
    if (found) {
      setCustomer(found);
      setFirstName(found.firstName || found.name?.split(' ')[0] || '');
      setLastName(found.lastName || found.name?.split(' ')[1] || '');
      setCompanyName(found.companyName || 'B2C Client');
      setMobile(found.mobile || '');
      setStatus(found.status || 'ACTIVE');
      setEmployeeName(found.employeeName || 'Unassigned');
      setAssignedEmployeeRefId(found.assignedEmployeeRefId || 'Unassigned');


      // Load requests specific to this customer's ID
      const savedRequests = localStorage.getItem(`requests_${found._id}`);
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      } else {
        setRequests([]);
      }
    }
  }, [id]);


  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === customer._id);
    if (idx !== -1) {
      const updated = {
        ...mockUsers[idx],
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        companyName,
        mobile,
        status,
        employeeName,
        assignedEmployeeRefId
      };
      mockUsers[idx] = updated;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      setCustomer(updated);
      alert("Customer profile successfully updated in database!");
    }
  };

  const handleDeleteCustomer = () => {
    if (!customer) return;
    if (confirm("Are you sure you want to delete this customer account?")) {
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const filtered = mockUsers.filter((u: any) => u._id !== customer._id);
      localStorage.setItem('mock_users', JSON.stringify(filtered));
      alert("Customer account successfully deleted.");
      navigate('/admin/b2c');
    }
  };

  const handleUploadCreative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only Administrators are permitted to create/upload image or video ad assets.");
      return;
    }

    if (!selectedReq || !creativeUrl) {
      alert("Please enter a creative url media link.");
      return;
    }

    const updated = requests.map(r => {
      if (r.id === selectedReq.id) {
        return {
          ...r,
          adType: actionType === 'IMAGE' ? ('Image' as const) : ('Video' as const),
          creativeUrl,
          creativeVersion,
          status: reqStatus
        };
      }
      return r;
    });

    setRequests(updated);
    localStorage.setItem(`requests_${customer?._id}`, JSON.stringify(updated));
    setSelectedReq(null);
    alert(`New ${actionType === 'IMAGE' ? 'Image Banner' : 'Video Creative'} submitted to B2C Client Portal!`);
  };

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white text-black space-y-4">
        <h2 className="text-xl font-black text-black">Customer account not found</h2>
        <Link to="/admin/b2c" className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold inline-block">
          Return to Customers List
        </Link>
      </div>
    );
  }

  const custRefId = customer.referenceId || 'CUST-REF-918234';

  return (
    <div className="space-y-8 bg-white text-black min-h-screen">
      
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/b2c"
            className="p-2.5 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 transition-colors border border-zinc-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-red-600 text-xs px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-lg">
                {custRefId}
              </span>
              <span className="text-[10px] font-black uppercase text-black bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                {customer.subscription || 'B2C Growth Tier'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-black font-display tracking-tight mt-1">
              {customer.companyName || `${firstName} ${lastName}`}
            </h1>
            <p className="text-xs text-zinc-500 font-semibold">{customer.email} • {mobile || 'No Phone'}</p>
          </div>
        </div>

        {/* Action Controls & Guard */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-right">
            <div className="text-[9px] uppercase font-bold text-zinc-400">Assigned Staff</div>
            <div className="text-xs font-mono font-black text-black">{assignedEmployeeRefId}</div>
          </div>

          {isAdmin && (
            <button 
              onClick={handleDeleteCustomer}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-zinc-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-zinc-200 pb-4 overflow-x-auto">
        {[
          { id: 'requests', label: 'Ad Creatives & Studio', icon: Send },
          { id: 'profile', label: 'Client Profile', icon: User },
          { id: 'product', label: 'Product Catalog', icon: ShoppingBag },
          { id: 'employees', label: 'Staff Assignment', icon: Users },
          { id: 'payments', label: 'Payment Invoices', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. CREATIVE WORKSPACE (WITH ADMIN-ONLY CREATION BUTTONS) */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ad Requests List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-black text-black text-lg">Client Ad Requests</h3>

              
              {/* ADMIN-ONLY ACTION NOTICE */}
              {!isAdmin && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-bold">
                  <Lock className="w-3 h-3 text-red-600" />
                  <span>Ad creation restricted to Super Admin</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-[10px] font-bold text-zinc-400">{req.id}</div>
                      <h4 className="font-black text-black text-base mt-0.5">{req.headline}</h4>
                      <p className="text-xs text-zinc-500 font-semibold mt-1">
                        Format: {req.format} • Type: {req.adType} • Purpose: {req.purpose}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 font-black rounded-lg text-[10px] uppercase">
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 font-medium bg-zinc-50 p-4 rounded-2xl leading-relaxed border border-zinc-100">
                    {req.description}
                  </p>

                  {/* Customer Product Photos Gallery */}
                  {req.productImages && req.productImages.length > 0 && (
                    <div className="space-y-2 bg-zinc-50/70 p-3.5 rounded-2xl border border-zinc-200">
                      <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">
                        Customer Attached Product Photos ({req.productImages.length})
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {req.productImages.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt={`Product photo ${i + 1}`} 
                            className="aspect-square w-full object-cover rounded-xl border border-zinc-200 shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {req.creativeUrl && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Current Creative Asset</span>
                      <img src={req.creativeUrl} alt="Ad creative" className="w-full h-40 object-cover rounded-2xl border border-zinc-200" />
                    </div>
                  )}

                  {/* ADMIN-ONLY ACTION BUTTONS: CREATE AD AS IMAGE & CREATE AD AS VIDEO */}
                  {isAdmin ? (
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4 gap-3">
                      <span className="text-[10px] font-bold text-zinc-400">Submitted: {req.createdDate}</span>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedReq(req);
                            setActionType('IMAGE');
                            if (req.productImages && req.productImages.length > 0) {
                              setCreativeUrl(req.productImages[0]);
                            }
                          }}
                          className="btn-shimmer px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-red-600/20"
                        >
                          <Image className="w-3.5 h-3.5" />
                          <span>Create a Ad as Image</span>
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedReq(req);
                            setActionType('VIDEO');
                            if (req.productImages && req.productImages.length > 0) {
                              setCreativeUrl(req.productImages[0]);
                            }
                          }}
                          className="btn-shimmer px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-900 border border-zinc-800"
                        >
                          <Video className="w-3.5 h-3.5 text-red-600" />
                          <span>Create a Ad as Video</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 font-bold">
                      <span>Submitted: {req.createdDate}</span>
                      <span className="text-zinc-500">Employee review mode</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Creative Studio Generator Panel */}
          <div className="lg:col-span-1">
            {isAdmin && selectedReq ? (
              <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 font-black rounded-lg text-[9px] uppercase">
                      Admin Studio Tool
                    </span>
                    <h3 className="font-black text-black text-base mt-1">
                      Generate {actionType === 'IMAGE' ? 'Image Banner' : 'Video Creative'}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="text-zinc-400 hover:text-black">✕</button>
                </div>

                {/* Customer Attached Photos Quick Selector */}
                {selectedReq.productImages && selectedReq.productImages.length > 0 && (
                  <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
                      Select Customer Photo for Ad ({selectedReq.productImages.length})
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedReq.productImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCreativeUrl(img)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            creativeUrl === img 
                              ? 'border-red-600 ring-2 ring-red-600/30' 
                              : 'border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          <img src={img} alt={`Choice ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleUploadCreative} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Creative Asset Media URL</label>
                    <input 
                      type="url" 
                      required 
                      value={creativeUrl} 
                      onChange={e => setCreativeUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    />
                  </div>


                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Creative Version</label>
                    <input 
                      type="number" 
                      required 
                      value={creativeVersion} 
                      onChange={e => setCreativeVersion(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Dispatch Status</label>
                    <select 
                      value={reqStatus} 
                      onChange={e => setReqStatus(e.target.value as any)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    >
                      <option value="CUSTOMER_REVIEW">CUSTOMER_REVIEW (Awaiting Approval)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="PUBLISHED">PUBLISHED (Live across channels)</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider"
                  >
                    Deploy {actionType === 'IMAGE' ? 'Image Ad' : 'Video Ad'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 text-center space-y-3">
                <span className="text-3xl block">🎨</span>
                <h4 className="font-black text-black text-sm">Creative Studio Actions</h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  {isAdmin 
                    ? "Click 'Create a Ad as Image' or 'Create a Ad as Video' on any customer request to process and deploy."
                    : "Employees can inspect and review customer submissions. Creative generation is locked to Super Admin."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Client Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
          <h3 className="font-black text-black text-lg border-b border-zinc-100 pb-3">Edit Client Profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Brand Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Mobile Phone</label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Plan Tier</label>
                <input type="text" readOnly value={customer.subscription || 'B2C Growth'} className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl font-bold text-xs text-zinc-700 cursor-not-allowed" />
              </div>
            </div>

            <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider">
              Save Profile Updates
            </button>
          </form>
        </div>
      )}

      {/* 3. Product Catalog Tab */}
      {activeTab === 'product' && (
        <div className="max-w-2xl bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-4">
          <h3 className="font-black text-black text-lg border-b border-zinc-100 pb-3">Flagship Product Details</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-700 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Brand Product</span>
              <span className="text-black font-black text-sm">{customer.companyName || 'Air Max Velocity Pro'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Target Audience</span>
              <span className="text-black font-black">{customer.targetAudience || 'Marathon runners, sneakerheads'}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-zinc-200">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Marketing Copy Description</span>
              <p className="text-zinc-700 mt-1 leading-relaxed">{customer.description || 'Ultra-responsive carbon fiber running footwear.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Staff Assignment Tab */}
      {activeTab === 'employees' && (
        <div className="max-w-md bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-4">
          <h3 className="font-black text-black text-lg border-b border-zinc-100 pb-3">Assigned Staff Specialist</h3>
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex justify-between items-center">
            <div>
              <div className="font-black text-black text-sm">{employeeName}</div>
              <div className="text-[10px] font-mono text-red-600 font-bold">{assignedEmployeeRefId}</div>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-600 font-black rounded-lg text-[10px] uppercase">
              Assigned
            </span>
          </div>
        </div>
      )}

      {/* 5. Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm p-6 space-y-4">
          <h3 className="font-black text-black text-lg">Invoices & Subscription Settlement</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-black uppercase text-[10px]">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Plan Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reference ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              <tr>
                <td className="p-4 font-black text-black">INV-2026-9012</td>
                <td className="p-4 font-bold text-black">₹3,499 / mo</td>
                <td className="p-4"><span className="px-2.5 py-0.5 bg-red-50 text-red-600 font-black rounded-full text-[10px]">PAID</span></td>
                <td className="p-4 font-mono font-bold text-red-600">{custRefId}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
