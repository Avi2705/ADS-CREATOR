import { useState } from 'react';
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

  const creatives: CreativeItem[] = [
    {
      id: '1',
      title: "Nike Velocity React Pro",
      category: "Footwear",
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop",
      leads: "4,820",
      roas: "5.4x",
      ctr: "4.8%",
      platform: "Instagram Feed (1:1)",
      hook: "Stop scrolling: The lightest runner of 2026 just dropped.",
      cta: "Shop The Drop"
    },
    {
      id: '2',
      title: "Audi RS Performance GT",
      category: "Automotive",
      url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&fit=crop",
      leads: "2,150",
      roas: "6.1x",
      ctr: "3.9%",
      platform: "YouTube Bumper (16:9)",
      hook: "0 to 100 in 2.9 seconds. Pure German engineering unleashed.",
      cta: "Book VIP Test Drive"
    },
    {
      id: '3',
      title: "Apple Watch Ultra Chrono",
      category: "Tech",
      url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&fit=crop",
      leads: "14,900",
      roas: "4.9x",
      ctr: "5.2%",
      platform: "TikTok Hook (9:16)",
      hook: "Titanium casing. 72-hour battery. Ready for Everest.",
      cta: "Order Now - Free Express Shipping"
    },
    {
      id: '4',
      title: "Ferrari Monza Speciale",
      category: "Automotive",
      url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&fit=crop",
      leads: "980",
      roas: "8.2x",
      ctr: "6.4%",
      platform: "Meta Stories (9:16)",
      hook: "Only 499 units worldwide. Experience the pinnacle of speed.",
      cta: "Request Allocation"
    },
    {
      id: '5',
      title: "Nike Air Jordan Retro High",
      category: "Footwear",
      url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&fit=crop",
      leads: "9,450",
      roas: "4.7x",
      ctr: "4.1%",
      platform: "TikTok Viral (9:16)",
      hook: "The classic silhouette rebuilt with modern air cushioning.",
      cta: "Claim Your Pair"
    },
    {
      id: '6',
      title: "Dior Sauvage Elixir",
      category: "Cosmetics",
      url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&fit=crop",
      leads: "3,890",
      roas: "5.8x",
      ctr: "4.6%",
      platform: "Instagram Reel (9:16)",
      hook: "An intoxicating night trail crafted for those who command attention.",
      cta: "Discover The Scent"
    },
    {
      id: '7',
      title: "Sony WH-1000XM5 Studio",
      category: "Tech",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&fit=crop",
      leads: "6,200",
      roas: "5.1x",
      ctr: "3.8%",
      platform: "Meta Carousel (1:1)",
      hook: "Industry-leading noise cancellation. Silence the chaos.",
      cta: "Get 20% Off Today"
    },
    {
      id: '8',
      title: "Bespoke Italian Leather Jacket",
      category: "Fashion",
      url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&fit=crop",
      leads: "1,840",
      roas: "4.2x",
      ctr: "3.5%",
      platform: "Instagram Feed (1:1)",
      hook: "Handcrafted in Florence. Full-grain leather that ages with character.",
      cta: "Explore Collection"
    },
    {
      id: '9',
      title: "Polaroid Vintage Creator Edition",
      category: "Tech",
      url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&fit=crop",
      leads: "5,300",
      roas: "4.5x",
      ctr: "4.9%",
      platform: "TikTok Spark (9:16)",
      hook: "Analog vibes in a digital world. Print instant nostalgia.",
      cta: "Shop Creator Bundle"
    }
  ];

  const categories = ['All', 'Footwear', 'Tech', 'Automotive', 'Cosmetics', 'Fashion'];

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


