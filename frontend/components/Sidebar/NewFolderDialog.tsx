import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus } from "lucide-react";

// Modify the props to directly accept onNewFolder instead of onCreateFolder
const NewFolderDialog = ({ onNewFolder }) => {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      // Pass the folder name to the parent's onNewFolder function
      onNewFolder(folderName.trim());
      setFolderName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="hover:bg-gray-200 dark:hover:bg-gray-700"
          variant="ghost"
          size="icon"
        >
          <FolderPlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-y-4 py-4">
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
            placeholder="Folder name"
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
            Create
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderDialog;