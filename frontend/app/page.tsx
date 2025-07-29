"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarProvider, useSidebarContext } from "@/components/Sidebar/SidebarContext";
import NoteEditor from "@/components/NoteEditor";
import { useNotes } from "@/hooks/useNotes";
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";


// This de-structuring is necessary to effectively use the 'useSidebarContext' hook.
const NotesApp = () => {
  return (
    <SidebarProvider>
      <NotesAppContent />
    </SidebarProvider>
  );
}

const NotesAppContent = () => {
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

  const { theme, setTheme } = useTheme();
  const { isLoading } = useSidebarContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
          Loading...
        </div>
      );
    }
    else if (selectedNote) {
      return (
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      );
    }
    else {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
          No note selected
        </div>
      );
    }
  })();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        notes={notes}
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
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with theme toggle */}
        <header className="flex items-center justify-end border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant="ghost"
            size="icon"
            className="ml-auto mt-2 mr-2"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 pb-4 h-full">
            {content}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default NotesApp;