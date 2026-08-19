import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logOut } from '../../features/auth/authSlice';
import { 
  Sparkles, Lock, ArrowRight, 
  LayoutDashboard, ShoppingBag, 
  Share2, Users, User, LogOut, Flame,
  Trash2, Link2, X, Shield, ArrowLeft,
  Eye, Check
} from 'lucide-react';
import { AppPlatformAdMockup, type PlatformFormat } from '../../components/ads/AppPlatformAdMockup';

export interface B2BProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl?: string;
  createdDate: string;
}

export interface B2BCampaignRequest {
  id: string;
  productId: string;
  productName: string;
  adType: 'Image' | 'Video' | 'Both';
  purpose: string;
  description: string;
  headline: string;
  cta: string;
  format?: string;
  maxWords?: number;
  status: 'SUBMITTED' | 'CREATIVE_READY' | 'APPROVED' | 'PUBLISHED';
  createdDate: string;
  creativeUrl?: string;
  productImages?: string[];
}

export interface B2BPost {
  id?: string;
  _id?: string;
  headline: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  channels: string[];
  targetUrl: string;
  status: 'PUBLISHED' | 'SCHEDULED';
  publishedDate: string;
  impressions: number;
  clicks: number;
  leads: number;
}

export interface B2BLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  productName: string;
  adName?: string;
  channel?: string;
  capturedAt: string;
  status?: string;
  companyName?: string;
  assignedTo?: string;
}

export interface SocialAccountCredential {
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'Twitter';
  handle: string;
  accountId: string;
  accessToken: string;
  isConnected: boolean;
  connectedAt?: string;
}

