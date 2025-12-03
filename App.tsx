import React, { useState, useEffect, useMemo } from 'react';
import { Note } from './types';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'mindscribe-notes';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // If no note is selected on load but notes exist, select the first one (on desktop)
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0 && window.innerWidth >= 768) {
      setSelectedNoteId(notes[0].id);
    }
  }, []);

  const createNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setIsMobileMenuOpen(false); // Close sidebar on mobile
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      const newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        // On desktop, try to select the next available note
        if (newNotes.length > 0 && window.innerWidth >= 768) {
            setSelectedNoteId(newNotes[0].id);
        } else {
            setIsMobileMenuOpen(true);
        }
      }
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const lowerQuery = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }, [notes, searchQuery]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Sidebar - responsive visibility */}
      <div className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-shrink-0 h-full
        ${selectedNoteId && !isMobileMenuOpen ? 'hidden md:flex' : 'w-full md:w-auto'}
      `}>
        <Sidebar
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(id) => {
            setSelectedNoteId(id);
            setIsMobileMenuOpen(false);
          }}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Editor - responsive visibility */}
      <div className={`flex-1 h-full relative ${!selectedNoteId && 'hidden md:flex'}`}>
        {selectedNote ? (
          <Editor
            note={selectedNote}
            onUpdate={updateNote}
            onClose={() => {
                setSelectedNoteId(null);
                setIsMobileMenuOpen(true);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 text-gray-400 p-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 text-center border border-gray-100 max-w-sm w-full">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                <Plus size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create a new note</h2>
              <p className="text-gray-500 mb-6 text-sm">
                Capture your ideas, generate titles with AI, and polish your writing instantly.
              </p>
              <button
                onClick={createNote}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 active:scale-95"
              >
                Create Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
