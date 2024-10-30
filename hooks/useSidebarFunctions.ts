import { useState } from 'react';
import { Folder as FolderType, Note } from '@/types';
import { DropResult } from 'react-beautiful-dnd';

export const useSidebarFunctions = (
  folders: FolderType[],
  onConfirmDeleteAll: () => void,
  onDeleteSelected: (ids: string[]) => void,
  onNewFolder: (name: string) => void,
  onRenameFolder: (id: string, newName: string) => void,
  onMoveNote: (noteId: string, targetFolderId: string | null) => void
) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const handleConfirm = () => {
    onConfirmDeleteAll();
    setSelectedNoteIds([]);
  };

  const handleDeleteSelected = () => {
    onDeleteSelected(selectedNoteIds);
    setSelectedNoteIds([]);
  };

  const toggleFolderExpansion = (folderId: string) => {
    if (editingFolderId !== folderId) {
      setExpandedFolders(prev =>
        prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
      );
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onNewFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  const startEditingFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const handleRenameFolder = (folderId: string) => {
    if (editingFolderName.trim() && editingFolderName !== folders.find(f => f.id === folderId)?.name) {
      onRenameFolder(folderId, editingFolderName.trim());
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleRenameFolderKeyDown = (e: React.KeyboardEvent, folderId: string) => {
    if (e.key === 'Enter') {
      handleRenameFolder(folderId);
    } else if (e.key === 'Escape') {
      setEditingFolderId(null);
      setEditingFolderName('');
    }
    e.stopPropagation();
  };

  const createDefaultFolder = () => {
    if (folders.length === 0) {
      onNewFolder('Default');
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceFolderId = source.droppableId === 'root' ? null : source.droppableId;
    const destinationFolderId = destination.droppableId === 'root' ? null : destination.droppableId;

    onMoveNote(draggableId, destinationFolderId);

    if (destinationFolderId && !expandedFolders.includes(destinationFolderId)) {
      setExpandedFolders(prev => [...prev, destinationFolderId]);
    }
  };

  return {
    handleConfirm,
    handleDeleteSelected,
    toggleFolderExpansion,
    handleCreateFolder,
    startEditingFolder,
    handleRenameFolder,
    handleRenameFolderKeyDown,
    createDefaultFolder,
    onDragEnd,
    selectedNoteIds,
    setSelectedNoteIds,
    expandedFolders,
    newFolderName,
    setNewFolderName,
    editingFolderId,
    editingFolderName,
    setEditingFolderName,
  };
};