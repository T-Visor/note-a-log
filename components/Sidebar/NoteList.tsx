import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, FolderUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import type { Note } from '@/types';
import { useNotes } from "@/hooks/useNotes";
import { useSidebarContext } from "./SidebarContext";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
}) => {
  const { folders, handleMoveNote } = useNotes();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const { forceUpdate } = useSidebarContext();

  return (
    <>
      {[...notes].reverse().map((note) => (
        <div
          key={note.id}
          className={`flex items-center justify-between cursor-pointer p-1 py-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded group ${selectedNoteId === note.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
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
                  className="h-8 w-6"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (setCurrentNote(note), forceUpdate())}
                      className="w-full flex items-center justify-start"
                    >
                      <FolderUp className="h-4 w-4 mr-2" />
                      Move Note
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 border rounded-md shadow-lg">
                    <Command>
                      <CommandInput placeholder="Search folders..." className="mb-2" />
                      <CommandList>
                        {folders.map((folder) => (
                          <CommandItem
                            key={folder.id}
                            onSelect={() => {
                              currentNote && handleMoveNote(currentNote, folder.id);
                              setCurrentNote(null);
                              forceUpdate();
                            }}
                          >
                            {folder.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
      ))}
    </>
  );
};