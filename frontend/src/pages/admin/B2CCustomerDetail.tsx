import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  User, ShoppingBag, Send, 
  CreditCard, Users, Trash2, Eye,
  Maximize2, X, Play
} from 'lucide-react';
import { B2C_PLANS, getPlanConfig } from '../../constants/subscriptionPlans';
import { AppPlatformAdMockup } from '../../components/ads/AppPlatformAdMockup';

export const isVideoMedia = (url?: string, adType?: string) => {
  if (adType === 'Video' || adType === 'VIDEO') return true;
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v') || clean.includes('gtv-videos-bucket') || clean.includes('video');
};

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

  const [activeTab, setActiveTab] = useState<'requests' | 'profile' | 'product' | 'employees' | 'payments'>('requests');
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Profile Edit fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [employeeName, setEmployeeName] = useState('');
  const [assignedEmployeeRefId, setAssignedEmployeeRefId] = useState('');
  const [customerPlan, setCustomerPlan] = useState('B2C Basic Plan');

  // Ad Requests Workspace State
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [adminEmployees, setAdminEmployees] = useState<any[]>([]);

  // Full Screen Live Ad Preview Modal State (Admin Interactive Ad Inspection)
  const [fullPreviewAd, setFullPreviewAd] = useState<{
    mediaUrl: string;
    adType: 'Image' | 'Video' | 'Both' | string;
    headline: string;
    description: string;
    brandName: string;
    format?: string;
    version?: number;
    productName?: string;
    cta?: string;
  } | null>(null);

  // Load Customer & Requests & Staff
  useEffect(() => {
    if (!id) return;

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const emps = mockUsers.filter(
      (u: any) => 
        (u.role === 'EMPLOYEE' || u.role === 'MANAGER' || u.role === 'SUPPORT' || u.role === 'DESIGNER') &&
        u.accountType !== 'B2B' && u.accountType !== 'B2C'
    );
    setAdminEmployees(emps);

    const found = mockUsers.find((u: any) => u._id === id || u.referenceId === id || u.email === id);
    
    if (found) {
      setCustomer(found);
      setFirstName(found.firstName || (found.name ? found.name.split(' ')[0] : ''));
      setLastName(found.lastName || (found.name ? found.name.split(' ').slice(1).join(' ') : ''));
      setCompanyName(found.companyName || '');
      setMobile(found.mobile || found.phone || '');
      setStatus(found.status || 'ACTIVE');
      setEmployeeName(found.employeeName || 'Sarah Jenkins');
      setAssignedEmployeeRefId(found.assignedEmployeeRefId || 'EMP-REF-742918');
      setCustomerPlan(found.subscription || 'B2C Basic Plan');

      // Load Requests
      const userReqs = localStorage.getItem(`requests_${found._id}`) || 
                       localStorage.getItem(`requests_${found.email}`) || 
                       localStorage.getItem(`requests_${found.referenceId}`);
      if (userReqs) {
        try {
          setRequests(JSON.parse(userReqs));
        } catch {
          setRequests([]);
        }
      } else {
        const allB2C = JSON.parse(localStorage.getItem('all_b2c_requests') || '[]');
        const matched = allB2C.filter((r: any) => r.userId === found._id || r.userEmail === found.email);
        setRequests(matched);
      }
    } else {
      // Backend API lookup fallback
      const token = localStorage.getItem('auth_token') || 'mock-jwt-admin-token';
      fetch(`http://localhost:3000/api/v1/admin/b2c/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.customer) {
            setCustomer(data.customer);
            setFirstName(data.customer.firstName || '');
            setLastName(data.customer.lastName || '');
            setCompanyName(data.customer.companyName || '');
            setMobile(data.customer.mobile || '');
            setStatus(data.customer.status || 'ACTIVE');
            setCustomerPlan(data.customer.subscription || 'B2C Basic Plan');
            if (Array.isArray(data.requests)) {
              setRequests(data.requests);
            }
          }
        })
        .catch(err => console.error("Error loading B2C customer from API:", err));
    }
  }, [id]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const planDef = getPlanConfig(customerPlan);

    const updated = {
      ...customer,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      companyName,
      mobile,
      status,
      employeeName,
      assignedEmployeeRefId,
      subscription: planDef.name,
      plan: planDef.name,
      maxProducts: planDef.maxProducts,
      imageAdsPerProduct: planDef.imageAdsPerProduct,
      videoAdsPerProduct: planDef.videoAdsPerProduct,
      allowVideos: planDef.allowVideos
    };

    setCustomer(updated);

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === customer._id || u.email === customer.email);
    if (idx !== -1) {
      mockUsers[idx] = updated;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));

      const authUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
      if (authUser && (authUser._id === updated._id || authUser.email === updated.email)) {
        localStorage.setItem('auth_user', JSON.stringify({ ...authUser, ...updated }));
      }

      alert(`✅ Customer profile & subscription (${planDef.name}) successfully updated in database!`);
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

  const activePlanDef = getPlanConfig(customer.subscription || customerPlan);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/b2c"
            className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-red-600">
                {customer.referenceId || 'CUST-REF-109284'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {customer.status || 'ACTIVE'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight mt-0.5">
              {customer.name || `${customer.firstName || 'B2C'} ${customer.lastName || 'Client'}`}
            </h1>
            <p className="text-xs text-zinc-500 font-medium">{customer.email} • {customer.mobile || '+91 98765 00000'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-right">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Active Tier</span>
            <span className="text-xs font-black text-red-600">{activePlanDef.name}</span>
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
          { id: 'requests', label: `Created Ads & Videos (${requests.length})`, icon: Send },
          { id: 'profile', label: 'Client Profile & Plan', icon: User },
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

      {/* 1. CREATED ADS & VIDEOS TAB (AUDIT VIEW) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-black text-black text-lg">Customer Created Ad Creatives</h3>
              <p className="text-xs text-zinc-500 font-medium">All live image banners and motion video ads generated by this client.</p>
            </div>
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-200 font-mono text-xs font-black rounded-xl">
              {requests.length} Total Creatives
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
              <div key={req.id} className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-[10px] font-bold text-zinc-400">{req.id}</div>
                      <h4 className="font-black text-black text-base mt-0.5">{req.headline || req.productName}</h4>
                      <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                        {req.format || 'Instagram Post (1:1)'} • {req.adType === 'Video' ? '🎬 Motion Video' : '🖼️ Image Banner'}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-black rounded-lg text-[9px] uppercase">
                      {req.status}
                    </span>
                  </div>

                  {req.creativeUrl && (
                    <div 
                      onClick={() => setFullPreviewAd({
                        mediaUrl: req.creativeUrl || '',
                        adType: req.adType,
                        headline: req.headline || req.productName,
                        description: req.description,
                        brandName: customer?.companyName || customer?.name || 'Brand Partner',
                        format: req.format,
                        version: req.creativeVersion || 1,
                        productName: req.productName,
                        cta: req.cta || "I'm Interested"
                      })}
                      className="relative group cursor-pointer rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-black aspect-video"
                    >
                      {isVideoMedia(req.creativeUrl, req.adType) ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <video 
                            src={req.creativeUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600/90 text-white font-black text-[9px] uppercase rounded-md flex items-center gap-1">
                            <Play className="w-2.5 h-2.5 fill-white" />
                            <span>Play Video</span>
                          </div>
                        </div>
                      ) : (
                        <img src={req.creativeUrl} alt="Ad creative" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-wider backdrop-blur-[2px]">
                        <Maximize2 className="w-4 h-4" />
                        <span>Inspect in Simulator</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-zinc-600 font-medium bg-zinc-50 p-3.5 rounded-2xl leading-relaxed border border-zinc-100 line-clamp-3">
                    {req.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                  <span className="font-bold text-zinc-400">Created: {req.createdDate}</span>
                  {req.creativeUrl && (
                    <button 
                      onClick={() => setFullPreviewAd({
                        mediaUrl: req.creativeUrl || '',
                        adType: req.adType,
                        headline: req.headline || req.productName || 'Exclusive Offer',
                        description: req.description || '',
                        brandName: customer?.companyName || customer?.name || 'Brand Partner',
                        format: req.format || 'Instagram Post (1:1)',
                        version: req.creativeVersion || 1,
                        productName: req.productName,
                        cta: req.cta || "I'm Interested"
                      })}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white font-bold text-[10px] rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3 h-3 text-red-500" />
                      <span>Inspect in Simulator</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {requests.length === 0 && (
              <div className="col-span-3 py-12 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-300">
                <span className="text-3xl block mb-2">🎨</span>
                <h4 className="font-black text-black text-base">No Ad Creatives Generated Yet</h4>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Customer has not created any image or video ads yet. Ads created by customer will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Client Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
          <h3 className="font-black text-black text-lg border-b border-zinc-100 pb-3">Edit Client Profile & Subscription</h3>
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Brand / Store Name</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Mobile Phone</label>
              <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Subscription Plan</label>
              <select value={customerPlan} onChange={e => setCustomerPlan(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600">
                {B2C_PLANS.map(p => (
                  <option key={p.name} value={p.name}>{p.name} (₹{p.monthlyPrice}/mo)</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider">
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* 3. Product Catalog Tab */}
      {activeTab === 'product' && (
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6 max-w-xl">
          <h3 className="font-black text-black text-lg border-b border-zinc-100 pb-3">Listed Products</h3>
          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between font-black text-sm text-black">
              <span>Primary Product</span>
              <span className="text-red-600 font-mono">₹{customer.discount ? 1499 : 1999}</span>
            </div>
            <p className="text-zinc-500 font-medium">{customer.description || 'Premium lifestyle product offering.'}</p>
            <div className="text-[10px] font-bold text-zinc-400 pt-1">Target Audience: {customer.targetAudience || 'General Consumers'}</div>
          </div>
        </div>
      )}

      {/* 4. Staff Assignment Tab */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6 max-w-xl">
          <div>
            <h3 className="font-black text-black text-lg">Assigned Staff Specialist</h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Assign or change the dedicated AD-HUNTER account specialist for this B2C customer.
            </p>
          </div>

          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-black text-black text-sm">{employeeName || 'Sarah Jenkins'}</span>
              <span className="font-mono text-[10px] font-bold text-red-600">{assignedEmployeeRefId || 'EMP-REF-742918'}</span>
            </div>
            <p className="text-zinc-500 font-medium">Currently assigned account manager and creative consultant.</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!customer) return;
            const chosen = adminEmployees.find(emp => emp.referenceId === assignedEmployeeRefId);
            const name = chosen ? chosen.name : employeeName;
            
            const updated = {
              ...customer,
              employeeName: name,
              assignedEmployeeRefId: assignedEmployeeRefId
            };
            setCustomer(updated);
            setEmployeeName(name);

            const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
            const idx = mockUsers.findIndex((u: any) => u._id === customer._id || u.email === customer.email);
            if (idx !== -1) {
              mockUsers[idx].employeeName = name;
              mockUsers[idx].assignedEmployeeRefId = assignedEmployeeRefId;
              mockUsers[idx].assignedEmployeeName = name;
              localStorage.setItem('mock_users', JSON.stringify(mockUsers));
            }
            alert(`✅ Assigned ${name} (${assignedEmployeeRefId}) to ${customer.name || customer.email}!`);
          }} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                Select from Active Headquarters Employees
              </label>
              <select 
                value={assignedEmployeeRefId} 
                onChange={e => {
                  setAssignedEmployeeRefId(e.target.value);
                  const matched = adminEmployees.find(emp => emp.referenceId === e.target.value);
                  if (matched) setEmployeeName(matched.name);
                }}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
              >
                {adminEmployees.map(emp => (
                  <option key={emp._id || emp.referenceId} value={emp.referenceId}>
                    {emp.name} ({emp.referenceId}) • {emp.department || emp.role}
                  </option>
                ))}
                {adminEmployees.length === 0 && (
                  <option value="EMP-REF-742918">Sarah Jenkins (EMP-REF-742918) • Lead Specialist</option>
                )}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider"
            >
              Save Staff Assignment
            </button>
          </form>
        </div>
      )}

      {/* 5. Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6 max-w-xl">
          <h3 className="font-black text-black text-lg border-b border-zinc-100 pb-3">Billing & Payment Invoices</h3>
          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-600">Active Subscription:</span>
              <span className="font-black text-black">{activePlanDef.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-600">Payment Status:</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-black rounded-md text-[10px] uppercase">PAID & ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-600">Monthly Billing:</span>
              <span className="font-mono font-black text-red-600">₹{activePlanDef.monthlyPrice}/month</span>
            </div>
          </div>
        </div>
      )}

      {/* 📱 INTERACTIVE AD MOCKUP SIMULATOR MODAL */}
      {fullPreviewAd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-zinc-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Interactive Multi-App Simulator</span>
                <h3 className="font-black text-black text-lg">{fullPreviewAd.headline}</h3>
              </div>
              <button 
                onClick={() => setFullPreviewAd(null)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <AppPlatformAdMockup
                mediaUrl={fullPreviewAd.mediaUrl}
                isVideo={isVideoMedia(fullPreviewAd.mediaUrl, fullPreviewAd.adType)}
                brandName={fullPreviewAd.brandName}
                headline={fullPreviewAd.headline}
                description={fullPreviewAd.description}
                productName={fullPreviewAd.productName || 'Featured Product'}
                ctaText={fullPreviewAd.cta || "I'm Interested"}
                initialFormat={fullPreviewAd.format || 'INSTAGRAM_POST'}
                allowFormatSwitching={true}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
