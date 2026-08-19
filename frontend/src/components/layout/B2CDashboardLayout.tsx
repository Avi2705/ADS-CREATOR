import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logOut, setCredentials } from '../../features/auth/authSlice';
import { 
  Sparkles, Image, Video, Lock, ArrowRight, 
  LayoutDashboard, ShoppingBag, 
  Film, Share2, Users, CreditCard, User, LogOut, Flame,
  Upload, Link2, Plus, Check, Eye, Trash2, X, ArrowLeft,
  Play
} from 'lucide-react';
import { getPlanConfig } from '../../constants/subscriptionPlans';
import { AppPlatformAdMockup } from '../ads/AppPlatformAdMockup';

export const SAMPLE_VIDEO_PRESETS = [
  {
    id: 'footwear-motion',
    name: '👟 Footwear Kinetic Motion Reel',
    category: 'Footwear',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop'
  },
  {
    id: 'tech-product-spin',
    name: '🎧 Tech & Audio Showcase Video',
    category: 'Electronics',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop'
  },
  {
    id: 'apparel-streetwear',
    name: '🧥 Streetwear Fashion Promo Clip',
    category: 'Apparel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&fit=crop'
  },
  {
    id: 'fitness-dynamic',
    name: '🔥 Fitness & Performance Reel',
    category: 'Fitness',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop'
  },
  {
    id: 'cinematic-brand',
    name: '✨ Cinematic 4K Brand Commercial',
    category: 'General',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&fit=crop'
  }
];

export const isVideoMedia = (url?: string, adType?: string, mediaType?: string) => {
  if (adType === 'Video' || adType === 'VIDEO') return true;
  if (mediaType === 'VIDEO') return true;
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v') || clean.includes('gtv-videos-bucket') || clean.includes('video');
};


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
  id?: string;
  _id?: string;
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
  platform: 'Instagram' | 'Facebook' | 'WhatsApp';
  handle: string;
  accountId: string;
  accessToken?: string;
  isConnected: boolean;
  connectedAt?: string;
}

