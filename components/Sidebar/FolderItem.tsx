import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Pencil, 
  Trash2, 
  MoreVertical 
} from "lucide-react";
import { Droppable } from 'react-beautiful-dnd';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Folder as FolderType, Note } from '@/types';
import { NoteList } from './NoteList';

interface FolderItemProps {
  folder: FolderType;
  notes: Note[];
  isExpanded: boolean;
  selectedNoteId: string | null;
  selectedNoteIds: string[];
  onToggleExpand: (folderId: string) => void;
  onSelectNote: (note: Note) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onNewNote: (folderId: string) => void;
  onSelectNoteForDeletion: (noteId: string, selected: boolean) => void;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  notes,
  isExpanded,
  selectedNoteId,
  selectedNoteIds,
  onToggleExpand,
  onSelectNote,
  onDeleteFolder,
  onRenameFolder,
  onNewNote,
  onSelectNoteForDeletion
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(folder.name);

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
  React.useEffect(() => {
    setEditingName(folder.name);
  }, [folder.name]);

  return (
    <div className="mb-2">
      <div
        className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded group"
        onClick={() => !isEditing && onToggleExpand(folder.id)}
      >
        <div className="flex items-center flex-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <Folder className="h-4 w-4 mr-2" />
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="h-6 py-0 px-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <span className="truncate">{folder.name}</span>
          )}
        </div>
        <div 
          className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" 
          onClick={(e) => e.stopPropagation()}
        >
          <Popover>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-start"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteFolder(folder.id)}
                className="w-full flex items-center justify-start text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {isExpanded && (
        <div className="ml-6">
          <Button
            onClick={() => onNewNote(folder.id)}
            variant="ghost"
            size="md"
            className="mb-2"
          >
            New Note
          </Button>
          <Droppable droppableId={folder.id}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`p-2 rounded ${
                  snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              >
                <NoteList
                  notes={notes.filter(note => note.folderId === folder.id)}
                  selectedNoteId={selectedNoteId}
                  selectedNoteIds={selectedNoteIds}
                  onSelectNote={onSelectNote}
                  onSelectNoteForDeletion={onSelectNoteForDeletion}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </div>
  );
};