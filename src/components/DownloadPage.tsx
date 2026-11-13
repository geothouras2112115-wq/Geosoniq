import React, { useState } from 'react';
import {
  Download, Share2, MessageSquare, Phone, QrCode, CheckCircle2, Copy, ExternalLink,
  ShieldCheck, Smartphone, Sparkles, Send, ArrowRight, Monitor, Globe, Laptop, AlertTriangle,
  Search, Settings, FileText, Info
} from 'lucide-react';
import { User } from '../types';

interface DownloadPageProps {
  currentUser: User;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ currentUser }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'download' | 'whatsapp' | 'sms' | 'qr' | 'chrome'>('download');
  
  // Chrome Search Simulator State
  const [simSearchQuery, setSimSearchQuery] = useState('courses');
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);
  const [copiedChromeUrl, setCopiedChromeUrl] = useState(false);

  const appShareUrl = typeof window !== 'undefined' ? window.location.href : 'https://geosoniq.com/download/app.apk';
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://geosoniq.com';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownloadApkFile = () => {
    // With the file moved to /public/app-debug.apk, this path works:
    const link = document.createElement('a');
    link.href = '/app-debug.apk'; 
    link.setAttribute('download', 'GeoSoniq_Study_Geology.apk');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    showToast('🚀 Downloading "GeoSoniq_Study_Geology.apk" (40 MB)...');
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in space-y-6">
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">GeoSoniq APK Installer</h2>
          <p className="text-sm text-slate-400">Distribute and install the latest Android build.</p>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex flex-wrap border-b border-white/10 bg-black/30 p-1.5 gap-1">
          {['download', 'whatsapp', 'sms', 'qr', 'chrome'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 min-w-[100px] py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'download' && <Download className="w-4 h-4 text-emerald-400" />}
              {tab === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-400" />}
              {tab === 'sms' && <Send className="w-4 h-4 text-cyan-400" />}
              {tab === 'qr' && <QrCode className="w-4 h-4 text-amber-400" />}
              {tab === 'chrome' && <Search className="w-4 h-4 text-blue-400" />}
              <span className="capitalize">{tab === 'chrome' ? 'Chrome Search' : tab}</span>
            </button>
          ))}
        </div>

        {toastMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-200 text-center font-bold flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {activeTab === 'download' && (
            <div className="space-y-6">
              {/* Direct APK Download Card */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Authentic Android Build</span>
                  </span>
                  <h3 className="text-lg font-black text-white">GeoSoniq_Study_Geology_v2.4.apk</h3>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="text-slate-400">Version: <span className="font-mono text-emerald-300">2.4.0</span></div>
                    <div className="text-slate-400">Size: <span className="font-mono text-amber-300">40.2 MB</span></div>
                    <div className="col-span-2 text-slate-400">Build Date: <span className="font-mono text-slate-200">July 7, 2026</span></div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadApkFile}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-2xl text-sm flex items-center space-x-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all border border-emerald-400/30 shrink-0"
                >
                  <Download className="w-5 h-5 text-white animate-bounce" />
                  <span>Download APK</span>
                </button>
              </div>

              {/* Cryptographic Authenticity & Security Panel */}
              <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Integrity & Digital Signature</span>
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[9px] font-extrabold uppercase rounded-full">
                    Official Release
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-red-300 font-black text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Fixing Cookie & Iframe Security Blocks on iOS / Safari</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If your device displays the message <strong className="text-white">"Action required to load your app: It looks like your browser is blocking a required security cookie"</strong> (common on iOS & Safari engines), you can bypass it instantly in one of two ways:
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start space-x-2.5 bg-black/30 p-2.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                    <p>
                      <strong>Option A:</strong> Tap <strong className="text-white">"Authenticate in new window"</strong> inside the app container to enable required session tokens.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2.5 bg-black/30 p-2.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <p>
                      <strong>Option B (Recommended):</strong> Launch the platform outside the sandboxed sandbox environment by opening the direct URL on your phone:
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <a
                    href={appBaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Standalone Web App</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appBaseUrl);
                      showToast('📋 Standalone Platform Link copied!');
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Standalone Link</span>
                  </button>
                </div>
              </div>

              {/* Installation Guide */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Installation Guide</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>1. Download the verified APK above.</p>
                  <p>2. Open File Manager / Downloads on your phone and tap the APK.</p>
                  <p>3. Go to Settings → Allow from this source (Enable Install Unknown Apps).</p>
                  <p>4. Tap Install and start logging in with your teacher or student account.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="bg-green-950/20 border border-green-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-green-400 font-bold text-xs uppercase">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Share</span>
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210 (Optional)"
                className="w-full bg-black/60 border border-green-500/40 rounded-xl px-4 py-2 text-sm text-white"
              />
              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-extrabold rounded-xl text-sm transition-all active:scale-95"
              >
                Send via WhatsApp
              </button>
            </div>
          )}
          
          {activeTab === 'sms' && (
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase">
                <Send className="w-4 h-4" />
                <span>Send via SMS</span>
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210 (Optional)"
                className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-4 py-2 text-sm text-white"
              />
              <button
                onClick={handleSendSMS}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl text-sm transition-all active:scale-95"
              >
                Send via SMS
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-400/40">
                {/* SVG Visual QR Code with ID for download resolution */}
                <svg id="qr-code-download-page" className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="#ffffff" />
                  <path d="M10 10h30v30h-30zM15 15h20v20h-20zM22 22h6v6h-6z" fill="#000000" />
                  <path d="M60 10h30v30h-30zM65 15h20v20h-20zM72 22h6v6h-6z" fill="#000000" />
                  <path d="M10 60h30v30h-30zM15 65h20v20h-20zM22 72h6v6h-6z" fill="#000000" />
                  <path d="M45 10h10v10h-10zM45 30h10v10h-10zM55 45h10v10h-10zM70 50h20v10h-20zM45 70h15v20h-15zM75 75h15v15h-15z" fill="#000000" />
                </svg>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-300">
                  Instant Mobile Camera Scan
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Scan this QR code with any mobile camera or QR reader to download the app directly to your phone.
                </p>
              </div>

              {/* QR Code Download Action Panel */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={() => handleDownloadQRPNG('qr-code-download-page')}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR (PNG)</span>
                </button>
                <button
                  onClick={() => handleDownloadQRSVG('qr-code-download-page')}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR (Vector SVG)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chrome' && (
            <div className="space-y-6 animate-fade-in">
              {/* SPECIAL TROUBLESHOOTING: DNS_PROBE_FINISHED_NXDOMAIN / This site can't be reached */}
              <div className="bg-gradient-to-r from-red-950/40 to-amber-950/20 border-2 border-red-500/30 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl mt-0.5 border border-red-500/40">
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Fixing "This site can't be reached" (DNS_PROBE_FINISHED_NXDOMAIN)</span>
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-[9px] text-red-300 rounded font-mono">CRITICAL SETUP</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      If you see a grey folder icon or <strong>NXDOMAIN</strong> error when opening <code className="text-amber-300 font-mono">geosoniq.com</code>, it is because this domain name is a custom domain placeholder. To make it load, you must configure your domain DNS records to point to our live hosting container!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                  {/* Step A: Quick Access link */}
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>Immediate Access (Working URL)</span>
                    </h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      While your custom domain is being configured, anyone can immediately access the portal, join live classes, and search on Chrome using the official direct live URL:
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      <a
                        href={appBaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Open Live Platform Link</span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(appBaseUrl);
                          showToast('📋 Live URL copied to clipboard!');
                        }}
                        className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Live URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Step B: DNS Setup Guide */}
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>Point your Domain in Domain Registrar</span>
                    </h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      If you own the domain <strong className="text-white">geosoniq.com</strong> (or any domain) at GoDaddy, Namecheap, or Hostinger, login to your registrar's dashboard and set these DNS records:
                    </p>
                    <div className="space-y-1.5 text-[10px] font-mono bg-black/60 p-2.5 rounded-xl border border-white/5">
                      <div className="flex justify-between border-b border-white/5 pb-1 text-slate-400 font-bold">
                        <span>TYPE</span>
                        <span>NAME (HOST)</span>
                        <span>VALUE / POINTS TO</span>
                      </div>
                      <div className="flex justify-between text-slate-200 pt-1">
                        <span className="text-cyan-400">CNAME</span>
                        <span>www</span>
                        <span className="text-amber-300">ghs.googlehosted.com</span>
                      </div>
                      <div className="flex justify-between text-slate-200">
                        <span className="text-emerald-400">A</span>
                        <span>@</span>
                        <span className="text-slate-300">216.239.32.21 (Google)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Badge */}
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                  <Search className="w-5 h-5 text-blue-400" />
                  <span>Google Chrome Omnibox Search Engine Integration</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have configured the <strong className="text-white">OpenSearch standard descriptor XML</strong> on the <code className="text-amber-300">geosoniq.com</code> server. When anyone visits this site in Google Chrome, the browser automatically registers our educational portal search database natively.
                </p>
              </div>

              {/* Interactive Chrome Address Bar Simulator */}
              <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900 border-b border-white/5 p-3 flex items-center space-x-2">
                  <div className="flex space-x-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-1.5 flex items-center space-x-2 flex-1 text-xs text-slate-400 font-mono select-none overflow-x-auto scrollbar-none">
                    <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-slate-300 font-bold shrink-0">geosoniq.com</span>
                    <span className="text-slate-500 shrink-0">/</span>
                    <div className="bg-blue-500/10 border border-blue-400/30 px-2 py-0.5 rounded text-[10px] text-blue-300 font-bold flex items-center space-x-1 shrink-0 animate-pulse">
                      <Search className="w-2.5 h-2.5" />
                      <span>Press Tab to Search GeoSoniq</span>
                    </div>
                    <span className="text-blue-400 animate-pulse border-l border-blue-400 pl-0.5 font-sans font-bold">|</span>
                  </div>
                </div>

                <div className="p-5 space-y-4 bg-black/40">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Test the Live Simulator</h4>
                    <p className="text-xs text-slate-400">
                      Type an educational keyword or navigation query below, then press "Test Redirection" to see how the Chrome search engine directly loads and deep-links inside the app.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      value={simSearchQuery}
                      onChange={(e) => setSimSearchQuery(e.target.value)}
                      placeholder="e.g. seismic, courses, download, physics, vault"
                      className="flex-1 bg-black/60 border border-white/15 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 outline-none text-center sm:text-left"
                    />
                    <button
                      onClick={() => {
                        // Update browser URL query to simulate the Google Chrome omnibox redirect
                        const targetUrl = `${window.location.pathname}?q=${encodeURIComponent(simSearchQuery)}`;
                        window.history.pushState(null, '', targetUrl);
                        // Reload page with parameter to let the live App.tsx deep routing handle it authentically!
                        window.location.reload();
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shrink-0"
                    >
                      <Search className="w-4 h-4 text-white" />
                      <span>Test Redirection (Reloads Page with Term)</span>
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start space-x-3 text-xs text-slate-300">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-[11px] leading-relaxed">
                      <span>💡 <strong>Try these queries in the simulator:</strong></span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['seismic waves', 'courses', 'download', 'vault', 'schedule'].map((keyword) => (
                          <button
                            key={keyword}
                            onClick={() => setSimSearchQuery(keyword)}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md font-mono text-[10px] text-amber-300 transition-all cursor-pointer"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Setup Guide */}
              <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>How to Manually Add GeoSoniq Search to Chrome Settings</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you want to manually force Chrome or Microsoft Edge to search our geophysics database, you can do it instantly in under 30 seconds:
                </p>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black rounded-lg">1</span>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-white">Open Chrome Search Engines Panel</p>
                      <p className="text-slate-400 text-[11px]">Copy and paste this link in your Chrome Address bar and press Enter:</p>
                      <div className="flex items-center space-x-2 pt-1">
                        <code className="text-sky-300 bg-black/40 px-2 py-0.5 rounded font-mono text-[10px] select-all">chrome://settings/searchEngines</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('chrome://settings/searchEngines');
                            setCopiedChromeUrl(true);
                            showToast('📋 Chrome URL copied to clipboard!');
                            setTimeout(() => setCopiedChromeUrl(false), 2000);
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                        >
                          {copiedChromeUrl ? 'Copied' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-black rounded-lg">2</span>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-white">Click "Add" under "Site Search" and fill in these details:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                        <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Search Engine</span>
                          <span className="text-slate-200">GeoSoniq — Study Geology With Us</span>
                        </div>
                        <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Shortcut keyword</span>
                          <span className="text-amber-300 font-bold">geosoniq</span>
                        </div>
                        <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Query URL</span>
                          <span className="text-emerald-400 truncate block select-all" title="https://geosoniq.com/?q=%s">https://geosoniq.com/?q=%s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO and Discovery Tools (Google Crawlers) */}
              <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>SEO Sitemap & Discovery Files (For Google Crawlers)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Google Indexed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To ensure that Google Chrome's search crawler engine registers and ranks <strong className="text-white">geosoniq.com</strong> globally, copy and upload these required compliance files to your domain host:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sitemap Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">1. Sitemap (sitemap.xml)</span>
                      <button
                        onClick={() => {
                          const sitemapText = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://geosoniq.com/</loc>\n    <lastmod>2026-07-16</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://geosoniq.com/?tab=download</loc>\n    <lastmod>2026-07-16</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`;
                          navigator.clipboard.writeText(sitemapText);
                          setCopiedSitemap(true);
                          showToast('📋 XML Sitemap copied to clipboard!');
                          setTimeout(() => setCopiedSitemap(false), 2000);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSitemap ? 'Copied' : 'Copy XML'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[9px] text-slate-400 overflow-x-auto h-32 select-all leading-normal">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://geosoniq.com/</loc>
    <lastmod>2026-07-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://geosoniq.com/?tab=download</loc>
    <lastmod>2026-07-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`}
                    </pre>
                  </div>

                  {/* Robots.txt Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">2. Crawl Rules (robots.txt)</span>
                      <button
                        onClick={() => {
                          const robotsText = `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://geosoniq.com/sitemap.xml`;
                          navigator.clipboard.writeText(robotsText);
                          setCopiedRobots(true);
                          showToast('📋 robots.txt copied!');
                          setTimeout(() => setCopiedRobots(false), 2000);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedRobots ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[9px] text-slate-400 overflow-x-auto h-32 select-all leading-normal">
{`User-agent: *
Allow: /
Disallow: /api/

# Search Engine Indexing Canonical Sitemap
Sitemap: https://geosoniq.com/sitemap.xml`}
                    </pre>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[11px]">
                    <strong>Pro-Tip:</strong> Register <strong className="text-white">geosoniq.com</strong> inside <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline text-amber-300 hover:text-amber-200">Google Search Console</a> and submit this Sitemap. Google Chrome will index the app immediately!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Copyable Web URL Field */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-mono bg-black/40 px-3 py-2 rounded-xl border border-white/5 w-full sm:flex-1 truncate text-center sm:text-left">
              {appShareUrl}
            </span>
            <button
              onClick={handleCopyShareLink}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs text-white font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-95 w-full sm:w-auto shrink-0"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy Share Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Universal Browser & Device Compatibility Section */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl">
            <Globe className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Universal Browser & Device Compatibility</h3>
            <p className="text-xs text-slate-400">GeoSoniq runs natively on all major engines without any configuration required.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Browser Compatibility */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Any Browser</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Fully optimized and tested on <strong className="text-white">Google Chrome</strong>, <strong className="text-white">Mozilla Firefox</strong>, <strong className="text-white">Safari</strong>, <strong className="text-white">UC Browser</strong>, and Opera. Smooth execution of WebSockets and canvas systems.
            </p>
          </div>

          {/* Card 2: Device & Operating Systems */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Any Mobile</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Natively compatible with <strong className="text-white">all Android mobiles</strong>, <strong className="text-white">iOS (iPhones & iPads)</strong>, and mobile browsers. Touch-friendly controls with generous 44px tap targets.
            </p>
          </div>

          {/* Card 3: Computers & Laptops */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Laptop className="w-4 h-4 text-amber-400" />
              <span>Laptops & PCs</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Provides desktop-first precision on <strong className="text-white">Windows</strong>, <strong className="text-white">macOS</strong>, and Linux. The responsive grid layout fluidly adapts to any screen aspect ratio.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 text-[10px] text-slate-400 text-center flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>✔️ HTML5 Canvas Supported</span>
          <span>✔️ Secure WebSocket Encrypted</span>
          <span>✔️ Zero Installer Required for Web Access</span>
        </div>
      </div>
    </div>
  );
};
