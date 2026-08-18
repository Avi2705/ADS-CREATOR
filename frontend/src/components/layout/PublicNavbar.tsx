import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logOut } from '../../features/auth/authSlice';
import { Sparkles, Menu, X, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';


export default function PublicNavbar() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logOut());
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const customerType = user?.customerType || 'EXPLORER';

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'SUPER_ADMIN') return '/admin';
    if (user.role === 'EMPLOYEE' || user.role === 'MANAGER' || user.role === 'SUPPORT') return '/admin/leads';
    if (customerType === 'B2B') return '/b2b';
    if (customerType === 'B2C') return '/b2c';
    return '/explorer';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.role === 'SUPER_ADMIN') return 'Super Admin';
    if (user.role === 'EMPLOYEE') return 'Employee Specialist';
    if (user.role === 'MANAGER') return 'Operations Manager';
    if (user.role === 'SUPPORT') return 'Customer Support';
    if (customerType === 'B2B') return 'B2B Business';
    if (customerType === 'B2C') return 'B2C Customer';
    return 'Explorer Account';
  };

  // Pricing tab is strictly visible only to logged-in users
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Ads', path: '/explore' },
    ...(user && customerType === 'EXPLORER' ? [{ name: 'Explorer Hub', path: '/explorer' }] : []),
    ...(user && !user.freeAdGenerated ? [{ name: '⚡ 1 Free Ad', path: '/free-ad' }] : []),
    ...(user ? [{ name: 'Pricing', path: '/pricing' }] : []),
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200 text-black transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md group-hover:bg-red-700 transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight font-display text-black flex items-center gap-1">
                AD<span className="text-red-600 font-black">HUNTER</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold -mt-1">
                AI Ads Engine
              </span>
            </div>
          </Link>
          
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-200/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-zinc-100 border border-zinc-200 hover:border-red-500 transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-xs">
                    {user.firstName ? user.firstName[0].toUpperCase() : user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-black max-w-[100px] truncate">
                    {user.firstName || user.name || 'Account'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 mb-3">
                      <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-sm">
                        {user.firstName ? user.firstName[0].toUpperCase() : user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-black text-sm truncate">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || user.email}
                        </h4>
                        <span className="inline-block text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-600 mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Email</span>
                        <span className="text-black font-semibold truncate max-w-[160px]">{user.email}</span>
                      </div>
                      {user.companyName && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500 font-medium">Company</span>
                          <span className="text-black font-semibold truncate max-w-[160px]">{user.companyName}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl font-bold transition-colors text-xs"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-zinc-600" />
                        My Profile & Settings
                      </Link>

                      {user.role !== 'EXPLORER' && user.status !== 'LEAD' && (
                        <Link 
                          to={getDashboardLink()} 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-xs"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Launch Dashboard
                        </Link>
                      )}

                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-bold transition-colors text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-black hover:bg-zinc-100 transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  to="/join" 
                  className="btn-shimmer relative px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-black"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-bold ${
                  location.pathname === link.path
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="pt-4 border-t border-zinc-200 space-y-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-zinc-100 text-black rounded-xl font-bold text-sm"
                >
                  <UserIcon className="w-4 h-4 text-zinc-600" />
                  My Profile
                </Link>
                {user.role !== 'EXPLORER' && user.status !== 'LEAD' && (
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 bg-zinc-100 border border-zinc-200 text-black font-bold rounded-xl text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 bg-red-600 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


