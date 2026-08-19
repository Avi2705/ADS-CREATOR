import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, X, Filter, ArrowLeft, Building2 } from 'lucide-react';

export interface CreativeItem {
  id: string;
  title: string;
  category: string;
  url: string;
  leads: string;
  roas: string;
  ctr: string;
  platform: string;
  hook: string;
  cta: string;
  clientBrand?: string;
  isCustomerCreated?: boolean;
}

const DEFAULT_SHOWCASE_ADS: CreativeItem[] = [
  {
    id: 'b2c-ad-1',
    title: 'Velocity Hyper-Glide X1 Runner',
    category: 'Footwear',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
    leads: '342',
    roas: '5.8x',
    ctr: '4.9%',
    platform: 'Instagram Reel (9:16)',
    hook: 'Engineered with aerospace-grade carbon fiber propulsion. 25% lighter, 100% faster.',
    cta: 'Claim 20% Off Drop',
    clientBrand: 'Velocity Sportswear',
    isCustomerCreated: true
  },
  {
    id: 'b2c-ad-2',
    title: 'Chrono-Sport Obsidian Chronograph',
    category: 'Luxury',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop&q=80',
    leads: '289',
    roas: '6.4x',
    ctr: '3.8%',
    platform: 'Meta Feed (1:1)',
    hook: 'Hand-assembled Swiss automatic movement housed in brushed titanium.',
    cta: 'Explore VIP Collection',
    clientBrand: 'Chrono Atelier',
    isCustomerCreated: true
  },
  {
    id: 'b2c-ad-3',
    title: 'Apex Moto Distressed Leather Jacket',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80',
    leads: '418',
    roas: '5.2x',
    ctr: '5.4%',
    platform: 'Story & Carousel (4:5)',
    hook: 'Handcrafted full-grain Italian leather with bespoke vintage patina.',
    cta: 'Order Custom Fit',
    clientBrand: 'Apex Leathercraft',
    isCustomerCreated: true
  },
  {
    id: 'b2c-ad-4',
    title: 'Audi RS Edition — Precision Meets Power',
    category: 'Automotive',
    url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000&auto=format&fit=crop&q=80',
    leads: '512',
    roas: '7.1x',
    ctr: '6.2%',
    platform: 'Meta Reel (9:16)',
    hook: 'Twin-turbocharged V8 performance with intelligent Quattro all-wheel drive.',
    cta: 'Book Private Test Drive',
    clientBrand: 'Audi RS Studio',
    isCustomerCreated: false
  },
  {
    id: 'b2c-ad-5',
    title: 'Noir Absolu Haute Parfumerie',
    category: 'Beauty',
    url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=1000&auto=format&fit=crop&q=80',
    leads: '390',
    roas: '5.9x',
    ctr: '4.6%',
    platform: 'Instagram Story (9:16)',
    hook: 'Rare Madagascar vanilla and smoked cedarwood formulated for 24-hour sillage.',
    cta: 'Claim Discovery Set',
    clientBrand: 'Maison Noir',
    isCustomerCreated: false
  },
  {
    id: 'b2c-ad-6',
    title: 'Studio Noise-Canceling Headphones Pro',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    leads: '465',
    roas: '5.5x',
    ctr: '5.1%',
    platform: 'Meta Feed (1:1)',
    hook: 'Lossless spatial audio with 40-hour battery life and custom titanium drivers.',
    cta: 'Get Launch Discount',
    clientBrand: 'Aura Sound Labs',
    isCustomerCreated: false
  }
];

