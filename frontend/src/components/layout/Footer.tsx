import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, CheckCircle2, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-white border-t border-zinc-200 pt-20 pb-10 text-zinc-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter CTA Strip */}
        <div className="bg-zinc-50 rounded-3xl p-8 sm:p-10 border border-zinc-200 mb-16 relative overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Stay Ahead in Ad Tech</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-display">
                Get Weekly High-Converting <span className="text-red-600">Ad Formulas</span>
              </h3>
              <p className="text-zinc-600 text-sm max-w-xl font-medium">
                Join 14,000+ top marketers and brand founders. We send prompt recipes, viral creative breakdowns, and algorithm updates.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex-1 max-w-md">
              {subscribed ? (
                <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold justify-center animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                  <span>You're subscribed! Check your inbox for our 50+ Ad Hook Templates.</span>
                </div>
              ) : (
                <div className="flex gap-2 p-1.5 bg-white border border-zinc-300 rounded-2xl focus-within:border-red-600 transition-all shadow-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-black placeholder-zinc-400 focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="btn-shimmer px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-2 shrink-0"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight font-display text-black">
                AD<span className="text-red-600">HUNTER</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-sm font-medium">
              The automated creative studio for e-commerce, scale-ups, and agencies. Generate high-velocity image & video ads, push to all ad networks in one click, and scale pipeline without fatigue.
            </p>
            
            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span>All Ad Rendering Clusters: Operational</span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {['𝕏', 'in', 'ig', 'yt', 'fb'].map((icon, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center font-bold text-black hover:text-white hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Column 1: Capabilities */}
          <div>
            <h4 className="font-bold text-black mb-6 uppercase tracking-wider text-xs font-display">Ad Engine</h4>
            <ul className="space-y-3.5 text-sm font-semibold text-zinc-600">
              <li><Link to="/explore" className="hover:text-red-600 transition-colors">AI Image Ads</Link></li>
              <li><Link to="/explore" className="hover:text-red-600 transition-colors">AI Video & Reels</Link></li>
              <li><Link to="/explore" className="hover:text-red-600 transition-colors">Bulk Ad Launcher</Link></li>
              <li><Link to="/explore" className="hover:text-red-600 transition-colors">Omnichannel Dispatch</Link></li>
              <li><Link to="/pricing" className="hover:text-red-600 transition-colors">Done-For-You Agency</Link></li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="font-bold text-black mb-6 uppercase tracking-wider text-xs font-display">Platform</h4>
            <ul className="space-y-3.5 text-sm font-semibold text-zinc-600">
              <li><Link to="/pricing" className="hover:text-red-600 transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/explore" className="hover:text-red-600 transition-colors">Ad Showcase</Link></li>
              <li><Link to="/contact" className="hover:text-red-600 transition-colors">Enterprise Custom</Link></li>
              <li><Link to="/login" className="hover:text-red-600 transition-colors">Client Portal</Link></li>
              <li><Link to="/join" className="hover:text-red-600 transition-colors">Create Free Account</Link></li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <h4 className="font-bold text-black mb-6 uppercase tracking-wider text-xs font-display">Trust & Security</h4>
            <ul className="space-y-3.5 text-sm font-semibold text-zinc-600">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-red-600" /> SOC2 Type II Ready</li>
              <li className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-red-600" /> 99.9% Render SLA</li>
              <li><Link to="/contact" className="hover:text-red-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-red-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-red-600 transition-colors">Security Overview</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-zinc-500 font-medium">
            © {new Date().getFullYear()} AD-HUNTER Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-zinc-600 font-semibold">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600 inline-block animate-pulse" />
            <span>for Growth-Obsessed Marketers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

