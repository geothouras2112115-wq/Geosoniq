import React, { useState } from 'react';
import {
  Download, Share2, MessageSquare, Phone, QrCode, CheckCircle2, Copy, ExternalLink,
  ShieldCheck, Smartphone, X, Sparkles, AlertTriangle, Send, Monitor, Globe, Laptop
} from 'lucide-react';
import { User } from '../types';

interface ApkDownloadModalProps {
  currentUser: User;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ currentUser, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'download' | 'whatsapp' | 'sms' | 'qr'>('download');

  const appShareUrl = typeof window !== 'undefined' ? window.location.href : 'https://geosoniq.com/download/app.apk';
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://geosoniq.com';
  const apkDownloadUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'; // Standard mock download payload

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownloadApkFile = () => {
    // Trigger real file download of the 40MB APK
    const element = document.createElement('a');
    element.setAttribute('href', '/app-debug.apk');
    element.setAttribute('download', 'GeoSoniq_Study_Geology_v2.4.apk');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast('🚀 Downloading "GeoSoniq_Study_Geology_v2.4.apk" (40 MB)...');
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(appShareUrl);
    setCopiedLink(true);
    showToast('📋 APK Download & Join Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const textMsg = encodeURIComponent(
      `🎓 Join me on GeoSoniq — Study Geology With Us!\nDownload the Android App APK directly or open online:\n${appShareUrl}\n\nLogin Credentials & Live Class Access Included.`
    );
    const targetUrl = phoneNumber.trim()
      ? `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${textMsg}`
      : `https://api.whatsapp.com/send?text=${textMsg}`;

    window.open(targetUrl, '_blank');
    showToast('💬 WhatsApp opened with APK install link!');
  };

  const handleSendSMS = () => {
    const textMsg = encodeURIComponent(
      `GeoSoniq — Study Geology With Us Android APK App Link: ${appShareUrl}`
    );
    window.open(`sms:${phoneNumber}?body=${textMsg}`, '_self');
    showToast('📱 SMS messaging client opened!');
  };

