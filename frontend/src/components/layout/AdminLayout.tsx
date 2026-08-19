import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logOut } from '../../features/auth/authSlice';
import { 
  Sparkles, LayoutDashboard, Users, UserCheck, 
  Settings, LogOut, Search, ChevronLeft, Menu, Tag, Building2, Shield
} from 'lucide-react';

export default function AdminLayout() {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  const isEmployee = user && 
    !user.email?.toLowerCase().includes('admin') && 
    user.role !== 'SUPER_ADMIN' && 
    user.role !== 'ADMIN' && 
    (user.role === 'EMPLOYEE' || user.role === 'MANAGER' || user.role === 'SUPPORT' || user.role === 'DESIGNER');

  // Navigation Items Configured Based on Role
  const navigation = isEmployee
    ? [
        { name: 'Leads Pipeline', href: '/admin/leads', icon: Users, badge: 'Assigned Leads' },
        { name: 'B2C Customers', href: '/admin/b2c', icon: UserCheck, badge: 'Active Clients' },
        { name: 'B2B Enterprises', href: '/admin/b2b', icon: Building2, badge: 'Corporate' },
      ]
    : [
        { name: 'Global Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Leads Pipeline', href: '/admin/leads', icon: Users },
        { name: 'B2C Customers', href: '/admin/b2c', icon: UserCheck },
        { name: 'B2B Enterprises', href: '/admin/b2b', icon: Building2 },
        { name: 'Staff & Employees', href: '/admin/employees', icon: Shield },
        { name: 'Pricing & Plans', href: '/admin/pricing', icon: Tag },
        { name: 'System Settings', href: '/admin/settings', icon: Settings, highlight: true },
      ];

  const userRefId = user?.referenceId || (isEmployee ? 'EMP-REF-UNASSIGNED' : 'ADM-REF-100001');


  return (
    <div className="min-h-screen bg-white text-black font-sans flex selection:bg-red-600 selection:text-white">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-zinc-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col shrink-0 z-30`}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-200">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tight text-base text-black uppercase">
                  AD<span className="text-red-600">HUNTER</span>
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider -mt-1">
                  {isEmployee ? 'Staff Portal' : 'Admin Center'}
                </span>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white mx-auto">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Role & Reference ID Card */}
        {sidebarOpen && (
          <div className="p-4 mx-3 mt-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-zinc-500 uppercase tracking-wider">Reference ID</span>
              <span className="font-mono font-black text-red-600">{userRefId}</span>
            </div>
            <div className="text-xs font-black text-black truncate">
              {user?.name || user?.email || (isEmployee ? 'Staff Member' : 'Super Admin')}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">
              {isEmployee ? (user?.department || 'Operations Specialist') : 'Full System Access'}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {navigation.map((item: any) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' 
                    : item.highlight 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100/70 border border-red-200' 
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </div>
                {sidebarOpen && item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-xs font-bold text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors w-full px-3 py-2.5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute inset-y-0 left-3 my-auto" />
              <input 
                type="text" 
                placeholder="Search leads, customer reference IDs, product campaigns..." 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-black focus:outline-none focus:border-red-600 text-xs"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
              <div className="text-right hidden md:block">
                <div className="text-xs font-black text-black">
                  {user?.name || (isEmployee ? 'Staff Member' : 'Super Admin')}
                </div>
                <div className="text-[10px] font-bold text-red-600 font-mono">
                  {userRefId}
                </div>
              </div>
              <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

