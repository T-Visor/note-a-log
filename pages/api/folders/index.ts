import databaseConnection from '@/lib/database';

export default function handler(request, response) {
  // Fetch all folders (GET request)
  if (request.method === 'GET') {
    const folders = databaseConnection.prepare('SELECT * FROM folders').all();
    response.status(200).json(folders);
  }
  // Add a new folder (POST request)
  else if (request.method === 'POST') {
    const { id, name } = request.body;
    const statement = databaseConnection.prepare('INSERT INTO folders (id, name) VALUES (?, ?)');
    statement.run(id, name);
    response.status(201).json({ id, name });
  }
  // Reject the request 
  else {
    response.setHeader('Allow', ['GET', 'POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}