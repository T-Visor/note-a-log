import { categorizeNoteWithAI } from '@/lib/categorize-notes';
import { NextApiRequest, NextApiResponse } from 'next';

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