import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note, AIState, AIActionStatus } from '../types';
import { Wand2, Sparkles, FileText, ChevronLeft, MoreHorizontal, Check, RefreshCw } from 'lucide-react';
import Button from './Button';
import { generateTitle, summarizeNote, polishText } from '../services/geminiService';

interface EditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onClose?: () => void; // For mobile view toggling
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, onClose }) => {
  const [aiState, setAiState] = useState<AIState>({ status: AIActionStatus.IDLE });
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);
  const [showAiMenu, setShowAiMenu] = useState(false);
  
  // Debounce updates to parent
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
  }, [note.id]); // Only reset if the note ID changes, not on every prop update

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onUpdate(note.id, { content: newContent, updatedAt: Date.now() });
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onUpdate(note.id, { title: newTitle, updatedAt: Date.now() });
    }, 500);
  };

  const handleGenerateTitle = async () => {
    if (!localContent.trim()) return;
    setAiState({ status: AIActionStatus.LOADING });
    try {
      const newTitle = await generateTitle(localContent);
      setLocalTitle(newTitle);
      onUpdate(note.id, { title: newTitle, updatedAt: Date.now() });
      setAiState({ status: AIActionStatus.SUCCESS, message: "Title generated!" });
    } catch (error) {
      setAiState({ status: AIActionStatus.ERROR, message: "Failed to generate title." });
    } finally {
      setTimeout(() => setAiState({ status: AIActionStatus.IDLE }), 2000);
    }
  };

  const handleSummarize = async () => {
    if (!localContent.trim()) return;
    setAiState({ status: AIActionStatus.LOADING });
    try {
      const summary = await summarizeNote(localContent);
      const newContent = `${localContent}\n\n## 📝 AI Summary\n${summary}`;
      setLocalContent(newContent);
      onUpdate(note.id, { content: newContent, updatedAt: Date.now() });
      setAiState({ status: AIActionStatus.SUCCESS, message: "Summary added!" });
    } catch (error) {
      setAiState({ status: AIActionStatus.ERROR, message: "Failed to summarize." });
    } finally {
      setShowAiMenu(false);
      setTimeout(() => setAiState({ status: AIActionStatus.IDLE }), 2000);
    }
  };

  const handlePolish = async () => {
    if (!localContent.trim()) return;
    setAiState({ status: AIActionStatus.LOADING });
    try {
      const polished = await polishText(localContent);
      setLocalContent(polished);
      onUpdate(note.id, { content: polished, updatedAt: Date.now() });
      setAiState({ status: AIActionStatus.SUCCESS, message: "Text polished!" });
    } catch (error) {
      setAiState({ status: AIActionStatus.ERROR, message: "Failed to polish." });
    } finally {
      setShowAiMenu(false);
      setTimeout(() => setAiState({ status: AIActionStatus.IDLE }), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="md:hidden p-2 -ml-2 text-gray-500">
              <ChevronLeft size={20} />
            </button>
          )}
          <span className="text-xs font-mono text-gray-400">
             Last edited {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        
        <div className="flex items-center gap-2 relative">
          {aiState.status === AIActionStatus.LOADING && (
             <span className="text-xs text-primary-600 animate-pulse flex items-center mr-2">
                <RefreshCw size={12} className="animate-spin mr-1" />
                AI Working...
             </span>
          )}
          {aiState.status === AIActionStatus.SUCCESS && (
             <span className="text-xs text-green-600 flex items-center mr-2">
                <Check size={12} className="mr-1" />
                {aiState.message}
             </span>
          )}

           <div className="relative">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAiMenu(!showAiMenu)}
                className="gap-2 text-primary-700 border-primary-100 bg-primary-50 hover:bg-primary-100"
                icon={<Sparkles size={14} />}
              >
                AI Actions
              </Button>
              
              {showAiMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowAiMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                      <button 
                        onClick={handleGenerateTitle}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Wand2 size={14} className="text-purple-500" />
                        <span>Auto-generate Title</span>
                      </button>
                      <button 
                         onClick={handleSummarize}
                         className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <FileText size={14} className="text-blue-500" />
                        <span>Summarize Note</span>
                      </button>
                      <button 
                         onClick={handlePolish}
                         className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        <span>Polish Grammar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <input
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="w-full text-4xl font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent mb-6"
          />
          <textarea
            value={localContent}
            onChange={handleContentChange}
            placeholder="Start typing..."
            className="w-full h-[calc(100vh-250px)] resize-none text-lg text-gray-700 leading-relaxed border-none outline-none bg-transparent placeholder:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
