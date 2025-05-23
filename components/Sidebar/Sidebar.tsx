import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, PanelRightOpen, PanelRightClose } from "lucide-react";
import type { Note, Folder as FolderType } from '@/types';
import { SidebarHeader } from './SidebarHeader';
import { FolderItem } from './FolderItem';
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

const COLLAPSED_WIDTH = 0;
const SIDEBAR_WIDTH = 18.75;

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
  onDeleteNote,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const { isLoading } = useSidebarContext();
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  if (isLoading) {
    return (
      <div
        style={{ width: `${SIDEBAR_WIDTH}rem` }}
        className={`fixed inset-y-0 left-0 bg-gray-100 dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${isVisible ? "translate-x-0" : "-translate-x-full"
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
  else {
    return (
      <>
        {/* Mobile menu button */}
        <Button
          onClick={onToggleVisibility}
          variant="ghost"
          size="icon"
          className={`md:hidden absolute top-2 left-2 z-20 ${isVisible ? 'hidden' : ''}`}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Desktop collapse/expand button */}
        <Button
          onClick={toggleDesktopSidebar}
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute top-2 left-0.5 z-20"
        >
          {isDesktopCollapsed ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>

        <div
          style={{
            width: isDesktopCollapsed ? COLLAPSED_WIDTH : `${SIDEBAR_WIDTH}rem`,
            transition: 'width 300ms ease-in-out'
          }}
          className={`text-sm fixed inset-y-0 left-0 border-r bg-gray-100 dark:bg-gray-800 overflow-hidden transform ${isVisible ? 'translate-x-0' : '-translate-x-full'
            } md:relative md:translate-x-0 z-10`}
        >
          <div className="flex flex-col h-full p-2">
            <Button onClick={onToggleVisibility} variant="ghost" size="icon" className="mb-4 w-full md:hidden">
              <X className="h-4 w-4" />
            </Button>

            <SidebarHeader
              onCreateFolder={onNewFolder}
              onSearch={onSearch}
              onNewNote={onNewNote}
              firstFolderId={folders[0]?.id}
            />

            <div className="flex-1 overflow-y-auto space-y-1 mt-2">
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
        </div>
      </>
    );
  }
};