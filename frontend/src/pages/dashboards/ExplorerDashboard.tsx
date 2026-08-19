import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Building2, ShoppingBag, ArrowRight, 
  CheckCircle2, Shield, Sparkles, Check 
} from 'lucide-react';

export default function ExplorerDashboard() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // If user is already B2B or B2C, redirect them to their respective dashboard
  const userCustomerType = user?.customerType || 'EXPLORER';
  
  useEffect(() => {
    if (userCustomerType === 'B2B') {
      navigate('/b2b', { replace: true });
    } else if (userCustomerType === 'B2C') {
      navigate('/b2c', { replace: true });
    }
  }, [userCustomerType, navigate]);

  if (userCustomerType === 'B2B' || userCustomerType === 'B2C') {
    return (
      <div className="w-full min-h-[60vh] bg-white flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-zinc-200 border-t-red-600 animate-spin" />
          <div className="text-xs font-black text-zinc-600 uppercase tracking-wider">
            Loading your {userCustomerType === 'B2B' ? 'B2B SaaS Dashboard' : 'B2C Client Portal'}...
          </div>
        </div>
      </div>
    );
  }

  const freeAdsUsed = user?.freeAdsUsed ?? (user?.freeAdGenerated ? 1 : 0);
  const freeAdsAllowed = user?.freeAdsAllowed ?? 1;
  const isFreeAdUsed = freeAdsUsed >= freeAdsAllowed;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Free Ad Signup Entitlement Callout */}
        {!isFreeAdUsed ? (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-red-600/20">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Signup Reward • 0 Payment Required</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                Create Your 1 Free AI Advertisement
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl leading-relaxed">
                As a new member, you can generate 1 full commercial visual ad with AI copy hooks, audience targeting, and script — completely free without making any payment.
              </p>
            </div>

            <Link
              to="/explorer/free-ad"
              className="btn-shimmer px-8 py-4 bg-white hover:bg-zinc-100 text-red-600 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shrink-0 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Create 1 Free Ad Now</span>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-black">1 Free Ad Generated & Claimed</h3>
                <p className="text-xs text-zinc-500 font-medium">Your free ad is active in the studio. Choose B2B or B2C below to unlock unlimited campaign deliverables.</p>
              </div>
            </div>

            <Link
              to="/explorer/free-ad"
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl border border-zinc-200 shrink-0 transition-colors"
            >
              View Generated Ad →
            </Link>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-red-600" />
            <span>Workspace Explorer Mode</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-black font-display tracking-tight leading-tight">
            Welcome to <span className="text-red-600">AD-HUNTER</span> Workspace
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Explore our dual operating platforms below. When you are ready, choose either <strong>B2B Business SaaS</strong> or <strong>B2C Creative Client</strong> in your profile to activate your full commercial workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/explorer/free-ad"
              className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/20 transition-all"
            >
              <span>AI Free Ad Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-black font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Choose Account Type in Profile</span>
            </Link>
          </div>
        </div>


        {/* Dual Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: B2B Business SaaS */}
          <div className="bg-white border-2 border-zinc-200 hover:border-red-600 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7 text-red-500" />
                </div>
                <span className="px-3 py-1 bg-zinc-100 border border-zinc-200 text-[10px] font-black uppercase text-zinc-700 rounded-full">
                  Self-Serve SaaS
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-black font-display tracking-tight">
                  B2B Business Platform
                </h2>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                  For brands, agencies, and in-house growth teams managing multi-product catalogs, self-serve automated campaigns, and direct Meta/TikTok API integrations.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Included Capabilities</span>
                <ul className="space-y-2.5 text-xs font-semibold text-zinc-800">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Full B2B SaaS Dashboard & Campaign Manager</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Multi-Product Catalog Management & Analytics</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Direct Meta Ads, TikTok & Google PMax OAuth Dispatch</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Centralized Lead Capture & Webhook Routing</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/profile?edit=true&type=B2B"
                className="btn-shimmer w-full py-4 rounded-2xl bg-black hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all text-center"
              >
                <span>Choose B2B & Complete Profile</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </Link>
            </div>
          </div>

          {/* Card 2: B2C Done-For-You Agency Client */}
          <div className="bg-white border-2 border-zinc-200 hover:border-red-600 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shadow-red-600/20">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-red-50 border border-red-200 text-[10px] font-black uppercase text-red-600 rounded-full">
                  Done-For-You Agency
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-black font-display tracking-tight">
                  B2C Brand Creative Client
                </h2>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                  For creators, boutique shops, and makers who want professional Done-For-You advertising image & video creatives delivered directly to their client portal.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Included Capabilities</span>
                <ul className="space-y-2.5 text-xs font-semibold text-zinc-800">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Dedicated B2C Customer Portal (`/b2c`)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>1-Click Ad Creative Requests with Headline & Style Customization</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Studio AI Image Banners & Automated Video Reels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Dedicated Assigned Staff Specialists & Live Revision Requests</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/profile?edit=true&type=B2C"
                className="btn-shimmer w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all text-center"
              >
                <span>Choose B2C & Complete Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Transition Invariant Note */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-red-700 font-black text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Controlled State Transition Rule</span>
          </div>
          <p className="text-xs text-zinc-700 font-medium leading-relaxed">
            Clicking an account type above will open your <strong>Profile Editor</strong>. Selecting an option does not automatically activate it—you must review and explicitly click <strong>[Save Profile]</strong>. Once saved as B2B or B2C, your commercial account type is locked.
          </p>
        </div>

      </div>
    </div>
  );
}
