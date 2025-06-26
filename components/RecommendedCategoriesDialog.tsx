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
import { SuggestedNoteMove } from "@/types"

type Note = {
  id: string
  title: string
  category: string
  isEditingCategory: boolean
}

interface RecommendedCategoriesDialogProps {
  trigger: React.ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: SuggestedNoteMove[];
}

const RecommendedCategoriesDialog = ({
  trigger,
  open,
  onOpenChange,
  suggestions,
}: RecommendedCategoriesDialogProps) => {
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", title: "30,000 mile maintenance", category: "Automotive Maintenance", isEditingCategory: false },
    { id: "2", title: "Company idea", category: "Business Ideas", isEditingCategory: false },
    { id: "3", title: "food for week", category: "Meal Planning", isEditingCategory: false },
    { id: "4", title: "Refunds", category: "Customer Service Issues", isEditingCategory: false },
    { id: "5", title: "Dessert Ingredients", category: "Meal Planning", isEditingCategory: false },
  ])

  const categories = Array.from(new Set(notes.map((n) => n.category)))

  const handleEditCategory = (id: string) => {
    setNotes(notes.map((note) =>
      note.id === id ? { ...note, isEditingCategory: !note.isEditingCategory } : note
    ))
  }

  const handleCategoryChange = (id: string, newCategory: string) => {
    setNotes(notes.map((note) =>
      note.id === id ? { ...note, category: newCategory, isEditingCategory: false } : note
    ))
  }

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[75%]">
          <DialogHeader>
            <DialogTitle>AI Recommendations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr_1fr] items-center gap-2 font-medium text-sm text-muted-foreground px-1">
              <div>Note Title</div>
              <div>Recommended Folder</div>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
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