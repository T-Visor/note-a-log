import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import type { Note, Folder as FolderType } from '@/types';
import { SidebarHeader } from './SidebarHeader';
import { FolderItem } from './FolderItem';
import DeleteAllDialogue from "./DeleteAllDialogue";

interface SidebarProps {
  folders: FolderType[];
  notes: Note[];
  selectedNoteId: string | null;
  isVisible: boolean;
  onSelectNote: (note: Note) => void;
  onNewNote: (folderId: string | null) => void;
  onNewFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onSearch: (query: string) => void;
  onToggleVisibility: () => void;
  onConfirmDeleteAll: () => void;
  onDeleteSelected: (ids: string[]) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
  onDeleteNote: (id: string) => void;  // Add this new prop
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  notes,
  selectedNoteId,
  isVisible,
  onSelectNote,
  onNewNote,
  onNewFolder,
  onDeleteFolder,
  onRenameFolder,
  onSearch,
  onToggleVisibility,
  onConfirmDeleteAll,
  onDeleteSelected,
  onMoveNote,
  onDeleteNote,  // Add this new prop
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onNewFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const destinationFolderId = destination.droppableId === 'root' ? null : destination.droppableId;
    onMoveNote(draggableId, destinationFolderId);

    if (destinationFolderId && !expandedFolders.includes(destinationFolderId)) {
      setExpandedFolders(prev => [...prev, destinationFolderId]);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Button
        onClick={onToggleVisibility}
        variant="ghost"
        size="icon"
        className={`md:hidden absolute top-4 left-4 z-20 ${isVisible ? 'hidden' : ''}`}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 z-10`}>
        <div className="p-4">
          <Button onClick={onToggleVisibility} variant="ghost" size="icon" className="mb-4 w-full md:hidden">
            <X className="h-4 w-4" />
          </Button>

          <SidebarHeader
            newFolderName={newFolderName}
            onNewFolderNameChange={setNewFolderName}
            onCreateFolder={handleCreateFolder}
            onSearch={onSearch}
          />

          <DeleteAllDialogue
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            onConfirm={() => {
              onConfirmDeleteAll();
              setIsDeleteDialogOpen(false);
            }}
          />

          <hr className="border-t border-gray-300 dark:border-gray-600 mt-1 mb-4" />

          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {folders.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                notes={notes.filter(note => note.folderId === folder.id)}
                isExpanded={expandedFolders.includes(folder.id)}
                selectedNoteId={selectedNoteId}
                selectedNoteIds={[]}
                onToggleExpand={toggleFolderExpansion}
                onSelectNote={onSelectNote}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
                onNewNote={onNewNote}
                onSelectNoteForDeletion={onDeleteSelected}
                onDeleteNote={onDeleteNote}  // Add this new prop
              />
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};