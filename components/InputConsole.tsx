import React, { useState, useRef, useEffect } from 'react';
import { Attachment, TaskPriority } from '../types';

interface InputConsoleProps {
  onSendMessage: (text: string, attachments: Attachment[], priority: TaskPriority) => void;
  isLoading: boolean;
}

const InputConsole: React.FC<InputConsoleProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Voice Input Logic ---
  useEffect(() => {
    let recognition: any = null;
    if (isListening) {
      if ('webkitSpeechRecognition' in window) {
        // @ts-ignore
        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev ? prev + ' ' + transcript : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } else {
        alert("Voice input not supported in this browser.");
        setIsListening(false);
      }
    }
    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          mimeType: file.type,
          data: base64String
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0)) return;
    onSendMessage(input, attachments, priority);
    setInput('');
    setAttachments([]);
    // Reset priority after send? Optional. Keeping it persistent for now.
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Priority & Attachment Status */}
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="flex gap-2">
           {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
             <button
               key={p}
               type="button"
               onClick={() => setPriority(p)}
               className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${
                 priority === p 
                  ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                  : p === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'text-slate-600 hover:text-slate-400'
               }`}
             >
               {p}
             </button>
           ))}
        </div>
        {attachments.length > 0 && (
          <div className="flex gap-1">
            {attachments.map((_, i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-machine-purple animate-pulse"></span>
            ))}
            <span className="text-[10px] text-machine-purple ml-1">{attachments.length} attached</span>
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-machine-cyan to-machine-purple rounded-xl opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-machine-base rounded-xl p-2 border border-machine-highlight shadow-2xl">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-machine-cyan transition-colors"
            title="Upload Media"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>

          <button
            type="button"
            onClick={() => setIsListening(!isListening)}
            className={`p-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
            title="Voice Command"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Initialize task sequence..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-600 px-2 py-3 focus:outline-none resize-none max-h-[150px] font-sans"
            rows={1}
            disabled={isLoading && priority !== TaskPriority.HIGH} // Allow typing for queueing even if loading
          />

          <button 
            type="submit"
            disabled={(!input.trim() && attachments.length === 0)}
            className={`p-3 rounded-lg transition-all duration-300 ${
              (input.trim() || attachments.length > 0)
                ? 'bg-machine-cyan text-black hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                : 'bg-machine-highlight text-slate-600 cursor-not-allowed'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>

        </form>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-mono">
        <span>THE MACHINE v4.0 [MODULAR]</span>
        <span>{isLoading ? 'PROCESSING QUEUE...' : 'SYSTEM READY'}</span>
      </div>
    </div>
  );
};

export default InputConsole;