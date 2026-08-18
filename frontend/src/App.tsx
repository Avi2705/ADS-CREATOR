import { Routes, Route } from 'react-router-dom';
import PublicNavbar from './components/layout/PublicNavbar';
import Footer from './components/layout/Footer';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Join from './pages/auth/Join';

import Explore from './pages/public/Explore';
import Contact from './pages/public/Contact';
import Pricing from './pages/public/Pricing';
import B2BRoutes from './pages/dashboards/B2BDashboard';
import B2CDashboardLayout from './components/layout/B2CDashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import B2CCustomers from './pages/admin/B2CCustomers';
import B2BBusinesses from './pages/admin/B2BBusinesses';
import ProfilePage from './pages/public/ProfilePage';
import LeadsManager from './pages/admin/LeadsManager';
import SuperAdminSettings from './pages/admin/SuperAdminSettings';
import B2CCustomerDetail from './pages/admin/B2CCustomerDetail';
import ExplorerDashboard from './pages/dashboards/ExplorerDashboard';
import ExplorerFreeAdPage from './pages/public/ExplorerFreeAdPage';
import EmployeesManager from './pages/admin/EmployeesManager';




function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col selection:bg-red-600 selection:text-white">
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route path="/" element={<><PublicNavbar /><main className="flex-1"><Home /></main><Footer /></>} />
        <Route path="/explore" element={<><PublicNavbar /><main className="flex-1"><Explore /></main><Footer /></>} />
        <Route path="/pricing" element={<><PublicNavbar /><main className="flex-1"><Pricing /></main><Footer /></>} />
        <Route path="/free-ad" element={<><PublicNavbar /><main className="flex-1"><ExplorerFreeAdPage /></main><Footer /></>} />
        <Route path="/explorer" element={<><PublicNavbar /><main className="flex-1"><ExplorerDashboard /></main><Footer /></>} />
        <Route path="/explorer/free-ad" element={<><PublicNavbar /><main className="flex-1"><ExplorerFreeAdPage /></main><Footer /></>} />
        <Route path="/contact" element={<><PublicNavbar /><main className="flex-1"><Contact /></main><Footer /></>} />
        <Route path="/profile" element={<><PublicNavbar /><main className="flex-1"><ProfilePage /></main><Footer /></>} />

        
        {/* Auth Routes without Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />

        {/* Dashboard Routes */}
        <Route path="/b2b/*" element={<B2BRoutes />} />
        <Route path="/b2c/*" element={<B2CDashboardLayout />} />
        
        {/* Super Admin & Employee Operations Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="leads" element={<LeadsManager />} />
          <Route path="b2c" element={<B2CCustomers />} />
          <Route path="b2c/:id" element={<B2CCustomerDetail />} />
          <Route path="b2b" element={<B2BBusinesses />} />
          <Route path="employees" element={<EmployeesManager />} />
          <Route path="subscriptions" element={<div className="p-8"><h1 className="text-3xl font-black text-black font-display">Subscriptions</h1><p className="text-zinc-500 mt-2 font-medium">Platform subscription tracking.</p></div>} />
          <Route path="payments" element={<div className="p-8"><h1 className="text-3xl font-black text-black font-display">Payments</h1><p className="text-zinc-500 mt-2 font-medium">Payment gateway settlements.</p></div>} />
          <Route path="audit" element={<div className="p-8"><h1 className="text-3xl font-black text-black font-display">Audit Logs</h1><p className="text-zinc-500 mt-2 font-medium">System activity logs.</p></div>} />
          <Route path="settings" element={<SuperAdminSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
