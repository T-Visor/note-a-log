import Database from 'better-sqlite3';

const databaseConnection = new Database('data/notesApp.db', { verbose: console.log });
//const databaseConnection = new Database('../data/notesApp.db', { verbose: console.log }); // For testing locally

// Initialize tables if they don’t exist
databaseConnection.prepare(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE -- Ensure folder names are unique
    )
  `).run();

databaseConnection.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      folderId TEXT,
      embeddingsId TEXT,
      FOREIGN KEY(folderId) REFERENCES folders(id) ON DELETE SET NULL
    )
  `).run();

// Define the result type explicitly
interface FolderCount {
  count: number;
}

// Insert 'default' folder if it doesn't already exist
const defaultFolderCount = databaseConnection.prepare(`
    SELECT COUNT(*) AS count FROM folders WHERE id = 'unassigned'
  `).get() as FolderCount; // Type assertion here

if (defaultFolderCount.count === 0) {
  databaseConnection.prepare(`
      INSERT INTO folders (id, name) VALUES ('unassigned', 'Default')
    `).run();
}

export default databaseConnection;