const SOCIAL_CHANNELS = [
  {
    id: 'Instagram' as const,
    name: 'Instagram',
    badge: '📷 Instagram',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    setupHint: 'Enter your Instagram Handle or Account ID (e.g. @yourbrand or 178414...)',
    apiSupported: true
  },
  {
    id: 'Facebook' as const,
    name: 'Facebook Page',
    badge: '👥 Facebook Page',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    setupHint: 'Enter your Facebook Page ID or URL (e.g. fb.com/yourbrand or 109283...)',
    apiSupported: true
  },
  {
    id: 'WhatsApp' as const,
    name: 'WhatsApp Channel',
    badge: '💬 WhatsApp Channel',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    setupHint: 'Enter your WhatsApp Channel ID or Business Phone Number (e.g. +91 98765 43210)',
    apiSupported: true
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
  const [reqCta] = useState("I'm Interested");
  const [reqMaxWords, setReqMaxWords] = useState(120);
  const [reqStyle, setReqStyle] = useState('Modern');
  const [reqFormat, setReqFormat] = useState('Instagram Post (1:1)');

  // Multiple Product Images uploaded by customer
  const [reqUploadedImages, setReqUploadedImages] = useState<string[]>([]);
  const [reqUrlInput, setReqUrlInput] = useState('');

  // Admin-Only Creator Modal State
  const [isAdminCreatingAd, setIsAdminCreatingAd] = useState<null | 'IMAGE' | 'VIDEO'>(null);
  const [adminHeadline, setAdminHeadline] = useState('');
  const [adminDesc, setAdminDesc] = useState('');
  const [adminImageUrl, setAdminImageUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');
  const [adminTargetReqId, setAdminTargetReqId] = useState('');

  // Post & Publish state - strictly isolated per customer
  const [posts, setPosts] = useState<B2CPost[]>([]);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [postHeadline, setPostHeadline] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postMediaType, setPostMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [postChannels, setPostChannels] = useState<string[]>(['Instagram', 'Facebook', 'WhatsApp']);
  const [postTargetUrl] = useState('');

  // "I'm Interested" Lead Capture Modal & State
  const [interestedModalAd, setInterestedModalAd] = useState<AdRequest | B2CPost | null>(null);
  
  // Fullscreen Live Video Player & Interactive Ad Inspection Modal
  const [fullPreviewVideoAd, setFullPreviewVideoAd] = useState<{
    mediaUrl: string;
    adType: 'Image' | 'Video' | 'Both' | string;
    headline: string;
    description: string;
    brandName: string;
    format?: string;
    version?: number;
    productName?: string;
  } | null>(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [capturedLeads, setCapturedLeads] = useState<any[]>([]);

  // Load Captured Leads for this user
  useEffect(() => {
    if (!user) return;
    const userKey = user._id || user.email || 'b2c-default';
    const savedLeads = localStorage.getItem(`b2c_leads_${userKey}`);
    if (savedLeads) {
      try { setCapturedLeads(JSON.parse(savedLeads)); } catch { setCapturedLeads([]); }
    }
  }, [user]);

  const handleCaptureLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone || !leadEmail) {
      alert("Please enter Name, Phone Number, and Email.");
      return;
    }
    const newLead = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      name: leadName,
      phone: leadPhone,
      email: leadEmail,
      adName: (interestedModalAd as any)?.headline || (interestedModalAd as any)?.productName || productName || 'Ad Creative',
      capturedAt: new Date().toLocaleString()
    };
    const updatedLeads = [newLead, ...capturedLeads];
    setCapturedLeads(updatedLeads);
    const userKey = user._id || user.email || 'b2c-default';
    localStorage.setItem(`b2c_leads_${userKey}`, JSON.stringify(updatedLeads));

    // Also persist lead to mock_leads for admin overview
    const globalLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
    globalLeads.unshift({
      _id: newLead.id,
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      companyName: brandName || 'B2C Client',
      status: 'INTERESTED',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('mock_leads', JSON.stringify(globalLeads));

    setLeadName(''); setLeadPhone(''); setLeadEmail('');
    setInterestedModalAd(null);
    alert("🎉 Lead details captured and saved! Check your Captured Leads tab.");
  };
  const [postScheduleType, setPostScheduleType] = useState<'NOW' | 'LATER'>('NOW');
  const [postScheduledDate, setPostScheduledDate] = useState('');
  const [selectedAdForPost, setSelectedAdForPost] = useState<AdRequest | null>(null);
  const [postStep, setPostStep] = useState<1 | 2>(1);
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
    let loaded: AdRequest[] = [];
    
    const savedRequests = localStorage.getItem(`requests_${userKey}`) || 
                          localStorage.getItem(`requests_${user.email}`) || 
                          localStorage.getItem(`requests_${user.referenceId}`);
    if (savedRequests) {
      try {
        loaded = JSON.parse(savedRequests);
      } catch {
        loaded = [];
      }
    }

    // Also merge from all_b2c_requests where admin may have created or updated creatives
    try {
      const allGlobal = JSON.parse(localStorage.getItem('all_b2c_requests') || '[]');
      const userGlobal = allGlobal.filter((r: any) => 
        (r.userEmail && r.userEmail.toLowerCase() === user.email?.toLowerCase()) ||
        (r.userId && (r.userId === user._id || r.userId === user.id)) ||
        (r.customerRefId && (r.customerRefId === user.referenceId || r.customerRefId === userKey))
      );

      if (userGlobal.length > 0) {
        // Merge userGlobal and loaded, prioritizing updated records
        userGlobal.forEach((ug: any) => {
          const idx = loaded.findIndex(l => l.id === ug.id || (l.productName === ug.productName && l.headline === ug.headline));
          if (idx !== -1) {
            loaded[idx] = { ...loaded[idx], ...ug };
          } else {
            loaded.unshift(ug);
          }
        });
      }
    } catch (e) {
      console.warn("Could not scan all_b2c_requests:", e);
    }

    setAdRequests(loaded);
  }, [user]);

  const saveRequests = (updated: AdRequest[]) => {
    if (!user) return;
    const userKey = user._id || user.email || 'b2c-default';
    setAdRequests(updated);
    try {
      localStorage.setItem(`requests_${userKey}`, JSON.stringify(updated));
      if (user._id) localStorage.setItem(`requests_${user._id}`, JSON.stringify(updated));
      if (user.email) localStorage.setItem(`requests_${user.email}`, JSON.stringify(updated));
      if (user.referenceId) localStorage.setItem(`requests_${user.referenceId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("localStorage QuotaExceededError! Cleaning base64 images:", err);
      const cleaned = updated.map(r => ({
        ...r,
        productImages: (r.productImages || []).map(img => 
          img.startsWith('data:') ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop' : img
        )
      }));
      try {
        localStorage.setItem(`requests_${userKey}`, JSON.stringify(cleaned));
      } catch (e2) {
        console.error("Failed to store cleaned requests:", e2);
      }
    }

    // Also update in all_b2c_requests so Super Admin panel instantly sees requests
    const allGlobal = JSON.parse(localStorage.getItem('all_b2c_requests') || '[]');
    const otherReqs = allGlobal.filter((r: any) => 
      r.userId !== user._id && r.userEmail?.toLowerCase() !== user.email?.toLowerCase()
    );
    const taggedUpdated = updated.map(r => ({
      ...r,
      userId: user._id,
      userEmail: user.email,
      customerRefId: user.referenceId,
      customerName: user.name || user.firstName || 'B2C Client'
    }));
    try {
      localStorage.setItem('all_b2c_requests', JSON.stringify([...taggedUpdated, ...otherReqs]));
    } catch (e) {
      console.warn("Failed to update all_b2c_requests:", e);
    }
  };

  // Load posts specific to this customer ONLY
  useEffect(() => {
    if (!user) return;
    const userKey = user._id || user.email || 'b2c-default';
    fetch(`http://localhost:3000/api/social/posts?userId=${userKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error("Failed to load database posts:", err));
  }, [user]);



  const handleOpenPostModal = (ad?: AdRequest) => {
    if (ad) {
      setSelectedAdForPost(ad);
      setPostHeadline(ad.headline);
      setPostMediaUrl(ad.creativeUrl || '');
      setPostMediaType(ad.adType === 'Video' ? 'VIDEO' : 'IMAGE');
      setPostCaption(`🔥 ${ad.headline}\n\nMeet the all-new ${productName} by ${brandName}! ${ad.description}\n\n👉 Click "I'm Interested" below to get details and claim exclusive offer!\n\n#${(brandName || 'brand').replace(/\s+/g, '')} #${(productCat || 'Product').replace(/\s+/g, '')} #DropAlert`);
    } else {
      setSelectedAdForPost(null);
      const firstCreative = adRequests.find(r => r.creativeUrl);
      setPostHeadline(`${brandName || 'Brand'} — ${productName || 'Exclusive Product'}`);
      setPostMediaUrl(firstCreative?.creativeUrl || user?.mainProduct?.mediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');
      setPostMediaType('IMAGE');
      setPostCaption(`🔥 Special Launch: ${productName} by ${brandName}!\n\nEngineered for maximum style and performance.\n\n👉 Click "I'm Interested" to connect with us!\n\n#${(brandName || 'Brand').replace(/\s+/g, '')} #NewDrop`);
    }
    setPostChannels(['Instagram', 'Facebook', 'WhatsApp']);
    setPostScheduleType('NOW');
    setPostScheduledDate(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setPostStep(1);
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

    const resolvedMediaUrl = postMediaUrl ||
      adRequests.find(r => r.creativeUrl)?.creativeUrl ||
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop';

    let apiResults: Record<string, { success: boolean; postId?: string; error?: string }> = {};

    setIsPublishing(true);
    try {
      const res = await fetch('http://localhost:3000/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.email,
          channels: postChannels,
          headline: postHeadline,
          caption: postCaption,
          mediaUrl: resolvedMediaUrl,
          targetUrl: postTargetUrl,
          adId: selectedAdForPost?.id,
          mediaType: postMediaType,
          status: postScheduleType === 'NOW' ? 'PUBLISHED' : 'SCHEDULED',
          scheduledDate: postScheduleType === 'LATER' ? postScheduledDate : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publish failed');
      }

      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
      }
      apiResults = data.results || {};
    } catch (err: any) {
      console.error("Failed to publish B2C post:", err);
      // Queue locally/mock results if backend fails
      postChannels.forEach(ch => {
        apiResults[ch] = { success: false, error: err.message || 'Publishing failed.' };
      });
    } finally {
      setIsPublishing(false);
    }

    setPublishResults(apiResults);

    if (selectedAdForPost) {
      saveRequests(adRequests.map(r =>
        r.id === selectedAdForPost.id ? { ...r, status: 'PUBLISHED' as const } : r
      ));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to remove this post record?')) return;
    try {
      await fetch(`http://localhost:3000/api/social/posts/${postId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn("Failed to delete post from database:", err);
    }
    setPosts(prev => prev.filter(p => p.id !== postId && p._id !== postId));
  };



  // CustomerType & Admin Access Guards (Private to Customer Credentials Only)
  const customerType = user?.customerType || 'EXPLORER';

  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
    return (
      <div className="min-h-[80vh] bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-black font-display">Client Workspace Protected</h2>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Customer creative workspaces are private and require direct client login credentials. Administrators cannot access client workspaces or create ads on their behalf without customer credentials. Please inspect and audit client assets securely inside the Admin Center.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/admin/b2c"
              className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
            >
              <span>Return to Admin B2C Manager</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    const idx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase() || u._id === user._id);
    if (idx !== -1) {
      mockUsers[idx] = { ...mockUsers[idx], ...updatedUser };
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
    alert("Product profile saved successfully for your account!");
  };


  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    let validCount = 0;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        formData.append('files', file);
        validCount++;
      }
    });

    if (validCount === 0) return;

    try {
      const res = await fetch('http://localhost:3000/api/upload/files', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.urls)) {
        setReqUploadedImages(prev => [...prev, ...data.urls]);
        return;
      }
    } catch (err) {
      console.warn("Multer upload endpoint unavailable, using base64 converter:", err);
    }

    // Fallback base64 conversion via backend /api/upload/base64
    const newImages: string[] = [];
    let count = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const res2 = await fetch('http://localhost:3000/api/upload/base64', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: reader.result })
            });
            const data2 = await res2.json();
            if (data2.url) {
              newImages.push(data2.url);
            } else {
              newImages.push(reader.result);
            }
          } catch {
            newImages.push(reader.result as string);
          }
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

    const planDef = getPlanConfig(user?.subscription);
    const userSub = planDef.name;

    // 1. Strict Video Ad Block check for Basic Plan
    if (!planDef.allowVideos && (reqAdType === 'Video' || reqAdType === 'Both')) {
      alert(`🚫 Video Ads are BLOCKED on ${userSub}. Up to ${planDef.maxProducts} products and image ads only. Please upgrade to B2C Pro or Enterprise Plan to generate video creatives.`);
      return;
    }

    // 2. Count existing ad requests for current product
    const currentProdRequests = adRequests.filter(r => r.productName === productName);
    const existingImageCount = currentProdRequests.filter(r => r.adType === 'Image' || r.adType === 'Both').length;
    const existingVideoCount = currentProdRequests.filter(r => r.adType === 'Video' || r.adType === 'Both').length;

    const maxImageAllowed = user?.imageAdsPerProduct || planDef.imageAdsPerProduct;
    const maxVideoAllowed = user?.videoAdsPerProduct || planDef.videoAdsPerProduct;

    if ((reqAdType === 'Image' || reqAdType === 'Both') && existingImageCount >= maxImageAllowed) {
      alert(`⚠️ Image Ad Request Limit Reached!\n\nYour active plan (${userSub}) allows a maximum of ${maxImageAllowed} Image Ads per product.\nYou already have ${existingImageCount} ad requests for "${productName}".\n\nPlease upgrade your plan to request more ads.`);
      return;
    }

    if ((reqAdType === 'Video' || reqAdType === 'Both') && existingVideoCount >= maxVideoAllowed) {
      alert(`⚠️ Video Ad Request Limit Reached!\n\nYour active plan (${userSub}) allows a maximum of ${maxVideoAllowed} Video Ads per product.\nYou already have ${existingVideoCount} video requests for "${productName}".\n\nPlease upgrade your plan to request more video ads.`);
      return;
    }

    // Default creatives for direct generation
    let generatedMediaUrl = reqUploadedImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
    if (reqAdType === 'Video') {
      generatedMediaUrl = 'https://assets.mixkit.co/videos/preview/mixkit-running-shoes-in-motion-41885-large.mp4';
    }

    const newReq: AdRequest = {
      id: `AD-${Date.now().toString().slice(-4)}`,
      productName: productName,
      adType: reqAdType,
      purpose: reqPurpose,
      description: reqDesc,
      headline: reqHeadline || `${brandName} Exclusive Drop`,
      cta: reqCta,
      maxWords: reqMaxWords,
      style: reqStyle,
      format: reqFormat,
      creativeUrl: generatedMediaUrl,
      creativeVersion: 1,
      status: 'APPROVED', // Direct creation without waiting for admin
      createdDate: new Date().toISOString().split('T')[0],
      productImages: reqUploadedImages
    };

    const updated = [newReq, ...adRequests];
    saveRequests(updated);
    
    setReqDesc('');
    setReqHeadline('');
    setReqUploadedImages([]);
    alert(`✨ Ad Creative Generated & Published Successfully!\n\nYour ${reqAdType} ad for "${productName}" has been created and is ready for social posting in "My Ads & Videos".`);
    setActiveView('ads');
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
          adType: isAdminCreatingAd === 'VIDEO' ? ('Video' as const) : ('Image' as const),
          headline: adminHeadline || r.headline,
          description: adminDesc || r.description,
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
    setAdminDesc('');
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
              { id: 'requests', label: 'Create Ads & Videos', icon: Sparkles },
              { id: 'ads', label: 'My Ads & Videos', icon: Film },
              { id: 'posts', label: 'Platform Posts', icon: Share2 },
              { id: 'leads', label: 'Captured Leads', icon: Users },
              { id: 'social', label: 'Social Accounts', icon: Link2 },
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

              {/* Top Reference & Support Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                    {(user?.assignedEmployeeName || 'Sarah Jenkins').split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-black text-red-600 tracking-wider">Assigned Account Specialist</div>
                    <div className="text-xs font-black text-black">{user?.assignedEmployeeName || 'Sarah Jenkins'}</div>
                    <div className="text-[10px] font-mono font-bold text-zinc-500">Ref ID: {employeeRefId}</div>
                  </div>
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
        {activeView === 'requests' && (() => {
          const planDef = getPlanConfig(user?.subscription);
          const userSub = planDef.name;
          const currentProdRequests = adRequests.filter(r => r.productName === productName);
          const existingImageCount = currentProdRequests.filter(r => r.adType === 'Image' || r.adType === 'Both').length;
          const maxImageAllowed = user?.imageAdsPerProduct || planDef.imageAdsPerProduct;
          const isLimitReached = existingImageCount >= maxImageAllowed;
          const usagePercent = Math.min(100, Math.round((existingImageCount / maxImageAllowed) * 100));

          return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
              
              {/* Plan Quota & Limit Tracker Banner */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isLimitReached 
                  ? 'bg-red-50 border-red-200 text-red-900' 
                  : 'bg-zinc-50 border-zinc-200 text-black'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-white border border-zinc-200 text-red-600 font-black text-[10px] uppercase rounded-md">
                        {userSub}
                      </span>
                      <span className="font-bold text-xs">
                        Product: <strong className="text-black font-black">{productName || 'Flagship Product'}</strong>
                      </span>
                    </div>
                    <div className="text-xs font-semibold mt-1">
                      Ad Creatives Used: <strong className="font-black">{existingImageCount}</strong> of <strong className="font-black">{maxImageAllowed}</strong> Allowed
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold">{usagePercent}% Used</span>
                    <button
                      type="button"
                      onClick={() => navigate('/pricing')}
                      className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
                    >
                      Upgrade Plan ⚡
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isLimitReached ? 'bg-red-600' : 'bg-green-600'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                {isLimitReached && (
                  <div className="mt-3 p-3 bg-red-100/80 border border-red-300 rounded-xl text-xs font-bold text-red-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      ⚠️ You have already met your subscription plan limit ({existingImageCount}/{maxImageAllowed} ads for this product). To create more ads, please choose a higher plan.
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/pricing')}
                      className="btn-shimmer px-4 py-1.5 bg-red-600 text-white font-black uppercase text-[10px] rounded-lg tracking-wider shrink-0"
                    >
                      Choose Plans & Upgrade
                    </button>
                  </div>
                )}
              </div>

              <div className="border-b border-zinc-100 pb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Direct Creator Studio</span>
                </div>
                <h2 className="text-2xl font-black text-black font-display">
                  Create Ads & Videos
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Generate image banners and video motion ads directly into your creative library with 1 click.
                </p>
              </div>
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
                      <option value="Instagram Post (1:1)">📸 Instagram Post (1:1 Square)</option>
                      <option value="Instagram Reel / Story (9:16)">📱 Instagram Reel / Story (9:16 Vertical)</option>
                      <option value="YouTube Shorts (9:16)">▶️ YouTube Shorts (9:16 Vertical)</option>
                      <option value="YouTube Video Ad (16:9)">🖥️ YouTube Video Ad (16:9 Widescreen)</option>
                      <option value="TikTok Video (9:16)">🎵 TikTok Video (9:16 Vertical)</option>
                      <option value="Facebook Feed (4:5)">👥 Facebook Feed (4:5 Post)</option>
                      <option value="X (Twitter) Feed (16:9)">𝕏 X / Twitter Feed (16:9)</option>
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

                {/* Word Count Limit & Ad Copy Studio */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Ad Copy & Marketing Text *
                    </label>
                    
                    {/* Add More Words Button & Word Count Selector */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const expanded = `🔥 EXCLUSIVE LAUNCH OFFER: Elevate your lifestyle with ${productName || 'our premium collection'} by ${brandName || 'Official Brand'}!\n\n✨ Why You'll Love It:\n• 🚀 Precision Performance: Engineered for maximum durability & superior daily comfort.\n• 🌿 Ultra-Responsive Design: Crafted with premium materials for all-day use.\n• 🛡️ 100% Risk-Free Guarantee: Full warranty with 30-day effortless returns.\n• ⚡ Fast Insured Shipping: Delivered straight to your doorstep with live tracking.\n\n🎁 Special Promo: Claim an instant 25% discount today! Tap "I'm Interested" below to claim your offer before inventory runs out.`;
                          setReqDesc(expanded);
                          setReqMaxWords(150);
                        }}
                        className="btn-shimmer px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-lg border border-red-200 transition-all flex items-center gap-1 shadow-sm"
                        title="Click to generate long-form high-converting promotional copy"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>✨ Add More Words (Auto-Expand)</span>
                      </button>

                      <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-lg text-[10px] font-bold text-zinc-600">
                        <span>Limit:</span>
                        <select
                          value={reqMaxWords}
                          onChange={e => setReqMaxWords(Number(e.target.value))}
                          className="bg-transparent font-black text-black text-[10px] focus:outline-none cursor-pointer"
                        >
                          <option value={30}>30w (Short & Punchy)</option>
                          <option value={60}>60w (Standard)</option>
                          <option value={120}>120w (Detailed Story)</option>
                          <option value={250}>250w (Long Copy)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <textarea 
                    required 
                    value={reqDesc} 
                    onChange={e => setReqDesc(e.target.value)} 
                    rows={4}
                    placeholder="Provide special bullet points, product benefits, offers, or click '✨ Add More Words' to auto-generate long copy..." 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-medium text-xs text-black resize-y focus:outline-none focus:border-red-600 leading-relaxed" 
                  />

                  {/* Word Count Live Counter */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold px-1">
                    <span>
                      Length: <strong className={reqDesc.trim().split(/\s+/).filter(Boolean).length > reqMaxWords ? 'text-amber-600' : 'text-zinc-700'}>
                        {reqDesc.trim() ? reqDesc.trim().split(/\s+/).filter(Boolean).length : 0}
                      </strong> / {reqMaxWords} words
                    </span>
                    <span className="text-zinc-400 font-medium">Use '✨ Add More Words' to instantly expand into long storytelling copy</span>
                  </div>
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

                <button type="submit" className="btn-shimmer w-full py-4 bg-red-600 text-white font-black hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Publish Ad Creative Now</span>
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
                        {isVideoMedia(req.creativeUrl, req.adType) ? (
                          <div 
                            onClick={() => setFullPreviewVideoAd({
                              mediaUrl: req.creativeUrl || '',
                              adType: req.adType,
                              headline: req.headline,
                              description: req.description,
                              brandName: brandName || 'Brand Partner',
                              format: req.format,
                              version: req.creativeVersion || 1,
                              productName: req.productName
                            })}
                            className="relative group cursor-pointer aspect-video rounded-xl overflow-hidden bg-black border border-zinc-200"
                          >
                            <video src={req.creativeUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1.5 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-[1px]">
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>▶ Watch Video Ad</span>
                            </div>
                          </div>
                        ) : (
                          <img src={req.creativeUrl} alt="Preview" className="w-full h-24 object-cover rounded-xl border border-zinc-200" />
                        )}
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
          );
        })()}

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
                      setAdminImageUrl('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');
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
                      setAdminImageUrl(SAMPLE_VIDEO_PRESETS[0].url);
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
                      {isVideoMedia(ad.creativeUrl, ad.adType) ? (
                        <div 
                          onClick={() => setFullPreviewVideoAd({
                            mediaUrl: ad.creativeUrl || '',
                            adType: ad.adType,
                            headline: ad.headline,
                            description: ad.description,
                            brandName: brandName || 'Brand Partner',
                            format: ad.format,
                            version: ad.creativeVersion || 1,
                            productName: ad.productName
                          })}
                          className="relative group cursor-pointer h-52 bg-black overflow-hidden flex items-center justify-center"
                        >
                          <video 
                            src={ad.creativeUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white font-black text-[9px] uppercase rounded-lg flex items-center gap-1 shadow-md">
                            <Play className="w-2.5 h-2.5 fill-white" />
                            <span>Video Motion Ad</span>
                          </span>
                        </div>
                      ) : (
                        <img src={ad.creativeUrl} alt="Ad creative" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
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


            {posts.filter(p => selectedChannelFilter === 'ALL' || p.channels.includes(selectedChannelFilter)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts
                  .filter(p => selectedChannelFilter === 'ALL' || p.channels.includes(selectedChannelFilter))
                  .map(post => (
                    <div key={post._id || post.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between group">
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
                          <span className="font-mono text-[9px] text-zinc-400 font-bold block">{(post._id || post.id || '').slice(-6)} • {post.publishedDate}</span>
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
                            onClick={() => handleDeletePost(post._id || post.id || '')}
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
              <div className="p-12 bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl text-center space-y-3">
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
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-black text-black text-lg">Captured Inbound Leads</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Prospects who clicked "I'm Interested" on your published ad creatives.</p>
              </div>
              <span className="px-3.5 py-1 bg-red-50 text-red-600 font-mono text-xs font-black rounded-lg border border-red-200">
                {capturedLeads.length} Total Captured
              </span>
            </div>
            {capturedLeads.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-black uppercase text-[10px]">
                    <th className="p-4">Lead ID</th>
                    <th className="p-4">Prospect Name</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Target Ad Creative</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {capturedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50/50">
                      <td className="p-4 font-mono font-bold text-red-600">{lead.id}</td>
                      <td className="p-4 font-black text-black">{lead.name}</td>
                      <td className="p-4 font-bold text-zinc-700">{lead.phone}</td>
                      <td className="p-4 text-zinc-600">{lead.email}</td>
                      <td className="p-4 font-semibold text-black max-w-xs truncate">{lead.adName}</td>
                      <td className="p-4 text-[10px] text-zinc-400 font-mono">{lead.capturedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-zinc-500 text-xs font-medium bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                <span className="text-base block">📥</span>
                <span className="font-black text-black block text-sm">No Leads Captured Yet</span>
                <p className="max-w-md mx-auto text-zinc-500 text-[11px]">
                  When potential customers click the <strong>"I'm Interested"</strong> button on your live ads, their contact details will immediately be saved here.
                </p>
              </div>
            )}
          </div>
        )}

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

        {/* 9. Social Accounts View */}
        {activeView === 'social' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-2xl font-black text-black font-display tracking-tight">Social Account Integrations</h2>
                <p className="text-xs text-zinc-500 font-medium">Link your business social accounts to enable automated instant posting.</p>
              </div>
            </div>

            {connectingPlatform ? (
              <div className="max-w-xl bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Meta Graph API Integration</span>
                    <h3 className="font-black text-black text-lg">Connect {connectingPlatform} Account</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConnectHandle('@velocity_athletics');
                        setConnectAccountId('17841400293847291');
                        setConnectToken('EAAGNO41x0BA...mock_meta_instagram_graph_api_access_token');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-colors"
                      title="Auto-fill sample credentials for instant testing"
                    >
                      ✨ Auto-Fill Demo
                    </button>
                    <button 
                      onClick={() => { setConnectingPlatform(null); setConnectHandle(''); setConnectAccountId(''); setConnectToken(''); }}
                      className="text-xs font-bold text-zinc-500 hover:text-black uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5 text-xs text-zinc-600">
                  <div className="font-black text-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>How to get your Meta / Instagram Token:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    1. Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-red-600 font-bold underline">Meta Graph API Explorer ↗</a>.<br />
                    2. Select your App & Page linked to Instagram.<br />
                    3. Add permissions <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono text-[10px]">instagram_basic</code> & <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono text-[10px]">instagram_content_publish</code>.<br />
                    4. Click <strong>Generate Access Token</strong> and paste it below.
                  </p>
                </div>

                <form onSubmit={handleConnectAccount} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Account Handle / Username *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={connectHandle}
                      onChange={(e) => setConnectHandle(e.target.value)}
                      placeholder="@yourbrand"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Instagram Business Account ID *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={connectAccountId}
                      onChange={(e) => setConnectAccountId(e.target.value)}
                      placeholder="e.g. 178414053928172..."
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Meta API Access Token (Graph API) *
                    </label>
                    <textarea 
                      required 
                      value={connectToken}
                      onChange={(e) => setConnectToken(e.target.value)}
                      rows={3}
                      placeholder="e.g. EAACW5... (Starts with EAA)"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-xs text-black focus:outline-none focus:border-red-600 resize-none leading-relaxed"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={connectSaving}
                    className="btn-shimmer w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
                  >
                    {connectSaving ? 'Saving Credential...' : `Connect ${connectingPlatform} Account`}
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SOCIAL_CHANNELS.map(platform => {
                  const connected = socialAccounts.find(a => a.platform === platform.id && a.isConnected);
                  return (
                    <div 
                      key={platform.id}
                      className="bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${platform.color}`}>
                            {platform.name}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${connected ? 'text-emerald-600' : 'text-zinc-400'}`}>
                            {connected ? '● Linked' : '○ Not Linked'}
                          </span>
                        </div>

                        {connected ? (
                          <div className="pt-2 space-y-1">
                            <div className="text-sm font-black text-black">{connected.handle}</div>
                            <div className="text-[10px] text-zinc-400 font-mono font-medium">ID: {connected.accountId}</div>
                            {connected.connectedAt && (
                              <div className="text-[9px] text-zinc-400 font-medium">Connected: {new Date(connected.connectedAt).toLocaleDateString()}</div>
                            )}
                          </div>
                        ) : (
                          <div className="pt-2 text-xs text-zinc-500 font-medium leading-relaxed min-h-[50px]">
                            {platform.apiSupported 
                              ? `Connect your business ${platform.name} account to enable auto-posting.` 
                              : `Connect for manual publishing workflow management.`
                            }
                          </div>
                        )}
                      </div>

                      {connected ? (
                        <button
                          onClick={() => handleDisconnectAccount(platform.id)}
                          className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl uppercase text-[10px] tracking-wider text-center"
                        >
                          Disconnect Account
                        </button>
                      ) : (
                        <button
                          onClick={() => setConnectingPlatform(platform.id)}
                          className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 text-black border border-zinc-200 font-bold rounded-xl uppercase text-[10px] tracking-wider text-center"
                        >
                          Connect Account
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ADMIN-ONLY CREATIVE GENERATOR MODAL */}
      {isAdminCreatingAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminCreatingAd(null)}
                  className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors flex items-center gap-1 text-xs font-bold mr-1"
                  title="Cancel"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 font-black rounded-lg text-[10px] uppercase">
                    Super Admin Studio Tool
                  </span>
                  <h2 className="text-2xl font-black text-black font-display mt-1">
                    Create Ad as {isAdminCreatingAd === 'IMAGE' ? 'Image Banner' : 'Video Creative'}
                  </h2>
                </div>
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

              {/* Description & Ad Copy with Add More Words */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Ad Body Copy & Description (More Words)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const expanded = `🔥 EXCLUSIVE LAUNCH: Elevate your lifestyle with our premium edition!\n\n✨ Why You'll Love It:\n• 🚀 Precision Performance: Engineered for maximum durability & superior daily comfort.\n• 🌿 Ultra-Responsive Design: Crafted with premium materials for all-day use.\n• 🛡️ 100% Risk-Free Guarantee: Full warranty with 30-day effortless returns.\n• ⚡ Fast Express Shipping: Delivered straight to your doorstep with live tracking.\n\n🎁 Special Offer: Claim an instant 25% discount today! Tap "I'm Interested" below to claim your offer before inventory runs out.`;
                      setAdminDesc(expanded);
                    }}
                    className="btn-shimmer px-2.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-lg border border-red-200 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>✨ Add More Words</span>
                  </button>
                </div>
                <textarea
                  value={adminDesc}
                  onChange={(e) => setAdminDesc(e.target.value)}
                  rows={3}
                  placeholder="Enter detailed advertising copy or click '✨ Add More Words'..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-medium text-xs text-black resize-none focus:outline-none focus:border-red-600 leading-relaxed"
                />
              </div>

              {/* Video Presets Library Selector (When Creating Video Ad) */}
              {isAdminCreatingAd === 'VIDEO' && (
                <div className="space-y-2 p-3 bg-red-50/60 border border-red-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-700 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-red-600" />
                      <span>Video Presets</span>
                    </span>
                    <span className="text-[9px] font-bold text-red-600">Select Template</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {SAMPLE_VIDEO_PRESETS.map((vid) => (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => setAdminImageUrl(vid.url)}
                        className={`w-full p-2 rounded-xl text-left border flex items-center gap-2.5 transition-all ${
                          adminImageUrl === vid.url 
                            ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                            : 'bg-white text-black border-zinc-200 hover:border-red-300'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-black">
                          <img src={vid.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-black truncate">{vid.name}</div>
                          <span className={`text-[9px] font-bold block ${adminImageUrl === vid.url ? 'text-red-100' : 'text-zinc-500'}`}>
                            {vid.category} • MP4 HD
                          </span>
                        </div>
                        {adminImageUrl === vid.url && (
                          <Play className="w-3 h-3 fill-white shrink-0 mr-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview Box */}
              {adminImageUrl && (
                <div className="space-y-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
                    {isAdminCreatingAd === 'VIDEO' ? 'Live Video Preview (Running)' : 'Live Image Preview'}
                  </span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black border border-zinc-200 flex items-center justify-center">
                    {isAdminCreatingAd === 'VIDEO' || isVideoMedia(adminImageUrl) ? (
                      <video 
                        src={adminImageUrl} 
                        controls 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <img src={adminImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  {isAdminCreatingAd === 'VIDEO' ? 'Video Media Asset URL (.mp4)' : 'Image Asset URL'}
                </label>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (postStep === 2) setPostStep(1);
                    else { setIsPostingModalOpen(false); setPublishResults(null); }
                  }}
                  className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors flex items-center gap-1 text-xs font-bold mr-1"
                  title={postStep === 2 ? "Back to Step 1" : "Close Modal"}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-wider mb-1">
                    <Share2 className="w-3 h-3" />
                    <span>Omnichannel Ad Dispatch</span>
                  </div>
                  <h2 className="text-xl font-black text-black font-display">
                    {postStep === 1 ? 'Configure Post & Channels (Step 1/2)' : 'Review & Live Preview (Step 2/2)'}
                  </h2>
                </div>
              </div>

              {/* Step Badges & Exit Button */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${postStep === 1 ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  1. Details
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${postStep === 2 ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  2. Preview
                </span>
                <button 
                  onClick={() => { setIsPostingModalOpen(false); setPublishResults(null); }} 
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors ml-1"
                  disabled={isPublishing}
                  title="Close and return to dashboard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isPublishing ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
                <div className="text-center">
                  <h3 className="font-black text-black text-sm">Publishing Creative Live...</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Calling platform APIs and uploading media container assets.</p>
                </div>
              </div>
            ) : publishResults ? (
              <div className="space-y-6">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                  <h3 className="text-sm font-black text-black">Omnichannel Publishing Status</h3>
                  <div className="space-y-2">
                    {Object.entries(publishResults).map(([channel, res]) => (
                      <div key={channel} className="flex justify-between items-center p-3 bg-white border border-zinc-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black">{channel}</span>
                        </div>
                        <div className="text-right">
                          {res.success ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              ✓ Posted (ID: {res.postId?.slice(-8)})
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 max-w-[220px] inline-block truncate" title={res.error}>
                              ⚠️ {res.error || 'Failed'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsPostingModalOpen(false); setPublishResults(null); setActiveView('posts'); }}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider"
                  >
                    View All Posts
                  </button>
                  <button
                    onClick={() => setPublishResults(null)}
                    className="w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-200"
                  >
                    Modify & Re-post
                  </button>
                </div>
              </div>
            ) : postStep === 1 ? (
              /* STEP 1: CONFIGURE DETAILS */
              <div className="space-y-4">
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
                      const isConnected = socialAccounts.some(a => a.platform === ch.id && a.isConnected);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => handleToggleChannel(ch.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all ${
                            isChecked 
                              ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' 
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-white'
                          }`}
                        >
                          <div className="flex w-full justify-between items-center">
                            <span>{ch.badge}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-red-600" />}
                          </div>
                          <span className={`text-[8px] font-black uppercase ${isConnected ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {isConnected ? '● Connected' : '○ Not Configured'}
                          </span>
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
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                      4. Post Caption & Social Copy *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const expanded = `🔥 EXCLUSIVE LAUNCH: Elevate your lifestyle with ${postHeadline || productName || 'our latest drop'} by ${brandName || 'Official Brand'}!\n\n✨ Why Customers Love It:\n• 🚀 Precision Engineering & Durability\n• 🌿 Ultra-Comfortable Everyday Ergonomics\n• 🛡️ 100% Satisfaction Guarantee & Fast Delivery\n\n🎁 Limited Time Offer: Tap the link below to get 25% OFF your order today! #ad #${(brandName || 'Brand').toLowerCase().replace(/\s+/g, '')} #exclusive`;
                        setPostCaption(expanded);
                      }}
                      className="btn-shimmer px-2.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-lg border border-red-200 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>✨ Add More Words (Expand)</span>
                    </button>
                  </div>
                  <textarea
                    required
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    rows={4}
                    placeholder="Enter social caption or click '✨ Add More Words' to auto-generate full caption..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-medium text-xs text-black focus:outline-none focus:border-red-600 resize-y leading-relaxed"
                  />
                  <div className="text-[10px] text-zinc-400 font-medium text-right">
                    {postCaption.trim() ? postCaption.trim().split(/\s+/).filter(Boolean).length : 0} words
                  </div>
                </div>

                {/* Schedule Type */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                    5. Dispatch Schedule
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

                {/* Step 1 Action Buttons: Return/Cancel vs Next Page */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsPostingModalOpen(false); setPublishResults(null); }}
                    className="w-full sm:w-1/2 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 transition-colors"
                  >
                    ← Cancel / Return to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!postHeadline.trim() || !postCaption.trim()) {
                        alert("Please fill in Post Headline and Caption before proceeding.");
                        return;
                      }
                      if (postChannels.length === 0) {
                        alert("Please select at least one social media channel.");
                        return;
                      }
                      setPostStep(2);
                    }}
                    className="btn-shimmer w-full sm:w-1/2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Next: Live Feed Preview</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: REVIEW & LIVE PREVIEW */
              <div className="space-y-5">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Live Post Simulation</span>
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-full">Ready to Dispatch</span>
                  </div>

                  {/* Simulated Social Post Card */}
                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs">
                        {(brandName || 'AD').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-black text-black">{brandName || 'Brand Sponsor'}</div>
                        <div className="text-[9px] text-zinc-400 font-semibold">Sponsored • {postChannels.join(', ')}</div>
                      </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <img src={postMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase shadow-md">
                        I'm Interested
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-black text-black">{postHeadline}</div>
                      <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed">{postCaption}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 pt-1">
                    <span>Dispatch Mode: <strong>{postScheduleType === 'NOW' ? '🚀 Instant Publishing' : `📅 Scheduled (${postScheduledDate})`}</strong></span>
                    <span>Channels: <strong>{postChannels.length} Selected</strong></span>
                  </div>
                </div>

                {/* Step 2 Action Buttons: Back, Cancel & Publish */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPostStep(1)}
                    className="w-full sm:w-1/3 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 transition-colors"
                  >
                    ← Back to Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsPostingModalOpen(false); setPublishResults(null); }}
                    className="w-full sm:w-1/3 py-3.5 bg-white hover:bg-zinc-50 text-zinc-600 font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-200 transition-colors"
                  >
                    Cancel & Exit
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishPost}
                    disabled={isPublishing}
                    className="btn-shimmer w-full sm:w-1/3 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20"
                  >
                    {postScheduleType === 'NOW' ? '🚀 Publish Live' : 'Confirm Schedule'}
                  </button>
                </div>
              </div>
            )}
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
                <button
                  onClick={() => setInterestedModalAd(previewingPost)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm transition-all"
                >
                  I'm Interested
                </button>
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

      {/* LEAD CAPTURE MODAL: "I'm Interested" */}
      {interestedModalAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
                  Prospect Inbound Capture
                </span>
                <h3 className="text-xl font-black text-black font-display mt-1">I'm Interested!</h3>
                <p className="text-xs text-zinc-500 font-medium">Leave your contact info to get exclusive details & pricing.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setInterestedModalAd(null)}
                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-1 border border-zinc-200"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Go Back</span>
                </button>
                <button 
                  onClick={() => setInterestedModalAd(null)}
                  className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCaptureLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setInterestedModalAd(null)}
                  className="w-1/2 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs border border-zinc-300 transition-colors"
                >
                  ← Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shimmer w-1/2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20"
                >
                  Submit & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN MULTI-PLATFORM LIVE AD INSPECTION MODAL */}
      {fullPreviewVideoAd && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-zinc-900 text-white flex justify-between items-center border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFullPreviewVideoAd(null)}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 transition-colors flex items-center gap-1 mr-1"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">Multi-App Live Ad Simulator</span>
              </div>
              <button
                onClick={() => setFullPreviewVideoAd(null)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Multi-App Simulator Area */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50 flex-1">
              <AppPlatformAdMockup
                mediaUrl={fullPreviewVideoAd.mediaUrl}
                isVideo={fullPreviewVideoAd.adType === 'Video' || isVideoMedia(fullPreviewVideoAd.mediaUrl)}
                brandName={fullPreviewVideoAd.brandName || brandName || 'Brand Partner'}
                headline={fullPreviewVideoAd.headline}
                description={fullPreviewVideoAd.description}
                productName={fullPreviewVideoAd.productName}
                initialFormat={fullPreviewVideoAd.format || 'INSTAGRAM_POST'}
                allowFormatSwitching={true}
                onInterestClick={() => {
                  setInterestedModalAd({
                    id: `AD-${Date.now().toString().slice(-4)}`,
                    productName: fullPreviewVideoAd.productName || fullPreviewVideoAd.headline,
                    headline: fullPreviewVideoAd.headline,
                    description: fullPreviewVideoAd.description,
                    adType: 'Video',
                    purpose: 'Lead Gen',
                    cta: "I'm Interested",
                    maxWords: 60,
                    style: 'Modern',
                    format: fullPreviewVideoAd.format || 'Instagram Reel',
                    status: 'APPROVED',
                    createdDate: new Date().toISOString().split('T')[0]
                  });
                  setFullPreviewVideoAd(null);
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-zinc-200 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-mono font-bold text-zinc-400">STATUS: APPROVED & OMNICHANNEL READY</span>
              <button
                onClick={() => setFullPreviewVideoAd(null)}
                className="px-5 py-2.5 bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-300 font-bold text-xs uppercase rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Close & Return</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

