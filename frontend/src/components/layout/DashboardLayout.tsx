import { Link, Outlet } from 'react-router-dom';

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
}

export default function DashboardLayout({ items, role }: { items: SidebarItem[], role: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col hidden md:flex border-r border-black">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-black tracking-tighter hover:text-primary transition-colors block">
            ADD <span className="text-primary">CREATOR</span>
          </Link>
          <div className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">{role} Portal</div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {items.map((item, idx) => (
              <li key={idx}>
                <Link to={item.href} className="block px-4 py-3 rounded text-sm font-bold text-gray-300 hover:bg-white hover:text-black hover:border-l-4 hover:border-primary transition-all">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white border-2 border-white">
              JD
            </div>
            <div>
              <div className="text-sm font-bold text-white">John Doe</div>
              <Link to="/login" className="text-xs text-primary hover:underline font-bold">Logout</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header (Mobile specific or global actions) */}
        <header className="h-16 bg-white border-b-2 border-black flex items-center justify-between px-6 shadow-sm">
          <div className="md:hidden font-black text-xl">ADD <span className="text-primary">CREATOR</span></div>
          <div className="hidden md:block">
            {/* Search or breadcrumbs can go here */}
          </div>
          <div className="flex gap-4">
            <button className="btn btn-sm btn-outline border-black text-black hover:bg-black hover:text-white rounded-none">Create Ad</button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-white text-black">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
