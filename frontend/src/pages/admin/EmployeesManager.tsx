import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Copy, Check, Shield, 
  Trash2, X, Search, Lock, Filter, LogIn
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
  status: 'ACTIVE' | 'SUSPENDED';
  assignedLeadsCount: number;
  assignedCustomersCount: number;
  createdDate: string;
}

export default function EmployeesManager() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State - Create Employee
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('EmpPass2026!');
  const [empRole, setEmpRole] = useState<'EMPLOYEE' | 'MANAGER' | 'SUPPORT' | 'DESIGNER'>('EMPLOYEE');
  const [empDept, setEmpDept] = useState('Lead & Sales Operations');
  const [empDesignation, setEmpDesignation] = useState('Lead Operations Specialist');
  const [empPhone, setEmpPhone] = useState('+91 98765 43210');

  // Modal State - Assign Lead/Customer
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [assignType, setAssignType] = useState<'LEAD' | 'CUSTOMER'>('LEAD');
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');

  // Initial Data Load
  useEffect(() => {
    loadEmployees();
    loadLeadsAndCustomers();
  }, []);

  const loadEmployees = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const employeeUsers = mockUsers.filter(
      (u: any) => 
        (u.role === 'EMPLOYEE' || u.role === 'MANAGER' || u.role === 'SUPPORT' || u.role === 'DESIGNER') &&
        u._id !== 'emp-101' && u._id !== 'emp-102' && u._id !== 'emp-103'
    );

    setEmployees(employeeUsers);
  };



  const loadLeadsAndCustomers = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const customers = mockUsers.filter((u: any) => u.accountType === 'B2C' || u.role === 'CUSTOMER');
    setCustomersList(customers);

    const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
    setLeadsList(mockLeads);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empEmail || !empPassword) {
      alert("Please fill in Name, Email, and Password.");
      return;
    }

    const referenceId = `EMP-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEmp: Employee = {
      _id: `emp-${Date.now()}`,
      referenceId,
      name: empName,
      email: empEmail,
      password: empPassword,
      role: empRole,
      department: empDept,
      designation: empDesignation,
      phone: empPhone,
      status: 'ACTIVE',
      assignedLeadsCount: 0,
      assignedCustomersCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newEmp, ...employees];
    setEmployees(updated);

    // Save to mock_users DB
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    mockUsers.push(newEmp);
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    // Reset Form
    setEmpName('');
    setEmpEmail('');
    setEmpPassword('EmpPass2026!');
    setIsCreateModalOpen(false);

    alert(`Employee account created successfully!\nReference ID: ${referenceId}\nEmail: ${newEmp.email}\nPassword: ${newEmp.password}`);
  };

  const handleToggleStatus = (empId: string) => {
    const updated = employees.map(emp => {
      if (emp._id === empId) {
        return {
          ...emp,
          status: emp.status === 'ACTIVE' ? ('SUSPENDED' as const) : ('ACTIVE' as const)
        };
      }
      return emp;
    });

    setEmployees(updated);

    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = mockUsers.findIndex((u: any) => u._id === empId);
    if (idx !== -1) {
      mockUsers[idx].status = mockUsers[idx].status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    if (confirm("Are you sure you want to remove this employee account?")) {
      const filtered = employees.filter(e => e._id !== empId);
      setEmployees(filtered);

      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const updatedUsers = mockUsers.filter((u: any) => u._id !== empId);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
    }
  };

  const handleClearAllEmployees = () => {
    if (confirm("Are you sure you want to clear all employee records from the database/storage?")) {
      setEmployees([]);
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const nonEmployees = mockUsers.filter(
        (u: any) => u.role !== 'EMPLOYEE' && u.role !== 'MANAGER' && u.role !== 'SUPPORT' && u.role !== 'DESIGNER'
      );
      localStorage.setItem('mock_users', JSON.stringify(nonEmployees));
    }
  };

  const handleCopyCredentials = (emp: Employee) => {

    const credText = `Employee: ${emp.name}\nReference ID: ${emp.referenceId}\nEmail: ${emp.email}\nPassword: ${emp.password || 'Password123!'}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(emp._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateLoginAsEmployee = (emp: Employee) => {
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

    alert(`Logged in as ${emp.name} (${emp.referenceId})!\nNavigating to Employee Leads & Customer workspace.`);
    navigate('/admin/leads');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedTargetId) {
      alert("Please select a target to assign.");
      return;
    }

    if (assignType === 'LEAD') {
      const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      const idx = mockLeads.findIndex((l: any) => l._id === selectedTargetId || l.referenceId === selectedTargetId);
      if (idx !== -1) {
        mockLeads[idx].assignedEmployeeRefId = selectedEmployee.referenceId;
        mockLeads[idx].assignedEmployeeName = selectedEmployee.name;
        localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
      }

      // Increment employee count
      const updated = employees.map(e => e._id === selectedEmployee._id ? { ...e, assignedLeadsCount: e.assignedLeadsCount + 1 } : e);
      setEmployees(updated);
    } else {
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const idx = mockUsers.findIndex((u: any) => u._id === selectedTargetId || u.referenceId === selectedTargetId);
      if (idx !== -1) {
        mockUsers[idx].assignedEmployeeRefId = selectedEmployee.referenceId;
        mockUsers[idx].assignedEmployeeName = selectedEmployee.name;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }

      const updated = employees.map(e => e._id === selectedEmployee._id ? { ...e, assignedCustomersCount: e.assignedCustomersCount + 1 } : e);
      setEmployees(updated);
    }

    setIsAssignModalOpen(false);
    setSelectedTargetId('');
    alert(`Assigned successfully to ${selectedEmployee.name} (${selectedEmployee.referenceId})!`);
  };

  // Filtered list
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 bg-white text-black min-h-screen">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Staff & Reference ID Management</span>
          </div>
          <h1 className="text-3xl font-black text-black font-display tracking-tight">Employee Directory & Credentials</h1>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Create employee login credentials (Email, Password, Reference ID). Employees can view assigned Leads and Customers, while ad creative creation is restricted to Admin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {employees.length > 0 && (
            <button
              onClick={handleClearAllEmployees}
              className="px-4 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Clear All Employees
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-shimmer px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-xs tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Employee Account</span>
          </button>
        </div>
      </div>


      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Active Staff</span>
          <div className="text-3xl font-black text-black font-display">{employees.filter(e => e.status === 'ACTIVE').length}</div>
          <div className="text-[10px] text-zinc-500 font-semibold">Across all operations</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Assigned Leads</span>
          <div className="text-3xl font-black text-red-600 font-display">
            {employees.reduce((acc, curr) => acc + (curr.assignedLeadsCount || 0), 0)}
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold">Tracked via Reference ID</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Assigned B2C Customers</span>
          <div className="text-3xl font-black text-black font-display">
            {employees.reduce((acc, curr) => acc + (curr.assignedCustomersCount || 0), 0)}
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold">Subscribed accounts</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Ad Creation Guard</span>
          <div className="text-base font-black text-red-600 font-display flex items-center gap-1.5 pt-1">
            <Lock className="w-4 h-4" /> Admin Protected
          </div>
          <div className="text-[10px] text-red-700 font-bold">Image & Video generation locked</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Email, Reference ID, Dept..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Role:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-red-600"
          >
            <option value="ALL">All Roles</option>
            <option value="EMPLOYEE">Employee Specialist</option>
            <option value="MANAGER">Operations Manager</option>
            <option value="SUPPORT">Customer Support</option>
            <option value="DESIGNER">Creative Reviewer</option>
          </select>
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
              <th className="p-4 pl-6">Reference ID</th>
              <th className="p-4">Employee Details</th>
              <th className="p-4">Department & Role</th>
              <th className="p-4 text-center">Assigned Work</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs font-medium">
            {filteredEmployees.map((emp) => (
              <tr key={emp._id} className="hover:bg-zinc-50/80 transition-colors">
                
                {/* Reference ID Column */}
                <td className="p-4 pl-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 font-mono font-black text-xs rounded-lg">
                    <span>{emp.referenceId}</span>
                  </div>
                </td>

                {/* Employee Details Column */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-black text-black text-sm">{emp.name}</div>
                      <div className="text-zinc-500 text-[11px] font-semibold">{emp.email}</div>
                    </div>
                  </div>
                </td>

                {/* Department & Role */}
                <td className="p-4">
                  <div className="font-bold text-black text-xs">{emp.designation}</div>
                  <div className="text-zinc-500 text-[10px] font-medium">{emp.department}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-black text-zinc-700 uppercase">
                    {emp.role}
                  </span>
                </td>

                {/* Assigned Leads & Customers */}
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <div className="bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-xl">
                      <div className="text-[9px] uppercase font-bold text-zinc-400">Leads</div>
                      <div className="text-xs font-black text-red-600">{emp.assignedLeadsCount || 0}</div>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-xl">
                      <div className="text-[9px] uppercase font-bold text-zinc-400">Customers</div>
                      <div className="text-xs font-black text-black">{emp.assignedCustomersCount || 0}</div>
                    </div>
                  </div>
                </td>

                {/* Status Toggle */}
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(emp._id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                      emp.status === 'ACTIVE'
                        ? 'bg-zinc-100 text-black border-zinc-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    {emp.status}
                  </button>
                </td>

                {/* Actions */}
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    
                    {/* Copy Credentials */}
                    <button
                      onClick={() => handleCopyCredentials(emp)}
                      title="Copy Login Credentials"
                      className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200 transition-colors"
                    >
                      {copiedId === emp._id ? <Check className="w-3.5 h-3.5 text-red-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Assign Lead/Customer */}
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsAssignModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200 text-xs font-bold transition-colors"
                    >
                      Assign
                    </button>

                    {/* Test Login Simulator */}
                    <button
                      onClick={() => handleSimulateLoginAsEmployee(emp)}
                      title="Simulate Login as this Employee"
                      className="btn-shimmer px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Test Login</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteEmployee(emp._id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs font-semibold">
                  No employee accounts match the search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Create Employee Account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Create Employee Credentials</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Generated employee can log in to view Leads & Customers. Ad generation is locked to Admin.
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Work Email ID *</label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="alex.leads@adhunter.ai"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Password *</label>
                  <input
                    type="text"
                    required
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Staff Role *</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                  >
                    <option value="EMPLOYEE">Employee (Leads & Customers)</option>
                    <option value="MANAGER">Operations Manager</option>
                    <option value="SUPPORT">Customer Support Specialist</option>
                    <option value="DESIGNER">Creative Reviewer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    placeholder="Lead & Sales Ops"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Designation Title</label>
                  <input
                    type="text"
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    placeholder="Inbound Lead Specialist"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Contact Mobile Phone</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                ⚡ A unique <strong>Reference ID (EMP-REF-XXXXX)</strong> will automatically be assigned upon saving.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shimmer px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-xs shadow-md shadow-red-600/20"
                >
                  Generate Credentials & Save
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Assign Lead or Customer to Employee */}
      {isAssignModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black font-display">Assign Lead or Customer</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Assigning to {selectedEmployee.name} ({selectedEmployee.referenceId})
                </p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="p-2 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setAssignType('LEAD')}
                  className={`py-2 text-xs font-black rounded-xl transition-all ${
                    assignType === 'LEAD' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-700'
                  }`}
                >
                  Assign Lead
                </button>
                <button
                  type="button"
                  onClick={() => setAssignType('CUSTOMER')}
                  className={`py-2 text-xs font-black rounded-xl transition-all ${
                    assignType === 'CUSTOMER' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-700'
                  }`}
                >
                  Assign B2C Customer
                </button>
              </div>

              {/* Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Select {assignType === 'LEAD' ? 'Lead Application' : 'B2C Customer Account'}
                </label>
                <select
                  required
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-black text-xs focus:outline-none focus:border-red-600"
                >
                  <option value="">-- Choose from Database --</option>
                  {assignType === 'LEAD' ? (
                    leadsList.map((lead) => (
                      <option key={lead._id || lead.referenceId} value={lead._id || lead.referenceId}>
                        {lead.name} ({lead.referenceId || 'LEAD'}) - {lead.email}
                      </option>
                    ))
                  ) : (
                    customersList.map((cust) => (
                      <option key={cust._id || cust.referenceId} value={cust._id || cust.referenceId}>
                        {cust.firstName ? `${cust.firstName} ${cust.lastName || ''}` : cust.name} ({cust.referenceId || 'CUST'}) - {cust.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shimmer px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl uppercase text-xs shadow-md shadow-red-600/20"
                >
                  Confirm Assignment
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
