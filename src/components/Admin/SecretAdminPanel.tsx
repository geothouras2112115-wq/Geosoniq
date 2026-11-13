import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, User, Shield, CheckCircle2, Camera, Mic, Phone, X, Eye, EyeOff,
  KeyRound, ArrowRight, RefreshCw, AlertCircle, ShieldCheck
} from 'lucide-react';
import { User as UserType } from '../../types';

const ADMIN_SECRET_STORAGE_KEY = 'geosoniq_admin_secret_password';

interface SecretAdminPanelProps {
  users: UserType[];
  currentUser: UserType;
  onUpdateUser: (userId: string, updates: Partial<UserType>) => void;
  onClose: () => void;
  onPasswordAudit?: (details: string) => void;
}

export const SecretAdminPanel: React.FC<SecretAdminPanelProps> = ({
  users,
  currentUser,
  onUpdateUser,
  onClose,
  onPasswordAudit,
}) => {
  const [storedAdminPassword, setStoredAdminPassword] = useState<string>(() => {
    return localStorage.getItem(ADMIN_SECRET_STORAGE_KEY) || 'admin123';
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminPhone, setAdminPhone] = useState(currentUser.phone || '');

  // Forgot Admin Password Flow
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'verify_id' | 'otp' | 'new_password'>('verify_id');
  const [adminIdentifier, setAdminIdentifier] = useState(currentUser.email || 'rajesh.bhardwaj@geosoniq.com');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Authenticated Change Password Form
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [changeNewPass, setChangeNewPass] = useState('');
  const [changeConfirmPass, setChangeConfirmPass] = useState('');
  const [panelToast, setPanelToast] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (authMode === 'forgot' && forgotStep === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, forgotStep, countdown]);

  const showPanelToast = (msg: string) => {
    setPanelToast(msg);
    setTimeout(() => setPanelToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === storedAdminPassword) {
      setIsAuthenticated(true);
      setError('');
      setPassword('');
    } else {
      setError('Invalid Admin Password. Click "Forgot Password?" below to reset via OTP.');
    }
  };

  const handleRequestResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = adminIdentifier.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your registered Admin Email or Phone Number.');
      return;
    }

    const matchedAdmin = users.find(
      (u) =>
        u.role === 'admin' &&
        (u.email.toLowerCase() === trimmed || u.phone.replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''))
    );

    if (!matchedAdmin) {
      setError('No Admin account matched that Email or Phone Number.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(60);
    setForgotStep('otp');
    setTimeout(() => otpInputRefs.current[0]?.focus(), 120);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').slice(0, 6).split('');
      const updated = [...otpDigits];
      chars.forEach((c, idx) => {
        if (idx < 6) updated[idx] = c;
      });
      setOtpDigits(updated);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = value.replace(/\D/g, '');
    setOtpDigits(updated);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyResetOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the verification OTP.');
      return;
    }
    if (entered !== generatedOtp) {
      setError('Incorrect OTP code. Please enter the 6-digit code displayed above.');
      return;
    }
    setError('');
    setForgotStep('new_password');
  };

  const handleResendOtp = () => {
    setIsResending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }, 600);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newAdminPassword.length < 6) {
      setError('New Admin Password must be at least 6 characters.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setError('Passwords do not match.');
      return;
    }

    localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, newAdminPassword);
    setStoredAdminPassword(newAdminPassword);
    onPasswordAudit?.('Secret Admin Panel password was reset via OTP verification.');

    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setPassword('');
    setAuthMode('login');
    setForgotStep('verify_id');
    setSuccessMsg('Admin password reset successfully! Enter your new password to unlock.');
  };

  const handleUpdateContact = () => {
    if (!adminPhone.trim()) return;
    onUpdateUser(currentUser.id, { phone: adminPhone.trim() });
    showPanelToast('Admin contact number updated and locked.');
  };

  const handleChangePasswordInsidePanel = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassInput !== storedAdminPassword) {
      showPanelToast('Current admin password is incorrect.');
      return;
    }
    if (changeNewPass.length < 6) {
      showPanelToast('New password must be at least 6 characters.');
      return;
    }
    if (changeNewPass !== changeConfirmPass) {
      showPanelToast('New passwords do not match.');
      return;
    }
    localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, changeNewPass);
    setStoredAdminPassword(changeNewPass);
    onPasswordAudit?.('Secret Admin Panel password updated by Admin.');
    setCurrentPassInput('');
    setChangeNewPass('');
    setChangeConfirmPass('');
    showPanelToast('Admin Panel password updated successfully!');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
        <div className="relative bg-slate-900 border border-emerald-500/30 rounded-3xl p-7 max-w-sm w-full shadow-2xl text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Admin Access Modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Secret Admin Access</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your Admin security password to unlock controls.
                </p>
              </div>

              {successMsg && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white/80">Admin Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setForgotStep('verify_id');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-amber-300 hover:text-amber-200 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    className="w-full bg-black/40 border border-white/15 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg"
              >
                Authenticate Access
              </button>

              <div className="pt-2 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setForgotStep('verify_id');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-300 hover:text-amber-300 transition-colors"
                >
                  Forgot Admin Password? <span className="text-amber-300 font-semibold underline">Reset via OTP</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Reset Admin Password</h2>
                <p className="text-slate-400 mt-1">
                  Verify your registered Admin account with a real-time OTP.
                </p>
              </div>

              {forgotStep === 'verify_id' && (
                <form onSubmit={handleRequestResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-white/80 font-semibold mb-1">
                      Registered Admin Email or Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="e.g. rajesh.bhardwaj@geosoniq.com"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Send Admin Reset OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {forgotStep === 'otp' && (
                <div className="space-y-4">
                  <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-indigo-100 flex items-start space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">GeoSoniq Admin Reset OTP</div>
                      <div>
                        Code:{' '}
                        <span className="font-mono font-extrabold text-amber-300 text-sm tracking-widest bg-black/50 border border-white/20 px-2 py-0.5 rounded ml-1">
                          {generatedOtp}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-1.5">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 text-center text-lg font-mono font-bold bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyResetOtp}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP & Continue</span>
                  </button>

                  <div className="flex justify-between items-center text-white/60">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('verify_id');
                        setError('');
                      }}
                      className="hover:text-white"
                    >
                      ← Change Admin ID
                    </button>
                    <button
                      type="button"
                      disabled={countdown > 0 || isResending}
                      onClick={handleResendOtp}
                      className={`flex items-center space-x-1 ${
                        countdown > 0 ? 'opacity-50 cursor-not-allowed' : 'text-amber-300 hover:text-white'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}</span>
                    </button>
                  </div>
                </div>
              )}

              {forgotStep === 'new_password' && (
                <form onSubmit={handleSaveResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-white/80 font-semibold mb-1">New Admin Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 6 characters"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-white/50 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 font-semibold mb-1">Confirm New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new admin password"
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all"
                  >
                    Save New Admin Password
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                  className="text-white/60 hover:text-white"
                >
                  ← Back to Admin Password Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <h2 className="text-lg font-bold text-emerald-300 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Secret Administration Panel</span>
        </h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 rounded-xl transition-colors"
          >
            Lock
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Secret Administration Panel"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {panelToast && (
        <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{panelToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Update Admin Password */}
          <form onSubmit={handleChangePasswordInsidePanel} className="bg-black/25 p-6 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Change Admin Security Password</span>
            </h3>
            <input
              type="password"
              required
              value={currentPassInput}
              onChange={(e) => setCurrentPassInput(e.target.value)}
              placeholder="Current Admin Password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              required
              value={changeNewPass}
              onChange={(e) => setChangeNewPass(e.target.value)}
              placeholder="New Admin Password (min 6 chars)"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              required
              value={changeConfirmPass}
              onChange={(e) => setChangeConfirmPass(e.target.value)}
              placeholder="Confirm New Admin Password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all"
            >
              Update Admin Password
            </button>
          </form>

          {/* Admin Phone Update */}
          <div className="bg-black/25 p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Update Admin Contact</span>
            </h3>
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="New Phone Number"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white mb-3 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handleUpdateContact}
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-xs font-bold text-white transition-all"
            >
              Update & Lock Number
            </button>
          </div>
        </div>

        {/* Participant Management */}
        <div className="bg-black/25 p-6 rounded-2xl border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Manage Participant Access</span>
          </h3>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt={u.name} />
                  <div>
                    <span className="text-xs font-semibold text-white block">{u.name}</span>
                    <span className="text-[10px] text-white/50">{u.role}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    title="Toggle Camera Access"
                    onClick={() => onUpdateUser(u.id, { cameraEnabled: u.cameraEnabled === false ? true : false })}
                    className={`p-2 hover:bg-white/10 rounded-lg ${u.cameraEnabled !== false ? 'text-emerald-400' : 'text-slate-500'}`}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Toggle Microphone Access"
                    onClick={() => onUpdateUser(u.id, { micEnabled: u.micEnabled === false ? true : false })}
                    className={`p-2 hover:bg-white/10 rounded-lg ${u.micEnabled !== false ? 'text-emerald-400' : 'text-slate-500'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
