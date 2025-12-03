import React from 'react';
import { Note } from '../types';
import { Plus, Search, Trash2, StickyNote } from 'lucide-react';
import Button from './Button';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="w-80 bg-gray-50 h-full flex flex-col border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/50 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
               <StickyNote size={18} />
            </div>
            MindScribe
          </h1>
          <Button
             onClick={onCreateNote}
             variant="ghost"
             size="sm"
             className="!p-2 hover:bg-primary-50 hover:text-primary-600 rounded-full"
             title="New Note"
          >
             <Plus size={20} />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-4">
            <StickyNote size={32} className="mb-2 opacity-20" />
            <p className="text-sm">No notes found.</p>
            {searchQuery && <p className="text-xs mt-1">Try a different search.</p>}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                selectedNoteId === note.id
                  ? 'bg-white border-primary-200 shadow-md shadow-primary-500/5'
                  : 'hover:bg-gray-100 border-transparent hover:border-gray-200'
              }`}
            >
              <h3 className={`font-semibold text-sm truncate mb-1 ${
                selectedNoteId === note.id ? 'text-primary-700' : 'text-gray-800'
              }`}>
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-xs text-gray-500 truncate h-4 leading-4">
                {note.content.replace(/[#*`]/g, '') || 'No additional text'}
              </p>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <button
                  onClick={(e) => onDeleteNote(note.id, e)}
                  className={`p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedNoteId === note.id ? 'opacity-100' : ''
                  }`}
                  title="Delete Note"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-center text-gray-400">
        <p>{notes.length} notes</p>
      </div>
    </div>
  );
};

export default Sidebar;
