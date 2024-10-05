"use client"

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Trash2, Search, Menu } from "lucide-react"

type Note = {
  id: string
  title: string
  content: string
}

const Sidebar = ({ notes, onSelectNote, onNewNote, onSearch, selectedNoteId, isCollapsed, onToggleCollapse }: { 
  notes: Note[], 
  onSelectNote: (note: Note) => void,
  onNewNote: () => void,
  onSearch: (query: string) => void,
  selectedNoteId: string | null,
  isCollapsed: boolean,
  onToggleCollapse: () => void
}) => (
  <div className={`h-screen bg-gray-100 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
    <div className="p-4">
      <Button onClick={onToggleCollapse} variant="ghost" size="icon" className="mb-4 w-full">
        <Menu className="h-4 w-4" />
      </Button>
      {!isCollapsed && (
        <>
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
                onClick={() => onSelectNote(note)}
              >
                {note.title || 'Untitled'}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
)

const NoteEditor = ({ note, onSave, onDelete }: { 
  note: Note, 
  onSave: (note: Note) => void,
  onDelete: (id: string) => void
}) => {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  const handleSave = () => {
    onSave({ ...note, title, content })
  }

  return (
    <div className="flex-1 p-4 flex flex-col h-screen">
      <div className="flex justify-between mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-2/3"
        />
        <div>
          <Toggle
            pressed={isPreview}
            onPressedChange={setIsPreview}
            aria-label="Toggle markdown preview"
          >
            Preview
          </Toggle>
          <Button variant="outline" className="ml-2" onClick={() => onDelete(note.id)}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
      {isPreview ? (
        <div className="flex-1 overflow-auto prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note in markdown..."
          className="flex-1 mb-4 font-mono"
        />
      )}
      <div className="flex justify-between">
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        notes={filteredNotes} 
        onSelectNote={setSelectedNote} 
        onNewNote={handleNewNote}
        onSearch={handleSearch}
        selectedNoteId={selectedNote?.id || null}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <NoteEditor 
            note={selectedNote} 
            onSave={handleSaveNote} 
            onDelete={handleDeleteNote}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  )
}