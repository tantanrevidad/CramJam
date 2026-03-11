import React, { useMemo } from 'react';
import { Deck, Question } from '../types';
import { Library, Play, Trash2, Layers, BookOpen } from 'lucide-react';

interface DashboardProps {
  decks: Deck[];
  onStudyDeck: (questions: Question[]) => void;
  onDeleteDeck: (id: string) => void;
  onCreateNew: () => void;
}

export function Dashboard({ decks, onStudyDeck, onDeleteDeck, onCreateNew }: DashboardProps) {
  
  if (decks.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-6">
          <Library className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">No Decks Yet</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Upload a PDF and generate your first set of flashcards to start building your library.
        </p>
        <button
          onClick={onCreateNew}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Create New Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
          <Library className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          My Decks
        </h2>
        <button
          onClick={onCreateNew}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          + New Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {decks.map(deck => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            onStudy={onStudyDeck} 
            onDelete={() => onDeleteDeck(deck.id)} 
          />
        ))}
      </div>
    </div>
  );
}

interface DeckCardProps {
  key?: string;
  deck: Deck;
  onStudy: (q: Question[]) => void;
  onDelete: () => void;
}

function DeckCard({ deck, onStudy, onDelete }: DeckCardProps) {
  // Group questions by chapter
  const subdecks = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    deck.questions.forEach(q => {
      const chapter = q.chapter || 'General';
      if (!groups[chapter]) groups[chapter] = [];
      groups[chapter].push(q);
    });
    // Sort chapters alphabetically
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [deck.questions]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">{deck.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {deck.questions.length} total cards • {new Date(deck.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={onDelete}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
          title="Delete Deck"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 flex-grow bg-slate-50/50 dark:bg-slate-800/50">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Chapters (Subdecks)
        </h4>
        <div className="space-y-3">
          {subdecks.map(([chapter, questions]) => (
            <div key={chapter} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex-grow pr-4">
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{chapter}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{questions.length} cards</p>
              </div>
              <button
                onClick={() => onStudy(questions)}
                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-lg transition-colors flex-shrink-0"
                title="Study this chapter"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <button
          onClick={() => onStudy(deck.questions)}
          className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          <span>Study Entire Deck</span>
        </button>
      </div>
    </div>
  );
}
