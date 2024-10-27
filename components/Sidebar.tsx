import React, { useState } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Search, Menu, X, Moon, Sun, Folder, ChevronRight, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Note, Folder as FolderType } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface SidebarProps {
  folders: FolderType[];
  notes: Note[];
  selectedNoteId: string | null;
  isVisible: boolean;
  onSelectNote: (note: Note) => void;
  onNewNote: (folderId: string | null) => void;
  onNewFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onSearch: (query: string) => void;
  onToggleVisibility: () => void;
  onConfirmDeleteAll: () => void;
  onDeleteSelected: (ids: string[]) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders, notes, onSelectNote, onNewNote, onNewFolder, onDeleteFolder, onSearch, selectedNoteId,
  isVisible, onToggleVisibility, onConfirmDeleteAll, onDeleteSelected, onMoveNote
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');

  const handleConfirm = () => {
    onConfirmDeleteAll();
    setIsOpen(false);
  };

  const handleDeleteSelected = () => {
    onDeleteSelected(selectedNoteIds);
    setSelectedNoteIds([]);
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onNewFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  const createDefaultFolder = () => {
    if (folders.length === 0) {
      onNewFolder('Default');
    }
  };

  const handleEnterKeyForFolderNameSubmit = () => {
    // This function is only used to handle a hotkey.
    setNewFolderName(''); // clear input field
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Return if dropped outside any droppable
    if (!destination) return;

    // Return if dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Get the source and destination folder IDs
    const sourceFolderId = source.droppableId === 'root' ? null : source.droppableId;
    const destinationFolderId = destination.droppableId === 'root' ? null : destination.droppableId;

    // Move the note
    onMoveNote(draggableId, destinationFolderId);

    // Auto-expand the destination folder if it's not already expanded
    if (destinationFolderId && !expandedFolders.includes(destinationFolderId)) {
      setExpandedFolders(prev => [...prev, destinationFolderId]);
    }
  };

  const renderNotes = (folderId: string | null) => {
    createDefaultFolder();
    const folderNotes = notes.filter(note => note.folderId === folderId);

    return (
      <>
        {folderNotes.map((note, index) => (
          <Draggable key={note.id} draggableId={note.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${selectedNoteId === note.id ? 'bg-gray-200 dark:bg-gray-700' : ''
                  } ${snapshot.isDragging ? 'opacity-50' : ''
                  }`}
                onClick={() => onSelectNote(note)}
              >
                <span className="truncate flex-1 mr-2">{note.title || 'Untitled'}</span>
                <Checkbox
                  checked={selectedNoteIds.includes(note.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedNoteIds(prev => [...prev, note.id]);
                    } else {
                      setSelectedNoteIds(prev => prev.filter(id => id !== note.id));
                    }
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Button
        onClick={onToggleVisibility}
        variant="ghost"
        size="icon"
        className={`md:hidden absolute top-4 left-4 z-20 ${isVisible ? 'hidden' : ''}`}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 z-10`}>
        <div className="p-4">
          <Button onClick={onToggleVisibility} variant="ghost" size="icon" className="mb-4 w-full md:hidden">
            <X className="h-4 w-4" />
          </Button>

          <div className="flex justify-center mb-4">
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex mb-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              placeholder="New folder name"
              className="mr-2"
            />

            <Button onClick={handleCreateFolder}>
              <Folder className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4 bg-red-700 hover:bg-red-800 dark:bg-red-400 dark:hover:bg-red-500">
                Delete All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete all notes?</DialogTitle>
                <DialogDescription>
                  This will remove every note.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleConfirm}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedNoteIds.length > 0 && (
            <Button
              className="w-full mb-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedNoteIds.length})
            </Button>
          )}

          <hr className="border-t border-gray-300 dark:border-gray-600 mt-1 mb-4" />

          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search notes..."
              className="pl-8 bg-white dark:bg-gray-700"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <Droppable droppableId="root">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`p-2 rounded ${snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                >
                  {renderNotes(null)}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {folders.map(folder => (
              <div key={folder.id} className="mb-2">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  onClick={() => toggleFolderExpansion(folder.id)}
                >
                  <div className="flex items-center">
                    {expandedFolders.includes(folder.id) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <Folder className="h-4 w-4 mr-2" />
                    <span className="truncate">{folder.name}</span>
                  </div>
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
                {expandedFolders.includes(folder.id) && (
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
                          className={`p-2 rounded ${snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-gray-700' : ''
                            }`}
                        >
                          {renderNotes(folder.id)}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};