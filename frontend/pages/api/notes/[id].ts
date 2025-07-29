import databaseConnection from '@/lib/database';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  const { id } = request.query;

  if (request.method === 'PUT') {
    const { title, content, folderId, embeddingsId } = request.body;
  
    try {
      const statement = databaseConnection.prepare(`
        UPDATE notes
        SET title = ?, content = ?, folderId = ?, embeddingsId = ?
        WHERE id = ?
      `);
      const result = statement.run(title, content, folderId, embeddingsId, id);
  
      if (result.changes === 0) {
        return response.status(404).json({ error: 'Note not found' });
      }
  
      response.status(200).json({ id, title, content, folderId, embeddingsId });
    } 
    catch (error) {
      console.error('Error updating note:', error);
      response.status(500).json({ error: 'Error updating note' });
    }
  }  
  else if (request.method === 'DELETE') {
    try {
      console.log('Request to delete note with ID:', id);
  
      const normalizedId = String(id).trim();
  
      const existingNote = databaseConnection.prepare('SELECT * FROM notes WHERE id = ?').get(normalizedId);
      console.log('Existing Note:', existingNote);
  
      if (!existingNote) {
        return response.status(404).json({ error: 'Note not found' });
      }
  
      const statement = databaseConnection.prepare('DELETE FROM notes WHERE id = ?');
      const result = statement.run(normalizedId);
  
      console.log('DELETE Result:', result);
  
      if (result.changes === 0) {
        return response.status(404).json({ error: 'Note not found' });
      }
  
      response.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      response.status(500).json({ error: 'Error deleting note' });
    }
  }  
}
