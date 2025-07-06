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
  Sparkles,
  Plus
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
import RecommendedCategoriesDialog from "@/components/RecommendedCategoriesDialog"
import { SuggestedNoteMove } from "@/types";
import { useNotes } from "@/hooks/useNotes";

interface FolderItemProps {
  folder: FolderType;
  isFirstFolder?: boolean;
  notesInThisFolder: Note[];
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

export const FirstFolderActions: React.FC<{ shouldBeDisabled: boolean }> = ({ shouldBeDisabled }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedNoteMove[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);

  const fetchNotes = async () => {
    // Fetch saved notes from API
    const responseWithNotes = await axios.get('api/notes');
    const notesData = responseWithNotes.data.map((note: Note) => ({
      ...note,
      folderId: note.folderId ?? null, // Ensure `null` for `undefined` or missing `folderId`
    }));
    setNotes(notesData);
  }

  const fetchFolders = async () => {
    const responseWithFolders = await axios.get("api/folders");
    const foldersData = responseWithFolders.data;
    setFolders(foldersData);
  }

  const handleClick = async () => {
    setIsLoading(true);
    await fetchNotes();
    try {
      const res = await fetch("/api/categorize-note", { method: "POST" });
      const data = await res.json();
      setAiSuggestions(data.suggestions);
      setIsDialogOpen(true);
    } 
    catch (err) {
      console.error(err);
    } 
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center mb-2">
      <Button
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={handleClick}
        disabled={shouldBeDisabled || isLoading}
        variant="ghost"
      >
        <Sparkles className="w-4 h-4 mr-1" />
        <span className="text-sm">Organize with AI</span>
      </Button>
      <RecommendedCategoriesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        allNotes={notes} // ✅ Always up-to-date
        allFolders={folders}
        suggestions={aiSuggestions}
      />
    </div>
  );
};

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isFirstFolder,
  notesInThisFolder: notesInThisFolder,
  isExpanded,
  selectedNoteId,
  onToggleExpand,
  onSelectNote,
  onDeleteFolder,
  onRenameFolder,
  onNewNote,
  onDeleteNote
}) => {
  // If this is the special first folder, render only its notes without the folder container
  if (isFirstFolder) {
    return (
      <>
        <FirstFolderActions
          shouldBeDisabled={notesInThisFolder.length === 0}
        />
        <NoteList
          notes={notesInThisFolder}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          onDeleteNote={onDeleteNote}
        />
        {/*notes.length > 0 && <div className="h-px bg-gray-300 dark:bg-gray-500 mt-1"></div>*/}
      </>
    );
  }

  // Regular folder implementation starts here
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(folder.name);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { setLoading } = useSidebarContext();

  useEffect(() => {
    setLoading(false);
  }, []);

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
    if (notesInThisFolder.length === 0 && isExpanded) {
      onToggleExpand(folder.id);
    }
  }, [notesInThisFolder.length, isExpanded, folder.id, onToggleExpand]);

  return (
    <div className="mb-1">
      <div
        className="flex items-center p-1 py-0 justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded group"
        onClick={() => onToggleExpand(folder.id)}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          <Folder className="h-4 w-4 mr-4" />
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="h-6 px-1 text-sm focus-visible:ring-0 border-gray-300 dark:border-gray-600"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <span className="truncate w-0 flex-1">{folder.name}</span>
          )}
          {(() => {
            if (notesInThisFolder.length > 0 && isExpanded) {
              return <ChevronDown className="h-4 w-4" />;
            }
            else if (notesInThisFolder.length > 0 && !isExpanded) {
              return <ChevronRight className="h-4 w-4" />;
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
                className="h-8 w-6"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1">
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
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {isExpanded && (
        <div className="relative before:absolute before:top-0 before:bottom-0 before:left-[-0.33rem] before:w-px before:bg-gray-300 dark:before:bg-gray-600 ml-4">
          <div className="pl-4">
            <NoteList
              notes={notesInThisFolder}
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
