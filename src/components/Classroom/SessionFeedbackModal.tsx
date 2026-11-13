import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, X, Send, Award, ThumbsUp, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface SessionFeedbackModalProps {
  currentUser: User;
  classNameTitle?: string;
  onClose: () => void;
  onSubmitFeedback: (feedback: { rating: number; tags: string[]; comment: string }) => void;
}

export const SessionFeedbackModal: React.FC<SessionFeedbackModalProps> = ({
  currentUser,
  classNameTitle = 'CS-4820: Seismic Wave Spectral Analysis',
  onClose,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clear Audio & HD Stream', 'Interactive Whiteboard']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    'Clear Audio & HD Stream',
    'Interactive Whiteboard',
    'Great Screen Share',
    'Helpful Live QA',
    'Paced Well',
    'Informative AI Tutor',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback({ rating, tags: selectedTags, comment });
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative animate-fade-in space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Live Session Feedback & Rating</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Thank You for Your Feedback!</h2>
            <p className="text-xs text-white/70 max-w-xs mx-auto">
              Your ratings help instructors refine live class interactions and smart board presentation quality.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div>
              <span className="text-white/60 font-semibold block mb-1">Session</span>
              <div className="font-bold text-white text-sm bg-white/10 p-3 rounded-2xl border border-white/15">
                {classNameTitle}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-amber-300 font-bold mb-2">Rate Your Experience (1 - 5 Stars)</label>
              <div className="flex items-center justify-center space-x-2 bg-black/30 p-4 rounded-2xl border border-white/10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-amber-300 font-bold mb-2">What went well?</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comment */}
            <div>
              <label className="block text-amber-300 font-bold mb-1">Additional Feedback or Questions</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share any comments regarding lecture pace, screen clarity, or topic depth..."
                className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all flex items-center space-x-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
