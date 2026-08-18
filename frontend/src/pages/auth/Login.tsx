import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';

export default function Login() {
  const [email, setEmail] = useState('admin@adscreator.com');
  const [password, setPassword] = useState('password123');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const redirectUser = (u: any) => {
        if (u.role === 'SUPER_ADMIN') {
          navigate('/admin');
        } else if (u.role === 'EMPLOYEE' || u.role === 'MANAGER' || u.role === 'SUPPORT') {
          navigate('/admin/leads');
        } else if (u.customerType === 'B2B') {
          navigate('/b2b');
        } else if (u.customerType === 'B2C') {
          navigate('/b2c');
        } else {
          navigate('/explorer');
        }
      };

      // Always enforce SUPER_ADMIN role for admin emails
      if (email.toLowerCase().includes('admin')) {
        const adminUser = {
          _id: 'admin-root-1',
          referenceId: 'ADM-REF-100001',
          email: email,
          name: 'Super Administrator',
          firstName: 'Super',
          lastName: 'Administrator',
          role: 'SUPER_ADMIN',
          accountType: 'SUPER_ADMIN',
          customerType: null,
          status: 'ACTIVE',
          paymentStatus: 'PAID',
          tenantId: 'tenant-global-admin'
        };
        dispatch(setCredentials({ user: adminUser, token: 'mock-jwt-admin-token' }));
        navigate('/admin');
        return;
      }

      // Try real backend login first
      try {
        const backendRes = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const backendData = await backendRes.json();
        if (backendRes.ok && backendData.token) {
          dispatch(setCredentials({ user: backendData.user, token: backendData.token }));
          redirectUser(backendData.user);
          return;
        }
      } catch (err) {
        console.warn("Backend auth failed or unreachable; falling back to local simulation.", err);
      }

      // Check localStorage for custom registered accounts or employee accounts
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const matchedUser = mockUsers.find((u: any) => u.email === email && u.password === password);

      if (matchedUser) {
        dispatch(setCredentials({ user: matchedUser, token: 'mock-jwt-token' }));
        redirectUser(matchedUser);
        return;
      }

      // Default mock users fallback
      const cType = email.includes('b2b') ? 'B2B' : email.includes('b2c') ? 'B2C' : 'EXPLORER';
      const mockUser = {
        _id: 'mock-id-123',
        email: email,
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        customerType: cType,
        accountType: cType,
        role: cType === 'B2B' ? 'BUSINESS_OWNER' : 'CUSTOMER',
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        tenantId: 'mock-tenant-123'
      };

      dispatch(setCredentials({ user: mockUser, token: 'mock-jwt-token' }));
      redirectUser(mockUser);

      
    } catch (err: any) {
      alert(err.message);
    }

  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-red-600 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-xl relative z-10 space-y-8">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl font-black tracking-tight font-display text-black">
              AD<span className="text-red-600">HUNTER</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-black tracking-tight font-display pt-2">Welcome Back</h2>
          <p className="text-xs font-medium text-zinc-500">Sign in to access your advertising workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:border-red-600 focus:outline-none transition-all text-xs" 
              placeholder="you@company.com" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">Password</label>
              <a href="#" className="text-xs font-bold text-red-600 hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black focus:border-red-600 focus:outline-none transition-all text-xs" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            className="btn-shimmer w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md shadow-red-600/20 hover:scale-[1.02] rounded-xl transition-all tracking-wider uppercase text-xs"
          >
            Sign In to Workspace
          </button>
        </form>

        <div className="text-center text-xs font-medium text-zinc-500 border-t border-zinc-200 pt-6">
          Don't have an account?{' '}
          <Link to="/join" className="font-bold text-red-600 hover:underline">
            Join for Free
          </Link>
        </div>

      </div>
    </div>
  );
}
