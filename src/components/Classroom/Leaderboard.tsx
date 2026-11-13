import React, { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { QuizResult } from '../../types';

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    // Mock data fetch, in a real scenario, fetch from Firestore here
    const mockData: QuizResult[] = [
      { id: '1', studentId: 's1', studentName: 'Alice', courseId: 'c1', score: 95, maxScore: 100, timestamp: new Date().toISOString() },
      { id: '2', studentId: 's2', studentName: 'Bob', courseId: 'c1', score: 88, maxScore: 100, timestamp: new Date().toISOString() },
      { id: '3', studentId: 's3', studentName: 'Charlie', courseId: 'c1', score: 92, maxScore: 100, timestamp: new Date().toISOString() },
      { id: '4', studentId: 's4', studentName: 'David', courseId: 'c1', score: 75, maxScore: 100, timestamp: new Date().toISOString() },
      { id: '5', studentId: 's5', studentName: 'Eve', courseId: 'c1', score: 98, maxScore: 100, timestamp: new Date().toISOString() },
    ];
    setResults(mockData);
  }, []);

  const topStudents = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-white/10 p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold">Classroom Leaderboard</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {topStudents.map((result, index) => (
          <div key={result.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className={`font-bold text-lg w-6 ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                #{index + 1}
              </span>
              <span>{result.studentName}</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">{result.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};
