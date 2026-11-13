import React, { useState } from 'react';
import { Send, ThumbsUp, Paperclip, MessageSquare, HelpCircle, FileText, CheckCircle2, Sparkles, Archive, FolderKey, X, Download } from 'lucide-react';
import { ChatMessage, User, VaultFile } from '../../types';

interface LiveChatProps {
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (msg: string, isQA: boolean) => void;
  onUpvoteQA: (id: string) => void;
  onClose: () => void;
  onAddFileToVault?: (file: VaultFile) => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  messages,
  currentUser,
  onSendMessage,
  onUpvoteQA,
  onClose,
  onAddFileToVault,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'qa'>('all');
  const [inputText, setInputText] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<'chat' | 'qa' | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3500);
  };

  const handleArchive = (type: 'chat' | 'qa') => {
    setArchiveTarget(type);
  };

  const executeArchive = (type: 'chat' | 'qa', mode: 'download' | 'vault') => {
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\s/g, '');
    const cleanTime = timeStr.replace(/:/g, '');

    let content = '';
    let filename = '';

    if (type === 'chat') {
      filename = `Class_Chat_Archive_CS4820_${dateStr}_${cleanTime}.txt`;
      content += `=========================================================\n`;
      content += `CLASS CHAT ARCHIVE - CS4820 GEOPHYSICS\n`;
      content += `Archived at: ${timestamp}\n`;
      content += `Archived by: ${currentUser.name} (${currentUser.role})\n`;
      content += `Total Messages: ${messages.length}\n`;
      content += `=========================================================\n\n`;

      messages.forEach((msg) => {
        const role = msg.senderRole === 'teacher' ? 'Instructor' : 'Student';
        const isQAStr = msg.isQA ? ' [QUESTION]' : '';
        content += `[${msg.timestamp}] ${msg.senderName} (${role})${isQAStr}:\n`;
        content += `${msg.message}\n`;
        if (msg.attachment) {
          content += `📎 Attachment: ${msg.attachment.name} (${msg.attachment.size})\n`;
        }
        content += `---------------------------------------------------------\n`;
      });
    } else {
      const qaList = messages.filter((m) => m.isQA);
      filename = `Q_and_A_Archive_CS4820_${dateStr}_${cleanTime}.txt`;
      content += `=========================================================\n`;
      content += `CLASS Q&A ARCHIVE - CS4820 GEOPHYSICS\n`;
      content += `Archived at: ${timestamp}\n`;
      content += `Archived by: ${currentUser.name} (${currentUser.role})\n`;
      content += `Total Questions: ${qaList.length}\n`;
      content += `=========================================================\n\n`;

      if (qaList.length === 0) {
        content += `No questions have been raised in this session yet.\n`;
      } else {
        qaList.forEach((msg, idx) => {
          content += `[Question ${idx + 1}] [Upvotes: ${msg.upvotes || 0}]\n`;
          content += `Asked by: ${msg.senderName} at ${msg.timestamp}\n`;
          content += `Question: ${msg.message}\n`;
          content += `---------------------------------------------------------\n\n`;
        });
      }
    }

    if (mode === 'download') {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccessMsg(`📥 Downloaded "${filename}" successfully!`);
    } else {
      if (onAddFileToVault) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const file: VaultFile = {
          id: `archive_${Date.now()}`,
          name: filename,
          sizeBytes: blob.size,
          type: 'txt',
          category: 'lecture_notes',
          uploadDate: dateStr,
          uploaderName: currentUser.name,
          uploaderRole: currentUser.role,
          allowedRoles: ['teacher', 'student'],
          url: blobUrl,
          starred: true,
          downloadCount: 0,
          tags: ['Archive', type === 'chat' ? 'Chat Log' : 'Q&A Log'],
        };
        onAddFileToVault(file);
        triggerSuccessMsg(`📁 Saved to Class Vault as "${filename}"!`);
      } else {
        triggerSuccessMsg(`⚠️ Class Vault offline.`);
      }
    }

    setArchiveTarget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), isQuestion);
    setInputText('');
    setIsQuestion(false);
  };

  const filteredMessages = activeTab === 'qa' ? messages.filter((m) => m.isQA) : messages;

  return (
    <div className="w-full h-full bg-white/5 backdrop-blur-lg border border-white/10 flex flex-col text-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center space-x-2 shrink-0">
          <MessageSquare className="w-5 h-5 text-indigo-300" />
          <h3 className="font-bold text-sm text-white">Class Chat & Q&A</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Toggle */}
          <div className="flex p-0.5 bg-black/40 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white/20 text-white border border-white/20' : 'text-white/60 hover:text-white'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                activeTab === 'qa' ? 'bg-white/20 text-white border border-white/20' : 'text-white/60 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3 h-3 text-amber-300" />
              <span>Q&A</span>
            </button>
          </div>

          {/* Close/Hide Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Hide Class Chat & Q&A Panel"
              className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Archive Options Strip */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-white/80 shrink-0">
        <span className="flex items-center space-x-1 font-semibold text-slate-300">
          <Archive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Archiving Options</span>
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => handleArchive('chat')}
            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg font-bold transition-all flex items-center space-x-1 hover:text-white"
            title="Archive all general chat messages"
          >
            <Download className="w-3 h-3" />
            <span>Chat Log</span>
          </button>
          <button
            type="button"
            onClick={() => handleArchive('qa')}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg font-bold transition-all flex items-center space-x-1 hover:text-white"
            title="Archive Q&A questions"
          >
            <Download className="w-3 h-3" />
            <span>Q&A Log</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="absolute top-12 inset-x-4 bg-emerald-500 text-slate-950 font-black text-[11px] py-2.5 px-3.5 rounded-xl shadow-lg flex items-center space-x-1.5 animate-bounce z-20 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Archive Selection Popup */}
      {archiveTarget && (
        <div className="absolute inset-x-0 top-0 bg-slate-900/95 border-b border-white/10 p-4 z-20 flex flex-col space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-white flex items-center space-x-1.5">
              <Archive className="w-4 h-4 text-emerald-400" />
              <span>Archive {archiveTarget === 'chat' ? 'Class Chat' : 'Q&A Questions'}</span>
            </h4>
            <button onClick={() => setArchiveTarget(null)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Export {archiveTarget === 'chat' ? 'all live class conversation streams' : 'all raised student questions & upvote counts'} as a structured text document.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => executeArchive(archiveTarget, 'download')}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-semibold text-white flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Direct Download</span>
            </button>
            <button
              onClick={() => executeArchive(archiveTarget, 'vault')}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <FolderKey className="w-4 h-4" />
              <span>Save to Class Vault</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-xs">
            No messages in this channel yet. Start the conversation!
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl border transition-all ${
                msg.isQA
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
                  : 'bg-white/10 backdrop-blur-md border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="font-semibold text-xs text-white">{msg.senderName}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      msg.senderRole === 'teacher'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {msg.senderRole === 'teacher' ? 'Instructor' : 'Student'}
                  </span>
                </div>
                <span className="text-[10px] text-white/50">{msg.timestamp}</span>
              </div>

              <p className="text-xs text-white/90 leading-relaxed mb-2">{msg.message}</p>

              {/* Attachment if present */}
              {msg.attachment && (
                <div className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/10 text-xs mb-2">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-300 shrink-0" />
                    <span className="truncate text-white font-medium">{msg.attachment.name}</span>
                  </div>
                  <span className="text-[10px] text-white/50">{msg.attachment.size}</span>
                </div>
              )}

              {/* Q&A Upvote Section */}
              {msg.isQA && (
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/30">
                  <span className="text-[10px] font-semibold text-amber-300 flex items-center space-x-1">
                    <HelpCircle className="w-3 h-3" />
                    <span>Question to Instructor</span>
                  </span>

                  <button
                    onClick={() => onUpvoteQA(msg.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      msg.upvotedByMe
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-black/40 text-amber-300 hover:bg-black/60 border border-amber-500/30'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{msg.upvotes || 0}</span>
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/40 space-y-2">
        
        <div className="flex items-center justify-between text-xs px-1">
          <label className="flex items-center space-x-1.5 cursor-pointer text-white/70 hover:text-amber-300">
            <input
              type="checkbox"
              checked={isQuestion}
              onChange={(e) => setIsQuestion(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-amber-400 focus:ring-amber-400"
            />
            <span className="font-medium text-[11px]">Mark as Question for Q&A</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isQuestion ? 'Type your question for the teacher...' : 'Send message to class...'}
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
};
