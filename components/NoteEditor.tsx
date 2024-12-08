import React, { useState, useEffect, useCallback } from 'react';
import { MDXEditor } from '@mdxeditor/editor';
import { 
  toolbarPlugin, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  linkPlugin, 
  markdownShortcutPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  Separator,
  CreateLink,
  BlockTypeSelect,
  CodeToggle
} from '@mdxeditor/editor';
import type { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

import '@mdxeditor/editor/style.css';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [editorKey, setEditorKey] = useState(0); // Key for forcing re-render of MDXEditor

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setEditorKey((prevKey) => prevKey + 1); // Force MDXEditor to re-render
  }, [note]);

  // Save note handler
  const handleSave = () => {
    onSave({ ...note, title, content });
  };

  // Keyboard save shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [title, content, handleSave]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto mt-5 md:mt-0">
      {/* Title Input */}
      <Input 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
        className="mb-4"
      />

      {/* Action Buttons */}
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> 
            Delete
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={handleSave}
        >
          Save
        </Button>
      </div>

      {/* MDX Editor */}
      <MDXEditor
        key={editorKey} // Force re-render on note change
        markdown={content}
        onChange={(markdown) => setContent(markdown)}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <Separator />
                <CodeToggle />
              </>
            )
          }),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          markdownShortcutPlugin(),
          frontmatterPlugin(),
          codeBlockPlugin(),
          codeMirrorPlugin(),
          tablePlugin(),
        ]}
        className="flex-1 border rounded-md"
        contentEditableClassName="prose dark:prose-invert p-4 min-h-[300px] text-gray-900 dark:text-white"
/>
    </div>
  );
};

export default NoteEditor;