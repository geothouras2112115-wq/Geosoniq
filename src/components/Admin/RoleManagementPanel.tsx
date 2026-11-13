import React, { useState } from 'react';
import { User, UserRole, AuditLog } from '../../types';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Plus,
  Edit2,
  Lock,
  Smartphone,
  Monitor,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Users,
  Download,
  MapPin,
  Activity,
  Globe,
  Laptop,
  Radio,
  Power
} from 'lucide-react';
import { saveUserRoleToFirestore } from '../../services/firebase';
import { SecretAdminPanel } from './SecretAdminPanel';

interface RoleManagementPanelProps {
  users: User[];
  currentUser: User;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onToggleSuspendUser: (userId: string) => void;
  onAddNewUser: (newUser: User) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onAddAuditLog?: (action: string, details: string) => void;
  auditLogs: AuditLog[];
}

export const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({
  users,
  currentUser,
  onUpdateUserRole,
  onToggleSuspendUser,
  onAddNewUser,
  onUpdateUser,
  onAddAuditLog,
  auditLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'windows' | 'android' | 'web'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'matrix' | 'audit'>('users');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSecretPanelOpen, setIsSecretPanelOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newDept, setNewDept] = useState('GeoSoniq Field Operations');
  const [newDevice, setNewDevice] = useState<'windows' | 'android' | 'web'>('android');
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    onUpdateUserRole(userId, targetRole);
    // Sync to Firestore
    const user = users.find((u) => u.id === userId);
    if (user) {
      await saveUserRoleToFirestore(userId, {
        ...user,
        role: targetRole,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    setIsSaving(true);
    setTimeout(() => {
      const createdUser: User = {
        id: `usr_${Date.now()}`,
        name: newName,
        email: newEmail,
        phone: newPhone || '+91 98000 00000',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName}`,
        role: newRole,
        department: newDept,
        isLoggedIn: false,
        registeredDevice: newDevice,
        password: 'password123',
        createdAt: new Date().toISOString().split('T')[0],
      };

      onAddNewUser(createdUser);
      saveUserRoleToFirestore(createdUser.id, createdUser);

      // Reset
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setIsAddModalOpen(false);
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-white">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900/60 via-slate-900/80 to-indigo-950/60 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 font-bold">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">GeoSoniq User Role Management</h1>
              <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                Admin Center
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Assign roles (Student, Teacher, Admin), restrict feature access, and persist configurations in Firestore.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSecretPanelOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 rounded-xl border border-rose-500/30 font-bold text-xs transition-all active:scale-95"
            title="Secret Admin Panel (Password Protected)"
          >
            <Lock className="w-4 h-4 text-rose-300" />
            <span>Admin Security</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-amber-500 text-slate-950 font-extrabold rounded-2xl shadow-2xl border border-amber-300 text-xs flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Device & Location Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'matrix'
              ? 'bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: User Directory List & Role Assignment */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-white/50" />
              <input
                type="text"
                placeholder="Search user by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-white/60 font-medium">Filter Role:</span>
              {(['all', 'admin', 'teacher', 'student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    roleFilter === r
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/10 text-white/70 text-xs font-bold border-b border-white/15">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Contact & Department</th>
                    <th className="py-3.5 px-4">Device Target</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {u.id === currentUser.id && (
                                <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-1.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-white/60">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-white/80 font-medium">{u.phone}</div>
                        <div className="text-[11px] text-white/50">{u.department}</div>
                      </td>

                      {/* Device Target */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white/10 rounded-lg border border-white/15 text-[11px] text-white/90">
                          {u.registeredDevice === 'windows' ? (
                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="capitalize">{u.registeredDevice || 'Android'}</span>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                              : u.role === 'teacher'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          }`}
                        >
                          <option value="student" className="bg-slate-900 text-white">Student Role</option>
                          <option value="teacher" className="bg-slate-900 text-white">Teacher / Instructor</option>
                          <option value="admin" className="bg-slate-900 text-white">System Admin</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onToggleSuspendUser(u.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all ${
                            u.isSuspended
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Devices & Location Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Stat Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/60 border border-white/20 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/60 font-semibold uppercase tracking-wider block">Total Users</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{users.length}</span>
                <span className="text-[10px] text-sky-300 font-bold mt-1 inline-block">Registered Accounts</span>
              </div>
              <div className="p-3.5 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-teal-950/60 border border-white/20 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/60 font-semibold uppercase tracking-wider block">Active Online</span>
                <span className="text-2xl font-extrabold text-emerald-300 mt-1 block">
                  {users.filter(u => u.activeStatus === 'online' || u.isLoggedIn).length}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">● Real-time Sessions</span>
              </div>
              <div className="p-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-900/40 via-slate-900 to-violet-950/60 border border-white/20 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/60 font-semibold uppercase tracking-wider block">Device Target</span>
                <div className="flex items-center space-x-2 mt-1 text-xs font-bold text-white">
                  <span>📱 Android ({users.filter(u => u.registeredDevice === 'android').length})</span>
                  <span>💻 Windows ({users.filter(u => u.registeredDevice === 'windows').length})</span>
                </div>
                <span className="text-[10px] text-purple-300 font-bold mt-1 inline-block">Cross-Platform Sync</span>
              </div>
              <div className="p-3.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-2xl">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-900/40 via-slate-900 to-yellow-950/60 border border-white/20 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-white/60 font-semibold uppercase tracking-wider block">Geographic Places</span>
                <span className="text-2xl font-extrabold text-amber-300 mt-1 block">5 Stations</span>
                <span className="text-[10px] text-amber-200 font-bold mt-1 inline-block">Dehradun, Delhi, Mumbai, BLR</span>
              </div>
              <div className="p-3.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-2xl">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Device & Location Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Active User Location & Device Monitor</span>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs text-white/60">Filter Device:</span>
              {(['all', 'windows', 'android', 'web'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDeviceFilter(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    deviceFilter === d
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Active Sessions & Locations Table */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/10 text-white/70 font-bold border-b border-white/15">
                    <th className="py-3.5 px-4">User & Role</th>
                    <th className="py-3.5 px-4">Device & OS</th>
                    <th className="py-3.5 px-4">Place / Field Location</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-4 text-center">Active Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users
                    .filter((u) => deviceFilter === 'all' || u.registeredDevice === deviceFilter)
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        
                        {/* User & Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                  u.role === 'admin' ? 'bg-amber-400/20 text-amber-300' : u.role === 'teacher' ? 'bg-purple-400/20 text-purple-300' : 'bg-cyan-400/20 text-cyan-300'
                                }`}>
                                  {u.role}
                                </span>
                              </div>
                              <span className="text-[11px] text-white/60">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Device & OS */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-black/40 rounded-xl border border-white/15 text-white/90 font-medium">
                            {u.registeredDevice === 'windows' ? (
                              <Monitor className="w-3.5 h-3.5 text-blue-400" />
                            ) : u.registeredDevice === 'android' ? (
                              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-purple-400" />
                            )}
                            <span className="capitalize">{u.registeredDevice || 'Android'}</span>
                          </div>
                        </td>

                        {/* Geolocation */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 text-amber-200 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{u.location || 'Dehradun Geophysics HQ (India)'}</span>
                          </div>
                        </td>

                        {/* IP Address */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-sky-300 bg-black/40 px-2 py-1 rounded border border-white/10">
                            {u.ipAddress || '103.24.112.45'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {u.activeStatus === 'online' || u.isLoggedIn ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Online Live</span>
                            </span>
                          ) : u.activeStatus === 'idle' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                              <span>Idle</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-500/20 text-white/50 border border-white/10 text-[10px] font-bold">
                              <span>Offline</span>
                            </span>
                          )}
                        </td>

                        {/* Admin Controls */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => showToast(`⚡ Force disconnected session for ${u.name}!`)}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold transition-all flex items-center space-x-1"
                              title="Force Logout User Session"
                            >
                              <Power className="w-3 h-3" />
                              <span>Disconnect</span>
                            </button>
                            <button
                              onClick={() => onToggleSuspendUser(u.id)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                u.isSuspended
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {u.isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
      {activeTab === 'matrix' && (
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h2>
          <p className="text-xs text-white/70 mb-6">
            Feature restrictions enforced across student, teacher, and admin users. Stored persistently in Firestore.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/10 text-white/80 border-b border-white/20 font-bold">
                  <th className="py-3 px-4">Feature / Operation Scope</th>
                  <th className="py-3 px-4 text-center text-cyan-300">Student Role</th>
                  <th className="py-3 px-4 text-center text-purple-300">Teacher / Instructor</th>
                  <th className="py-3 px-4 text-center text-amber-300">Admin Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="py-3 px-4 font-medium">Join Live Classroom & Whiteboard</td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Host Session & Mute Participants</td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Upload Documents to Class File Vault</td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Delete / Purge Documents from Vault</td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Send Class Level Push Notifications</td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Global System FCM Dispatch (Windows & Android)</td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">User Role Assignment & Account Ban</td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><XCircle className="w-4 h-4 text-rose-400 inline" /></td>
                  <td className="text-center py-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Admin System Audit Trail & Compliance Report</span>
              </h2>
              <p className="text-xs text-white/70 mt-1">
                Real-time audit log of user role changes, logins, device access, and FCM notification dispatches.
              </p>
            </div>

            <button
              onClick={() => {
                const csvRows = [
                  ['Log ID', 'Action', 'Performed By', 'Details / Event', 'Timestamp'],
                  ...auditLogs.map((log) => [
                    log.id,
                    log.action,
                    log.performedBy,
                    `"${log.details.replace(/"/g, '""')}"`,
                    log.timestamp
                  ])
                ];
                const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `GeoSoniq_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('📄 Full Audit Report CSV downloaded successfully!');
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2 shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Audit Report (CSV)</span>
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                      {log.action}
                    </span>
                    <span className="text-white font-semibold">{log.performedBy}</span>
                  </div>
                  <p className="text-white/80">{log.details}</p>
                </div>
                <span className="text-[10px] text-white/50 whitespace-nowrap">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Create New GeoSoniq User</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@geosoniq.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Assign Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Target Device</label>
                  <select
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value as any)}
                    className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="android">Android Mobile</option>
                    <option value="windows">Windows PC</option>
                    <option value="web">Web Browser</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save & Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Admin Panel */}
      {isSecretPanelOpen && (
        <SecretAdminPanel
          users={users}
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onClose={() => setIsSecretPanelOpen(false)}
          onPasswordAudit={(details) => onAddAuditLog?.('ADMIN_PASSWORD_UPDATED', details)}
        />
      )}

    </div>
  );
};
