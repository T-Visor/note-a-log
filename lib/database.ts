import Database from 'better-sqlite3';

const databaseConnection = new Database('data/notesApp.db', { verbose: console.log });

// Initialize tables if they don’t exist
databaseConnection.prepare(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `).run();
  
databaseConnection.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      folderId TEXT,
      FOREIGN KEY(folderId) REFERENCES folders(id) ON DELETE SET NULL
    )
  `).run();

export default databaseConnection;