export const B2B_VIDEO_PRESETS = [
  {
    id: 'saas-kinetic',
    name: '⚡ Enterprise SaaS Kinetic Reel',
    category: 'Software & Cloud',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-41484-large.mp4'
  },
  {
    id: 'corp-growth',
    name: '📈 B2B Growth & Analytics Spotlight',
    category: 'Analytics',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-business-charts-and-data-presentation-41884-large.mp4'
  },
  {
    id: 'tech-showcase',
    name: '🖥️ High-Tech Enterprise Platform Drop',
    category: 'Hardware & Tech',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

const SOCIAL_CHANNELS = [
  { id: 'Instagram' as const, name: 'Instagram', badge: '📷 Instagram', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'Facebook' as const, name: 'Facebook', badge: '👥 Facebook', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'TikTok' as const, name: 'TikTok', badge: '🎵 TikTok', color: 'bg-zinc-100 text-black border-zinc-300' },
  { id: 'YouTube' as const, name: 'YouTube Shorts', badge: '🔴 YouTube Shorts', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'Twitter' as const, name: 'X / Twitter', badge: '✖️ X / Twitter', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' }
];

export default function B2BDashboard() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customerType = user?.customerType || 'EXPLORER';

  // Strict Access Control Guard (Admins cannot enter customer dashboard without credentials)
  if (!user || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || customerType !== 'B2B') {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-sm">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-black font-display">
              {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'Client Workspace Protected' : 'B2B Portal Restricted'}
            </h1>
            <p className="text-zinc-600 text-xs font-medium leading-relaxed">
              {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
                ? 'B2B enterprise client workspaces are private and require direct client login credentials. Administrators cannot access or generate ads from client workspaces without customer credentials. Please manage and audit companies from the Admin Center.'
                : customerType === 'EXPLORER'
                  ? 'Your account is in Explorer mode. Please choose B2B as your permanent account type.'
                  : 'Your account is classified as B2C. You can only access the B2C Client Portal.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to={user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? '/admin/b2b' : customerType === 'EXPLORER' ? '/explorer' : '/b2c'}
              className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <span>{user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'Go to Admin B2B Manager' : customerType === 'EXPLORER' ? 'Go to Explorer Hub' : 'Go to B2C Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active View Tab
  const [activeView, setActiveView] = useState<
    'overview' | 'products' | 'campaigns' | 'posts' | 'social' | 'leads' | 'employees' | 'profile'
  >('overview');

  // B2B Employee / Team State
  const [b2bEmployees, setB2BEmployees] = useState<any[]>([]);
  const [b2bEmpName, setB2BEmpName] = useState('');
  const [b2bEmpEmail, setB2BEmpEmail] = useState('');
  const [b2bEmpPassword, setB2BEmpPassword] = useState('B2BPass2026!');
  const [b2bEmpRole, setB2BEmpRole] = useState('B2B Lead Specialist');

  const userKey = user?._id || user?.email || 'b2b-default';

  // Products Asset State
  const [products, setProducts] = useState<B2BProduct[]>([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  // Campaigns & Creative Studio State
  const [campaigns, setCampaigns] = useState<B2BCampaignRequest[]>([]);
  const [selectedProdForAd, setSelectedProdForAd] = useState('');
  const [campHeadline, setCampHeadline] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campAdType, setCampAdType] = useState<'Image' | 'Video' | 'Both'>('Image');
  const [campFormat, setCampFormat] = useState('LinkedIn Sponsored Post (1.91:1)');
  const [campMaxWords, setCampMaxWords] = useState(120);
  const [campCta] = useState('Request Demo');
  const [campUploadedImages, setCampUploadedImages] = useState<string[]>([]);
  const [campCustomVideoUrl, setCampCustomVideoUrl] = useState('');
  const [isExpandingCopy, setIsExpandingCopy] = useState(false);

  // App Platform Mockup Simulator State
  const [simulatorAd, setSimulatorAd] = useState<B2BCampaignRequest | null>(null);

  // Social Posts Database State
  const [posts, setPosts] = useState<B2BPost[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [b2bPostStep, setB2bPostStep] = useState<1 | 2>(1);
  const [postHeadline, setPostHeadline] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postChannels, setPostChannels] = useState<string[]>(['Instagram', 'Facebook']);
  const [isPublishing, setIsPublishing] = useState(false);

  // Social Connections State
  const [socialAccounts, setSocialAccounts] = useState<SocialAccountCredential[]>([]);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialAccountCredential['platform'] | null>(null);
  const [connectHandle, setConnectHandle] = useState('');
  const [connectAccountId, setConnectAccountId] = useState('');
  const [connectToken, setConnectToken] = useState('');

  // B2B Captured Inbound Leads State
  const [b2bLeads, setB2BLeads] = useState<B2BLead[]>([]);

  const handleCreateB2BEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b2bEmpName || !b2bEmpEmail || !b2bEmpPassword) {
      alert("Please fill in Name, Email, and Password.");
      return;
    }
    const empRefId = `B2B-EMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newEmp = {
      id: `b2b-emp-${Date.now()}`,
      referenceId: empRefId,
      name: b2bEmpName,
      email: b2bEmpEmail,
      password: b2bEmpPassword,
      role: b2bEmpRole,
      phone: '+91 98765 43210',
      assignedLeadsCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newEmp, ...b2bEmployees];
    setB2BEmployees(updated);
    localStorage.setItem(`b2b_employees_${userKey}`, JSON.stringify(updated));

    // Save to mock_users so employee can login
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    mockUsers.push({
      _id: newEmp.id,
      referenceId: empRefId,
      name: b2bEmpName,
      email: b2bEmpEmail,
      password: b2bEmpPassword,
      customerType: 'B2B',
      accountType: 'B2B',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    setB2BEmpName(''); setB2BEmpEmail(''); setB2BEmpPassword('B2BPass2026!');
    alert(`✅ B2B Employee Account Provisioned!\nReference ID: ${empRefId}\nEmail: ${newEmp.email}\nPassword: ${newEmp.password}`);
  };

  // Load B2B Employees
  useEffect(() => {
    if (!userKey) return;
    const savedEmps = localStorage.getItem(`b2b_employees_${userKey}`);
    if (savedEmps) {
      try { setB2BEmployees(JSON.parse(savedEmps)); } catch { setB2BEmployees([]); }
    }
  }, [userKey]);

  // Load B2B Leads
  useEffect(() => {
    if (!userKey) return;
    const savedLeads = localStorage.getItem(`b2b_leads_${userKey}`);
    if (savedLeads) {
      try { 
        setB2BLeads(JSON.parse(savedLeads)); 
      } catch { 
        setB2BLeads([]); 
      }
    } else {
      const globalLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      const company = user?.companyName || user?.name || '';
      const matched = globalLeads.filter((l: any) => 
        (company && l.companyName?.toLowerCase() === company.toLowerCase()) ||
        l.userId === user?._id ||
        l.userEmail?.toLowerCase() === user?.email?.toLowerCase()
      );
      if (matched.length > 0) {
        setB2BLeads(matched);
      }
    }
  }, [userKey, user]);

  // Load B2B Products
  useEffect(() => {
    const savedProducts = localStorage.getItem(`b2b_products_${userKey}`);
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch { setProducts([]); }
    } else if (user.mainProduct) {
      const initial = [{
        id: 'PROD-1',
        name: user.mainProduct.name || 'Enterprise SaaS Solution',
        price: user.mainProduct.price || 499,
        category: user.mainProduct.category || 'Software',
        description: 'Core B2B Enterprise Offering',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop',
        createdDate: new Date().toLocaleDateString()
      }];
      setProducts(initial);
      localStorage.setItem(`b2b_products_${userKey}`, JSON.stringify(initial));
    }
  }, [user, userKey]);

  // Save B2B Products helper
  const saveProducts = (updated: B2BProduct[]) => {
    setProducts(updated);
    localStorage.setItem(`b2b_products_${userKey}`, JSON.stringify(updated));
  };

  // Load B2B Campaigns
  useEffect(() => {
    const saved = localStorage.getItem(`b2b_campaigns_${userKey}`);
    if (saved) {
      try { setCampaigns(JSON.parse(saved)); } catch { setCampaigns([]); }
    }
  }, [userKey]);

  const saveCampaigns = (updated: B2BCampaignRequest[]) => {
    setCampaigns(updated);
    localStorage.setItem(`b2b_campaigns_${userKey}`, JSON.stringify(updated));
  };

  // Load Posts from Database
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3000/api/social/posts?userId=${userKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error("Failed to load B2B database posts:", err));
  }, [user, userKey]);

  // Load Social Accounts
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`b2b_social_accounts_${userKey}`);
      setSocialAccounts(saved ? JSON.parse(saved) : []);
    } catch { setSocialAccounts([]); }
  }, [userKey]);

  const saveSocialAccounts = (updated: SocialAccountCredential[]) => {
    setSocialAccounts(updated);
    localStorage.setItem(`b2b_social_accounts_${userKey}`, JSON.stringify(updated));
  };

  // Handlers
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newP: B2BProduct = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCategory || 'Enterprise Software',
      description: newProdDesc || 'High performance corporate business solution.',
      imageUrl: newProdImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop',
      createdDate: new Date().toLocaleDateString()
    };
    saveProducts([...products, newP]);
    setNewProdName(''); setNewProdPrice(''); setNewProdCategory(''); setNewProdDesc(''); setNewProdImage('');
    alert("✅ Product asset added successfully to Enterprise Portfolio!");
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    saveProducts(products.filter(p => p.id !== id));
  };

  // Auto-Expand Marketing Text (Add More Words)
  const handleExpandCopy = () => {
    setIsExpandingCopy(true);
    const prod = products.find(p => p.id === selectedProdForAd);
    const base = campHeadline || prod?.name || user?.companyName || 'Enterprise Solution';
    
    let generated = "";
    if (campMaxWords <= 30) {
      generated = `🚀 Scale your workflow with ${base}. Automated intelligence, enterprise security, and 10x ROI for high-growth teams. Request a live demo today!`;
    } else if (campMaxWords <= 60) {
      generated = `⚡ Transform your enterprise infrastructure with ${base}. Designed for high-velocity teams, ${user?.companyName || 'our platform'} delivers automated workflows, bank-grade encryption, and seamless cloud integration. Eliminate manual bottlenecks and accelerate pipeline conversion. Tap below to speak with an enterprise specialist.`;
    } else if (campMaxWords <= 120) {
      generated = `🔥 Unlock unprecedented operational scale with ${base} by ${user?.companyName || 'Enterprise Solutions'}.\n\nBuilt specifically for modern enterprise organizations, our cutting-edge architecture empowers your team to automate complex processes, centralize data intelligence, and maximize measurable ROI.\n\n✨ Key Capabilities:\n• End-to-end cloud workflow automation\n• Real-time performance analytics & pipeline routing\n• Enterprise-grade 99.99% SLA & dedicated support\n\n👉 Click "Request Demo" now to schedule a personalized walkthrough with our solution architects!`;
    } else {
      generated = `🚀 Transform your enterprise operations with the industry-leading power of ${base}, engineered by ${user?.companyName || 'AD-HUNTER'}.\n\nIn today's fast-paced digital ecosystem, leading organizations demand speed, uncompromising reliability, and verifiable business impact. Our enterprise suite integrates seamlessly into your existing tech stack, replacing fragmented legacy tools with unified, intelligent automation.\n\n🌟 What Sets Us Apart:\n• ⚡ 10x Faster Execution: Accelerate pipeline delivery and streamline team collaboration without technical friction.\n• 🔒 Bank-Grade Security: SOC-2 certified protection, granular role-based permissions, and end-to-end encryption.\n• 📊 Measurable ROI: Gain actionable visibility into real-time metrics with comprehensive executive reporting dashboards.\n• 🤝 Dedicated 24/7 Enterprise SLA: Direct access to senior solution engineers and priority onboarding.\n\n💼 Join over 500+ top enterprises driving competitive advantage today. Click "Request Demo" to claim your executive consultation and custom product walkthrough!`;
    }

    setTimeout(() => {
      setCampDesc(generated);
      setIsExpandingCopy(false);
    }, 300);
  };

  // Direct Ad Creative Generation Handler
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdForAd || !campHeadline) {
      alert("Please select a target product and enter an ad headline.");
      return;
    }

    const prod = products.find(p => p.id === selectedProdForAd);
    
    // Choose Creative Media
    let mediaUrl = campUploadedImages[0] || prod?.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop';
    if (campAdType === 'Video') {
      mediaUrl = campCustomVideoUrl || B2B_VIDEO_PRESETS[0].url;
    }

    const newCamp: B2BCampaignRequest = {
      id: `CAMP-${Date.now().toString().slice(-4)}`,
      productId: selectedProdForAd,
      productName: prod?.name || 'Enterprise Product',
      adType: campAdType,
      purpose: 'B2B Lead Generation',
      description: campDesc || `Scale operations with ${prod?.name || 'our flagship product'}. Request a demo today.`,
      headline: campHeadline,
      cta: campCta,
      format: campFormat,
      maxWords: campMaxWords,
      status: 'APPROVED', // Directly ready for posting and simulation
      createdDate: new Date().toISOString().split('T')[0],
      creativeUrl: mediaUrl,
      productImages: campUploadedImages.length > 0 ? campUploadedImages : (prod?.imageUrl ? [prod.imageUrl] : [])
    };

    saveCampaigns([newCamp, ...campaigns]);
    setCampHeadline(''); 
    setCampDesc('');
    setCampUploadedImages([]);
    setCampCustomVideoUrl('');
    alert(`✨ B2B ${campAdType} Ad Creative Generated & Approved!\n\nYour campaign asset for "${prod?.name}" is ready for multi-app simulation and social dispatch.`);
  };

  const handleConnectSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingPlatform || !connectHandle || !connectAccountId || !connectToken) return;
    try {
      await fetch('http://localhost:3000/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userKey,
          platform: connectingPlatform,
          handle: connectHandle,
          accountId: connectAccountId,
          accessToken: connectToken
        })
      });
    } catch (err) {
      console.warn("Backend sync failed, saved locally.");
    }
    const updated = [
      ...socialAccounts.filter(a => a.platform !== connectingPlatform),
      { platform: connectingPlatform, handle: connectHandle, accountId: connectAccountId, accessToken: connectToken, isConnected: true, connectedAt: new Date().toISOString() }
    ] as SocialAccountCredential[];
    saveSocialAccounts(updated);
    setConnectingPlatform(null); setConnectHandle(''); setConnectAccountId(''); setConnectToken('');
    alert(`✅ ${connectingPlatform} connected!`);
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postHeadline || postChannels.length === 0) {
      alert("Please provide a headline and select at least one channel.");
      return;
    }
    setIsPublishing(true);
    const resolvedMediaUrl = postMediaUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop';
    try {
      const res = await fetch('http://localhost:3000/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userKey,
          channels: postChannels,
          headline: postHeadline,
          caption: postCaption,
          mediaUrl: resolvedMediaUrl,
          targetUrl: user?.website || 'https://yourb2bsite.com',
          status: 'PUBLISHED'
        })
      });
      const data = await res.json();
      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
      }
      alert("🚀 B2B Social Post published successfully to live channels!");
      setIsPublishModalOpen(false);
      setPostHeadline(''); setPostCaption(''); setPostMediaUrl('');
    } catch (err: any) {
      alert("Failed to publish post: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete post record?")) return;
    try {
      await fetch(`http://localhost:3000/api/social/posts/${postId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Delete API failed:", err);
    }
    setPosts(prev => prev.filter(p => p.id !== postId && p._id !== postId));
  };

  // Helper to map B2B format string to PlatformFormat
  const getMockupPlatform = (formatStr?: string): PlatformFormat => {
    if (!formatStr) return 'INSTAGRAM_POST';
    const lower = formatStr.toLowerCase();
    if (lower.includes('reel') || lower.includes('story')) return 'INSTAGRAM_REEL';
    if (lower.includes('short')) return 'YOUTUBE_SHORT';
    if (lower.includes('youtube')) return 'YOUTUBE_VIDEO';
    if (lower.includes('tiktok')) return 'TIKTOK_VIDEO';
    if (lower.includes('facebook') || lower.includes('4:5')) return 'FACEBOOK_FEED';
    if (lower.includes('x') || lower.includes('twitter') || lower.includes('linkedin')) return 'TWITTER_X';
    return 'INSTAGRAM_POST';
  };

  return (
    <div className="min-h-screen bg-white text-black flex font-sans selection:bg-red-600 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-zinc-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-black">
                AD<span className="text-red-600 font-black">HUNTER</span>
              </span>
            </Link>
            
            <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Business ID</div>
              <div className="text-xs font-mono font-black text-red-600">{user?.referenceId || 'B2B-CLIENT'}</div>
              <div className="text-[9px] font-bold text-zinc-500 truncate">{user?.companyName || 'Enterprise Account'}</div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'products', label: 'Asset Manager', icon: ShoppingBag },
              { id: 'campaigns', label: 'Create Ads & Videos', icon: Sparkles },
              { id: 'posts', label: 'Platform Posts', icon: Share2 },
              { id: 'social', label: 'Social Accounts', icon: Link2 },
              { id: 'leads', label: 'Captured Leads', icon: Users },
              { id: 'employees', label: 'Team & Employees', icon: Shield },
              { id: 'profile', label: 'Business Profile', icon: User }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' 
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black text-white font-black flex items-center justify-center rounded-xl text-xs">
              {user.companyName ? user.companyName[0].toUpperCase() : 'B'}
            </div>
            <div className="truncate">
              <div className="font-black text-xs text-black truncate">{user.companyName || user.name}</div>
              <div className="text-[10px] text-zinc-500 font-semibold truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={() => { dispatch(logOut()); navigate('/login'); }}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-red-600 hover:bg-red-50 w-full p-2.5 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-zinc-50/50">
        
        {/* 1. OVERVIEW VIEW */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5" />
                  <span>B2B Multi-Product Enterprise Suite</span>
                </div>
                <h1 className="text-3xl font-black text-black font-display tracking-tight">
                  Welcome back, {user.companyName || user.name}!
                </h1>
                <p className="text-xs text-zinc-600 font-semibold mt-1">
                  Manage product assets, create B2B performance ad campaigns, and trigger direct social publishing.
                </p>
              </div>

              <button 
                onClick={() => {
                  setPostHeadline(`Scale with ${products[0]?.name || 'Our Flagship Solution'}`);
                  setPostCaption(`🚀 Drive measurable ROI with ${products[0]?.name || 'our platform'}.\n\nRequest a personalized demo today!`);
                  setPostMediaUrl(products[0]?.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop');
                  setIsPublishModalOpen(true);
                }}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Launch New Post</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Active Products', val: products.length, sub: 'In Asset Portfolio' },
                { label: 'Ad Campaigns', val: campaigns.length, sub: 'Active Creative Drafts' },
                { label: 'Captured Leads', val: b2bLeads.length, sub: 'Inbound Inquiries' },
                { label: 'Published Posts', val: posts.length, sub: 'Live on Social Channels' },
                { label: 'Social Accounts', val: socialAccounts.length, sub: 'Connected Channels' }
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-1 shadow-sm">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{stat.label}</h4>
                  <div className="text-2xl font-black text-black font-display">{stat.val}</div>
                  <div className="text-[10px] text-zinc-500 font-semibold">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Campaigns Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="font-black text-base text-black">Recent Creative Campaigns</h3>
                <button 
                  onClick={() => setActiveView('campaigns')}
                  className="text-xs font-black text-red-600 hover:text-red-700 flex items-center gap-1 uppercase"
                >
                  <span>Open Creator Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.slice(0, 3).map((camp) => (
                  <div key={camp.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                      {camp.adType === 'Video' ? (
                        <video src={camp.creativeUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={camp.creativeUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-red-600">{camp.productName}</div>
                      <h4 className="font-black text-sm text-black truncate">{camp.headline}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulatorAd(camp)}
                      className="w-full py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview in App Simulator</span>
                    </button>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <div className="col-span-3 py-8 text-center text-zinc-400 font-medium text-xs">
                    No campaigns created yet. Click "Open Creator Studio" to generate your first ad creative!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCT ASSETS VIEW */}
        {activeView === 'products' && (
          <div className="space-y-8">
            <div className="border-b border-zinc-200 pb-6">
              <h1 className="text-3xl font-black text-black font-display tracking-tight">Enterprise Asset Portfolio</h1>
              <p className="text-xs text-zinc-600 font-semibold mt-1">Register and maintain your corporate product lines and SaaS offerings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Add Product Form */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-base text-black border-b border-zinc-100 pb-2">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Product / Tool Name *</label>
                    <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="e.g. Apex Analytics Pro" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Price (₹ / $) *</label>
                      <input type="number" required value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="499" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Category</label>
                      <input type="text" value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} placeholder="Cloud SaaS" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Product Image URL</label>
                    <input type="url" value={newProdImage} onChange={e => setNewProdImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600 font-mono text-[11px]" />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                    <textarea value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} rows={3} placeholder="Key features, enterprise capabilities..." className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-red-600" />
                  </div>
                  <button type="submit" className="btn-shimmer w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20">
                    Add Product Asset
                  </button>
                </form>
              </div>

              {/* Products List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-black text-base text-black">Registered Product Assets ({products.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="p-5 bg-white border border-zinc-200 rounded-3xl space-y-3 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="h-32 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                          <img src={p.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-base text-black">{p.name}</h4>
                            <span className="font-mono font-black text-red-600">₹{p.price.toLocaleString()}</span>
                          </div>
                          <span className="inline-block px-2.5 py-0.5 bg-zinc-100 text-zinc-600 font-bold text-[10px] rounded-lg mt-1">{p.category}</span>
                          <p className="text-xs text-zinc-500 font-medium mt-2 line-clamp-2">{p.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProdForAd(p.id);
                            setActiveView('campaigns');
                          }}
                          className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl uppercase tracking-wider"
                        >
                          Create Ad ⚡
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-red-600 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CREATE ADS & VIDEOS WORKSPACE */}
        {activeView === 'campaigns' && (
          <div className="space-y-8">
            <div className="border-b border-zinc-200 pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct AI Studio Creator</span>
              </div>
              <h1 className="text-3xl font-black text-black font-display tracking-tight">Create Ads & Video Campaigns</h1>
              <p className="text-xs text-zinc-600 font-semibold mt-1">
                Generate high-converting image banners, multi-format motion reels, and interactive social ads with 1 click.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Direct Ad Generation Form */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="border-b border-zinc-100 pb-3">
                  <h3 className="font-black text-lg text-black font-display">Ad Creative Generator</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Customize copy, format, and media.</p>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Target Product *</label>
                    <select 
                      required 
                      value={selectedProdForAd} 
                      onChange={e => setSelectedProdForAd(e.target.value)} 
                      className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                    >
                      <option value="">Select a product from portfolio...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Ad Output Type</label>
                      <select 
                        value={campAdType} 
                        onChange={e => setCampAdType(e.target.value as any)} 
                        className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                      >
                        <option value="Image">🖼️ Image Banner</option>
                        <option value="Video">🎬 Video Motion Ad</option>
                        <option value="Both">✨ Both Image & Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Platform Format</label>
                      <select 
                        value={campFormat} 
                        onChange={e => setCampFormat(e.target.value)} 
                        className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600"
                      >
                        <option value="LinkedIn Sponsored Post (1.91:1)">💼 LinkedIn Feed (1.91:1)</option>
                        <option value="Instagram Post (1:1)">📸 Instagram Post (1:1 Square)</option>
                        <option value="Instagram Reel / Story (9:16)">📱 Instagram Reel (9:16)</option>
                        <option value="YouTube Shorts (9:16)">▶️ YouTube Shorts (9:16)</option>
                        <option value="YouTube Video Ad (16:9)">🖥️ YouTube Video (16:9)</option>
                        <option value="Facebook Feed (4:5)">👥 Facebook Feed (4:5)</option>
                        <option value="X (Twitter) Feed (16:9)">𝕏 X / Twitter (16:9)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Ad Headline *</label>
                    <input 
                      type="text" 
                      required 
                      value={campHeadline} 
                      onChange={e => setCampHeadline(e.target.value)} 
                      placeholder="e.g. Accelerate Enterprise Cloud ROI by 10x" 
                      className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600" 
                    />
                  </div>

                  {/* Word Count Limit Selector & Copy Studio */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold uppercase tracking-wider text-zinc-600">Marketing Text & Copy</label>
                      <div className="flex items-center gap-1">
                        {[30, 60, 120, 250].map((wc) => (
                          <button
                            key={wc}
                            type="button"
                            onClick={() => setCampMaxWords(wc)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all ${
                              campMaxWords === wc
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            {wc}w
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <textarea 
                        value={campDesc} 
                        onChange={e => setCampDesc(e.target.value)} 
                        rows={4} 
                        placeholder="Describe key benefits, enterprise ROI, and value propositions..." 
                        className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-red-600 text-xs" 
                      />
                      <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-400">
                        <span>Words: <strong className="text-black font-black">{campDesc.trim() ? campDesc.trim().split(/\s+/).length : 0}</strong> / {campMaxWords} max</span>
                        <button
                          type="button"
                          disabled={isExpandingCopy}
                          onClick={handleExpandCopy}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center gap-1 text-[10px] transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isExpandingCopy ? 'Expanding...' : '✨ Add More Words (Auto-Expand)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Video Preset Chooser (If Video Selected) */}
                  {campAdType === 'Video' && (
                    <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      <label className="block text-[10px] font-black uppercase text-zinc-500">
                        🎬 Motion Video Template Preset
                      </label>
                      <select
                        value={campCustomVideoUrl}
                        onChange={e => setCampCustomVideoUrl(e.target.value)}
                        className="w-full p-2 bg-white border border-zinc-300 rounded-xl font-bold text-xs text-black"
                      >
                        {B2B_VIDEO_PRESETS.map((vp) => (
                          <option key={vp.id} value={vp.url}>{vp.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Publish Creative Now</span>
                  </button>
                </form>
              </div>

              {/* Active Campaigns Library with Simulator & Dispatch */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg text-black">Active B2B Creatives ({campaigns.length})</h3>
                  <span className="text-xs text-zinc-500 font-medium">Ready for multi-platform dispatch</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map(c => (
                    <div key={c.id} className="p-5 bg-white border border-zinc-200 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-inner">
                          {c.adType === 'Video' ? (
                            <video src={c.creativeUrl} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={c.creativeUrl} alt="" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-wider">
                            {c.adType === 'Video' ? '🎬 Motion Video' : '🖼️ Image Banner'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-red-600">{c.productName}</div>
                          <h4 className="font-black text-base text-black mt-0.5">{c.headline}</h4>
                          <p className="text-xs text-zinc-500 font-medium mt-1 line-clamp-2">{c.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-zinc-100">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSimulatorAd(c)}
                            className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-600" />
                            <span>App Simulator</span>
                          </button>

                          <button 
                            onClick={() => {
                              setPostHeadline(c.headline);
                              setPostCaption(`🚀 ${c.headline}\n\n${c.description}\n\n👉 Learn more today.`);
                              setPostMediaUrl(c.creativeUrl || '');
                              setIsPublishModalOpen(true);
                            }}
                            className="btn-shimmer py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 uppercase tracking-wider"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {campaigns.length === 0 && (
                    <div className="col-span-2 py-16 text-center bg-white rounded-3xl border border-dashed border-zinc-300 space-y-3">
                      <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-2xl">✨</div>
                      <h4 className="font-black text-base text-black">No Campaigns Created Yet</h4>
                      <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto">
                        Use the generator form to create your first image or video ad for your product line.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. PLATFORM SOCIAL POSTS VIEW */}
        {activeView === 'posts' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-zinc-200 pb-6">
              <div>
                <h1 className="text-3xl font-black text-black font-display tracking-tight">Social Posts Database</h1>
                <p className="text-xs text-zinc-600 font-semibold mt-1">Live omnichannel posts published to connected social handles.</p>
              </div>
              <button 
                onClick={() => setIsPublishModalOpen(true)}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Publish New Post</span>
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-black uppercase text-zinc-500">
                    <th className="p-4">Media</th>
                    <th className="p-4">Headline & Caption</th>
                    <th className="p-4">Channels</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {posts.map(post => (
                    <tr key={post.id || post._id} className="hover:bg-zinc-50/50">
                      <td className="p-4">
                        <img src={post.mediaUrl} alt="" className="w-14 h-14 object-cover rounded-xl border border-zinc-200" />
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-black text-black">{post.headline}</div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">{post.caption}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {post.channels.map(ch => (
                            <span key={ch} className="px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md font-bold text-[9px]">{ch}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-black rounded-lg text-[9px] uppercase">{post.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeletePost(post.id || post._id || '')} className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-400 font-semibold">No published posts found. Launch a campaign or dispatch from the creative studio!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CONNECTED SOCIAL ACCOUNTS */}
        {activeView === 'social' && (
          <div className="space-y-8">
            <div className="border-b border-zinc-200 pb-6">
              <h1 className="text-3xl font-black text-black font-display tracking-tight">Social Accounts</h1>
              <p className="text-xs text-zinc-600 font-semibold mt-1">Connect corporate handles for direct social media publishing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SOCIAL_CHANNELS.map(ch => {
                const acc = socialAccounts.find(a => a.platform === ch.id);
                return (
                  <div key={ch.id} className="p-6 bg-white border border-zinc-200 rounded-3xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${ch.color}`}>{ch.badge}</span>
                      {acc?.isConnected ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-md uppercase">Connected</span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 font-bold text-[10px] rounded-md uppercase">Disconnected</span>
                      )}
                    </div>

                    {acc?.isConnected ? (
                      <div className="space-y-1">
                        <div className="font-black text-sm text-black">@{acc.handle}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">Account ID: {acc.accountId}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold pt-1">✓ Ready for API Publishing</div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        Authorize {ch.name} to enable automated campaign publishing and lead attribution tracking.
                      </p>
                    )}

                    <button
                      onClick={() => {
                        setConnectingPlatform(ch.id);
                        setConnectHandle(acc?.handle || '');
                        setConnectAccountId(acc?.accountId || '');
                      }}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-black text-xs rounded-xl uppercase tracking-wider transition-colors"
                    >
                      {acc?.isConnected ? 'Reconfigure Settings' : `Connect ${ch.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. CAPTURED LEADS WORKSPACE */}
        {activeView === 'leads' && (
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <Users className="w-3 h-3" />
                  <span>B2B Pipeline & Prospect Engine</span>
                </div>
                <h2 className="text-2xl font-black text-black font-display tracking-tight">Captured Inbound Leads</h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Prospects and enterprise clients who clicked "Request Demo" or engaged with your published ads.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-red-50 text-red-600 font-mono text-xs font-black rounded-xl border border-red-200">
                  {b2bLeads.length} Total {b2bLeads.length === 1 ? 'Lead' : 'Leads'}
                </span>
              </div>
            </div>

            {b2bLeads.length > 0 ? (
              <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-black uppercase text-[10px]">
                      <th className="p-4">Lead ID</th>
                      <th className="p-4">Prospect Name</th>
                      <th className="p-4">Contact Details</th>
                      <th className="p-4">Campaign / Product</th>
                      <th className="p-4">Assigned Staff</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-medium">
                    {b2bLeads.map((lead, idx) => (
                      <tr key={lead.id || `lead-${idx}`} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-red-600">{lead.id}</td>
                        <td className="p-4 font-black text-black">{lead.name}</td>
                        <td className="p-4">
                          <div className="font-bold text-zinc-800">{lead.phone}</div>
                          <div className="text-[11px] text-zinc-500 font-medium">{lead.email}</div>
                        </td>
                        <td className="p-4 font-semibold text-black max-w-xs truncate">
                          {lead.productName || lead.adName || 'Enterprise Campaign'}
                        </td>
                        <td className="p-4 font-mono text-xs text-zinc-600">
                          {lead.assignedTo || 'Auto-Assigned'}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                            {lead.status || 'NEW'}
                          </span>
                        </td>
                        <td className="p-4 text-[10px] text-zinc-400 font-mono">
                          {lead.capturedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Clean Empty State Message */
              <div className="py-16 px-6 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-300 space-y-4 max-w-xl mx-auto my-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
                  📥
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-black">No Leads Captured Yet</h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-md mx-auto">
                    When prospective business buyers or clients engage with your published ads and click <strong>"Request Demo"</strong>, their verified contact information will appear here automatically.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('campaigns')}
                    className="btn-shimmer px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20"
                  >
                    Launch Campaign to Generate Leads →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. TEAM & EMPLOYEES PROVISIONING */}
        {activeView === 'employees' && (
          <div className="space-y-8">
            <div className="border-b border-zinc-200 pb-6">
              <h1 className="text-3xl font-black text-black font-display tracking-tight">Team & Staff Provisioning</h1>
              <p className="text-xs text-zinc-600 font-semibold mt-1">Create and manage employee logins for your corporate enterprise account.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-base text-black border-b border-zinc-100 pb-2">Generate Staff Credentials</h3>
                <form onSubmit={handleCreateB2BEmployee} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Employee Name *</label>
                    <input type="text" required value={b2bEmpName} onChange={e => setB2BEmpName(e.target.value)} placeholder="e.g. Johnathan Doe" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Corporate Email *</label>
                    <input type="email" required value={b2bEmpEmail} onChange={e => setB2BEmpEmail(e.target.value)} placeholder="e.g. john@apexcloud.com" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Login Password *</label>
                    <input type="text" required value={b2bEmpPassword} onChange={e => setB2BEmpPassword(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-mono font-bold text-red-600 focus:outline-none focus:border-red-600" />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-500 mb-1">Role / Department</label>
                    <select value={b2bEmpRole} onChange={e => setB2BEmpRole(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600">
                      <option value="B2B Lead Specialist">B2B Lead Specialist</option>
                      <option value="Campaign Marketing Manager">Campaign Marketing Manager</option>
                      <option value="Customer Success Lead">Customer Success Lead</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-shimmer w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md">
                    Provision Staff Account
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-black text-base text-black">Active Team Members ({b2bEmployees.length})</h3>
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-black uppercase text-zinc-500">
                        <th className="p-4">Reference ID</th>
                        <th className="p-4">Employee Details</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {b2bEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-zinc-50/50">
                          <td className="p-4 font-mono font-bold text-red-600">{emp.referenceId}</td>
                          <td className="p-4">
                            <div className="font-black text-black">{emp.name}</div>
                            <div className="text-[11px] text-zinc-400">{emp.email}</div>
                          </td>
                          <td className="p-4 font-bold text-zinc-700">{emp.role}</td>
                          <td className="p-4 font-mono text-zinc-600 font-bold">{emp.password}</td>
                        </tr>
                      ))}
                      {b2bEmployees.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-zinc-400 font-semibold">No staff provisioned yet. Use the form to generate team logins!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 8. BUSINESS PROFILE VIEW */}
        {activeView === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6 max-w-xl">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-2xl font-black text-black font-display">B2B Corporate Profile</h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Manage company details, verification status, and credentials.</p>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Company Name:</span>
                <span className="font-black text-black">{user?.companyName || user?.name || 'B2B Enterprise Client'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Registered Email:</span>
                <span className="font-bold text-black">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Registration ID / GSTIN:</span>
                <span className="font-mono font-bold text-red-600">{user?.registrationId || 'VERIFIED-REG-2026'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Director Aadhar Status:</span>
                <span className="font-mono font-bold text-emerald-600">✓ Verified ({user?.aadharNumber ? `**** ${user.aadharNumber.slice(-4)}` : 'On File'})</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Account Tier:</span>
                <span className="font-black text-red-600">Enterprise Plan (B2B Multi-Seat)</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Team Staff Count:</span>
                <span className="font-mono font-black text-black">{b2bEmployees.length} Provisioned Logins</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 📱 APP PLATFORM AD MOCKUP MODAL */}
      {simulatorAd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-zinc-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Interactive Multi-App Simulator</span>
                <h3 className="font-black text-black text-lg">{simulatorAd.headline}</h3>
              </div>
              <button 
                onClick={() => setSimulatorAd(null)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <AppPlatformAdMockup
                mediaUrl={simulatorAd.creativeUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop'}
                isVideo={simulatorAd.adType === 'Video'}
                brandName={user?.companyName || user?.name || 'Enterprise Brand'}
                headline={simulatorAd.headline}
                description={simulatorAd.description}
                productName={simulatorAd.productName || 'Enterprise Solution'}
                ctaText={simulatorAd.cta || 'Request Demo'}
                initialFormat={getMockupPlatform(simulatorAd.format)}
                allowFormatSwitching={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: 2-STEP OMNICHANNEL SOCIAL PUBLISHING */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-zinc-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                {b2bPostStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setB2bPostStep(1)}
                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Omnichannel Social Dispatch</span>
                  <h3 className="font-black text-black text-lg">
                    {b2bPostStep === 1 ? 'Step 1: Compose Post' : 'Step 2: Review & Dispatch'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => { setIsPublishModalOpen(false); setB2bPostStep(1); }}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {b2bPostStep === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); setB2bPostStep(2); }} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Post Headline *</label>
                  <input type="text" required value={postHeadline} onChange={e => setPostHeadline(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Caption / Copy</label>
                  <textarea value={postCaption} onChange={e => setPostCaption(e.target.value)} rows={3} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Media URL (Image / Video)</label>
                  <input type="url" value={postMediaUrl} onChange={e => setPostMediaUrl(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-[11px] focus:outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Target Channels</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOCIAL_CHANNELS.map(ch => {
                      const isSelected = postChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) setPostChannels(postChannels.filter(c => c !== ch.id));
                            else setPostChannels([...postChannels, ch.id]);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-red-50 border-red-300 text-red-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                          }`}
                        >
                          <span>{ch.badge}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button type="submit" className="btn-shimmer w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase tracking-wider text-xs">
                  Continue to Final Review →
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                  <div className="font-bold text-zinc-500 uppercase text-[10px]">Headline:</div>
                  <div className="font-black text-black text-sm">{postHeadline}</div>
                  <div className="font-bold text-zinc-500 uppercase text-[10px] pt-1">Channels:</div>
                  <div className="flex gap-1 flex-wrap">
                    {postChannels.map(ch => (
                      <span key={ch} className="px-2.5 py-0.5 bg-white border border-zinc-200 rounded-md font-bold text-[10px]">{ch}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setB2bPostStep(1)}
                    className="w-1/2 py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handlePublishPost}
                    className="btn-shimmer w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs shadow-md shadow-red-600/20"
                  >
                    {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔗 MODAL: SOCIAL CONNECT CREDENTIALS */}
      {connectingPlatform && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-zinc-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-black text-black text-lg">Connect {connectingPlatform} Handle</h3>
              <button onClick={() => setConnectingPlatform(null)} className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConnectSocial} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Brand Handle *</label>
                <input type="text" required value={connectHandle} onChange={e => setConnectHandle(e.target.value)} placeholder="@yourcorporatebrand" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">Account ID *</label>
                <input type="text" required value={connectAccountId} onChange={e => setConnectAccountId(e.target.value)} placeholder="act_8392019482" className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-mono focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-600 mb-1">API Access Token *</label>
                <input type="password" required value={connectToken} onChange={e => setConnectToken(e.target.value)} placeholder="EAAB..." className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-mono focus:outline-none focus:border-red-600" />
              </div>
              <button type="submit" className="btn-shimmer w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-md shadow-red-600/20">
                Save & Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