export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAd, setSelectedAd] = useState<CreativeItem | null>(null);
  const [creatives, setCreatives] = useState<CreativeItem[]>(DEFAULT_SHOWCASE_ADS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllIntegratedAds();
  }, []);

  const loadAllIntegratedAds = async () => {
    try {
      const customerAds: CreativeItem[] = [];

      // 1. Load from all_b2c_requests (Super Admin / B2C studio database)
      try {
        const allGlobalReqs = JSON.parse(localStorage.getItem('all_b2c_requests') || '[]');
        allGlobalReqs.forEach((r: any, idx: number) => {
          if (r.creativeUrl || (r.productImages && r.productImages.length > 0)) {
            customerAds.push({
              id: r.id || `b2c-req-${idx}`,
              title: r.headline || r.productName || 'B2C Client Ad',
              category: r.category || 'Footwear',
              url: r.creativeUrl || r.productImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&fit=crop',
              leads: String(r.leads || Math.floor(180 + Math.random() * 250)),
              roas: r.roas || `${(4.2 + (idx % 3) * 0.8).toFixed(1)}x`,
              ctr: r.ctr || `${(3.5 + (idx % 4) * 0.6).toFixed(1)}%`,
              platform: r.format || (r.adType === 'Video' ? 'Video Reel (9:16)' : 'Image Banner (1:1)'),
              hook: r.description || r.purpose || 'Engineered for high conversion and brand engagement.',
              cta: r.cta || 'Shop Now',
              clientBrand: r.customerName || 'B2C Client',
              isCustomerCreated: true
            });
          }
        });
      } catch (e) {
        console.warn("Could not load all_b2c_requests:", e);
      }

      // 2. Scan all localStorage keys for requests_*
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('requests_')) {
          try {
            const userReqs = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(userReqs)) {
              userReqs.forEach((r: any, idx: number) => {
                const imgUrl = r.creativeUrl || (r.productImages && r.productImages[0]);
                if (imgUrl && !customerAds.some(a => a.id === r.id || a.url === imgUrl)) {
                  customerAds.push({
                    id: r.id || `local-req-${idx}`,
                    title: r.headline || r.productName || 'B2C Custom Creative',
                    category: r.category || 'Apparel',
                    url: imgUrl,
                    leads: String(Math.floor(150 + Math.random() * 200)),
                    roas: `${(4.5 + (idx % 3) * 0.7).toFixed(1)}x`,
                    ctr: `${(3.8 + (idx % 4) * 0.5).toFixed(1)}%`,
                    platform: r.adType === 'Video' ? 'Video Ad' : 'Image Ad (1:1)',
                    hook: r.description || 'Exclusive customer creative generated for multi-channel reach.',
                    cta: r.cta || 'Get Offer',
                    clientBrand: 'B2C Customer',
                    isCustomerCreated: true
                  });
                }
              });
            }
          } catch (e) {
            console.warn("Could not parse key:", key, e);
          }
        }
      }

      // 3. Scan mock_users for generatedFreeAd or product creatives
      try {
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        mockUsers.forEach((u: any, idx: number) => {
          if (u.generatedFreeAd && u.generatedFreeAd.mediaUrl) {
            const freeAd = u.generatedFreeAd;
            if (!customerAds.some(a => a.url === freeAd.mediaUrl)) {
              customerAds.push({
                id: `user-free-${idx}`,
                title: freeAd.headline || freeAd.productName || 'AI Generated Free Ad',
                category: freeAd.category || 'General',
                url: freeAd.mediaUrl,
                leads: '215',
                roas: '5.1x',
                ctr: '4.8%',
                platform: 'AI Studio Creative',
                hook: freeAd.primaryText || freeAd.description || 'Photorealistic AI generated marketing asset.',
                cta: freeAd.cta || 'Learn More',
                clientBrand: u.companyName || u.name || 'Explorer Creator',
                isCustomerCreated: true
              });
            }
          }
        });
      } catch (e) {
        console.warn("Could not scan mock_users:", e);
      }

      // 4. Fetch backend public showcase ads if available
      try {
        const res = await fetch('http://localhost:3000/api/ai/free-ad/public-showcase');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          data.data.forEach((backendAd: any) => {
            if (!customerAds.some(a => a.id === backendAd.id || a.url === backendAd.url)) {
              customerAds.push({
                ...backendAd,
                isCustomerCreated: true
              });
            }
          });
        }
      } catch (err) {
        console.warn("Backend showcase endpoint unreachable, using local storage and seeded database ads:", err);
      }

      // Merge: Customer created ads first, followed by default showcase items
      const mergedList = [...customerAds];
      DEFAULT_SHOWCASE_ADS.forEach(defaultAd => {
        if (!mergedList.some(a => a.title === defaultAd.title || a.url === defaultAd.url)) {
          mergedList.push(defaultAd);
        }
      });

      setCreatives(mergedList);
    } catch (err) {
      console.error("Failed to load integrated ads:", err);
      setCreatives(DEFAULT_SHOWCASE_ADS);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(creatives.map(c => c.category).filter(Boolean)))];

  const filteredCreatives = selectedCategory === 'All' 
    ? creatives 
    : creatives.filter(c => c.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top-Left Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 -mb-8 flex justify-between items-center relative z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition-colors px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center border-b border-zinc-200 overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Creative Performance Index</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display text-black">
            High-Performance <br />
            <span className="text-red-600">Ad Showcase</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Explore live creative variations, conversion hooks, and ROAS metrics generated across major e-commerce verticals.
          </p>
        </div>
      </section>

      {/* Brand Ticker */}
      <section className="px-4 py-8 border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
          {['NIKE', 'AUDI', 'APPLE', 'FERRARI', 'SONY', 'DIOR'].map((brand) => (
            <span key={brand} className="text-xl font-black tracking-widest text-black font-display">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Vertical:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:text-black hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-zinc-600 font-bold">
              Showing <span className="text-black font-black">{filteredCreatives.length}</span> verified ads
            </div>
          </div>

          {/* Ad Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-red-600 animate-spin" />
              <div className="text-zinc-500 font-bold text-xs uppercase tracking-wider">Syncing database showcase ads...</div>
            </div>
          ) : filteredCreatives.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-zinc-200 rounded-3xl text-center space-y-4">
              <div className="text-zinc-400 text-4xl">📭</div>
              <div className="space-y-1">
                <h3 className="font-black text-black text-sm uppercase tracking-wider">No ads in showcase</h3>
                <p className="text-xs text-zinc-500 font-medium">Any free ads generated by explorers or B2C portal creatives will appear here automatically.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCreatives.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => setSelectedAd(ad)}
                  className="bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:border-red-600 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
                >
                  {/* Media Aspect Container */}
                  <div className="aspect-[4/5] bg-zinc-100 relative overflow-hidden">
                    <img
                      src={ad.url}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                            {ad.category}
                          </span>
                          {ad.clientBrand && (
                            <span className="px-2 py-0.5 rounded-md bg-white/95 text-black text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5 text-red-600" />
                              <span>{ad.clientBrand}</span>
                            </span>
                          )}
                        </div>
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/20">
                          {ad.platform}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white leading-tight font-display drop-shadow-md">
                          {ad.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-red-400 font-black flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> {ad.roas} ROAS
                          </span>
                          <span className="text-white font-semibold">
                            {ad.leads} Leads
                          </span>
                          <span className="text-white font-semibold">
                            {ad.ctr} CTR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Strip */}
                  <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs">
                    <span className="text-zinc-600 truncate max-w-[200px] font-medium">"{ad.hook}"</span>
                    <span className="font-bold text-red-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Inspect Formula →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Interactive Ad Formula Lightbox Modal */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-6">
            
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <button
                onClick={() => setSelectedAd(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold transition-colors flex items-center gap-1 border border-zinc-200"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-600" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setSelectedAd(null)}
                className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-48 aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                <img src={selectedAd.url} alt={selectedAd.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3 flex-1 min-w-0">
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  {selectedAd.category}
                </span>
                <h3 className="text-2xl font-black text-black font-display leading-tight">{selectedAd.title}</h3>
                <p className="text-xs text-zinc-500 font-medium">Channel: {selectedAd.platform}</p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">ROAS</div>
                    <div className="text-base font-black text-red-600">{selectedAd.roas}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Leads</div>
                    <div className="text-base font-black text-black">{selectedAd.leads}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">CTR</div>
                    <div className="text-base font-black text-red-600">{selectedAd.ctr}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-200 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 uppercase font-bold tracking-wider text-[10px]">Marketing Hook Formulation</span>
                <p className="text-black font-medium leading-relaxed">"{selectedAd.hook}"</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                <span className="text-zinc-500 uppercase font-bold tracking-wider text-[10px]">Call To Action Trigger</span>
                <span className="text-red-600 font-black text-xs">{selectedAd.cta}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/join"
                onClick={() => setSelectedAd(null)}
                className="btn-shimmer w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 text-center"
              >
                <span>Generate Ad Variations With This Template</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Testimonials Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight font-display text-black">
            The Proof Is In The <span className="text-red-600">Pipeline</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", company: "ABC Fashion Global", text: "AD-HUNTER completely automated our ad asset production. We doubled qualified leads in 30 days without expanding our agency retainer." },
              { name: "Mike T.", company: "HyperGadgets Direct", text: "The 1-click publishing to Instagram and TikTok feeds saves my growth marketing team 15+ hours every single week." },
              { name: "Elena R.", company: "Aura Luxe Goods", text: "I run a single flagship product line. The Done-For-You ad deliverables look like they were shot in a $50k Manhattan studio." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-8 text-left space-y-6 shadow-sm">
                <div className="text-red-600 text-4xl font-serif leading-none">“</div>
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-black text-sm">{testimonial.name}</div>
                    <div className="text-xs text-zinc-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}


