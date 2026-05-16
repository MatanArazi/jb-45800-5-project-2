export interface SelectionState {
  selectedIds: string[];
  searchQuery: string;
  pendingSelectionId?: string;
  isSelectionDialogOpen: boolean;
}
