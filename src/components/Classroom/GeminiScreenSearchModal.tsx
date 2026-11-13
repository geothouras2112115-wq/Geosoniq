import React, { useState, useEffect, useRef } from 'react';
import { GeminiSearchResult, User, VaultFile } from '../../types';
import { searchGeminiAI } from '../../services/geminiSearchService';
import {
  Sparkles, Search, Monitor, Save, ExternalLink, RefreshCw, X, RotateCw, Box,
  Layers, CheckCircle2, Globe, Flame, ShieldCheck, Cpu
} from 'lucide-react';

interface GeminiScreenSearchModalProps {
  currentUser: User;
  onClose: () => void;
  onProjectToScreen: (result: GeminiSearchResult) => void;
  onAddFileToVault: (file: VaultFile) => void;
}

const QUICK_PRESETS = [
  'Quartz & Feldspar Lattice',
  'Basalt vs Granite Magma',
  'Kimberlite Diamond Pipe',
  'Seismic Wave P & S Front 3D',
  'Earth Mantle Core Plume',
  'Pyrite Isometric Cube',
];

export const GeminiScreenSearchModal: React.FC<GeminiScreenSearchModalProps> = ({
  currentUser,
  onClose,
  onProjectToScreen,
  onAddFileToVault,
}) => {
  const [query, setQuery] = useState('Quartz Crystal & Silica Tetrahedral Matrix');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<GeminiSearchResult | null>(null);
  const [isProjected, setIsProjected] = useState(false);
  const [isSavedToVault, setIsSavedToVault] = useState(false);

  // 3D Canvas Interactive Controls State
  const [rotationX, setRotationX] = useState(20);
  const [rotationY, setRotationY] = useState(45);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showLatticeNodes, setShowLatticeNodes] = useState(true);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial Search
  useEffect(() => {
    handleExecuteSearch('Quartz Crystal & Silica Tetrahedral Matrix');
  }, []);

  const handleExecuteSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsProjected(false);
    setIsSavedToVault(false);

    try {
      const res = await searchGeminiAI(searchQuery);
      setSearchResult(res);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotation loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Interactive 3D Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !searchResult) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Convert angles to radians
    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180;

    // Define 3D vertices based on model shape
    let rawVertices: { x: number; y: number; z: number }[] = [];
    const size = 90;

    if (searchResult.modelShape === 'cubic') {
      rawVertices = [
        { x: -size, y: -size, z: -size },
        { x: size, y: -size, z: -size },
        { x: size, y: size, z: -size },
        { x: -size, y: size, z: -size },
        { x: -size, y: -size, z: size },
        { x: size, y: -size, z: size },
        { x: size, y: size, z: size },
        { x: -size, y: size, z: size },
      ];
    } else if (searchResult.modelShape === 'octahedral') {
      rawVertices = [
        { x: 0, y: -size * 1.3, z: 0 },
        { x: size, y: 0, z: 0 },
        { x: 0, y: 0, z: size },
        { x: -size, y: 0, z: 0 },
        { x: 0, y: 0, z: -size },
        { x: 0, y: size * 1.3, z: 0 },
      ];
    } else if (searchResult.modelShape === 'pyramid') {
      rawVertices = [
        { x: 0, y: -size * 1.2, z: 0 },
        { x: -size, y: size * 0.8, z: -size },
        { x: size, y: size * 0.8, z: -size },
        { x: size, y: size * 0.8, z: size },
        { x: -size, y: size * 0.8, z: size },
      ];
    } else {
      // Hexagonal Prism default
      const h = size * 1.1;
      const r = size * 0.9;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        rawVertices.push({ x: r * Math.cos(angle), y: -h, z: r * Math.sin(angle) });
      }
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        rawVertices.push({ x: r * Math.cos(angle), y: h, z: r * Math.sin(angle) });
      }
    }

    // 3D Transformation
    const transformed = rawVertices.map((v) => {
      // Rotate Y
      const x1 = v.x * Math.cos(radY) + v.z * Math.sin(radY);
      const z1 = -v.x * Math.sin(radY) + v.z * Math.cos(radY);

      // Rotate X
      const y2 = v.y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = v.y * Math.sin(radX) + z1 * Math.cos(radX);

      // Perspective projection
      const fov = 350;
      const scale = fov / (fov + z2 + 100);
      return {
        px: cx + x1 * scale,
        py: cy + y2 * scale,
        z: z2,
        scale,
      };
    });

    // Draw Wireframe Edges
    ctx.strokeStyle = searchResult.color || '#00e5ff';
    ctx.lineWidth = showWireframe ? 1.5 : 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = searchResult.color || '#00e5ff';

    if (searchResult.modelShape === 'cubic') {
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(transformed[i].px, transformed[i].py);
        ctx.lineTo(transformed[j].px, transformed[j].py);
        ctx.stroke();
      });
    } else if (searchResult.modelShape === 'octahedral') {
      const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [5, 1], [5, 2], [5, 3], [5, 4],
        [1, 2], [2, 3], [3, 4], [4, 1]
      ];
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(transformed[i].px, transformed[i].py);
        ctx.lineTo(transformed[j].px, transformed[j].py);
        ctx.stroke();
      });
    } else if (searchResult.modelShape === 'pyramid') {
      const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 2], [2, 3], [3, 4], [4, 1]
      ];
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(transformed[i].px, transformed[i].py);
        ctx.lineTo(transformed[j].px, transformed[j].py);
        ctx.stroke();
      });
    } else {
      // Hexagonal Prism
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        // Top face
        ctx.beginPath();
        ctx.moveTo(transformed[i].px, transformed[i].py);
        ctx.lineTo(transformed[next].px, transformed[next].py);
        ctx.stroke();
        // Bottom face
        ctx.beginPath();
        ctx.moveTo(transformed[i + 6].px, transformed[i + 6].py);
        ctx.lineTo(transformed[next + 6].px, transformed[next + 6].py);
        ctx.stroke();
        // Vertical pillars
        ctx.beginPath();
        ctx.moveTo(transformed[i].px, transformed[i].py);
        ctx.lineTo(transformed[i + 6].px, transformed[i + 6].py);
        ctx.stroke();
      }
    }

    // Draw Lattice Nodes (Atomic Spheres)
    if (showLatticeNodes) {
      transformed.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, 5 * pt.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.fill();
      });
    }

    ctx.shadowBlur = 0;
  }, [searchResult, rotationX, rotationY, showWireframe, showLatticeNodes]);

  // Handle Mouse Drag on 3D Canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    setAutoRotate(false);
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    setRotationY((prev) => prev + deltaX * 0.8);
    setRotationX((prev) => Math.max(-80, Math.min(80, prev + deltaY * 0.8)));

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleProjectToScreenShare = () => {
    if (!searchResult) return;
    onProjectToScreen(searchResult);
    setIsProjected(true);
  };

  const handleSaveToVault = () => {
    if (!searchResult) return;

    const newVaultFile: VaultFile = {
      id: `gemini_specimen_${Date.now()}`,
      name: `Gemini_3D_Specimen_${searchResult.query.replace(/[^a-zA-Z0-9]/g, '_')}.json`,
      sizeBytes: 1024 * 45,
      type: 'py',
      category: 'lecture_notes',
      uploadDate: new Date().toISOString().slice(0, 10),
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      allowedRoles: ['teacher', 'student'],
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      starred: true,
      downloadCount: 0,
      tags: ['Gemini AI Search', '3D Mineral Specimen', searchResult.crystalSystem],
    };

    onAddFileToVault(newVaultFile);
    setIsSavedToVault(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  Gemini AI Screen Search & 3D Model Explorer
                </h2>
                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-extrabold uppercase rounded-full">
                  Live Classroom Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Search models, minerals, and geophysics specimens during live screen share teaching.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Search Bar Input & Presets */}
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch(query);
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search minerals, stone composition, 3D lattice, fault line models..."
                  className="w-full bg-black/60 border border-cyan-500/40 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-cyan-900/40 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                )}
                <span>{loading ? 'Searching Gemini...' : 'Search AI'}</span>
              </button>
            </form>

            {/* Quick Presets */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <span className="text-white/50 font-bold shrink-0">Quick Queries:</span>
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setQuery(preset);
                    handleExecuteSearch(preset);
                  }}
                  className="shrink-0 px-3 py-1 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-200 rounded-xl transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Result Main Panel */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-cyan-300 animate-pulse">
                Consulting Google Gemini AI Knowledge Grounding...
              </p>
              <p className="text-xs text-white/50">Retrieving 3D structural parameters & mineralogy data</p>
            </div>
          ) : searchResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Interactive 3D Model Canvas (7 cols) */}
              <div className="lg:col-span-7 bg-black/50 border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center space-x-2 bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 rounded-full text-cyan-300 text-xs font-bold">
                    <Box className="w-4 h-4 text-cyan-400" />
                    <span>3D Specimen Structure: {searchResult.crystalSystem}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        autoRotate
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5 inline mr-1" />
                      <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
                    </button>

                    <button
                      onClick={() => setShowWireframe(!showWireframe)}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        showWireframe
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 inline mr-1" />
                      <span>Wireframe</span>
                    </button>
                  </div>
                </div>

                {/* Canvas Area */}
                <div
                  className="w-full h-64 sm:h-72 cursor-grab active:cursor-grabbing flex items-center justify-center relative"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={280}
                    className="w-full h-full max-w-full max-h-full"
                  />
                  <div className="absolute bottom-2 left-2 text-[10px] text-white/40 pointer-events-none">
                    💡 Drag to rotate 3D specimen interactively
                  </div>
                </div>

                {/* Quick Physical Parameters Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs z-10 pt-2 border-t border-white/10">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                    <span className="text-white/50 block text-[10px]">Formula</span>
                    <span className="font-mono font-bold text-amber-300">{searchResult.formula}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                    <span className="text-white/50 block text-[10px]">Hardness</span>
                    <span className="font-bold text-cyan-300">{searchResult.hardness}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                    <span className="text-white/50 block text-[10px]">Density</span>
                    <span className="font-bold text-emerald-300">{searchResult.density}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                    <span className="text-white/50 block text-[10px]">Refraction</span>
                    <span className="font-bold text-indigo-300">{searchResult.refractionIndex}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Analysis & Grounding Sources (5 cols) */}
              <div className="lg:col-span-5 bg-black/40 border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span>Gemini AI Geological Analysis</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                    {searchResult.explanation}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tectonic Origin / Environment
                    </span>
                    <p className="text-xs font-semibold text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 p-2 rounded-lg">
                      {searchResult.tectonicOrigin}
                    </p>
                  </div>

                  {/* Grounding Sources */}
                  {searchResult.groundingSources.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                        <Globe className="w-3 h-3 text-cyan-400" />
                        <span>Google Search Citations</span>
                      </span>
                      <div className="space-y-1">
                        {searchResult.groundingSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center space-x-1 bg-white/5 hover:bg-white/10 p-1.5 rounded-lg border border-white/10 transition-all truncate"
                          >
                            <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Search Topics */}
                {searchResult.relatedTopics.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-white/50 block mb-1 font-bold">Related Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {searchResult.relatedTopics.map((rel) => (
                        <button
                          key={rel}
                          onClick={() => {
                            setQuery(rel);
                            handleExecuteSearch(rel);
                          }}
                          className="text-[10px] bg-white/5 hover:bg-cyan-500/20 text-slate-300 px-2 py-0.5 rounded-md border border-white/10"
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : null}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/60">
            {isProjected ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Projected to Live Screen Share Presentation Stage!</span>
              </span>
            ) : (
              <span>Broadcast search results directly onto the shared class screen.</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveToVault}
              disabled={!searchResult}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                isSavedToVault
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{isSavedToVault ? 'Saved to Vault' : 'Save to Class Vault'}</span>
            </button>

            <button
              onClick={handleProjectToScreenShare}
              disabled={!searchResult}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border flex items-center space-x-2 shadow-lg ${
                isProjected
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 border-cyan-300 text-white shadow-cyan-950/50 active:scale-95'
              }`}
            >
              <Monitor className="w-4 h-4 text-cyan-200" />
              <span>{isProjected ? 'Projected Live on Screen' : 'Project to Live Screen Share'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
