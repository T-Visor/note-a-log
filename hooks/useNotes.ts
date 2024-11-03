import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder } from '@/types';
import axios from 'axios'

export const useNotes = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Load folders/notes during start-up.
  useEffect(() => {
    async function fetchData() {
      // Fetch saved folders from API.
      const responseWithFolders = await axios.get('api/folders');
      const foldersData = responseWithFolders.data;
      setFolders(foldersData);

      // Fetch saved notes from API.
      const responseWithNotes = await axios.get('api/notes');
      const notesData = responseWithNotes.data;
      setNotes(notesData);
    }
    fetchData();
  }, []); 

  // === FOLDERS OPERATIONS ===

  const handleNewFolder = async (name: string) => {
    // Add new folder to local list.
    const newFolder: Folder = { id: uuidv4(), name };
    setFolders((existingFolders) => [...existingFolders, newFolder]);

    // Persist new folder using API.
    await axios.post('/api/folders', newFolder);
  };
  
  const handleDeleteFolder = async (id: string) => {
    try {
      // Send DELETE request to API.
      await axios.delete(`/api/folders/${id}`)

      // Remove the folder referenced by the ID from local folder list after successful deletion.
      setFolders((existingFolders) => existingFolders.filter((folder) => folder.id !== id));

      // Set the folderIDs for any notes which were associated with the deleted folder to null.
      setNotes((existingNotes) => 
        existingNotes.map((note) => (note.folderId === id ? { ...note, folderId: null} : note))
      );
    } catch (error) {
      console.error(error);
    }
  }

  const handleRenameFolder = async (id: string, newName: string) => {
    // Validate inputs
    if (!newName.trim()) {
      console.warn('Folder name cannot be empty');
      return;
    }
  
    try {
      // Send update request to database.
      await axios.put(`/api/folders/${id}`, {
        name: newName.trim(),
      });
  
      // Update name to local folder after successful update.
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === id ? { ...folder, name: newName.trim() } : folder
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // === NOTES OPERATIONS ===

  const handleNewNote = async (folderId: string | null = null) => {
    // Add new note to local list.
    const newNote: Note = { id: uuidv4(), title: '', content: '', folderId };
    setNotes((existingNotes) => [...existingNotes, newNote]);
    setSelectedNote(newNote);

    // Persist new (empty) note using API.
    await axios.post('api/notes', newNote);
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
    handleDeleteFolder,
    handleRenameFolder,
    handleNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleDeleteSelectedNotes,
    handleDeleteAllNotes,
    handleMoveNote,
  };
};