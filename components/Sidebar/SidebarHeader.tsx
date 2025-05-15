import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Search } from "lucide-react";

interface SidebarHeaderProps {
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onSearch: (query: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
  onSearch,
}) => {

  return (
    <div>
      <div className="flex justify-center items-center mb-4 space-x-3">
        <Button variant="ghost">
          <Search className="h-5 w-5"/>
        </Button>
      </div>

      <div className="flex mb-4">
        <Input
          value={newFolderName}
          onChange={(e) => onNewFolderNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onCreateFolder();
            }
          }}
          placeholder="New folder name"
          className="mr-2 border-gray-300 dark:border-gray-600"
        />
        <Button onClick={onCreateFolder}>
          <Folder className="h-4 w-4" />
        </Button>
      </div>

      {/*<div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search notes..."
          className="pl-8 bg-white dark:bg-gray-700"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div> */}
    </div>
  );
};