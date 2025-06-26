import { categorizeNoteWithAI } from '@/lib/categorize-notes';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Note, Folder } from '@/types';

interface SuggestedNoteMove {
  noteId: string;
  suggestedFolder: {
    name: string;
    id: string | null;
  };
}

// Main API handler to suggest folder moves for unassigned notes using AI
const suggestNoteFoldersHandler = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  // Allow only POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  try {
    // Base URL for internal API calls
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    // Fetch all notes and folders concurrently
    const [notesResponse, foldersResponse] = await Promise.all([
      axios.get<Note[]>(`${baseUrl}/api/notes`),
      axios.get<Folder[]>(`${baseUrl}/api/folders`),
    ]);
    const notes = notesResponse.data;
    const folders = foldersResponse.data;

    // Filter only notes that are not assigned to any folder
    const unassignedNotes = notes.filter(note => note.folderId === 'unassigned');

    // Request AI to suggest folder names based on note title/content
    const suggestedFolderNames = await Promise.all(
      unassignedNotes.map(note =>
        categorizeNoteWithAI(note.title, note.content, note.embeddingsId!)
      )
    );

    // Combine unassigned notes with their AI-suggested folder information
    const suggestions: SuggestedNoteMove[] = unassignedNotes.map((note, index) => {
      const suggestedFolderName = suggestedFolderNames[index];

      // Try to find a matching folder from existing folders
      const matchedFolder = folders.find(folder => folder.name === suggestedFolderName);

      return {
        noteId: note.id,
        suggestedFolder: {
          name: suggestedFolderName,
          id: matchedFolder ? matchedFolder.id : null,
        },
      };
    });

    // Respond with the generated suggestions
    return response.status(200).json({ suggestions });
  } 
  catch (error) {
    console.error('Error generating folder suggestions:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}

export default suggestNoteFoldersHandler;