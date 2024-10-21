export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
}

export interface Folder {
  id: string;
  name: string;
}