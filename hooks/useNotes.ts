import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder } from '@/types';

export const useNotes = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const savedFolders = localStorage.getItem('folders');
    const savedNotes = localStorage.getItem('notes');
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [folders, notes]);

  const handleNewFolder = (name: string) => {
    const newFolder: Folder = { id: uuidv4(), name };
    setFolders([...folders, newFolder]);
  };

  const handleRenameFolder = (id: string, newName: string) => {
    // Validate inputs
    if (!newName.trim()) {
      console.warn('Folder name cannot be empty');
      return;
    }
  
    setFolders(prevFolders => 
      prevFolders.map(folder =>
        folder.id === id
          ? { ...folder, name: newName.trim() }
          : folder
      )
    );
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(folder => folder.id !== id));
    // Move notes from deleted folder to root
    setNotes(notes.map(note => note.folderId === id ? { ...note, folderId: null } : note));
  };

  const handleNewNote = (folderId: string | null = null) => {
    const newNote: Note = { id: uuidv4(), title: '', content: '', folderId };
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

  const handleMoveNote = (noteId: string, targetFolderId: string | null) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, folderId: targetFolderId } : note
    ));
  };

  return {
    folders,
    notes,
    selectedNote,
    setSelectedNote,
    handleNewFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleDeleteSelectedNotes,
    handleDeleteAllNotes,
    handleMoveNote,
  };
};