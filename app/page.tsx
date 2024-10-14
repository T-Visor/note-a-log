"use client"

import { useState, useEffect, useCallback } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import MarkdownIt from 'markdown-it'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search, Menu, X } from "lucide-react"
import 'react-markdown-editor-lite/lib/index.css'

type Note = {
  id: string
  title: string
  content: string
}

interface SidebarProps {
  notes: Note[]
  selectedNoteId: string | null
  isVisible: boolean
  onSelectNote: (note: Note) => void
  onNewNote: () => void
  onSearch: (query: string) => void
  onToggleVisibility: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  notes, onSelectNote, onNewNote, onSearch, selectedNoteId, isVisible, onToggleVisibility
}) => {
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
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 overflow-hidden transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-10`}>
        <div className="p-4">
          {/* Close Button */}
          <Button onClick={onToggleVisibility} variant="ghost" size="icon" className="mb-4 w-full md:hidden">
            <X className="h-4 w-4" />
          </Button>

          {/* New Note Button */}
          <Button onClick={onNewNote} className="w-full mb-4">New Note</Button>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search notes..."
              className="pl-8"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* Notes List */}
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
}

interface NoteEditorProps {
  note: Note
  onSave: (note: Note) => void
  onDelete: (id: string) => void
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const mdParser = new MarkdownIt()

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault() // Prevent browser's default save
      handleSave() // Save note
    }
  }, [title, content])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSave = () => {
    onSave({ ...note, title, content })
  }

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto mt-5 md:mt-0">
      {/* Title Input */}
      <div className="flex flex-row justify-between items-center mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="flex-grow mr-2"
        />
        <Button variant="outline" className="w-auto" onClick={() => onDelete(note.id)}>
          <Trash2 size={18} />
        </Button>
      </div>


      {/* Markdown Editor */}
      <div className="prose lg:prose-xl">
        <MdEditor
          value={content}
          style={{ height: '70vh' }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
        />
      </div>

      {/* Save Button and Word Count */}
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
    if (savedNotes) setNotes(JSON.parse(savedNotes))
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
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
    setSelectedNote(updatedNote)
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
    setSelectedNote(null)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex md:flex-row h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <Sidebar
        notes={filteredNotes}
        selectedNoteId={selectedNote?.id || null}
        isVisible={isSidebarVisible}
        onSelectNote={setSelectedNote}
        onNewNote={handleNewNote}
        onSearch={handleSearch}
        onToggleVisibility={toggleSidebar}
      />

      {/* Main Content */}
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