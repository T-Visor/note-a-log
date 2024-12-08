import React, { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useTheme } from "next-themes";
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
  const { theme } = useTheme(); // Access the current theme

  // Debounced handler added here to fix the "slow rendering" issue
  // with the note editor interface.
  const handleContentChange = useDebouncedCallback((markdown) => {
    setContent(markdown);
  }, 300);

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

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setEditorKey((prevKey) => prevKey + 1); // Force MDXEditor to re-render
  }, [note]);


  return (
    /* The explicit check for the dark theme ensures that the 'dark-theme' class
       is applied to enable proper theming for the MDXEditor component. */
    <div
      className={`flex flex-col h-full w-full max-w-3xl mx-auto mt-5 md:mt-0 ${theme === "dark" ? "dark" : ""
        }`}
    >
      {/* Title Input */}
      <div className="flex items-center justify-between mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="flex-grow mr-4" /* Ensures the input takes available space */
        />
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
        //onChange={(markdown) => setContent(markdown)}
        onChange={handleContentChange}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                {/* <Separator /> */}
                <BoldItalicUnderlineToggles />
                <Separator />
                {/* <BlockTypeSelect /> */}
                {/* <Separator /> */}
                <ListsToggle />
                {/* <Separator /> */}
                {/* <CreateLink /> */}
                {/* <Separator /> */}
                {/* <CodeToggle /> */}
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
        className="flex-1 border rounded-md dark:dark-theme"
        contentEditableClassName="prose dark:prose-invert p-4 min-h-[300px] text-gray-900 dark:text-white"
      />
    </div>
  );
};

export default NoteEditor;