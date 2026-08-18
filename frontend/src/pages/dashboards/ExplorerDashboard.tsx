import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Building2, ShoppingBag, ArrowRight, 
  CheckCircle2, Shield
} from 'lucide-react';



export default function ExplorerDashboard() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // If user is already B2B or B2C, redirect them to their respective dashboard
  const userCustomerType = user?.customerType || 'EXPLORER';
  if (userCustomerType === 'B2B') {
    navigate('/b2b');
  } else if (userCustomerType === 'B2C') {
    navigate('/b2c');
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Top Header Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black text-black font-display tracking-tight leading-tight">
            Welcome to <span className="text-red-600">AD-HUNTER</span> Workspace
          </h1>


          <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed">
            You are currently in <strong>Explorer</strong> mode. Explore our platform architecture below and choose how you wish to operate. Selecting an option will guide you to your profile to review and confirm your permanent account type.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/explorer/free-ad"
              className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/20 transition-all"
            >
              <span>Launch 1 Free AI Ad Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-black font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Manage Profile & Choose Type</span>
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
