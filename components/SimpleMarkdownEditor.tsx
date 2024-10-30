import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Eye, Code } from 'lucide-react';

const SimpleMarkdownEditor = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isPreview, setIsPreview] = useState(false);

  const renderMarkdown = (text) => {
    // Convert basic markdown to HTML
    return text
      .split('\n')
      .map((line) => {
        // Headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold my-2">${line.slice(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-bold my-2">${line.slice(3)}</h2>`;
        }
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Links
        line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');
        // Lists
        if (line.startsWith('- ')) {
          return `<li class="ml-4">• ${line.slice(2)}</li>`;
        }
        return line ? `<p class="my-1">${line}</p>` : '<br/>';
      })
      .join('');
  };

  const handleSave = () => {
    onSave({ ...note, title, content });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="flex-grow mr-2"
        />
        <Button variant="outline" size="icon" onClick={() => onDelete(note.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Button
          variant={!isPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPreview(false)}
        >
          <Code className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant={isPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPreview(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {isPreview ? (
        <div
          className="min-h-[300px] p-4 border rounded-md bg-background"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[300px] p-4 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Write your markdown here..."
        />
      )}

      <div className="flex justify-between items-center mt-4">
        <Button onClick={handleSave}>Save</Button>
        <div className="text-sm text-muted-foreground">
          {content.split(' ').filter(Boolean).length} words
        </div>
      </div>
    </Card>
  );
};

export default SimpleMarkdownEditor;