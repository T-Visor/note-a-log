"use client"

import { useState, ReactNode } from "react"
import { Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { useEffect, useRef } from "react"
import { SuggestedNoteMove, Note } from "@/types"
import { useNotes } from "@/hooks/useNotes"

type NoteCategorizationInfo = {
  id: string
  title: string
  category: string
  isEditingCategory: boolean
}

interface RecommendedCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allNotes: Note[];
  suggestions: SuggestedNoteMove[];
}

const RecommendedCategoriesDialog = ({
  open,
  onOpenChange,
  allNotes,
  suggestions,
}: RecommendedCategoriesDialogProps) => {
  const notes = allNotes; // assumes notes are fetched here
  const [notesInfo, setNotesInfo] = useState<NoteCategorizationInfo[]>([]);

  // Derive notesInfo when suggestions and notes are ready
  useEffect(() => {
    console.log("Suggestions:", suggestions);
    console.log("Notes:", notes);
    if (!suggestions.length || !notes.length) return;

    const suggestion = suggestions[0];
    const matchedNote = notes.find((note) => note.id === suggestion.noteId);

    if (matchedNote) {
      setNotesInfo([
        {
          id: matchedNote.id,
          title: matchedNote.title,
          category: suggestion.suggestedFolder.name,
          isEditingCategory: false,
        },
      ]);
    }
  }, [suggestions, notes]);

  const categories = Array.from(new Set(notesInfo.map((n) => n.category)))

  const handleEditCategory = (id: string) => {
    setNotesInfo(notesInfo.map((note) =>
      note.id === id ? { ...note, isEditingCategory: !note.isEditingCategory } : note
    ))
  }

  const handleCategoryChange = (id: string, newCategory: string) => {
    setNotesInfo(notesInfo.map((note) =>
      note.id === id ? { ...note, category: newCategory, isEditingCategory: false } : note
    ))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[75%]">
          <DialogHeader>
            <DialogTitle>AI Recommendations</DialogTitle>
          </DialogHeader>

          {notesInfo.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 px-2">Loading recommendations...</div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-[1fr_1fr] items-center gap-2 font-medium text-sm text-muted-foreground px-1">
                <div>Note Title</div>
                <div>Recommended Folder</div>
              </div>
              <div className="space-y-3">
                {notesInfo.map((note) => (
                  <div key={note.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <div className="font-medium">{note.title}</div>
                    {note.isEditingCategory ? (
                      <ComboboxEditor
                        value={note.category}
                        options={categories}
                        onSelect={(newVal) => handleCategoryChange(note.id, newVal)}
                      />
                    ) : (
                      <div>{note.category}</div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(note.id)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit category</span>
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Accept
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 

const ComboboxEditor = ({
  value,
  options,
  onSelect,
}: {
  value: string
  options: string[]
  onSelect: (val: string) => void
}) => {
  const [input, setInput] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = options.filter((item) =>
    item.toLowerCase().includes(input.toLowerCase())
  )

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="relative w-full">
      <Command className="border rounded-md">
        <CommandInput
          ref={inputRef}
          value={input}
          onValueChange={setInput}
          placeholder="Edit or create category"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSelect(input)
            } else if (e.key === "Escape") {
              onSelect(value) // cancel
            }
          }}
        />
        <CommandEmpty>No results. Press Enter to create.</CommandEmpty>
        <CommandGroup>
          {filtered.map((item) => (
            <CommandItem
              key={item}
              onSelect={() => onSelect(item)}
            >
              {item}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  )
}

export default RecommendedCategoriesDialog;