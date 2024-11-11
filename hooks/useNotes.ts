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

  const handleSaveNote = async (updatedNote: Note) => {
    try{
      // Update the note contents via API.
      await axios.put(`/api/notes/${updatedNote.id}`, updatedNote);

      // Update local state with the updated note.
      setNotes((existingNotes) =>
        existingNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      setSelectedNote(updatedNote);
    }
    catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      // Delete the note via API.
      await axios.delete(`/api/notes/${id}`);

      // Update local state by removing the deleted note.
      setNotes(notes.filter(note => note.id !== id));
      setSelectedNote(null);
    }
    catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleDeleteSelectedNotes = async (ids: string[]) => {
    try {
      // Call handleDeleteNote for each ID and wait for all to complete
      await Promise.all(ids.map((id) => handleDeleteNote(id)));
  
      // After all deletions are completed, update the local notes state
      setNotes((existingNotes) => existingNotes.filter((note) => !ids.includes(note.id)));
      setSelectedNote(null);
    } 
    catch (error) {
      console.error('Error deleting selected notes:', error);
    }
  };

  const handleDeleteAllNotes = async () => {
    try {
      // Call handleDeleteNote for each note and wait for all to complete.
      await Promise.all(notes.map((note) => handleDeleteNote(note.id)));

      // After all deletions are completed, clear the local notes state.
      setNotes([]);
      setSelectedNote(null);
    }
    catch (error) {
      console.error('Error deleting all notes:', error);
    }
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