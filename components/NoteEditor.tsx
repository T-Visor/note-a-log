import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from "next-themes";
import dynamic from 'next/dynamic';
import MarkdownIt from 'markdown-it';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import styles from '@/styles/MDEditor.module.css';
import { Note } from '@/types';

// Dynamically import the MdEditor to avoid SSR issues
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

// Make sure to import the CSS file
import 'react-markdown-editor-lite/lib/index.css';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const mdParser = new MarkdownIt();
  const { theme } = useTheme();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [title, content]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = () => {
    onSave({ ...note, title, content });
  };

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto mt-5 md:mt-0">
      <div className="flex flex-row justify-between items-center mb-4 w-full">
        <div className="flex-grow mr-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full bg-white dark:bg-gray-700"
          />
        </div>
        <div className="flex-shrink-0">
          <Button variant="outline" onClick={() => onDelete(note.id)}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className={`w-full ${theme === 'dark' ? styles.editorDark : ''}`}>
        <MdEditor
          value={content}
          style={{ height: '70vh' }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
          config={{
            view: {
              menu: true,
              md: true,
              html: true,
            },
            canView: {
              menu: true,
              md: true,
              html: true,
              fullScreen: false,
              hideMenu: false,
            },
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-4 w-full">
        <Button onClick={handleSave}>Save</Button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {content.split(' ').length} words
        </div>
      </div>
    </div>
  );
};