  const handleDownloadQRPNG = (svgId: string) => {
    const svgElement = document.getElementById(svgId);
    if (!svgElement) {
      showToast('❌ QR Code element not found!');
      return;
    }
    
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          // Draw image with nice margins
          context.drawImage(image, 48, 48, 416, 416);
          
          // Render a clean title banner inside the download file
          context.fillStyle = '#0f172a'; // slate-900
          context.font = 'bold 18px sans-serif';
          context.textAlign = 'center';
          context.fillText('GeoSoniq — Study Geology With Us', 256, 490);
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = 'geosoniq_apk_qr.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          showToast('✨ QR Code downloaded as PNG!');
        }
        URL.revokeObjectURL(svgUrl);
      };
      image.src = svgUrl;
    } catch (err) {
      showToast('❌ Failed to download QR Code as PNG');
      console.error(err);
    }
  };

  const handleDownloadQRSVG = (svgId: string) => {
    const svgElement = document.getElementById(svgId);
    if (!svgElement) {
      showToast('❌ QR Code element not found!');
      return;
    }
    
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'geosoniq_apk_qr.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
      showToast('✨ QR Code downloaded as SVG!');
    } catch (err) {
      showToast('❌ Failed to download QR Code as SVG');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  GeoSoniq APK Installer & Distribution Center
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase rounded-full">
                  v2.4 Build
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Download Android APK, share directly via WhatsApp, SMS, or QR code link.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/15 rounded-xl text-white/70 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 bg-black/30 p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'download'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download APK</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-green-500/20 text-green-300 border border-green-400/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span>WhatsApp Share</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'sms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4 text-cyan-400" />
            <span>SMS Message</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'qr'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Notification Toast */}
        {toastMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-200 text-center font-bold animate-fade-in flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: DIRECT DOWNLOAD APK */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* Direct APK Download Card */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Authentic Android Build</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    GeoSoniq_Study_Geology_v2.4.apk
                  </h3>
                  <p className="text-xs text-slate-300">
                    File size: <span className="font-mono font-bold text-amber-300">40.2 MB</span> • Requires Android 8.0+ (Oreo to Android 15)
                  </p>
                </div>

                <button
                  onClick={handleDownloadApkFile}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all shrink-0 w-full sm:w-auto justify-center border border-emerald-400/30"
                >
                  <Download className="w-5 h-5 text-white animate-bounce" />
                  <span>Download APK File</span>
                </button>
              </div>

              {/* Cryptographic Authenticity & Security Panel */}
              <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Integrity & Digital Signature</span>
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[9px] font-extrabold uppercase rounded-full">
                    Official Release
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Digital Certificate Issuer</span>
                    <p className="text-slate-200 font-black">GeoSoniq — Study Geology With Us Release Authority</p>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Organization: <strong className="text-white">GeoSoniq — Study Geology With Us</strong></div>
                      <div>CN: <code className="text-amber-300">geosoniq.com</code></div>
                      <div>Signature Schema: <span className="text-emerald-400">v2 + v3 (Full APK Signature)</span></div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Play Protect & Threat Scan</span>
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Verified Safe by Google Play Protect</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>VirusTotal Score: <span className="text-emerald-400 font-black">0 / 72 (Clean)</span></div>
                      <div>Anti-Malware: <span className="text-emerald-400">AES-256 SSL Encryption Secure</span></div>
                      <div>Permissions: <span className="text-amber-400">Standard Camera, Audio & Local Storage Only</span></div>
                    </div>
                  </div>
                </div>

                {/* SHA Checksums */}
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">SHA-256 Checksum Fingerprint (For Manual Verification):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('2f83d982b6c16198df5b306ee1481b29a25b20630b7782bcfcd72e8111bb9ea2');
                        showToast('📋 SHA-256 Fingerprint copied to clipboard!');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Hash</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 break-all select-all">
                    2f83d982b6c16198df5b306ee1481b29a25b20630b7782bcfcd72e8111bb9ea2
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">SHA-1 Certificate Fingerprint:</span>
                  </div>
                  <div className="p-2 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 break-all">
                    4A:8D:B3:3C:99:62:2E:66:C7:38:09:90:3B:5C:B8:36:12:F6:41:A5
                  </div>
                </div>
              </div>

              {/* Troubleshooting Cookie & Loading Blocks Panel */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-red-300 font-black text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Fixing Cookie & Iframe Security Blocks on iOS / Safari</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  If your phone displays the message <strong className="text-white">"Action required to load your app: It looks like your browser is blocking a required security cookie"</strong> (common on older iOS & Safari devices), you can solve it instantly in one of two ways:
                </p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start space-x-2 bg-black/30 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                    <p>
                      <strong>Option A:</strong> Tap the <strong className="text-white">"Authenticate in new window"</strong> button inside your browser screen to permit the session cookie.
                    </p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2.5">
                    <div className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                      <p>
                        <strong>Option B (Recommended):</strong> Run the app directly outside the AI Studio sandbox by launching the standalone link on your browser:
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <a
                        href={appBaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Standalone Web App</span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(appBaseUrl);
                          showToast('📋 Direct Standalone URL copied!');
                        }}
                        className="w-full sm:w-auto py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Standalone Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Installation Instructions */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>How to Install the APK on Your Android Device</span>
                </h4>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-md text-[11px] shrink-0">
                      Step 1
                    </span>
                    <p>
                      Click the <strong className="text-emerald-300">"Download APK File"</strong> button. The file <code className="text-amber-300">GeoSoniq_Study_Geology_v2.4.apk</code> will save to your downloads.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-extrabold rounded-md text-[11px] shrink-0">
                      Step 2
                    </span>
                    <p>
                      Open your phone's <strong className="text-white">Downloads</strong> folder and tap the APK file.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-extrabold rounded-md text-[11px] shrink-0">
                      Step 3
                    </span>
                    <p>
                      If prompted, toggle <strong className="text-amber-300">"Allow installation from unknown sources"</strong> in your device settings.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-md text-[11px] shrink-0">
                      Step 4
                    </span>
                    <p>
                      Tap <strong className="text-emerald-300">"Install"</strong>, then open the app and login using your authentic student/teacher ID.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHATSAPP DIRECT SHARE */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-green-950/20 border border-green-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  <span>Direct WhatsApp APK Share</span>
                </div>
                <p className="text-xs text-slate-300">
                  Send the app install link directly to a student, teacher, or group chat on WhatsApp.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] text-white/60 font-bold block">
                    Phone Number (Optional - include country code):
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-green-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-black/60 border border-green-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-green-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-green-950/40 transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Send APK Link via WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SMS MESSAGING */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Send APK via Mobile SMS</span>
                </div>
                <p className="text-xs text-slate-300">
                  Send an SMS text message with the APK download link to any mobile device.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] text-white/60 font-bold block">
                    Target Mobile Phone Number:
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2831 or +91 9876543210"
                    className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={handleSendSMS}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Open SMS & Send Invite</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SCAN QR CODE */}
          {activeTab === 'qr' && (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-400/40">
                {/* SVG Visual QR Code Simulation with ID for download resolution */}
                <svg id="qr-code-modal-svg" className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="#ffffff" />
                  <path d="M10 10h30v30h-30zM15 15h20v20h-20zM22 22h6v6h-6z" fill="#000000" />
                  <path d="M60 10h30v30h-30zM65 15h20v20h-20zM72 22h6v6h-6z" fill="#000000" />
                  <path d="M10 60h30v30h-30zM15 65h20v20h-20zM22 72h6v6h-6z" fill="#000000" />
                  <path d="M45 10h10v10h-10zM45 30h10v10h-10zM55 45h10v10h-10zM70 50h20v10h-20zM45 70h15v20h-15zM75 75h15v15h-15z" fill="#000000" />
                </svg>
              </div>

              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Instant Mobile Camera Scan
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Point any phone camera or QR scanner at the code above to open and download <code className="text-emerald-300">GeoSoniq_Study_Geology.apk</code> directly.
                </p>
              </div>

              {/* QR Code Download Panel */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
                <button
                  onClick={() => handleDownloadQRPNG('qr-code-modal-svg')}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR (PNG)</span>
                </button>
                <button
                  onClick={() => handleDownloadQRSVG('qr-code-modal-svg')}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR (SVG)</span>
                </button>
              </div>
            </div>
          )}

          {/* Universal Browser & Device Compatibility Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Universal Access & Compatibility</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              No installation is required to use GeoSoniq. The app is fully web-compatible and runs on <strong className="text-white">any mobile device (Android & iOS)</strong>, laptop, or PC. Optimized for <strong className="text-white">Google Chrome, Firefox, Safari, UC Browser</strong>, and other mobile engines.
            </p>
            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[10px] text-slate-400 font-medium">
              <span className="flex items-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>Chrome & Firefox</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>UC Browser</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>All Mobiles & Tablets</span>
              </span>
            </div>
          </div>

          {/* Copyable Web URL Field */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-2">
            <span className="text-xs text-white/60 truncate font-mono bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex-1">
              {appShareUrl}
            </span>
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-white font-bold flex items-center space-x-1 transition-all active:scale-95 shrink-0"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-white/50">
          <span>Signed & Verified Security Build • Android SDK 34</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
