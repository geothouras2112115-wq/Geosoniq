import React, { useState, useEffect } from 'react';
import { NotificationItem, TargetPlatform, UserRole, User } from '../../types';
import {
  Bell,
  Send,
  Smartphone,
  Monitor,
  CheckCheck,
  Sparkles,
  Info,
  Volume2,
  VolumeX,
  X,
  Plus,
  Radio,
  Clock,
  ShieldAlert,
  Video
} from 'lucide-react';
import { sendFCMNotificationToFirestore } from '../../services/firebase';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  currentUser: User;
  onSendNotification: (notif: NotificationItem) => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose?: () => void;
  onJoinClassDirectly?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  currentUser,
  onSendNotification,
  onMarkAsRead,
  onClearAll,
  onClose,
  onJoinClassDirectly,
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  // Dispatcher Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>('all');
  const [targetRole, setTargetRole] = useState<UserRole | 'all'>('all');
  const [category, setCategory] = useState<'alert' | 'class' | 'assignment' | 'vault' | 'system'>('alert');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'dispatch'>('feed');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canDispatch = currentUser.role === 'admin' || currentUser.role === 'teacher';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermissionState(result);
      if (result === 'granted') {
        new Notification('GeoSoniq Push Notifications Enabled', {
          body: 'You will now receive real-time class alerts on Windows and Android!',
          icon: '/assets/aistudio/image_492a3ed4.png',
        });
      }
    }
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setIsSending(true);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      body,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      targetPlatform,
      targetRole,
      timestamp: 'Just now',
      read: false,
      category,
    };

    // Send via local handler
    onSendNotification(newNotif);

    // Sync to Firestore
    await sendFCMNotificationToFirestore(newNotif);

    // Trigger Native Windows / Android Web Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`GeoSoniq Alert: ${title}`, {
          body: body,
          badge: '/assets/aistudio/image_492a3ed4.png',
        });
      } catch (err) {
        console.log('Native notification output:', err);
      }
    }

    // Reset
    setTitle('');
    setBody('');
    setIsSending(false);
    setActiveTab('feed');
  };

  const applyTemplate = (tmplTitle: string, tmplBody: string, tmplCategory: any) => {
    setTitle(tmplTitle);
    setBody(tmplBody);
    setCategory(tmplCategory);
    setActiveTab('dispatch');
  };

  return (
    <div className="bg-slate-900 border border-white/20 rounded-3xl shadow-2xl p-6 max-w-2xl w-full text-white backdrop-blur-2xl animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/15">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-2xl shadow-lg text-slate-950 font-bold">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">GeoSoniq Push Notification Center</h2>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-400/30">
                FCM Windows & Android
              </span>
            </div>
            <p className="text-xs text-white/70">
              Targeted messaging across Windows Desktop & Android Mobile endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable Notification Chime' : 'Enable Notification Chime'}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/15"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/15"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>
      </div>

      {/* Browser Permission Status Banner */}
      {permissionState !== 'granted' && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Enable native Windows & Android OS push popups for this device.</span>
          </div>
          <button
            onClick={requestBrowserPermission}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow transition-all whitespace-nowrap"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between mt-4 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'feed'
                ? 'bg-white/20 text-white border border-white/20 shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Notification Inbox ({notifications.length})
          </button>

          {canDispatch && (
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'dispatch'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                  : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>FCM Push Dispatcher</span>
            </button>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-white/50 hover:text-rose-300 transition-colors"
          >
            Clear All Inbox
          </button>
        )}
      </div>

      {/* Tab 1: Notification Inbox Feed */}
      {activeTab === 'feed' && (
        <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-white/50 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-white/30" />
              <p className="text-xs">No active notifications. You're all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-black/30 border-white/10 text-white/70'
                    : 'bg-white/10 border-sky-400/40 text-white shadow-lg backdrop-blur-md ring-1 ring-sky-400/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">{n.body}</p>

                    {onJoinClassDirectly && (n.category === 'class' || n.title.toLowerCase().includes('class') || n.title.toLowerCase().includes('live')) && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(n.id);
                            onJoinClassDirectly();
                            if (onClose) onClose();
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-md hover:from-emerald-300 hover:to-teal-400 transition-all flex items-center space-x-1.5 active:scale-95"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>⚡ Join Online Class Directly</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 pt-2 text-[10px] text-white/50">
                      <span>By {n.senderName} ({n.senderRole})</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{n.timestamp}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize inline-flex items-center space-x-1 font-semibold text-sky-300">
                        {n.targetPlatform === 'windows' ? (
                          <Monitor className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>Target: {n.targetPlatform}</span>
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(n.id);
                      }}
                      title="Mark read"
                      className="text-sky-300 hover:text-white"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: FCM Push Notification Dispatcher (For Admin / Teacher) */}
      {activeTab === 'dispatch' && canDispatch && (
        <div className="mt-4 space-y-4">
          
          {/* Quick Presets */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-amber-300 block">⚡ Quick Notification Templates</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  applyTemplate(
                    '🎥 Live Online Class Call Inviting All Students',
                    'Dr. Sarah Lin has started a live interactive video session! Click Join Online Class Directly to enter the live room now.',
                    'class'
                  )
                }
                className="px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/40 hover:to-teal-500/40 rounded-lg text-[11px] text-emerald-300 border border-emerald-400/30 font-bold"
              >
                + Live Video Conference Call Invite
              </button>
              <button
                onClick={() =>
                  applyTemplate(
                    '🌐 Live Geoscience Class Alert',
                    'A live field session is starting now in the Live Classroom! Join immediately for interactive whiteboard analysis.',
                    'class'
                  )
                }
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] text-sky-300 border border-white/15"
              >
                + Class Starting Alert
              </button>
              <button
                onClick={() =>
                  applyTemplate(
                    '📚 Field Report Assignment Due',
                    'Reminder: Submit your GIS Spatial Analysis report in the Vault before 11:59 PM today.',
                    'assignment'
                  )
                }
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] text-emerald-300 border border-white/15"
              >
                + Assignment Reminder
              </button>
              <button
                onClick={() =>
                  applyTemplate(
                    '📢 GeoSoniq Platform System Update',
                    'New geophysics lecture recordings and satellite datasets have been added to the File Vault.',
                    'system'
                  )
                }
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] text-amber-300 border border-white/15"
              >
                + System Vault Update
              </button>
            </div>
          </div>

          <form onSubmit={handleSendSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-white/80 font-bold mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 🌋 Urgent Fieldwork Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-1">Notification Body Text</label>
              <textarea
                required
                rows={3}
                placeholder="Write message content delivered to user devices..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/80 font-bold mb-1">Target Device Platform</label>
                <div className="flex space-x-2">
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as TargetPlatform)}
                    className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none font-semibold"
                  >
                    <option value="all">All Devices (Windows + Android)</option>
                    <option value="windows">Windows PC Desktop Only</option>
                    <option value="android">Android Mobile Devices Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">Target User Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none font-semibold"
                >
                  <option value="all">All Enrolled Roles</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers / Instructors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all active:scale-95 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Dispatching FCM Push...' : 'Broadcast FCM Notification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
