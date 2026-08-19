import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, Check, Edit3, 
  Trash2, RotateCcw, Save, X, 
  CheckCircle, Video, Image, Users, ShoppingBag, ArrowLeft
} from 'lucide-react';
import { 
  type SubscriptionPlanDef, 
  getB2CPlans, 
  getB2BPlans, 
  saveAdminPlans, 
  resetAdminPlans 
} from '../../constants/subscriptionPlans';

export default function AdminPricingManager() {
  const [activeTab, setActiveTab] = useState<'B2C' | 'B2B'>('B2C');
  const [b2cPlans, setB2cPlans] = useState<SubscriptionPlanDef[]>([]);
  const [b2bPlans, setB2bPlans] = useState<SubscriptionPlanDef[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDef | null>(null);
  const [editingCategory, setEditingCategory] = useState<'B2C' | 'B2B'>('B2C');
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  // Load plans from persistent storage
  useEffect(() => {
    loadPlans();
    const handleStorageUpdate = () => loadPlans();
    window.addEventListener('subscription_plans_updated', handleStorageUpdate);
    return () => window.removeEventListener('subscription_plans_updated', handleStorageUpdate);
  }, []);

  const loadPlans = () => {
    setB2cPlans(getB2CPlans());
    setB2bPlans(getB2BPlans());
  };

  const handleOpenEdit = (plan: SubscriptionPlanDef, category: 'B2C' | 'B2B', index: number) => {
    setEditingPlan(JSON.parse(JSON.stringify(plan)));
    setEditingCategory(category);
    setEditingIndex(index);
    setNewFeatureText('');
  };

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || editingIndex === -1) return;

    let updatedB2C = [...b2cPlans];
    let updatedB2B = [...b2bPlans];

    if (editingCategory === 'B2C') {
      updatedB2C[editingIndex] = editingPlan;
      setB2cPlans(updatedB2C);
    } else {
      updatedB2B[editingIndex] = editingPlan;
      setB2bPlans(updatedB2B);
    }

    saveAdminPlans(updatedB2C, updatedB2B);
    setEditingPlan(null);
    setSaveSuccessBanner(true);
    setTimeout(() => setSaveSuccessBanner(false), 5000);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all pricing tiers to system defaults?")) {
      resetAdminPlans();
      loadPlans();
      setSaveSuccessBanner(true);
      setTimeout(() => setSaveSuccessBanner(false), 4000);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, newFeatureText.trim()]
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== idx)
    });
  };

  const currentPlans = activeTab === 'B2C' ? b2cPlans : b2bPlans;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top-Left Back Navigation */}
      <div className="flex justify-between items-center">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition-colors px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
          <span>Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-black text-xs uppercase tracking-wider mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Plan & Pricing Architecture</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">
            Subscription & Pricing Plans Manager
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Configure live tiers, pricing amounts (₹), product quotas, video permissions, and features displayed to users on the <code className="text-red-600 font-bold">/pricing</code> page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-zinc-600" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {saveSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Subscription plan successfully updated! All changes are now live across public pricing and customer dashboards.</span>
          </div>
          <button onClick={() => setSaveSuccessBanner(false)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Category Toggle Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
          <button
            onClick={() => setActiveTab('B2C')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              activeTab === 'B2C'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            B2C Consumer & Solo Plans ({b2cPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('B2B')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              activeTab === 'B2B'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            B2B Enterprise SaaS Plans ({b2bPlans.length})
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentPlans.map((plan, idx) => (
          <div 
            key={plan.name}
            className={`bg-white rounded-3xl p-6 border flex flex-col justify-between shadow-sm transition-all hover:shadow-md relative ${
              plan.popular ? 'border-red-600 ring-2 ring-red-600/20' : 'border-zinc-200'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-6 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                ⭐ Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-black text-black text-lg">{plan.name}</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">{plan.limitLabel}</p>
              </div>

              {/* Price Display */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-black">₹{plan.monthlyPrice.toLocaleString()}</span>
                  <span className="text-xs text-zinc-500 font-bold">/ month</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                  Yearly Billing: ₹{plan.yearlyPrice.toLocaleString()}/mo
                </div>
              </div>

              {/* Quota Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-red-600" />
                  <span>{plan.maxProducts} Products</span>
                </div>
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-blue-600" />
                  <span>{plan.imageAdsPerProduct} Image Ads/prod</span>
                </div>
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>{plan.allowVideos ? `${plan.videoAdsPerProduct} Video Ads/prod` : '🚫 No Video Ads'}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{plan.maxEmailUsers} Seat{plan.maxEmailUsers > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Features Included ({plan.features.length})</span>
                <ul className="space-y-1.5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="text-xs text-zinc-600 flex items-start gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleOpenEdit(plan, activeTab, idx)}
                className="btn-shimmer w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Plan Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-zinc-200 space-y-6 my-8">
            
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setEditingPlan(null)} 
                  className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-200"
                  title="Go Back / Cancel"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-600" />
                  <span>Back</span>
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Plan Customizer</span>
                  <h2 className="text-xl font-black text-black font-display">
                    Edit {editingPlan.name}
                  </h2>
                </div>
              </div>
              <button onClick={() => setEditingPlan(null)} className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlanEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Target Audience Label</label>
                  <input
                    type="text"
                    value={editingPlan.limitLabel}
                    onChange={e => setEditingPlan({ ...editingPlan, limitLabel: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Pricing Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Monthly Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.monthlyPrice}
                    onChange={e => setEditingPlan({ ...editingPlan, monthlyPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Yearly Price (₹/mo) *</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.yearlyPrice}
                    onChange={e => setEditingPlan({ ...editingPlan, yearlyPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Quotas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">Max Products</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingPlan.maxProducts}
                    onChange={e => setEditingPlan({ ...editingPlan, maxProducts: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">Image Ads / Prod</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingPlan.imageAdsPerProduct}
                    onChange={e => setEditingPlan({ ...editingPlan, imageAdsPerProduct: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">Video Ads / Prod</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPlan.videoAdsPerProduct}
                    onChange={e => setEditingPlan({ ...editingPlan, videoAdsPerProduct: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">Email / Team Seats</label>
                  <input
                    type="number"
                    min={1}
                    value={editingPlan.maxEmailUsers}
                    onChange={e => setEditingPlan({ ...editingPlan, maxEmailUsers: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-black">
                  <input
                    type="checkbox"
                    checked={editingPlan.allowVideos}
                    onChange={e => setEditingPlan({ ...editingPlan, allowVideos: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded border-zinc-300 focus:ring-red-500"
                  />
                  <span>Allow Video Generation for this plan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-black">
                  <input
                    type="checkbox"
                    checked={!!editingPlan.popular}
                    onChange={e => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded border-zinc-300 focus:ring-red-500"
                  />
                  <span>Highlight as "Most Popular" Plan</span>
                </label>
              </div>

              {/* Features List Editor */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Feature Bullet Points
                </label>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                      <input
                        type="text"
                        value={feat}
                        onChange={e => {
                          const updated = [...editingPlan.features];
                          updated[idx] = e.target.value;
                          setEditingPlan({ ...editingPlan, features: updated });
                        }}
                        className="flex-1 bg-transparent font-medium text-xs text-black focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-zinc-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    placeholder="Type new feature bullet point..."
                    className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-red-600"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-300"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="w-1/2 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Back to Plans</span>
                </button>
                <button
                  type="submit"
                  className="btn-shimmer w-1/2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
