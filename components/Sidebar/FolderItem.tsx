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
  onDeleteNote: (id: string) => void;  // Add this new prop
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
  //setLoading(false);

  useEffect(() => {
    setLoading(false);
  }, []);
  

  // Button click triggers a job to run for an LLM
  // to move notes to their appropriate folders.
  // TODO: this should eventually be moved to the 'useNotes' file.
  const handleAutoCategorize = async () => {
    try {
      // Initialize loading animation in sidebar
      setLoading(true);

      // Use API call to organize notes in the sidebar
      await axios.get("http://localhost:8000/auto_categorize_notes");
      //await axios.get("http://0.0.0.0:8000/auto_categorize_notes");

      // Show success toast
      toast({
        title: "Success",
        description: "Completed successfully.",
      });

      // Refresh the page after the categorization process is complete
      // as this displays the updated interface
      //window.location.reload();
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
  */
  useEffect(() => {
    if (notes.length === 0 && isExpanded) {
      onToggleExpand(folder.id);
    }
  }, [notes.length]);

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded group ${isFirstFolder ? "font-bold" : ""}`}
        onClick={() => onToggleExpand(folder.id)}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          {(() => {
            if (notes.length > 0 && isExpanded) {
              return <ChevronDown className="h-4 w-4 mr-2" />;
            }
            else if (notes.length > 0 && !isExpanded) {
              return <ChevronRight className="h-4 w-4 mr-2" />;
            }
            else {
              return <span className="h-4 w-4 mr-2 text-gray-400" />;
            }
          })()}
          <Folder className="h-4 w-4 mr-2" />
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
              )
              }
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {isExpanded && (
        <div className="ml-6">
          <div className="p-2 rounded">
            <NoteList
              notes={notes.filter(note => note.folderId === folder.id)}
              selectedNoteId={selectedNoteId}
              onSelectNote={onSelectNote}
              onDeleteNote={onDeleteNote} // Add this new prop
            />
          </div>
        </div>
      )}
    </div>
  );
};