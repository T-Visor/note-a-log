import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { Menu, X, GripVertical, ChevronLeft, PanelRightClose } from "lucide-react";
import type { Note, Folder as FolderType } from '@/types';
import { SidebarHeader } from './SidebarHeader';
import { FolderItem } from './FolderItem';
import DeleteAllDialogue from "./DeleteAllDialogue";
import { Skeleton } from "@/components/ui/skeleton"
import { useSidebarContext } from "./SidebarContext";

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
  onDeleteNote: (id: string) => void;
}

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;
const COLLAPSED_WIDTH = 0;

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
  onDeleteNote,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const { isLoading } = useSidebarContext();
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

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

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing, resize, stopResizing]);

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  if (isLoading) {
    return (
      <div
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed inset-y-0 left-0 bg-gray-100 dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 z-10`}
      >
        <div className="p-4 space-y-4">
          <h1 className="pt-10 flex items-center space-x-2">
            <strong>Auto-categorizing notes</strong>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </h1>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Mobile menu button */}
      <Button
        onClick={onToggleVisibility}
        variant="ghost"
        size="icon"
        className={`md:hidden absolute top-4 left-4 z-20 ${isVisible ? 'hidden' : ''}`}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop collapse/expand button */}
      <Button
        onClick={toggleDesktopSidebar}
        variant="ghost"
        size="icon"
        className="hidden md:flex absolute top-4 left-4 z-20"
      >
        {isDesktopCollapsed ? (
          <PanelRightClose className="h-4 w-4"/>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div
        style={{ 
          width: isDesktopCollapsed ? COLLAPSED_WIDTH : `${sidebarWidth}px`,
          transition: 'width 300ms ease-in-out'
        }}
        className={`fixed inset-y-0 left-0 bg-gray-100 dark:bg-gray-800 overflow-hidden transform ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 z-10`}
      >
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

          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 40vh)' }}>
            {folders.map((folder, index) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                isFirstFolder={index === 0}
                notes={notes.filter(note => note.folderId === folder.id)}
                isExpanded={expandedFolders.includes(folder.id)}
                selectedNoteId={selectedNoteId}
                selectedNoteIds={[]}
                onToggleExpand={toggleFolderExpansion}
                onSelectNote={onSelectNote}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
                onNewNote={onNewNote}
                onDeleteNote={onDeleteNote}
              />
            ))}
          </div>
        </div>

        {/* Resize Handle */}
        {!isDesktopCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-gray-300 dark:hover:bg-gray-600"
            onMouseDown={startResizing}
          >
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};