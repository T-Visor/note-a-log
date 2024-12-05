import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Note } from '@/types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;  // Add this new prop
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,  // Add this new prop
}) => {
  return (
    <>
      {notes.map((note, index) => (
        <Draggable key={note.id} draggableId={note.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded group ${
                selectedNoteId === note.id ? 'bg-gray-200 dark:bg-gray-700' : ''
              } ${
                snapshot.isDragging ? 'opacity-50' : ''
              }`}
              onClick={() => onSelectNote(note)}
            >
              <span className="truncate flex-1 mr-2">{note.title || 'Untitled'}</span>
              <div 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                      onClick={() => onDeleteNote(note.id)}
                      className="w-full flex items-center justify-start text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Note
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
};