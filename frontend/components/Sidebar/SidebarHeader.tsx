import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, NotebookPen, Sparkles } from "lucide-react";
import NewFolderDialog from './NewFolderDialog';

interface SidebarHeaderProps {
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onSearch: (query: string) => void;
  onNewNote: (folderId: string) => void;
  firstFolderId: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onCreateFolder,
  onSearch,
  onNewNote,
  firstFolderId
}) => {
  return (
    <div>
      <div className="flex justify-end items-center space-x-2">
        {/* Pass onNewFolder directly to the NewFolderDialog */}
        <Button 
          className="hover:bg-gray-200 dark:hover:bg-gray-700"
          variant="ghost" 
          size="icon"
        >
          <Search className="h-5 w-5"/>
        </Button>
        <NewFolderDialog onNewFolder={onCreateFolder} />
        <Button
          className="hover:bg-gray-200 dark:hover:bg-gray-700"
          variant="ghost" 
          size="icon"
          onClick={() => onNewNote(firstFolderId)}>
          <NotebookPen className="h-5 w-5"/>
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;