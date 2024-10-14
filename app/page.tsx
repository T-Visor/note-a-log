"use client"

import { useState, useEffect } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search, Menu, X } from "lucide-react"
import MarkdownIt from 'markdown-it'
import 'react-markdown-editor-lite/lib/index.css'

type Note = {
  id: string
  title: string
  content: string
}

const Sidebar = ({ notes, onSelectNote, onNewNote, onSearch, selectedNoteId, isVisible, onToggleVisibility }: {
  notes: Note[],
  onSelectNote: (note: Note) => void,
  onNewNote: () => void,
  onSearch: (query: string) => void,
  selectedNoteId: string | null,
  isVisible: boolean,
  onToggleVisibility: () => void
}) => (
  <>
    <Button
      onClick={onToggleVisibility}
      variant="ghost"
      size="icon"
      className={`md:hidden fixed top-4 left-4 z-20 ${isVisible ? 'hidden' : ''}`}
    >
      <Menu className="h-4 w-4" />
    </Button>
    <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 overflow-hidden transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-10`}>
      <div className="p-4">
        <Button onClick={onToggleVisibility} variant="ghost" size="icon" className="mb-4 w-full md:hidden">
          <X className="h-4 w-4" />
        </Button>
        <Button onClick={onNewNote} className="w-full mb-4">New Note</Button>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {notes.map(note => (
            <div
              key={note.id}
              className={`cursor-pointer p-2 hover:bg-gray-200 rounded ${selectedNoteId === note.id ? 'bg-gray-200' : ''}`}
              onClick={() => {
                onSelectNote(note)
                onToggleVisibility() // Close sidebar on mobile after selecting a note
              }}
            >
              {note.title || 'Untitled'}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)

const NoteEditor = ({ note, onSave, onDelete }: {
  note: Note,
  onSave: (note: Note) => void,
  onDelete: (id: string) => void
}) => {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const mdParser = new MarkdownIt()

  useEffect(() => {
    // Update the editor content when the note changes
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault() // Prevent the browser's default save dialog
        handleSave() // Call the save function
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [title, content])

  const handleSave = () => {
    // Save the updated note with the current content
    onSave({ ...note, title, content })
  }

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text)  // Update the local state with the latest content from the editor
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto mt-5 md:mt-0"> {/* Added margin-top */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full sm:w-2/3 mb-2 sm:mb-0"
        />
        <div className="flex items-center">
          <Button variant="outline" className="ml-2" onClick={() => onDelete(note.id)}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="prose lg:prose-xl">
        <MdEditor
          value={content} // Pass the current content
          style={{ height: '70vh' }}
          renderHTML={(text) => mdParser.render(text)} // Render HTML from Markdown
          onChange={handleEditorChange} // Update content state on change
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button onClick={handleSave}>Save</Button>
        <div className="text-sm text-gray-500">
          {content.split(' ').length} words
        </div>
      </div>
    </div>
  )
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const handleNewNote = () => {
    const newNote = { id: uuidv4(), title: '', content: '' }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
  }

  const handleSaveNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    )
    setNotes(updatedNotes)
    setSelectedNote(updatedNote)
  }

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    setSelectedNote(null)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  return (
    <div className="flex md:flex-row h-screen bg-gray-50">
      <Sidebar
        notes={filteredNotes}
        onSelectNote={(note) => {
          setSelectedNote(note)
          setIsSidebarVisible(false) // Close sidebar on mobile after selecting a note
        }}
        onNewNote={handleNewNote}
        onSearch={handleSearch}
        selectedNoteId={selectedNote?.id || null}
        isVisible={isSidebarVisible}
        onToggleVisibility={toggleSidebar}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 h-full">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
