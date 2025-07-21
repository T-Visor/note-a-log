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
import { SuggestedNoteMove, Note, Folder } from "@/types"
import { useNotes } from "@/hooks/useNotes";

interface RecommendedCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allNotes: Note[];
  allFolders: Folder[];
  suggestions: SuggestedNoteMove[];
}

type EditableRecommendation = {
  noteId: string
  title: string
  category: string
  isEditing: boolean
}

const RecommendedCategoriesDialog = ({
  open,
  onOpenChange,
  allNotes,
  allFolders,
  suggestions,
}: RecommendedCategoriesDialogProps) => {
  const [recommendations, setRecommendations] = useState<EditableRecommendation[]>([]);
  const { handleNewFolder, handleMoveNote } = useNotes();

  useEffect(() => {
    const fresh = suggestions
      .map((s) => {
        const note = allNotes.find((n) => n.id === s.noteId)
        if (!note) return null
        return {
          noteId: note.id,
          title: note.title,
          category: s.suggestedFolder.name,
          isEditing: false,
        }
      })
      .filter(Boolean) as EditableRecommendation[]
    setRecommendations(fresh)
  }, [allNotes, suggestions])

  if (!recommendations.length) return null

  const categories = Array.from(new Set(recommendations.map((r) => r.category)))

  const toggleEditing = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.noteId === id ? { ...r, isEditing: !r.isEditing } : r
      )
    )
  }

  const updateCategory = (id: string, newCategory: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.noteId === id
          ? { ...r, category: newCategory, isEditing: false }
          : r
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {recommendations.map((rec) => (
              <div
                key={rec.noteId}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
              >
                <div className="font-medium">{rec.title}</div>
                {rec.isEditing ? (
                  <ComboboxEditor
                    value={rec.category}
                    options={categories}
                    onSelect={(val) => updateCategory(rec.noteId, val)}
                  />
                ) : (
                  <div>{rec.category}</div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleEditing(rec.noteId)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Edit category</span>
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={async () => {
              const movePromises = recommendations.map(async (recommendation) => {
                const noteToMove: Note | undefined = allNotes.find((note) => note.id === recommendation.noteId);
                let destinationFolder: Folder | undefined = allFolders.find((folder) => folder.name === recommendation.category);

                if (!destinationFolder) {
                  // Create the folder since it doesn't exist yet
                  await handleNewFolder(recommendation.category);
                  destinationFolder = allFolders.find((folder) => folder.name === recommendation.category);
                }

                if (noteToMove && destinationFolder) {
                  return handleMoveNote(noteToMove, destinationFolder.id);
                }
              });

              await Promise.all(movePromises);
            }}

          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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