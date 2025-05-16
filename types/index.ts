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