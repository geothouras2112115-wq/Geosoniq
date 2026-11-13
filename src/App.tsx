import React, { useState, useEffect } from 'react';
import { User, Course, VaultFile, UserRole, NotificationItem, AuditLog, ThemePreset } from './types';
import { PRESET_USERS, MOCK_COURSES, MOCK_VAULT_FILES, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS } from './mockData';
import { Navbar } from './components/Navbar';
import { OTPAuthModal } from './components/OTPAuthModal';
import { LiveClassroom } from './components/Classroom/LiveClassroom';
import { ClassSchedule } from './components/Classroom/ClassSchedule';
import { GlobalGroupChat } from './components/Chat/GlobalGroupChat';
import { CourseCatalog } from './components/Courses/CourseCatalog';
import { CourseDetail } from './components/Courses/CourseDetail';
import { FileVault } from './components/FileManager/FileVault';
import { AITutorModal } from './components/AITutorModal';
import { DownloadPage } from './components/DownloadPage';
import { RoleManagementPanel } from './components/Admin/RoleManagementPanel';
import { InternetIndicator } from './components/Admin/InternetIndicator';
import { NotificationCenter } from './components/Notifications/NotificationCenter';
import { testFirestoreConnection, saveUserRoleToFirestore } from './services/firebase';
import { Bell, CheckCircle2, KeyRound, ArrowRight, Sparkles, Smartphone, ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('geosoniq_theme');
    return (saved as ThemePreset) || 'cosmic_dark';
  });

  const handleSelectTheme = (newTheme: ThemePreset) => {
    setTheme(newTheme);
    localStorage.setItem('geosoniq_theme', newTheme);
  };

  // Users list state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('geosoniq_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return PRESET_USERS;
  });

  // Current Logged in User
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('geosoniq_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return PRESET_USERS[0]; // Default logged-in user
  });

  // Push Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('geosoniq_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Active Tab & Modals
  const [activeTab, setActiveTab] = useState<'classroom' | 'schedule' | 'chat' | 'courses' | 'vault' | 'ai_tutor' | 'admin' | 'download'>('classroom');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'forgot_password'>('login');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>(MOCK_VAULT_FILES);
  
  // AI Tutor Modal State
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [aiTutorTopic, setAiTutorTopic] = useState('GeoSoniq: Seismic Wave & GIS Analysis');

  // Popup Toast Banner for Instant FCM Push Alerts
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    localStorage.setItem('geosoniq_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('geosoniq_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('geosoniq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    testFirestoreConnection();

    // Chrome Search Engine Routing and Deep Linking
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q') || params.get('search');
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      if (q.includes('download') || q.includes('apk') || q.includes('app') || q.includes('install') || q.includes('phone') || q.includes('get')) {
        setActiveTab('download');
      } else if (q.includes('class') || q.includes('live') || q.includes('classroom') || q.includes('video') || q.includes('stream')) {
        setActiveTab('classroom');
      } else if (q.includes('course') || q.includes('subject') || q.includes('syllabus') || q.includes('study') || q.includes('learn')) {
        setSelectedCourse(null);
        setActiveTab('courses');
      } else if (q.includes('vault') || q.includes('file') || q.includes('gis') || q.includes('pdf') || q.includes('data')) {
        setActiveTab('vault');
      } else if (q.includes('schedule') || q.includes('time') || q.includes('calendar') || q.includes('date')) {
        setActiveTab('schedule');
      } else if (q.includes('chat') || q.includes('group') || q.includes('message') || q.includes('social')) {
        setActiveTab('chat');
      } else {
        // Query represents an educational topic -> open AI Study Tutor on that topic
        setAiTutorTopic(`Chrome Search: ${searchQuery}`);
        setIsAITutorOpen(true);
      }
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Add to users list if new
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) return prev.map((u) => (u.id === user.id ? user : u));
      return [user, ...prev];
    });

    // Add audit log
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action: 'USER_LOGIN',
      performedBy: user.name,
      timestamp: new Date().toLocaleString(),
      details: `User signed in as ${user.role.toUpperCase()} role via OTP/Password.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    const loggedOutUser = { ...currentUser, isLoggedIn: false };
    setCurrentUser(loggedOutUser);
    setIsAuthModalOpen(true);
  };

  // User Role Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      if (currentUser.id === userId) {
        setCurrentUser((prev) => ({ ...prev, role: newRole }));
      }

      const log: AuditLog = {
        id: `log_${Date.now()}`,
        action: 'ROLE_MODIFIED',
        performedBy: `${currentUser.name} (Admin)`,
        targetUser: targetUser.name,
        timestamp: new Date().toLocaleString(),
        details: `Updated role of ${targetUser.name} to ${newRole.toUpperCase()}.`,
      };
      setAuditLogs((prev) => [log, ...prev]);
    }
  };

  const handleToggleSuspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u
      )
    );
  };

  const handleAddNewUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      action: 'USER_CREATED',
      performedBy: `${currentUser.name} (Admin)`,
      targetUser: newUser.name,
      timestamp: new Date().toLocaleString(),
      details: `Created new user ${newUser.name} with role ${newUser.role.toUpperCase()}.`,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      saveUserRoleToFirestore(userId, { ...targetUser, ...updates });
    }
  };

  const handleUpdateUserPassword = (identifier: string, newPassword: string) => {
    const normalized = identifier.trim().toLowerCase();
    const targetUser = users.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        u.phone.replace(/\s+/g, '') === normalized.replace(/\s+/g, '')
    );

    if (targetUser) {
      handleUpdateUser(targetUser.id, { password: newPassword });
      const log: AuditLog = {
        id: `log_${Date.now()}`,
        action: 'PASSWORD_RESET',
        performedBy: targetUser.name,
        targetUser: targetUser.name,
        timestamp: new Date().toLocaleString(),
        details: `Password reset via OTP verification for ${targetUser.email} (${targetUser.role.toUpperCase()}).`,
      };
      setAuditLogs((prev) => [log, ...prev]);
    }
  };

  const handleAddAuditLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      performedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      timestamp: new Date().toLocaleString(),
      details,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // FCM Push Notifications Handlers
  const handleSendNotification = (newNotif: NotificationItem) => {
    setNotifications((prev) => [newNotif, ...prev]);
    setToastNotification(newNotif);

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      action: 'FCM_PUSH_DISPATCH',
      performedBy: `${currentUser.name} (${currentUser.role})`,
      timestamp: new Date().toLocaleString(),
      details: `Dispatched FCM notification "${newNotif.title}" to target ${newNotif.targetPlatform.toUpperCase()} devices.`,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Hide toast after 5s
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleJoinClassDirectly = () => {
    setActiveTab('classroom');
    setIsNotificationModalOpen(false);
    setToastNotification(null);
  };

  // Vault Handlers
  const handleAddFileToVault = (newFile: VaultFile) => {
    setVaultFiles((prev) => [newFile, ...prev]);
  };

  const handleToggleStarFile = (fileId: string) => {
    setVaultFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, starred: !f.starred } : f))
    );
  };

  const handleDeleteFile = (fileId: string) => {
    setVaultFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleOpenAITutorWithTopic = (topic: string) => {
    setAiTutorTopic(topic);
    setIsAITutorOpen(true);
  };

  const handleUpdateUserAvatar = (avatarUrl: string) => {
    setCurrentUser((prev) => ({ ...prev, avatar: avatarUrl }));
    setUsers((prev) => prev.map(u => u.id === currentUser.id ? {...u, avatar: avatarUrl} : u));
  };

  const themeBgClass =
    theme === 'light_clean'
      ? 'bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-900'
      : theme === 'emerald_dark'
      ? 'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] text-white'
      : theme === 'midnight_neon'
      ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white'
      : 'bg-gradient-to-br from-[#0b1329] via-[#1a1c2e] to-[#0d0f1a] text-white';

  return (
    <div className={`min-h-screen ${themeBgClass} flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300`}>
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'ai_tutor') {
            setIsAITutorOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        unreadNotificationCount={unreadCount}
        isLiveSession={true}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        onUpdateUserAvatar={handleUpdateUserAvatar}
      />

      {/* Floating Real-Time FCM Push Toast Alert */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 border-2 border-sky-400 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl text-white animate-bounce">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-sky-500/20 text-sky-300 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-sky-300">FCM Push Alert</span>
                <button
                  onClick={() => setToastNotification(null)}
                  className="text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <h4 className="font-bold text-sm text-white mt-0.5">{toastNotification.title}</h4>
              <p className="text-xs text-white/80 mt-1">{toastNotification.body}</p>

              {(toastNotification.category === 'class' || toastNotification.title.toLowerCase().includes('class') || toastNotification.title.toLowerCase().includes('live')) && (
                <button
                  onClick={handleJoinClassDirectly}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:from-emerald-300 hover:to-teal-400 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>⚡ Join Online Class Directly</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Views / Protected Content Gate */}
      <main className="flex-1">
        {!currentUser.isLoggedIn ? (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-extrabold shadow-lg">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Restricted Content Gate — Authentication Required</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                GeoSoniq — Study Geology With Us
              </h1>
              <p className="text-sm max-w-xl mx-auto text-white/70">
                Live classrooms, GIS vault files, and AI study resources are strictly protected. Please log in with your registered ID, Password, and Real-Time OTP to enter.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-base shadow-2xl transition-all flex items-center space-x-3 active:scale-95"
              >
                <KeyRound className="w-5 h-5" />
                <span>Sign In via ID & Password / OTP</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setAuthModalMode('forgot_password');
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 font-bold rounded-2xl text-sm shadow-xl transition-all active:scale-95"
              >
                Forgot Password?
              </button>
            </div>

            {/* Quick Presets for Demo Testing */}
            <div className="pt-8 border-t border-white/10 max-w-2xl mx-auto text-left space-y-4">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block text-center">
                Select Account Preset for Instant Authenticated Access
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      const loggedUser = { ...u, isLoggedIn: true };
                      handleLoginSuccess(loggedUser);
                    }}
                    className="p-4 bg-black/40 hover:bg-white/10 border border-white/20 rounded-2xl text-left transition-all group shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/50"
                      />
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-amber-300">
                          {u.name}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                          u.role === 'admin' ? 'bg-amber-500/30 text-amber-300' : u.role === 'teacher' ? 'bg-purple-500/30 text-purple-300' : 'bg-cyan-500/30 text-cyan-300'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'classroom' && (
              <LiveClassroom
                currentUser={currentUser}
                onAddFileToVault={handleAddFileToVault}
                onOpenAITutor={handleOpenAITutorWithTopic}
              />
            )}

            {activeTab === 'schedule' && (
              <ClassSchedule
                currentUser={currentUser}
                onJoinClass={(clsId) => setActiveTab('classroom')}
                onOpenAITutor={handleOpenAITutorWithTopic}
              />
            )}

            {activeTab === 'chat' && (
              <GlobalGroupChat
                currentUser={currentUser}
                users={users}
                onOpenAITutor={handleOpenAITutorWithTopic}
              />
            )}

            {activeTab === 'courses' && (
              selectedCourse ? (
                <CourseDetail
                  course={selectedCourse}
                  currentUser={currentUser}
                  onBack={() => setSelectedCourse(null)}
                  onOpenAITutor={handleOpenAITutorWithTopic}
                  onAddFileToVault={handleAddFileToVault}
                />
              ) : (
                <CourseCatalog
                  onSelectCourse={(course) => setSelectedCourse(course)}
                  onOpenAITutor={handleOpenAITutorWithTopic}
                />
              )
            )}

            {activeTab === 'vault' && (
              <FileVault
                files={vaultFiles}
                currentUser={currentUser}
                onUploadFile={handleAddFileToVault}
                onToggleStar={handleToggleStarFile}
                onDeleteFile={handleDeleteFile}
                onOpenAITutor={handleOpenAITutorWithTopic}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <RoleManagementPanel
                users={users}
                currentUser={currentUser}
                onUpdateUserRole={handleUpdateUserRole}
                onToggleSuspendUser={handleToggleSuspendUser}
                onAddNewUser={handleAddNewUser}
                onUpdateUser={handleUpdateUser}
                onAddAuditLog={handleAddAuditLog}
                auditLogs={auditLogs}
              />
            )}

            {activeTab === 'download' && (
              <DownloadPage currentUser={currentUser} />
            )}
          </>
        )}
      </main>

      {/* Login & Forgot Password OTP Modal */}
      <OTPAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        users={users}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onUpdateUserPassword={handleUpdateUserPassword}
      />

      {/* FCM Push Notification Center Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <NotificationCenter
            notifications={notifications}
            currentUser={currentUser}
            onSendNotification={handleSendNotification}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAllNotifications}
            onClose={() => setIsNotificationModalOpen(false)}
            onJoinClassDirectly={handleJoinClassDirectly}
          />
        </div>
      )}

      {/* AI Tutor Floating Assistant Modal */}
      <AITutorModal
        isOpen={isAITutorOpen}
        topicContext={aiTutorTopic}
        onClose={() => setIsAITutorOpen(false)}
      />

      <InternetIndicator />

    </div>
  );
}
