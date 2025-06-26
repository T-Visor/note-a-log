import { categorizeNoteWithAI } from '@/lib/categorize-notes';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Note, Folder } from "@/types";

interface NoteWithSuggestedFolderMove {
  note: Note;
  folderName: string;
  folderId: string | null;
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  try {
    // 1. Fetch notes and folders from existing APIs
    const [notesRes, foldersRes] = await Promise.all([
      axios.get<Note[]>(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notes`),
      axios.get<Folder[]>(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/folders`)
    ]);

    const notes = notesRes.data;
    const folders = foldersRes.data;

    // 2. Filter unassigned notes
    const unassignedNotes = notes.filter(note => note.folderId === 'unassigned');

    // 3. Get AI-suggested folder names
    const suggestedFolderNames = await Promise.all(
      unassignedNotes.map(note =>
        categorizeNoteWithAI(note.title, note.content, note.embeddingsId!)
      )
    );

    // 4. Build suggestions
    const suggestions: NoteWithSuggestedFolderMove[] = unassignedNotes.map((note, index) => {
      const suggestedName = suggestedFolderNames[index];
      const matchedFolder = folders.find(folder => folder.name === suggestedName);

      return {
        note,
        folderName: suggestedName,
        folderId: matchedFolder ? matchedFolder.id : null
      };
    });
    console.log(suggestions);

    return response.status(200).json({ suggestions });
  } 
  catch (error) {
    console.error('Error in suggestion handler:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}