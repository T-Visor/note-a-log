import Database from 'better-sqlite3';

const databaseConnection = new Database('data/notesApp.db', { verbose: console.log });

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
      FOREIGN KEY(folderId) REFERENCES folders(id) ON DELETE SET NULL
    )
  `).run();

// Insert 'default' folder if it doesn't already exist
const existingDefaultFolder = databaseConnection.prepare(`
    SELECT COUNT(*) AS count FROM folders WHERE id = 'unassigned'
  `).get();

if (existingDefaultFolder.count === 0) {
  databaseConnection.prepare(`
      INSERT INTO folders (id, name) VALUES ('unassigned', 'Default')
    `).run();
}

export default databaseConnection;
