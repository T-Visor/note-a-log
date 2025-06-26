import { categorizeNoteWithAI } from '@/lib/categorize-notes';
import { NextApiRequest, NextApiResponse } from 'next';
import { useNotes } from '@/hooks/useNotes';
import { Note, Folder } from "@/types";

interface NoteWithSuggestedFolderMove {
  note: Note;
  folderName: string;
  folderId: string | null;
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const { noteTitle, noteContent, noteEmbeddingID } = request.body;
    const category = await categorizeNoteWithAI(noteTitle, noteContent, noteEmbeddingID);
    response.status(200).json({ category });
  }
  else {
    response.setHeader('Allow', ['POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}

const main = async () => {
  const { notes, folders, handleMoveNote, handleNewFolder } = useNotes();

  const unassignedNotes = notes.filter(note => note.folderId === "unassigned");

  const results = await Promise.all(
    unassignedNotes.map(note => 
      categorizeNoteWithAI(note.title, note.content, note.embeddingsId!)
    )
  )
}