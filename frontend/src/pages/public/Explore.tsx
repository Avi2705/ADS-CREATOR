import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, X, Filter } from 'lucide-react';

interface CreativeItem {
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
}

export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAd, setSelectedAd] = useState<CreativeItem | null>(null);
  const [creatives, setCreatives] = useState<CreativeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/ai/free-ad/public-showcase')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCreatives(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch public database ads:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(creatives.map(c => c.category).filter(Boolean)))];

  const filteredCreatives = selectedCategory === 'All' 
    ? creatives 
    : creatives.filter(c => c.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white">
      
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
                        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {ad.category}
                        </span>
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
            
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

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


