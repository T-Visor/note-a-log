"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarProvider, useSidebarContext } from "@/components/Sidebar/SidebarContext";
import NoteEditor from "@/components/NoteEditor";
import { useNotes } from "@/hooks/useNotes";

export default function NotesApp() {
  return (
    <SidebarProvider>
      <NotesAppContent />
    </SidebarProvider>
  );
}

function NotesAppContent() {
  const {
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
  } = useNotes();

  const { isLoading } = useSidebarContext(); // Now safely within SidebarProvider
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
          Loading...
        </div>
      );
    }
    if (selectedNote) {
      return (
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
        No note selected
      </div>
    );
  })();

  return (
    <div className="flex md:flex-row h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
      <Sidebar
        folders={folders}
        notes={filteredNotes}
        selectedNoteId={selectedNote?.id || null}
        isVisible={isSidebarVisible}
        onSelectNote={setSelectedNote}
        onNewNote={handleNewNote}
        onNewFolder={handleNewFolder}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={handleRenameFolder}
        onSearch={handleSearch}
        onToggleVisibility={toggleSidebar}
        onConfirmDeleteAll={handleDeleteAllNotes}
        onDeleteSelected={handleDeleteSelectedNotes}
        onMoveNote={handleMoveNote}
        onDeleteNote={handleDeleteNote}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 h-full">{content}</div>
      </div>
    </div>
  );
}