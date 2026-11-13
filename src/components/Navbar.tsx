import React, { useState, useRef } from 'react';
import {
  Video, BookOpen, FolderKey, Bot, KeyRound, LogOut, ShieldCheck, Sparkles,
  Bell, Users, Sun, Moon, Palette, Check, Calendar, MessageSquare, Smartphone, Download, Upload
} from 'lucide-react';
import { User, ThemePreset } from '../types';
import { GeoSoniqLogo } from './GeoSoniqLogo';
import { ApkDownloadModal } from './ApkDownloadModal';

interface NavbarProps {
  activeTab: 'classroom' | 'courses' | 'vault' | 'ai_tutor' | 'admin' | 'schedule' | 'chat' | 'download';
  setActiveTab: (tab: 'classroom' | 'courses' | 'vault' | 'ai_tutor' | 'admin' | 'schedule' | 'chat' | 'download') => void;
  currentUser: User;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
  isLiveSession: boolean;
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
  onUpdateUserAvatar?: (avatarUrl: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  unreadNotificationCount,
  isLiveSession,
  currentTheme,
  onSelectTheme,
  onUpdateUserAvatar,
}) => {
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpdateUserAvatar) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onUpdateUserAvatar(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/15 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Live Badge */}
          <div className="flex items-center space-x-3">
            <GeoSoniqLogo size={42} showText={true} />

            {isLiveSession && (
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-300 font-medium ml-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>Live Geophysics Session</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button
              id="nav-btn-classroom"
              onClick={() => setActiveTab('classroom')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'classroom'
                  ? 'bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="w-4 h-4 text-sky-400" />
              <span>Live Class</span>
            </button>

            <button
              id="nav-btn-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Schedule</span>
            </button>

            <button
              id="nav-btn-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-300" />
              <span>Group Chat</span>
            </button>

            <button
              id="nav-btn-courses"
              onClick={() => setActiveTab('courses')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'courses'
                  ? 'bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Courses</span>
            </button>

            <button
              id="nav-btn-vault"
              onClick={() => setActiveTab('vault')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'vault'
                  ? 'bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderKey className="w-4 h-4 text-purple-400" />
              <span>Class Vault</span>
            </button>

            <button
              id="nav-btn-download"
              onClick={() => setActiveTab('download')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'download'
                  ? 'bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 shadow-lg backdrop-blur-md'
                  : 'text-emerald-300/80 hover:text-emerald-300 hover:bg-white/10'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Get App</span>
            </button>

            <button
              id="nav-btn-ai-tutor"
              onClick={() => setActiveTab('ai_tutor')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ai_tutor'
                  ? 'bg-gradient-to-r from-violet-600/80 to-indigo-600/80 border border-white/30 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Study Tutor</span>
            </button>

            {/* Admin Only Tab */}
            {currentUser.role === 'admin' && (
              <button
                id="nav-btn-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/30 border border-amber-400/50 text-amber-200 shadow-lg backdrop-blur-md'
                    : 'text-amber-300/80 hover:text-amber-300 hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Admin Roles & System</span>
              </button>
            )}
          </nav>

          {/* Right Notification Bell, Theme Switcher, APK Download & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* APK Download & Direct Share Button */}
            <button
              onClick={() => setIsApkModalOpen(true)}
              title="Download Android APK & Share via WhatsApp / Message"
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/50 hover:to-teal-500/50 border border-emerald-400/50 rounded-2xl text-emerald-200 text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Get APK</span>
            </button>

            {/* Dedicated Theme Cycle Switcher Button */}
            <button
              onClick={() => {
                const targetThemes: ThemePreset[] = ['cosmic_dark', 'emerald_dark', 'midnight_neon'];
                const currentIndex = targetThemes.indexOf(currentTheme);
                const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % targetThemes.length;
                onSelectTheme(targetThemes[nextIndex]);
              }}
              title="Cycle Theme (Cosmic / Emerald / Midnight)"
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white transition-all duration-300 shadow-md flex items-center active:scale-95"
            >
              {currentTheme === 'emerald_dark' ? (
                <Palette className="w-5 h-5 text-emerald-400" />
              ) : currentTheme === 'midnight_neon' ? (
                <Sparkles className="w-5 h-5 text-purple-400" />
              ) : (
                <Moon className="w-5 h-5 text-sky-300" />
              )}
            </button>

            {/* FCM Push Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              title="FCM Push Notification Center (Windows & Android)"
              className="relative p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white transition-all shadow-md active:scale-95"
            >
              <Bell className="w-5 h-5 text-sky-300" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-slate-950 animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {currentUser.isLoggedIn ? (
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md pl-2 pr-3 py-1.5 rounded-2xl border border-white/20">
                <div className="relative group">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 cursor-pointer group-hover:ring-emerald-400"
                    onClick={handleAvatarClick}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <a 
                  href="/app-debug.apk" 
                  download="GeoSoniq_Study_Geology.apk"
                  className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition-all text-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Get APK</span>
                </a>

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>{currentUser.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                          : currentUser.role === 'teacher'
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                          : 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/60 block truncate max-w-[130px]">
                    {currentUser.department}
                  </span>
                </div>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Sign Out / Switch Account"
                  className="p-1.5 text-white/60 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-otp-login"
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs transition-all shadow-lg active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>GeoSoniq Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex flex-col items-center p-1 font-medium ${
              activeTab === 'classroom' ? 'text-sky-400 font-bold' : 'text-white/60'
            }`}
          >
            <Video className="w-4 h-4 mb-0.5" />
            <span>Class</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex flex-col items-center p-1 font-medium ${
              activeTab === 'courses' ? 'text-emerald-400 font-bold' : 'text-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Courses</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex flex-col items-center p-1 font-medium ${
              activeTab === 'vault' ? 'text-purple-400 font-bold' : 'text-white/60'
            }`}
          >
            <FolderKey className="w-4 h-4 mb-0.5" />
            <span>Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_tutor')}
            className={`flex flex-col items-center p-1 font-medium ${
              activeTab === 'ai_tutor' ? 'text-amber-400 font-bold' : 'text-white/60'
            }`}
          >
            <Bot className="w-4 h-4 mb-0.5" />
            <span>AI Tutor</span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center p-1 font-medium ${
                activeTab === 'admin' ? 'text-amber-300 font-bold' : 'text-amber-400/60'
              }`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* APK Download & Share Modal */}
        {isApkModalOpen && (
          <ApkDownloadModal
            currentUser={currentUser}
            onClose={() => setIsApkModalOpen(false)}
          />
        )}

      </div>
    </header>
  );
};
