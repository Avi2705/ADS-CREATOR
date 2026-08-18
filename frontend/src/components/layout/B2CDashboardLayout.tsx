import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logOut, setCredentials } from '../../features/auth/authSlice';
import { 
  Sparkles, Image, Video, Lock, ArrowRight, 
  LayoutDashboard, ShoppingBag, Send, 
  Film, Share2, Users, CreditCard, User, LogOut, Flame,
  Upload, Link2, Plus, Check, Eye, Trash2, Globe, X
} from 'lucide-react';


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

export interface B2CPost {
  id: string;
  adId?: string;
  headline: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  channels: string[];
  targetUrl: string;
  status: 'PUBLISHED' | 'SCHEDULED';
  scheduledDate?: string;
  publishedDate: string;
  impressions: number;
  clicks: number;
  leads: number;
}

export interface SocialAccountCredential {
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'Twitter';
  handle: string;
  accountId: string;
  accessToken: string;
  isConnected: boolean;
  connectedAt?: string;
}

const SOCIAL_CHANNELS = [
  {
    id: 'Instagram' as const,
    name: 'Instagram',
    badge: '📷 Instagram',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    setupHint: 'Instagram Business Account ID + Long-lived Access Token from Meta for Developers',
    apiSupported: true
  },
  {
    id: 'Facebook' as const,
    name: 'Facebook',
    badge: '👥 Facebook',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    setupHint: 'Facebook Page ID + Page Access Token from Meta Business Suite',
    apiSupported: true
  },
  {
    id: 'TikTok' as const,
    name: 'TikTok',
    badge: '🎵 TikTok',
    color: 'bg-zinc-100 text-black border-zinc-300',
    setupHint: 'TikTok for Developers — requires separate app review',
    apiSupported: false
  },
  {
    id: 'YouTube' as const,
    name: 'YouTube Shorts',
    badge: '🔴 YouTube Shorts',
    color: 'bg-red-50 text-red-600 border-red-200',
    setupHint: 'YouTube Data API v3 — requires separate Google Cloud project',
    apiSupported: false
  },
  {
    id: 'Twitter' as const,
    name: 'X / Twitter',
    badge: '✖️ X / Twitter',
    color: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    setupHint: 'X Developer App — requires Elevated/Pro access tier',
    apiSupported: false
  }
];


