import React, { useState } from 'react';
import { Sparkles, Bot, Send, X, HelpCircle, BookOpen, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { askAITutor } from '../services/geminiService';

interface AITutorModalProps {
  isOpen: boolean;
  topicContext?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  topicContext = 'General Class Topic',
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Hello! I am your **EduStream AI Study Assistant**. How can I help you understand **${topicContext}** today? You can ask questions, request a concise summary, or generate practice quiz questions!`,
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string, action?: 'ask' | 'summarize' | 'generate_quiz') => {
    const textToSubmit = customPrompt || inputPrompt;
    if (!textToSubmit.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSubmit,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const aiReply = await askAITutor({
        action: action || 'ask',
        prompt: textToSubmit,
        topic: topicContext,
      });

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReply,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, sender: 'ai', text: 'Sorry, I encountered an issue contacting the AI service.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl h-[600px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-5 bg-white/10 border-b border-white/15 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-2xl shadow-lg backdrop-blur-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">EduStream AI Tutor</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-white/70">Context: {topicContext}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 bg-black/40 border-b border-white/10 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => handleSend('Please summarize the key takeaways of this class topic.', 'summarize')}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 whitespace-nowrap transition-all backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Summarize Topic</span>
          </button>

          <button
            onClick={() => handleSend('Generate a 3-question pop quiz to test my understanding.', 'generate_quiz')}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 whitespace-nowrap transition-all backdrop-blur-md"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span>Generate Practice Quiz</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`p-2 rounded-xl text-white ${
                  m.sender === 'user' ? 'bg-blue-500 border border-blue-400' : 'bg-white/10 border border-white/20 backdrop-blur-md'
                }`}
              >
                {m.sender === 'user' ? <BookOpen className="w-4 h-4" /> : <Bot className="w-4 h-4 text-violet-300" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-blue-500/30 text-white border border-blue-400/40 rounded-tr-none backdrop-blur-md'
                    : 'bg-white/10 text-white border border-white/20 rounded-tl-none backdrop-blur-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-200 animate-pulse p-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI Tutor is formulating answer...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-black/40 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask the AI Tutor anything about this class..."
              className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 bg-blue-500 hover:bg-blue-600 border border-blue-400 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
