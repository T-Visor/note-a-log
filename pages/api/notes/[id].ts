import databaseConnection from '@/lib/database';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  const { id } = request.query;

  if (request.method === 'PUT') {
    // Update a note
    const { title, content, folderId } = request.body;

    try {
      const statement = databaseConnection.prepare(`
        UPDATE notes
        SET title = ?, content = ?, folderId = ?
        WHERE id = ?
      `);
      const result = statement.run(title, content, folderId, id);

      if (result.changes === 0) {
        return response.status(404).json({ error: 'Note not found' });
      }

      response.status(200).json({ id, title, content, folderId });
    } 
    catch (error) {
      console.error('Error updating note:', error);
      response.status(500).json({ error: 'Error updating note' });
    }
  } 
  else if (request.method === 'DELETE') {
    // Delete a note
    try {
      const statement = databaseConnection.prepare('DELETE FROM notes WHERE id = ?');
      const result = statement.run(id);

      if (result.changes === 0) {
        return response.status(404).json({ error: 'Note not found' });
      }

      response.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      response.status(500).json({ error: 'Error deleting note' });
    }
  } else {
    response.setHeader('Allow', ['PUT', 'DELETE']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