export default function B2CDashboardLayout() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<
    'overview' | 'product' | 'requests' | 'ads' | 'posts' | 'leads' | 'subscription' | 'profile' | 'social'
  >('overview');

  // Customer state - strictly scoped to logged-in user
  const [productName, setProductName] = useState(user?.mainProduct?.name || user?.productName || '');
  const [productDesc, setProductDesc] = useState(user?.description || user?.productDescription || '');
  const [productCat, setProductCat] = useState(user?.mainProduct?.category || user?.productCategory || 'General');
  const [productPrice, setProductPrice] = useState(user?.mainProduct?.price || 0);
  const [productDiscount, setProductDiscount] = useState(user?.discount || 0);
  const [targetAudience, setTargetAudience] = useState(user?.targetAudience || '');
  const [brandName, setBrandName] = useState(user?.companyName || user?.name || '');

  // Keep state perfectly in sync whenever user switches
  useEffect(() => {
    if (user) {
      setProductName(user?.mainProduct?.name || user?.productName || '');
      setProductDesc(user?.description || user?.productDescription || '');
      setProductCat(user?.mainProduct?.category || user?.productCategory || 'General');
      setProductPrice(user?.mainProduct?.price || 0);
      setProductDiscount(user?.discount || 0);
      setTargetAudience(user?.targetAudience || '');
      setBrandName(user?.companyName || user?.name || '');
    }
  }, [user]);

  // Ad Requests State - strictly isolated to user._id / user.email
  const [adRequests, setAdRequests] = useState<AdRequest[]>([]);
  
  // Create Request Form State (Customer submission)
  const [reqAdType, setReqAdType] = useState<'Image' | 'Video' | 'Both'>('Image');
  const [reqPurpose, setReqPurpose] = useState('Product Promotion');
  const [reqDesc, setReqDesc] = useState('');
  const [reqHeadline, setReqHeadline] = useState('');
  const [reqCta] = useState('Shop Now');
  const [reqMaxWords] = useState(60);
  const [reqStyle, setReqStyle] = useState('Modern');
  const [reqFormat, setReqFormat] = useState('Instagram Post (1:1)');

  // Multiple Product Images uploaded by customer
  const [reqUploadedImages, setReqUploadedImages] = useState<string[]>([]);
  const [reqUrlInput, setReqUrlInput] = useState('');

  // Admin-Only Creator Modal State
  const [isAdminCreatingAd, setIsAdminCreatingAd] = useState<null | 'IMAGE' | 'VIDEO'>(null);
  const [adminHeadline, setAdminHeadline] = useState('');
  const [adminImageUrl, setAdminImageUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');
  const [adminTargetReqId, setAdminTargetReqId] = useState('');

  // Post & Publish state - strictly isolated per customer
  const [posts, setPosts] = useState<B2CPost[]>([]);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [postHeadline, setPostHeadline] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postMediaType, setPostMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [postChannels, setPostChannels] = useState<string[]>(['Instagram', 'Facebook']);
  const [postTargetUrl, setPostTargetUrl] = useState('https://yourbrand.com');
  const [postScheduleType, setPostScheduleType] = useState<'NOW' | 'LATER'>('NOW');
  const [postScheduledDate, setPostScheduledDate] = useState('');
  const [selectedAdForPost, setSelectedAdForPost] = useState<AdRequest | null>(null);
  const [previewingPost, setPreviewingPost] = useState<B2CPost | null>(null);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('ALL');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; postId?: string; error?: string }> | null>(null);

  // Social Account Connections — stored per user in localStorage
  const [socialAccounts, setSocialAccounts] = useState<SocialAccountCredential[]>([]);
  // Connect form state
  const [connectingPlatform, setConnectingPlatform] = useState<SocialAccountCredential['platform'] | null>(null);
  const [connectHandle, setConnectHandle] = useState('');
  const [connectAccountId, setConnectAccountId] = useState('');
  const [connectToken, setConnectToken] = useState('');
  const [connectSaving, setConnectSaving] = useState(false);

  // Check if current user has Admin privileges
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'BUSINESS_OWNER');

  // Load requests specific to this customer ONLY
  useEffect(() => {
    if (!user) {
      setAdRequests([]);
      return;
    }
    const userKey = user._id || user.email || 'b2c-default';
    const savedRequests = localStorage.getItem(`requests_${userKey}`);
    if (savedRequests) {
      try {
        setAdRequests(JSON.parse(savedRequests));
      } catch {
        setAdRequests([]);
      }
    } else {
      setAdRequests([]);
    }
  }, [user]);

  const saveRequests = (updated: AdRequest[]) => {
    if (!user) return;
    const userKey = user._id || user.email || 'b2c-default';
    setAdRequests(updated);
    localStorage.setItem(`requests_${userKey}`, JSON.stringify(updated));
  };

  // Load posts specific to this customer ONLY
  useEffect(() => {
    if (!user) {
      setPosts([]);
      return;
    }
    const userKey = user._id || user.email || 'b2c-default';
    const savedPosts = localStorage.getItem(`posts_${userKey}`);
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch {
        setPosts([]);
      }
    } else {
      setPosts([]);
    }
  }, [user]);

  const savePosts = (updated: B2CPost[]) => {
    if (!user) return;
    const userKey = user._id || user.email || 'b2c-default';
    setPosts(updated);
    localStorage.setItem(`posts_${userKey}`, JSON.stringify(updated));
  };

  const handleOpenPostModal = (ad?: AdRequest) => {
    if (ad) {
      setSelectedAdForPost(ad);
      setPostHeadline(ad.headline);
      setPostMediaUrl(ad.creativeUrl || '');
      setPostMediaType(ad.adType === 'Video' ? 'VIDEO' : 'IMAGE');
      setPostCaption(`🔥 ${ad.headline}\n\nMeet the all-new ${productName} by ${brandName}! ${ad.description}\n\n✨ Tap to shop official collection:\n👉 ${user?.website || 'https://' + (brandName || 'brand').toLowerCase().replace(/\s+/g, '') + '.com'}\n\n#${(brandName || 'brand').replace(/\s+/g, '')} #${(productCat || 'Product').replace(/\s+/g, '')} #DropAlert`);
    } else {
      setSelectedAdForPost(null);
      const firstCreative = adRequests.find(r => r.creativeUrl);
      setPostHeadline(`${brandName || 'Brand'} — ${productName || 'Exclusive Product'}`);
      setPostMediaUrl(firstCreative?.creativeUrl || user?.mainProduct?.mediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');
      setPostMediaType('IMAGE');
      setPostCaption(`🔥 Special Launch: ${productName} by ${brandName}!\n\nEngineered for maximum style and performance.\n\n👉 Shop Now: ${user?.website || 'https://yourbrand.com'}\n\n#${(brandName || 'Brand').replace(/\s+/g, '')} #NewDrop`);
    }
    setPostChannels(['Instagram', 'TikTok', 'Facebook']);
    setPostTargetUrl(user?.website || 'https://yourbrand.com');
    setPostScheduleType('NOW');
    setPostScheduledDate(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setIsPostingModalOpen(true);
  };

  const handleToggleChannel = (ch: string) => {
    setPostChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  // Load/save social account connections per user
  useEffect(() => {
    if (!user) { setSocialAccounts([]); return; }
    const userKey = user._id || user.email || 'b2c-default';
    try {
      const saved = localStorage.getItem(`social_accounts_${userKey}`);
      setSocialAccounts(saved ? JSON.parse(saved) : []);
    } catch { setSocialAccounts([]); }
  }, [user]);

  const saveSocialAccounts = (updated: SocialAccountCredential[]) => {
    if (!user) return;
    const userKey = user._id || user.email || 'b2c-default';
    setSocialAccounts(updated);
    localStorage.setItem(`social_accounts_${userKey}`, JSON.stringify(updated));
  };

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingPlatform || !connectHandle || !connectAccountId || !connectToken) {
      alert('Please fill all required fields.');
      return;
    }
    setConnectSaving(true);
    try {
      // Persist to backend DB
      const res = await fetch('http://localhost:3000/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.email,
          platform: connectingPlatform,
          handle: connectHandle,
          accountId: connectAccountId,
          accessToken: connectToken
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      const updated = [
        ...socialAccounts.filter(a => a.platform !== connectingPlatform),
        { platform: connectingPlatform, handle: connectHandle, accountId: connectAccountId, accessToken: connectToken, isConnected: true, connectedAt: new Date().toISOString() }
      ] as SocialAccountCredential[];
      saveSocialAccounts(updated);
      setConnectingPlatform(null);
      setConnectHandle(''); setConnectAccountId(''); setConnectToken('');
      alert(`✅ ${connectingPlatform} account @${connectHandle} successfully connected!`);
    } catch (err: any) {
      // Still save locally even if backend unreachable
      const updated = [
        ...socialAccounts.filter(a => a.platform !== connectingPlatform),
        { platform: connectingPlatform, handle: connectHandle, accountId: connectAccountId, accessToken: connectToken, isConnected: true, connectedAt: new Date().toISOString() }
      ] as SocialAccountCredential[];
      saveSocialAccounts(updated);
      setConnectingPlatform(null);
      setConnectHandle(''); setConnectAccountId(''); setConnectToken('');
      alert(`✅ ${connectingPlatform} account @${connectHandle} connected locally! (Backend sync pending)`);
    } finally {
      setConnectSaving(false);
    }
  };

  const handleDisconnectAccount = (platform: string) => {
    if (!confirm(`Disconnect your ${platform} account?`)) return;
    const updated = socialAccounts.filter(a => a.platform !== platform);
    saveSocialAccounts(updated);
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postHeadline.trim()) { alert('Please provide a post headline.'); return; }
    if (postChannels.length === 0) { alert('Please select at least one social media channel.'); return; }

    // Check if any selected channel has a connected account
    const connectedChannels = postChannels.filter(ch =>
      socialAccounts.some(a => a.platform === ch && a.isConnected)
    );
    const unconnectedChannels = postChannels.filter(ch =>
      !socialAccounts.some(a => a.platform === ch && a.isConnected)
    );

    const resolvedMediaUrl = postMediaUrl ||
      adRequests.find(r => r.creativeUrl)?.creativeUrl ||
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop';

    let apiResults: Record<string, { success: boolean; postId?: string; error?: string }> = {};

    // Call real API for connected channels
    if (connectedChannels.length > 0 && postScheduleType === 'NOW') {
      setIsPublishing(true);
      try {
        const res = await fetch('http://localhost:3000/api/social/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id || user.email,
            channels: connectedChannels,
            headline: postHeadline,
            caption: postCaption,
            mediaUrl: resolvedMediaUrl,
            targetUrl: postTargetUrl
          })
        });
        const data = await res.json();
        apiResults = data.results || {};
      } catch {
        connectedChannels.forEach(ch => {
          apiResults[ch] = { success: false, error: 'Backend unreachable — post queued locally.' };
        });
      } finally {
        setIsPublishing(false);
      }
    }

    // Unconnected channels get a local "queued" record
    unconnectedChannels.forEach(ch => {
      apiResults[ch] = { success: false, error: `No ${ch} account connected. Post queued — connect account in Social Accounts settings.` };
    });

    setPublishResults(apiResults);

    // Create local post record regardless
    const newPost: B2CPost = {
      id: `POST-${Date.now().toString().slice(-4)}`,
      adId: selectedAdForPost?.id,
      headline: postHeadline,
      caption: postCaption,
      mediaUrl: resolvedMediaUrl,
      mediaType: postMediaType,
      channels: postChannels,
      targetUrl: postTargetUrl,
      status: postScheduleType === 'NOW' ? 'PUBLISHED' : 'SCHEDULED',
      scheduledDate: postScheduleType === 'LATER' ? postScheduledDate : undefined,
      publishedDate: new Date().toISOString().split('T')[0],
      impressions: postScheduleType === 'NOW' ? Math.floor(1800 + Math.random() * 5200) : 0,
      clicks: postScheduleType === 'NOW' ? Math.floor(150 + Math.random() * 420) : 0,
      leads: postScheduleType === 'NOW' ? Math.floor(12 + Math.random() * 38) : 0
    };
    savePosts([newPost, ...posts]);

    if (selectedAdForPost) {
      saveRequests(adRequests.map(r =>
        r.id === selectedAdForPost.id ? { ...r, status: 'PUBLISHED' as const } : r
      ));
    }

    // Results panel will show instead of closing
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('Are you sure you want to remove this post record?')) return;
    savePosts(posts.filter(p => p.id !== postId));
  };



  // CustomerType & Lead Guards
  const customerType = user?.customerType || 'EXPLORER';

  if (!user || customerType === 'EXPLORER') {
    return (
      <div className="min-h-[80vh] bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-black font-display">Explorer Mode — B2C Portal Locked</h2>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Your account is currently in Explorer mode. Please complete your profile to select B2C as your permanent account type before accessing the creative ad portal.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/profile"
              className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
            >
              <span>Complete Profile & Choose B2C</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (customerType === 'B2B') {
    return (
      <div className="min-h-[80vh] bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-black font-display">B2B Account Detected</h2>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Your account is registered as B2B Business SaaS. Please access the B2B Dashboard for multi-product campaign workflows.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/b2b"
              className="btn-shimmer w-full py-4 bg-black hover:bg-zinc-900 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md"
            >
              <span>Go to B2B Dashboard</span>
              <ArrowRight className="w-4 h-4 text-red-500" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Lead Guard: If user is a registered LEAD and has not paid subscription
  if (user.status === 'LEAD' || user.paymentStatus !== 'PAID') {
    const userRefId = user?.referenceId || 'LEAD-REF-892104';
    return (
      <div className="min-h-[80vh] bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider">
              <span>Account Status: Registered Lead</span>
            </div>
            <h2 className="text-3xl font-black text-black font-display tracking-tight pt-1">
              Subscription Required
            </h2>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Your account is registered as a Lead (<strong className="text-black font-mono">{userRefId}</strong>). 
              To activate your full B2C Ad Studio, submit product requests, and access live lead pipelines, please select a subscription plan.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Lead Reference ID</span>
              <span className="font-mono font-black text-red-600">{userRefId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Client Email</span>
              <span className="font-bold text-black">{user?.email || 'prospect@business.com'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Payment Verification</span>
              <span className="font-black text-red-600">PENDING SUBSCRIPTION</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/pricing"
              className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
            >
              <span>View B2C Plans & Activate Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => { dispatch(logOut()); navigate('/login'); }}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs border border-zinc-200"
            >
              Sign In with Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      mainProduct: {
        name: productName,
        price: productPrice,
        category: productCat
      },
      description: productDesc,
      discount: productDiscount,
      targetAudience,
      companyName: brandName
    };
    
    dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u.email === user.email || u._id === user._id);
    if (idx !== -1) {
      mockUsers[idx] = updatedUser;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
    alert("Product profile saved successfully for your account!");
  };


  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let count = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newImages.push(reader.result);
        }
        count++;
        if (count === files.length) {
          setReqUploadedImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!reqUrlInput.trim()) return;
    setReqUploadedImages(prev => [...prev, reqUrlInput.trim()]);
    setReqUrlInput('');
  };

  const handleRemoveReqImage = (index: number) => {
    setReqUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDesc) {
      alert("Please describe your advertisement requirements.");
      return;
    }

    const newReq: AdRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      productName: productName,
      adType: reqAdType,
      purpose: reqPurpose,
      description: reqDesc,
      headline: reqHeadline || `${brandName} Exclusive Drop`,
      cta: reqCta,
      maxWords: reqMaxWords,
      style: reqStyle,
      format: reqFormat,
      status: 'SUBMITTED',
      createdDate: new Date().toISOString().split('T')[0],
      productImages: reqUploadedImages
    };

    const updated = [newReq, ...adRequests];
    saveRequests(updated);
    
    setReqDesc('');
    setReqHeadline('');
    setReqUploadedImages([]);
    alert(`Advertisement Request Submitted Successfully! (${reqUploadedImages.length} product photos attached). Our dedicated studio admin will generate your creative.`);
  };


  // Admin-Only Creator Action
  const handleAdminGenerateCreative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only Administrators can create ad image/video assets.");
      return;
    }

    const targetReq = adRequests.find(r => r.id === adminTargetReqId) || adRequests[0];
    const updated = adRequests.map(r => {
      if (r.id === targetReq?.id) {
        return {
          ...r,
          headline: adminHeadline || r.headline,
          creativeUrl: adminImageUrl,
          creativeVersion: (r.creativeVersion || 1) + 1,
          status: 'CUSTOMER_REVIEW' as const
        };
      }
      return r;
    });

    saveRequests(updated);
    setIsAdminCreatingAd(null);
    setAdminHeadline('');
    alert(`Admin Creation Complete!\nGenerated ${isAdminCreatingAd === 'IMAGE' ? 'Image Ad' : 'Video Ad'} for ${targetReq?.headline || 'Campaign'}.`);
  };

  const handleCreativeAction = (reqId: string, action: 'APPROVE' | 'REJECT', comment?: string) => {
    const updated = adRequests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: action === 'APPROVE' ? ('APPROVED' as const) : ('CHANGES_REQUESTED' as const),
          comment: comment || ''
        };
      }
      return r;
    });
    saveRequests(updated);
    alert(action === 'APPROVE' ? "Creative Approved!" : "Revision comments submitted to Admin.");
  };

  const customerRefId = user?.referenceId || 'CUST-REF-PENDING';
  const employeeRefId = user?.assignedEmployeeRefId || 'Unassigned';


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
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Customer Reference ID</div>
              <div className="text-xs font-mono font-black text-red-600">{customerRefId}</div>
              <div className="text-[9px] font-bold text-zinc-500">Plan: {user?.subscription || 'B2C Growth'}</div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'product', label: 'My Product', icon: ShoppingBag },
              { id: 'requests', label: 'Ad Requests', icon: Send },
              { id: 'ads', label: 'My Ads & Videos', icon: Film },
              { id: 'posts', label: 'Platform Posts', icon: Share2 },
              { id: 'leads', label: 'Captured Leads', icon: Users },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'profile', label: 'My Profile', icon: User }
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
            <div className="w-9 h-9 bg-red-600 text-white font-black flex items-center justify-center rounded-xl text-xs">
              {user.firstName ? user.firstName[0].toUpperCase() : user.name ? user.name[0].toUpperCase() : 'C'}
            </div>
            <div className="truncate">
              <div className="font-black text-xs text-black truncate">{user.firstName || user.name || 'B2C Client'}</div>
              <div className="text-[10px] text-zinc-500 font-semibold truncate">{user.email}</div>
            </div>
          </div>

          <button 
            onClick={() => { dispatch(logOut()); navigate('/login'); }}
            className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-[10px] tracking-wider text-center flex items-center justify-center gap-2 border border-zinc-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">

        {/* 1. B2C Overview Dashboard */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-200 pb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Active B2C Client Portal</span>
                </div>
                <h1 className="text-3xl font-black text-black font-display tracking-tight">
                  Welcome, {user.companyName || user.name || 'Valued Brand'}
                </h1>
                <p className="text-xs text-zinc-600 font-semibold mt-1">
                  Manage your flagship product, request studio creatives, and review incoming conversion leads.
                </p>
              </div>

              {/* Top Reference Badges */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-right">
                  <div className="text-[9px] uppercase font-bold text-zinc-400">Assigned Specialist</div>
                  <div className="text-xs font-mono font-black text-black">{employeeRefId}</div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Product', val: productName || 'No Product Set', sub: productCat || 'Configure in My Product' },
                { label: 'Total Creatives', val: adRequests.filter(r => r.creativeUrl).length, sub: 'Generated by Studio' },
                { label: 'Live Ads', val: adRequests.filter(r => r.status === 'PUBLISHED').length, sub: 'Omnichannel Campaigns' },
                { label: 'Pending Approvals', val: adRequests.filter(r => r.status === 'CUSTOMER_REVIEW').length, sub: 'Awaiting Your Review' }
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{stat.label}</h4>
                  <div className="text-2xl font-black text-black font-display truncate">{stat.val}</div>
                  <div className="text-[10px] text-zinc-500 font-semibold">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Latest Ad Requests & Quick Action */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
                <h3 className="font-black text-black text-base border-b border-zinc-100 pb-3">Latest Ad Creatives & Requests</h3>

                <div className="space-y-3">
                  {adRequests.length > 0 ? (
                    adRequests.map((req) => (
                      <div key={req.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex justify-between items-center">
                        <div>
                          <div className="font-black text-black text-sm">{req.headline}</div>
                          <div className="text-zinc-500 text-xs mt-0.5">Format: {req.format} • Type: {req.adType}</div>
                        </div>
                        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 font-black rounded-lg text-[10px] uppercase">
                          {req.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-center space-y-1">
                      <span className="text-xs font-black text-black block">No Ad Requests Yet</span>
                      <p className="text-[11px] text-zinc-500 font-medium">Submit your product requirements below to have our studio team generate your creative.</p>
                    </div>
                  )}
                </div>
              </div>


              {/* Subscription Status Card */}
              <div className="lg:col-span-1 bg-zinc-50 rounded-3xl p-6 border border-zinc-200 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-black text-base border-b border-zinc-200 pb-3">Active Subscription</h3>
                  <div className="space-y-3 text-xs font-semibold text-zinc-700 mt-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Plan Tier:</span>
                      <span className="text-red-600 font-black">{user.subscription || 'B2C Growth'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment Status:</span>
                      <span className="text-black font-black">PAID</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Billing Term:</span>
                      <span className="text-black">{user.billingCycle || 'Annual'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveView('requests')}
                  className="btn-shimmer w-full py-3.5 bg-red-600 text-white font-black hover:bg-red-700 rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20"
                >
                  Submit New Ad Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. My Product Form */}
        {activeView === 'product' && (
          <div className="max-w-2xl bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-black font-display border-b border-zinc-100 pb-3">
              Flagship Product Details
            </h2>
            <form onSubmit={handleUpdateProduct} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Product Name *</label>
                  <input type="text" required value={productName} onChange={e => setProductName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Category *</label>
                  <input type="text" required value={productCat} onChange={e => setProductCat(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Retail Price ($) *</label>
                  <input type="number" required value={productPrice} onChange={e => setProductPrice(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Discount Offer (%)</label>
                  <input type="number" value={productDiscount} onChange={e => setProductDiscount(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Brand / Company Name</label>
                <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Target Audience *</label>
                <input type="text" required value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Product Description & Copy *</label>
                <textarea required value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black h-24 resize-none focus:outline-none focus:border-red-600" />
              </div>

              <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider">
                Save Product Profile
              </button>
            </form>
          </div>
        )}

        {/* 3. Ad Requests Form */}
        {activeView === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-black text-black font-display border-b border-zinc-100 pb-3">
                Submit Advertisement Request
              </h2>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Ad Output Type</label>
                    <select value={reqAdType} onChange={e => setReqAdType(e.target.value as any)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600">
                      <option value="Image">Image Banner</option>
                      <option value="Video">Video Ad</option>
                      <option value="Both">Both Image & Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Platform Format</label>
                    <select value={reqFormat} onChange={e => setReqFormat(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600">
                      <option value="Instagram Post (1:1)">Instagram Post (1:1)</option>
                      <option value="TikTok / Reel (9:16)">TikTok / Reel (9:16)</option>
                      <option value="Facebook Story (9:16)">Facebook Story (9:16)</option>
                      <option value="YouTube Short (9:16)">YouTube Short (9:16)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Campaign Purpose</label>
                    <select value={reqPurpose} onChange={e => setReqPurpose(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600">
                      <option value="Product Promotion">Product Promotion</option>
                      <option value="Discount Campaign">Discount Campaign</option>
                      <option value="Product Launch">Product Launch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Creative Theme</label>
                    <select value={reqStyle} onChange={e => setReqStyle(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600">
                      <option value="Modern & Bold">Modern & Bold</option>
                      <option value="Luxury & Minimal">Luxury & Minimal</option>
                      <option value="Energetic & Fast">Energetic & Fast</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Suggested Headline</label>
                  <input type="text" value={reqHeadline} onChange={e => setReqHeadline(e.target.value)} placeholder="e.g. FLASH SALE: 25% OFF" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Advertisement Copy Details & Instructions *</label>
                  <textarea required value={reqDesc} onChange={e => setReqDesc(e.target.value)} placeholder="Provide special bullet points, colors, or offers..." className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black h-20 resize-none focus:outline-none focus:border-red-600" />
                </div>

                {/* Multi-Image Upload & URL Input */}
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Product Photos & Assets (Multiple Images)
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {reqUploadedImages.length} {reqUploadedImages.length === 1 ? 'image' : 'images'} attached
                    </span>
                  </div>

                  {/* Upload Box */}
                  <label className="border-2 border-dashed border-zinc-300 hover:border-red-600 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 hover:bg-red-50/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:text-red-600 group-hover:border-red-200 shadow-sm mb-2 transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-black group-hover:text-red-600">Click to upload multiple product photos</span>
                    <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">JPG, PNG, WebP (Select multiple files)</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/png,image/jpeg,image/jpg,image/webp" 
                      onChange={handleMultiImageUpload} 
                      className="hidden" 
                    />
                  </label>

                  {/* Or add Image URL */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={reqUrlInput}
                        onChange={e => setReqUrlInput(e.target.value)}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                      />
                      <Link2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl uppercase tracking-wider border border-zinc-200 flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add URL</span>
                    </button>
                  </div>

                  {/* Gallery of Uploaded / Attached Images */}
                  {reqUploadedImages.length > 0 && (
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Attached Photos for Studio Generation ({reqUploadedImages.length})
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                        {reqUploadedImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                            <img src={img} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveReqImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] opacity-90 hover:opacity-100 shadow-md"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider">
                  Submit Ad Request to Studio
                </button>

              </form>
            </div>

            {/* Request Progress Tracker */}
            <div className="lg:col-span-1 bg-zinc-50 rounded-3xl p-6 border border-zinc-200 space-y-4">
              <h3 className="font-black text-black text-base border-b border-zinc-200 pb-3">Status Tracker</h3>
              <div className="space-y-4">
                {adRequests.map((req) => (
                  <div key={req.id} className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] font-bold text-zinc-400">{req.id}</span>
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 font-bold rounded-lg text-[9px] uppercase">
                        {req.status}
                      </span>
                    </div>
                    <div className="font-black text-black text-xs">{req.headline}</div>
                    
                    {req.status === 'CUSTOMER_REVIEW' && req.creativeUrl && (
                      <div className="pt-2 space-y-2">
                        <img src={req.creativeUrl} alt="Preview" className="w-full h-24 object-cover rounded-xl border border-zinc-200" />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreativeAction(req.id, 'APPROVE')}
                            className="btn-shimmer flex-1 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCreativeAction(req.id, 'REJECT', prompt("Enter revision comments:") || "")}
                            className="flex-1 py-1.5 bg-zinc-200 text-black text-[10px] font-black rounded-lg uppercase hover:bg-zinc-300"
                          >
                            Request Edits
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. My Ads & Videos Grid (WITH ADMIN-ONLY CREATION BUTTONS) */}
        {activeView === 'ads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Generated Ads & Video Creatives</h2>
                <p className="text-xs text-zinc-600 font-medium mt-1">
                  High-converting visual assets ready for omnichannel dispatch.
                </p>
              </div>

              {/* ADMIN-ONLY AD CREATION BUTTONS */}
              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsAdminCreatingAd('IMAGE');
                      setAdminTargetReqId(adRequests[0]?.id || '');
                    }}
                    className="btn-shimmer px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20"
                  >
                    <Image className="w-4 h-4" />
                    <span>Create a Ad as Image</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAdminCreatingAd('VIDEO');
                      setAdminTargetReqId(adRequests[0]?.id || '');
                    }}
                    className="btn-shimmer px-4 py-3 bg-black hover:bg-zinc-900 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center gap-2 border border-zinc-800"
                  >
                    <Video className="w-4 h-4 text-red-600" />
                    <span>Create a Ad as Video</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span>Creative Generation Managed by Super Admin</span>
                </div>
              )}
            </div>

            {/* Creatives Showcase Cards */}
            {adRequests.filter(r => r.creativeUrl).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adRequests.filter(r => r.creativeUrl).map((ad) => (
                  <div key={ad.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between group">
                    <div className="relative">
                      <img src={ad.creativeUrl} alt="Ad creative" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] font-bold rounded-lg">
                        {ad.format}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="font-black text-black text-sm">{ad.headline}</div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 border-t border-zinc-100 pt-3">
                        <span>Status: <strong className="text-red-600 font-mono">{ad.status}</strong></span>
                        <span>Version: v{ad.creativeVersion || 1}</span>
                      </div>

                      <button
                        onClick={() => handleOpenPostModal(ad)}
                        className="btn-shimmer w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-red-600/20 mt-2"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Post / Publish to Social</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto shadow-sm">
                  <Image className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="font-black text-black text-sm">No Creatives Generated Yet</h3>
                <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto">
                  Your generated ad assets will appear here once the studio team processes your product requests.
                </p>
                <button 
                  onClick={() => setActiveView('requests')}
                  className="btn-shimmer px-5 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider"
                >
                  Submit Ad Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. Platform Posts (Omnichannel Hub) */}
        {activeView === 'posts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Omnichannel Published & Scheduled Posts</h2>
                <p className="text-xs text-zinc-600 font-medium mt-1">
                  Dispatch your approved product ads across Instagram, TikTok, Facebook, YouTube Shorts, and X.
                </p>
              </div>

              <button
                onClick={() => handleOpenPostModal()}
                className="btn-shimmer px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Publish Post</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedChannelFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedChannelFilter === 'ALL'
                    ? 'bg-black text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                All Channels ({posts.length})
              </button>
              {SOCIAL_CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelFilter(ch.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    selectedChannelFilter === ch.id
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <span>{ch.badge}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({posts.filter(p => p.channels.includes(ch.id)).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Posts Grid / Cards */}
            {posts.filter(p => selectedChannelFilter === 'ALL' || p.channels.includes(selectedChannelFilter)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts
                  .filter(p => selectedChannelFilter === 'ALL' || p.channels.includes(selectedChannelFilter))
                  .map(post => (
                    <div key={post.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between group">
                      <div className="relative">
                        <img src={post.mediaUrl} alt={post.headline} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[80%]">
                          {post.channels.map(ch => (
                            <span key={ch} className="px-2 py-0.5 bg-black/80 backdrop-blur-md text-white font-mono text-[9px] font-bold rounded-md">
                              {ch}
                            </span>
                          ))}
                        </div>
                        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-mono shadow-sm ${
                          post.status === 'PUBLISHED' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          {post.status}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <span className="font-mono text-[9px] text-zinc-400 font-bold block">{post.id} • {post.publishedDate}</span>
                          <h4 className="font-black text-black text-sm mt-0.5 line-clamp-1">{post.headline}</h4>
                          <p className="text-xs text-zinc-500 font-medium line-clamp-2 mt-1 whitespace-pre-line leading-relaxed">
                            {post.caption}
                          </p>
                        </div>

                        {/* Live Telemetry Bar */}
                        <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-100 text-center">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Views</span>
                            <span className="text-xs font-black text-black">{post.impressions.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Clicks</span>
                            <span className="text-xs font-black text-black">{post.clicks.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Leads</span>
                            <span className="text-xs font-black text-red-600">{post.leads}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                          <button
                            onClick={() => setPreviewingPost(post)}
                            className="text-xs font-bold text-zinc-600 hover:text-black flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto shadow-sm">
                  <Share2 className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="font-black text-black text-sm">No Published Posts Yet</h3>
                <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto">
                  Select any of your approved studio creatives and dispatch them across Instagram, TikTok, and Facebook.
                </p>
                <button
                  onClick={() => handleOpenPostModal()}
                  className="btn-shimmer px-5 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider"
                >
                  Create & Publish First Post
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Captured Leads */}
        {activeView === 'leads' && (
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-black text-lg">Direct Inbound Leads</h3>
              <span className="px-3 py-1 bg-red-50 text-red-600 font-mono text-xs font-bold rounded-lg">
                {posts.reduce((acc, p) => acc + p.leads, 0)} Total Ingested
              </span>
            </div>
            {posts.reduce((acc, p) => acc + p.leads, 0) > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-black uppercase text-[10px]">
                    <th className="p-4">Lead ID</th>
                    <th className="p-4">Ad Post Campaign</th>
                    <th className="p-4">Channel Source</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {posts.filter(p => p.leads > 0).map((post) => (
                    <tr key={post.id}>
                      <td className="p-4 font-mono font-bold text-red-600">INBOUND-LEAD-{post.id.slice(-4)}</td>
                      <td className="p-4 font-bold text-black">{post.headline}</td>
                      <td className="p-4 font-semibold text-zinc-600">{post.channels.join(', ')}</td>
                      <td className="p-4"><span className="px-2.5 py-0.5 bg-green-50 text-green-700 font-bold rounded-full text-[10px]">VERIFIED LEAD</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-zinc-500 text-xs font-medium bg-zinc-50 rounded-2xl border border-zinc-200">
                No inbound prospect leads captured yet. Inbound prospect inquiries from your active product ads will automatically populate here.
              </div>
            )}
          </div>
        )}



        {/* 7. Subscription Details */}
        {activeView === 'subscription' && (
          <div className="max-w-md bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-black font-display border-b border-zinc-100 pb-3">Subscription Details</h2>
            <div className="space-y-4 text-xs font-semibold text-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-500">Plan Tier:</span>
                <span className="text-red-600 font-black">{user.subscription || 'B2C Growth'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer Ref ID:</span>
                <span className="font-mono font-black text-black">{customerRefId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Billing Cycle:</span>
                <span className="text-black">{user.billingCycle || 'Annual'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Status:</span>
                <span className="font-bold text-red-600">PAID (Active Term)</span>
              </div>
            </div>
          </div>
        )}

        {/* 8. Profile View */}
        {activeView === 'profile' && (
          <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm text-center space-y-4 max-w-md">
            <h3 className="text-lg font-black text-black">Client Account Details</h3>
            <p className="text-xs text-zinc-500">Manage your business profile and team settings.</p>
            <button 
              onClick={() => navigate('/profile')}
              className="btn-shimmer w-full py-3.5 bg-red-600 text-white font-black hover:bg-red-700 rounded-xl uppercase text-xs"
            >
              Go to Full Profile Page
            </button>
          </div>
        )}

      </main>

      {/* ADMIN-ONLY CREATIVE GENERATOR MODAL */}
      {isAdminCreatingAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-1 bg-red-50 text-red-600 font-black rounded-lg text-[10px] uppercase">
                  Super Admin Studio Tool
                </span>
                <h2 className="text-2xl font-black text-black font-display mt-2">
                  Create Ad as {isAdminCreatingAd === 'IMAGE' ? 'Image Banner' : 'Video Creative'}
                </h2>
              </div>
              <button onClick={() => setIsAdminCreatingAd(null)} className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminGenerateCreative} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Target Ad Request</label>
                <select
                  value={adminTargetReqId}
                  onChange={(e) => setAdminTargetReqId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                >
                  {adRequests.map(r => (
                    <option key={r.id} value={r.id}>{r.id} - {r.headline || r.productName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Creative Headline</label>
                <input
                  type="text"
                  required
                  value={adminHeadline}
                  onChange={(e) => setAdminHeadline(e.target.value)}
                  placeholder="e.g. ULTIMATE VELOCITY: 25% OFF"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Rendered Asset URL</label>
                <input
                  type="url"
                  required
                  value={adminImageUrl}
                  onChange={(e) => setAdminImageUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20"
                >
                  Publish Creative to Customer Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. CUSTOMER POST & PUBLISH AD MODAL */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-zinc-200 space-y-6 my-8">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-wider mb-1">
                  <Share2 className="w-3 h-3" />
                  <span>Omnichannel Ad Dispatch</span>
                </div>
                <h2 className="text-xl font-black text-black font-display">
                  Post & Dispatch Ad Creative
                </h2>
              </div>
              <button 
                onClick={() => setIsPostingModalOpen(false)} 
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              {/* Media Asset Preview & Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  1. Creative Asset to Post *
                </label>
                <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <img 
                    src={postMediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop'} 
                    alt="Creative preview" 
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-black block truncate">{postHeadline || productName || 'Active Creative'}</span>
                    <span className="text-[10px] text-zinc-500 font-medium mt-0.5 block">{postMediaType === 'VIDEO' ? '🎬 Video Creative' : '🖼️ Image Banner'}</span>
                  </div>
                </div>

                {/* Switch creative selector if multiple exist */}
                {adRequests.filter(r => r.creativeUrl).length > 1 && (
                  <div className="mt-2 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Or select from other studio creatives:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {adRequests.filter(r => r.creativeUrl).map(req => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => {
                            setSelectedAdForPost(req);
                            setPostHeadline(req.headline);
                            setPostMediaUrl(req.creativeUrl || '');
                            setPostMediaType(req.adType === 'Video' ? 'VIDEO' : 'IMAGE');
                          }}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                            postMediaUrl === req.creativeUrl ? 'border-red-600 ring-2 ring-red-600/30' : 'border-zinc-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={req.creativeUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Channels Multi-Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                  2. Select Target Channels * ({postChannels.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SOCIAL_CHANNELS.map(ch => {
                    const isChecked = postChannels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleToggleChannel(ch.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isChecked 
                            ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' 
                            : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-white'
                        }`}
                      >
                        <span>{ch.badge}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  3. Post Headline *
                </label>
                <input
                  type="text"
                  required
                  value={postHeadline}
                  onChange={(e) => setPostHeadline(e.target.value)}
                  placeholder="e.g. FLASH DROP: 25% OFF VELOCITY"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  4. Post Caption & Copy *
                </label>
                <textarea
                  required
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-medium text-xs text-black focus:outline-none focus:border-red-600 resize-none leading-relaxed"
                />
              </div>

              {/* CTA Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  5. Destination / Shop URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={postTargetUrl}
                    onChange={(e) => setPostTargetUrl(e.target.value)}
                    placeholder="https://yourbrand.com/product"
                    className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Schedule Type */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                  6. Dispatch Schedule
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostScheduleType('NOW')}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      postScheduleType === 'NOW' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <span>🚀 Post Instantly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostScheduleType('LATER')}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      postScheduleType === 'LATER' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <span>📅 Schedule Later</span>
                  </button>
                </div>

                {postScheduleType === 'LATER' && (
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Select Dispatch Date & Time:</label>
                    <input
                      type="datetime-local"
                      required
                      value={postScheduledDate}
                      onChange={(e) => setPostScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20"
                >
                  {postScheduleType === 'NOW' ? 'Publish Post Across Channels' : 'Confirm & Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. POST PREVIEW MODAL */}
      {previewingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <h3 className="font-black text-black text-sm">Live Feed Preview</h3>
              </div>
              <button 
                onClick={() => setPreviewingPost(null)}
                className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              {/* Fake Feed Header */}
              <div className="p-3 flex items-center gap-2.5 border-b border-zinc-100">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-[10px]">
                  {brandName ? brandName[0].toUpperCase() : 'B'}
                </div>
                <div>
                  <div className="font-black text-xs text-black">{brandName || 'Official Brand'}</div>
                  <div className="text-[9px] text-zinc-400 font-semibold">Sponsored • {previewingPost.channels[0] || 'Instagram'}</div>
                </div>
              </div>

              {/* Media */}
              <img src={previewingPost.mediaUrl} alt="" className="w-full aspect-square object-cover" />

              {/* Fake Action Bar */}
              <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
                <div className="text-xs font-black text-black truncate max-w-[180px]">{previewingPost.headline}</div>
                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase">
                  Shop Now
                </span>
              </div>

              {/* Caption */}
              <div className="p-3 pt-2 text-[11px] text-zinc-700 whitespace-pre-line leading-relaxed border-t border-zinc-100 font-medium">
                <strong className="text-black font-bold mr-1">{brandName || 'Brand'}</strong>
                {previewingPost.caption}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

