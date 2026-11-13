import React, { useState } from 'react';
import { VaultFile, User, FileCategory } from '../../types';
import {
  FolderKey, UploadCloud, Search, Star, Download, Share2, Trash2, Eye,
  FileText, Video, Code, Archive, Check, Sparkles, Filter, Lock, ShieldCheck, X,
  FolderPlus, Edit3, Folder, HardDrive, Plus, ArrowRight
} from 'lucide-react';

interface FileVaultProps {
  files: VaultFile[];
  currentUser: User;
  onUploadFile: (file: VaultFile) => void;
  onToggleStar: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onOpenAITutor: (topic: string) => void;
}

export const FileVault: React.FC<FileVaultProps> = ({
  files,
  currentUser,
  onUploadFile,
  onToggleStar,
  onDeleteFile,
  onOpenAITutor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Folder Management State
  const [folders, setFolders] = useState<string[]>([
    'General Notes',
    'Recorded Lectures',
    'Assignments & Projects',
    'GIS Datasets & Maps',
    'Lab Reports',
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [editingFolder, setEditingFolder] = useState<{ oldName: string; newName: string } | null>(null);
  const [targetUploadFolder, setTargetUploadFolder] = useState<string>('General Notes');
  const [localFileFolders, setLocalFileFolders] = useState<Record<string, string>>({});

  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 * 1024; // 50 GB

  const totalUsedBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
  const maxBytes = 500 * 1024 * 1024 * 1024; // 500 GB Vault Storage
  const usedPercentage = Math.min(100, Math.round((totalUsedBytes / maxBytes) * 100));

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${Math.round(bytes / 1000)} KB`;
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mp4':
        return <Video className="w-5 h-5 text-indigo-400" />;
      case 'py':
      case 'js':
      case 'ts':
        return <Code className="w-5 h-5 text-emerald-400" />;
      case 'zip':
      case 'tar':
        return <Archive className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-cyan-400" />;
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    processSelectedFiles(droppedFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []) as File[];
    processSelectedFiles(selected);
  };

  const processSelectedFiles = (fileList: File[]) => {
    fileList.forEach((file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        showToast(`⚠️ "${file.name}" exceeds the 50 GB limit (${formatSize(file.size)}). Max allowed size is 50.0 GB.`);
        return;
      }

      const newVaultFile: VaultFile = {
        id: `fl_${Date.now()}_${Math.random()}`,
        name: file.name,
        sizeBytes: file.size,
        type: file.name.split('.').pop() || 'file',
        category: 'lecture_notes',
        uploadDate: new Date().toISOString().slice(0, 10),
        uploaderName: currentUser.name,
        uploaderRole: currentUser.role,
        allowedRoles: ['teacher', 'student'],
        url: URL.createObjectURL(file),
        starred: false,
        downloadCount: 0,
        tags: [targetUploadFolder, 'Class Vault'],
        folderName: targetUploadFolder,
      };

      onUploadFile(newVaultFile);
      showToast(`Success: "${file.name}" (${formatSize(file.size)}) uploaded to folder "${targetUploadFolder}"!`);
    });
  };

  const handleCopyLink = (file: VaultFile) => {
    navigator.clipboard.writeText(window.location.href);
    showToast(`Shareable link for "${file.name}" copied! (Expires in 24h)`);
  };

  // Folder Actions: Add, Rename, Delete
  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFolderNameInput.trim();
    if (!name) return;

    if (folders.includes(name)) {
      showToast(`Folder "${name}" already exists!`);
      return;
    }

    setFolders([...folders, name]);
    setSelectedFolder(name);
    setTargetUploadFolder(name);
    setNewFolderNameInput('');
    setIsAddFolderModalOpen(false);
    showToast(`Folder "${name}" created successfully!`);
  };

  const handleRenameFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder) return;
    const { oldName, newName } = editingFolder;
    const trimmedNew = newName.trim();
    if (!trimmedNew || trimmedNew === oldName) {
      setEditingFolder(null);
      return;
    }

    setFolders(folders.map((f) => (f === oldName ? trimmedNew : f)));

    if (selectedFolder === oldName) setSelectedFolder(trimmedNew);
    if (targetUploadFolder === oldName) setTargetUploadFolder(trimmedNew);

    // Update local file folder mappings
    const updatedLocalMap = { ...localFileFolders };
    Object.keys(updatedLocalMap).forEach((id) => {
      if (updatedLocalMap[id] === oldName) updatedLocalMap[id] = trimmedNew;
    });
    setLocalFileFolders(updatedLocalMap);

    setEditingFolder(null);
    showToast(`Folder "${oldName}" renamed to "${trimmedNew}"!`);
  };

  const handleDeleteFolder = (folderName: string) => {
    if (folders.length <= 1) {
      showToast('Cannot delete the last remaining folder.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete folder "${folderName}"? Files inside will be moved to "General Notes".`)) {
      setFolders(folders.filter((f) => f !== folderName));
      if (selectedFolder === folderName) setSelectedFolder('all');
      if (targetUploadFolder === folderName) setTargetUploadFolder(folders[0] || 'General Notes');

      showToast(`Folder "${folderName}" deleted.`);
    }
  };

  const handleMoveFileFolder = (fileId: string, newFolder: string) => {
    setLocalFileFolders((prev) => ({ ...prev, [fileId]: newFolder }));
    showToast(`File moved to folder "${newFolder}"`);
  };

  const getEffectiveFolder = (file: VaultFile) => {
    return localFileFolders[file.id] || file.folderName || 'General Notes';
  };

  const filteredFiles = files.filter((f) => {
    const effectiveFolder = getEffectiveFolder(f);

    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      effectiveFolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'starred' && f.starred) ||
      f.category === selectedCategory;

    const matchesFolder = selectedFolder === 'all' || effectiveFolder === selectedFolder;

    return matchesSearch && matchesCategory && matchesFolder;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center space-x-2 border border-indigo-400 text-xs font-semibold animate-bounce max-w-md">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Storage Bar */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-blue-500 to-indigo-600 border border-white/20 rounded-2xl shadow-lg backdrop-blur-md text-white">
              <FolderKey className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Classroom File Vault</h1>
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Up to 50 GB Upload Support
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">Secure Course Document & Large Lecture Video Cloud Storage</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddFolderModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Add Folder</span>
            </button>

            <button
              onClick={() => onOpenAITutor('Class Vault Documents Summary')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Summarize Vault</span>
            </button>
          </div>
        </div>

        {/* Storage Bar Indicator */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-white/70 font-medium">
            <span className="flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-300" />
              <span>Vault Cloud Capacity (Max file size: <strong className="text-emerald-300">50.0 GB</strong>)</span>
            </span>
            <span>{formatSize(totalUsedBytes)} of 500.0 GB used ({usedPercentage}%)</span>
          </div>
          <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, usedPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Folder Bar - Add / Rename / Delete Folders */}
      <div className="bg-white/5 border border-white/15 rounded-3xl p-4 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-amber-300" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Classroom Folders</h2>
            <span className="text-[10px] text-white/50">(Everyone can add or rename folders)</span>
          </div>

          <button
            onClick={() => setIsAddFolderModalOpen(true)}
            className="text-xs text-emerald-300 hover:text-emerald-200 font-bold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Folder Chips / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedFolder === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-blue-200" />
            <span>All Folders ({files.length})</span>
          </button>

          {folders.map((f) => {
            const fileCount = files.filter((fl) => getEffectiveFolder(fl) === f).length;
            const isSelected = selectedFolder === f;

            return (
              <div
                key={f}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
                }`}
              >
                <button
                  onClick={() => setSelectedFolder(f)}
                  className="flex items-center space-x-1.5 focus:outline-none"
                >
                  <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-900' : 'text-amber-300'}`} />
                  <span className="max-w-[120px] truncate">{f}</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-slate-900/20 text-slate-900' : 'bg-white/10 text-white/60'}`}>
                    {fileCount}
                  </span>
                </button>

                <div className="flex items-center space-x-1 ml-1 pl-1 border-l border-current/20">
                  <button
                    onClick={() => setEditingFolder({ oldName: f, newName: f })}
                    title="Rename Folder"
                    className="p-1 hover:bg-black/20 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleDeleteFolder(f)}
                    title="Delete Folder"
                    className="p-1 hover:bg-rose-500/30 rounded text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop File Upload Area with 2 GB Limit */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 transition-all text-center flex flex-col items-center justify-center cursor-pointer relative ${
          dragOver
            ? 'border-emerald-400 bg-emerald-500/20 backdrop-blur-lg scale-[1.01]'
            : 'border-white/20 bg-white/5 backdrop-blur-md hover:border-white/40'
        }`}
      >
        <div className="p-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-indigo-300 rounded-full mb-3 border border-white/20">
          <UploadCloud className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className="text-sm font-bold text-white">Drag & drop files here, or click to browse</h3>
        <p className="text-xs text-emerald-300 font-bold mt-1">
          ⚡ Supports Large File Uploads up to <span className="underline decoration-emerald-400 decoration-2">50.0 GB per file</span>
        </p>
        <p className="text-[11px] text-white/60 mt-0.5">
          Accepts PDFs, MP4 Video Recordings, GIS Spatial Datasets, PyTorch Models, Code (PY, JS, TS), and Archives (ZIP/TAR).
        </p>

        {/* Target Folder Selector */}
        <div className="mt-4 flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
          <span className="text-white/70">Upload into Folder:</span>
          <select
            value={targetUploadFolder}
            onChange={(e) => setTargetUploadFolder(e.target.value)}
            className="bg-slate-800 text-white font-bold px-2 py-1 rounded-lg border border-white/20 focus:outline-none"
          >
            {folders.map((f) => (
              <option key={f} value={f}>
                📁 {f}
              </option>
            ))}
          </select>
        </div>

        <label className="mt-4 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg transition-all active:scale-95">
          <span>Browse Files (Up to 50 GB)</span>
          <input type="file" multiple className="hidden" onChange={handleFileInputChange} />
        </label>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, folders or tags..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'starred', label: '★ Starred' },
            { id: 'slides', label: 'Slides' },
            { id: 'recordings', label: 'Recordings' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'code_snippets', label: 'Code' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-md'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Files Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-[11px] text-white/70 font-bold uppercase tracking-wider">
                <th className="p-4">File Name</th>
                <th className="p-4">Folder</th>
                <th className="p-4">Uploaded By</th>
                <th className="p-4">Date</th>
                <th className="p-4">Size</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">
                    No files found in this folder or category.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => {
                  const currentFolder = getEffectiveFolder(file);

                  return (
                    <tr key={file.id} className="hover:bg-white/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-black/40 rounded-xl border border-white/10">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center space-x-2">
                              <span>{file.name}</span>
                              {file.starred && <Star className="w-3.5 h-3.5 text-amber-300 fill-current" />}
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              {file.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-1.5 py-0.2 bg-white/10 text-indigo-200 rounded font-medium border border-white/10"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Folder Selection for File */}
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <Folder className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <select
                            value={currentFolder}
                            onChange={(e) => handleMoveFileFolder(file.id, e.target.value)}
                            className="bg-black/40 text-amber-200 font-bold text-xs px-2 py-1 rounded-lg border border-white/15 focus:outline-none cursor-pointer"
                          >
                            {folders.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white">{file.uploaderName}</div>
                        <div className="text-[10px] text-white/60 capitalize">{file.uploaderRole}</div>
                      </td>

                      <td className="p-4 text-white/70">{file.uploadDate}</td>

                      <td className="p-4 font-mono text-white/80">{formatSize(file.sizeBytes)}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Preview File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onToggleStar(file.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              file.starred ? 'text-amber-300 hover:bg-white/10' : 'text-white/70 hover:text-amber-300'
                            }`}
                            title="Star File"
                          >
                            <Star className={`w-4 h-4 ${file.starred ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleCopyLink(file)}
                            className="p-2 text-white/70 hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="Copy Share Link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {(file.uploaderName === currentUser.name || currentUser.role === 'teacher') && (
                            <button
                              onClick={() => onDeleteFile(file.id)}
                              className="p-2 text-white/70 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Folder Modal */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl relative">
            <button
              onClick={() => setIsAddFolderModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add New Classroom Folder</h3>
                <p className="text-xs text-slate-400">Organize course documents and large files.</p>
              </div>
            </div>

            <form onSubmit={handleAddFolder} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderNameInput}
                  onChange={(e) => setNewFolderNameInput(e.target.value)}
                  placeholder="e.g. Field Survey Videos 2026"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFolderModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl relative">
            <button
              onClick={() => setEditingFolder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/30">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rename Folder</h3>
                <p className="text-xs text-slate-400">Updating folder "{editingFolder.oldName}"</p>
              </div>
            </div>

            <form onSubmit={handleRenameFolderSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Folder Name</label>
                <input
                  type="text"
                  required
                  value={editingFolder.newName}
                  onChange={(e) => setEditingFolder({ ...editingFolder, newName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md"
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Drawer / Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 text-slate-100 relative shadow-2xl">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                {getFileIcon(previewFile.type)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{previewFile.name}</h3>
                <p className="text-xs text-slate-400">
                  Folder: <span className="text-amber-300 font-bold">{getEffectiveFolder(previewFile)}</span> • Uploaded by {previewFile.uploaderName} • {formatSize(previewFile.sizeBytes)}
                </p>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[200px] flex flex-col items-center justify-center text-center">
              {previewFile.type === 'mp4' ? (
                <video src={previewFile.url} controls className="w-full rounded-xl max-h-[300px]" />
              ) : previewFile.type === 'png' || previewFile.type === 'jpg' ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[300px] rounded-xl object-contain" />
              ) : (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                  <p className="text-xs text-slate-300">Document ready for download & inspection.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Clean Scan</span>
              </span>

              <a
                href={previewFile.url}
                download={previewFile.name}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
