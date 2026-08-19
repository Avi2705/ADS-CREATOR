import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, UserPlus, Users, UserCheck, 
  Check, Trash2, LogIn, 
  CheckCircle, Lock, Tag, Search, ArrowLeft 
} from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';

interface Employee {
  _id: string;
  referenceId: string;
  name: string;
  email: string;
  password?: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'SUPPORT' | 'DESIGNER';
  department: string;
  designation: string;
  phone: string;
  assignedLeadsCount: number;
  assignedCustomersCount: number;
  status: 'ACTIVE' | 'SUSPENDED';
  createdDate: string;
}

export default function SuperAdminSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'create-employee' | 'staff-roster' | 'assignment-matrix'>('create-employee');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Employee Creation Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('StaffPass2026!');
  const [empRole, setEmpRole] = useState<'EMPLOYEE' | 'MANAGER' | 'SUPPORT' | 'DESIGNER'>('EMPLOYEE');
  const [empDept, setEmpDept] = useState('Lead & Client Relations');
  const [empDesignation, setEmpDesignation] = useState('Inbound Lead & Customer Specialist');
  const [empPhone, setEmpPhone] = useState('+91 98765 43210');

  // Assignment Matrix Form State
  const [selectedEmpRef, setSelectedEmpRef] = useState('');
  const [assignType, setAssignType] = useState<'LEAD' | 'CUSTOMER'>('LEAD');
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load staff, leads, and customers from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');

    // 1. Load Employees
    const staffList: Employee[] = mockUsers
      .filter((u: any) => u.role === 'EMPLOYEE' || u.role === 'MANAGER' || u.role === 'SUPPORT' || u.role === 'DESIGNER')
      .map((u: any) => {
        const assignedLeads = mockLeads.filter((l: any) => l.assignedEmployeeRefId === u.referenceId).length;
        const assignedCusts = mockUsers.filter((c: any) => c.assignedEmployeeRefId === u.referenceId && (c.paymentStatus === 'PAID' || c.status === 'ACTIVE')).length;
        return {
          _id: u._id,
          referenceId: u.referenceId || `EMP-REF-${Math.floor(100000 + Math.random() * 900000)}`,
          name: u.name || `${u.firstName || 'Staff'} ${u.lastName || 'Member'}`,
          email: u.email,
          password: u.password || 'StaffPass2026!',
          role: u.role || 'EMPLOYEE',
          department: u.department || 'Client Operations',
          designation: u.designation || 'Specialist',
          phone: u.mobile || u.phone || '+91 98765 00000',
          assignedLeadsCount: assignedLeads,
          assignedCustomersCount: assignedCusts,
          status: u.status || 'ACTIVE',
          createdDate: u.createdDate || new Date().toISOString().split('T')[0]
        };
      });
    setEmployees(staffList);

    // 2. Load Unconverted Leads
    const allLeads = [
      ...mockLeads,
      ...mockUsers.filter((u: any) => (u.status === 'LEAD' || u.paymentStatus === 'PENDING' || u.customerType === 'EXPLORER') && u.role !== 'SUPER_ADMIN' && u.role !== 'EMPLOYEE')
    ];
    // dedupe
    const uniqueLeadsMap = new Map();
    allLeads.forEach(l => uniqueLeadsMap.set(l.email || l._id, l));
    setLeads(Array.from(uniqueLeadsMap.values()));

    // 3. Load Paid Customers
    const paidCusts = mockUsers.filter((u: any) => 
      (u.paymentStatus === 'PAID' || u.status === 'ACTIVE') && 
      u.status !== 'LEAD' && 
      u.paymentStatus !== 'PENDING' &&
      u.role !== 'SUPER_ADMIN' && 
      u.role !== 'EMPLOYEE'
    );
    setCustomers(paidCusts);
  };

  // Handle Employee Creation
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empPassword.trim()) {
      alert("Please fill in employee name, email, and password.");
      return;
    }

    const empRefId = `EMP-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newEmpObj = {
      _id: `emp-${Date.now()}`,
      referenceId: empRefId,
      name: empName,
      firstName: empName.split(' ')[0],
      lastName: empName.split(' ')[1] || '',
      email: empEmail.toLowerCase(),
      password: empPassword,
      role: empRole,
      department: empDept,
      designation: empDesignation,
      mobile: empPhone,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0]
    };

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    // Check if email already exists
    const existingIdx = mockUsers.findIndex((u: any) => u.email?.toLowerCase() === empEmail.toLowerCase());
    if (existingIdx !== -1) {
      mockUsers[existingIdx] = { ...mockUsers[existingIdx], ...newEmpObj };
    } else {
      mockUsers.unshift(newEmpObj);
    }
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    loadData();
    setSuccessMsg(`✅ Employee "${empName}" created with Reference ID: ${empRefId}! They can log in to view and handle assigned Leads & Customers.`);
    
    // Reset Form
    setEmpName('');
    setEmpEmail('');
    setEmpPassword('StaffPass2026!');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Handle Assignment of Employee to Lead / Customer
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpRef || !selectedTargetId) {
      alert("Please select both a staff specialist and a target lead/customer.");
      return;
    }

    const chosenEmp = employees.find(e => e.referenceId === selectedEmpRef);
    const empNameStr = chosenEmp?.name || 'Assigned Staff';

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');

    if (assignType === 'LEAD') {
      // Update in mock_leads
      const leadIdx = mockLeads.findIndex((l: any) => l._id === selectedTargetId || l.referenceId === selectedTargetId || l.email === selectedTargetId);
      if (leadIdx !== -1) {
        mockLeads[leadIdx].assignedEmployeeRefId = selectedEmpRef;
        mockLeads[leadIdx].assignedEmployeeName = empNameStr;
        localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
      }
      // Update in mock_users
      const userIdx = mockUsers.findIndex((u: any) => u._id === selectedTargetId || u.referenceId === selectedTargetId || u.email === selectedTargetId);
      if (userIdx !== -1) {
        mockUsers[userIdx].assignedEmployeeRefId = selectedEmpRef;
        mockUsers[userIdx].assignedEmployeeName = empNameStr;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      setSuccessMsg(`✅ Lead assigned to specialist ${empNameStr} (${selectedEmpRef})!`);
    } else {
      // Assign to Customer
      const custIdx = mockUsers.findIndex((u: any) => u._id === selectedTargetId || u.referenceId === selectedTargetId || u.email === selectedTargetId);
      if (custIdx !== -1) {
        mockUsers[custIdx].assignedEmployeeRefId = selectedEmpRef;
        mockUsers[custIdx].employeeName = empNameStr;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      setSuccessMsg(`✅ Customer account assigned to specialist ${empNameStr} (${selectedEmpRef})!`);
    }

    loadData();
    setSelectedTargetId('');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSimulateLogin = (emp: Employee) => {
    dispatch(setCredentials({
      user: {
        _id: emp._id,
        referenceId: emp.referenceId,
        email: emp.email,
        name: emp.name,
        firstName: emp.name.split(' ')[0],
        lastName: emp.name.split(' ')[1] || '',
        role: emp.role,
        department: emp.department,
        designation: emp.designation,
        status: emp.status
      },
      token: 'mock-emp-token'
    }));

    alert(`Logged in as employee ${emp.name} (${emp.referenceId})!\nNavigating to Employee Leads & Customer portal.`);
    navigate('/admin/leads');
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to remove this employee account?")) {
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const filtered = mockUsers.filter((u: any) => u._id !== id && u.referenceId !== id);
      localStorage.setItem('mock_users', JSON.stringify(filtered));
      loadData();
    }
  };

  const handleCopyCredentials = (emp: Employee) => {
    const credText = `Employee: ${emp.name}\nReference ID: ${emp.referenceId}\nEmail: ${emp.email}\nPassword: ${emp.password || 'StaffPass2026!'}\nRole: ${emp.role}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(emp._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Header Strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-black text-xs uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Ads Creator Staff Administration</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">
            Company Staff & Employee System
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Create employee accounts with login credentials. Staff can exclusively view and communicate with their assigned Leads & Customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/pricing"
            className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <Tag className="w-4 h-4 text-red-600" />
            <span>Manage Pricing & Plans →</span>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-black">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-4 text-xs font-black uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('create-employee')}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'create-employee'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>1. Create Employee Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('assignment-matrix')}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'assignment-matrix'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>2. Assign Staff to Leads & Customers</span>
        </button>

        <button
          onClick={() => setActiveTab('staff-roster')}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'staff-roster'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Company Staff Roster ({employees.length})</span>
        </button>
      </div>

      {/* TAB 1: CREATE EMPLOYEE */}
      {activeTab === 'create-employee' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors flex items-center gap-1 text-xs font-bold mr-1"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h2 className="text-xl font-black text-black font-display">Provision New Staff Account</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Generated login credentials allow employees to log into the platform to speak with, manage, and assist assigned clients.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={e => setEmpName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Work Email ID (Login Username) *</label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={e => setEmpEmail(e.target.value)}
                    placeholder="alex.henderson@adhunter.ai"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={empPassword}
                    onChange={e => setEmpPassword(e.target.value)}
                    placeholder="Set employee password"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Staff Role Level</label>
                  <select
                    value={empRole}
                    onChange={e => setEmpRole(e.target.value as any)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  >
                    <option value="EMPLOYEE">Employee (Leads & Customers Handler)</option>
                    <option value="MANAGER">Operations Manager</option>
                    <option value="SUPPORT">Customer Support Specialist</option>
                    <option value="DESIGNER">Creative Reviewer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={empDept}
                    onChange={e => setEmpDept(e.target.value)}
                    placeholder="e.g. Inbound Lead & Customer Ops"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Designation Title</label>
                  <input
                    type="text"
                    value={empDesignation}
                    onChange={e => setEmpDesignation(e.target.value)}
                    placeholder="e.g. Lead Engagement Executive"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Contact Mobile Number</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={e => setEmpPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5 text-xs">
                <div className="font-bold text-black flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>Strict Security & Permissions Architecture:</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Employees logging in with this email and password can <strong>ONLY</strong> access the <strong>Leads Pipeline</strong> and <strong>B2C Customers</strong> section to contact assigned customers. Super Admin settings and ad creation tools remain strictly restricted.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEmpName(''); setEmpEmail(''); }}
                  className="w-1/3 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 transition-colors"
                >
                  ← Clear Form
                </button>
                <button
                  type="submit"
                  className="btn-shimmer w-2/3 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision Staff Account & Generate Ref ID</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Roster Preview Side Panel */}
          <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 space-y-4">
            <h3 className="font-black text-black text-sm uppercase tracking-wider">Active Staff Summary ({employees.length})</h3>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {employees.map(emp => (
                <div key={emp._id} className="p-3.5 bg-white border border-zinc-200 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-black text-xs">{emp.name}</div>
                      <div className="text-[10px] font-mono text-red-600 font-bold">{emp.referenceId}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 font-bold text-[9px] uppercase rounded-md">
                      {emp.role}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-100">
                    <span>Leads: <strong>{emp.assignedLeadsCount}</strong> | Customers: <strong>{emp.assignedCustomersCount}</strong></span>
                    <button
                      onClick={() => handleSimulateLogin(emp)}
                      className="text-red-600 hover:underline font-bold"
                    >
                      Login As →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENT MATRIX */}
      {activeTab === 'assignment-matrix' && (
        <div className="max-w-2xl bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('create-employee')}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors flex items-center gap-1 text-xs font-bold mr-1"
              title="Back to Step 1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-black text-black font-display">Assign Staff Specialist to Lead or Customer</h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Connect an employee to a specific lead or customer. The employee will handle their inquiries, phone outreach, and follow-ups.
              </p>
            </div>
          </div>

          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">1. Select Staff Specialist *</label>
              <select
                required
                value={selectedEmpRef}
                onChange={e => setSelectedEmpRef(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
              >
                <option value="">-- Choose Employee / Staff Specialist --</option>
                {employees.map(emp => (
                  <option key={emp.referenceId} value={emp.referenceId}>
                    {emp.name} ({emp.referenceId}) — {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">2. Assignment Category *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setAssignType('LEAD'); setSelectedTargetId(''); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    assignType === 'LEAD'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Unconverted Leads ({leads.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAssignType('CUSTOMER'); setSelectedTargetId(''); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    assignType === 'CUSTOMER'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Active Customers ({customers.length})</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                3. Choose Target {assignType === 'LEAD' ? 'Lead' : 'Customer'} *
              </label>
              <select
                required
                value={selectedTargetId}
                onChange={e => setSelectedTargetId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-red-600"
              >
                <option value="">-- Choose {assignType === 'LEAD' ? 'Lead' : 'Customer'} --</option>
                {assignType === 'LEAD'
                  ? leads.map(l => (
                      <option key={l._id || l.id} value={l._id || l.id}>
                        {l.name || l.firstName || 'Lead'} ({l.email}) — Ref: {l.referenceId || 'LEAD'} — Assigned: {l.assignedEmployeeRefId || 'Unassigned'}
                      </option>
                    ))
                  : customers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name || c.companyName || c.email} ({c.email}) — Plan: {c.subscription} — Assigned: {c.assignedEmployeeRefId || 'Unassigned'}
                      </option>
                    ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setSelectedEmpRef(''); setSelectedTargetId(''); }}
                className="w-1/3 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs tracking-wider border border-zinc-300 transition-colors"
              >
                ← Clear
              </button>
              <button
                type="submit"
                className="btn-shimmer w-2/3 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Assignment Mapping</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: STAFF ROSTER */}
      {activeTab === 'staff-roster' && (
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-black font-display">Company Staff Directory</h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">List of all provisioned team members with employee reference IDs and customer assignments.</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, email, ref ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Staff Member</th>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Role & Dept</th>
                  <th className="p-4">Assigned Leads</th>
                  <th className="p-4">Assigned Customers</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-400 font-medium bg-zinc-50">
                      No employee accounts created yet. Use Tab 1 to provision staff logins.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp._id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-4 pl-6 font-bold text-black">
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono font-normal">{emp.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-red-600 text-xs px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
                          {emp.referenceId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-black">{emp.role}</div>
                        <div className="text-[10px] text-zinc-400">{emp.department}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-black">{emp.assignedLeadsCount} Leads</span>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-red-600">{emp.assignedCustomersCount} Customers</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase">
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleCopyCredentials(emp)}
                          className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-[10px] rounded-lg border border-zinc-200 transition-colors"
                          title="Copy login email and password"
                        >
                          {copiedId === emp._id ? '✓ Copied' : 'Copy Creds'}
                        </button>
                        <button
                          onClick={() => handleSimulateLogin(emp)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-black text-[10px] rounded-lg border border-red-200 transition-colors inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Login As</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
