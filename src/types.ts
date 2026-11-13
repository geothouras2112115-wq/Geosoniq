export interface QuizResult {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  score: number;
  maxScore: number;
  timestamp: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export type ThemePreset = 'cosmic_dark' | 'light_clean' | 'emerald_dark' | 'midnight_neon';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  department: string;
  isLoggedIn: boolean;
  password?: string;
  isSuspended?: boolean;
  registeredDevice?: 'windows' | 'android' | 'web';
  location?: string;
  ipAddress?: string;
  activeStatus?: 'online' | 'idle' | 'offline';
  fcmToken?: string;
  createdAt?: string;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
}

export type TargetPlatform = 'all' | 'windows' | 'android';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  senderName: string;
  senderRole: UserRole;
  targetPlatform: TargetPlatform;
  targetRole: UserRole | 'all';
  timestamp: string;
  read: boolean;
  category?: 'alert' | 'class' | 'assignment' | 'vault' | 'system';
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetUser?: string;
  timestamp: string;
  details: string;
}

export interface SyllabusItem {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  category: string;
  thumbnail: string;
  duration: string;
  totalModules: number;
  enrolledStudents: number;
  featuredVideoUrl: string;
  syllabus: SyllabusItem[];
}

export type FileCategory = 'lecture_notes' | 'recordings' | 'assignments' | 'code_snippets' | 'slides' | 'apps';

export interface VaultFile {
  id: string;
  name: string;
  sizeBytes: number;
  type: string; // pdf, mp4, zip, docx, py, js, apk
  category: FileCategory;
  uploadDate: string;
  uploaderName: string;
  uploaderRole: UserRole;
  allowedRoles: UserRole[];
  allowedUsers?: string[]; // user IDs
  url: string;
  starred: boolean;
  downloadCount: number;
  tags: string[];
  folderName?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  message: string;
  timestamp: string;
  isQA?: boolean;
  upvotes?: number;
  upvotedByMe?: boolean;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface Participant {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  isLocal?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export interface ReactionParticle {
  id: string;
  emoji: string;
  senderName: string;
  x: number; // percentage horizontal
}

export interface WhiteboardElement {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'text';
  color: string;
  lineWidth: number;
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
}

export interface GeminiSearchResult {
  query: string;
  explanation: string;
  formula: string;
  hardness: string;
  density: string;
  crystalSystem: string;
  tectonicOrigin: string;
  refractionIndex: string;
  modelShape: 'cubic' | 'hexagonal' | 'octahedral' | 'pyramid' | 'sphere' | 'wave_vector';
  color: string;
  groundingSources: { title: string; uri: string }[];
  relatedTopics: string[];
}

