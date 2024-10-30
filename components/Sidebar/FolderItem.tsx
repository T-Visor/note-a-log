import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Droppable } from 'react-beautiful-dnd';
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
    if (editingName.trim() && editingName !== folder.name) {
      onRenameFolder(folder.id, editingName.trim());
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

  return (
    <div className="mb-2">
      <div
        className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => onToggleExpand(folder.id)}
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
            />
          ) : (
            <span className="truncate">{folder.name}</span>
          )}
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="mr-1"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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