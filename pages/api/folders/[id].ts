import databaseConnection from '@/lib/database';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  const { id } = request.query;

  if (request.method === 'PUT') {
    // Extract folder name from request
    const { name } = request.body;

    // Ensure folder name is not empty
    if (!name || name.trim() === '') {
      return response.status(400).json({ error: 'Folder name cannot be empty' });
    }

    try {
      // Run update operation
      const statement = databaseConnection.prepare('UPDATE folders SET name = ? WHERE id = ?');
      const result = statement.run(name.trim(), id);

      // 404 status if no changes occured from update operation
      if (result.changes === 0) {
        return response.status(404).json({ error: 'Folder not found' });
      }

      // 200 status with ID and 
      response.status(200).json({ id, name: name.trim() });
    }
    catch (error) {
      console.error('Error updating folder name:', error);
      response.status(500).json({ error: 'Error updating folder name' });
    }
  } else if (request.method === 'DELETE') {
    try {
      // Begin a transaction to ensure atomicity
      databaseConnection.prepare('BEGIN').run();

      // Run delete operation
      const deleteFolderStatement = databaseConnection.prepare('DELETE FROM folders WHERE id = ?');
      const result = deleteFolderStatement.run(id);

      // 404 status if no changes occred from delete operation
      if (result.changes === 0) {
        databaseConnection.prepare('ROLLBACK').run();
        return response.status(404).json({ error: 'Folder not found' });
      }

      // Update notes that belong to this folder by setting their `folderId` to null
      const updateNotesStatement = databaseConnection.prepare(`UPDATE notes SET folderId = NULL 
                                                               WHERE folderId = ?`);
      updateNotesStatement.run(id);

      // Commit transaction
      databaseConnection.prepare('COMMIT').run();

      // 200 message if folder was deleted and associated notes were handled
      response.status(200).json({ message: 'Folder and related notes updated successfully' });
    } 
    catch (error) {
      databaseConnection.prepare('ROLLBACK').run();
      console.error('Error deleting folder and updating notes:', error);
      response.status(500).json({ error: 'Error deleting folder and updating notes' });
    }
  } 
  else {
    response.setHeader('Allow', ['PUT', 'DELETE']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
