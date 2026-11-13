import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool, Square, Circle, Type, Eraser, Trash2, Download, Check, Palette,
  Sparkles, Undo, Redo, ArrowRight, Highlighter, Users, Radio, MessageSquarePlus, X
} from 'lucide-react';

interface WhiteboardProps {
  onSaveToVault: (dataUrl: string) => void;
  onClose?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  onSaveToVault,
  onClose,
  currentUserRole = 'teacher',
  currentUserName = 'Dr. Sarah Lin',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'line' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser'>('pen');
  const [color, setColor] = useState('#6366f1'); // Indigo default
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [broadcastActive, setBroadcastActive] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPos, setTextPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // History stack for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = ['#ffffff', '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#a855f7', '#e2e8f0'];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill dark Slate background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial blank state to history
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[prevIndex], 0, 0);
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[nextIndex], 0, 0);
      setHistoryIndex(nextIndex);
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);

    if (tool === 'text') {
      setTextPos(pos);
      setIsAddingText(true);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.lineWidth = lineWidth * 5;
      ctx.strokeStyle = '#0f172a';
      ctx.globalAlpha = 1.0;
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (tool === 'highlighter') {
      ctx.lineWidth = lineWidth * 4;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (tool === 'pen') {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    }
  };

  const stopDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, currentPos.x - startPos.x, currentPos.y - startPos.y);
    } else if (tool === 'circle') {
      const radius = Math.hypot(currentPos.x - startPos.x, currentPos.y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === 'arrow') {
      drawArrow(ctx, startPos.x, startPos.y, currentPos.x, currentPos.y);
    }

    saveCanvasState();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headlen = 15;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fill();
  };

  const handleAddTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      setIsAddingText(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(16, lineWidth * 4)}px Inter, sans-serif`;
    ctx.fillText(textInput, textPos.x, textPos.y);

    setTextInput('');
    setIsAddingText(false);
    saveCanvasState();
  };

  const addStamp = (stampText: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(stampText, 100 + Math.random() * 300, 100 + Math.random() * 200);
    saveCanvasState();
  };

  const clearCanvas = () => {
    if (window.confirm('Clear all drawing and annotations on the collaborative whiteboard screen?')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveToVault(dataUrl);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full h-full bg-slate-900/90 backdrop-blur-xl border border-white/15 flex flex-col text-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative">
      
      {/* Sync Status Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[11px] font-bold">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
            <span>REAL-TIME COLLABORATIVE CANVAS</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-white/80 hidden sm:inline">Active Presenter: <strong className="text-amber-300">{currentUserName}</strong> ({currentUserRole})</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-white/70">
          <Users className="w-3.5 h-3.5 text-indigo-300" />
          <span>Syncing with <strong>28 Students</strong></span>
          {onClose && (
            <>
              <span className="text-white/20">|</span>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all"
                title="Hide Whiteboard Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Header Toolbar */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2 bg-white/5">
        
        {/* Drawing Tools Group */}
        <div className="flex items-center space-x-1 bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'pen' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Pen Tool"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'highlighter' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4 text-amber-300" />
          </button>

          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'arrow' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Arrow Diagram Tool"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'rect' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'circle' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Add Text Annotation"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'eraser' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
            title="Eraser Screen Space"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Thickness Slider */}
        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-white/60 text-[10px]">Stroke:</span>
          <input
            type="range"
            min="2"
            max="24"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <span className="font-mono text-indigo-300 text-[11px] w-4">{lineWidth}px</span>
        </div>

        {/* Color Palette */}
        <div className="flex items-center space-x-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (tool === 'eraser') setTool('pen');
              }}
              className={`w-5 h-5 rounded-full transition-transform ${
                color === c && tool !== 'eraser' ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* History & Clear Screen Actions */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg transition-colors"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg transition-colors"
          >
            <Redo className="w-4 h-4" />
          </button>

          <button
            onClick={clearCanvas}
            title="Clear Screen Space"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Screen</span>
          </button>

          <button
            onClick={handleExport}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
              savedSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
            }`}
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved to Vault' : 'Save & Share'}</span>
          </button>
        </div>
      </div>

      {/* Quick Annotation Stamps Toolbar */}
      <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-white/50 font-semibold uppercase tracking-wider shrink-0">Annotation Stamps:</span>
        <button onClick={() => addStamp('★ IMPORTANT')} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-500/30 shrink-0 font-bold">
          ★ IMPORTANT
        </button>
        <button onClick={() => addStamp('❓ QUESTION?')} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-500/30 shrink-0 font-bold">
          ❓ QUESTION?
        </button>
        <button onClick={() => addStamp('✔ VERIFIED')} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg hover:bg-emerald-500/30 shrink-0 font-bold">
          ✔ VERIFIED
        </button>
        <button onClick={() => addStamp('Σ FORMULA')} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg hover:bg-purple-500/30 shrink-0 font-bold">
          Σ FORMULA
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-slate-950 p-2 relative flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={620}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 cursor-crosshair shadow-inner"
        />

        {/* Text Box Popover on Canvas */}
        {isAddingText && (
          <form
            onSubmit={handleAddTextSubmit}
            style={{
              position: 'absolute',
              left: `${Math.min(80, (textPos.x / 900) * 100)}%`,
              top: `${Math.min(80, (textPos.y / 620) * 100)}%`,
            }}
            className="z-30 bg-slate-900/95 border border-indigo-400/80 p-2 rounded-2xl shadow-2xl flex items-center space-x-2 animate-fade-in"
          >
            <input
              type="text"
              autoFocus
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type annotation text..."
              className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl"
            >
              Add
            </button>
          </form>
        )}
      </div>

    </div>
  );
};

