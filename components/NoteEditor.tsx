import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from "next-themes";
import { MDXEditor } from '@mdxeditor/editor';
import {
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  markdownShortcutPlugin,
  frontmatterPlugin,
  tablePlugin,
} from '@mdxeditor/editor';
import type { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"
import '@mdxeditor/editor/style.css';
import { Save, Loader } from 'lucide-react'

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const latestContentRef = useRef(note.content);
  const [editorKey, setEditorKey] = useState(0);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Handle content changes
  const handleContentChange = useCallback((markdown: string) => {
    latestContentRef.current = markdown;
    setContent(markdown);
  }, []);

  // Save note handler
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await onSave({
        ...note,
        title,
        content: latestContentRef.current
      });
      toast({
        title: "Note saved!",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [note, title, onSave, toast]);

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    latestContentRef.current = note.content;
    setEditorKey((prevKey) => prevKey + 1);
  }, [note]);

  return (
    <div
      className={`flex flex-col h-full mx-auto mt-5 md:mt-0 px-4 ${theme === "dark" ? "dark" : ""
        } max-w-screen-sm md:max-w-screen-md lg:max-w-screen-md xl:max-w-screen-xl 2xl:max-w-screen-2xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="focus-visible:ring-0 text-md mr-4 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 border"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ?
            <Loader className="h-4 w-4 animate-spin" /> :
            <Save className="h-4 w-4" />
          }
        </Button>
      </div>

      <MDXEditor
        key={editorKey}
        markdown={content}
        onChange={handleContentChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          markdownShortcutPlugin(),
          frontmatterPlugin(),
          tablePlugin(),
        ]}
        className="flex-1 w-full rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:dark-theme overflow-auto"
        contentEditableClassName="prose dark:prose-invert max-w-none !leading-normal p-4 min-h-[300px] text-gray-900 dark:text-white"
      />
    </div>
  );
};

export default NoteEditor;