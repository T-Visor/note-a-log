import axios from "axios"
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Note, Folder } from "@/types";
import { useSidebarContext } from "@/components/Sidebar/SidebarContext";

export const useNotes = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { updateCounter } = useSidebarContext();

  // Load folders/notes during start-up
  useEffect(() => {
    async function fetchData() {
      // Fetch saved folders from API
      const responseWithFolders = await axios.get('api/folders');
      const foldersData = responseWithFolders.data;
      setFolders(foldersData);

      // Fetch saved notes from API
      const responseWithNotes = await axios.get('api/notes');
      const notesData = responseWithNotes.data.map((note: Note) => ({
        ...note,
        folderId: note.folderId ?? null, // Ensure `null` for `undefined` or missing `folderId`
      }));
      setNotes(notesData);
    }
    fetchData();
  }, [updateCounter]);

  // === FOLDERS OPERATIONS ===

  const handleNewFolder = async (name: string) => {
    // Ensure the folder name is unique
    const existingFolder = folders.find((folder) => folder.name === name);
    if (existingFolder) {
      alert("Folder name must be unique.");
      return;
    }

    // Create a new folder with a unique ID
    const newFolder: Folder = { id: uuidv4(), name };

    // Update local state with the new folder
    setFolders((existingFolders) => [...existingFolders, newFolder]);

    try {
      // Persist the new folder to the backend
      await axios.post('/api/folders', newFolder);
    }
    catch (error) {
      // Log error and revert state if API fails
      console.error('Error saving the folder:', error);
      setFolders((existingFolders) =>
        existingFolders.filter((folder) => folder.id !== newFolder.id)
      );
      throw error;
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      // Get notes associated with the folder to delete them
      const associatedNotes = notes.filter((note) => note.folderId === id);

      // Delete each associated note using the hook 'handleDeleteNote'
      for (const note of associatedNotes) {
        await handleDeleteNote(note.id);
      }

      // Send DELETE request to delete the folder via the API
      await axios.delete(`/api/folders/${id}`);

      // Remove the folder referenced by the ID from local folder list after successful deletion
      setFolders((existingFolders) =>
        existingFolders.filter((folder) => folder.id !== id)
      );
    }
    catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    // Ensure non-empty folder name
    if (!newName.trim()) {
      console.warn('Folder name cannot be empty');
      return;
    }

    try {
      // Persist updated folder name to the backend
      await axios.put(`/api/folders/${id}`, {
        name: newName.trim(),
      });

      // Update local state with new folder name
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === id ? { ...folder, name: newName.trim() } : folder
        )
      );
    }
    catch (error) {
      console.error(error);
    }
  };

  // === NOTES OPERATIONS ===

  const handleNewNote = async (folderId: string | null = null) => {
    // Create new empty note
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      folderId,
      embeddingsId: ''
    };

    try {
      // Persist new (empty) note to the backend
      await axios.post('api/notes', newNote);

      // Update local state with new note
      setNotes((existingNotes) => [...existingNotes, newNote]);
      setSelectedNote(newNote);
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleSaveNote = async (updatedNote: Note): Promise<void> => {
    try {
      let noteToSave: Note | null = null;
      let currentNote: Note | undefined;
  
      // Optimistically update local state
      setNotes((existingNotes) => {
        currentNote = existingNotes.find(note => note.id === updatedNote.id);
  
        if (!currentNote) {
          console.error(`Note with id ${updatedNote.id} not found`);
          return existingNotes;
        }
  
        noteToSave = {
          ...updatedNote,
          folderId: currentNote.folderId,
          embeddingsId: currentNote.embeddingsId
        };
  
        return existingNotes.map((note) =>
          note.id === updatedNote.id ? noteToSave! : note
        );
      });
  
      if (!noteToSave || !currentNote) return;
  
      setSelectedNote(noteToSave);
  
      if (noteToSave.embeddingsId) {
        await axios.post('http://localhost:8000/update_note_embeddings', {
          embeddings_ID: noteToSave.embeddingsId,
          note_contents: noteToSave.content
        });
      } else {
        const response = await axios.post('http://localhost:8000/create_initial_note_embeddings', {
          note_contents: noteToSave.content
        });
  
        noteToSave.embeddingsId = response.data.message;
  
        // Optional: Update state again with new embeddingsId
        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteToSave!.id ? { ...note, embeddingsId: noteToSave!.embeddingsId } : note
          )
        );
      }
  
      await axios.put(`/api/notes/${updatedNote.id}`, noteToSave);
  
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred while saving the note';
  
      console.error('Error saving note:', errorMessage);
      throw error;
    }
  };
  
  const handleDeleteNote = async (id: string) => {
    try {
      // 1. Find the note before deleting it
      const noteToDelete = notes.find(note => note.id === id);
  
      if (!noteToDelete) {
        console.warn(`Note with id ${id} not found.`);
        return;
      }
  
      const { embeddingsId } = noteToDelete;
  
      // 2. Delete the note via API
      await axios.delete(`/api/notes/${id}`);
  
      // 3. Delete associated embedding if it exists
      if (embeddingsId) {
        await axios.post('http://localhost:8000/delete_note_embeddings', {
          embeddings_ID: embeddingsId
        });
      }
  
      // 4. Update local state
      setNotes(notes.filter(note => note.id !== id));
      setSelectedNote(null);
    } catch (error) {
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

  const handleMoveNote = async (note: Note, targetFolderId: string | null) => {
    const updatedNote = { ...note, folderId: targetFolderId };

    setNotes((existingNotes) =>
      existingNotes.map((n) => n.id === note.id ? updatedNote : n)
    );

    if (selectedNote?.id === note.id) {
      setSelectedNote(updatedNote);
    }

    try {
      await axios.put(`/api/notes/${note.id}`, updatedNote);
    } catch (error) {
      console.error('Error moving note:', error);
      // Optionally revert
      setNotes((existingNotes) =>
        existingNotes.map((n) => n.id === note.id ? note : n)
      );
    }
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