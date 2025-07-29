export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  embeddingsId: string | null;
}

export interface Folder {
  id: string;
  name: string;
}

export interface SuggestedNoteMove {
  noteId: string;
  suggestedFolder: {
    name: string;
    id: string | null;
    exists: boolean;
  };
}