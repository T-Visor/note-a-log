import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, NotebookPen } from "lucide-react";
import NewFolderDialog from './NewFolderDialog';

interface SidebarHeaderProps {
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onSearch: (query: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onCreateFolder,
  onSearch,
}) => {
  return (
    <div>
      <div className="flex justify-end items-center space-x-2">
        {/* Pass onNewFolder directly to the NewFolderDialog */}
        <NewFolderDialog onNewFolder={onCreateFolder} />
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5"/>
        </Button>
        <Button variant="ghost" size="icon">
          <NotebookPen className="h-5 w-5"/>
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;