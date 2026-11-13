import React, { useEffect, useRef, useState } from 'react';
import { Participant, ReactionParticle, User, GeminiSearchResult } from '../../types';
import { MicOff, Hand, Radio, Monitor, Sparkles, UserX, Volume2, ShieldCheck, Box, X, ExternalLink, Cpu } from 'lucide-react';

interface VideoGridProps {
  participants: Participant[];
  currentUser: User;
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  activeReactions: ReactionParticle[];
  layoutMode: 'grid' | 'spotlight';
  projectedGeminiModel?: GeminiSearchResult | null;
  onClearProjectedModel?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  currentUser,
  localStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  activeReactions,
  layoutMode,
  projectedGeminiModel,
  onClearProjectedModel,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const geminiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationY, setRotationY] = useState(0);

  // Rotate Gemini projected 3D model
  useEffect(() => {
    if (!projectedGeminiModel) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 1.5) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [projectedGeminiModel]);

  // Render 3D Canvas for Projected Model
  useEffect(() => {
    if (!projectedGeminiModel || !geminiCanvasRef.current) return;
    const canvas = geminiCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const radY = (rotationY * Math.PI) / 180;
    const radX = (20 * Math.PI) / 180;
    const size = 65;

    let vertices = [
      { x: -size, y: -size, z: -size }, { x: size, y: -size, z: -size },
      { x: size, y: size, z: -size }, { x: -size, y: size, z: -size },
      { x: -size, y: -size, z: size }, { x: size, y: -size, z: size },
      { x: size, y: size, z: size }, { x: -size, y: size, z: size }
    ];

    const transformed = vertices.map((v) => {
      const x1 = v.x * Math.cos(radY) + v.z * Math.sin(radY);
      const z1 = -v.x * Math.sin(radY) + v.z * Math.cos(radY);
      const y2 = v.y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = v.y * Math.sin(radX) + z1 * Math.cos(radX);
      const scale = 300 / (300 + z2 + 80);
      return { px: cx + x1 * scale, py: cy + y2 * scale, scale };
    });

    const edges = [
      [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]
    ];

    ctx.strokeStyle = projectedGeminiModel.color || '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = projectedGeminiModel.color || '#00e5ff';

    edges.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(transformed[i].px, transformed[i].py);
      ctx.lineTo(transformed[j].px, transformed[j].py);
      ctx.stroke();
    });

    transformed.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.px, pt.py, 4.5 * pt.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

  }, [projectedGeminiModel, rotationY]);

  // Attach local media stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Merge local participant into overall list
  const localParticipant: Participant = {
    id: currentUser.id,
    name: `${currentUser.name} (You)`,
    role: currentUser.role,
    avatar: currentUser.avatar,
    isLocal: true,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised: false,
    isSpeaking: !isMuted,
    connectionQuality: 'excellent',
  };

  const allParticipants = [localParticipant, ...participants];

  return (
    <div className="relative w-full h-full bg-white/5 backdrop-blur-lg rounded-3xl p-3 sm:p-4 overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-center">
      
      {/* Floating Animated Reaction Particles Container */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {activeReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-10 animate-float-up text-3xl drop-shadow-lg flex items-center space-x-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-xs"
            style={{ left: `${r.x}%` }}
          >
            <span>{r.emoji}</span>
            <span className="font-medium text-[11px] text-white/80">{r.senderName}</span>
          </div>
        ))}
      </div>

      {/* Screen Sharing or Gemini Projected Model Presentation Stage Mode */}
      {(isScreenSharing || projectedGeminiModel) ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
          {/* Main Presentation Stage */}
          <div className="flex-2 bg-black/50 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden relative flex flex-col justify-between p-4 sm:p-6 shadow-2xl">
            
            {/* Top Stage Indicator */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-cyan-200 text-xs font-bold backdrop-blur-md">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>
                  {projectedGeminiModel
                    ? `Gemini AI 3D Model Projected: "${projectedGeminiModel.query}"`
                    : `${currentUser.name} is sharing screen`}
                </span>
              </div>

              {projectedGeminiModel && onClearProjectedModel && (
                <button
                  onClick={onClearProjectedModel}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/40 text-rose-300 text-xs font-bold rounded-xl transition-all"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  <span>Dismiss Projection</span>
                </button>
              )}
            </div>

            {/* Display Projected Gemini Model OR Default Slide Content */}
            {projectedGeminiModel ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2 items-center">
                
                {/* 3D Visualizer Canvas */}
                <div className="md:col-span-5 bg-black/60 border border-cyan-500/40 rounded-2xl p-3 flex flex-col items-center justify-center relative shadow-inner">
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    3D Interactive Lattice
                  </span>
                  <canvas ref={geminiCanvasRef} width={280} height={200} className="max-w-full" />
                  <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-amber-300 mt-1">
                    <span>Formula: {projectedGeminiModel.formula}</span>
                  </div>
                </div>

                {/* Gemini Explanation & Physical Specs */}
                <div className="md:col-span-7 space-y-2 text-left">
                  <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Gemini AI Screen Analysis</span>
                  </div>

                  <p className="text-xs text-slate-200 bg-black/40 p-3 rounded-xl border border-white/10 leading-relaxed max-h-36 overflow-y-auto">
                    {projectedGeminiModel.explanation}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                      <span className="text-white/50 block text-[9px]">Hardness</span>
                      <span className="font-bold text-cyan-300">{projectedGeminiModel.hardness}</span>
                    </div>
                    <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                      <span className="text-white/50 block text-[9px]">Density</span>
                      <span className="font-bold text-emerald-300">{projectedGeminiModel.density}</span>
                    </div>
                    <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                      <span className="text-white/50 block text-[9px]">System</span>
                      <span className="font-bold text-indigo-300 truncate block">{projectedGeminiModel.crystalSystem}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Simulated Default Slide Content */
              <div className="w-full max-w-2xl mx-auto bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl text-left space-y-4 my-auto">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    CS-4820 Live Presentation
                  </span>
                  <span className="text-xs text-white/60">Slide 4 of 12</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Self-Attention Matrix: Q × Kᵀ / √d_k
                </h3>
                <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-indigo-300 border border-white/10 overflow-x-auto">
                  <pre>{`import torch
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, heads):
        super().__init__()
        self.q_linear = nn.Linear(d_model, d_model)
        self.k_linear = nn.Linear(d_model, d_model)
        self.v_linear = nn.Linear(d_model, d_model)`}</pre>
                </div>
                <p className="text-xs text-white/70">
                  Scaling by √d_k prevents softmax gradients from diminishing when dimension sizes grow large.
                </p>
              </div>
            )}

            <div className="text-[11px] text-white/40 pt-2 border-t border-white/10 text-right">
              GeoSoniq — Study Geology With Us Live Classroom Stream • 1080p 60FPS
            </div>

          </div>

          {/* Side Participant Rail */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-2 overflow-y-auto max-h-[400px] lg:max-h-none">
            {allParticipants.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                localVideoRef={p.isLocal ? localVideoRef : undefined}
                localStream={p.isLocal ? localStream : null}
                compact
              />
            ))}
          </div>
        </div>
      ) : (
        /* Regular Responsive Video Grid Layout */
        <div
          className={`grid gap-3 w-full h-full auto-rows-fr ${
            allParticipants.length <= 1
              ? 'grid-cols-1'
              : allParticipants.length <= 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : allParticipants.length <= 4
              ? 'grid-cols-2'
              : 'grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {allParticipants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              localVideoRef={p.isLocal ? localVideoRef : undefined}
              localStream={p.isLocal ? localStream : null}
            />
          ))}
        </div>
      )}

    </div>
  );
};

interface ParticipantCardProps {
  participant: Participant;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  localStream?: MediaStream | null;
  compact?: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  localVideoRef,
  localStream,
  compact,
}) => {
  const isLocalCameraActive = participant.isLocal && !participant.isVideoOff && localStream;

  return (
    <div
      className={`relative rounded-2xl bg-black/40 backdrop-blur-md border overflow-hidden flex flex-col items-center justify-center transition-all shadow-xl ${
        participant.isSpeaking
          ? 'border-emerald-400/80 ring-2 ring-emerald-400/30'
          : 'border-white/10'
      } ${compact ? 'min-h-[120px]' : 'min-h-[180px] sm:min-h-[220px]'}`}
    >
      
      {/* Hand Raised Banner */}
      {participant.isHandRaised && (
        <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full font-bold text-xs shadow-md animate-bounce">
          <Hand className="w-3.5 h-3.5" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Role Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
            participant.role === 'teacher'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
          }`}
        >
          {participant.role === 'teacher' ? 'Instructor' : 'Student'}
        </span>
      </div>

      {/* Video Content / Local Camera Stream / Avatar Fallback */}
      {participant.isLocal ? (
        isLocalCameraActive ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative mb-3">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-xl"
              />
              {participant.isSpeaking && (
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75"></span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">Camera Disabled</p>
          </div>
        )
      ) : (
        /* Remote Participant Simulated Feed */
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative mb-3">
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-slate-800 shadow-xl"
            />
            {participant.isSpeaking && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75"></span>
            )}
          </div>
        </div>
      )}

      {/* Footer Name Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-slate-100 truncate">{participant.name}</span>
          {participant.isSpeaking && (
            <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
              <Volume2 className="w-3 h-3 animate-pulse" />
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {participant.isMuted ? (
            <span className="p-1 bg-rose-500/20 text-rose-400 rounded-md">
              <MicOff className="w-3 h-3" />
            </span>
          ) : (
            <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md">
              <Radio className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
