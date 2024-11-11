import databaseConnection from '@/lib/database';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  // Fetch all notes (GET request)
  if (request.method === 'GET') {
    const folders = databaseConnection.prepare('SELECT * FROM notes').all();
    response.status(200).json(folders);
  }
  // Add a new note (POST request)
  else if (request.method === 'POST') {
    const { id, title, content, folderId } = request.body;
    const statement = databaseConnection.prepare(`INSERT INTO notes 
                                                 (id, title, content, folderId) 
                                                 VALUES (?, ?, ?, ?)`);
    statement.run(id, title, content, folderId);
    response.status(201).json({ id, title, content, folderId });
  }
  // Reject the request 
  else {
    response.setHeader('Allow', ['GET', 'POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}