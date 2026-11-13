import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Smartphone, Mail, X, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Sparkles, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types';
import { PRESET_USERS } from '../mockData';
import { GeoSoniqLogo } from './GeoSoniqLogo';
import { saveUserRoleToFirestore } from '../services/firebase';

interface OTPAuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'forgot_password';
  users: User[];
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onUpdateUserPassword: (identifier: string, newPassword: string) => void;
}

export const OTPAuthModal: React.FC<OTPAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  users,
  onClose,
  onLoginSuccess,
  onUpdateUserPassword,
}) => {
  // Mode: 'login' | 'forgot_password'
  const [mode, setMode] = useState<'login' | 'forgot_password'>(initialMode);
  
  // Login State
  const [loginId, setLoginId] = useState('rajesh.bhardwaj@geosoniq.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedPresetUser, setSelectedPresetUser] = useState<User>(PRESET_USERS[0]);

  // OTP Verification Step
  const [step, setStep] = useState<'credentials' | 'otp_verify' | 'new_password'>('credentials');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('849201');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Password Reset State
  const [resetId, setResetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('credentials');
      setErrorMessage('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'otp_verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const availableUsers = users.length > 0 ? users : PRESET_USERS;

  const findUserByIdentifier = (identifier: string) => {
    const normalized = identifier.trim().toLowerCase();
    return availableUsers.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        u.phone.replace(/\s+/g, '') === normalized.replace(/\s+/g, '')
    );
  };

  const handlePresetSelect = (user: User) => {
    const liveUser = availableUsers.find((u) => u.id === user.id) || user;
    setSelectedPresetUser(liveUser);
    setSelectedRole(liveUser.role);
    setLoginId(liveUser.email);
    setPassword(liveUser.password || 'password123');
    setErrorMessage('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMsg('');

    if (!loginId.trim()) {
      setErrorMessage('Please enter your Login ID, Email, or Phone Number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    const matchedUser = findUserByIdentifier(loginId);
    if (matchedUser) {
      const expectedPassword = matchedUser.password || 'password123';
      if (password !== expectedPassword) {
        setErrorMessage('Incorrect password. Please try again or click "Forgot Password?" to reset it.');
        return;
      }
    }

    // Trigger Real-Time OTP Verification step
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockCode);
    setStep('otp_verify');
    setCountdown(60);
    setOtpDigits(['', '', '', '', '', '']);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMsg('');

    if (!resetId.trim()) {
      setErrorMessage('Please enter your registered Login ID, Email or Phone.');
      return;
    }

    const matchedUser = findUserByIdentifier(resetId);
    if (!matchedUser) {
      setErrorMessage('No registered account found for that Login ID, Email, or Phone.');
      return;
    }

    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockCode);
    setStep('otp_verify');
    setCountdown(60);
    setOtpDigits(['', '', '', '', '', '']);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, i) => {
        if (i < 6) newDigits[i] = c;
      });
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the real-time OTP.');
      return;
    }
    if (enteredCode !== generatedOtp) {
      setErrorMessage('Invalid 6-digit OTP code. Please check the verification code shown above.');
      return;
    }

    if (mode === 'forgot_password') {
      // Proceed to set new password step
      setStep('new_password');
      setErrorMessage('');
      return;
    }

    // Login verification success
    const matchedUser = findUserByIdentifier(loginId) || {
      ...selectedPresetUser,
      id: `usr_${Date.now()}`,
      email: loginId.includes('@') ? loginId : `${loginId}@geosoniq.com`,
      role: selectedRole,
      password,
    };

    const loggedInUser: User = {
      ...matchedUser,
      role: selectedRole,
      isLoggedIn: true,
    };

    saveUserRoleToFirestore(loggedInUser.id, loggedInUser);
    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const targetUser = findUserByIdentifier(resetId);
    onUpdateUserPassword(resetId, newPassword);

    if (targetUser) {
      setLoginId(targetUser.email);
      setSelectedRole(targetUser.role);
    }

    setSuccessMsg('Password reset successfully! You can now sign in with your new credentials.');
    setMode('login');
    setStep('credentials');
    setPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
  };

  const handleResendOTP = () => {
    setIsResending(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white backdrop-blur-2xl">
        
        {/* Header Branding */}
        <div className="bg-white/10 p-6 border-b border-white/15 backdrop-blur-md">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <GeoSoniqLogo size={50} showText={false} />
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                <span>Geo</span>
                <span className="text-amber-400">Soniq</span>
              </h2>
              <p className="text-[11px] text-sky-300 font-semibold tracking-wider uppercase">
                STUDY GEOLOGY WITH US
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Preset User Persona Switcher */}
          <div className="bg-black/30 border border-white/15 p-3 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/80 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Select Quick Demo Account:</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {availableUsers.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handlePresetSelect(user)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                    selectedPresetUser.id === user.id
                      ? 'bg-amber-500/20 border-amber-400/50 text-white shadow-lg'
                      : 'bg-black/20 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30 mb-1" />
                  <span className="text-[11px] font-bold truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                  <span className={`text-[9px] font-bold capitalize px-1 rounded ${
                    user.role === 'admin' ? 'text-amber-300 bg-amber-400/20' : user.role === 'teacher' ? 'text-purple-300 bg-purple-400/20' : 'text-cyan-300 bg-cyan-400/20'
                  }`}>{user.role}</span>
                </button>
              ))}
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode Tabs: Login vs Forgot Password */}
          {step === 'credentials' && (
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sign In (ID & Password + OTP)
              </button>
              <button
                type="button"
                onClick={() => { setMode('forgot_password'); setErrorMessage(''); }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  mode === 'forgot_password'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Forgot Password Reset
              </button>
            </div>
          )}

          {/* MODE 1: Login ID & Password */}
          {step === 'credentials' && mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {/* Role Picker */}
              <div>
                <label className="block text-white/80 font-bold mb-1">User Role Access</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-2 rounded-xl border font-bold capitalize transition-all ${
                        selectedRole === r
                          ? r === 'admin' ? 'bg-amber-500/30 text-amber-300 border-amber-400' : r === 'teacher' ? 'bg-purple-500/30 text-purple-300 border-purple-400' : 'bg-cyan-500/30 text-cyan-300 border-cyan-400'
                          : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">Login ID / Email / Phone</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. rajesh.bhardwaj@geosoniq.com"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-white/80 font-bold">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setStep('credentials');
                      setResetId(loginId);
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-amber-300 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setStep('credentials');
                      setResetId(loginId);
                      setErrorMessage('');
                    }}
                    className="text-amber-300 underline font-bold shrink-0"
                  >
                    Reset
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Continue & Request Real-Time OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* MODE 2: Forgot Password Request OTP */}
          {step === 'credentials' && mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
              <p className="text-white/70 text-xs">
                Enter your registered GeoSoniq Login ID, Email, or Phone Number to receive a real-time OTP reset code.
              </p>

              <div>
                <label className="block text-white/80 font-bold mb-1">Registered ID / Email / Phone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rajesh.bhardwaj@geosoniq.com"
                  value={resetId}
                  onChange={(e) => setResetId(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Send Real-Time Reset OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Real-Time OTP Verification */}
          {step === 'otp_verify' && (
            <div className="space-y-5 text-xs">
              <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-indigo-100 flex items-start space-x-2">
                <KeyRound className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-white">GeoSoniq Real-Time OTP Code</div>
                  <div>Your 6-digit verification code is: <span className="font-mono font-extrabold text-amber-300 text-sm tracking-widest bg-black/50 border border-white/20 px-2 py-0.5 rounded ml-1">{generatedOtp}</span></div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-white/70">
                  Enter the 6-digit verification code sent to your registered account.
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-between items-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 text-center text-xl font-mono font-bold bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOTP}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{mode === 'forgot_password' ? 'Verify OTP & Reset Password' : 'Verify & Sign In'}</span>
              </button>

              <div className="flex items-center justify-between text-white/60 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || isResending}
                  onClick={handleResendOTP}
                  className={`flex items-center space-x-1 ${
                    countdown > 0 ? 'opacity-50 cursor-not-allowed' : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Create New Password (For Forgot Password Reset Flow) */}
          {step === 'new_password' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4 text-xs">
              <p className="text-white/80 font-semibold">
                OTP Verified! Please set your new account password below.
              </p>

              <div>
                <label className="block text-white/80 font-bold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-white/80 font-bold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg"
              >
                Save New Password & Sign In
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
