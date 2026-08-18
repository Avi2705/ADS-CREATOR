import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, Zap, Flame, ArrowRight, Play, CheckCircle2, 
  Layers, Share2, Users, Sliders, 
  ChevronDown, ChevronUp, Rocket
} from 'lucide-react';

export default function Home() {
  const { user } = useSelector((state: any) => state.auth);

  // Smart CTA link based on auth and customerType
  const customerType = user?.customerType || 'EXPLORER';
  const freeAdLink = !user 
    ? '/login?redirect=free-ad' 
    : customerType === 'B2B'
      ? '/b2b'
      : customerType === 'B2C'
        ? '/b2c'
        : user.freeAdsUsed >= 1 || user.freeAdGenerated
          ? '/profile'
          : '/explorer/free-ad';


  // Interactive Ad Studio State
  const [adCategory, setAdCategory] = useState<'sneaker' | 'watch' | 'car' | 'audio' | 'cosmetic'>('sneaker');
  const [adHeadline, setAdHeadline] = useState('UNLEASH VELOCITY');
  const [adSize, setAdSize] = useState<'square' | 'story' | 'landscape'>('square');
  const [adPromoTag, setAdPromoTag] = useState('50% OFF TODAY');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Active Feature Tab
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // ROI Calculator State
  const [monthlySpend, setMonthlySpend] = useState(2500);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);


  const marqueeColumn1 = [
    { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&fit=crop', title: 'Nike Velocity Run', tag: '34% CONV', stat: '5.4x ROAS' },
    { img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&fit=crop', title: 'Apple Watch Series', tag: 'HOT DEAL', stat: '4.9x ROAS' },
    { img: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=500&fit=crop', title: 'Audi RS Edition', tag: 'LIMITED', stat: '6.1x ROAS' },
    { img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&fit=crop', title: 'Noir Parfumerie', tag: 'VIRAL', stat: '5.8x ROAS' },
    { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&fit=crop', title: 'Sony Studio Pro', tag: 'NEW', stat: '5.1x ROAS' },
  ];

  const marqueeColumn2 = [
    { img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&fit=crop', title: 'Ferrari F8 Tributo', tag: 'VIP LAUNCH', stat: '8.2x ROAS' },
    { img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&fit=crop', title: 'Air Jordan Retro', tag: 'TOP SELLER', stat: '4.7x ROAS' },
    { img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&fit=crop', title: 'Bespoke Leather', tag: 'AUTUMN 26', stat: '4.2x ROAS' },
    { img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&fit=crop', title: 'Polaroid Instant', tag: 'TRENDING', stat: '4.5x ROAS' },
  ];

  const categories = [
    { id: 'sneaker', name: '👟 Streetwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop', defaultHeadline: 'UNLEASH VELOCITY' },
    { id: 'watch', name: '⌚ Luxury Watch', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&fit=crop', defaultHeadline: 'TIMELESS LUXURY' },
    { id: 'car', name: '🏎️ Supercar', img: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&fit=crop', defaultHeadline: 'PRECISION MEETS POWER' },
    { id: 'audio', name: '🎧 Pro Audio', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop', defaultHeadline: 'HEAR THE UNHEARD' },
    { id: 'cosmetic', name: '💄 Fragrance', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&fit=crop', defaultHeadline: 'PURE ELEGANCE' },
  ];

  const handleCategoryChange = (catId: any) => {
    setAdCategory(catId);
    const selected = categories.find(c => c.id === catId);
    if (selected) setAdHeadline(selected.defaultHeadline);
  };

  const handleSimulatePublish = () => {
    setIsPublishing(true);
    setPublishSuccess(false);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    }, 1500);
  };

  // ROI Derived Values
  const estimatedAds = Math.round(monthlySpend / 18);
  const estimatedReach = (monthlySpend * 140).toLocaleString();
  const estimatedLeads = Math.round(monthlySpend * 0.42);
  const agencySavings = Math.round(monthlySpend * 1.85).toLocaleString();

  const currentCategoryData = categories.find(c => c.id === adCategory) || categories[0];

  const featureTabs = [
    {
      title: 'AI Image Engine',
      icon: Layers,
      headline: 'Photorealistic Studio Visuals in 1 Click',
      desc: 'Our neural rendering engine removes backgrounds, injects cinematic 3D lighting, and renders dynamic product staging tailored for high-converting social feeds.',
      metrics: ['+340% Higher Click-Through Rate', '4K Ultra-HD Export', 'Automatic Color Grading'],
      previewUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&fit=crop'
    },
    {
      title: 'AI Video & Reels',
      icon: Flame,
      headline: 'Automated Viral Hooks & Micro-Transitions',
      desc: 'Generate ready-to-run TikToks, YouTube Shorts, and Instagram Reels with kinetic captions, beat-synced transitions, and psychological buying hooks.',
      metrics: ['Under 60s Generation Time', 'Auto-Captions & Soundtracks', '9:16 Mobile Optimized'],
      previewUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=700&fit=crop'
    },
    {
      title: 'Omnichannel Dispatch',
      icon: Share2,
      headline: 'Zero-Click Multi-Network Publishing',
      desc: 'Directly dispatch approved creatives to Meta Ads Manager, TikTok for Business, X, and Google PMax without downloading or juggling multiple dashboards.',
      metrics: ['Direct Meta & TikTok API Integration', 'Scheduled Timezone Drops', 'Real-Time Pixel Sync'],
      previewUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=700&fit=crop'
    },
    {
      title: 'Lead & Conversion CRM',
      icon: Users,
      headline: 'Instant Lead Capture & Webhook Routing',
      desc: 'Every lead from your ads is ingested straight into your centralized CRM with automatic qualification scores, custom tagging, and webhook alerts to Slack or CRM.',
      metrics: ['Instant SMS & Email Notifications', 'CSV & Webhook Export', 'Full Attribution Tracking'],
      previewUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700&fit=crop'
    }
  ];

  const faqs = [
    {
      q: 'How does AD-HUNTER generate ads from just a product link or photo?',
      a: 'Our multimodal AI analyzes your product imagery, extracts key value propositions, generates compelling marketing hooks, and composites studio-quality lighting and badges in under 60 seconds.'
    },
    {
      q: 'Can I connect my direct Meta, Instagram, and TikTok ad accounts?',
      a: 'Yes! Our B2B SaaS portal allows 1-click OAuth connections to Meta Business Suite, TikTok Ads Manager, X Ads, and Google Ads so you can launch campaigns directly.'
    },
    {
      q: 'What is the difference between B2B and B2C plans?',
      a: 'B2B SaaS is built for self-serve brands and in-house creative teams with full multi-seat asset management. B2C is our hands-off, Done-For-You agency service where our creative team delivers finished campaigns ready to approve.'
    },
    {
      q: 'Do you offer a free trial or prototype generator?',
      a: 'Yes! You can test our interactive ad creator right on this page, or sign up for free to generate your first 5 high-converting ad variations with zero credit card required.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span>Next-Gen AI Ad Engine 3.0</span>
              <span className="text-zinc-300">|</span>
              <span className="text-black font-bold">1-Click Multi-Channel Push</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display leading-[1.05] text-black">
              Turn Any Product Into <br />
              <span className="text-red-600">High-Converting Ads</span> <br />
              In Seconds.
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-zinc-600 font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Automate your entire advertising pipeline. Generate high-velocity image & video creatives, launch across Instagram, TikTok & YouTube, and collect qualified leads on autopilot.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={freeAdLink}
                className="btn-shimmer w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-xs bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center"
              >
                <span>{user?.freeAdGenerated ? 'View Subscription Plans' : 'Generate Your First Ad Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a 
                href="#ad-studio"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 transition-all flex items-center justify-center gap-2 text-center"
              >
                <Play className="w-4 h-4 fill-red-600 text-red-600" />
                <span>Test Live Studio Demo</span>
              </a>
            </div>


            {/* Social Proof Stats Mini Strip */}
            <div className="pt-6 border-t border-zinc-200 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs font-semibold text-zinc-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span className="font-bold text-black">1.2M+</span> Ads Generated
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span className="font-bold text-black">4.8x</span> Average ROAS
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span className="font-bold text-black">14,000+</span> Growth Brands
              </div>
            </div>

          </div>

          {/* Right Column: 3D Infinite Marquee Showcase */}
          <div className="lg:col-span-5 relative h-[520px] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            
            {/* Top & Bottom Marquee Gradients */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-zinc-50 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-50 to-transparent z-20 pointer-events-none"></div>

            {/* Floating Live Indicator Badge */}
            <div className="absolute top-6 left-6 z-30 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200 text-[11px] font-black text-black flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span>LIVE CONVERTING PIPELINE</span>
            </div>

            {/* Dual Column Marquee */}
            <div className="grid grid-cols-2 gap-4 h-full">
              
              {/* Column 1 (Scroll Up) */}
              <div className="space-y-4 animate-marquee">
                {[...marqueeColumn1, ...marqueeColumn1].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:border-red-500 transition-all group"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden bg-zinc-100">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-black uppercase">
                        {item.tag}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                        <div className="font-black text-xs truncate">{item.title}</div>
                        <div className="text-[10px] text-red-400 font-bold">{item.stat}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2 (Scroll Down) */}
              <div className="space-y-4 animate-marquee-reverse">
                {[...marqueeColumn2, ...marqueeColumn2].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:border-red-500 transition-all group"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden bg-zinc-100">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black text-white text-[9px] font-black uppercase">
                        {item.tag}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                        <div className="font-black text-xs truncate">{item.title}</div>
                        <div className="text-[10px] text-red-400 font-bold">{item.stat}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE LIVE AD STUDIO SANDBOX */}
      <section id="ad-studio" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Interactive Ad Sandbox</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight font-display">
              Experience The <span className="text-red-600">Ad Creation Engine</span> Live
            </h2>

            <p className="text-zinc-600 text-base font-normal">
              Switch product verticals, customize headlines, toggle aspect ratios, and test automated dispatch to Meta & TikTok.
            </p>
          </div>

          {/* Interactive Studio Panel */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Controls Box */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Category Picker */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">1. Select Product Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-xl text-xs font-bold text-left transition-all border ${
                        adCategory === cat.id
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-zinc-50 text-black border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">2. Customize Ad Headline</label>
                <input
                  type="text"
                  value={adHeadline}
                  onChange={(e) => setAdHeadline(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:outline-none focus:border-red-600 text-sm transition-all"
                  placeholder="e.g. UNLEASH VELOCITY"
                />
              </div>

              {/* Promo Urgency Badge */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">3. Urgency Tag</label>
                <div className="flex flex-wrap gap-2">
                  {['50% OFF TODAY', 'LIMITED RELEASE', 'FREE WORLDWIDE SHIPPING', 'SELLING FAST'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setAdPromoTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        adPromoTag === tag
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">4. Channel Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAdSize('square')}
                    className={`py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      adSize === 'square'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-zinc-50 text-black border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    1:1 Square (Feed)
                  </button>
                  <button
                    onClick={() => setAdSize('story')}
                    className={`py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      adSize === 'story'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-zinc-50 text-black border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    9:16 Story (TikTok)
                  </button>
                  <button
                    onClick={() => setAdSize('landscape')}
                    className={`py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      adSize === 'landscape'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-zinc-50 text-black border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    16:9 Landscape (YT)
                  </button>
                </div>
              </div>

              {/* Simulate Dispatch Button */}
              <div className="pt-2">
                <button
                  onClick={handleSimulatePublish}
                  disabled={isPublishing}
                  className="btn-shimmer w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Dispatching to Meta & TikTok Graph API...
                    </span>
                  ) : publishSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Successfully Dispatched Live Campaign!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      1-Click Dispatch Ad To Meta / TikTok
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* Right Live Ad Preview Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-zinc-100 rounded-2xl border border-zinc-200">
              
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                <span>Live Studio Render Canvas ({adSize === 'square' ? '1080x1080' : adSize === 'story' ? '1080x1920' : '1920x1080'})</span>
              </div>

              {/* Simulated Ad Container */}
              <div 
                className={`relative rounded-2xl overflow-hidden border-2 border-zinc-300 shadow-md transition-all duration-500 bg-white ${
                  adSize === 'square' ? 'w-full max-w-[340px] aspect-square' :
                  adSize === 'story' ? 'w-full max-w-[260px] aspect-[9/16]' :
                  'w-full max-w-[420px] aspect-[16/9]'
                }`}
              >
                <img
                  src={currentCategoryData.img}
                  alt={currentCategoryData.name}
                  className="w-full h-full object-cover"
                />

                {/* Ad Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 flex flex-col justify-between p-5 text-white">
                  
                  {/* Top Bar inside Ad */}
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                      {adPromoTag}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                      Sponsored
                    </span>
                  </div>

                  {/* Bottom Bar inside Ad */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-display drop-shadow-md text-white">
                        {adHeadline}
                      </h3>
                      <p className="text-[11px] text-zinc-200 font-medium line-clamp-1 drop-shadow">
                        Engineered for ultimate performance. Available now for delivery.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button className="px-4 py-2 rounded-lg bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span>Shop Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[10px] text-zinc-300 font-bold">
                        ⭐⭐⭐⭐⭐ (4.9/5)
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Engagement Stats Simulator Strip */}
              <div className="w-full max-w-[340px] grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                  <div className="text-[9px] font-bold uppercase text-zinc-500">Impressions</div>
                  <div className="text-sm font-black text-black">48.2k</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                  <div className="text-[9px] font-bold uppercase text-zinc-500">CTR</div>
                  <div className="text-sm font-black text-red-600">5.4%</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                  <div className="text-[9px] font-bold uppercase text-zinc-500">ROAS</div>
                  <div className="text-sm font-black text-red-600">6.2x</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE FEATURE SHOWCASE TABS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-red-600" />
              <span>Complete Ad Infrastructure</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight font-display">
              Built For Maximum <span className="text-red-600">Pipeline Velocity</span>
            </h2>

            <p className="text-zinc-600 text-base">
              Everything required to scale ad asset production from 5 creatives a month to 500+ creatives a day.
            </p>
          </div>

          {/* Tabs Selector */}
          <div className="flex flex-wrap justify-center gap-3">
            {featureTabs.map((tab, idx) => {
              const TabIcon = tab.icon;
              const isActive = activeFeatureTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveFeatureTab(idx)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                    isActive
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                      : 'bg-zinc-100 text-black border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Card Showcase */}
          <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase">
                <span>Feature 0{activeFeatureTab + 1}</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-black font-display leading-tight">
                {featureTabs[activeFeatureTab]!.headline}
              </h3>

              <p className="text-zinc-600 text-base leading-relaxed">
                {featureTabs[activeFeatureTab]!.desc}
              </p>

              <div className="space-y-3 pt-2">
                {featureTabs[activeFeatureTab]!.metrics.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-black">
                    <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{m}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to={freeAdLink}
                  className="btn-shimmer inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/20"
                >
                  <span>Launch {featureTabs[activeFeatureTab]!.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-300 shadow-md bg-white">
                <img
                  src={featureTabs[activeFeatureTab]!.previewUrl}
                  alt={featureTabs[activeFeatureTab]!.title}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] font-bold text-red-400 uppercase">Neural Processing Unit</span>
                    <div className="text-base font-black font-display">Automated Resolution & Composition Synthesis</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. REAL-TIME ROI & PERFORMANCE CALCULATOR */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-red-600" />
              <span>Real-Time ROI Modeling</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight font-display">
              Calculate Your <span className="text-red-600">Agency Cost Savings</span>
            </h2>

            <p className="text-zinc-600 text-base">
              Slide to adjust your monthly ad creation budget and see instant volume & reach projections.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-sm space-y-10">
            
            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Current Monthly Creative Budget</label>
                <span className="text-3xl font-black text-red-600 font-display">₹{monthlySpend.toLocaleString()}</span>
              </div>
              
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />

              <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                <span>₹500 / mo</span>
                <span>₹10,000 / mo</span>
                <span>₹25,000+ / mo</span>
              </div>
            </div>

            {/* Calculated Output Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 text-center">
                <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Ad Variations / mo</div>
                <div className="text-3xl font-black text-black font-display">{estimatedAds}</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-semibold">vs 4 from agency</div>
              </div>

              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 text-center">
                <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Est. Audience Reach</div>
                <div className="text-3xl font-black text-black font-display">{estimatedReach}</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-semibold">Targeted Impressions</div>
              </div>

              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 text-center">
                <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Projected Leads</div>
                <div className="text-3xl font-black text-red-600 font-display">+{estimatedLeads}</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-semibold">Qualified Prospects</div>
              </div>

              <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center">
                <div className="text-[10px] font-bold uppercase text-red-600 mb-1">Agency Savings</div>
                <div className="text-3xl font-black text-red-600 font-display">₹{agencySavings}</div>
                <div className="text-[10px] text-red-700 mt-1 font-bold">Retainer Saved</div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/pricing"
                className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-xs tracking-wider shadow-md shadow-red-600/20"
              >
                <span>View Plans & Lock In Savings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight font-display">
              Frequently Asked <span className="text-red-600">Questions</span>
            </h2>
            <p className="text-zinc-600 text-base">
              Everything you need to know about setting up and automating your ad pipeline.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 transition-all cursor-pointer hover:border-red-500"
                >
                  <div className="flex justify-between items-center gap-4">
                    <h4 className="text-base font-bold text-black font-display">{faq.q}</h4>
                    <div className="p-1.5 rounded-full bg-white text-red-600 border border-zinc-200 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  {isOpen && (
                    <p className="text-sm text-zinc-600 font-medium leading-relaxed mt-4 pt-4 border-t border-zinc-200 animate-in fade-in duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. BOTTOM HIGH-CONVERTING CTA BANNER */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Setup • No Credit Card Required</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight font-display text-white">
            Ready to Multiply Your Ad Pipeline by <span className="text-red-500">10x</span>?
          </h2>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-normal">
            Join 14,000+ brands and agencies turning product catalogs into revenue-generating social ads today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={freeAdLink}
              className="btn-shimmer w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-wider text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{user?.freeAdGenerated ? 'Upgrade to Active Plan' : 'Generate Your First Ad Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>


            <Link
              to="/explore"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 transition-all text-center"
            >
              Explore Winning Ads
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
