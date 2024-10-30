import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Checkbox } from "@/components/ui/checkbox";
import type { Note } from '@/types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNoteIds: string[];
  onSelectNote: (note: Note) => void;
  onSelectNoteForDeletion: (noteId: string, selected: boolean) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  selectedNoteIds,
  onSelectNote,
  onSelectNoteForDeletion
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
              className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${
                selectedNoteId === note.id ? 'bg-gray-200 dark:bg-gray-700' : ''
              } ${
                snapshot.isDragging ? 'opacity-50' : ''
              }`}
              onClick={() => onSelectNote(note)}
            >
              <span className="truncate flex-1 mr-2">{note.title || 'Untitled'}</span>
              <Checkbox
                checked={selectedNoteIds.includes(note.id)}
                onCheckedChange={(checked) => {
                  onSelectNoteForDeletion(note.id, checked as boolean);
                }}
                onClick={(event) => event.stopPropagation()}
                className="shrink-0"
              />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
};