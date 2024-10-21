import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '@/types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleNewNote = () => {
    const newNote = { id: uuidv4(), title: '', content: '' };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleSaveNote = (updatedNote: Note) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    setSelectedNote(updatedNote);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    setSelectedNote(null);
  };

  const handleDeleteSelectedNotes = (ids: string[]) => {
    setNotes(notes.filter(note => !ids.includes(note.id)));
    setSelectedNote(null);
  };

  const handleDeleteAllNotes = () => {
    setNotes([]);
    setSelectedNote(null);
  };

  return {
    notes,
    selectedNote,
    setSelectedNote,
    handleNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleDeleteSelectedNotes, // Export the new function
    handleDeleteAllNotes,
  };
};
