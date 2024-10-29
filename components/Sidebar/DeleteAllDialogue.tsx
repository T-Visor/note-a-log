import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';


interface DeleteDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ isOpen, setIsOpen, onConfirm }) => (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button className="w-full mb-4 bg-red-700">Delete All</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete all notes?</DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteDialog;