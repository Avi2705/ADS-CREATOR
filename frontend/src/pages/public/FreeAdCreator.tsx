import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, CheckCircle2, Lock, AlertCircle 
} from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

export default function FreeAdCreator() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Footwear');
  const [targetAudience, setTargetAudience] = useState('Young adults age 18-35, fitness enthusiasts');
  const [offerHook, setOfferHook] = useState('50% OFF FLASH SALE');
  const [adFormat, setAdFormat] = useState<'1:1' | '9:16' | '16:9'>('1:1');
  const [themeStyle] = useState('Cinematic 3D Studio');
  const [sampleImage, setSampleImage] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop');

  // Generation Simulation State
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedAd, setGeneratedAd] = useState<any | null>(null);

  // Check if user has already generated their 1 free ad
  const hasUsedFreeAd = user?.freeAdGenerated || false;

  const sampleProducts = [
    { name: 'Nike Velocity Run', cat: 'Footwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop' },
    { name: 'Noir Eau de Parfum', cat: 'Cosmetics', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&fit=crop' },
    { name: 'Sony Studio Pro Headphone', cat: 'Tech', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop' },
    { name: 'Apex Chronograph Watch', cat: 'Luxury', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&fit=crop' },
  ];

  const handleSelectSample = (sample: any) => {
    setProductName(sample.name);
    setCategory(sample.cat);
    setSampleImage(sample.img);
  };

  const handleGenerateFreeAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) {
      alert("Please enter your product or brand name.");
      return;
    }

    if (hasUsedFreeAd) {
      alert("You have already used your 1 free ad generation trial. Please select a plan to unlock unlimited ad creations.");
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      const newAd = {
        headline: offerHook ? `${productName.toUpperCase()} — ${offerHook}` : `${productName.toUpperCase()} — EXCLUSIVE DROP`,
        productName,
        category,
        format: adFormat,
        themeStyle,
        image: sampleImage,
        conversionScore: '94/100',
        projectedRoas: '5.2x',
        createdAt: new Date().toLocaleDateString()
      };

      setGeneratedAd(newAd);

      // Mark user as having used their 1 free ad
      const updatedUser = {
        ...user,
        freeAdGenerated: true,
        freeAdData: newAd
      };

      dispatch(setCredentials({ user: updatedUser, token: 'mock-jwt-token' }));

      // Update in mock_users DB
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const idx = mockUsers.findIndex((u: any) => u.email === user?.email);
      if (idx !== -1) {
        mockUsers[idx] = updatedUser;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }

      // Update in mock_leads DB so Super Admin detects this trial ad
      const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      const leadIdx = mockLeads.findIndex((l: any) => l.email === user?.email);
      if (leadIdx !== -1) {
        mockLeads[leadIdx] = {
          ...mockLeads[leadIdx],
          freeAdGenerated: true,
          freeAdHeadline: newAd.headline,
          status: 'QUALIFIED'
        };
        localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
      }
    }, 2000);
  };

  // Auth Guard
  if (!user) {
    return (
      <div className="min-h-[75vh] bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-black font-display">Sign In to Claim 1 Free Ad</h2>
            <p className="text-xs text-zinc-600 font-medium">
              Create a free lead account or sign in to generate your 1st photorealistic studio ad creative at zero cost.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              to="/login?redirect=free-ad"
              className="btn-shimmer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/join"
              className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs border border-zinc-200 block text-center"
            >
              Create Free Lead Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Strip */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>1-Time Free AI Ad Generator • No Credit Card Required</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-black font-display tracking-tight leading-tight">
            Create Your <span className="text-red-600">First Studio Ad</span> Free
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
            Fill in your product details below. Our multimodal engine will render a studio-grade visual ad with conversion badges and psychological buying hooks.
          </p>
        </div>

        {/* Notice if already used trial */}
        {hasUsedFreeAd && !generatedAd && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-700 font-black text-sm">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>You have already created your 1 Free Trial Ad!</span>
            </div>
            <p className="text-xs text-zinc-700 font-medium">
              To generate unlimited 4K studio image ads, automated TikTok/Reel video ads, and dispatch directly to Meta, please select a subscription plan.
            </p>
            <Link
              to="/pricing"
              className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20"
            >
              <span>View Subscription Plans & Upgrade</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Main Grid: Form Left, Preview Right */}
        {(!hasUsedFreeAd || generatedAd) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-lg font-black text-black font-display">Product Configuration</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Customize your 1 free ad trial.</p>
              </div>

              {/* Sample Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">Quick Test Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sampleProducts.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all truncate ${
                        productName === sample.name
                          ? 'bg-red-50 text-red-600 border-red-300'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerateFreeAd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Product or Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Velocity Air Carbon Pro"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                    >
                      <option value="Footwear">Streetwear & Footwear</option>
                      <option value="Cosmetics">Cosmetics & Fragrance</option>
                      <option value="Tech">Tech & Pro Audio</option>
                      <option value="Luxury">Luxury Watch & Jewelry</option>
                      <option value="Fitness">Health & Fitness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Ad Aspect Ratio</label>
                    <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                      {(['1:1', '9:16', '16:9'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAdFormat(ratio)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                            adFormat === ratio
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-zinc-700 hover:text-black'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Offer Hook / Promo Badge</label>
                  <input
                    type="text"
                    value={offerHook}
                    onChange={(e) => setOfferHook(e.target.value)}
                    placeholder="e.g. 50% OFF TODAY ONLY"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Product Photo Source URL</label>
                  <input
                    type="url"
                    required
                    value={sampleImage}
                    onChange={(e) => setSampleImage(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating || hasUsedFreeAd}
                    className={`btn-shimmer w-full py-4 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md ${
                      hasUsedFreeAd
                        ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⚡</span> Rendering Photorealistic 3D Ad...
                      </span>
                    ) : hasUsedFreeAd ? (
                      <span>1 Free Trial Ad Already Used</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate My 1 Free Studio Ad</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-black">Live Studio Output</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-md uppercase">
                      {adFormat} Format
                    </span>
                  </div>
                  {generatedAd && (
                    <span className="font-mono text-xs font-black text-red-600">
                      Score: {generatedAd.conversionScore}
                    </span>
                  )}
                </div>

                {/* Rendered Ad Visual Canvas */}
                <div className={`relative overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-xl transition-all duration-300 ${
                  adFormat === '1:1' ? 'aspect-square' : adFormat === '9:16' ? 'aspect-[9/16] max-h-[500px] mx-auto' : 'aspect-video'
                }`}>
                  <img
                    src={sampleImage}
                    alt="Ad product"
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  />

                  {/* High Contrast Red & Black Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-between p-6">
                    
                    {/* Top Badges */}
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-md">
                        {offerHook || 'EXCLUSIVE DROP'}
                      </span>
                      <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] font-bold rounded-lg border border-zinc-700">
                        HD 4K
                      </span>
                    </div>

                    {/* Bottom Headline & Action */}
                    <div className="space-y-3">
                      <div className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
                        {productName ? `${productName.toUpperCase()}` : 'AIR MAX VELOCITY'}
                      </div>
                      <div className="text-xs text-zinc-300 font-semibold line-clamp-1">
                        Engineered for elite performance. {offerHook}.
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button className="px-5 py-2.5 bg-red-600 text-white font-black text-xs uppercase rounded-xl shadow-md">
                          Shop Now →
                        </button>
                        <span className="font-mono text-[11px] font-bold text-zinc-400">
                          {user.email || 'trial@adhunter.ai'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Conversion Callout Once Ad Generated */}
                {generatedAd && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
                      <CheckCircle2 className="w-6 h-6 text-red-600" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-black text-base font-display">Your 1 Free Ad is Ready!</h4>
                      <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                        To download 4K assets, launch automated video reels, and dispatch directly to Meta/TikTok, activate a subscription plan.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link
                        to="/pricing"
                        className="btn-shimmer w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                      >
                        <span>Activate Subscription to Unlock Full Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
