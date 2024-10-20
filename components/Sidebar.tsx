import React, { useState } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Search, Menu, X, Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Note } from '@/types';

interface SidebarProps {
  notes: Note[]
  selectedNoteId: string | null
  isVisible: boolean
  onSelectNote: (note: Note) => void
  onNewNote: () => void
  onSearch: (query: string) => void
  onToggleVisibility: () => void
  onConfirmDeleteAll: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes, onSelectNote, onNewNote, onSearch, selectedNoteId, isVisible, onToggleVisibility,
  onConfirmDeleteAll
}) => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirmDeleteAll();
    setIsOpen(false); // Close the dialog
  };

  return (
    <>
      {/* Toggle Button for Sidebar */}
      <Button
        onClick={onToggleVisibility}
        variant="ghost"
        size="icon"
        className={`md:hidden absolute top-4 left-4 z-20 ${isVisible ? 'hidden' : ''}`}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-10`}>
        <div className="p-4">
          {/* Close Button */}
          <Button onClick={onToggleVisibility} variant="ghost" size="icon" className="mb-4 w-full md:hidden">
            <X className="h-4 w-4" />
          </Button>

          {/* Dark Mode Toggle */}
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

          {/* New Note Button */}
          <Button onClick={onNewNote} className="w-full mb-4">New Note</Button>

          {/* Delete All Button with confirmation dialogu */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="w-full">
              <Button className="w-full mb-4 bg-red-700 dark:bg-red-400">Delete All</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete all notes?</DialogTitle>
                <DialogDescription>
                  This will remove every note.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="submit" onClick={handleConfirm}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Separator Line */}
          <hr className="border-t border-gray-300 dark:border-gray-600 mt-1 mb-4" />

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search notes..."
              className="pl-8 bg-white dark:bg-gray-700"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* Notes List */}
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {notes.map(note => (
              <div
                key={note.id}
                className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${selectedNoteId === note.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                onClick={() => {
                  onSelectNote(note);
                  onToggleVisibility(); // Close sidebar on mobile after selecting a note
                }}
              >
                <span>{note.title || 'Untitled'}</span>
                <Checkbox className="ml-4" /> {/* Checkbox aligned to the right */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}