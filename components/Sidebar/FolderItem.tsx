import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  MoreVertical,
  FileText,
  Wand
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Folder as FolderType, Note } from "@/types";
import { NoteList } from "./NoteList";
import axios from "axios";
import { useSidebarContext } from "./SidebarContext";

interface FolderItemProps {
  folder: FolderType;
  isFirstFolder?: boolean;
  notes: Note[];
  isExpanded: boolean;
  selectedNoteId: string | null;
  selectedNoteIds: string[];
  onToggleExpand: (folderId: string) => void;
  onSelectNote: (note: Note) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onNewNote: (folderId: string) => void;
  onDeleteNote: (id: string) => void;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isFirstFolder,
  notes,
  isExpanded,
  selectedNoteId,
  onToggleExpand,
  onSelectNote,
  onDeleteFolder,
  onRenameFolder,
  onNewNote,
  onDeleteNote
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(folder.name);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toast } = useToast() // toast notification pop-up
  const { setLoading, forceUpdate } = useSidebarContext();

  // Calculate if the folder should be displayed as expanded
  // First folder is ALWAYS expanded if it has notes
  const shouldBeExpanded = isFirstFolder && notes.length > 0 ? true : isExpanded;

  useEffect(() => {
    setLoading(false);
  }, []);

  // Force the first folder to be expanded if it has notes and isn't already expanded
  useEffect(() => {
    if (isFirstFolder && notes.length > 0 && !isExpanded) {
      onToggleExpand(folder.id);
    }
  }, [isFirstFolder, notes.length, isExpanded, folder.id, onToggleExpand]);

  // Button click triggers a job to run for an LLM
  // to move notes to their appropriate folders.
  const handleAutoCategorize = async () => {
    try {
      // Initialize loading animation in sidebar
      setLoading(true);

      // Use API call to organize notes in the sidebar
      await axios.get("http://localhost:8000/auto_categorize_notes");

      // Show success toast
      toast({
        title: "Success",
        description: "Completed successfully.",
      });

      forceUpdate();
    }
    catch (error) {
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error",
        description: "Couldn't auto-categorize notes. Check logs",
      });
      console.error("Error during auto-categorization for notes:", error);
    }
    finally {
      // Ensure loading state is reset regardless of success or failure
      setLoading(false);
    }
  };

  const handleNewNote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await onNewNote(folder.id);
    setIsPopoverOpen(false);  // Close the popover
    // Small delay to ensure popover closes first
    setTimeout(() => {
      if (!isExpanded) {
        onToggleExpand(folder.id);
      }
    }, 100);
  };

  const handleRename = () => {
    const newName = editingName.trim();
    if (newName && newName !== folder.name) {
      onRenameFolder(folder.id, newName);
      setEditingName(newName);
    } else {
      setEditingName(folder.name); // Reset to original name if invalid
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingName(folder.name);
    }
    e.stopPropagation();
  };

  // Reset editing name when folder name changes externally
  useEffect(() => {
    setEditingName(folder.name);
  }, [folder.name]);

  /* 
  Handles the case where a user deletes the last note in a folder.
  This will automatically close the folder once it becomes empty.
  Special case: Don't auto-close the first folder if it becomes empty.
  */
  useEffect(() => {
    if (notes.length === 0 && isExpanded && !isFirstFolder) {
      onToggleExpand(folder.id);
    }
  }, [notes.length, isExpanded, isFirstFolder, folder.id, onToggleExpand]);

  // Handle folder toggling with special handling for first folder
  const handleToggleExpand = () => {
    // If it's the first folder with notes, don't allow collapsing
    if (isFirstFolder && notes.length > 0) {
      // Ensure it's expanded
      if (!isExpanded) {
        onToggleExpand(folder.id);
      }
      // Don't allow collapsing
      return;
    }
    
    // For other folders, toggle normally
    onToggleExpand(folder.id);
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded group ${isFirstFolder ? "font-bold" : ""}`}
        onClick={handleToggleExpand}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          <Folder className="h-4 w-4 mr-4" />
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="h-6 py-0 px-1 text-sm dark:focus:ring-0 border-gray-300 focus:ring-0 dark:border-gray-600"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <span className="truncate w-0 flex-1">{folder.name}</span>
          )}
          {(() => {
            if (notes.length > 0 && shouldBeExpanded) {
              return <ChevronDown className="h-4 w-4 mr-2" />;
            }
            else if (notes.length > 0 && !shouldBeExpanded) {
              return <ChevronRight className="h-4 w-4 mr-2" />;
            }
            else {
              return <span className="h-4 w-4 mr-2 text-gray-400" />;
            }
          })()}
        </div>
        <div
          className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1">
              {isFirstFolder ? (
                <>
                  <Button
                    onClick={handleNewNote}
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>New Note</span>
                  </Button>
                  <Button
                    onClick={handleAutoCategorize}
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center justify-start"
                  >
                    <Wand className="w-4 h-4 mr-2" />
                    <span className="font-bold">Auto-categorize</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleNewNote}
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>New Note</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-start"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename Folder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteFolder(folder.id)}
                    className="w-full flex items-center justify-start text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Folder
                  </Button>
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {shouldBeExpanded && (
        <div className="relative before:absolute before:top-0 before:bottom-0 before:left-[-0.33rem] before:w-px before:bg-gray-300 dark:before:bg-gray-600 ml-4">
          <div className="pl-4">
            <NoteList
              notes={notes.filter(note => note.folderId === folder.id)}
              selectedNoteId={selectedNoteId}
              onSelectNote={onSelectNote}
              onDeleteNote={onDeleteNote}
            />
          </div>
        </div>
      )}
    </div>
  );
};